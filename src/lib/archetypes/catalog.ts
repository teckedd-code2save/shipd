import type { ArchetypeDefinition } from "@/lib/archetypes/types";

export const archetypeCatalog: ArchetypeDefinition[] = [
  {
    id: "notebook_repo",
    appliesTo: ["notebook_repo"],
    match({ signals }) {
      return {
        confidence: signals.notebookFiles.length > 0 ? 0.98 : 0.72,
        reasons: [
          "Notebook-style files dominate the deploy-relevant surface.",
          ...(signals.notebookFiles[0] ? [`${signals.notebookFiles[0]} is the strongest signal in the repo.`] : [])
        ],
        disqualifiers: ["No runnable application runtime was detected."]
      };
    }
  },
  {
    id: "infra_only_repo",
    appliesTo: ["infra_only"],
    match({ signals }) {
      return {
        confidence: signals.infrastructureFiles.length > 0 ? 0.94 : 0.68,
        reasons: [
          "Infrastructure files exist without matching deployable app signals.",
          ...(signals.infrastructureFiles[0] ? [`${signals.infrastructureFiles[0]} is the strongest infra signal.`] : [])
        ],
        disqualifiers: ["No application entrypoint was detected."]
      };
    }
  },
  {
    id: "cloudflare_worker_app",
    appliesTo: ["cloudflare_worker_app"],
    match({ signals }) {
      return {
        confidence: signals.platformConfigFiles.some((file) => file.includes("wrangler")) ? 0.94 : 0.74,
        reasons: [
          `${signals.platformConfigFiles.find((file) => file.includes("wrangler")) ?? "wrangler.toml"} indicates Cloudflare runtime intent.`
        ],
        disqualifiers: []
      };
    }
  },
  {
    id: "python_service_app",
    appliesTo: ["python_service"],
    match({ signals }) {
      const entrypoint = signals.deploymentDescriptorFiles.find((file) =>
        ["main.py", "app.py", "wsgi.py", "asgi.py", "manage.py"].some((name) => file.endsWith(name))
      );

      return {
        confidence: entrypoint ? 0.9 : signals.hasDockerfile ? 0.74 : 0.58,
        reasons: [
          ...(signals.pythonProjectFiles[0] ? [`${signals.pythonProjectFiles[0]} identifies a Python application.`] : []),
          ...(entrypoint ? [`${entrypoint} looks like the service entrypoint.`] : []),
          ...(signals.hasDockerfile && signals.dockerfilePaths[0] ? [`${signals.dockerfilePaths[0]} provides a runnable deployment surface.`] : [])
        ].slice(0, 3),
        disqualifiers: entrypoint ? [] : ["No explicit Python app entrypoint was confirmed from source files."]
      };
    }
  },
  {
    id: "nextjs_standard_app",
    appliesTo: ["deployable_web_app"],
    match({ signals }) {
      if (signals.framework !== "nextjs") {
        return {
          confidence: 0,
          reasons: [],
          disqualifiers: ["Next.js was not detected."]
        };
      }

      return {
        confidence: !signals.hasCustomServer ? 0.92 : 0.18,
        reasons: [
          "Next.js was detected and no custom server process is pulling the app away from the standard platform path.",
          ...(signals.platformConfigFiles.find((file) => file.includes("vercel"))
            ? [`${signals.platformConfigFiles.find((file) => file.includes("vercel"))} reinforces the standard Next.js deploy path.`]
            : [])
        ],
        disqualifiers: signals.hasCustomServer ? ["A custom runtime entrypoint weakens the standard Next.js archetype."] : []
      };
    }
  },
  {
    id: "nextjs_custom_server_app",
    appliesTo: ["deployable_web_app", "service_app"],
    match({ signals }) {
      if (signals.framework !== "nextjs") {
        return {
          confidence: 0,
          reasons: [],
          disqualifiers: ["Next.js was not detected."]
        };
      }

      return {
        confidence: signals.hasCustomServer ? 0.9 : 0.12,
        reasons: [
          "Next.js was detected together with a custom server process.",
          ...(signals.dockerfilePaths[0] ? [`${signals.dockerfilePaths[0]} suggests this app may ship as a service container.`] : [])
        ],
        disqualifiers: signals.hasCustomServer ? [] : ["No custom server process was confirmed."]
      };
    }
  },
  {
    id: "express_postgres_service",
    appliesTo: ["service_app"],
    match({ signals }) {
      if (signals.framework !== "express") {
        return {
          confidence: 0,
          reasons: [],
          disqualifiers: ["Express was not detected."]
        };
      }

      const databaseSignal = signals.envVars.find((value) => value.includes("DATABASE"));
      return {
        confidence: Boolean(databaseSignal) ? 0.88 : 0.66,
        reasons: [
          "Express framework signals were detected.",
          ...(databaseSignal ? [`${databaseSignal} suggests a database-backed service deployment.`] : []),
          ...(signals.hasCustomServer ? ["A custom server process supports a long-running service archetype."] : [])
        ].slice(0, 3),
        disqualifiers: []
      };
    }
  },
  {
    id: "dotnet_service_app",
    appliesTo: ["service_app"],
    match({ signals }) {
      const entrypoint = signals.deploymentDescriptorFiles.find(
        (file) => file.endsWith(".csproj") || file.endsWith("Program.cs")
      );

      if (signals.framework !== "csharp" && signals.runtime !== "dotnet" && !entrypoint) {
        return {
          confidence: 0,
          reasons: [],
          disqualifiers: ["A .NET runtime or entrypoint was not detected."]
        };
      }

      return {
        confidence: entrypoint ? 0.9 : 0.7,
        reasons: [
          ...(signals.csharpProjectFiles[0] ? [`${signals.csharpProjectFiles[0]} identifies a .NET project.`] : []),
          ...(entrypoint ? [`${entrypoint} looks like the primary .NET entrypoint.`] : []),
          ...(signals.primaryAppRoot ? [`Shipd selected ${signals.primaryAppRoot === "." ? "the repo root" : signals.primaryAppRoot} as the service root.`] : [])
        ].slice(0, 3),
        disqualifiers: []
      };
    }
  },
  {
    id: "dockerized_service",
    appliesTo: ["service_app", "deployable_web_app", "python_service"],
    match({ signals }) {
      return {
        confidence: signals.hasDockerfile ? 0.82 : 0.22,
        reasons: [
          ...(signals.dockerfilePaths[0] ? [`${signals.dockerfilePaths[0]} makes the service containerized by default.`] : []),
          ...(signals.workflowFiles[0] ? [`${signals.workflowFiles[0]} may already support container or build workflow automation.`] : [])
        ].slice(0, 3),
        disqualifiers: []
      };
    }
  },
  {
    id: "sveltekit_app",
    appliesTo: ["deployable_web_app"],
    match({ signals }) {
      if (signals.framework !== "sveltekit") {
        return { confidence: 0, reasons: [], disqualifiers: ["SvelteKit was not detected."] };
      }
      return {
        confidence: !signals.hasCustomServer ? 0.88 : 0.62,
        reasons: [
          "SvelteKit was detected as the primary framework.",
          ...(signals.platformConfigFiles.find((f) => f.includes("vercel"))
            ? [`${signals.platformConfigFiles.find((f) => f.includes("vercel"))} reinforces a standard adapter deploy path.`]
            : [])
        ],
        disqualifiers: []
      };
    }
  },
  {
    id: "nuxt_app",
    appliesTo: ["deployable_web_app"],
    match({ signals }) {
      if (signals.framework !== "nuxt") {
        return { confidence: 0, reasons: [], disqualifiers: ["Nuxt was not detected."] };
      }
      return {
        confidence: signals.hasDockerfile || signals.platformConfigFiles.length > 0 ? 0.84 : 0.76,
        reasons: [
          "Nuxt was detected as the primary framework.",
          ...(signals.hasDockerfile && signals.dockerfilePaths[0] ? [`${signals.dockerfilePaths[0]} suggests a containerized deploy path.`] : [])
        ],
        disqualifiers: []
      };
    }
  },
  {
    id: "remix_app",
    appliesTo: ["deployable_web_app", "service_app"],
    match({ signals }) {
      if (signals.framework !== "remix") {
        return { confidence: 0, reasons: [], disqualifiers: ["Remix was not detected."] };
      }
      return {
        confidence: signals.hasCustomServer || signals.hasDockerfile ? 0.86 : 0.78,
        reasons: [
          "Remix was detected as the primary framework.",
          ...(signals.hasCustomServer ? ["A custom server suggests this Remix app runs as a long-lived Node.js service."] : []),
          ...(signals.hasDockerfile && signals.dockerfilePaths[0] ? [`${signals.dockerfilePaths[0]} provides a containerized deployment surface.`] : [])
        ],
        disqualifiers: []
      };
    }
  },
  {
    id: "astro_app",
    appliesTo: ["deployable_web_app"],
    match({ signals }) {
      if (signals.framework !== "astro") {
        return { confidence: 0, reasons: [], disqualifiers: ["Astro was not detected."] };
      }
      return {
        confidence: 0.86,
        reasons: [
          "Astro was detected as the primary framework.",
          ...(signals.platformConfigFiles.find((f) => f.includes("vercel"))
            ? [`${signals.platformConfigFiles.find((f) => f.includes("vercel"))} points to Vercel as the target adapter.`]
            : [])
        ],
        disqualifiers: []
      };
    }
  },
  {
    id: "go_service_app",
    appliesTo: ["service_app"],
    match({ signals }) {
      if (signals.framework !== "go") {
        return { confidence: 0, reasons: [], disqualifiers: ["Go was not detected."] };
      }
      const entrypoint = signals.deploymentDescriptorFiles.find((f) => f.endsWith("main.go"));
      return {
        confidence: entrypoint ? 0.9 : signals.hasDockerfile ? 0.76 : 0.62,
        reasons: [
          ...(signals.goProjectFiles[0] ? [`${signals.goProjectFiles[0]} identifies a Go module.`] : []),
          ...(entrypoint ? [`${entrypoint} is the service entrypoint.`] : []),
          ...(signals.hasDockerfile && signals.dockerfilePaths[0] ? [`${signals.dockerfilePaths[0]} provides a container deployment path.`] : [])
        ].slice(0, 3),
        disqualifiers: entrypoint ? [] : ["No main.go entrypoint was confirmed."]
      };
    }
  },
  {
    id: "ruby_service_app",
    appliesTo: ["service_app"],
    match({ signals }) {
      if (signals.framework !== "ruby") {
        return { confidence: 0, reasons: [], disqualifiers: ["Ruby was not detected."] };
      }
      const entrypoint = signals.deploymentDescriptorFiles.find((f) => f.endsWith("config.ru"));
      return {
        confidence: entrypoint ? 0.88 : signals.hasDockerfile ? 0.74 : 0.6,
        reasons: [
          ...(signals.rubyProjectFiles[0] ? [`${signals.rubyProjectFiles[0]} identifies a Ruby project.`] : []),
          ...(entrypoint ? [`${entrypoint} is the Rack application entrypoint.`] : []),
          ...(signals.hasDockerfile && signals.dockerfilePaths[0] ? [`${signals.dockerfilePaths[0]} provides a container deployment path.`] : [])
        ].slice(0, 3),
        disqualifiers: []
      };
    }
  },
  {
    id: "java_service_app",
    appliesTo: ["service_app"],
    match({ signals }) {
      if (signals.framework !== "java") {
        return { confidence: 0, reasons: [], disqualifiers: ["Java was not detected."] };
      }
      return {
        confidence: signals.hasDockerfile ? 0.84 : signals.javaProjectFiles.length > 0 ? 0.74 : 0.58,
        reasons: [
          ...(signals.javaProjectFiles[0] ? [`${signals.javaProjectFiles[0]} identifies a Java project.`] : []),
          ...(signals.hasDockerfile && signals.dockerfilePaths[0] ? [`${signals.dockerfilePaths[0]} provides a container deployment path.`] : [])
        ].slice(0, 3),
        disqualifiers: []
      };
    }
  },
  {
    id: "rust_service_app",
    appliesTo: ["service_app"],
    match({ signals }) {
      if (signals.framework !== "rust") {
        return { confidence: 0, reasons: [], disqualifiers: ["Rust was not detected."] };
      }
      return {
        confidence: signals.hasDockerfile ? 0.84 : signals.rustProjectFiles.length > 0 ? 0.74 : 0.58,
        reasons: [
          ...(signals.rustProjectFiles[0] ? [`${signals.rustProjectFiles[0]} identifies a Rust project.`] : []),
          ...(signals.hasDockerfile && signals.dockerfilePaths[0] ? [`${signals.dockerfilePaths[0]} provides a container deployment path.`] : [])
        ].slice(0, 3),
        disqualifiers: []
      };
    }
  },
  {
    id: "php_service_app",
    appliesTo: ["service_app"],
    match({ signals }) {
      if (signals.framework !== "php") {
        return { confidence: 0, reasons: [], disqualifiers: ["PHP was not detected."] };
      }
      return {
        confidence: signals.hasDockerfile ? 0.82 : signals.phpProjectFiles.length > 0 ? 0.72 : 0.56,
        reasons: [
          ...(signals.phpProjectFiles[0] ? [`${signals.phpProjectFiles[0]} identifies a PHP project.`] : []),
          ...(signals.hasDockerfile && signals.dockerfilePaths[0] ? [`${signals.dockerfilePaths[0]} provides a container deployment path.`] : [])
        ].slice(0, 3),
        disqualifiers: []
      };
    }
  },
  {
    id: "library_package",
    appliesTo: ["library_or_package"],
    match() {
      return {
        confidence: 0.78,
        reasons: ["The repository looks more like a package or reusable codebase than a deployable app."],
        disqualifiers: ["No deployable runtime was detected."]
      };
    }
  },
  {
    id: "unknown_low_evidence",
    appliesTo: ["insufficient_evidence"],
    match({ signals }) {
      return {
        confidence: signals.scannedFiles === 0 ? 0.94 : 0.76,
        reasons: ["There are too few deploy-relevant files to assign a stronger archetype yet."],
        disqualifiers: ["Shipd needs more evidence before it can recommend a platform with confidence."]
      };
    }
  }
];

import type { RepoSignals } from "@/lib/parsing/types";
import type { RepoClassificationResult } from "@/lib/classification/types";

function hasDeploySignals(signals: RepoSignals) {
  return (
    signals.appRoots.length > 0 ||
    signals.framework !== "unknown" ||
    signals.runtime !== "unknown" ||
    signals.hasDockerfile ||
    signals.hasCustomServer ||
    signals.workflowFiles.length > 0 ||
    signals.platformConfigFiles.length > 0 ||
    signals.envFilePaths.length > 0 ||
    signals.pythonProjectFiles.length > 0
  );
}

function hasOnlyNotebookSignals(signals: RepoSignals) {
  return (
    signals.notebookFiles.length > 0 &&
    !hasDeploySignals({
      ...signals,
      notebookFiles: []
    })
  );
}

function looksLikeInfraOnly(signals: RepoSignals) {
  return (
    signals.hasInfrastructureCode &&
    signals.infrastructureFiles.length > 0 &&
    !signals.hasDockerfile &&
    signals.framework === "unknown" &&
    signals.runtime === "unknown" &&
    signals.platformConfigFiles.length === 0 &&
    signals.pythonProjectFiles.length === 0 &&
    signals.appRoots.length === 0
  );
}

function looksLikeLibraryOrPackage(signals: RepoSignals) {
  return (
    signals.framework === "react" &&
    !signals.hasCustomServer &&
    !signals.hasDockerfile &&
    signals.platformConfigFiles.length === 0 &&
    signals.envFilePaths.length === 0 &&
    signals.workflowFiles.length === 0
  );
}

function looksLikeCliTool(signals: RepoSignals) {
  // Go CLI: go.mod present, no Docker, no platform configs, no web server evidence
  const isGo = signals.framework === "go" || signals.runtime === "go";
  const isRust = signals.framework === "rust" || signals.runtime === "rust";
  const hasNoWebSignals =
    !signals.hasDockerfile &&
    !signals.hasCustomServer &&
    signals.platformConfigFiles.length === 0 &&
    signals.detectedPlatformConfigs.length === 0;
  const hasCliFiles = (signals.goProjectFiles?.length ?? 0) > 0;
  return (isGo || isRust) && hasNoWebSignals && hasCliFiles;
}

export function classifyRepository(signals: RepoSignals): RepoClassificationResult {
  if (hasOnlyNotebookSignals(signals)) {
    return {
      repoClass: "notebook_repo",
      confidence: 0.94,
      reasons: [
        "Shipd only found notebook-style files and no deployable app entrypoint.",
        `${signals.notebookFiles[0]} appears exploratory rather than production deployable.`
      ],
      blockers: [
        "No runnable service entrypoint was detected.",
        "No deployment config or container definition was found."
      ]
    };
  }

  if (looksLikeInfraOnly(signals)) {
    return {
      repoClass: "infra_only",
      confidence: 0.88,
      reasons: [
        "Infrastructure files were detected without matching application runtime signals.",
        `${signals.infrastructureFiles[0]} suggests this repo primarily defines infrastructure.`
      ],
      blockers: ["No application entrypoint was detected in this repository."]
    };
  }

  if (signals.detectedPlatformConfigs.includes("cloudflare")) {
    return {
      repoClass: "cloudflare_worker_app",
      confidence: 0.83,
      reasons: [
        `${signals.platformConfigFiles.find((file) => file.includes("wrangler")) ?? "wrangler.toml"} points toward a Cloudflare deployment model.`
      ],
      blockers: []
    };
  }

  if (signals.framework === "python" || signals.pythonProjectFiles.length > 0) {
    const hasPythonEntrypoint = signals.deploymentDescriptorFiles.some((file) =>
      ["main.py", "app.py", "wsgi.py", "asgi.py", "manage.py"].some((name) => file.endsWith(name))
    );

    if (hasPythonEntrypoint || signals.hasDockerfile) {
      return {
        repoClass: "python_service",
        confidence: hasPythonEntrypoint ? 0.82 : 0.68,
        reasons: [
          signals.pythonProjectFiles[0]
            ? `${signals.pythonProjectFiles[0]} identifies this as a Python project.`
            : "Python service files were detected.",
          ...(hasPythonEntrypoint ? ["A Python app entrypoint was detected."] : ["A Dockerfile suggests this Python app is meant to run as a service."])
        ],
        blockers: []
      };
    }

    return {
      repoClass: "insufficient_evidence",
      confidence: 0.46,
      reasons: [
        signals.pythonProjectFiles[0]
          ? `${signals.pythonProjectFiles[0]} shows Python project intent.`
          : "Python-oriented files were detected.",
        "Shipd could not confirm a deployable Python service entrypoint yet."
      ],
      blockers: ["No `main.py`, `app.py`, `wsgi.py`, `asgi.py`, `manage.py`, or deployable container setup was found."]
    };
  }

  if (signals.framework === "csharp" || signals.csharpProjectFiles.length > 0 || signals.runtime === "dotnet") {
    const isMultiProjectSolution =
      signals.repoTopology === "dotnet_solution" || signals.csharpProjectFiles.length > 1;
    const looksLikeDotnetWebApp = signals.dotnetAppType === "web";
    const hasDotnetEntrypoint = signals.deploymentDescriptorFiles.some(
      (file) => file.endsWith(".csproj") || file.endsWith("Program.cs")
    );

    // Multiple .csproj files = a .NET solution. Classify confidently as a service regardless
    // of whether individual projects expose Microsoft.NET.Sdk.Web — the solution as a whole
    // is a deployable backend.
    if (isMultiProjectSolution) {
      return {
        repoClass: "service_app",
        confidence: 0.90,
        reasons: [
          `${signals.csharpProjectFiles.length} .NET projects detected — this is a multi-service .NET solution.`,
          signals.csharpProjectFiles[0]
            ? `${signals.csharpProjectFiles[0]} is one of the service projects in this solution.`
            : ".NET solution structure detected."
        ],
        blockers: []
      };
    }

    // Single .csproj with a web SDK or Dockerfile → confident service_app
    if (looksLikeDotnetWebApp || signals.hasDockerfile || signals.platformConfigFiles.length > 0) {
      return {
        repoClass: "service_app",
        confidence: looksLikeDotnetWebApp ? 0.84 : 0.72,
        reasons: [
          signals.csharpProjectFiles[0]
            ? `${signals.csharpProjectFiles[0]} identifies a .NET service in this repository.`
            : "C# service signals were detected.",
          ...(looksLikeDotnetWebApp ? ["ASP.NET web runtime signals confirmed."] : []),
          ...(signals.hasDockerfile ? [`${signals.dockerfilePaths[0]} provides a container deployment path.`] : [])
        ],
        blockers: []
      };
    }

    // Single .csproj with no web signals — still likely a service, just needs a Dockerfile or config
    return {
      repoClass: "service_app",
      confidence: 0.58,
      reasons: [
        signals.csharpProjectFiles[0]
          ? `${signals.csharpProjectFiles[0]} identifies a .NET application.`
          : "C# signals were detected.",
        "No ASP.NET web SDK or Dockerfile found yet — adding either will sharpen the recommendation."
      ],
      blockers: []
    };
  }

  if (signals.framework === "nextjs") {
    return {
      repoClass: "deployable_web_app",
      confidence: signals.hasDockerfile || signals.platformConfigFiles.length > 0 ? 0.84 : 0.72,
      reasons: [
        "Framework signals identify this repository as a Next.js app.",
        ...(signals.primaryAppRoot ? [`Shipd selected ${signals.primaryAppRoot === "." ? "the repo root" : signals.primaryAppRoot} as the primary deployable app.`] : []),
        ...(signals.hasDockerfile ? [`${signals.dockerfilePaths[0]} suggests a deployable runtime path.`] : [])
      ],
      blockers: []
    };
  }

  if (signals.framework === "express" || signals.hasCustomServer || signals.hasDockerfile) {
    return {
      repoClass: "service_app",
      confidence: 0.74,
      reasons: [
        ...(signals.primaryAppRoot ? [`Shipd selected ${signals.primaryAppRoot === "." ? "the repo root" : signals.primaryAppRoot} as the primary service root.`] : []),
        ...(signals.framework === "express" ? ["Express framework signals were detected."] : []),
        ...(signals.hasCustomServer ? ["A custom server entrypoint was detected."] : []),
        ...(signals.hasDockerfile ? [`${signals.dockerfilePaths[0]} suggests a service-style deployment path.`] : [])
      ].slice(0, 3),
      blockers: []
    };
  }

  if (looksLikeCliTool(signals)) {
    return {
      repoClass: "cli_tool",
      confidence: 0.82,
      reasons: [
        signals.framework === "go"
          ? "go.mod detected with no HTTP server patterns — this looks like a Go CLI tool."
          : "Rust project detected with no web server patterns — this looks like a CLI tool.",
        "CLI tools are distributed as binaries, not deployed to web servers."
      ],
      blockers: []
    };
  }

  if (looksLikeLibraryOrPackage(signals)) {
    return {
      repoClass: "library_or_package",
      confidence: 0.62,
      reasons: [
        "The repo looks like a React package or frontend codebase without deployment-specific runtime signals."
      ],
      blockers: ["No server runtime, container, or platform config was detected."]
    };
  }

  if (signals.scannedFiles === 0 || !hasDeploySignals(signals)) {
    return {
      repoClass: "insufficient_evidence",
      confidence: 0.18,
      reasons: ["Shipd could not find enough deployment-relevant files to classify this repository confidently."],
      blockers: ["No framework, runtime, container, workflow, or platform configuration was detected."]
    };
  }

  return {
    repoClass: "insufficient_evidence",
    confidence: 0.28,
    reasons: [
      signals.repoTopology === "monorepo"
        ? "Shipd found workspace signals, but it still needs a clearer deployable app root before making a strong call."
        : "Shipd found a few signals, but not enough to produce a reliable repo class yet."
    ],
    blockers: ["Add or confirm deployment-relevant files such as a runtime manifest, Dockerfile, workflow, or platform config."]
  };
}

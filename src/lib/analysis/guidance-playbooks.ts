import type { RepoClass } from "@/lib/classification/types";
import type { ScanFinding } from "@/lib/parsing/shared";
import type { RepoSignals } from "@/lib/parsing/types";

export interface GuidanceTrack {
  title: string;
  description: string;
  actions: string[];
  docs?: string[];
}

interface GuidancePlaybookInput {
  repoClass: RepoClass;
  framework?: RepoSignals["framework"];
  signals?: RepoSignals;
  findings?: ScanFinding[];
}

interface GuidancePlaybook {
  summary: string;
  tracks: GuidanceTrack[];
}

interface GuidancePlaybookRule {
  repoClass?: RepoClass;
  framework?: RepoSignals["framework"];
  match?: (input: GuidancePlaybookInput) => boolean;
  resolve: (input: GuidancePlaybookInput) => GuidancePlaybook;
}

function readmeFindingDetail(input: GuidancePlaybookInput, title: string) {
  return input.findings?.find((finding) => finding.filePath.toLowerCase().includes("readme") && finding.title === title)?.detail;
}

function buildReadmeGroundedSummary(input: GuidancePlaybookInput, fallback: string) {
  const readmeContext = readmeFindingDetail(input, "README repository context");
  const readmeDeployHint = readmeFindingDetail(input, "README deployment hint");

  if (readmeContext && readmeDeployHint) {
    return `${readmeContext} ${readmeDeployHint}`;
  }
  if (readmeContext) {
    return readmeContext;
  }
  if (readmeDeployHint) {
    return `README indicates this path: ${readmeDeployHint}`;
  }
  return fallback;
}

function desktopWorkerPlaybook(input: GuidancePlaybookInput): GuidancePlaybook {
  const hasCloudflare = input.signals?.detectedPlatformConfigs.includes("cloudflare");

  return {
    summary: buildReadmeGroundedSummary(
      input,
      "This repository is a desktop/macOS application with a proxy/backend component. Ship it through the documented proxy deploy flow first, then release the desktop client."
    ),
    tracks: [
      {
        title: "Ship the backend/proxy path",
        description: hasCloudflare
          ? "Cloudflare Worker signals were detected in this repository."
          : "Use this track if your app relies on a Worker/API proxy for secret management.",
        actions: [
          "Deploy the proxy/worker using the repo's documented commands.",
          "Set required API secrets in platform-managed env vars.",
          "Run a smoke request against the deployed proxy endpoint."
        ],
        docs: [
          "https://developers.cloudflare.com/workers/wrangler/",
          "https://developers.cloudflare.com/workers/configuration/secrets/"
        ]
      },
      {
        title: "Release the desktop app",
        description: "Once the proxy path is live, complete signing/packaging and release automation for the client.",
        actions: [
          "Update the app to the deployed proxy URL and verify end-to-end behavior.",
          "Build release artifacts with signing/notarization enabled.",
          "Automate packaging and release publishing in CI."
        ]
      }
    ]
  };
}

function notebookPlaybook(input: GuidancePlaybookInput): GuidancePlaybook {
  const notebookHint =
    input.signals?.notebookFiles.length && input.signals.notebookFiles[0]
      ? `Primary notebook detected: ${input.signals.notebookFiles[0]}.`
      : "Notebook files were detected but no deployable web service entrypoint was found.";

  return {
    summary: buildReadmeGroundedSummary(
      input,
      "This repository is notebook/data-science oriented. Choose how users will consume results first, then package the runtime so deployment becomes deterministic."
    ),
    tracks: [
      {
        title: "Pick the serving surface",
        description: `${notebookHint} Use this when users need interactive notebooks.`,
        actions: [
          "Choose interactive notebook hosting (JupyterHub/Binder/Codespaces) or app delivery.",
          "Pin dependencies with `requirements.txt` or `environment.yml` and add a startup command.",
          "Add authentication and execution limits before exposing notebook endpoints."
        ],
        docs: [
          "https://jupyterhub.readthedocs.io/en/stable/",
          "https://mybinder.readthedocs.io/en/latest/"
        ]
      },
      {
        title: "Wrap into a deployable app",
        description: "Use this when you need a stable product surface around notebook logic.",
        actions: [
          "Move core notebook logic into importable modules under `src/`.",
          "Expose that logic with FastAPI, Streamlit, or Gradio.",
          "Add health checks and required runtime env vars (`PORT`, artifact paths, model config)."
        ],
        docs: ["https://fastapi.tiangolo.com/deployment/", "https://docs.streamlit.io/deploy"]
      },
      {
        title: "Make outputs reproducible",
        description: "Ensure the same inputs produce the same outputs across local and CI runs.",
        actions: [
          "Add deterministic data prep scripts and versioned dataset references.",
          "Publish model/artifact outputs to object storage or a model registry.",
          "Run CI checks for lint/tests plus a smoke notebook or inference run."
        ],
        docs: ["https://dvc.org/doc", "https://mlflow.org/docs/latest/index.html"]
      }
    ]
  };
}

function flutterPlaybook(input: GuidancePlaybookInput): GuidancePlaybook {
  const hasWeb = Boolean(input.signals?.hasFlutterWebTarget);
  const hasMobile = Boolean(input.signals?.hasFlutterMobileTargets);

  return {
    summary: buildReadmeGroundedSummary(
      input,
      "This repository is a Flutter project. Ship Flutter Web via static hosting and mobile through store release pipelines; backend services, if any, should be deployed separately."
    ),
    tracks: [
      {
        title: "Ship Flutter Web",
        description:
          hasWeb
            ? "A `web/` target was detected. Build once and host the generated static assets."
            : "No explicit `web/` target was detected yet. Enable web support if browser deployment is required.",
        actions: [
          "Run `flutter config --enable-web` (once per machine) if web is not yet enabled.",
          "Build with `flutter build web` and deploy the `build/web` output to static hosting.",
          "Configure SPA rewrites and cache headers for production."
        ],
        docs: [
          "https://docs.flutter.dev/platform-integration/web/building",
          "https://docs.flutter.dev/platform-integration/web/deploying"
        ]
      },
      {
        title: "Ship Android/iOS",
        description:
          hasMobile
            ? "Android/iOS targets were detected. Use native store distribution workflows."
            : "Set up Android and iOS targets, then configure signing and release automation.",
        actions: [
          "Configure signing keys/certificates for Android and iOS.",
          "Create release builds with `flutter build appbundle` (Android) and `flutter build ipa` (iOS).",
          "Publish via Play Console / App Store Connect with CI signing secrets."
        ],
        docs: [
          "https://docs.flutter.dev/deployment/android",
          "https://docs.flutter.dev/deployment/ios"
        ]
      },
      {
        title: "Connect backend services",
        description: "If this app needs a backend, deploy the backend separately and wire secure API access.",
        actions: [
          "Define environment-specific API base URLs and secrets management per platform.",
          "Deploy backend services independently (Cloud Run, Fly.io, Railway, etc.).",
          "Add release smoke tests that validate client-to-backend connectivity."
        ],
        docs: ["https://docs.flutter.dev/cookbook/networking/fetch-data"]
      }
    ]
  };
}

function genericUnsupportedPlaybook(input: GuidancePlaybookInput): GuidancePlaybook {
  const frameworkLabel = input.framework && input.framework !== "unknown" ? input.framework : null;
  const hasReadme = input.signals?.deploymentDescriptorFiles.some((file) => file.toLowerCase().includes("readme")) ?? false;
  const hasCloudflareHint = input.signals?.detectedPlatformConfigs.includes("cloudflare") ?? false;
  const hasReadmeDesktopHint =
    input.signals?.deploymentDescriptorFiles.some((file) => file.includes("#xcode-desktop-hint")) ?? false;

  if (hasCloudflareHint || hasReadmeDesktopHint) {
    return {
      summary: buildReadmeGroundedSummary(
        input,
        "README and config signals suggest a concrete deployment path outside standard single-host web app flows."
      ),
      tracks: [
        {
          title: "Run the documented backend/proxy deployment",
          description: hasCloudflareHint
            ? "README and config hints indicate a Cloudflare Worker proxy/deployment path."
            : "README includes deployment-specific backend/proxy instructions.",
          actions: [
            "Follow the README deployment commands for the backend/proxy component first.",
            "Set required secrets/env vars in the target platform (not in source files).",
            "Deploy and verify the endpoint health before wiring the client app."
          ],
          docs: hasCloudflareHint ? ["https://developers.cloudflare.com/workers/wrangler/"] : undefined
        },
        {
          title: "Ship the runtime/client component",
          description:
            "After backend/proxy deployment, build and release the primary app using its native toolchain and signing/release flow.",
          actions: [
            "Update runtime URLs to the deployed backend/proxy endpoint.",
            "Build release artifacts with the project’s documented release process.",
            "Add CI release automation once manual flow is verified."
          ]
        }
      ]
    };
  }

  return {
    summary: buildReadmeGroundedSummary(
      input,
      frameworkLabel
        ? `This repository is primarily ${frameworkLabel}-based and does not yet expose a clear single-host deployment target.`
        : "This repository does not yet expose a clear single-host deployment target."
    ),
    tracks: [
      {
        title: "Use the repo's current deployment path",
        description: hasReadme
          ? "README-driven instructions are the most reliable source for this repository type."
          : "Use existing scripts/config in the repo to establish the first working release path.",
        actions: [
          "Run the repo’s existing setup/release scripts in order and verify a successful local or staging run.",
          "Capture required secrets/env vars in your deployment environment (not in source files).",
          "Confirm the first end-to-end smoke path before any platform migration."
        ]
      },
      {
        title: "Make shipping repeatable",
        description: "Once the first path works, make it deterministic for CI and future scans.",
        actions: [
          "Add or refine CI release automation around the working path you validated.",
          "Expose clear runtime entrypoints and build commands for the ship target.",
          "Rescan after updates to unlock sharper platform-specific scoring."
        ]
      }
    ]
  };
}

const PLAYBOOK_REGISTRY: GuidancePlaybookRule[] = [
  {
    match: (input) => {
      const hasCloudflare = input.signals?.detectedPlatformConfigs.includes("cloudflare");
      const hasDesktopHint =
        input.signals?.deploymentDescriptorFiles.some(
          (file) =>
            file.includes("xcode") ||
            file.includes(".xcodeproj") ||
            file.includes("Package.swift")
        ) ?? false;
      return Boolean(hasCloudflare && hasDesktopHint);
    },
    resolve: desktopWorkerPlaybook
  },
  { repoClass: "notebook_repo", resolve: notebookPlaybook },
  { framework: "flutter", resolve: flutterPlaybook },
  { repoClass: "mobile_app", resolve: flutterPlaybook },
  { resolve: genericUnsupportedPlaybook }
];

export function resolveGuidancePlaybook(input: GuidancePlaybookInput): GuidancePlaybook {
  const rule = PLAYBOOK_REGISTRY.find((entry) => {
    if (entry.match) return entry.match(input);
    const classMatches = entry.repoClass ? entry.repoClass === input.repoClass : true;
    const frameworkMatches = entry.framework ? entry.framework === input.framework : true;
    return classMatches && frameworkMatches;
  });

  return (rule ?? PLAYBOOK_REGISTRY[PLAYBOOK_REGISTRY.length - 1]).resolve(input);
}

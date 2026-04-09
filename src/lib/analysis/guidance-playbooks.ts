import type { RepoClass } from "@/lib/classification/types";
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
}

interface GuidancePlaybook {
  summary: string;
  tracks: GuidanceTrack[];
}

interface GuidancePlaybookRule {
  repoClass?: RepoClass;
  framework?: RepoSignals["framework"];
  resolve: (input: GuidancePlaybookInput) => GuidancePlaybook;
}

function notebookPlaybook(input: GuidancePlaybookInput): GuidancePlaybook {
  const notebookHint =
    input.signals?.notebookFiles.length && input.signals.notebookFiles[0]
      ? `Primary notebook detected: ${input.signals.notebookFiles[0]}.`
      : "Notebook files were detected but no deployable web service entrypoint was found.";

  return {
    summary:
      "This repository looks like a data-science notebook project, not a direct web-hosting target. Productionize it by choosing a serving path first, then adding reproducible runtime and artifact workflows.",
    tracks: [
      {
        title: "Notebook serving track",
        description: `${notebookHint} Use this when users need interactive notebooks.`,
        actions: [
          "Pick your serving surface: JupyterHub, Binder, or VS Code Codespaces.",
          "Pin dependencies with a lock file (`requirements.txt` or `environment.yml`) and add startup instructions.",
          "Add authentication and resource limits before exposing notebooks publicly."
        ],
        docs: [
          "https://jupyterhub.readthedocs.io/en/stable/",
          "https://mybinder.readthedocs.io/en/latest/"
        ]
      },
      {
        title: "App wrapping track",
        description: "Use this when you want a deployable product surface around notebook logic.",
        actions: [
          "Promote core notebook logic into Python modules under `src/`.",
          "Expose the logic through FastAPI, Streamlit, or Gradio depending on UX needs.",
          "Add health checks and runtime config (`PORT`, `PYTHONPATH`, model/artifact locations)."
        ],
        docs: ["https://fastapi.tiangolo.com/deployment/", "https://docs.streamlit.io/deploy"]
      },
      {
        title: "Reproducibility and artifacts",
        description: "Make outputs reproducible and portable before launch.",
        actions: [
          "Add a deterministic data pipeline script and seed/versioned dataset references.",
          "Publish model/artifact outputs to object storage or model registry.",
          "Create CI that runs tests, linting, and a smoke notebook execution step."
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
    summary:
      "This repository is a Flutter project. Flutter apps are shipped through web static hosting and/or mobile release pipelines, not via a single backend PaaS deployment plan.",
    tracks: [
      {
        title: "Flutter Web deployment",
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
        title: "Mobile release pipeline",
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
        title: "Backend and API integration",
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
  const classLabel = input.repoClass.replaceAll("_", " ");

  return {
    summary: frameworkLabel
      ? `Shipd detected a ${frameworkLabel} repository profile (${classLabel}) that is not directly mapped to a single-host deployment plan yet.`
      : `Shipd detected a repository profile (${classLabel}) that is not directly mapped to a single-host deployment plan yet.`,
    tracks: [
      {
        title: "Define the deployable runtime",
        description: "Make the production entrypoint explicit so Shipd and CI can reason deterministically.",
        actions: [
          "Add the runtime manifest for the deployable unit (`package.json`, `pyproject.toml`, Dockerfile, etc.).",
          "Declare explicit build/start commands and required environment variables.",
          "Add a health endpoint or smoke command for post-deploy verification."
        ]
      },
      {
        title: "Split product surface from source assets",
        description: "If this is a library, notebook, or tooling repo, separate what gets shipped from what is developed.",
        actions: [
          "Create a deployable app/package directory and keep exploratory files separate.",
          "Add release automation for the chosen artifact type (container, package, static build, binary).",
          "Rescan after structure updates to unlock platform-specific plans."
        ]
      }
    ]
  };
}

const PLAYBOOK_REGISTRY: GuidancePlaybookRule[] = [
  { repoClass: "notebook_repo", resolve: notebookPlaybook },
  { framework: "flutter", resolve: flutterPlaybook },
  { repoClass: "mobile_app", resolve: flutterPlaybook },
  { resolve: genericUnsupportedPlaybook }
];

export function resolveGuidancePlaybook(input: GuidancePlaybookInput): GuidancePlaybook {
  const rule = PLAYBOOK_REGISTRY.find((entry) => {
    const classMatches = entry.repoClass ? entry.repoClass === input.repoClass : true;
    const frameworkMatches = entry.framework ? entry.framework === input.framework : true;
    return classMatches && frameworkMatches;
  });

  return (rule ?? PLAYBOOK_REGISTRY[PLAYBOOK_REGISTRY.length - 1]).resolve(input);
}

import { parseDockerfile } from "@/lib/parsing/dockerfile";
import { parseEnvFile } from "@/lib/parsing/env-file";
import { parseInfrastructureFile } from "@/lib/parsing/infrastructure";
import { parsePackageJson } from "@/lib/parsing/package-json";
import { detectPlatformConfig } from "@/lib/parsing/platform-config";
import { parseNotebookFile, parsePythonProject } from "@/lib/parsing/python-project";
import { parseReadme } from "@/lib/parsing/readme";
import { parseWorkflow } from "@/lib/parsing/workflow";
import type { EvidenceRecord, RepositoryFileMap, ScanFinding } from "@/lib/parsing/shared";
import type { RepoSignals } from "@/lib/parsing/types";
import { earlyEvidenceDetectors } from "@/lib/scan/detectors/registry";

const WORKSPACE_CONTAINER_DIRS = new Set(["apps", "services", "sites", "packages"]);
const PRIMARY_APP_CONTAINER_DIRS = new Set(["apps", "services", "sites"]);

function chooseFramework(current: RepoSignals["framework"], next: RepoSignals["framework"]) {
  const rank: Record<NonNullable<RepoSignals["framework"]>, number> = {
    unknown: 0,
    react: 1,
    express: 3,
    python: 3,
    csharp: 3,
    nextjs: 4
  };

  const currentValue = current ?? "unknown";
  const nextValue = next ?? "unknown";

  return rank[nextValue] > rank[currentValue] ? nextValue : currentValue;
}

function chooseRuntime(current: RepoSignals["runtime"], next: RepoSignals["runtime"]) {
  if (!current || current === "unknown") return next ?? current;
  if (!next || next === "unknown") return current;
  if (current === "node20" || next === "node20") return "node20";
  if (current === "dotnet" || next === "dotnet") return "dotnet";
  return current;
}

function mergeSignals(base: RepoSignals, next: Partial<RepoSignals>): RepoSignals {
  return {
    repoTopology: next.repoTopology ?? base.repoTopology,
    workspaceRoots: Array.from(new Set([...base.workspaceRoots, ...(next.workspaceRoots ?? [])])),
    appRoots: Array.from(new Set([...base.appRoots, ...(next.appRoots ?? [])])),
    primaryAppRoot: next.primaryAppRoot ?? base.primaryAppRoot,
    dotnetAppType:
      next.dotnetAppType && next.dotnetAppType !== "unknown"
        ? next.dotnetAppType
        : base.dotnetAppType ?? "unknown",
    framework: chooseFramework(base.framework, next.framework),
    runtime: chooseRuntime(base.runtime, next.runtime),
    hasDockerfile: next.hasDockerfile ?? base.hasDockerfile,
    dockerfilePaths: Array.from(new Set([...base.dockerfilePaths, ...(next.dockerfilePaths ?? [])])),
    hasCustomServer: next.hasCustomServer ?? base.hasCustomServer,
    envVars: Array.from(new Set([...base.envVars, ...(next.envVars ?? [])])),
    envFilePaths: Array.from(new Set([...base.envFilePaths, ...(next.envFilePaths ?? [])])),
    hasCiWorkflow: next.hasCiWorkflow ?? base.hasCiWorkflow,
    hasBuildWorkflow: next.hasBuildWorkflow ?? base.hasBuildWorkflow,
    workflowFiles: Array.from(new Set([...base.workflowFiles, ...(next.workflowFiles ?? [])])),
    detectedPlatformConfigs: Array.from(
      new Set([...base.detectedPlatformConfigs, ...(next.detectedPlatformConfigs ?? [])])
    ),
    platformConfigFiles: Array.from(new Set([...base.platformConfigFiles, ...(next.platformConfigFiles ?? [])])),
    infrastructureFiles: Array.from(new Set([...base.infrastructureFiles, ...(next.infrastructureFiles ?? [])])),
    hasInfrastructureCode: next.hasInfrastructureCode ?? base.hasInfrastructureCode,
    deploymentDescriptorFiles: Array.from(
      new Set([...base.deploymentDescriptorFiles, ...(next.deploymentDescriptorFiles ?? [])])
    ),
    pythonProjectFiles: Array.from(new Set([...base.pythonProjectFiles, ...(next.pythonProjectFiles ?? [])])),
    csharpProjectFiles: Array.from(new Set([...base.csharpProjectFiles, ...(next.csharpProjectFiles ?? [])])),
    notebookFiles: Array.from(new Set([...base.notebookFiles, ...(next.notebookFiles ?? [])])),
    scannedFiles: Math.max(base.scannedFiles, next.scannedFiles ?? base.scannedFiles)
  };
}

function isRootPath(path: string) {
  return !path.includes("/");
}

function inferAppRootFromPath(filePath: string) {
  const segments = filePath.split("/");

  if (segments.length === 1) {
    return ".";
  }

  if (WORKSPACE_CONTAINER_DIRS.has(segments[0] ?? "") && segments[1]) {
    return `${segments[0]}/${segments[1]}`;
  }

  const structuralAnchorIndex = segments.findIndex((segment) =>
    ["src", "app", "pages", "api", "controllers", "server", "client"].includes(segment)
  );

  if (structuralAnchorIndex > 0) {
    return segments.slice(0, structuralAnchorIndex).join("/");
  }

  return segments.slice(0, -1).join("/") || ".";
}

function scoreCandidateRoot(filePath: string, evidenceKind?: EvidenceRecord["kind"]) {
  let score = 1;
  const root = inferAppRootFromPath(filePath);

  if (root !== "." && PRIMARY_APP_CONTAINER_DIRS.has(root.split("/")[0] ?? "")) {
    score += 3;
  } else if (root !== "." && root.startsWith("packages/")) {
    score += 1;
  }

  if (filePath.endsWith("/package.json") || filePath === "package.json") score += 4;
  if (filePath.includes("next.config")) score += 6;
  if (filePath.endsWith("vercel.json") || filePath.endsWith("fly.toml") || filePath.endsWith("railway.json")) score += 5;
  if (filePath.endsWith("render.yaml") || filePath.endsWith("render.yml") || filePath.endsWith("wrangler.toml")) score += 5;
  if (filePath.endsWith("Dockerfile")) score += 4;
  if (filePath.endsWith(".csproj")) score += 4;
  if (filePath.endsWith("/Program.cs") || filePath === "Program.cs") score += 5;
  if (filePath.endsWith("/main.py") || filePath.endsWith("/app.py") || filePath.endsWith("/asgi.py") || filePath.endsWith("/wsgi.py")) score += 5;
  if (filePath.endsWith("/pyproject.toml") || filePath.endsWith("/requirements.txt")) score += 3;
  if (evidenceKind === "framework") score += 4;
  if (evidenceKind === "entrypoint") score += 4;
  if (evidenceKind === "platform_config") score += 4;
  if (evidenceKind === "docker") score += 3;
  if (evidenceKind === "app_root") score += 5;

  return score;
}

export function scanRepositoryFiles(files: RepositoryFileMap) {
  let signals: RepoSignals = {
    repoTopology: "unknown",
    workspaceRoots: [],
    appRoots: [],
    primaryAppRoot: undefined,
    dotnetAppType: "unknown",
    framework: "unknown",
    runtime: "unknown",
    hasDockerfile: false,
    dockerfilePaths: [],
    hasCustomServer: false,
    envVars: [],
    envFilePaths: [],
    hasCiWorkflow: false,
    hasBuildWorkflow: false,
    workflowFiles: [],
    detectedPlatformConfigs: [],
    platformConfigFiles: [],
    infrastructureFiles: [],
    hasInfrastructureCode: false,
    deploymentDescriptorFiles: [],
    pythonProjectFiles: [],
    csharpProjectFiles: [],
    notebookFiles: [],
    scannedFiles: Object.keys(files).length
  };

  const findings: ScanFinding[] = [];
  const evidence: EvidenceRecord[] = [];
  const workspaceRoots = new Set<string>();
  const candidateRootScores = new Map<string, number>();

  const registerWorkspaceRoot = (root: string) => {
    workspaceRoots.add(root);
  };

  const registerCandidateRoot = (filePath: string, evidenceKind?: EvidenceRecord["kind"]) => {
    const root = inferAppRootFromPath(filePath);

    if (!root) {
      return;
    }

    const nextScore = (candidateRootScores.get(root) ?? 0) + scoreCandidateRoot(filePath, evidenceKind);
    candidateRootScores.set(root, nextScore);
  };

  const entries = Object.entries(files).sort(([leftPath], [rightPath]) => {
    const scorePath = (path: string) => {
      if (path.startsWith("apps/") || path.startsWith("services/") || path.startsWith("sites/")) return 0;
      if (path === "package.json") return 1;
      if (path.startsWith("packages/")) return 2;
      return 3;
    };

    return scorePath(leftPath) - scorePath(rightPath) || leftPath.localeCompare(rightPath);
  });

  for (const [filePath, content] of entries) {
    if (filePath === "turbo.json" || filePath === "pnpm-workspace.yaml" || filePath === "nx.json") {
      registerWorkspaceRoot(".");
      evidence.push({
        kind: "workspace_root",
        value: ".",
        sourceFile: filePath,
        confidence: 0.96
      });
    }

    for (const detector of earlyEvidenceDetectors) {
      if (!detector.supports(filePath)) {
        continue;
      }

      const result = detector.run({ filePath, content, files });
      signals = mergeSignals(signals, result.signals ?? {});
      findings.push(...(result.findings ?? []));
      for (const record of result.evidence ?? []) {
        registerCandidateRoot(record.sourceFile, record.kind);
        evidence.push({
          ...record,
          metadata: {
            ...(record.metadata ?? {}),
            appRoot: inferAppRootFromPath(record.sourceFile)
          }
        });
      }
    }

    if (filePath === "package.json" || filePath.endsWith("/package.json")) {
      const result = parsePackageJson(content, filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      registerCandidateRoot(filePath, "app_root");

      if (isRootPath(filePath) && (content.includes("\"workspaces\"") || content.includes("\"turbo\""))) {
        registerWorkspaceRoot(".");
      }

      if (result.signals.framework && result.signals.framework !== "unknown") {
        evidence.push({
          kind: "framework",
          value: result.signals.framework,
          sourceFile: filePath,
          confidence: 0.92,
          metadata: {
            appRoot: inferAppRootFromPath(filePath)
          }
        });
      }
      if (result.signals.runtime && result.signals.runtime !== "unknown") {
        evidence.push({
          kind: "runtime",
          value: result.signals.runtime,
          sourceFile: filePath,
          confidence: 0.84,
          metadata: {
            appRoot: inferAppRootFromPath(filePath)
          }
        });
      }
      if (result.signals.hasCustomServer) {
        evidence.push({
          kind: "entrypoint",
          value: "custom_server",
          sourceFile: filePath,
          confidence: 0.78,
          metadata: {
            appRoot: inferAppRootFromPath(filePath)
          }
        });
      }
      if (filePath !== "package.json") {
        evidence.push({
          kind: "package_type",
          value: "workspace_package",
          sourceFile: filePath,
          confidence: 0.76,
          metadata: {
            appRoot: inferAppRootFromPath(filePath)
          }
        });
      }
      continue;
    }

    if (filePath === "Dockerfile" || filePath.endsWith("/Dockerfile")) {
      const result = parseDockerfile(content, filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      evidence.push({
        kind: "docker",
        value: "dockerfile",
        sourceFile: filePath,
        confidence: 0.96,
        metadata: {
          appRoot: inferAppRootFromPath(filePath)
        }
      });
      registerCandidateRoot(filePath, "docker");
      continue;
    }

    if (filePath === ".env.example" || filePath.endsWith(".env.example") || filePath.endsWith(".env.sample")) {
      const result = parseEnvFile(content, filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      for (const envVar of result.signals.envVars ?? []) {
        evidence.push({
          kind: envVar.includes("DATABASE")
            ? "database"
            : envVar.includes("REDIS")
              ? "cache"
              : envVar.includes("S3") || envVar.includes("R2") || envVar.includes("BUCKET")
                ? "storage"
                : "env_var",
          value: envVar,
          sourceFile: filePath,
          confidence: 0.72,
          metadata: {
            appRoot: inferAppRootFromPath(filePath)
          }
        });
      }
      continue;
    }

    if (
      filePath === "pyproject.toml" ||
      filePath.endsWith("/pyproject.toml") ||
      filePath === "requirements.txt" ||
      filePath.endsWith("/requirements.txt") ||
      filePath === "Pipfile" ||
      filePath.endsWith("/Pipfile") ||
      filePath === "setup.py" ||
      filePath.endsWith("/setup.py") ||
      filePath === "environment.yml" ||
      filePath.endsWith("/environment.yml")
    ) {
      const result = parsePythonProject(filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      evidence.push(
        {
          kind: "framework",
          value: "python",
          sourceFile: filePath,
          confidence: 0.88,
          metadata: {
            appRoot: inferAppRootFromPath(filePath)
          }
        },
        {
          kind: "runtime",
          value: "python",
          sourceFile: filePath,
          confidence: 0.88,
          metadata: {
            appRoot: inferAppRootFromPath(filePath)
          }
        }
      );
      registerCandidateRoot(filePath, "framework");
      continue;
    }

    if (filePath.endsWith(".ipynb")) {
      const result = parseNotebookFile(filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      evidence.push({
        kind: "notebook",
        value: filePath,
        sourceFile: filePath,
        confidence: 0.94,
        metadata: {
          appRoot: inferAppRootFromPath(filePath)
        }
      });
      continue;
    }

    if (
      filePath.endsWith("/main.py") ||
      filePath === "main.py" ||
      filePath.endsWith("/app.py") ||
      filePath === "app.py" ||
      filePath.endsWith("/wsgi.py") ||
      filePath === "wsgi.py" ||
      filePath.endsWith("/asgi.py") ||
      filePath === "asgi.py" ||
      filePath.endsWith("/manage.py") ||
      filePath === "manage.py"
    ) {
      signals = mergeSignals(signals, {
        deploymentDescriptorFiles: [filePath],
        framework: signals.framework === "unknown" ? "python" : signals.framework,
        runtime: signals.runtime === "unknown" ? "python" : signals.runtime
      });
      evidence.push({
        kind: "entrypoint",
        value: filePath,
        sourceFile: filePath,
        confidence: 0.82,
        metadata: {
          appRoot: inferAppRootFromPath(filePath)
        }
      });
      registerCandidateRoot(filePath, "entrypoint");
      findings.push({
        filePath,
        severity: "ok",
        title: "Python application entrypoint detected",
        detail: `${filePath} suggests this repository contains a runnable Python service entrypoint.`
      });
      continue;
    }

    if (filePath.endsWith(".csproj")) {
      signals = mergeSignals(signals, {
        framework: "csharp",
        runtime: "dotnet",
        dotnetAppType: signals.dotnetAppType === "web" ? "web" : "generic",
        csharpProjectFiles: [filePath],
        deploymentDescriptorFiles: [filePath]
      });
      evidence.push(
        {
          kind: "framework",
          value: "csharp",
          sourceFile: filePath,
          confidence: 0.9,
          metadata: {
            appRoot: inferAppRootFromPath(filePath)
          }
        },
        {
          kind: "runtime",
          value: "dotnet",
          sourceFile: filePath,
          confidence: 0.9,
          metadata: {
            appRoot: inferAppRootFromPath(filePath)
          }
        }
      );
      registerCandidateRoot(filePath, "framework");
      findings.push({
        filePath,
        severity: "ok",
        title: "C# project manifest detected",
        detail: `${filePath} identifies a .NET project in this repository.`
      });
      continue;
    }

    if (filePath.endsWith("/Program.cs") || filePath === "Program.cs") {
      signals = mergeSignals(signals, {
        framework: "csharp",
        runtime: "dotnet",
        dotnetAppType: signals.dotnetAppType === "web" ? "web" : "generic",
        deploymentDescriptorFiles: [filePath]
      });
      evidence.push({
        kind: "entrypoint",
        value: filePath,
        sourceFile: filePath,
        confidence: 0.78,
        metadata: {
          appRoot: inferAppRootFromPath(filePath)
        }
      });
      registerCandidateRoot(filePath, "entrypoint");
      findings.push({
        filePath,
        severity: "ok",
        title: "C# application entrypoint detected",
        detail: `${filePath} suggests a runnable .NET application entrypoint.`
      });
      continue;
    }

    if (filePath === "README.md" || filePath.endsWith("/README.md")) {
      const result = parseReadme(content, filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      continue;
    }

    if (filePath.startsWith(".github/workflows/")) {
      const result = parseWorkflow(content, filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      evidence.push({
        kind: "workflow",
        value: result.signals.hasBuildWorkflow ? "build_workflow" : "workflow",
        sourceFile: filePath,
        confidence: 0.78
      });
      continue;
    }

    if (
      filePath.endsWith(".tf") ||
      filePath.endsWith(".tfvars") ||
      filePath.includes("/helm/") ||
      filePath.includes("/k8s/") ||
      filePath.includes("/kubernetes/") ||
      filePath.endsWith("docker-compose.yml") ||
      filePath.endsWith("docker-compose.yaml") ||
      filePath.endsWith("compose.yml") ||
      filePath.endsWith("compose.yaml")
    ) {
      const result = parseInfrastructureFile(filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      evidence.push({
        kind: "iac",
        value: filePath,
        sourceFile: filePath,
        confidence: 0.82
      });
    }

    const configSignals = detectPlatformConfig(filePath);
    signals = mergeSignals(signals, configSignals);
    if (configSignals.detectedPlatformConfigs?.[0]) {
      registerCandidateRoot(filePath, "platform_config");
      evidence.push({
        kind: "platform_config",
        value: configSignals.detectedPlatformConfigs[0],
        sourceFile: filePath,
        confidence: 0.94,
        metadata: {
          appRoot: inferAppRootFromPath(filePath)
        }
      });
    }
  }

  const appRoots = [...candidateRootScores.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([root]) => root);
  const nonRootAppCount = appRoots.filter((root) => root !== ".").length;
  const primaryAppRoot = appRoots[0];
  const repoTopology =
    workspaceRoots.size > 0 || nonRootAppCount > 1
      ? "monorepo"
      : signals.hasInfrastructureCode && appRoots.length === 0
        ? "infra_only"
        : appRoots.length > 0
          ? "single_app"
          : "unknown";

  signals = mergeSignals(signals, {
    repoTopology,
    workspaceRoots: [...workspaceRoots],
    appRoots,
    primaryAppRoot
  });

  if (primaryAppRoot) {
    evidence.push({
      kind: "app_root",
      value: primaryAppRoot,
      sourceFile: primaryAppRoot === "." ? "package.json" : `${primaryAppRoot}/package.json`,
      confidence: primaryAppRoot === "." ? 0.72 : 0.9
    });
  }

  return { signals, findings, evidence };
}

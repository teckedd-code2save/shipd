import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

export function parsePackageJson(content: string, filePath = "package.json") {
  const findings: ScanFinding[] = [];

  try {
    const parsed = JSON.parse(content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      engines?: Record<string, string>;
      scripts?: Record<string, string>;
      workspaces?: string[] | { packages?: string[] };
    };

    const dependencies = {
      ...parsed.dependencies,
      ...parsed.devDependencies
    };

    const startScript = parsed.scripts?.start ?? "";
    const customServer =
      /(?:^|\s)(node|tsx|ts-node|bun)\s+.*(server|app)\.(js|ts)/i.test(startScript) ||
      /next\s+start\s+.*server/i.test(startScript);

    const signals: Partial<RepoSignals> = {
      framework: dependencies.next
        ? "nextjs"
        : dependencies.express
          ? "express"
          : dependencies.react
            ? "react"
            : "unknown",
      runtime: parsed.engines?.node?.includes("20")
        ? "node20"
        : parsed.engines?.node?.includes("18")
          ? "node18"
          : "unknown",
      hasCustomServer: customServer
    };

    findings.push({
      filePath,
      severity: "ok",
      title: "Parsed package metadata",
      detail: `Detected framework: ${signals.framework ?? "unknown"}.`
    });

    const workspacePackages = Array.isArray(parsed.workspaces)
      ? parsed.workspaces
      : Array.isArray(parsed.workspaces?.packages)
        ? parsed.workspaces.packages
        : [];

    if (workspacePackages.length > 0 || dependencies.turbo) {
      findings.push({
        filePath,
        severity: "info",
        title: "Workspace package manifest detected",
        detail:
          filePath === "package.json"
            ? "The root package manifest looks like a workspace or monorepo shell."
            : "This package manifest is part of a workspace layout."
      });
    }

    if (!parsed.scripts?.build) {
      findings.push({
        filePath,
        severity: "warning",
        title: "Build script missing",
        detail: "No explicit build script detected in package.json.",
        actionText: "Add or verify the production build command."
      });
    }

    if (customServer) {
      findings.push({
        filePath,
        severity: "info",
        title: "Custom server entrypoint detected",
        detail: "The start script appears to launch a custom runtime entrypoint."
      });
    }

    return { signals, findings };
  } catch {
    return {
      signals: {},
      findings: [
        {
          filePath,
          severity: "warning",
          title: "package.json could not be parsed",
          detail: "JSON parsing failed during repository analysis."
        }
      ] satisfies ScanFinding[]
    };
  }
}

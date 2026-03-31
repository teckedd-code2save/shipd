import { parseDockerfile } from "@/lib/parsing/dockerfile";
import { parseEnvFile } from "@/lib/parsing/env-file";
import { parsePackageJson } from "@/lib/parsing/package-json";
import { detectPlatformConfig } from "@/lib/parsing/platform-config";
import { parseWorkflow } from "@/lib/parsing/workflow";
import type { RepositoryFileMap, ScanFinding } from "@/lib/parsing/shared";
import type { RepoSignals } from "@/lib/parsing/types";

function mergeSignals(base: RepoSignals, next: Partial<RepoSignals>): RepoSignals {
  return {
    framework: next.framework ?? base.framework,
    runtime: next.runtime ?? base.runtime,
    hasDockerfile: next.hasDockerfile ?? base.hasDockerfile,
    hasCustomServer: next.hasCustomServer ?? base.hasCustomServer,
    envVars: Array.from(new Set([...base.envVars, ...(next.envVars ?? [])])),
    hasCiWorkflow: next.hasCiWorkflow ?? base.hasCiWorkflow,
    detectedPlatformConfigs: Array.from(
      new Set([...base.detectedPlatformConfigs, ...(next.detectedPlatformConfigs ?? [])])
    )
  };
}

export function scanRepositoryFiles(files: RepositoryFileMap) {
  let signals: RepoSignals = {
    framework: "unknown",
    runtime: "unknown",
    hasDockerfile: false,
    hasCustomServer: false,
    envVars: [],
    hasCiWorkflow: false,
    detectedPlatformConfigs: []
  };

  const findings: ScanFinding[] = [];

  for (const [filePath, content] of Object.entries(files)) {
    if (filePath === "package.json") {
      const result = parsePackageJson(content);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      continue;
    }

    if (filePath === "Dockerfile") {
      const result = parseDockerfile(content);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      continue;
    }

    if (filePath === ".env.example") {
      const result = parseEnvFile(content, filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      continue;
    }

    if (filePath.startsWith(".github/workflows/")) {
      const result = parseWorkflow(content, filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      continue;
    }

    const configSignals = detectPlatformConfig(filePath);
    signals = mergeSignals(signals, configSignals);
  }

  return { signals, findings };
}


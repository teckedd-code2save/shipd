import { parseDockerfile } from "@/lib/parsing/dockerfile";
import { parseEnvFile } from "@/lib/parsing/env-file";
import { parseInfrastructureFile } from "@/lib/parsing/infrastructure";
import { parsePackageJson } from "@/lib/parsing/package-json";
import { detectPlatformConfig } from "@/lib/parsing/platform-config";
import { parseNotebookFile, parsePythonProject } from "@/lib/parsing/python-project";
import { parseReadme } from "@/lib/parsing/readme";
import { parseWorkflow } from "@/lib/parsing/workflow";
import type { RepositoryFileMap, ScanFinding } from "@/lib/parsing/shared";
import type { RepoSignals } from "@/lib/parsing/types";

function mergeSignals(base: RepoSignals, next: Partial<RepoSignals>): RepoSignals {
  return {
    framework: next.framework ?? base.framework,
    runtime: next.runtime ?? base.runtime,
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
    notebookFiles: Array.from(new Set([...base.notebookFiles, ...(next.notebookFiles ?? [])])),
    scannedFiles: Math.max(base.scannedFiles, next.scannedFiles ?? base.scannedFiles)
  };
}

export function scanRepositoryFiles(files: RepositoryFileMap) {
  let signals: RepoSignals = {
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
    notebookFiles: [],
    scannedFiles: Object.keys(files).length
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
      const result = parseDockerfile(content, filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      continue;
    }

    if (filePath === ".env.example" || filePath.endsWith(".env.example") || filePath.endsWith(".env.sample")) {
      const result = parseEnvFile(content, filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      continue;
    }

    if (
      filePath === "pyproject.toml" ||
      filePath === "requirements.txt" ||
      filePath === "Pipfile" ||
      filePath === "setup.py" ||
      filePath === "environment.yml"
    ) {
      const result = parsePythonProject(filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
      continue;
    }

    if (filePath.endsWith(".ipynb")) {
      const result = parseNotebookFile(filePath);
      signals = mergeSignals(signals, result.signals);
      findings.push(...result.findings);
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
    }

    const configSignals = detectPlatformConfig(filePath);
    signals = mergeSignals(signals, configSignals);
  }

  return { signals, findings };
}

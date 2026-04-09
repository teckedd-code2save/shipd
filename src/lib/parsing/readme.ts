import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

const providers = ["vercel", "railway", "fly.io", "fly", "render", "netlify", "cloudflare", "aws"];

function stripInlineFormatting(line: string) {
  return line
    .replace(/`/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/^[-*]\s+/, "")
    .trim();
}

function extractReadmeSynopsis(content: string) {
  const paragraphs = content
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((block) => stripInlineFormatting(block.replace(/\n/g, " ")))
    .filter((block) => block.length > 40)
    .filter((block) => !block.startsWith("#"))
    .filter((block) => !block.startsWith("```"))
    .filter((block) => !block.startsWith("|"))
    .filter((block) => !/^quick start|^installation|^setup|^usage/i.test(block));

  return paragraphs[0];
}

function extractDeploymentHint(content: string) {
  const lines = content
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => stripInlineFormatting(line))
    .filter((line) => line.length >= 20 && line.length <= 220)
    .filter((line) => !line.startsWith("#"));

  return lines.find((line) =>
    /(deploy|deployment|production|vercel|railway|render|fly|wrangler|cloud run|app runner|docker|kubernetes)/i.test(
      line
    )
  );
}

export function parseReadme(content: string, filePath = "README.md") {
  const lowered = content.toLowerCase();
  const mentioned = providers.filter((provider) => lowered.includes(provider));
  const signals: Partial<RepoSignals> = {};
  const detectedPlatformConfigs = new Set<string>();
  const platformConfigFiles = new Set<string>();
  const deploymentDescriptorFiles = new Set<string>();

  if (lowered.includes("wrangler") || lowered.includes("cloudflare worker")) {
    detectedPlatformConfigs.add("cloudflare");
    platformConfigFiles.add(`${filePath}#cloudflare-worker-hint`);
  }

  if (
    lowered.includes("xcode") ||
    lowered.includes(".xcodeproj") ||
    lowered.includes("macos app") ||
    lowered.includes("menu bar app")
  ) {
    deploymentDescriptorFiles.add(`${filePath}#xcode-desktop-hint`);
  }

  if (detectedPlatformConfigs.size > 0) {
    signals.detectedPlatformConfigs = Array.from(detectedPlatformConfigs);
    signals.platformConfigFiles = Array.from(platformConfigFiles);
  }

  if (deploymentDescriptorFiles.size > 0) {
    signals.deploymentDescriptorFiles = Array.from(deploymentDescriptorFiles);
  }

  const synopsis = extractReadmeSynopsis(content);
  const deployHint = extractDeploymentHint(content);

  const findings: ScanFinding[] = [];

  if (synopsis) {
    findings.push({
      filePath,
      severity: "info",
      title: "README repository context",
      detail: synopsis
    });
  }

  if (deployHint) {
    findings.push({
      filePath,
      severity: "info",
      title: "README deployment hint",
      detail: deployHint
    });
  }

  if (mentioned.length > 0) {
    findings.push({
      filePath,
      severity: "info",
      title: "Deployment hints found in README",
      detail: `README references: ${mentioned.join(", ")}.`
    });
  }

  return {
    signals,
    findings
  };
}

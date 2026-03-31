import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

const secretPattern = /(SECRET|TOKEN|KEY|PASSWORD)=/i;

export function parseDockerfile(content: string, filePath = "Dockerfile") {
  const findings: ScanFinding[] = [];
  const lines = content.split("\n");

  const node20 = /node:20/i.test(content);

  lines.forEach((line, index) => {
    if (/^\s*ENV\s+/i.test(line) && secretPattern.test(line)) {
      findings.push({
        filePath,
        severity: "blocker",
        title: "Secret-like value detected in Dockerfile",
        detail: "Environment data appears to be baked into the image layer.",
        lineNumber: index + 1,
        actionText: "Move secret handling to platform-managed environment variables."
      });
    }
  });

  if (findings.length === 0) {
      findings.push({
      filePath,
      severity: "ok",
      title: "Dockerfile parsed successfully",
      detail: "No secret-like environment declarations detected."
    });
  }

  const signals: Partial<RepoSignals> = {
    hasDockerfile: true,
    dockerfilePaths: [filePath],
    runtime: node20 ? "node20" : "unknown"
  };

  return { signals, findings };
}

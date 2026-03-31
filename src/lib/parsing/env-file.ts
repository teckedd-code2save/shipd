import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

export function parseEnvFile(content: string, filePath = ".env.example") {
  const envVars = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0]?.trim())
    .filter(Boolean) as string[];

  const findings: ScanFinding[] = [
    {
      filePath,
      severity: "ok",
      title: "Environment variable references extracted",
      detail: `${envVars.length} variable references detected.`
    }
  ];

  return {
    signals: {
      envVars
    } satisfies Partial<RepoSignals>,
    findings
  };
}


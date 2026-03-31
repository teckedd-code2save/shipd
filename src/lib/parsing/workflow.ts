import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

export function parseWorkflow(content: string, filePath: string) {
  const hasBuildStep = /run:\s*(npm|pnpm|yarn)\s+run\s+build/i.test(content);

  const findings: ScanFinding[] = hasBuildStep
    ? [
        {
          filePath,
          severity: "ok",
          title: "Build step detected",
          detail: "The workflow contains an explicit build command."
        }
      ]
    : [
        {
          filePath,
          severity: "warning",
          title: "Build workflow requirements unclear",
          detail: "No clear build step was detected in the workflow.",
          actionText: "Review CI workflow requirements for production deploys."
        }
      ];

  return {
    signals: {
      hasCiWorkflow: true
    } satisfies Partial<RepoSignals>,
    findings
  };
}


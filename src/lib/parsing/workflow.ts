import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

const BUILD_PATTERNS = [
  /run:\s*(npm|pnpm|yarn)\s+run\s+build/i,
  /run:\s*dotnet\s+(build|publish)/i,
  /run:\s*pip\s+install/i,
  /run:\s*cargo\s+build/i,
  /run:\s*go\s+build/i,
  /run:\s*mvn\s+(package|install)/i,
  /run:\s*gradle\s+build/i,
  /uses:\s*actions\/setup-dotnet/i,
  /uses:\s*docker\/(build-push-action|setup-buildx)/i
];

const DEPLOY_PATTERNS = [
  /railway\s+up|railway\s+deploy/i,
  /flyctl\s+deploy|fly\s+deploy/i,
  /vercel\s+--prod/i,
  /heroku\s+container|git\s+push\s+heroku/i,
  /az\s+containerapp|az\s+webapp/i,
  /gcloud\s+run\s+deploy/i,
  /aws\s+apprunner/i,
  /kubectl\s+apply/i,
  /docker\s+compose\s+up/i
];

// Workflows that only lint/format/check — suppress build findings for these
const LINT_ONLY_PATTERNS = [
  /markdownlint|markdown.lint/i,
  /eslint|prettier|stylelint/i,
  /spell.?check|codeql|dependabot/i,
  /name:\s*["']?(lint|format|check|validate|scan|audit)/i
];

function isLintOnlyWorkflow(content: string): boolean {
  return LINT_ONLY_PATTERNS.some((pattern) => pattern.test(content));
}

export function parseWorkflow(content: string, filePath: string) {
  const hasBuildStep = BUILD_PATTERNS.some((pattern) => pattern.test(content));
  const hasDeployStep = DEPLOY_PATTERNS.some((pattern) => pattern.test(content));
  const isLintOnly = isLintOnlyWorkflow(content);

  const findings: ScanFinding[] = [];

  if (hasBuildStep) {
    findings.push({
      filePath,
      severity: "ok",
      title: "Build step detected",
      detail: "The workflow contains an explicit build command."
    });
  }

  if (hasDeployStep) {
    findings.push({
      filePath,
      severity: "info",
      title: "Deployment step detected",
      detail: "The workflow contains an automated deployment command."
    });
  }

  // Only emit the "no build step" info for workflows that look like CI/CD,
  // not for lint/check-only workflows.
  if (!hasBuildStep && !isLintOnly) {
    findings.push({
      filePath,
      severity: "info",
      title: "No build step in this workflow",
      detail: "This CI workflow doesn't include a build command. That's fine if building happens elsewhere, but worth checking before production deploys.",
      actionText: "Add a build step if this workflow is part of your deploy pipeline."
    });
  }

  return {
    signals: {
      hasCiWorkflow: true,
      hasBuildWorkflow: hasBuildStep,
      workflowFiles: [filePath]
    } satisfies Partial<RepoSignals>,
    findings
  };
}

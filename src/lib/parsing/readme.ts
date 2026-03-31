import type { ScanFinding } from "@/lib/parsing/shared";

const providers = ["vercel", "railway", "fly.io", "fly", "render", "netlify", "cloudflare", "aws"];

export function parseReadme(content: string, filePath = "README.md") {
  const lowered = content.toLowerCase();
  const mentioned = providers.filter((provider) => lowered.includes(provider));

  const findings: ScanFinding[] =
    mentioned.length > 0
      ? [
          {
            filePath,
            severity: "info",
            title: "Deployment hints found in README",
            detail: `README references: ${mentioned.join(", ")}.`
          }
        ]
      : [];

  return {
    signals: {},
    findings
  };
}

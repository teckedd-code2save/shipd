import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRule } from "@/lib/scoring/rules";

export const renderRule: PlatformRule = {
  platform: "Render",
  score(signals: RepoSignals) {
    let score = 38;
    if (signals.hasDockerfile) score += 12;
    if (signals.envVars.some((value) => value.includes("DATABASE"))) score += 8;
    if (signals.framework === "nextjs") score += 8;
    if (signals.framework === "nextjs" && !signals.hasDockerfile) score += 4;
    return score;
  },
  reasons(signals: RepoSignals) {
    const reasons = ["Solid general-purpose fit for web apps."];
    if (signals.hasDockerfile) reasons.push("Docker-based deploys are supported cleanly.");
    if (signals.envVars.some((value) => value.includes("DATABASE"))) {
      reasons.push("Database-backed services can be modeled here without much friction.");
    }
    return reasons;
  }
};

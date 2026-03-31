import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRule } from "@/lib/scoring/rules";

export const vercelRule: PlatformRule = {
  platform: "Vercel",
  score(signals: RepoSignals) {
    let score = 34;
    if (signals.framework === "nextjs") score += 38;
    if (signals.detectedPlatformConfigs.includes("vercel")) score += 14;
    if (!signals.hasDockerfile && !signals.hasCustomServer && signals.framework === "nextjs") score += 8;
    if (signals.hasCustomServer) score -= 22;
    if (signals.hasDockerfile) score -= 10;
    if (signals.envVars.some((value) => value.includes("REDIS"))) score -= 6;
    return score;
  },
  reasons(signals: RepoSignals) {
    const reasons = ["Strong fit for frontend-heavy and standard Next.js deployments."];
    if (signals.framework === "nextjs") reasons.push("Native Next.js support improves fit.");
    if (signals.detectedPlatformConfigs.includes("vercel")) {
      reasons.push("Existing Vercel configuration suggests the repo already leans this way.");
    }
    if (signals.hasCustomServer) reasons.push("Custom server signals weaken fit for this architecture.");
    return reasons;
  }
};

import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRule } from "@/lib/scoring/rules";

export const vercelRule: PlatformRule = {
  platform: "Vercel",
  score(signals: RepoSignals) {
    let score = 45;
    if (signals.framework === "nextjs") score += 25;
    if (signals.hasCustomServer) score -= 20;
    if (signals.hasDockerfile) score -= 6;
    if (signals.envVars.some((value) => value.includes("REDIS"))) score -= 4;
    return score;
  },
  reasons(signals: RepoSignals) {
    const reasons = ["Strong fit for frontend-heavy and standard Next.js deployments."];
    if (signals.framework === "nextjs") reasons.push("Native Next.js support improves fit.");
    if (signals.hasCustomServer) reasons.push("Custom server signals weaken fit for this architecture.");
    return reasons;
  }
};


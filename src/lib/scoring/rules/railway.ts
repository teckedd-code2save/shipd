import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRule } from "@/lib/scoring/rules";

export const railwayRule: PlatformRule = {
  platform: "Railway",
  score(signals: RepoSignals) {
    let score = 32;
    if (signals.hasDockerfile) score += 24;
    if (signals.hasCustomServer) score += 18;
    if (signals.detectedPlatformConfigs.includes("railway")) score += 14;
    if (signals.envVars.some((value) => value.includes("DATABASE"))) score += 8;
    if (signals.envVars.some((value) => value.includes("REDIS"))) score += 8;
    if (signals.framework === "nextjs" && !signals.hasDockerfile && !signals.hasCustomServer) score -= 10;
    return score;
  },
  reasons(signals: RepoSignals) {
    const reasons = ["Strong fit for service-style web apps."];
    if (signals.hasDockerfile) reasons.push("Docker-native workflow aligns with the repository.");
    if (signals.hasCustomServer) reasons.push("Custom server support fits the detected architecture.");
    if (signals.detectedPlatformConfigs.includes("railway")) {
      reasons.push("Existing Railway configuration increases confidence in fit.");
    }
    if (signals.envVars.some((value) => value.includes("DATABASE"))) {
      reasons.push("Managed Postgres aligns with detected database signals.");
    }
    return reasons;
  }
};

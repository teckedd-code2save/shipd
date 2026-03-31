import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRule } from "@/lib/scoring/rules";

export const railwayRule: PlatformRule = {
  platform: "Railway",
  score(signals: RepoSignals) {
    let score = 55;
    if (signals.hasDockerfile) score += 20;
    if (signals.hasCustomServer) score += 10;
    if (signals.envVars.some((value) => value.includes("DATABASE"))) score += 10;
    if (signals.envVars.some((value) => value.includes("REDIS"))) score += 8;
    return score;
  },
  reasons(signals: RepoSignals) {
    const reasons = ["Strong fit for service-style web apps."];
    if (signals.hasDockerfile) reasons.push("Docker-native workflow aligns with the repository.");
    if (signals.hasCustomServer) reasons.push("Custom server support fits the detected architecture.");
    if (signals.envVars.some((value) => value.includes("DATABASE"))) {
      reasons.push("Managed Postgres aligns with detected database signals.");
    }
    return reasons;
  }
};


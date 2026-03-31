import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRule } from "@/lib/scoring/rules";

export const flyRule: PlatformRule = {
  platform: "Fly.io",
  score(signals: RepoSignals) {
    let score = 30;
    if (signals.hasDockerfile) score += 24;
    if (signals.hasCustomServer) score += 14;
    if (signals.detectedPlatformConfigs.includes("fly")) score += 14;
    if (signals.framework === "nextjs") score += 4;
    return score;
  },
  reasons(signals: RepoSignals) {
    const reasons = ["Good fit when teams want more infra control."];
    if (signals.hasDockerfile) reasons.push("Docker support maps well to the repo.");
    if (signals.detectedPlatformConfigs.includes("fly")) {
      reasons.push("Existing Fly configuration strongly suggests operational fit.");
    }
    if (signals.hasCustomServer) reasons.push("Custom server workloads fit better here than on serverless-first platforms.");
    return reasons;
  }
};

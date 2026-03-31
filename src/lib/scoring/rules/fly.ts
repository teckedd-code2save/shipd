import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRule } from "@/lib/scoring/rules";

export const flyRule: PlatformRule = {
  platform: "Fly.io",
  score(signals: RepoSignals) {
    let score = 48;
    if (signals.hasDockerfile) score += 18;
    if (signals.hasCustomServer) score += 14;
    if (signals.framework === "nextjs") score += 6;
    return score;
  },
  reasons(signals: RepoSignals) {
    const reasons = ["Good fit when teams want more infra control."];
    if (signals.hasDockerfile) reasons.push("Docker support maps well to the repo.");
    if (signals.hasCustomServer) reasons.push("Custom server workloads fit better here than on serverless-first platforms.");
    return reasons;
  }
};


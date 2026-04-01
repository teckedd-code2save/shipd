import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRule } from "@/lib/scoring/rules";

export const flyRule: PlatformRule = {
  platform: "Fly.io",
  score(signals: RepoSignals) {
    let score = 16;
    if (signals.hasDockerfile) score += 24;
    if (signals.hasCustomServer) score += 14;
    if (signals.detectedPlatformConfigs.includes("fly")) score += 14;
    if (signals.framework === "nextjs") score += 4;
    if (signals.framework === "python") score += 8;
    if (signals.pythonProjectFiles.length > 0) score += 6;
    return score;
  },
  reasons(signals: RepoSignals) {
    const reasons = [];
    if (signals.dockerfilePaths[0]) reasons.push(`${signals.dockerfilePaths[0]} makes Fly's container-based deploy path plausible.`);
    if (signals.detectedPlatformConfigs.includes("fly")) {
      reasons.push(`${signals.platformConfigFiles.find((file) => file.includes("fly")) ?? "fly.toml"} already points toward Fly.io.`);
    }
    if (signals.pythonProjectFiles[0]) {
      reasons.push(`${signals.pythonProjectFiles[0]} suggests an application runtime that Fly can package into a long-lived service.`);
    }
    if (signals.hasCustomServer) reasons.push("The repo appears to run a custom server process, which fits better here than on serverless-first platforms.");
    if (signals.infrastructureFiles.some((file) => file.endsWith(".tf"))) {
      reasons.push(`${signals.infrastructureFiles.find((file) => file.endsWith(".tf"))} suggests the team is comfortable with infra-managed deploy surfaces.`);
    }
    return reasons.length > 0 ? reasons : ["This repo has some signals that point to an infra-controlled deployment path."];
  }
};

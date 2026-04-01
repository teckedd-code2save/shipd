import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRule } from "@/lib/scoring/rules";

export const renderRule: PlatformRule = {
  platform: "Render",
  score(signals: RepoSignals) {
    let score = 18;
    if (signals.hasDockerfile) score += 12;
    if (signals.envVars.some((value) => value.includes("DATABASE"))) score += 8;
    if (signals.framework === "nextjs") score += 8;
    if (signals.framework === "python") score += 18;
    if (signals.pythonProjectFiles.length > 0) score += 12;
    if (signals.framework === "nextjs" && !signals.hasDockerfile) score += 4;
    if (signals.detectedPlatformConfigs.includes("render")) score += 14;
    return score;
  },
  reasons(signals: RepoSignals) {
    const reasons = [];
    if (signals.dockerfilePaths[0]) reasons.push(`${signals.dockerfilePaths[0]} can be deployed directly without major translation.`);
    if (signals.envVars.some((value) => value.includes("DATABASE"))) {
      reasons.push(`${signals.envFilePaths[0] ?? ".env.example"} contains database variables that fit Render's managed service model.`);
    }
    if (signals.detectedPlatformConfigs.includes("render")) {
      reasons.push(`${signals.platformConfigFiles.find((file) => file.includes("render")) ?? "render.yaml"} already exists.`);
    }
    if (signals.pythonProjectFiles[0]) {
      reasons.push(`${signals.pythonProjectFiles[0]} looks like a Python application file that Render can host directly.`);
    }
    return reasons.length > 0 ? reasons : ["Render remains a viable general-purpose option for the files detected in this repo."];
  }
};

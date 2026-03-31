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
    const reasons = [];
    if (signals.dockerfilePaths[0]) {
      reasons.push(`${signals.dockerfilePaths[0]} suggests a container-first deploy flow Railway can absorb cleanly.`);
    }
    if (signals.hasCustomServer) reasons.push("The package start command looks like a custom runtime entrypoint rather than a pure serverless app.");
    if (signals.detectedPlatformConfigs.includes("railway")) {
      reasons.push(`${signals.platformConfigFiles.find((file) => file.includes("railway")) ?? "railway.json"} already exists in the repo.`);
    }
    if (signals.envVars.some((value) => value.includes("DATABASE"))) {
      reasons.push(`${signals.envFilePaths[0] ?? ".env.example"} references database variables that map well to Railway services.`);
    }
    if (signals.infrastructureFiles.length > 0) {
      reasons.push(`${signals.infrastructureFiles[0]} indicates there is already infra-aware deployment context in the repo.`);
    }
    return reasons.length > 0 ? reasons : ["Repository signals lean toward a service-style deployment flow rather than a static frontend host."];
  }
};

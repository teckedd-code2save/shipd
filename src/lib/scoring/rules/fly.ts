import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const flyRule: PlatformRule = {
  platform: "Fly.io",
  score(context) {
    const { signals } = context;
    let score = 12;

    if (hasArchetype(context, "dotnet_service_app")) score += 24;
    if (hasArchetype(context, "nextjs_custom_server_app")) score += 24;
    if (hasArchetype(context, "python_service_app")) score += 26;
    if (hasArchetype(context, "dockerized_service")) score += 22;
    if (hasRepoClass(context, "service_app")) score += 8;
    if (hasRepoClass(context, "python_service")) score += 8;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score += 14;
    if (signals.hasDockerfile) score += 24;
    if (signals.hasCustomServer) score += 14;
    if (signals.detectedPlatformConfigs.includes("fly")) score += 14;
    if (signals.framework === "nextjs") score += 4;
    if (signals.framework === "python") score += 8;
    if (signals.pythonProjectFiles.length > 0) score += 6;
    return score;
  },
  reasons(context) {
    const { signals } = context;
    const reasons = [];
    if (hasArchetype(context, "dotnet_service_app")) {
      reasons.push("Shipd matched this repo to a .NET service archetype, which fits Fly.io's long-running app model.");
    }
    if (hasArchetype(context, "nextjs_custom_server_app")) {
      reasons.push("Shipd matched this repo to a Next.js app with a custom server, which is often easier to run on Fly.io than on serverless-first platforms.");
    }
    if (hasArchetype(context, "python_service_app")) {
      reasons.push("The detected Python service archetype fits Fly.io's long-running app model.");
    }
    if (signals.csharpProjectFiles[0]) {
      reasons.push(`${signals.csharpProjectFiles[0]} points toward a .NET application that can run as a long-lived service on Fly.io.`);
    }
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
  },
  evidence(context) {
    const { signals } = context;
    return [
      ...(signals.dockerfilePaths[0] ? [signals.dockerfilePaths[0]] : []),
      ...(signals.platformConfigFiles.find((file) => file.includes("fly"))
        ? [signals.platformConfigFiles.find((file) => file.includes("fly"))!]
        : []),
      ...(signals.infrastructureFiles.find((file) => file.endsWith(".tf"))
        ? [signals.infrastructureFiles.find((file) => file.endsWith(".tf"))!]
        : [])
    ];
  },
  disqualifiers(context) {
    return hasRepoClass(context, "notebook_repo") || hasRepoClass(context, "library_or_package")
      ? ["The repo does not currently look like a long-running application service."]
      : [];
  }
};

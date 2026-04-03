import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const railwayRule: PlatformRule = {
  platform: "Railway",
  score(context) {
    const { signals } = context;
    let score = 12;

    if (hasArchetype(context, "express_postgres_service")) score += 40;
    if (hasArchetype(context, "dotnet_service_app")) score += 28;
    if (hasArchetype(context, "dockerized_service")) score += 18;
    if (hasArchetype(context, "python_service_app")) score += 24;
    if (hasRepoClass(context, "service_app")) score += 12;
    if (hasRepoClass(context, "python_service")) score += 10;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score += 16;
    if (signals.hasDockerfile) score += 24;
    if (signals.hasCustomServer) score += 18;
    if (signals.detectedPlatformConfigs.includes("railway")) score += 14;
    if (signals.framework === "python") score += 16;
    if (signals.pythonProjectFiles.length > 0) score += 10;
    if (signals.envVars.some((value) => value.includes("DATABASE"))) score += 8;
    if (signals.envVars.some((value) => value.includes("REDIS"))) score += 8;
    if (signals.framework === "nextjs" && !signals.hasDockerfile && !signals.hasCustomServer) score -= 10;
    return score;
  },
  reasons(context) {
    const { signals } = context;
    const reasons = [];
    if (hasArchetype(context, "express_postgres_service")) {
      reasons.push("Shipd matched this repo to the Express plus Postgres service archetype, which maps well to Railway's managed service model.");
    }
    if (hasArchetype(context, "python_service_app")) {
      reasons.push("Shipd detected a Python service archetype, which Railway can host without much platform translation.");
    }
    if (hasArchetype(context, "dotnet_service_app")) {
      reasons.push("Shipd matched this repo to a .NET service archetype, which Railway can host as a long-running application.");
    }
    if (signals.dockerfilePaths[0]) {
      reasons.push(`${signals.dockerfilePaths[0]} suggests a container-first deploy flow Railway can absorb cleanly.`);
    }
    if (signals.hasCustomServer) reasons.push("The package start command looks like a custom runtime entrypoint rather than a pure serverless app.");
    if (signals.detectedPlatformConfigs.includes("railway")) {
      reasons.push(`${signals.platformConfigFiles.find((file) => file.includes("railway")) ?? "railway.json"} already exists in the repo.`);
    }
    if (signals.pythonProjectFiles[0]) {
      reasons.push(`${signals.pythonProjectFiles[0]} suggests this repo could run as a Python service on Railway.`);
    }
    if (signals.csharpProjectFiles[0]) {
      reasons.push(`${signals.csharpProjectFiles[0]} suggests a .NET service deployment Railway can host as a long-running app.`);
    }
    if (signals.envVars.some((value) => value.includes("DATABASE"))) {
      reasons.push(`${signals.envFilePaths[0] ?? ".env.example"} references database variables that map well to Railway services.`);
    }
    if (signals.infrastructureFiles.length > 0) {
      reasons.push(`${signals.infrastructureFiles[0]} indicates there is already infra-aware deployment context in the repo.`);
    }
    return reasons.length > 0 ? reasons : ["Repository signals lean toward a service-style deployment flow rather than a static frontend host."];
  },
  evidence(context) {
    const { signals } = context;
    return [
      ...(signals.dockerfilePaths[0] ? [signals.dockerfilePaths[0]] : []),
      ...(signals.platformConfigFiles.find((file) => file.includes("railway"))
        ? [signals.platformConfigFiles.find((file) => file.includes("railway"))!]
        : []),
      ...(signals.envFilePaths[0] ? [signals.envFilePaths[0]] : []),
      ...(signals.infrastructureFiles[0] ? [signals.infrastructureFiles[0]] : [])
    ];
  },
  disqualifiers(context) {
    return hasRepoClass(context, "notebook_repo") || hasRepoClass(context, "infra_only")
      ? ["The repo class does not currently look like a deployable Railway application."]
      : [];
  }
};

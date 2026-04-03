import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const renderRule: PlatformRule = {
  platform: "Render",
  score(context) {
    const { signals } = context;
    let score = 14;

    if (hasArchetype(context, "dotnet_service_app")) score += 36;
    if (hasArchetype(context, "python_service_app")) score += 34;
    if (hasArchetype(context, "dockerized_service")) score += 16;
    if (hasArchetype(context, "nextjs_standard_app")) score += 10;
    if (hasRepoClass(context, "python_service")) score += 8;
    if (hasRepoClass(context, "service_app")) score += 8;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score += 18;
    if (signals.hasDockerfile) score += 12;
    if (signals.envVars.some((value) => value.includes("DATABASE"))) score += 8;
    if (signals.framework === "nextjs") score += 8;
    if (signals.framework === "python") score += 18;
    if (signals.pythonProjectFiles.length > 0) score += 12;
    if (signals.framework === "nextjs" && !signals.hasDockerfile) score += 4;
    if (signals.detectedPlatformConfigs.includes("render")) score += 14;
    return score;
  },
  reasons(context) {
    const { signals } = context;
    const reasons = [];
    if (hasArchetype(context, "dotnet_service_app")) {
      reasons.push("Shipd matched this repo to a .NET service archetype, which Render can host directly as a web service.");
    }
    if (hasArchetype(context, "python_service_app")) {
      reasons.push("Shipd matched this repo to a Python service archetype, which Render can host with a fairly direct setup path.");
    }
    if (signals.csharpProjectFiles[0]) {
      reasons.push(`${signals.csharpProjectFiles[0]} suggests a .NET service that Render can host as a web service.`);
    }
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
  },
  evidence(context) {
    const { signals } = context;
    return [
      ...(signals.dockerfilePaths[0] ? [signals.dockerfilePaths[0]] : []),
      ...(signals.platformConfigFiles.find((file) => file.includes("render"))
        ? [signals.platformConfigFiles.find((file) => file.includes("render"))!]
        : []),
      ...(signals.envFilePaths[0] ? [signals.envFilePaths[0]] : []),
      ...(signals.pythonProjectFiles[0] ? [signals.pythonProjectFiles[0]] : [])
    ];
  },
  disqualifiers(context) {
    return hasRepoClass(context, "notebook_repo")
      ? ["Notebook-style repositories are not enough to justify a Render deployment guide."]
      : [];
  }
};

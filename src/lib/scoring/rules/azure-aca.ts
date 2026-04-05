import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const azureAcaRule: PlatformRule = {
  platform: "Azure Container Apps",
  score(context) {
    const { signals } = context;
    let score = 8;

    if (hasArchetype(context, "dotnet_service_app")) score += 32;
    if (hasArchetype(context, "dockerized_service")) score += 20;
    if (hasArchetype(context, "python_service_app")) score += 12;
    if (hasArchetype(context, "express_postgres_service")) score += 10;
    if (hasRepoClass(context, "service_app")) score += 12;
    if (hasRepoClass(context, "python_service")) score += 8;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score += 24;
    if (signals.repoTopology === "dotnet_solution") score += 16;
    if (signals.hasDockerfile) score += 18;
    if (signals.infrastructureFiles.some((f) => f.endsWith(".bicep") || f.toLowerCase().includes("azure"))) score += 14;
    if (signals.hasInfrastructureCode) score += 6;
    if (signals.envVars.some((v) => v.includes("AZURE") || v.includes("APPINSIGHTS") || v.includes("SERVICEBUS"))) score += 10;
    if (signals.framework === "nextjs" && !signals.hasDockerfile) score -= 10;
    if (hasRepoClass(context, "library_or_package") || hasRepoClass(context, "notebook_repo")) score -= 20;

    return score;
  },
  reasons(context) {
    const { signals } = context;
    const reasons = [];

    if (hasArchetype(context, "dotnet_service_app")) {
      reasons.push("Shipd matched this repo to a .NET service archetype — Azure Container Apps has native Aspire integration and first-class ASP.NET support.");
    }
    if (signals.repoTopology === "dotnet_solution") {
      reasons.push("A .NET solution with multiple projects maps well to ACA's multi-container model with built-in service discovery.");
    }
    if (signals.framework === "csharp" || signals.runtime === "dotnet") {
      reasons.push(".NET is a first-class runtime on Azure with native managed identity, Key Vault bindings, and Service Bus integration.");
    }
    if (signals.hasDockerfile) {
      reasons.push(`${signals.dockerfilePaths[0] ?? "Dockerfile"} enables a direct container deployment path on Azure Container Apps.`);
    }
    if (signals.infrastructureFiles.some((f) => f.endsWith(".bicep"))) {
      const bicepFile = signals.infrastructureFiles.find((f) => f.endsWith(".bicep"));
      reasons.push(`${bicepFile} can be extended to provision ACA environments and container apps directly.`);
    }
    if (signals.envVars.some((v) => v.includes("AZURE"))) {
      reasons.push("Azure-specific environment variables suggest this app is already designed for the Azure ecosystem.");
    }

    return reasons.length > 0
      ? reasons
      : ["Azure Container Apps is a strong fit for containerised services and multi-service .NET applications."];
  },
  evidence(context) {
    const { signals } = context;
    return [
      ...(signals.csharpProjectFiles[0] ? [signals.csharpProjectFiles[0]] : []),
      ...(signals.dockerfilePaths[0] ? [signals.dockerfilePaths[0]] : []),
      ...(signals.infrastructureFiles.find((f) => f.endsWith(".bicep"))
        ? [signals.infrastructureFiles.find((f) => f.endsWith(".bicep"))!]
        : [])
    ];
  },
  disqualifiers(context) {
    return hasRepoClass(context, "notebook_repo") || hasRepoClass(context, "library_or_package")
      ? ["The repo class does not look like a deployable container application."]
      : [];
  }
};

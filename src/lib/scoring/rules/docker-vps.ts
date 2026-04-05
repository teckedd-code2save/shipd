import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const dockerVpsRule: PlatformRule = {
  platform: "Docker + VPS",
  score(context) {
    const { signals } = context;
    let score = 10;

    if (hasArchetype(context, "dockerized_service")) score += 30;
    if (hasArchetype(context, "dotnet_service_app")) score += 16;
    if (hasArchetype(context, "express_postgres_service")) score += 16;
    if (hasArchetype(context, "python_service_app")) score += 14;
    if (signals.deploymentDescriptorFiles.some((f) => f.includes("docker-compose") || f.includes("compose."))) score += 28;
    if (signals.hasDockerfile) score += 22;
    if (signals.repoTopology === "dotnet_solution" || signals.repoTopology === "monorepo") score += 16;
    if (hasRepoClass(context, "service_app")) score += 12;
    if (hasRepoClass(context, "python_service")) score += 10;
    if (signals.hasInfrastructureCode) score += 8;
    if (signals.envVars.some((v) => v.includes("DATABASE") || v.includes("REDIS"))) score += 8;
    if (!signals.hasDockerfile && !signals.deploymentDescriptorFiles.some((f) => f.includes("compose"))) score -= 12;
    if (hasRepoClass(context, "library_or_package") || hasRepoClass(context, "notebook_repo")) score -= 22;
    if (hasRepoClass(context, "static_site")) score -= 18;

    return score;
  },
  reasons(context) {
    const { signals } = context;
    const reasons = [];

    if (signals.deploymentDescriptorFiles.some((f) => f.includes("docker-compose") || f.includes("compose."))) {
      const composeFile = signals.deploymentDescriptorFiles.find((f) => f.includes("docker-compose") || f.includes("compose."));
      reasons.push(`${composeFile} enables a single-command deploy to any VPS with Docker installed.`);
    }
    if (signals.hasDockerfile) {
      reasons.push(`${signals.dockerfilePaths[0] ?? "Dockerfile"} gives you full control over the runtime and makes the app portable to any VPS.`);
    }
    if (signals.repoTopology === "dotnet_solution" || signals.repoTopology === "monorepo") {
      reasons.push("Multi-service repositories often run most reliably on a VPS with Docker Compose, giving each service its own container.");
    }
    if (hasArchetype(context, "dockerized_service")) {
      reasons.push("A dockerised service archetype is tailor-made for VPS + Docker Compose deployments with full infrastructure control.");
    }
    if (signals.hasInfrastructureCode) {
      reasons.push("Infrastructure-as-code files already in the repo can provision the VPS and deploy the compose stack.");
    }

    return reasons.length > 0 ? reasons : ["Docker + VPS gives full control over your runtime and is the most flexible option for complex or multi-service applications."];
  },
  evidence(context) {
    const { signals } = context;
    return [
      ...(signals.dockerfilePaths[0] ? [signals.dockerfilePaths[0]] : []),
      ...(signals.deploymentDescriptorFiles.find((f) => f.includes("docker-compose") || f.includes("compose."))
        ? [signals.deploymentDescriptorFiles.find((f) => f.includes("docker-compose") || f.includes("compose."))!]
        : []),
      ...(signals.infrastructureFiles[0] ? [signals.infrastructureFiles[0]] : [])
    ];
  },
  disqualifiers(context) {
    return hasRepoClass(context, "notebook_repo") || hasRepoClass(context, "library_or_package")
      ? ["The repo class does not look like a deployable application."]
      : [];
  }
};

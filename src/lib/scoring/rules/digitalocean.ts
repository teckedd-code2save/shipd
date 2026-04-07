import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const digitalOceanRule: PlatformRule = {
  platform: "DigitalOcean App Platform",
  score(context) {
    const { signals } = context;
    let score = 10;

    if (hasArchetype(context, "dockerized_service")) score += 22;
    if (hasArchetype(context, "express_postgres_service")) score += 20;
    if (hasArchetype(context, "python_service_app")) score += 20;
    if (hasArchetype(context, "nextjs_standard_app")) score += 14;
    if (hasRepoClass(context, "service_app")) score += 12;
    if (hasRepoClass(context, "python_service")) score += 12;
    if (hasRepoClass(context, "deployable_web_app")) score += 10;
    if (signals.hasDockerfile) score += 16;
    if (signals.framework === "python") score += 12;
    if (signals.framework === "nextjs") score += 8;
    if (signals.framework === "express") score += 10;
    if (signals.platformConfigFiles.some((f) => f.includes(".do/"))) score += 14;
    if (signals.envVars.some((v) => v.includes("DATABASE"))) score += 6;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score += 4;
    if (hasRepoClass(context, "library_or_package") || hasRepoClass(context, "notebook_repo")) score -= 20;

    return score;
  },
  reasons(context) {
    const { signals } = context;
    const reasons = [];

    if (hasArchetype(context, "express_postgres_service")) {
      reasons.push("An Express + Postgres service is one of DigitalOcean App Platform's primary supported archetypes.");
    }
    if (hasArchetype(context, "python_service_app")) {
      reasons.push("Python services deploy cleanly on DigitalOcean App Platform with automatic buildpack detection.");
    }
    if (signals.hasDockerfile) {
      reasons.push(`${signals.dockerfilePaths[0] ?? "Dockerfile"} enables a container-based deploy path on DigitalOcean.`);
    }
    if (signals.platformConfigFiles.some((f) => f.includes(".do/"))) {
      reasons.push(".do/app.yaml already exists and provides a declarative deployment configuration for DigitalOcean App Platform.");
    }
    if (hasArchetype(context, "nextjs_standard_app")) {
      reasons.push("Next.js apps deploy on DigitalOcean App Platform with full SSR support.");
    }

    return reasons.length > 0 ? reasons : ["DigitalOcean App Platform is a straightforward PaaS option for Node.js, Python, and Docker-based applications."];
  },
  evidence(context) {
    const { signals } = context;
    return [
      ...(signals.dockerfilePaths[0] ? [signals.dockerfilePaths[0]] : []),
      ...(signals.platformConfigFiles.find((f) => f.includes(".do/")) ? [signals.platformConfigFiles.find((f) => f.includes(".do/"))!] : []),
      ...(signals.envFilePaths[0] ? [signals.envFilePaths[0]] : [])
    ];
  },
  disqualifiers(context) {
    return hasRepoClass(context, "notebook_repo") || hasRepoClass(context, "library_or_package")
      ? ["The repo class does not look like a deployable application."]
      : [];
  }
};

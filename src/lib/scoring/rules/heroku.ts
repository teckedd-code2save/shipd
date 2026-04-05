import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const herokuRule: PlatformRule = {
  platform: "Heroku",
  score(context) {
    const { signals } = context;
    let score = 10;

    if (hasArchetype(context, "express_postgres_service")) score += 30;
    if (hasArchetype(context, "python_service_app")) score += 26;
    if (hasArchetype(context, "dockerized_service")) score += 14;
    if (hasRepoClass(context, "service_app")) score += 14;
    if (hasRepoClass(context, "python_service")) score += 14;
    if (signals.framework === "express") score += 16;
    if (signals.framework === "python") score += 16;
    if (signals.platformConfigFiles.some((f) => f === "Procfile")) score += 14;
    if (signals.envVars.some((v) => v.includes("DATABASE"))) score += 8;
    if (signals.envVars.some((v) => v.includes("REDIS"))) score += 6;
    if (signals.hasDockerfile) score += 10;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score -= 16;
    if (signals.framework === "nextjs" && !signals.hasCustomServer) score -= 8;
    if (hasRepoClass(context, "library_or_package") || hasRepoClass(context, "notebook_repo")) score -= 20;

    return score;
  },
  reasons(context) {
    const { signals } = context;
    const reasons = [];

    if (hasArchetype(context, "express_postgres_service")) {
      reasons.push("Shipd matched this repo to an Express + Postgres service archetype, which is one of Heroku's strongest use cases.");
    }
    if (hasArchetype(context, "python_service_app")) {
      reasons.push("Python web services (Django, Flask, FastAPI) have first-class Heroku support with gunicorn and Procfile-based deploys.");
    }
    if (signals.platformConfigFiles.some((f) => f === "Procfile")) {
      reasons.push("A Procfile is already present, which is the primary Heroku deploy signal.");
    }
    if (signals.envVars.some((v) => v.includes("DATABASE"))) {
      reasons.push(`${signals.envFilePaths[0] ?? ".env.example"} references a database URL that maps directly to Heroku Postgres.`);
    }
    if (signals.framework === "python") {
      reasons.push("Python apps deploy on Heroku without a Dockerfile — Heroku's Python buildpack handles the runtime automatically.");
    }

    return reasons.length > 0 ? reasons : ["Heroku is a solid PaaS choice for Node.js and Python web services with straightforward deploy paths."];
  },
  evidence(context) {
    const { signals } = context;
    return [
      ...(signals.platformConfigFiles.find((f) => f === "Procfile") ? ["Procfile"] : []),
      ...(signals.pythonProjectFiles[0] ? [signals.pythonProjectFiles[0]] : []),
      ...(signals.envFilePaths[0] ? [signals.envFilePaths[0]] : [])
    ];
  },
  disqualifiers(context) {
    const { signals } = context;
    return [
      ...(signals.framework === "csharp" || signals.runtime === "dotnet"
        ? [".NET has limited Heroku buildpack support — consider Railway, Fly.io, or Azure instead"]
        : []),
      ...(hasRepoClass(context, "notebook_repo") ? ["Notebook repos are not suited for Heroku deployment."] : [])
    ];
  }
};

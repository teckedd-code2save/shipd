import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const railwayRule: PlatformRule = {
  platform: "Railway",
  score(context) {
    const { signals } = context;
    let score = 12;

    if (hasArchetype(context, "express_postgres_service")) score += 40;
    if (hasArchetype(context, "dotnet_service_app")) score += 28;
    if (hasArchetype(context, "go_service_app")) score += 36;
    if (hasArchetype(context, "ruby_service_app")) score += 32;
    if (hasArchetype(context, "java_service_app")) score += 26;
    if (hasArchetype(context, "rust_service_app")) score += 24;
    if (hasArchetype(context, "php_service_app")) score += 24;
    if (hasArchetype(context, "dockerized_service")) score += 18;
    if (hasArchetype(context, "python_service_app")) score += 24;
    if (hasArchetype(context, "remix_app")) score += 10;
    if (hasRepoClass(context, "service_app")) score += 12;
    if (hasRepoClass(context, "python_service")) score += 10;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score += 16;
    if (signals.framework === "go") score += 18;
    if (signals.framework === "rust") score += 16;
    if (signals.framework === "ruby") score += 16;
    if (signals.framework === "java") score += 14;
    if (signals.framework === "php") score += 14;
    if (signals.hasDockerfile) score += 24;
    if (signals.hasCustomServer) score += 18;
    if (signals.detectedPlatformConfigs.includes("railway")) score += 14;
    if (signals.framework === "python") score += 16;
    if (signals.pythonProjectFiles.length > 0) score += 10;
    if (signals.goProjectFiles.length > 0) score += 6;
    if (signals.rubyProjectFiles.length > 0) score += 6;
    if (signals.javaProjectFiles.length > 0) score += 4;
    if (signals.envVars.some((value) => value.includes("DATABASE"))) score += 8;
    if (signals.envVars.some((value) => value.includes("REDIS"))) score += 8;
    // Next.js with a database is a strong Railway use case — co-locate app + DB in one project
    if (signals.framework === "nextjs" && signals.envVars.some((v) => v.includes("DATABASE"))) score += 26;
    // Plain Next.js with no DB, no Docker, no custom server is better served by Vercel
    else if (signals.framework === "nextjs" && !signals.hasDockerfile && !signals.hasCustomServer) score -= 6;
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
    if (hasArchetype(context, "go_service_app")) {
      reasons.push("Go services map directly to Railway's runtime model with minimal configuration.");
    }
    if (hasArchetype(context, "ruby_service_app")) {
      reasons.push("Ruby service apps run well on Railway's managed environment.");
    }
    if (hasArchetype(context, "java_service_app")) {
      reasons.push("Java applications can deploy to Railway as containerized or buildpack-based services.");
    }
    if (hasArchetype(context, "rust_service_app")) {
      reasons.push("Rust binaries deploy cleanly on Railway's container runtime.");
    }
    if (hasArchetype(context, "php_service_app")) {
      reasons.push("PHP services can be deployed on Railway via Docker or buildpacks.");
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
    if (signals.goProjectFiles[0]) {
      reasons.push(`${signals.goProjectFiles[0]} identifies a Go project that Railway can run as a service.`);
    }
    if (signals.rubyProjectFiles[0]) {
      reasons.push(`${signals.rubyProjectFiles[0]} identifies a Ruby project Railway can host as a web service.`);
    }
    if (signals.envVars.some((value) => value.includes("DATABASE"))) {
      if (signals.framework === "nextjs") {
        reasons.push("Next.js with a database is a strong Railway use case — you get the app and Postgres in one project with DATABASE_URL auto-wired.");
      } else {
        reasons.push(`${signals.envFilePaths[0] ?? ".env.example"} references database variables that map well to Railway's managed service model.`);
      }
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
      ...(signals.infrastructureFiles[0] ? [signals.infrastructureFiles[0]] : []),
      ...(signals.goProjectFiles[0] ? [signals.goProjectFiles[0]] : []),
      ...(signals.rubyProjectFiles[0] ? [signals.rubyProjectFiles[0]] : []),
      ...(signals.javaProjectFiles[0] ? [signals.javaProjectFiles[0]] : []),
      ...(signals.rustProjectFiles[0] ? [signals.rustProjectFiles[0]] : []),
      ...(signals.phpProjectFiles[0] ? [signals.phpProjectFiles[0]] : [])
    ];
  },
  disqualifiers(context) {
    return hasRepoClass(context, "notebook_repo") || hasRepoClass(context, "infra_only")
      ? ["The repo class does not currently look like a deployable Railway application."]
      : [];
  }
};

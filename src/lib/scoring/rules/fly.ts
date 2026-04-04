import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const flyRule: PlatformRule = {
  platform: "Fly.io",
  score(context) {
    const { signals } = context;
    let score = 12;

    if (hasArchetype(context, "dotnet_service_app")) score += 24;
    if (hasArchetype(context, "nextjs_custom_server_app")) score += 24;
    if (hasArchetype(context, "python_service_app")) score += 26;
    if (hasArchetype(context, "go_service_app")) score += 38;
    if (hasArchetype(context, "rust_service_app")) score += 36;
    if (hasArchetype(context, "ruby_service_app")) score += 28;
    if (hasArchetype(context, "java_service_app")) score += 24;
    if (hasArchetype(context, "php_service_app")) score += 20;
    if (hasArchetype(context, "dockerized_service")) score += 22;
    if (hasArchetype(context, "remix_app")) score += 10;
    if (hasArchetype(context, "nuxt_app")) score += 8;
    if (hasArchetype(context, "sveltekit_app")) score += 8;
    if (hasRepoClass(context, "service_app")) score += 8;
    if (hasRepoClass(context, "python_service")) score += 8;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score += 14;
    if (signals.framework === "go") score += 20;
    if (signals.framework === "rust") score += 18;
    if (signals.framework === "ruby") score += 12;
    if (signals.framework === "java") score += 10;
    if (signals.framework === "php") score += 8;
    if (signals.hasDockerfile) score += 24;
    if (signals.hasCustomServer) score += 14;
    if (signals.detectedPlatformConfigs.includes("fly")) score += 14;
    if (signals.framework === "nextjs") score += 4;
    if (signals.framework === "python") score += 8;
    if (signals.pythonProjectFiles.length > 0) score += 6;
    if (signals.goProjectFiles.length > 0) score += 6;
    if (signals.rustProjectFiles.length > 0) score += 6;
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
    if (hasArchetype(context, "go_service_app")) {
      reasons.push("Go services are a natural fit for Fly.io — compiled binaries deploy with minimal overhead and start fast.");
    }
    if (hasArchetype(context, "rust_service_app")) {
      reasons.push("Rust binaries run efficiently on Fly.io's container model with low memory overhead.");
    }
    if (hasArchetype(context, "ruby_service_app")) {
      reasons.push("Ruby services can be containerized and deployed on Fly.io as long-running web apps.");
    }
    if (hasArchetype(context, "java_service_app")) {
      reasons.push("Java services deploy well on Fly.io via Docker, which handles JVM startup and resource tuning.");
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
    if (signals.goProjectFiles[0]) {
      reasons.push(`${signals.goProjectFiles[0]} identifies a Go project that compiles to a small binary Fly.io can run efficiently.`);
    }
    if (signals.rustProjectFiles[0]) {
      reasons.push(`${signals.rustProjectFiles[0]} identifies a Rust project that compiles to a lean, high-performance binary suited to Fly.io.`);
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
      ...(signals.goProjectFiles[0] ? [signals.goProjectFiles[0]] : []),
      ...(signals.rustProjectFiles[0] ? [signals.rustProjectFiles[0]] : []),
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

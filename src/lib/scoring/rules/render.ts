import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const renderRule: PlatformRule = {
  platform: "Render",
  score(context) {
    const { signals } = context;
    let score = 14;

    if (hasArchetype(context, "dotnet_service_app")) score += 36;
    if (hasArchetype(context, "python_service_app")) score += 34;
    if (hasArchetype(context, "ruby_service_app")) score += 36;
    if (hasArchetype(context, "go_service_app")) score += 28;
    if (hasArchetype(context, "php_service_app")) score += 30;
    if (hasArchetype(context, "java_service_app")) score += 24;
    if (hasArchetype(context, "rust_service_app")) score += 22;
    if (hasArchetype(context, "dockerized_service")) score += 16;
    if (hasArchetype(context, "nextjs_standard_app")) score += 10;
    if (hasArchetype(context, "sveltekit_app")) score += 12;
    if (hasArchetype(context, "nuxt_app")) score += 12;
    if (hasArchetype(context, "remix_app")) score += 12;
    if (hasRepoClass(context, "python_service")) score += 8;
    if (hasRepoClass(context, "service_app")) score += 8;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score += 18;
    if (signals.framework === "ruby") score += 20;
    if (signals.framework === "go") score += 14;
    if (signals.framework === "php") score += 16;
    if (signals.framework === "java") score += 12;
    if (signals.framework === "rust") score += 10;
    if (signals.hasDockerfile) score += 12;
    if (signals.envVars.some((value) => value.includes("DATABASE"))) score += 8;
    if (signals.framework === "nextjs") score += 8;
    if (signals.framework === "python") score += 18;
    if (signals.pythonProjectFiles.length > 0) score += 12;
    if (signals.rubyProjectFiles.length > 0) score += 8;
    if (signals.phpProjectFiles.length > 0) score += 6;
    if (signals.goProjectFiles.length > 0) score += 6;
    if (signals.javaProjectFiles.length > 0) score += 4;
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
    if (hasArchetype(context, "ruby_service_app")) {
      reasons.push("Render has strong native Ruby support with automatic build detection for Rails and Rack apps.");
    }
    if (hasArchetype(context, "go_service_app")) {
      reasons.push("Go services deploy cleanly on Render with automatic binary builds and managed runtime.");
    }
    if (hasArchetype(context, "php_service_app")) {
      reasons.push("Render supports PHP services and can auto-detect common frameworks like Laravel.");
    }
    if (hasArchetype(context, "java_service_app")) {
      reasons.push("Java services can be hosted on Render as Docker-based web services.");
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
    if (signals.rubyProjectFiles[0]) {
      reasons.push(`${signals.rubyProjectFiles[0]} identifies a Ruby project that Render can host with native Ruby support.`);
    }
    if (signals.phpProjectFiles[0]) {
      reasons.push(`${signals.phpProjectFiles[0]} identifies a PHP project that Render can host as a web service.`);
    }
    if (signals.goProjectFiles[0]) {
      reasons.push(`${signals.goProjectFiles[0]} identifies a Go project Render can build and host as a web service.`);
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
      ...(signals.pythonProjectFiles[0] ? [signals.pythonProjectFiles[0]] : []),
      ...(signals.rubyProjectFiles[0] ? [signals.rubyProjectFiles[0]] : []),
      ...(signals.phpProjectFiles[0] ? [signals.phpProjectFiles[0]] : []),
      ...(signals.goProjectFiles[0] ? [signals.goProjectFiles[0]] : []),
      ...(signals.javaProjectFiles[0] ? [signals.javaProjectFiles[0]] : [])
    ];
  },
  disqualifiers(context) {
    return hasRepoClass(context, "notebook_repo")
      ? ["Notebook-style repositories are not enough to justify a Render deployment guide."]
      : [];
  }
};

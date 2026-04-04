import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const vercelRule: PlatformRule = {
  platform: "Vercel",
  score(context) {
    const { signals } = context;
    let score = 14;

    if (hasArchetype(context, "nextjs_standard_app")) score += 54;
    if (hasArchetype(context, "cloudflare_worker_app")) score -= 14;
    if (hasArchetype(context, "nextjs_custom_server_app")) score += 6;
    if (hasArchetype(context, "astro_app")) score += 28;
    if (hasArchetype(context, "sveltekit_app")) score += 26;
    if (hasArchetype(context, "nuxt_app")) score += 18;
    if (hasArchetype(context, "remix_app")) score += 14;
    if (hasRepoClass(context, "deployable_web_app")) score += 8;
    if (signals.framework === "nextjs") score += 10;
    if (signals.framework === "astro") score += 6;
    if (signals.framework === "sveltekit") score += 6;
    if (signals.framework === "nuxt") score += 4;
    if (signals.framework === "remix") score += 4;
    if (signals.detectedPlatformConfigs.includes("vercel")) score += 14;
    if (!signals.hasDockerfile && !signals.hasCustomServer && signals.framework === "nextjs") score += 8;
    if (signals.hasCustomServer) score -= 24;
    if (signals.hasDockerfile) score -= 10;
    if (signals.framework === "python") score -= 20;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score -= 24;
    if (signals.framework === "go" || signals.framework === "rust" || signals.framework === "java") score -= 20;
    if (signals.framework === "ruby" || signals.framework === "php") score -= 18;
    if (signals.envVars.some((value) => value.includes("REDIS"))) score -= 8;

    return score;
  },
  reasons(context) {
    const { signals } = context;
    const reasons = [];
    if (hasArchetype(context, "nextjs_standard_app")) {
      reasons.push("Shipd matched this repo to the standard Next.js app archetype, which is Vercel's strongest path.");
    }
    if (hasArchetype(context, "astro_app")) {
      reasons.push("Astro's static-first output maps well to Vercel's edge delivery model.");
    }
    if (hasArchetype(context, "sveltekit_app")) {
      reasons.push("SvelteKit deploys cleanly to Vercel with the official adapter.");
    }
    if (hasArchetype(context, "nuxt_app")) {
      reasons.push("Nuxt can deploy to Vercel via Nitro's Vercel preset.");
    }
    if (hasArchetype(context, "remix_app")) {
      reasons.push("Remix can be hosted on Vercel using the Vercel adapter.");
    }
    if (signals.framework === "nextjs") reasons.push("package.json identifies this as a Next.js app, which aligns with Vercel's native runtime.");
    if (signals.detectedPlatformConfigs.includes("vercel")) {
      reasons.push(`${signals.platformConfigFiles.find((file) => file.includes("vercel")) ?? "vercel.json"} already exists in the repo.`);
    }
    if (signals.hasCustomServer) reasons.push("The detected custom server entrypoint weakens Vercel fit because it pushes the app away from the standard runtime model.");
    if (signals.workflowFiles[0] && signals.hasBuildWorkflow) {
      reasons.push(`${signals.workflowFiles[0]} already includes a build step, which lowers deployment ambiguity for Vercel.`);
    }
    return reasons.length > 0 ? reasons : ["Vercel is mainly compelling when the repo looks like a standard Next.js frontend deployment."];
  },
  evidence(context) {
    const { signals } = context;
    return [
      ...(["nextjs", "sveltekit", "nuxt", "remix", "astro"].includes(signals.framework ?? "") ? ["package.json"] : []),
      ...(signals.platformConfigFiles.find((file) => file.includes("vercel"))
        ? [signals.platformConfigFiles.find((file) => file.includes("vercel"))!]
        : []),
      ...(signals.workflowFiles[0] && signals.hasBuildWorkflow ? [signals.workflowFiles[0]] : [])
    ];
  },
  disqualifiers(context) {
    const { signals } = context;
    return [
      ...(signals.hasCustomServer ? ["Custom runtime entrypoint detected"] : []),
      ...(signals.pythonProjectFiles[0] ? [`${signals.pythonProjectFiles[0]} points to a Python service path`] : []),
      ...(signals.csharpProjectFiles[0] ? [`${signals.csharpProjectFiles[0]} points to a .NET service path`] : []),
      ...(signals.goProjectFiles[0] ? [`${signals.goProjectFiles[0]} points to a Go service path`] : []),
      ...(signals.rubyProjectFiles[0] ? [`${signals.rubyProjectFiles[0]} points to a Ruby service path`] : []),
      ...(signals.javaProjectFiles[0] ? [`${signals.javaProjectFiles[0]} points to a Java service path`] : []),
      ...(signals.rustProjectFiles[0] ? [`${signals.rustProjectFiles[0]} points to a Rust service path`] : []),
      ...(signals.phpProjectFiles[0] ? [`${signals.phpProjectFiles[0]} points to a PHP service path`] : [])
    ];
  }
};

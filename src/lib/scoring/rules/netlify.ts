import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const netlifyRule: PlatformRule = {
  platform: "Netlify",
  score(context) {
    const { signals } = context;
    let score = 10;

    if (hasArchetype(context, "nextjs_standard_app")) score += 26;
    if (hasRepoClass(context, "static_site")) score += 40;
    if (hasRepoClass(context, "deployable_web_app")) score += 16;
    if (signals.detectedPlatformConfigs.includes("netlify")) score += 18;
    if (signals.framework === "nextjs" || signals.framework === "react") score += 12;
    if (!signals.hasDockerfile && !signals.hasCustomServer && signals.framework === "nextjs") score += 8;
    if (signals.hasCustomServer) score -= 20;
    if (signals.hasDockerfile) score -= 18;
    if (signals.framework === "python") score -= 22;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score -= 26;
    if (hasRepoClass(context, "service_app")) score -= 14;
    if (hasRepoClass(context, "library_or_package") || hasRepoClass(context, "notebook_repo")) score -= 20;
    if (signals.envVars.some((v) => v.includes("DATABASE") || v.includes("REDIS"))) score -= 10;

    return score;
  },
  reasons(context) {
    const { signals } = context;
    const reasons = [];

    if (hasRepoClass(context, "static_site")) {
      reasons.push("A static site is Netlify's primary use case — zero-config deploys with CDN edge delivery.");
    }
    if (hasArchetype(context, "nextjs_standard_app")) {
      reasons.push("Standard Next.js apps (no custom server) deploy on Netlify with SSR and ISR support via Netlify's Next.js runtime.");
    }
    if (signals.detectedPlatformConfigs.includes("netlify")) {
      reasons.push(`${signals.platformConfigFiles.find((f) => f.includes("netlify")) ?? "netlify.toml"} is already configured for Netlify.`);
    }
    if (!signals.hasDockerfile && !signals.hasCustomServer && signals.framework === "nextjs") {
      reasons.push("No custom server or Dockerfile detected — this Next.js app can deploy to Netlify without modification.");
    }

    return reasons.length > 0 ? reasons : ["Netlify is best suited for static sites and frontend-only Next.js or React applications."];
  },
  evidence(context) {
    const { signals } = context;
    return [
      ...(signals.platformConfigFiles.find((f) => f.includes("netlify")) ? [signals.platformConfigFiles.find((f) => f.includes("netlify"))!] : []),
      ...(signals.framework === "nextjs" ? ["package.json"] : []),
      ...(signals.workflowFiles[0] && signals.hasBuildWorkflow ? [signals.workflowFiles[0]] : [])
    ];
  },
  disqualifiers(context) {
    const { signals } = context;
    return [
      ...(signals.hasCustomServer ? ["Custom server entrypoint is not compatible with Netlify's serverless runtime"] : []),
      ...(signals.framework === "csharp" || signals.runtime === "dotnet" ? [".NET services are not supported on Netlify"] : []),
      ...(signals.framework === "python" ? ["Python services require a container-based or PaaS platform — not Netlify"] : [])
    ];
  }
};

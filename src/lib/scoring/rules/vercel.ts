import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRule } from "@/lib/scoring/rules";

export const vercelRule: PlatformRule = {
  platform: "Vercel",
  score(signals: RepoSignals) {
    let score = 20;
    if (signals.framework === "nextjs") score += 38;
    if (signals.framework === "python") score -= 18;
    if (signals.detectedPlatformConfigs.includes("vercel")) score += 14;
    if (!signals.hasDockerfile && !signals.hasCustomServer && signals.framework === "nextjs") score += 8;
    if (signals.hasCustomServer) score -= 22;
    if (signals.hasDockerfile) score -= 10;
    if (signals.envVars.some((value) => value.includes("REDIS"))) score -= 6;
    return score;
  },
  reasons(signals: RepoSignals) {
    const reasons = [];
    if (signals.framework === "nextjs") reasons.push("package.json identifies this as a Next.js app, which is Vercel's strongest path.");
    if (signals.detectedPlatformConfigs.includes("vercel")) {
      reasons.push(`${signals.platformConfigFiles.find((file) => file.includes("vercel")) ?? "vercel.json"} already exists in the repo.`);
    }
    if (signals.pythonProjectFiles[0]) {
      reasons.push(`${signals.pythonProjectFiles[0]} points toward a Python app, which is not Vercel's primary fit.`);
    }
    if (signals.hasCustomServer) reasons.push("The detected custom server entrypoint weakens Vercel fit because it pushes the app away from the standard runtime model.");
    if (signals.workflowFiles[0] && signals.hasBuildWorkflow) {
      reasons.push(`${signals.workflowFiles[0]} already includes a build step, which lowers deployment ambiguity for Vercel.`);
    }
    return reasons.length > 0 ? reasons : ["Vercel is mainly compelling when the repo looks like a standard Next.js frontend deployment."];
  }
};

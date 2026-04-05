import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const gcpCloudRunRule: PlatformRule = {
  platform: "GCP Cloud Run",
  score(context) {
    const { signals } = context;
    let score = 8;

    if (hasArchetype(context, "dockerized_service")) score += 26;
    if (hasArchetype(context, "python_service_app")) score += 24;
    if (hasArchetype(context, "express_postgres_service")) score += 18;
    if (hasArchetype(context, "dotnet_service_app")) score += 12;
    if (hasRepoClass(context, "python_service")) score += 14;
    if (hasRepoClass(context, "service_app")) score += 10;
    if (signals.hasDockerfile) score += 22;
    if (signals.framework === "python") score += 14;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score += 8;
    if (signals.hasCustomServer) score += 8;
    if (signals.infrastructureFiles.some((f) => f.endsWith(".tf") || f.includes("gcp") || f.includes("cloudbuild"))) score += 14;
    if (signals.envVars.some((v) => v.includes("GCP") || v.includes("GOOGLE") || v.includes("FIREBASE") || v.includes("BIGQUERY"))) score += 12;
    if (signals.framework === "nextjs" && !signals.hasDockerfile && !signals.hasCustomServer) score -= 8;
    if (hasRepoClass(context, "library_or_package") || hasRepoClass(context, "notebook_repo")) score -= 20;

    return score;
  },
  reasons(context) {
    const { signals } = context;
    const reasons = [];

    if (hasArchetype(context, "python_service_app")) {
      reasons.push("Python services deploy exceptionally well on Cloud Run with automatic scaling to zero and per-request billing.");
    }
    if (hasArchetype(context, "dockerized_service")) {
      reasons.push("A containerised service archetype is a direct fit for Cloud Run's container-first deploy model.");
    }
    if (signals.hasDockerfile) {
      reasons.push(`${signals.dockerfilePaths[0] ?? "Dockerfile"} enables a straightforward Cloud Run deploy via gcloud or Cloud Build.`);
    }
    if (signals.envVars.some((v) => v.includes("GOOGLE") || v.includes("FIREBASE"))) {
      reasons.push("Google-specific environment variables suggest this app is already integrated with the GCP ecosystem.");
    }
    if (signals.infrastructureFiles.some((f) => f.includes("cloudbuild"))) {
      const cbFile = signals.infrastructureFiles.find((f) => f.includes("cloudbuild"));
      reasons.push(`${cbFile} can trigger Cloud Run deployments directly via Cloud Build.`);
    }

    return reasons.length > 0 ? reasons : ["GCP Cloud Run is a serverless container platform well suited for web services and APIs."];
  },
  evidence(context) {
    const { signals } = context;
    return [
      ...(signals.dockerfilePaths[0] ? [signals.dockerfilePaths[0]] : []),
      ...(signals.infrastructureFiles.find((f) => f.endsWith(".tf") || f.includes("cloudbuild"))
        ? [signals.infrastructureFiles.find((f) => f.endsWith(".tf") || f.includes("cloudbuild"))!]
        : []),
      ...(signals.pythonProjectFiles[0] ? [signals.pythonProjectFiles[0]] : [])
    ];
  },
  disqualifiers(context) {
    return hasRepoClass(context, "notebook_repo") || hasRepoClass(context, "library_or_package")
      ? ["The repo class does not look like a deployable service application."]
      : [];
  }
};

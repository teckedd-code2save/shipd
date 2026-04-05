import { hasArchetype, hasRepoClass, type PlatformRule } from "@/lib/scoring/rules";

export const awsRule: PlatformRule = {
  platform: "AWS App Runner",
  score(context) {
    const { signals } = context;
    let score = 8;

    if (hasArchetype(context, "dockerized_service")) score += 26;
    if (hasArchetype(context, "express_postgres_service")) score += 20;
    if (hasArchetype(context, "python_service_app")) score += 20;
    if (hasArchetype(context, "dotnet_service_app")) score += 14;
    if (hasRepoClass(context, "service_app")) score += 12;
    if (hasRepoClass(context, "python_service")) score += 12;
    if (signals.hasDockerfile) score += 22;
    if (signals.hasCustomServer) score += 10;
    if (signals.framework === "python") score += 12;
    if (signals.framework === "csharp" || signals.runtime === "dotnet") score += 8;
    if (signals.infrastructureFiles.some((f) => f.endsWith(".tf") || f.includes("sam.yaml") || f.includes("apprunner"))) score += 16;
    if (signals.envVars.some((v) => v.includes("AWS") || v.includes("S3") || v.includes("DYNAMO") || v.includes("SQS") || v.includes("SNS"))) score += 12;
    if (signals.framework === "nextjs" && !signals.hasDockerfile && !signals.hasCustomServer) score -= 8;
    if (hasRepoClass(context, "library_or_package") || hasRepoClass(context, "notebook_repo")) score -= 20;

    return score;
  },
  reasons(context) {
    const { signals } = context;
    const reasons = [];

    if (hasArchetype(context, "dockerized_service")) {
      reasons.push("A containerised service archetype is a natural fit for AWS App Runner's managed container runtime.");
    }
    if (signals.hasDockerfile) {
      reasons.push(`${signals.dockerfilePaths[0] ?? "Dockerfile"} enables a direct App Runner deploy from a container image or ECR.`);
    }
    if (signals.envVars.some((v) => v.includes("AWS") || v.includes("S3") || v.includes("DYNAMO"))) {
      reasons.push("AWS-specific environment variables indicate this app is designed to run within the AWS ecosystem.");
    }
    if (signals.infrastructureFiles.some((f) => f.endsWith(".tf"))) {
      const tfFile = signals.infrastructureFiles.find((f) => f.endsWith(".tf"));
      reasons.push(`${tfFile} can provision AWS resources alongside the App Runner service.`);
    }
    if (hasArchetype(context, "python_service_app")) {
      reasons.push("Python services deploy cleanly on App Runner with automatic scaling and no infrastructure to manage.");
    }

    return reasons.length > 0 ? reasons : ["AWS App Runner is a managed container service well suited for web APIs and backend services."];
  },
  evidence(context) {
    const { signals } = context;
    return [
      ...(signals.dockerfilePaths[0] ? [signals.dockerfilePaths[0]] : []),
      ...(signals.infrastructureFiles.find((f) => f.endsWith(".tf"))
        ? [signals.infrastructureFiles.find((f) => f.endsWith(".tf"))!]
        : []),
      ...(signals.envFilePaths[0] ? [signals.envFilePaths[0]] : [])
    ];
  },
  disqualifiers(context) {
    return hasRepoClass(context, "notebook_repo") || hasRepoClass(context, "library_or_package")
      ? ["The repo class does not look like a deployable service application."]
      : [];
  }
};

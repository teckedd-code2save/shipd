import { recommendPlatforms } from "@/server/services/recommendation-service";
import { scanRepository } from "@/server/services/scan-service";

export async function buildDeploymentPlan(repoId: string) {
  const { findings } = await scanRepository(repoId);
  const [topRecommendation] = await recommendPlatforms(repoId);

  return {
    title: `${topRecommendation.platform} deployment plan`,
    summary: `${topRecommendation.platform} is currently the best fit for this repository.`,
    topPlatform: topRecommendation.platform,
    score: topRecommendation.score,
    confidence: topRecommendation.confidence,
    blockers: findings
      .filter((finding) => finding.severity === "blocker")
      .map((finding) => finding.title),
    warnings: findings
      .filter((finding) => finding.severity === "warning")
      .map((finding) => finding.title),
    nextSteps: [
      `Create a ${topRecommendation.platform} project`,
      "Set required environment variables",
      "Confirm runtime and start command"
    ]
  };
}

import { getRepositoryAnalysis } from "@/server/services/analysis-service";

export async function buildDeploymentPlan(
  repoId: string,
  options?: {
    refresh?: boolean;
  }
) {
  const analysis = await getRepositoryAnalysis(repoId, options);
  return analysis.plan;
}

import type { PlatformRecommendation } from "@/lib/scoring/types";

import { getRepositoryAnalysis } from "@/server/services/analysis-service";

export async function recommendPlatforms(
  repoId: string,
  options?: {
    refresh?: boolean;
  }
): Promise<PlatformRecommendation[]> {
  const analysis = await getRepositoryAnalysis(repoId, options);
  return analysis.recommendations;
}

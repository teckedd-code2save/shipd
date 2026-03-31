import { scorePlatforms } from "@/lib/scoring/engine";
import type { PlatformRecommendation } from "@/lib/scoring/types";

import { scanRepository } from "@/server/services/scan-service";

export async function recommendPlatforms(repoId: string): Promise<PlatformRecommendation[]> {
  const { signals } = await scanRepository(repoId);
  return scorePlatforms(signals);
}

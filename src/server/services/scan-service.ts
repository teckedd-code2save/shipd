import { getRepositoryAnalysis } from "@/server/services/analysis-service";

export async function scanRepository(
  repoId: string,
  options?: {
    refresh?: boolean;
  }
) {
  const analysis = await getRepositoryAnalysis(repoId, options);

  return {
    signals: analysis.signals,
    findings: analysis.findings,
    scannedAt: analysis.scannedAt
  };
}

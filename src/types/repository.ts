export interface DashboardRepository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  lastScanned: string;
  repoTopology?: string;
  primaryAppRoot?: string;
  framework?: string;
  repoClass?: string;
  topArchetype?: string;
  topPlatform?: string;
  topScore?: number;
  topConfidence?: number;
}

export interface DashboardRepository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  lastScanned: string;
  topPlatform?: string;
  topScore?: number;
}

import { getPrismaClient } from "@/lib/db/prisma";

export interface OverviewMetrics {
  totalUsers: number;
  newUsersThisWeek: number;
  totalScans: number;
  scansThisWeek: number;
  activeUsersThisWeek: number;
  totalChatMessages: number;
  totalRepositories: number;
}

export interface TopUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  repoCount: number;
  scanCount: number;
  chatCount: number;
  lastActiveAt: Date | null;
}

export interface DailyScanCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface PlatformStat {
  platform: string;
  count: number;
}

export interface RecentScan {
  scanId: string;
  repoFullName: string;
  userName: string | null;
  userEmail: string | null;
  framework: string | null;
  topPlatform: string | null;
  scannedAt: Date;
}

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const db = getPrismaClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisWeek,
    totalScans,
    scansThisWeek,
    totalChatMessages,
    totalRepositories,
    reposWithRecentScans,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.scan.count(),
    db.scan.count({ where: { createdAt: { gte: weekAgo } } }),
    db.chatMessage.count({ where: { role: "user" } }),
    db.repository.count(),
    db.repository.findMany({
      where: { scans: { some: { createdAt: { gte: weekAgo } } } },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);

  return {
    totalUsers,
    newUsersThisWeek,
    totalScans,
    scansThisWeek,
    activeUsersThisWeek: reposWithRecentScans.length,
    totalChatMessages,
    totalRepositories,
  };
}

export async function getTopUsers(limit = 20): Promise<TopUser[]> {
  const db = getPrismaClient();

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      repositories: {
        select: {
          id: true,
          scans: {
            select: { id: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
          chatMessages: {
            select: { id: true },
            where: { role: "user" },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const result: TopUser[] = users.map((u) => {
    let scanCount = 0;
    let chatCount = 0;
    let lastActiveAt: Date | null = null;

    for (const repo of u.repositories) {
      scanCount += repo.scans.length;
      chatCount += repo.chatMessages.length;
      if (repo.scans[0]?.createdAt) {
        if (!lastActiveAt || repo.scans[0].createdAt > lastActiveAt) {
          lastActiveAt = repo.scans[0].createdAt;
        }
      }
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      repoCount: u.repositories.length,
      scanCount,
      chatCount,
      lastActiveAt,
    };
  });

  return result
    .sort((a, b) => b.scanCount - a.scanCount)
    .slice(0, limit);
}

export async function getDailyScanCounts(days = 14): Promise<DailyScanCount[]> {
  const db = getPrismaClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const scans = await db.scan.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const buckets: Record<string, number> = {};

  // Pre-fill all days with 0
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = 0;
  }

  for (const scan of scans) {
    const key = scan.createdAt.toISOString().slice(0, 10);
    if (key in buckets) buckets[key]++;
  }

  return Object.entries(buckets).map(([date, count]) => ({ date, count }));
}

export async function getPlatformStats(): Promise<PlatformStat[]> {
  const db = getPrismaClient();

  // Count top platform recommendations (highest score per scan)
  const plans = await db.deploymentPlan.groupBy({
    by: ["platform"],
    _count: { platform: true },
    orderBy: { _count: { platform: "desc" } },
  });

  return plans.map((p) => ({
    platform: p.platform,
    count: p._count.platform,
  }));
}

export async function getRecentScans(limit = 20): Promise<RecentScan[]> {
  const db = getPrismaClient();

  const scans = await db.scan.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      framework: true,
      createdAt: true,
      repository: {
        select: {
          fullName: true,
          user: { select: { name: true, email: true } },
          plans: {
            select: { platform: true, score: true },
            orderBy: { score: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  return scans.map((s) => ({
    scanId: s.id,
    repoFullName: s.repository.fullName,
    userName: s.repository.user.name,
    userEmail: s.repository.user.email,
    framework: s.framework,
    topPlatform: s.repository.plans[0]?.platform ?? null,
    scannedAt: s.createdAt,
  }));
}

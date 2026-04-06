import { getPrismaClient } from "@/lib/db/prisma";
import { hasDatabaseEnv } from "@/lib/env";
import { PLAN_LIMITS, isUnlimited } from "@/config/plans";

export class PlanLimitError extends Error {
  constructor(
    public readonly kind: "scan_quota" | "private_quota",
    message: string
  ) {
    super(message);
    this.name = "PlanLimitError";
  }
}

function isSameCalendarMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * Single enforcement entry point called before every fresh repo compute.
 * - Admin/unlimited emails bypass all checks.
 * - Resets monthly counters lazily when the calendar month has rolled over.
 * - Throws PlanLimitError when a quota is exceeded.
 * - Increments the appropriate counter on success.
 */
export async function enforceAndTrackScan(
  userId: string,
  email: string | null | undefined,
  repoId: string
): Promise<void> {
  if (!hasDatabaseEnv()) return;

  // Unlimited users (admins, testers) skip all quota logic
  if (isUnlimited(email)) return;

  const prisma = getPrismaClient();

  const [user, repo] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        planScanCount: true,
        planPrivateScanCount: true,
        planScanResetAt: true,
      },
    }),
    prisma.repository.findUnique({
      where: { id: repoId },
      select: { isPrivate: true },
    }),
  ]);

  if (!user) return;

  const now = new Date();
  let { planScanCount, planPrivateScanCount } = user;

  // Lazy monthly reset — runs in-band on first scan attempt of a new month
  if (!isSameCalendarMonth(user.planScanResetAt, now)) {
    planScanCount = 0;
    planPrivateScanCount = 0;
    await prisma.user.update({
      where: { id: userId },
      data: { planScanCount: 0, planPrivateScanCount: 0, planScanResetAt: now },
    });
  }

  const limits = PLAN_LIMITS[user.plan];
  const isPrivate = repo?.isPrivate ?? false;

  if (isPrivate) {
    if (planPrivateScanCount >= limits.privateScansPerMonth) {
      throw new PlanLimitError(
        "private_quota",
        `You have used your ${limits.privateScansPerMonth === 1 ? "" : limits.privateScansPerMonth + " "}free private scan${limits.privateScansPerMonth === 1 ? "" : "s"} this month.`
      );
    }
    await prisma.user.update({
      where: { id: userId },
      data: { planPrivateScanCount: { increment: 1 } },
    });
  } else {
    if (planScanCount >= limits.publicScansPerMonth) {
      throw new PlanLimitError(
        "scan_quota",
        `You have used all ${limits.publicScansPerMonth} free public scans this month.`
      );
    }
    await prisma.user.update({
      where: { id: userId },
      data: { planScanCount: { increment: 1 } },
    });
  }
}

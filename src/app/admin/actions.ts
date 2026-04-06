"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrismaClient } from "@/lib/db/prisma";
import { isAdmin } from "@/config/plans";
import { Plan } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/dashboard");
}

export async function setUserPlanAction(userId: string, plan: Plan) {
  await requireAdmin();
  const prisma = getPrismaClient();
  await prisma.user.update({ where: { id: userId }, data: { plan } });
}

export async function resetUserQuotaAction(userId: string) {
  await requireAdmin();
  const prisma = getPrismaClient();
  await prisma.user.update({
    where: { id: userId },
    data: { planScanCount: 0, planPrivateScanCount: 0, planScanResetAt: new Date() },
  });
}

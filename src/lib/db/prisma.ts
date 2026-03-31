import { PrismaClient } from "@prisma/client";

import { env, hasDatabaseEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  if (!hasDatabaseEnv()) {
    throw new Error("DATABASE_URL is required before Prisma can connect.");
  }

  process.env.DATABASE_URL = env.DATABASE_URL;

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });
}

export function getPrismaClient() {
  const prisma = globalForPrisma.prisma ?? createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

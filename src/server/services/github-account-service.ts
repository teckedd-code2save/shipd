import { auth } from "@/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { getPrismaClient } from "@/lib/db/prisma";

export async function getCurrentGitHubAccessToken() {
  if (!hasDatabaseEnv()) {
    return null;
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const account = await getPrismaClient().account.findFirst({
    where: {
      userId,
      provider: "github"
    },
    select: {
      access_token: true
    }
  });

  return account?.access_token ?? null;
}


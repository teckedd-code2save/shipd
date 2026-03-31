import { getPrismaClient } from "@/lib/db/prisma";
import { hasDatabaseEnv } from "@/lib/env";
import { listViewerRepositories } from "@/lib/github/api";
import type { GitHubRepositorySummary } from "@/lib/github/types";

import { auth } from "@/auth";
import { getCurrentGitHubAccessToken } from "@/server/services/github-account-service";

const sampleRepos: GitHubRepositorySummary[] = [
  {
    githubId: "sample-storefront",
    owner: "acme-corp",
    name: "storefront",
    fullName: "acme-corp/storefront",
    htmlUrl: "https://github.com/acme-corp/storefront",
    isPrivate: false,
    defaultBranch: "main",
    updatedAt: new Date().toISOString()
  },
  {
    githubId: "sample-api",
    owner: "acme-corp",
    name: "api",
    fullName: "acme-corp/api",
    htmlUrl: "https://github.com/acme-corp/api",
    isPrivate: false,
    defaultBranch: "main",
    updatedAt: new Date().toISOString()
  }
];

export async function syncViewerRepositories() {
  const session = await auth();
  const userId = session?.user?.id;
  const token = await getCurrentGitHubAccessToken();

  if (!userId || !token || !hasDatabaseEnv()) {
    return [];
  }

  const repos = await listViewerRepositories(token);
  const prisma = getPrismaClient();

  await Promise.all(
    repos.map((repo) =>
      prisma.repository.upsert({
        where: {
          fullName: repo.fullName
        },
        update: {
          owner: repo.owner,
          name: repo.name,
          githubUrl: repo.htmlUrl,
          githubId: repo.githubId
        },
        create: {
          owner: repo.owner,
          name: repo.name,
          fullName: repo.fullName,
          githubUrl: repo.htmlUrl,
          githubId: repo.githubId,
          userId
        }
      })
    )
  );

  return prisma.repository.findMany({
    where: {
      userId
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}

export async function listRepositoriesForDashboard() {
  if (!hasDatabaseEnv()) {
    return sampleRepos.map((repo) => ({
      id: repo.githubId,
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
      lastScanned: "Not yet scanned",
      topPlatform: undefined,
      topScore: undefined
    }));
  }

  const synced = await syncViewerRepositories();

  if (synced.length === 0) {
    return sampleRepos.map((repo) => ({
      id: repo.githubId,
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
      lastScanned: "Not yet scanned",
      topPlatform: undefined,
      topScore: undefined
    }));
  }

  const prisma = getPrismaClient();

  const repos = await Promise.all(
    synced.map(async (repo) => {
      const lastScan = await prisma.scan.findFirst({
        where: { repositoryId: repo.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true }
      });

      const topPlan = await prisma.deploymentPlan.findFirst({
        where: { repositoryId: repo.id },
        orderBy: { updatedAt: "desc" },
        select: {
          platform: true,
          score: true
        }
      });

      return {
        id: repo.id,
        owner: repo.owner,
        name: repo.name,
        fullName: repo.fullName,
        lastScanned: lastScan ? lastScan.createdAt.toISOString() : "Not yet scanned",
        topPlatform: topPlan?.platform,
        topScore: topPlan?.score
      };
    })
  );

  return repos;
}

export async function findRepositoryById(repoId: string) {
  if (!hasDatabaseEnv()) {
    return null;
  }

  return getPrismaClient().repository.findUnique({
    where: {
      id: repoId
    }
  });
}

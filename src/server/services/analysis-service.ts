import { Prisma, type PlatformScore as PersistedPlatformScore } from "@prisma/client";

import type { ScanFinding } from "@/lib/parsing/shared";
import { scanRepositoryFiles } from "@/lib/parsing/scan-repository";
import type { RepositoryFileMap } from "@/lib/parsing/shared";
import type { RepoSignals } from "@/lib/parsing/types";
import { scorePlatforms } from "@/lib/scoring/engine";
import type { PlatformRecommendation } from "@/lib/scoring/types";
import { getPrismaClient } from "@/lib/db/prisma";
import { hasDatabaseEnv } from "@/lib/env";

import { getCurrentGitHubAccessToken } from "@/server/services/github-account-service";
import { loadRepositoryFilesFromGitHub } from "@/server/services/github-scan-source";
import { findRepositoryById } from "@/server/services/repository-service";

export interface DeploymentPlanSnapshot {
  title: string;
  summary: string;
  topPlatform: string;
  score: number;
  confidence: number;
  blockers: string[];
  warnings: string[];
  nextSteps: string[];
}

export interface RepositoryAnalysisSnapshot {
  repoId: string;
  signals: RepoSignals;
  findings: ScanFinding[];
  recommendations: PlatformRecommendation[];
  plan: DeploymentPlanSnapshot;
  scannedAt?: string;
}

function loadRepositoryFixture(_repoId: string): RepositoryFileMap {
  return {
    "package.json": JSON.stringify(
      {
        dependencies: {
          next: "15.0.0",
          react: "19.0.0",
          express: "5.0.0"
        },
        engines: {
          node: "20.x"
        },
        scripts: {
          build: "next build",
          start: "node server.js"
        }
      },
      null,
      2
    ),
    Dockerfile: `FROM node:20-alpine
WORKDIR /app
ENV STRIPE_SECRET_KEY=secret_value
COPY . .
RUN npm ci
CMD ["npm", "start"]`,
    ".env.example": `DATABASE_URL=
REDIS_URL=
NEXTAUTH_SECRET=`,
    ".github/workflows/ci.yml": `name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build`
  };
}

function createPlanFromSnapshot(findings: ScanFinding[], recommendations: PlatformRecommendation[]) {
  const topRecommendation = recommendations[0] ?? {
    platform: "Unknown",
    score: 0,
    confidence: 0,
    verdict: "poor" as const,
    reasons: ["Not enough repository signals were available yet."]
  };

  const lowConfidence = topRecommendation.confidence < 0.3 || topRecommendation.score < 25;

  return {
    title: `${topRecommendation.platform} deployment plan`,
    summary: lowConfidence
      ? `Shipd does not yet have enough deployment evidence to make a strong platform call for this repository. ${topRecommendation.platform} is only a tentative placeholder based on weak signals.`
      : `${topRecommendation.platform} is currently the best fit for this repository.`,
    topPlatform: topRecommendation.platform,
    score: topRecommendation.score,
    confidence: topRecommendation.confidence,
    blockers: findings
      .filter((finding) => finding.severity === "blocker")
      .map((finding) => finding.title),
    warnings: findings
      .filter((finding) => finding.severity === "warning")
      .map((finding) => finding.title),
    nextSteps: [
      ...(lowConfidence
        ? [
            "Add or confirm deployment-relevant files such as package.json, Dockerfile, pyproject.toml, or platform config",
            "Confirm the runtime and entrypoint this repo should ship with",
            "Re-scan once the repo exposes clearer deployment evidence"
          ]
        : [
            `Create a ${topRecommendation.platform} project`,
            "Set required environment variables",
            "Confirm runtime and start command"
          ])
    ]
  };
}

function isRepoSignals(value: unknown): value is RepoSignals {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.hasDockerfile === "boolean" &&
    typeof candidate.hasCustomServer === "boolean" &&
    Array.isArray(candidate.envVars) &&
    typeof candidate.hasCiWorkflow === "boolean" &&
    Array.isArray(candidate.detectedPlatformConfigs)
  );
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function hydratePlatformRecommendation(score: PersistedPlatformScore): PlatformRecommendation {
  return {
    platform: score.platform,
    score: score.score,
    confidence: score.confidence,
    verdict: score.verdict as PlatformRecommendation["verdict"],
    reasons: normalizeStringArray(score.explanation)
  };
}

async function loadRepositoryFiles(repoId: string) {
  if (hasDatabaseEnv()) {
    const repository = await findRepositoryById(repoId);
    const token = await getCurrentGitHubAccessToken();

    if (repository && token) {
      try {
        const files = await loadRepositoryFilesFromGitHub({
          token,
          owner: repository.owner,
          repo: repository.name
        });

        return files;
      } catch {
        // Fall through to local fixture only when live GitHub loading fails entirely.
      }
    }
  }

  return loadRepositoryFixture(repoId);
}

async function computeRepositoryAnalysis(repoId: string): Promise<RepositoryAnalysisSnapshot> {
  const files = await loadRepositoryFiles(repoId);
  const { signals, findings } = scanRepositoryFiles(files);
  const recommendations = scorePlatforms(signals);
  const plan = createPlanFromSnapshot(findings, recommendations);

  return {
    repoId,
    signals,
    findings,
    recommendations,
    plan
  };
}

async function loadPersistedRepositoryAnalysis(repoId: string) {
  if (!hasDatabaseEnv()) {
    return null;
  }

  const prisma = getPrismaClient();
  const [scan, plan] = await Promise.all([
    prisma.scan.findFirst({
      where: {
        repositoryId: repoId
      },
      include: {
        findings: {
          orderBy: {
            createdAt: "asc"
          }
        },
        platformScores: {
          orderBy: {
            score: "desc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.deploymentPlan.findFirst({
      where: {
        repositoryId: repoId
      },
      orderBy: {
        updatedAt: "desc"
      }
    })
  ]);

  if (!scan || !isRepoSignals(scan.summaryJson)) {
    return null;
  }

  const recommendations = scan.platformScores.map(hydratePlatformRecommendation);
  const fallbackPlan = createPlanFromSnapshot(
    scan.findings.map((finding) => ({
      filePath: finding.filePath,
      severity: finding.severity as ScanFinding["severity"],
      title: finding.title,
      detail: finding.detail,
      lineNumber: finding.lineNumber ?? undefined,
      actionText: finding.actionText ?? undefined
    })),
    recommendations
  );

  const storedPlanJson =
    plan?.planJson && typeof plan.planJson === "object" && !Array.isArray(plan.planJson)
      ? (plan.planJson as Record<string, unknown>)
      : null;

  const storedPlanMatchesLatestScan =
    Boolean(plan) &&
    plan?.platform === fallbackPlan.topPlatform &&
    plan?.score === fallbackPlan.score &&
    Math.abs((plan?.confidence ?? 0) - fallbackPlan.confidence) < 0.001;

  const hydratedPlan =
    storedPlanMatchesLatestScan && plan
      ? {
          title: plan.title,
          summary: plan.summary,
          topPlatform: plan.platform,
          score: plan.score,
          confidence: plan.confidence,
          blockers: normalizeStringArray(storedPlanJson?.blockers),
          warnings: normalizeStringArray(storedPlanJson?.warnings),
          nextSteps: normalizeStringArray(storedPlanJson?.nextSteps)
        }
      : fallbackPlan;

  return {
    repoId,
    signals: scan.summaryJson,
    findings: scan.findings.map((finding) => ({
      filePath: finding.filePath,
      severity: finding.severity as ScanFinding["severity"],
      title: finding.title,
      detail: finding.detail,
        lineNumber: finding.lineNumber ?? undefined,
        actionText: finding.actionText ?? undefined
    })),
    recommendations,
    plan: hydratedPlan,
    scannedAt: scan.createdAt.toISOString()
  } satisfies RepositoryAnalysisSnapshot;
}

async function persistRepositoryAnalysis(snapshot: RepositoryAnalysisSnapshot) {
  if (!hasDatabaseEnv()) {
    return snapshot;
  }

  const repository = await findRepositoryById(snapshot.repoId);

  if (!repository) {
    return snapshot;
  }

  const prisma = getPrismaClient();
  const persisted = await prisma.$transaction(async (tx) => {
    const scan = await tx.scan.create({
      data: {
        repositoryId: repository.id,
        status: "completed",
        framework: snapshot.signals.framework === "unknown" ? null : snapshot.signals.framework,
        runtime: snapshot.signals.runtime === "unknown" ? null : snapshot.signals.runtime,
        confidence: snapshot.recommendations[0]?.confidence ?? 0,
        summaryJson: snapshot.signals as unknown as Prisma.InputJsonValue
      }
    });

    if (snapshot.findings.length > 0) {
      await tx.scanFinding.createMany({
        data: snapshot.findings.map((finding) => ({
          scanId: scan.id,
          filePath: finding.filePath,
          severity: finding.severity,
          title: finding.title,
          detail: finding.detail,
          lineNumber: finding.lineNumber ?? null,
          actionType: finding.actionText ? "manual" : null,
          actionText: finding.actionText ?? null,
          actionUrl: null
        }))
      });
    }

    if (snapshot.recommendations.length > 0) {
      await tx.platformScore.createMany({
        data: snapshot.recommendations.map((recommendation) => ({
          scanId: scan.id,
          platform: recommendation.platform,
          score: recommendation.score,
          verdict: recommendation.verdict,
          confidence: recommendation.confidence,
          explanation: recommendation.reasons as unknown as Prisma.InputJsonValue
        }))
      });
    }

    const plan = await tx.deploymentPlan.create({
      data: {
        repositoryId: repository.id,
        platform: snapshot.plan.topPlatform,
        title: snapshot.plan.title,
        summary: snapshot.plan.summary,
        score: snapshot.plan.score,
        confidence: snapshot.plan.confidence,
        planJson: {
          blockers: snapshot.plan.blockers,
          warnings: snapshot.plan.warnings,
          nextSteps: snapshot.plan.nextSteps
        } as Prisma.InputJsonValue
      }
    });

    return {
      scanCreatedAt: scan.createdAt,
      plan
    };
  });

  return {
    ...snapshot,
    scannedAt: persisted.scanCreatedAt.toISOString()
  };
}

export async function getRepositoryAnalysis(
  repoId: string,
  options?: {
    refresh?: boolean;
  }
) {
  if (!options?.refresh) {
    const persisted = await loadPersistedRepositoryAnalysis(repoId);

    if (persisted) {
      return persisted;
    }
  }

  const computed = await computeRepositoryAnalysis(repoId);
  return persistRepositoryAnalysis(computed);
}

export async function refreshRepositoryAnalysis(repoId: string) {
  return getRepositoryAnalysis(repoId, { refresh: true });
}

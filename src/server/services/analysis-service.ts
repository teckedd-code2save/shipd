import { Prisma, type PlatformScore as PersistedPlatformScore } from "@/generated/prisma/client";

import { matchArchetypes } from "@/lib/archetypes/match-archetypes";
import type { ArchetypeMatchResult } from "@/lib/archetypes/types";
import { classifyRepository } from "@/lib/classification/classify-repository";
import type { RepoClassificationResult } from "@/lib/classification/types";
import type { EvidenceRecord, ScanFinding } from "@/lib/parsing/shared";
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
  evidence: EvidenceRecord[];
  classification: RepoClassificationResult;
  archetypes: ArchetypeMatchResult[];
  findings: ScanFinding[];
  recommendations: PlatformRecommendation[];
  plan: DeploymentPlanSnapshot;
  recommendationVersion: string;
  scannedAt?: string;
}

const ACTIVE_RECOMMENDATION_VERSION = {
  label: "v2-deterministic-initial",
  extractorVersion: "2.0.0",
  classifierVersion: "2.0.0",
  archetypeVersion: "2.0.0",
  mappingVersion: "2.0.0",
  guideVersion: "2.0.0",
  aiVersion: "2.0.0"
} as const;

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

function createPlanFromSnapshot(
  findings: ScanFinding[],
  recommendations: PlatformRecommendation[],
  classification: RepoClassificationResult,
  archetypes: ArchetypeMatchResult[],
  signals?: RepoSignals
) {
  const topRecommendation = recommendations[0] ?? {
    platform: "Unknown",
    score: 0,
    confidence: 0,
    verdict: "poor" as const,
    reasons: ["Not enough repository signals were available yet."]
  };

  const lowConfidence =
    classification.repoClass === "insufficient_evidence" ||
    classification.repoClass === "notebook_repo" ||
    classification.repoClass === "infra_only" ||
    classification.repoClass === "library_or_package" ||
    topRecommendation.confidence < 0.3 ||
    topRecommendation.score < 25;

  return {
    title: `${topRecommendation.platform} deployment plan`,
    summary: lowConfidence
      ? `Shipd does not yet have enough deployment evidence to make a strong platform call for this repository. Repo class: ${classification.repoClass.replaceAll("_", " ")}. ${topRecommendation.platform} is only a tentative placeholder based on weak signals.`
      : `${topRecommendation.platform} is currently the best fit for this repository${
          archetypes[0] && archetypes[0].confidence >= 0.55
            ? ` because Shipd matched it to the ${archetypes[0].archetype.replaceAll("_", " ")} archetype.`
            : signals?.framework && signals.framework !== "unknown"
              ? ` because Shipd detected a ${signals.framework} ${signals.primaryAppRoot ? `app rooted at ${signals.primaryAppRoot === "." ? "the repo root" : signals.primaryAppRoot}` : "application"} with a service-style deployment path.`
              : "."
        }`,
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

function normalizeRepoSignals(value: RepoSignals): RepoSignals {
  return {
    repoTopology: value.repoTopology ?? "unknown",
    workspaceRoots: normalizeStringArray(value.workspaceRoots),
    appRoots: normalizeStringArray(value.appRoots),
    primaryAppRoot: typeof value.primaryAppRoot === "string" ? value.primaryAppRoot : undefined,
    dotnetAppType: value.dotnetAppType ?? "unknown",
    framework: value.framework ?? "unknown",
    runtime: value.runtime ?? "unknown",
    hasDockerfile: Boolean(value.hasDockerfile),
    dockerfilePaths: normalizeStringArray(value.dockerfilePaths),
    hasCustomServer: Boolean(value.hasCustomServer),
    envVars: normalizeStringArray(value.envVars),
    envFilePaths: normalizeStringArray(value.envFilePaths),
    hasCiWorkflow: Boolean(value.hasCiWorkflow),
    hasBuildWorkflow: Boolean(value.hasBuildWorkflow),
    workflowFiles: normalizeStringArray(value.workflowFiles),
    detectedPlatformConfigs: normalizeStringArray(value.detectedPlatformConfigs),
    platformConfigFiles: normalizeStringArray(value.platformConfigFiles),
    infrastructureFiles: normalizeStringArray(value.infrastructureFiles),
    hasInfrastructureCode: Boolean(value.hasInfrastructureCode),
    deploymentDescriptorFiles: normalizeStringArray(value.deploymentDescriptorFiles),
    pythonProjectFiles: normalizeStringArray(value.pythonProjectFiles),
    csharpProjectFiles: normalizeStringArray(value.csharpProjectFiles),
    notebookFiles: normalizeStringArray(value.notebookFiles),
    scannedFiles: typeof value.scannedFiles === "number" ? value.scannedFiles : 0
  };
}

function normalizeClassification(value: unknown): RepoClassificationResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.repoClass !== "string" ||
    typeof candidate.confidence !== "number" ||
    !Array.isArray(candidate.reasons) ||
    !Array.isArray(candidate.blockers)
  ) {
    return null;
  }

  return {
    repoClass: candidate.repoClass as RepoClassificationResult["repoClass"],
    confidence: candidate.confidence,
    reasons: normalizeStringArray(candidate.reasons),
    blockers: normalizeStringArray(candidate.blockers)
  };
}

async function getActiveRecommendationVersionId() {
  const prisma = getPrismaClient();

  const active = await prisma.recommendationVersion.upsert({
    where: {
      label: ACTIVE_RECOMMENDATION_VERSION.label
    },
    update: {
      ...ACTIVE_RECOMMENDATION_VERSION,
      isActive: true
    },
    create: {
      ...ACTIVE_RECOMMENDATION_VERSION,
      isActive: true
    },
    select: {
      id: true,
      label: true
    }
  });

  await prisma.recommendationVersion.updateMany({
    where: {
      id: {
        not: active.id
      },
      isActive: true
    },
    data: {
      isActive: false
    }
  });

  return active;
}

function hydratePlatformRecommendation(score: PersistedPlatformScore): PlatformRecommendation {
  const explanation =
    score.explanation && typeof score.explanation === "object" && !Array.isArray(score.explanation)
      ? (score.explanation as Record<string, unknown>)
      : null;
  const reasons = explanation ? normalizeStringArray(explanation.reasons) : normalizeStringArray(score.explanation);
  const matchedArchetypes = explanation ? normalizeStringArray(explanation.matchedArchetypes) : [];
  const evidence = explanation ? normalizeStringArray(explanation.evidence) : [];
  const disqualifiers = explanation ? normalizeStringArray(explanation.disqualifiers) : [];

  return {
    platform: score.platform,
    score: score.score,
    confidence: score.confidence,
    verdict: score.verdict as PlatformRecommendation["verdict"],
    reasons,
    matchedArchetypes,
    evidence,
    disqualifiers
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
  const { signals, findings, evidence } = scanRepositoryFiles(files);
  const classification = classifyRepository(signals);
  const archetypes = matchArchetypes({ signals, classification, evidence });
  const recommendations = scorePlatforms({ signals, classification, evidence, archetypes });
  const plan = createPlanFromSnapshot(findings, recommendations, classification, archetypes, signals);

  return {
    repoId,
    signals,
    evidence,
    classification,
    archetypes,
    findings,
    recommendations,
    plan,
    recommendationVersion: ACTIVE_RECOMMENDATION_VERSION.label
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
        recommendationVersion: {
          select: {
            label: true
          }
        },
        findings: {
          orderBy: {
            createdAt: "asc"
          }
        },
        evidence: {
          orderBy: {
            createdAt: "asc"
          }
        },
        classification: true,
        archetypes: {
          orderBy: {
            rank: "asc"
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

  const normalizedSignals = normalizeRepoSignals(scan.summaryJson);

  const recommendations = scan.platformScores.map(hydratePlatformRecommendation);
  const classification =
    normalizeClassification(
      scan.classification
        ? {
            repoClass: scan.classification.repoClass,
            confidence: scan.classification.confidence,
            reasons: scan.classification.reasonsJson,
            blockers: scan.classification.blockersJson
          }
        : null
    ) ?? classifyRepository(normalizedSignals);
  const archetypes =
    scan.archetypes.length > 0
      ? scan.archetypes.map((match) => ({
          archetype: match.archetype,
          rank: match.rank,
          confidence: match.confidence,
          reasons: normalizeStringArray(match.reasonsJson),
          disqualifiers: normalizeStringArray(match.disqualifiersJson)
        }))
      : matchArchetypes({
          signals: normalizedSignals,
          classification,
          evidence:
            scan.evidence.length > 0
              ? scan.evidence.map((item) => ({
                  kind: item.kind as EvidenceRecord["kind"],
                  value: item.value,
                  sourceFile: item.sourceFile,
                  sourceLine: item.sourceLine ?? undefined,
                  confidence: item.confidence,
                  metadata:
                    item.metadataJson && typeof item.metadataJson === "object" && !Array.isArray(item.metadataJson)
                      ? (item.metadataJson as unknown as Record<string, string>)
                      : undefined
                }))
              : []
        });

  const fallbackPlan = createPlanFromSnapshot(
    scan.findings.map((finding) => ({
      filePath: finding.filePath,
      severity: finding.severity as ScanFinding["severity"],
      title: finding.title,
      detail: finding.detail,
      lineNumber: finding.lineNumber ?? undefined,
      actionText: finding.actionText ?? undefined
    })),
    recommendations,
    classification,
    archetypes,
    normalizedSignals
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
    signals: normalizedSignals,
    evidence:
      scan.evidence.length > 0
        ? scan.evidence.map((item) => ({
            kind: item.kind as EvidenceRecord["kind"],
            value: item.value,
            sourceFile: item.sourceFile,
            sourceLine: item.sourceLine ?? undefined,
            confidence: item.confidence,
            metadata:
              item.metadataJson && typeof item.metadataJson === "object" && !Array.isArray(item.metadataJson)
                ? (item.metadataJson as unknown as Record<string, string>)
                : undefined
          }))
        : [],
    classification,
    archetypes,
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
    recommendationVersion: scan.recommendationVersion?.label ?? ACTIVE_RECOMMENDATION_VERSION.label,
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
  const recommendationVersion = await getActiveRecommendationVersionId();
  const persisted = await prisma.$transaction(async (tx) => {
    const scan = await tx.scan.create({
      data: {
        repositoryId: repository.id,
        recommendationVersionId: recommendationVersion.id,
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

    if (snapshot.evidence.length > 0) {
      await tx.scanEvidence.createMany({
        data: snapshot.evidence.map((record) => ({
          scanId: scan.id,
          kind: record.kind,
          value: record.value,
          sourceFile: record.sourceFile,
          sourceLine: record.sourceLine ?? null,
          confidence: record.confidence,
          metadataJson: record.metadata ? (record.metadata as unknown as Prisma.InputJsonValue) : Prisma.JsonNull
        }))
      });
    }

    await tx.repoClassification.create({
      data: {
        scanId: scan.id,
        repoClass: snapshot.classification.repoClass,
        confidence: snapshot.classification.confidence,
        reasonsJson: snapshot.classification.reasons as unknown as Prisma.InputJsonValue,
        blockersJson: snapshot.classification.blockers as unknown as Prisma.InputJsonValue
      }
    });

    if (snapshot.recommendations.length > 0) {
      await tx.platformScore.createMany({
        data: snapshot.recommendations.map((recommendation) => ({
          scanId: scan.id,
          platform: recommendation.platform,
          score: recommendation.score,
          verdict: recommendation.verdict,
          confidence: recommendation.confidence,
          explanation: {
            reasons: recommendation.reasons,
            matchedArchetypes: recommendation.matchedArchetypes,
            evidence: recommendation.evidence,
            disqualifiers: recommendation.disqualifiers
          } as Prisma.InputJsonValue
        }))
      });
    }

    if (snapshot.archetypes.length > 0) {
      await tx.archetypeMatch.createMany({
        data: snapshot.archetypes.map((archetype) => ({
          scanId: scan.id,
          archetype: archetype.archetype,
          rank: archetype.rank,
          confidence: archetype.confidence,
          reasonsJson: archetype.reasons as unknown as Prisma.InputJsonValue,
          disqualifiersJson: archetype.disqualifiers as unknown as Prisma.InputJsonValue
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
    recommendationVersion: recommendationVersion.label,
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

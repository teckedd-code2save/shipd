import type { RepoClass } from "@/lib/classification/types";
import type { PlatformRecommendation, ScoringContext } from "@/lib/scoring/types";

export interface PlatformRule {
  platform: string;
  score: (context: ScoringContext) => number;
  reasons: (context: ScoringContext) => string[];
  evidence?: (context: ScoringContext) => string[];
  disqualifiers?: (context: ScoringContext) => string[];
}

const LOW_EVIDENCE_REPO_CLASSES: RepoClass[] = [
  "insufficient_evidence",
  "notebook_repo",
  "infra_only",
  "library_or_package"
];

function deploymentEvidenceCount(context: ScoringContext) {
  const { signals, evidence } = context;
  let score = 0;

  if (signals.framework && signals.framework !== "unknown") score += 2;
  if (signals.runtime && signals.runtime !== "unknown") score += 1;
  if (signals.hasDockerfile) score += 2;
  if (signals.hasCiWorkflow) score += 1;
  if (signals.hasBuildWorkflow) score += 1;
  if (signals.envVars.length > 0) score += 1;
  if (signals.platformConfigFiles.length > 0) score += 2;
  if (signals.hasInfrastructureCode) score += 2;
  if (signals.pythonProjectFiles.length > 0) score += 1;
  if (signals.goProjectFiles.length > 0) score += 1;
  if (signals.rubyProjectFiles.length > 0) score += 1;
  if (signals.javaProjectFiles.length > 0) score += 1;
  if (signals.rustProjectFiles.length > 0) score += 1;
  if (signals.phpProjectFiles.length > 0) score += 1;
  score += Math.min(3, evidence.length / 4);

  return score;
}

function hasNotebookOnlyProfile(context: ScoringContext) {
  const { signals } = context;
  return (
    signals.notebookFiles.length > 0 &&
    signals.pythonProjectFiles.length === 0 &&
    signals.platformConfigFiles.length === 0 &&
    signals.dockerfilePaths.length === 0 &&
    signals.workflowFiles.length === 0 &&
    signals.infrastructureFiles.length === 0 &&
    signals.envFilePaths.length === 0 &&
    signals.framework === "unknown"
  );
}

function hasInsufficientEvidence(context: ScoringContext) {
  // If classification already determined a strong class, trust it over raw evidence count
  const STRONG_CLASSES = ["deployable_web_app", "service_app", "python_service", "cloudflare_worker_app"] as const;
  if (STRONG_CLASSES.includes(context.classification.repoClass as (typeof STRONG_CLASSES)[number])) {
    return false;
  }
  return LOW_EVIDENCE_REPO_CLASSES.includes(context.classification.repoClass) || deploymentEvidenceCount(context) < 2;
}

function verdictFromScore(score: number): PlatformRecommendation["verdict"] {
  if (score >= 85) return "perfect";
  if (score >= 70) return "good";
  if (score >= 55) return "viable";
  if (score >= 40) return "weak";
  return "poor";
}

function confidenceFromContext(context: ScoringContext) {
  const { classification, archetypes } = context;

  if (hasNotebookOnlyProfile(context)) {
    return 0.12;
  }

  const evidenceStrength = Math.min(1, deploymentEvidenceCount(context) / 8);
  const topArchetypeConfidence = archetypes[0]?.confidence ?? 0;
  const confidence =
    classification.confidence * 0.45 + topArchetypeConfidence * 0.35 + evidenceStrength * 0.2;

  if (LOW_EVIDENCE_REPO_CLASSES.includes(classification.repoClass)) {
    return Math.min(confidence, 0.34);
  }

  return Math.min(Math.max(confidence, 0.08), 0.95);
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function getTopArchetype(context: ScoringContext) {
  return context.archetypes[0] ?? null;
}

export function hasArchetype(context: ScoringContext, archetype: string) {
  return context.archetypes.some((match) => match.archetype === archetype && match.confidence >= 0.45);
}

export function hasRepoClass(context: ScoringContext, repoClass: RepoClass) {
  return context.classification.repoClass === repoClass;
}

export function buildRecommendation(rule: PlatformRule, context: ScoringContext): PlatformRecommendation {
  const notebookOnly = hasNotebookOnlyProfile(context);
  const insufficientEvidence = hasInsufficientEvidence(context);
  let score = Math.max(0, Math.min(100, rule.score(context)));
  let confidence = confidenceFromContext(context);
  let reasons = uniqueStrings(rule.reasons(context));
  let evidence = uniqueStrings(rule.evidence?.(context) ?? []);
  let disqualifiers = uniqueStrings(rule.disqualifiers?.(context) ?? []);
  const matchedArchetypes = context.archetypes
    .filter((match) => match.confidence >= 0.45)
    .map((match) => match.archetype)
    .slice(0, 3);

  if (notebookOnly) {
    score = Math.min(score, 10);
    confidence = Math.min(confidence, 0.12);
    reasons = [
      "Shipd only found notebook-style files here, which is not enough to infer a production deployment path.",
      ...(context.signals.notebookFiles[0]
        ? [`${context.signals.notebookFiles[0]} looks exploratory rather than deployable.`]
        : [])
    ];
  } else if (insufficientEvidence) {
    score = Math.min(score, 22);
    confidence = Math.min(confidence, 0.24);
    reasons = [
      "There is not enough deployment evidence in this repo yet to make a strong recommendation.",
      ...reasons
    ].slice(0, 3);
  }

  return {
    platform: rule.platform,
    score,
    confidence,
    verdict: verdictFromScore(score),
    reasons,
    matchedArchetypes,
    evidence,
    disqualifiers
  };
}

import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRecommendation } from "@/lib/scoring/types";

export interface PlatformRule {
  platform: string;
  score: (signals: RepoSignals) => number;
  reasons: (signals: RepoSignals) => string[];
}

function deploymentEvidenceCount(signals: RepoSignals) {
  let evidence = 0;

  if (signals.framework && signals.framework !== "unknown") evidence += 1;
  if (signals.runtime && signals.runtime !== "unknown") evidence += 1;
  if (signals.hasDockerfile) evidence += 2;
  if (signals.hasCiWorkflow) evidence += 1;
  if (signals.hasBuildWorkflow) evidence += 1;
  if (signals.envVars.length > 0) evidence += 1;
  if (signals.platformConfigFiles.length > 0) evidence += 2;
  if (signals.hasInfrastructureCode) evidence += 2;
  if (signals.pythonProjectFiles.length > 0) evidence += 1;

  return evidence;
}

function hasNotebookOnlyProfile(signals: RepoSignals) {
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

function hasInsufficientEvidence(signals: RepoSignals) {
  return deploymentEvidenceCount(signals) < 2;
}

function verdictFromScore(score: number): PlatformRecommendation["verdict"] {
  if (score >= 85) return "perfect";
  if (score >= 70) return "good";
  if (score >= 55) return "viable";
  if (score >= 40) return "weak";
  return "poor";
}

function confidenceFromSignals(signals: RepoSignals) {
  if (hasNotebookOnlyProfile(signals)) {
    return 0.12;
  }

  let confidence = 0.08;

  if (signals.framework !== "unknown") confidence += 0.15;
  if (signals.runtime !== "unknown") confidence += 0.15;
  if (signals.hasCiWorkflow) confidence += 0.1;
  if (signals.hasBuildWorkflow) confidence += 0.05;
  if (signals.envVars.length > 0) confidence += 0.1;
  if (signals.hasDockerfile) confidence += 0.1;
  if (signals.hasInfrastructureCode) confidence += 0.05;
  if (signals.platformConfigFiles.length > 0) confidence += 0.05;
  if (signals.pythonProjectFiles.length > 0) confidence += 0.08;

  return Math.min(confidence, 0.95);
}

export function buildRecommendation(rule: PlatformRule, signals: RepoSignals): PlatformRecommendation {
  const notebookOnly = hasNotebookOnlyProfile(signals);
  const insufficientEvidence = hasInsufficientEvidence(signals);
  let score = Math.max(0, Math.min(100, rule.score(signals)));
  let confidence = confidenceFromSignals(signals);
  let reasons = rule.reasons(signals);

  if (notebookOnly) {
    score = Math.min(score, 10);
    confidence = Math.min(confidence, 0.12);
    reasons = [
      "Shipd only found notebook-style files here, which is not enough to infer a production deployment path.",
      ...(signals.notebookFiles[0] ? [`${signals.notebookFiles[0]} looks exploratory rather than deployable.`] : [])
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
    reasons
  };
}

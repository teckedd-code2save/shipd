import type { RepoSignals } from "@/lib/parsing/types";
import type { PlatformRecommendation } from "@/lib/scoring/types";

export interface PlatformRule {
  platform: string;
  score: (signals: RepoSignals) => number;
  reasons: (signals: RepoSignals) => string[];
}

function verdictFromScore(score: number): PlatformRecommendation["verdict"] {
  if (score >= 85) return "perfect";
  if (score >= 70) return "good";
  if (score >= 55) return "viable";
  if (score >= 40) return "weak";
  return "poor";
}

function confidenceFromSignals(signals: RepoSignals) {
  let confidence = 0.4;

  if (signals.framework !== "unknown") confidence += 0.15;
  if (signals.runtime !== "unknown") confidence += 0.15;
  if (signals.hasCiWorkflow) confidence += 0.1;
  if (signals.envVars.length > 0) confidence += 0.1;
  if (signals.hasDockerfile) confidence += 0.1;

  return Math.min(confidence, 0.95);
}

export function buildRecommendation(rule: PlatformRule, signals: RepoSignals): PlatformRecommendation {
  const score = Math.max(0, Math.min(100, rule.score(signals)));

  return {
    platform: rule.platform,
    score,
    confidence: confidenceFromSignals(signals),
    verdict: verdictFromScore(score),
    reasons: rule.reasons(signals)
  };
}


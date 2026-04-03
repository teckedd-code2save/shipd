import type { ArchetypeMatchResult } from "@/lib/archetypes/types";
import type { RepoClassificationResult } from "@/lib/classification/types";
import type { EvidenceRecord } from "@/lib/parsing/shared";
import type { RepoSignals } from "@/lib/parsing/types";

export interface ScoringContext {
  signals: RepoSignals;
  evidence: EvidenceRecord[];
  classification: RepoClassificationResult;
  archetypes: ArchetypeMatchResult[];
}

export interface PlatformRecommendation {
  platform: string;
  score: number;
  confidence: number;
  verdict: "perfect" | "good" | "viable" | "weak" | "poor";
  reasons: string[];
  matchedArchetypes: string[];
  evidence: string[];
  disqualifiers: string[];
}

import type { RepoClassificationResult } from "@/lib/classification/types";
import type { EvidenceRecord } from "@/lib/parsing/shared";
import type { RepoSignals } from "@/lib/parsing/types";

export interface ArchetypeContext {
  signals: RepoSignals;
  classification: RepoClassificationResult;
  evidence: EvidenceRecord[];
}

export interface ArchetypeDefinition {
  id: string;
  appliesTo: RepoClassificationResult["repoClass"][];
  match: (context: ArchetypeContext) => {
    confidence: number;
    reasons: string[];
    disqualifiers: string[];
  };
}

export interface ArchetypeMatchResult {
  archetype: string;
  rank: number;
  confidence: number;
  reasons: string[];
  disqualifiers: string[];
}

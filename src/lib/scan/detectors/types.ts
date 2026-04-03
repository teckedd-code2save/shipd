import type { EvidenceRecord, RepositoryFileMap, ScanFinding } from "@/lib/parsing/shared";
import type { RepoSignals } from "@/lib/parsing/types";

export interface DetectorInput {
  filePath: string;
  content: string;
  files: RepositoryFileMap;
}

export interface DetectorResult {
  signals?: Partial<RepoSignals>;
  evidence?: EvidenceRecord[];
  findings?: ScanFinding[];
}

export interface ScanDetector {
  id: string;
  phase: "early-evidence";
  supports: (filePath: string) => boolean;
  run: (input: DetectorInput) => DetectorResult;
}

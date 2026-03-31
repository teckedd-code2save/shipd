export interface ScanFinding {
  filePath: string;
  severity: "blocker" | "warning" | "info" | "ok";
  title: string;
  detail: string;
  lineNumber?: number;
  actionText?: string;
}

export interface RepositoryFileMap {
  [filePath: string]: string;
}


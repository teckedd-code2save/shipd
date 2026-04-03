export interface ScanFinding {
  filePath: string;
  severity: "blocker" | "warning" | "info" | "ok";
  title: string;
  detail: string;
  lineNumber?: number;
  actionText?: string;
}

export interface EvidenceRecord {
  kind:
    | "framework"
    | "runtime"
    | "entrypoint"
    | "docker"
    | "workflow"
    | "env_var"
    | "database"
    | "cache"
    | "storage"
    | "orm"
    | "platform_config"
    | "iac"
    | "notebook"
    | "package_type"
    | "workspace_root"
    | "app_root";
  value: string;
  sourceFile: string;
  sourceLine?: number;
  confidence: number;
  metadata?: Record<string, string>;
}

export interface RepositoryFileMap {
  [filePath: string]: string;
}

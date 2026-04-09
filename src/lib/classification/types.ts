export type RepoClass =
  | "deployable_web_app"
  | "static_site"
  | "service_app"
  | "python_service"
  | "mobile_app"
  | "cloudflare_worker_app"
  | "library_or_package"
  | "notebook_repo"
  | "infra_only"
  | "cli_tool"
  | "insufficient_evidence";

export interface RepoClassificationResult {
  repoClass: RepoClass;
  confidence: number;
  reasons: string[];
  blockers: string[];
}

export type RepoClass =
  | "deployable_web_app"
  | "static_site"
  | "service_app"
  | "python_service"
  | "cloudflare_worker_app"
  | "library_or_package"
  | "notebook_repo"
  | "infra_only"
  | "insufficient_evidence";

export interface RepoClassificationResult {
  repoClass: RepoClass;
  confidence: number;
  reasons: string[];
  blockers: string[];
}

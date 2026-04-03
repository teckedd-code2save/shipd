export function formatArchetypeLabel(value: string) {
  const labels: Record<string, string> = {
    dotnet_service_app: ".NET service app",
    nextjs_standard_app: "Next.js standard app",
    nextjs_custom_server_app: "Next.js custom server app",
    express_postgres_service: "Express + Postgres service",
    python_service_app: "Python service app",
    dockerized_service: "Dockerized service",
    notebook_repo: "Notebook repo",
    infra_only_repo: "Infra-only repo",
    cloudflare_worker_app: "Cloudflare worker app",
    library_package: "Library package",
    unknown_low_evidence: "Low-evidence repo"
  };

  return labels[value] ?? value.replaceAll("_", " ");
}

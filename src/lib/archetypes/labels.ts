export function formatArchetypeLabel(value: string) {
  const labels: Record<string, string> = {
    dotnet_service_app: ".NET service",
    nextjs_standard_app: "Next.js app",
    nextjs_custom_server_app: "Next.js + custom server",
    express_postgres_service: "Node.js + database service",
    python_service_app: "Python web service",
    dockerized_service: "Container-based app",
    notebook_repo: "Data science notebooks",
    infra_only_repo: "Infrastructure code",
    cloudflare_worker_app: "Cloudflare Worker",
    library_package: "Library / package",
    unknown_low_evidence: "Pattern unclear"
  };

  return labels[value] ?? value.replaceAll("_", " ");
}

export function formatRepoClassLabel(value: string) {
  const labels: Record<string, string> = {
    deployable_web_app: "Web app",
    static_site: "Static site",
    service_app: "Backend service",
    python_service: "Python service",
    mobile_app: "Mobile app",
    cloudflare_worker_app: "Cloudflare Worker",
    library_or_package: "Library / package",
    notebook_repo: "Data notebooks",
    infra_only: "Infrastructure only",
    cli_tool: "CLI tool",
    insufficient_evidence: "Not enough info yet"
  };

  return labels[value] ?? value.replaceAll("_", " ");
}

export function formatConfidenceLabel(confidence: number) {
  if (confidence >= 0.82) return "Strong signals";
  if (confidence >= 0.62) return "Good confidence";
  if (confidence >= 0.42) return "Some signals found";
  return "Limited signals";
}

export function formatTopologyLabel(value: string) {
  const labels: Record<string, string> = {
    single_app: "Single app",
    monorepo: "Monorepo",
    dotnet_solution: ".NET solution",
    infra_only: "Infrastructure only",
    unknown: "Unknown structure"
  };

  return labels[value] ?? value.replaceAll("_", " ");
}

export function formatVerdictLabel(value: string) {
  const labels: Record<string, string> = {
    perfect: "Excellent fit",
    good: "Good fit",
    viable: "Can work",
    weak: "Limited fit",
    poor: "Not recommended"
  };

  return labels[value] ?? value;
}

export function formatSeverityLabel(value: string) {
  const labels: Record<string, string> = {
    blocker: "Blocking issue",
    warning: "Worth addressing",
    info: "Note",
    ok: "Looks good"
  };

  return labels[value] ?? value;
}

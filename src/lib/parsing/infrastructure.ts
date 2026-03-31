import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

function classifyInfraFile(filePath: string) {
  if (filePath.endsWith(".tf") || filePath.endsWith(".tfvars")) {
    return "Terraform infrastructure detected";
  }

  if (filePath.includes("k8s/") || filePath.includes("kubernetes/") || filePath.includes("helm/")) {
    return "Cluster deployment manifests detected";
  }

  if (filePath.endsWith("docker-compose.yml") || filePath.endsWith("docker-compose.yaml") || filePath.endsWith("compose.yml") || filePath.endsWith("compose.yaml")) {
    return "Compose deployment descriptor detected";
  }

  return "Infrastructure-related file detected";
}

export function parseInfrastructureFile(filePath: string) {
  const title = classifyInfraFile(filePath);

  return {
    signals: {
      hasInfrastructureCode: true,
      infrastructureFiles: [filePath],
      deploymentDescriptorFiles:
        filePath.endsWith(".yml") || filePath.endsWith(".yaml") || filePath.endsWith(".tf") || filePath.endsWith(".tfvars")
          ? [filePath]
          : []
    } satisfies Partial<RepoSignals>,
    findings: [
      {
        filePath,
        severity: "info",
        title,
        detail: `${filePath} may influence how much platform-side automation Shipd can recommend.`
      }
    ] satisfies ScanFinding[]
  };
}

export interface RepoSignals {
  framework?: "nextjs" | "express" | "react" | "unknown";
  runtime?: "node18" | "node20" | "bun" | "unknown";
  hasDockerfile: boolean;
  dockerfilePaths: string[];
  hasCustomServer: boolean;
  envVars: string[];
  envFilePaths: string[];
  hasCiWorkflow: boolean;
  hasBuildWorkflow: boolean;
  workflowFiles: string[];
  detectedPlatformConfigs: string[];
  platformConfigFiles: string[];
  infrastructureFiles: string[];
  hasInfrastructureCode: boolean;
  deploymentDescriptorFiles: string[];
}

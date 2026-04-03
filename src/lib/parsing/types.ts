export interface RepoSignals {
  repoTopology?: "single_app" | "monorepo" | "infra_only" | "unknown";
  workspaceRoots: string[];
  appRoots: string[];
  primaryAppRoot?: string;
  dotnetAppType?: "web" | "generic" | "unknown";
  framework?: "nextjs" | "express" | "react" | "python" | "csharp" | "unknown";
  runtime?: "node18" | "node20" | "bun" | "python" | "dotnet" | "unknown";
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
  pythonProjectFiles: string[];
  csharpProjectFiles: string[];
  notebookFiles: string[];
  scannedFiles: number;
}

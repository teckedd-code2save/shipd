export interface RepoSignals {
  framework?: "nextjs" | "express" | "react" | "unknown";
  runtime?: "node18" | "node20" | "bun" | "unknown";
  hasDockerfile: boolean;
  hasCustomServer: boolean;
  envVars: string[];
  hasCiWorkflow: boolean;
  detectedPlatformConfigs: string[];
}


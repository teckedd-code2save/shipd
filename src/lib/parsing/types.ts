export interface RepoSignals {
  repoTopology?: "single_app" | "monorepo" | "dotnet_solution" | "infra_only" | "unknown";
  workspaceRoots: string[];
  appRoots: string[];
  primaryAppRoot?: string;
  dotnetAppType?: "web" | "generic" | "unknown";
  framework?:
    | "nextjs"
    | "sveltekit"
    | "nuxt"
    | "remix"
    | "astro"
    | "express"
    | "react"
    | "python"
    | "csharp"
    | "go"
    | "rust"
    | "ruby"
    | "java"
    | "php"
    | "unknown";
  runtime?:
    | "node18"
    | "node20"
    | "bun"
    | "python"
    | "dotnet"
    | "go"
    | "rust"
    | "ruby"
    | "java"
    | "php"
    | "unknown";
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
  goProjectFiles: string[];
  rubyProjectFiles: string[];
  javaProjectFiles: string[];
  rustProjectFiles: string[];
  phpProjectFiles: string[];
  orm?: "prisma" | "drizzle" | "typeorm" | "sequelize" | "mongoose"
      | "sqlalchemy" | "django"
      | "activerecord"
      | "gorm"
      | "hibernate" | "jpa"
      | "efcore"
      | "eloquent";
  hasMigrations: boolean;
  notebookFiles: string[];
  scannedFiles: number;
}

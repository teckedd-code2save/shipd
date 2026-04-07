import { z } from "zod";

export const repoExtractionSchema = z.object({
  signals: z.object({
    repoTopology: z.enum(["single_app", "monorepo", "dotnet_solution", "infra_only", "unknown"]),
    workspaceRoots: z.array(z.string()),
    appRoots: z.array(z.string()),
    primaryAppRoot: z.string().optional(),
    dotnetAppType: z.enum(["web", "generic", "unknown"]),
    framework: z.enum([
      "nextjs", "sveltekit", "nuxt", "remix", "astro",
      "express", "react", "python", "csharp",
      "go", "rust", "ruby", "java", "php", "unknown"
    ]),
    runtime: z.enum([
      "node18", "node20", "bun",
      "python", "dotnet",
      "go", "rust", "ruby", "java", "php",
      "unknown"
    ]),
    hasDockerfile: z.boolean(),
    dockerfilePaths: z.array(z.string()),
    hasCustomServer: z.boolean(),
    envVars: z.array(z.string()),
    envFilePaths: z.array(z.string()),
    hasCiWorkflow: z.boolean(),
    hasBuildWorkflow: z.boolean(),
    workflowFiles: z.array(z.string()),
    detectedPlatformConfigs: z.array(z.string()),
    platformConfigFiles: z.array(z.string()),
    infrastructureFiles: z.array(z.string()),
    hasInfrastructureCode: z.boolean(),
    deploymentDescriptorFiles: z.array(z.string()),
    pythonProjectFiles: z.array(z.string()),
    csharpProjectFiles: z.array(z.string()),
    goProjectFiles: z.array(z.string()),
    rubyProjectFiles: z.array(z.string()).default([]),
    javaProjectFiles: z.array(z.string()).default([]),
    rustProjectFiles: z.array(z.string()).default([]),
    phpProjectFiles: z.array(z.string()).default([]),
    orm: z.enum([
      "prisma", "drizzle", "typeorm", "sequelize", "mongoose",
      "sqlalchemy", "django",
      "activerecord",
      "gorm",
      "hibernate", "jpa",
      "efcore",
      "eloquent"
    ]).optional(),
    hasMigrations: z.boolean().default(false),
    notebookFiles: z.array(z.string()),
    scannedFiles: z.number().int().min(0)
  }),
  classification: z.object({
    repoClass: z.enum([
      "deployable_web_app",
      "static_site",
      "service_app",
      "python_service",
      "cloudflare_worker_app",
      "library_or_package",
      "notebook_repo",
      "infra_only",
      "cli_tool",
      "insufficient_evidence"
    ]),
    confidence: z.number().min(0).max(1),
    reasons: z.array(z.string()),
    blockers: z.array(z.string())
  }),
  archetypes: z.array(
    z.object({
      archetype: z.string(),
      rank: z.number().int().min(1),
      confidence: z.number().min(0).max(1),
      reasons: z.array(z.string()),
      disqualifiers: z.array(z.string())
    })
  ),
  findings: z.array(
    z.object({
      filePath: z.string(),
      severity: z.enum(["blocker", "warning", "info", "ok"]),
      title: z.string(),
      detail: z.string(),
      actionText: z.string().optional()
    })
  ),
  evidence: z.array(
    z.object({
      kind: z.enum([
        "framework",
        "runtime",
        "entrypoint",
        "docker",
        "workflow",
        "env_var",
        "database",
        "cache",
        "storage",
        "orm",
        "platform_config",
        "iac",
        "notebook",
        "package_type",
        "workspace_root",
        "app_root"
      ]),
      value: z.string(),
      sourceFile: z.string(),
      confidence: z.number().min(0).max(1)
    })
  )
});

export type RepoExtraction = z.infer<typeof repoExtractionSchema>;

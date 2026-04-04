import { z } from "zod";

export const deploymentStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  commands: z.array(z.string()).optional(),
  notes: z.string().optional(),
  category: z.enum(["setup", "config", "deploy", "verify"])
});

export const deploymentPlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  topPlatform: z.string(),
  score: z.number().int().min(0).max(100),
  confidence: z.number().min(0).max(1),
  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  steps: z.array(deploymentStepSchema)
});

export type DeploymentStep = z.infer<typeof deploymentStepSchema>;
export type DeploymentPlanObject = z.infer<typeof deploymentPlanSchema>;

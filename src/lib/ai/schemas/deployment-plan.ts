import { z } from "zod";

export const deploymentPlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  topPlatform: z.string(),
  score: z.number().int().min(0).max(100),
  confidence: z.number().min(0).max(1),
  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  nextSteps: z.array(z.string())
});

export type DeploymentPlanObject = z.infer<typeof deploymentPlanSchema>;


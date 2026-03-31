import { runChatOrchestration } from "@/lib/ai/orchestrator";

import { buildDeploymentPlan } from "@/server/services/plan-service";

export async function handleChat(repoId: string, message: string) {
  const plan = await buildDeploymentPlan(repoId);
  const orchestration = await runChatOrchestration({ repoId, message });

  return {
    ...orchestration,
    plan
  };
}


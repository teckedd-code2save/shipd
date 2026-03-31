import { deploymentPlanSchema, type DeploymentPlanObject } from "@/lib/ai/schemas/deployment-plan";
import { getProviderAdapter } from "@/lib/ai/registry";
import { resolveProviderForTask, resolveTaskType } from "@/lib/ai/router";
import type { ChatMessageInput } from "@/lib/ai/types";

export async function runChatOrchestration(input: ChatMessageInput) {
  const task = resolveTaskType(input.message);
  const provider = resolveProviderForTask(task);
  const adapter = getProviderAdapter(provider);

  const object = await adapter.generateObject<DeploymentPlanObject>({
    provider,
    schema: deploymentPlanSchema,
    system: "You are Shipd, a deployment decision layer.",
    prompt: input.message,
    parse: (value) => deploymentPlanSchema.parse(value)
  });

  const explanation = await adapter.streamText({
    provider,
    system: "Explain deployment recommendations using structured results only.",
    prompt: input.message
  });

  return {
    task,
    provider,
    object,
    message: await explanation.toText()
  };
}


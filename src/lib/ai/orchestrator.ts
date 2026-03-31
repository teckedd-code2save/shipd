import { deploymentPlanSchema, type DeploymentPlanObject } from "@/lib/ai/schemas/deployment-plan";
import { getProviderAdapter } from "@/lib/ai/registry";
import { resolveProviderForTask, resolveTaskType } from "@/lib/ai/router";
import type { ChatMessageInput } from "@/lib/ai/types";

export async function runChatOrchestration(input: ChatMessageInput) {
  const task = resolveTaskType(input.message);
  const provider = resolveProviderForTask(task);
  const adapter = getProviderAdapter(provider);
  const prompt = input.context
    ? `${input.context}\n\nUser request: ${input.message}`
    : input.message;

  const object = await adapter.generateObject<DeploymentPlanObject>({
    provider,
    schema: deploymentPlanSchema,
    system:
      "You are Shipd, a neutral deployment planning tool. Ground every answer in the provided repository context. Do not invent files, configs, or hosting capabilities.",
    prompt,
    parse: (value) => deploymentPlanSchema.parse(value)
  });

  const explanation = await adapter.streamText({
    provider,
    system:
      "You are Shipd. Answer briefly and concretely using only the repository context and structured planning results you were given. Be specific about tradeoffs, blockers, and platform fit.",
    prompt: `${prompt}\n\nStructured plan:\n${JSON.stringify(object)}`
  });

  return {
    task,
    provider,
    object,
    message: await explanation.toText()
  };
}

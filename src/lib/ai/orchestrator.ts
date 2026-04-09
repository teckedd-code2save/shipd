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

  let object: DeploymentPlanObject | null = null;

  const structuredSystem = `You are Shipd, a neutral deployment planning tool. Ground every answer in the provided repository context. Do not invent files, configs, or hosting capabilities.

When generating a deployment plan, produce a "steps" array with 4–8 concrete, ordered steps. Each step must have:
- category: one of "setup" | "config" | "deploy" | "verify"
- title: a short action phrase (e.g. "Install the Fly CLI")
- description: one or two sentences explaining what to do and why
- commands: optional array of exact shell commands the user should run
- notes: optional single sentence flagging a gotcha, alternative, or link context

Steps should follow the order: setup → config → deploy → verify. Be specific to the detected platform and framework.`;

  const guidanceAwareSystem = `${structuredSystem}

If context includes "Plan mode: guidance_plan", do not recommend any platform as "best".
For guidance mode:
- use "Guidance" as topPlatform in structured output
- keep guidance neutral and repo-type-specific
- focus on productionization steps, not provider-specific deployment commands`;

  try {
    object = await adapter.generateObject<DeploymentPlanObject>({
      provider,
      schema: deploymentPlanSchema,
      system: guidanceAwareSystem,
      prompt,
      parse: (value) => deploymentPlanSchema.parse(value)
    });
  } catch {
    object = null;
  }

  const explanation = await adapter.streamText({
    provider,
    system:
      "You are Shipd. Answer briefly and concretely using only the repository context and structured planning results you were given. Be specific about tradeoffs, blockers, and platform fit.",
    prompt: `${prompt}\n\nStructured plan:\n${JSON.stringify(object ?? { note: "Structured output unavailable for this request." })}`
  });

  return {
    task,
    provider,
    object,
    message: await explanation.toText()
  };
}

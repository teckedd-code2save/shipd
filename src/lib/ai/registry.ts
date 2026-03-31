import { AnthropicAdapter } from "@/lib/ai/adapters/anthropic";
import { OpenAIAdapter } from "@/lib/ai/adapters/openai";
import type { ModelAdapter, ProviderName } from "@/lib/ai/types";

const registry = new Map<ProviderName, ModelAdapter>([
  ["openai", new OpenAIAdapter()],
  ["anthropic", new AnthropicAdapter()]
]);

export function getProviderAdapter(provider: ProviderName): ModelAdapter {
  const adapter = registry.get(provider);

  if (!adapter) {
    throw new Error(`Provider ${provider} is not registered.`);
  }

  return adapter;
}


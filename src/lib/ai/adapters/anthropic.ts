import type { ModelAdapter, ModelObjectRequest, ModelTextRequest, StreamHandle } from "@/lib/ai/types";

class TextStreamHandle implements StreamHandle {
  constructor(private readonly text: string) {}

  async toText() {
    return this.text;
  }
}

export class AnthropicAdapter implements ModelAdapter {
  name = "anthropic" as const;
  supportsStreaming = true;
  supportsStructuredOutputs = true;

  async generateObject<T>(input: ModelObjectRequest<T>) {
    if (!input.parse) {
      throw new Error("AnthropicAdapter requires a parser for structured outputs.");
    }

    return input.parse({
      title: "Fallback deployment plan",
      summary: "Anthropic fallback adapter scaffolded.",
      topPlatform: "Railway",
      score: 0,
      confidence: 0,
      blockers: [],
      warnings: [],
      nextSteps: []
    });
  }

  async streamText(input: ModelTextRequest) {
    return new TextStreamHandle(
      `Provider ${this.name} is available as a fallback chat provider. Prompt received: ${input.prompt}`
    );
  }
}


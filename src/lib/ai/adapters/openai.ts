import type { ModelAdapter, ModelObjectRequest, ModelTextRequest, StreamHandle } from "@/lib/ai/types";

class TextStreamHandle implements StreamHandle {
  constructor(private readonly text: string) {}

  async toText() {
    return this.text;
  }
}

export class OpenAIAdapter implements ModelAdapter {
  name = "openai" as const;
  supportsStreaming = true;
  supportsStructuredOutputs = true;

  async generateObject<T>(input: ModelObjectRequest<T>) {
    if (!input.parse) {
      throw new Error("OpenAIAdapter requires a parser for structured outputs.");
    }

    return input.parse({
      title: "Generated deployment plan",
      summary: "Structured generation is scaffolded and ready for provider wiring.",
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
      `Provider ${this.name} is configured as the primary chat provider. Prompt received: ${input.prompt}`
    );
  }
}


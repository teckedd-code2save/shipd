import { env } from "@/lib/env";
import type { ModelAdapter, ModelObjectRequest, ModelTextRequest, StreamHandle } from "@/lib/ai/types";

class TextStreamHandle implements StreamHandle {
  constructor(private readonly text: string) {}

  async toText() {
    return this.text;
  }
}

interface OpenAIResponsesApiResponse {
  output_text?: string;
}

async function createOpenAIResponse(input: {
  system: string;
  prompt: string;
  json?: boolean;
}) {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required to use the OpenAI provider.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: input.system }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: input.prompt }]
        }
      ],
      ...(input.json
        ? {
            text: {
              format: {
                type: "json_object"
              }
            }
          }
        : {})
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as OpenAIResponsesApiResponse;
}

export class OpenAIAdapter implements ModelAdapter {
  name = "openai" as const;
  supportsStreaming = true;
  supportsStructuredOutputs = true;

  async generateObject<T>(input: ModelObjectRequest<T>) {
    const response = await createOpenAIResponse({
      system: `${input.system}\nRespond with JSON only.`,
      prompt: input.prompt,
      json: true
    });

    const raw = response.output_text;

    if (!raw) {
      throw new Error("OpenAI returned no structured output.");
    }

    const parsed = JSON.parse(raw);
    return input.parse ? input.parse(parsed) : (parsed as T);
  }

  async streamText(input: ModelTextRequest) {
    const response = await createOpenAIResponse({
      system: input.system,
      prompt: input.prompt
    });

    if (!response.output_text) {
      throw new Error("OpenAI returned no text output.");
    }

    return new TextStreamHandle(response.output_text);
  }
}

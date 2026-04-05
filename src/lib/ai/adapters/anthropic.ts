import { env } from "@/lib/env";
import type { ModelAdapter, ModelObjectRequest, ModelTextRequest, StreamHandle } from "@/lib/ai/types";

class TextStreamHandle implements StreamHandle {
  constructor(private readonly text: string) {}

  async toText() {
    return this.text;
  }
}

interface AnthropicMessageResponse {
  content?: Array<{
    type: string;
    text?: string;
  }>;
}

async function createAnthropicMessage(input: {
  system: string;
  prompt: string;
  json?: boolean;
}) {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required to use the Anthropic provider.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: input.json ? `${input.system}\nReturn JSON only.` : input.system,
      messages: [
        {
          role: "user",
          content: input.prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic request failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as AnthropicMessageResponse;
}

function stripMarkdownFences(text: string) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function getAnthropicText(response: AnthropicMessageResponse) {
  const raw = response.content
    ?.filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
  return raw ? stripMarkdownFences(raw) : raw;
}

export class AnthropicAdapter implements ModelAdapter {
  name = "anthropic" as const;
  supportsStreaming = true;
  supportsStructuredOutputs = true;

  async generateObject<T>(input: ModelObjectRequest<T>) {
    const response = await createAnthropicMessage({
      system: input.system,
      prompt: input.prompt,
      json: true
    });

    const raw = getAnthropicText(response);

    if (!raw) {
      throw new Error("Anthropic returned no structured output.");
    }

    const parsed = JSON.parse(raw);
    return input.parse ? input.parse(parsed) : (parsed as T);
  }

  async streamText(input: ModelTextRequest) {
    const response = await createAnthropicMessage({
      system: input.system,
      prompt: input.prompt
    });

    const text = getAnthropicText(response);

    if (!text) {
      throw new Error("Anthropic returned no text output.");
    }

    return new TextStreamHandle(text);
  }
}

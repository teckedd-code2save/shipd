export type ProviderName = "openai" | "anthropic";

export type ChatTaskType =
  | "recommend_platforms"
  | "score_specific_platform"
  | "summarize_scan"
  | "answer_follow_up_question"
  | "generate_export_summary";

export interface ModelObjectRequest<T> {
  system: string;
  prompt: string;
  schema: unknown;
  provider: ProviderName;
  metadata?: Record<string, string>;
  fallback?: ProviderName;
  parse?: (value: unknown) => T;
}

export interface ModelTextRequest {
  system: string;
  prompt: string;
  provider: ProviderName;
  metadata?: Record<string, string>;
}

export interface StreamHandle {
  toText(): Promise<string>;
}

export interface ModelAdapter {
  name: ProviderName;
  supportsStreaming: boolean;
  supportsStructuredOutputs: boolean;
  generateObject<T>(input: ModelObjectRequest<T>): Promise<T>;
  streamText(input: ModelTextRequest): Promise<StreamHandle>;
}

export interface ChatMessageInput {
  repoId: string;
  message: string;
  context?: string;
}

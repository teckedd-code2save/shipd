import { env } from "@/lib/env";
import type { ChatTaskType, ProviderName } from "@/lib/ai/types";

export function resolveTaskType(message: string): ChatTaskType {
  const lowered = message.toLowerCase();

  if (lowered.includes("where should i deploy") || lowered.includes("recommend")) {
    return "recommend_platforms";
  }

  if (lowered.includes("vercel") || lowered.includes("railway") || lowered.includes("fly")) {
    return "score_specific_platform";
  }

  return "answer_follow_up_question";
}

export function resolveProviderForTask(_task: ChatTaskType): ProviderName {
  return env.AI_PROVIDER;
}


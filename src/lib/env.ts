import "@/config/load-env";

import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  ELEVENLABS_MODEL: z.string().optional(),
  VOICE_ENABLED: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  ANTHROPIC_MODEL: z.string().default("claude-3-5-sonnet-latest"),
  AI_PROVIDER: z.enum(["openai", "anthropic"]).default("openai")
});

const parsed = envSchema.parse(process.env);

export const env = parsed;

export function hasAuthEnv() {
  return Boolean(env.AUTH_SECRET && env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET);
}

export function hasDatabaseEnv() {
  return Boolean(env.DATABASE_URL);
}

export function isVoiceEnabled() {
  return (
    env.VOICE_ENABLED === "true" &&
    Boolean(env.ELEVENLABS_API_KEY) &&
    Boolean(env.ELEVENLABS_VOICE_ID)
  );
}

import { createHash } from "node:crypto";

import type { DeploymentPlanSnapshot } from "@/server/services/analysis-service";
import { env, isVoiceEnabled } from "@/lib/env";

const DEFAULT_ELEVENLABS_MODEL = "eleven_turbo_v2_5";
const CACHE_TTL_MS = 1000 * 60 * 60;
const MAX_SUMMARY_LENGTH = 1200;
const ELEVEN_TIMEOUT_MS = 15000;
const voiceCache = new Map<string, { createdAt: number; audio: Buffer; contentType: string }>();

export class VoiceSynthesisError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "VoiceSynthesisError";
  }
}

function buildGuidanceTrackSummary(plan: DeploymentPlanSnapshot, maxTracks = 3) {
  const tracks = (plan.guidanceTracks ?? []).slice(0, maxTracks);
  if (tracks.length === 0) {
    return "No guidance tracks are available yet.";
  }

  return tracks
    .map((track, index) => {
      const actions = track.actions.slice(0, 2).join(". ");
      return `Track ${index + 1}: ${track.title}. ${track.description}. ${actions}`;
    })
    .join(" ");
}

function buildPlatformSummary(plan: DeploymentPlanSnapshot, maxSteps = 4) {
  const steps = plan.nextSteps.slice(0, maxSteps);
  if (steps.length === 0) {
    return "No deployment steps were generated yet.";
  }
  return steps.map((step, index) => `Step ${index + 1}: ${step}.`).join(" ");
}

export function buildPlanVoiceSummary(plan: DeploymentPlanSnapshot) {
  const intro = `${plan.title}. ${plan.summary}`;
  const text = plan.planMode === "guidance_plan"
    ? `${intro} ${buildGuidanceTrackSummary(plan)}`
    : `${intro} ${buildPlatformSummary(plan)}`;

  if (text.length <= MAX_SUMMARY_LENGTH) return text;
  return `${text.slice(0, MAX_SUMMARY_LENGTH - 3)}...`;
}

function resolveModelCandidates() {
  const preferred = env.ELEVENLABS_MODEL?.trim() || DEFAULT_ELEVENLABS_MODEL;
  return Array.from(new Set([preferred, "eleven_multilingual_v2"]));
}

async function callElevenLabs(text: string, modelId: string) {
  const voiceId = env.ELEVENLABS_VOICE_ID?.trim();
  const apiKey = env.ELEVENLABS_API_KEY?.trim();

  if (!voiceId || !apiKey) {
    throw new VoiceSynthesisError("Missing ElevenLabs voice configuration.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ELEVEN_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128&optimize_streaming_latency=1`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg"
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75
          }
        }),
        signal: controller.signal
      }
    );

    if (!response.ok) {
      const bodyText = await response.text();
      const trimmed = bodyText.slice(0, 240).replaceAll("\n", " ").trim();
      throw new VoiceSynthesisError(
        `ElevenLabs request failed (${response.status})${trimmed ? `: ${trimmed}` : ""}`,
        response.status
      );
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "audio/mpeg";
    return { audioBuffer, contentType };
  } catch (error) {
    if (error instanceof VoiceSynthesisError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new VoiceSynthesisError("ElevenLabs request timed out.");
    }
    throw new VoiceSynthesisError(error instanceof Error ? error.message : "Unknown ElevenLabs error.");
  } finally {
    clearTimeout(timeout);
  }
}

function buildCacheKey(text: string) {
  const voiceId = env.ELEVENLABS_VOICE_ID ?? "unknown";
  return createHash("sha256").update(`${voiceId}:${text}`).digest("hex");
}

function getCachedAudio(cacheKey: string) {
  const cached = voiceCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    voiceCache.delete(cacheKey);
    return null;
  }
  return cached;
}

export async function synthesizeVoiceSummary(text: string) {
  if (!isVoiceEnabled()) return null;

  const cacheKey = buildCacheKey(text);
  const cached = getCachedAudio(cacheKey);
  if (cached) return cached;

  let lastError: VoiceSynthesisError | null = null;
  let audioBuffer: Buffer | null = null;
  let contentType = "audio/mpeg";

  for (const modelId of resolveModelCandidates()) {
    try {
      const result = await callElevenLabs(text, modelId);
      audioBuffer = result.audioBuffer;
      contentType = result.contentType;
      break;
    } catch (error) {
      if (error instanceof VoiceSynthesisError) {
        lastError = error;
        if (error.status === 401 || error.status === 403) break;
        continue;
      }
      lastError = new VoiceSynthesisError("Unexpected voice synthesis error.");
    }
  }

  if (!audioBuffer) {
    throw lastError ?? new VoiceSynthesisError("Voice synthesis failed.");
  }

  const payload = {
    createdAt: Date.now(),
    audio: audioBuffer,
    contentType
  };
  voiceCache.set(cacheKey, payload);
  return payload;
}

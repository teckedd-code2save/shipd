import { NextResponse } from "next/server";

import { isVoiceEnabled } from "@/lib/env";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";
import { buildPlanVoiceSummary, synthesizeVoiceSummary, VoiceSynthesisError } from "@/server/services/voice-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get("repoId");

  if (!repoId) {
    return NextResponse.json({ error: "repoId is required" }, { status: 400 });
  }

  if (!isVoiceEnabled()) {
    return new Response(null, { status: 204 });
  }

  try {
    const analysis = await getRepositoryAnalysis(repoId);
    const text = buildPlanVoiceSummary(analysis.plan);
    const audioPayload = await synthesizeVoiceSummary(text);

    if (!audioPayload) {
      return new Response(null, { status: 204 });
    }

    return new Response(new Uint8Array(audioPayload.audio), {
      status: 200,
      headers: {
        "Content-Type": audioPayload.contentType,
        "Cache-Control": "private, max-age=3600"
      }
    });
  } catch (error) {
    if (error instanceof VoiceSynthesisError) {
      return NextResponse.json(
        { error: "Voice summary failed", details: error.message },
        { status: error.status && error.status >= 400 && error.status < 600 ? error.status : 502 }
      );
    }

    return NextResponse.json(
      { error: "Voice summary failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 }
    );
  }
}

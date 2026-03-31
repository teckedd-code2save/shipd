import { NextResponse } from "next/server";
import { z } from "zod";

import { handleChat } from "@/server/services/chat-service";

const requestSchema = z.object({
  repoId: z.string().min(1),
  message: z.string().min(1)
});

export async function POST(request: Request) {
  const body = await request.json();
  const input = requestSchema.parse(body);
  const result = await handleChat(input.repoId, input.message);

  return NextResponse.json(result);
}

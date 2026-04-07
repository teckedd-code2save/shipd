import { NextResponse } from "next/server";
import { z } from "zod";

import { getPrismaClient } from "@/lib/db/prisma";
import { handleChat } from "@/server/services/chat-service";

const requestSchema = z.object({
  repoId: z.string().min(1),
  message: z.string().min(1)
});

export async function POST(request: Request) {
  const body = await request.json();
  const input = requestSchema.parse(body);
  const result = await handleChat(input.repoId, input.message);

  const assistantText = result.message ?? result.plan?.summary ?? "";

  // Persist both sides of the exchange
  const db = getPrismaClient();
  await db.chatMessage.createMany({
    data: [
      { repositoryId: input.repoId, role: "user", content: input.message },
      { repositoryId: input.repoId, role: "assistant", content: assistantText }
    ]
  });

  return NextResponse.json(result);
}

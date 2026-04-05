import { NextResponse } from "next/server";

import { getPrismaClient } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get("repoId");
  if (!repoId) return NextResponse.json({ messages: [] });

  const db = getPrismaClient();
  const messages = await db.chatMessage.findMany({
    where: { repositoryId: repoId },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: { id: true, role: true, content: true, createdAt: true }
  });

  return NextResponse.json({ messages });
}

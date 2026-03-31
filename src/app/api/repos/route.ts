import { NextResponse } from "next/server";

import { listRepositoriesForDashboard } from "@/server/services/repository-service";

export async function GET() {
  const repos = await listRepositoriesForDashboard();
  return NextResponse.json({ repos });
}

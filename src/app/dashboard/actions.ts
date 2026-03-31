"use server";

import { revalidatePath } from "next/cache";

import { refreshRepositoryAnalysis } from "@/server/services/analysis-service";

export async function runRepositoryScanAction(formData: FormData) {
  const repoId = formData.get("repoId");

  if (typeof repoId !== "string" || repoId.length === 0) {
    return;
  }

  await refreshRepositoryAnalysis(repoId);

  revalidatePath("/dashboard");
  revalidatePath(`/chat/${repoId}`);
  revalidatePath(`/comparison/${repoId}`);
  revalidatePath(`/scan/${repoId}`);
}

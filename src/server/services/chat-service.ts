import { getRepositoryAnalysis } from "@/server/services/analysis-service";
import { runChatOrchestration } from "@/lib/ai/orchestrator";

export async function handleChat(repoId: string, message: string) {
  const analysis = await getRepositoryAnalysis(repoId);
  const plan = analysis.plan;

  try {
    const orchestration = await runChatOrchestration({
      repoId,
      message,
      context: [
        `Repository id: ${repoId}`,
        `Top platform: ${plan.topPlatform}`,
        `Plan summary: ${plan.summary}`,
        `Signals: ${JSON.stringify(analysis.signals)}`,
        `Recommendations: ${JSON.stringify(analysis.recommendations)}`,
        `Findings: ${JSON.stringify(analysis.findings)}`
      ].join("\n")
    });

    return {
      ...orchestration,
      plan
    };
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown provider error.";

    return {
      provider: null,
      task: "answer_follow_up_question",
      object: null,
      message: `Shipd could not reach the configured model provider. ${details}`,
      plan
    };
  }
}

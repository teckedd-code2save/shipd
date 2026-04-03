import { getRepositoryAnalysis } from "@/server/services/analysis-service";
import { runChatOrchestration } from "@/lib/ai/orchestrator";

export async function handleChat(repoId: string, message: string) {
  const analysis = await getRepositoryAnalysis(repoId);
  const plan = analysis.plan;

  try {
    const topArchetype = analysis.archetypes[0];
    const orchestration = await runChatOrchestration({
      repoId,
      message,
      context: [
        `Repository id: ${repoId}`,
        `Top platform: ${plan.topPlatform}`,
        `Plan summary: ${plan.summary}`,
        `Repo topology: ${analysis.signals.repoTopology ?? "unknown"}`,
        `Primary app root: ${analysis.signals.primaryAppRoot ?? "unknown"}`,
        `Repo class: ${analysis.classification.repoClass} (${Math.round(analysis.classification.confidence * 100)}%)`,
        ...(topArchetype
          ? [
              `Top archetype: ${topArchetype.archetype} (${Math.round(topArchetype.confidence * 100)}%)`,
              `Archetype reasons: ${JSON.stringify(topArchetype.reasons)}`
            ]
          : []),
        `Signals: ${JSON.stringify(analysis.signals)}`,
        `Evidence: ${JSON.stringify(analysis.evidence)}`,
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

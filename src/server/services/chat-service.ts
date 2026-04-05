import { getRepositoryAnalysis } from "@/server/services/analysis-service";
import { loadRepositoryFilesFromGitHub } from "@/server/services/github-scan-source";
import { getCurrentGitHubAccessToken } from "@/server/services/github-account-service";
import { findRepositoryById } from "@/server/services/repository-service";
import { runChatOrchestration } from "@/lib/ai/orchestrator";
import { hasDatabaseEnv } from "@/lib/env";

const README_CHAR_LIMIT = 4000;

async function getReadmeContent(repoId: string): Promise<string | null> {
  if (!hasDatabaseEnv()) return null;
  try {
    const [repository, token] = await Promise.all([
      findRepositoryById(repoId),
      getCurrentGitHubAccessToken()
    ]);
    if (!repository || !token) return null;
    const files = await loadRepositoryFilesFromGitHub({
      token,
      owner: repository.owner,
      repo: repository.name
    });
    const readme = files["README.md"] ?? files["readme.md"] ?? files["Readme.md"];
    if (!readme) return null;
    return readme.length > README_CHAR_LIMIT ? readme.slice(0, README_CHAR_LIMIT) + "\n...(truncated)" : readme;
  } catch {
    return null;
  }
}

export async function handleChat(repoId: string, message: string) {
  const analysis = await getRepositoryAnalysis(repoId);
  const plan = analysis.plan;
  const isWeakSignal = plan.fitType === "no_fit" || plan.score < 30;

  // When signals are weak, fetch the README so the AI can extract deployment guidance from it
  const readme = isWeakSignal ? await getReadmeContent(repoId) : null;

  try {
    const topArchetype = analysis.archetypes[0];
    const orchestration = await runChatOrchestration({
      repoId,
      message,
      context: [
        `Repository id: ${repoId}`,
        `Top platform: ${plan.topPlatform}`,
        `Plan fit: ${plan.fitType} (score ${plan.score}/100)`,
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
        `Env vars detected: ${analysis.signals.envVars.length > 0 ? analysis.signals.envVars.join(", ") : "none found — no .env.* files were scanned"}`,
        `Env files scanned: ${analysis.signals.envFilePaths.length > 0 ? analysis.signals.envFilePaths.join(", ") : "none"}`,
        `Signals: ${JSON.stringify(analysis.signals)}`,
        `Evidence: ${JSON.stringify(analysis.evidence)}`,
        `Recommendations: ${JSON.stringify(analysis.recommendations)}`,
        `Findings: ${JSON.stringify(analysis.findings)}`,
        ...(readme
          ? [
              `\n--- README.md (use this to extract deployment instructions when signals are weak) ---\n${readme}\n---`
            ]
          : [])
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

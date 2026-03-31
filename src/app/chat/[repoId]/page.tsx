import Link from "next/link";

import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { ArrowLeftIcon, ArrowUpRightIcon, ChartIcon, FileIcon, GitHubIcon, RefreshIcon } from "@/components/ui/icons";
import { getPlatformDocsUrl } from "@/lib/platform-docs";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";
import { runRepositoryScanAction } from "@/app/dashboard/actions";
import { findRepositoryById } from "@/server/services/repository-service";

export default async function ChatPage({
  params
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const analysis = await getRepositoryAnalysis(repoId);
  const repository = await findRepositoryById(repoId);
  const plan = analysis.plan;
  const repoLabel = repository ? `${repository.owner}/${repository.name}` : analysis.repoId;
  const topRecommendation = analysis.recommendations[0];
  const providerDocsUrl = getPlatformDocsUrl(plan.topPlatform, analysis.signals.framework);

  return (
    <>
      <main className="chat-page">
        <section className="chat-shell">
          <header className="chat-topbar">
            <div className="chat-topbar-title">
              <Link href="/dashboard" className="chat-icon-link" aria-label="Back to dashboard">
                <ArrowLeftIcon size={17} />
              </Link>
              <GitHubIcon size={16} style={{ color: "var(--text-secondary)" }} />
              <div>
                <div className="chat-repo-title">{repository?.name ?? "Repository"}</div>
                <div className="chat-repo-subtitle">{repoLabel}</div>
              </div>
            </div>
            <div className="chat-topbar-actions">
              <form action={runRepositoryScanAction}>
                <input type="hidden" name="repoId" value={repoId} />
                <button type="submit" className="chat-icon-link" aria-label="Run scan">
                  <RefreshIcon size={16} />
                </button>
              </form>
              <Link href={`/comparison/${repoId}`} className="chat-icon-link" aria-label="Compare platforms">
                <ChartIcon size={16} />
              </Link>
              <Link href={`/scan/${repoId}`} className="chat-icon-link" aria-label="View scan">
                <FileIcon size={16} />
              </Link>
            </div>
          </header>

          <div className="chat-layout">
            <aside className="chat-sidebar panel">
              <div className="chat-sidebar-score">
                <div className="chat-sidebar-label">Best fit</div>
                <div className="chat-sidebar-platform">{plan.topPlatform}</div>
                <div className="chat-sidebar-score-value">{plan.score}%</div>
              </div>

              <div className="chat-sidebar-section">
                <div className="chat-sidebar-label">Confidence</div>
                <div className="chat-sidebar-copy">{Math.round(plan.confidence * 100)}% based on saved repository signals.</div>
              </div>

              <div className="chat-sidebar-section">
                <div className="chat-sidebar-label">Why Shipd chose {plan.topPlatform}</div>
                <div className="chat-sidebar-list">
                  {topRecommendation?.reasons.length ? (
                    topRecommendation.reasons.map((reason, index) => (
                      <div key={`${reason}-${index}`} className="chat-sidebar-list-item neutral">
                        {reason}
                      </div>
                    ))
                  ) : (
                    <div className="chat-sidebar-list-item neutral">
                      Specific reasoning will appear here once Shipd has enough repository signals.
                    </div>
                  )}
                </div>
              </div>

              <div className="chat-sidebar-section">
                <div className="chat-sidebar-label">Blockers</div>
                <div className="chat-sidebar-list">
                  {plan.blockers.length > 0 ? (
                    plan.blockers.map((blocker, index) => (
                      <div key={`${blocker}-${index}`} className="chat-sidebar-list-item danger">
                        {blocker}
                      </div>
                    ))
                  ) : (
                    <div className="chat-sidebar-list-item neutral">No blockers detected yet.</div>
                  )}
                </div>
              </div>

              <div className="chat-sidebar-section">
                <div className="chat-sidebar-label">Warnings</div>
                <div className="chat-sidebar-list">
                  {plan.warnings.length > 0 ? (
                    plan.warnings.map((warning, index) => (
                      <div key={`${warning}-${index}`} className="chat-sidebar-list-item warn">
                        {warning}
                      </div>
                    ))
                  ) : (
                    <div className="chat-sidebar-list-item neutral">No major warnings detected.</div>
                  )}
                </div>
              </div>

              <div className="chat-sidebar-section">
                <div className="chat-sidebar-label">Resources</div>
                <div className="chat-sidebar-resource-links">
                  {repository?.githubUrl ? (
                    <a href={repository.githubUrl} target="_blank" rel="noreferrer" className="chat-resource-link">
                      Open project
                      <ArrowUpRightIcon size={14} />
                    </a>
                  ) : null}
                  {providerDocsUrl ? (
                    <a href={providerDocsUrl} target="_blank" rel="noreferrer" className="chat-resource-link">
                      {plan.topPlatform} docs
                      <ArrowUpRightIcon size={14} />
                    </a>
                  ) : null}
                </div>
              </div>
            </aside>

            <ChatWorkspace repoId={repoId} initialPlan={plan} repoLabel={repoLabel} />
          </div>
        </section>
      </main>
    </>
  );
}

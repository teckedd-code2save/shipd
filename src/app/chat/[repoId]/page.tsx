import Link from "next/link";

import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { ChatSidebarLayout } from "@/components/chat/chat-sidebar-layout";
import { ArrowLeftIcon, ArrowUpRightIcon, ChartIcon, FileIcon, GitHubIcon, RefreshIcon } from "@/components/ui/icons";
import { formatArchetypeLabel, formatConfidenceLabel, formatRepoClassLabel, formatTopologyLabel } from "@/lib/archetypes/labels";
import { getPlatformDocsUrl } from "@/lib/platform-docs";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";
import { PlanLimitError } from "@/server/services/plan-limit-service";
import { runRepositoryScanAction } from "@/app/dashboard/actions";
import { findRepositoryById } from "@/server/services/repository-service";
import { SiteHeader } from "@/components/layout/site-header";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";

function formatRoot(value?: string) {
  if (!value) return "Not selected";
  return value === "." ? "repo root" : value;
}

export default async function ChatPage({
  params
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;

  let analysis: Awaited<ReturnType<typeof getRepositoryAnalysis>>;
  try {
    analysis = await getRepositoryAnalysis(repoId);
  } catch (err) {
    if (err instanceof PlanLimitError) {
      return (
        <>
          <SiteHeader />
          <main className="page">
            <UpgradePrompt kind={err.kind} />
          </main>
        </>
      );
    }
    throw err;
  }

  const repository = await findRepositoryById(repoId);
  const plan = analysis.plan;
  const repoLabel = repository ? `${repository.owner}/${repository.name}` : analysis.repoId;
  const topRecommendation = analysis.recommendations[0];
  const lowEvidence =
    analysis.classification.repoClass === "insufficient_evidence" ||
    analysis.classification.repoClass === "notebook_repo" ||
    analysis.classification.repoClass === "infra_only" ||
    analysis.classification.repoClass === "library_or_package";
  const providerDocsUrl = lowEvidence ? null : getPlatformDocsUrl(plan.topPlatform, analysis.signals.framework);
  const topArchetype = analysis.archetypes[0] ?? null;

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
                  <span className="btn-label">Rescan</span>
                </button>
              </form>
              <Link href={`/comparison/${repoId}`} className="chat-icon-link" aria-label="Compare platforms">
                <ChartIcon size={16} />
                <span className="btn-label">Compare</span>
              </Link>
              <Link href={`/scan/${repoId}`} className="chat-icon-link" aria-label="View scan">
                <FileIcon size={16} />
                <span className="btn-label">Scan</span>
              </Link>
            </div>
          </header>

          <ChatSidebarLayout sidebar={<>
              <div className="chat-sidebar-score">
                {plan.fitType === "no_fit" || plan.score < 30 ? (
                  <>
                    <div className="chat-sidebar-label">Recommendation</div>
                    <div className="chat-sidebar-platform" style={{ fontSize: "1rem" }}>No clear fit yet</div>
                    <div className="chat-sidebar-copy" style={{ marginTop: 4 }}>Add deployment files and rescan.</div>
                  </>
                ) : (
                  <>
                    <div className="chat-sidebar-label">Best fit</div>
                    <div className="chat-sidebar-platform">{plan.topPlatform}</div>
                    <div className="chat-sidebar-score-value">{plan.score}/100</div>
                  </>
                )}
              </div>

              <div className="chat-sidebar-section">
                <div className="chat-sidebar-label">App type</div>
                <div className="chat-sidebar-copy">{formatRepoClassLabel(analysis.classification.repoClass)}</div>
              </div>

              <div className="chat-sidebar-section">
                <div className="chat-sidebar-label">Repository structure</div>
                <div className="chat-sidebar-copy">{formatTopologyLabel(analysis.signals.repoTopology ?? "unknown")}</div>
              </div>

              {analysis.signals.primaryAppRoot ? (
                <div className="chat-sidebar-section">
                  <div className="chat-sidebar-label">App location</div>
                  <div className="chat-sidebar-copy">{formatRoot(analysis.signals.primaryAppRoot)}</div>
                </div>
              ) : null}

              {topArchetype && topArchetype.archetype !== "unknown_low_evidence" ? (
                <div className="chat-sidebar-section">
                  <div className="chat-sidebar-label">Matched pattern</div>
                  <div className="chat-sidebar-copy">
                    {formatArchetypeLabel(topArchetype.archetype)}
                  </div>
                </div>
              ) : null}

              <div className="chat-sidebar-section">
                <div className="chat-sidebar-label">Signal strength</div>
                <div className="chat-sidebar-copy">{formatConfidenceLabel(plan.confidence)} — based on deployment signals found in the repo.</div>
              </div>

              {lowEvidence ? (
                <div className="chat-sidebar-section">
                  <div className="chat-sidebar-label">Why we need more info</div>
                  <div className="chat-sidebar-list">
                    {analysis.classification.reasons.map((reason, index) => (
                      <div key={`${reason}-${index}`} className="chat-sidebar-list-item warn">
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="chat-sidebar-section">
                <div className="chat-sidebar-label">Why we picked {plan.topPlatform}</div>
                <div className="chat-sidebar-list">
                  {topRecommendation?.reasons.length ? (
                    topRecommendation.reasons.map((reason: string, index: number) => (
                      <div key={`${reason}-${index}`} className="chat-sidebar-list-item neutral">
                        {reason}
                      </div>
                    ))
                  ) : (
                    <div className="chat-sidebar-list-item neutral">
                      Specific reasoning will appear here once Shipd has enough repository signals.
                    </div>
                  )}
                  {analysis.signals.primaryAppRoot ? (
                    <div className="chat-sidebar-list-item neutral">
                      This plan is based on {formatRoot(analysis.signals.primaryAppRoot)}.
                    </div>
                  ) : null}
                </div>
              </div>

              {topRecommendation?.evidence.length ? (
                <div className="chat-sidebar-section">
                  <div className="chat-sidebar-label">Supporting evidence</div>
                  <div className="chat-sidebar-list">
                    {topRecommendation.evidence.map((item, index) => (
                      <div key={`${item}-${index}`} className="chat-sidebar-list-item neutral">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="chat-sidebar-section">
                <div className="chat-sidebar-label">Blockers</div>
                <div className="chat-sidebar-list">
                  {plan.blockers.length > 0 || analysis.classification.blockers.length > 0 ? (
                    [...analysis.classification.blockers, ...plan.blockers].map((blocker, index) => (
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
          </>}>
            <ChatWorkspace
              repoId={repoId}
              initialPlan={plan}
              repoLabel={repoLabel}
              repoClass={analysis.classification.repoClass}
              framework={analysis.signals.framework}
              runtime={analysis.signals.runtime}
              primaryAppRoot={analysis.signals.primaryAppRoot}
              topology={analysis.signals.repoTopology}
            />
          </ChatSidebarLayout>
        </section>
      </main>
    </>
  );
}

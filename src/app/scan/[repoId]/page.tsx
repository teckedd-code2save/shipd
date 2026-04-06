import Link from "next/link";

import { formatArchetypeLabel } from "@/lib/archetypes/labels";
import { SiteHeader } from "@/components/layout/site-header";
import { ArrowLeftIcon, SparklesIcon } from "@/components/ui/icons";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";
import { PlanLimitError } from "@/server/services/plan-limit-service";
import { findRepositoryById } from "@/server/services/repository-service";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";

function formatRepoClass(value: string) {
  return value.replaceAll("_", " ");
}

function formatRoot(value?: string) {
  if (!value) return "Not selected";
  return value === "." ? "repo root" : value;
}

export default async function ScanPage({
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
  const repoLabel = repository ? `${repository.owner}/${repository.name}` : repoId;

  return (
    <>
      <SiteHeader />
      <main className="page">
        <div className="subpage-toolbar">
          <Link href={`/chat/${repoId}`} className="subpage-back-link">
            <ArrowLeftIcon size={16} />
            Back to plan
          </Link>
          <div className="subpage-context">
            <SparklesIcon size={14} />
            <span>Scan details come from the same saved deployment workspace.</span>
          </div>
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Scan results</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Full transparency for {repoLabel}
        </p>
        <section className="panel" style={{ padding: 18, marginBottom: 18, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="repo-chip">{formatRepoClass(analysis.signals.repoTopology ?? "unknown")}</span>
            {analysis.signals.primaryAppRoot ? (
              <span className="repo-chip repo-chip-outline">Primary app: {formatRoot(analysis.signals.primaryAppRoot)}</span>
            ) : null}
            <span className="repo-chip repo-chip-outline">Repo class: {formatRepoClass(analysis.classification.repoClass)}</span>
            <span className="repo-chip">{Math.round(analysis.classification.confidence * 100)}% confidence</span>
            {analysis.archetypes[0] ? (
              <span className="repo-chip repo-chip-outline">
                Archetype: {formatArchetypeLabel(analysis.archetypes[0].archetype)}
              </span>
            ) : null}
            <span className="repo-chip">Evidence {analysis.evidence.length}</span>
          </div>
          {analysis.classification.reasons.length > 0 ? (
            <div className="muted" style={{ lineHeight: 1.7 }}>
              {analysis.classification.reasons.join(" ")}
            </div>
          ) : null}
        </section>
        <section className="panel" style={{ padding: 20 }}>
          {analysis.findings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>No findings detected</div>
              <div className="muted">Shipd found no deployment signals to flag for this repository.</div>
            </div>
          ) : (
            analysis.findings.map((finding, index) => (
              <div
                key={`${finding.filePath}-${finding.title}-${finding.lineNumber ?? "na"}-${index}`}
                style={{
                  padding: "14px 0",
                  borderBottom: index < analysis.findings.length - 1 ? "1px solid var(--border)" : undefined
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <strong style={{ fontFamily: "var(--font-mono)" }}>{finding.filePath}</strong>
                  <span className="muted">{finding.severity}</span>
                </div>
                <div>{finding.title}</div>
                <div className="muted">{finding.detail}</div>
                {finding.actionText ? (
                  <div className="muted" style={{ marginTop: 6 }}>
                    Action: {finding.actionText}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </section>
        {analysis.evidence.length > 0 ? (
          <section className="panel" style={{ padding: 20, marginTop: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Evidence extracted</div>
            <div style={{ display: "grid", gap: 12 }}>
              {analysis.evidence.map((item, index) => (
                <div key={`${item.sourceFile}-${item.kind}-${item.value}-${index}`} style={{ display: "grid", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <strong>{item.value}</strong>
                    <span className="muted">{item.kind}</span>
                  </div>
                  <div className="muted" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                    {item.sourceFile}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}

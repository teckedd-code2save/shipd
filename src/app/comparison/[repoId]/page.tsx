import Link from "next/link";

import { formatArchetypeLabel, formatRepoClassLabel, formatTopologyLabel, formatVerdictLabel } from "@/lib/archetypes/labels";
import { SiteHeader } from "@/components/layout/site-header";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";

function formatRoot(value?: string) {
  if (!value) return "Not selected";
  return value === "." ? "repo root" : value;
}

function scoreColor(score: number) {
  if (score >= 75) return "var(--success)";
  if (score >= 50) return "var(--warning)";
  if (score >= 30) return "var(--text-secondary)";
  return "var(--text-muted)";
}

function verdictBadgeClass(verdict: string) {
  if (verdict === "perfect" || verdict === "good") return "verdict-badge verdict-badge-good";
  if (verdict === "viable") return "verdict-badge verdict-badge-viable";
  return "verdict-badge verdict-badge-weak";
}

export default async function ComparisonPage({
  params
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const analysis = await getRepositoryAnalysis(repoId);
  const recommendations = analysis.recommendations;
  const top = recommendations[0];
  const showFeatured = top !== undefined && top.score >= 30;

  return (
    <>
      <SiteHeader />
      <main className="page">
        <div className="subpage-toolbar">
          <Link href={`/chat/${repoId}`} className="subpage-back-link">
            <ArrowLeftIcon size={16} />
            Back to plan
          </Link>
        </div>

        <section style={{ marginBottom: 28 }}>
          <div className="dashboard-hero-kicker">Platform comparison</div>
          <h1 style={{ fontSize: 30, marginTop: 4, marginBottom: 12, letterSpacing: "-0.04em" }}>
            Where does this repo fit?
          </h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="repo-chip">{formatTopologyLabel(analysis.signals.repoTopology ?? "unknown")}</span>
            <span className="repo-chip repo-chip-outline">{formatRepoClassLabel(analysis.classification.repoClass)}</span>
            <span className="repo-chip">{Math.round(analysis.classification.confidence * 100)}% confidence</span>
            {analysis.signals.primaryAppRoot ? (
              <span className="repo-chip repo-chip-outline">App at: {formatRoot(analysis.signals.primaryAppRoot)}</span>
            ) : null}
            {analysis.archetypes[0] && analysis.archetypes[0].archetype !== "unknown_low_evidence" ? (
              <span className="repo-chip repo-chip-outline">
                {formatArchetypeLabel(analysis.archetypes[0].archetype)}
              </span>
            ) : null}
          </div>
        </section>

        {!showFeatured && (
          <section className="panel" style={{ padding: 18, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>No strong platform match found</div>
            <div className="muted" style={{ lineHeight: 1.6 }}>
              {analysis.classification.reasons.join(" ")} Add deployment signals (a Dockerfile, runtime manifest, or platform config) and rescan.
            </div>
          </section>
        )}

        {/* Featured top recommendation */}
        {showFeatured && top && (
          <section className="panel comparison-featured" style={{ marginBottom: 16 }}>
            <div className="comparison-featured-header">
              <div>
                <div className="comparison-featured-kicker">Top recommendation</div>
                <div className="comparison-featured-name">
                  <span aria-hidden="true" style={{ color: "var(--warning)", marginRight: 6 }}>★</span>
                  {top.platform}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className={verdictBadgeClass(top.verdict)}>{formatVerdictLabel(top.verdict)}</span>
                </div>
              </div>
              <div className="comparison-featured-score" style={{ color: scoreColor(top.score) }}>
                {top.score}
                <span className="comparison-score-label">/100</span>
              </div>
            </div>
            <div className="comparison-bar" style={{ marginBottom: 16 }}>
              <div className="comparison-bar-fill" style={{ width: `${top.score}%`, background: scoreColor(top.score) }} />
            </div>
            {top.reasons.length > 0 && (
              <ul className="comparison-reason-list" style={{ marginBottom: 12 }}>
                {top.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
              </ul>
            )}
            {top.evidence.length > 0 && (
              <div className="comparison-evidence">
                {top.evidence.map((item) => (
                  <span key={item} className="repo-chip repo-chip-outline">{item}</span>
                ))}
              </div>
            )}
            {top.matchedArchetypes.filter(a => a !== "unknown_low_evidence").length > 0 && (
              <div className="comparison-evidence" style={{ marginTop: 8 }}>
                {top.matchedArchetypes.filter(a => a !== "unknown_low_evidence").map((item) => (
                  <span key={item} className="repo-chip">{formatArchetypeLabel(item)}</span>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Ranked list — all others (or all if no featured) */}
        <section className="panel" style={{ overflow: "hidden" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            All platforms — ranked by fit
          </div>
          {recommendations.map((option, index) => {
            if (showFeatured && index === 0) return null;
            const isLast = index === recommendations.length - 1;
            return (
              <div key={option.platform} className="comparison-row" style={{ borderBottom: isLast ? undefined : "1px solid var(--border)" }}>
                <div className="comparison-row-rank">{index + 1}</div>
                <div className="comparison-row-body">
                  <div className="comparison-row-header">
                    <strong className="comparison-row-name">{option.platform}</strong>
                    <span className={verdictBadgeClass(option.verdict)}>{formatVerdictLabel(option.verdict)}</span>
                    <span className="comparison-row-score" style={{ color: scoreColor(option.score) }}>{option.score}/100</span>
                  </div>
                  <div className="comparison-bar comparison-row-bar">
                    <div className="comparison-bar-fill" style={{ width: `${option.score}%`, background: scoreColor(option.score) }} />
                  </div>
                  {option.reasons[0] && (
                    <div className="comparison-row-reason">{option.reasons[0]}</div>
                  )}
                  {option.disqualifiers[0] && (
                    <div className="comparison-row-disqualifier">{option.disqualifiers[0]}</div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}

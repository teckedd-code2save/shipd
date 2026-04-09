import Link from "next/link";

import { formatArchetypeLabel, formatRepoClassLabel, formatTopologyLabel, formatVerdictLabel } from "@/lib/archetypes/labels";
import { SiteHeader } from "@/components/layout/site-header";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { Surface } from "@/components/ui/surface";
import { Heading, Kicker } from "@/components/ui/typography";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";

function formatRoot(value?: string) {
  if (!value) return "Not selected";
  return value === "." ? "repo root" : value;
}

function scoreTone(score: number) {
  if (score >= 75) return { text: "text-[var(--success)]", fill: "bg-[var(--success)]" } as const;
  if (score >= 50) return { text: "text-[var(--warning)]", fill: "bg-[var(--warning)]" } as const;
  if (score >= 30) return { text: "text-[var(--text-secondary)]", fill: "bg-[var(--text-secondary)]" } as const;
  return { text: "text-[var(--text-muted)]", fill: "bg-[var(--text-muted)]" } as const;
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
  const topTone = top ? scoreTone(top.score) : null;

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

        <section className="mb-7">
          <Kicker className="dashboard-hero-kicker">Platform comparison</Kicker>
          <Heading as="h1" size="hero" className="mb-3 mt-1">
            Where does this repo fit?
          </Heading>
          <div className="flex flex-wrap gap-2">
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
          <Surface className="mb-5 p-[18px]">
            <div className="mb-1.5 text-[15px] font-bold">No strong platform match found</div>
            <div className="muted leading-[1.6]">
              {analysis.classification.reasons.join(" ")} Add deployment signals (a Dockerfile, runtime manifest, or platform config) and rescan.
            </div>
          </Surface>
        )}

        {/* Featured top recommendation */}
        {showFeatured && top && (
          <Surface className="comparison-featured mb-4">
            <div className="comparison-featured-header">
              <div>
                <div className="comparison-featured-kicker">Top recommendation</div>
                <div className="comparison-featured-name">
                  <span aria-hidden="true" className="mr-1.5 text-[var(--warning)]">★</span>
                  {top.platform}
                </div>
                <div className="mt-2">
                  <span className={verdictBadgeClass(top.verdict)}>{formatVerdictLabel(top.verdict)}</span>
                </div>
              </div>
              <div className={`comparison-featured-score ${topTone?.text}`}>
                {top.score}
                <span className="comparison-score-label">/100</span>
              </div>
            </div>
            <div className="comparison-bar mb-4">
              <div className={`comparison-bar-fill ${topTone?.fill}`} style={{ width: `${top.score}%` }} />
            </div>
            {top.reasons.length > 0 && (
              <ul className="comparison-reason-list mb-3">
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
              <div className="comparison-evidence mt-2">
                {top.matchedArchetypes.filter(a => a !== "unknown_low_evidence").map((item) => (
                  <span key={item} className="repo-chip">{formatArchetypeLabel(item)}</span>
                ))}
              </div>
            )}
          </Surface>
        )}

        {/* Ranked list — all others (or all if no featured) */}
        <Surface className="overflow-hidden">
          <div className="border-b border-[var(--border)] px-5 py-3 text-[12px] font-semibold tracking-[0.04em] text-[var(--text-secondary)] uppercase">
            All platforms — ranked by fit
          </div>
          {recommendations.map((option, index) => {
            if (showFeatured && index === 0) return null;
            const isLast = index === recommendations.length - 1;
            const tone = scoreTone(option.score);
            return (
              <div
                key={option.platform}
                className={isLast ? "comparison-row" : "comparison-row border-b border-[var(--border)]"}
              >
                <div className="comparison-row-rank">{index + 1}</div>
                <div className="comparison-row-body">
                  <div className="comparison-row-header">
                    <strong className="comparison-row-name">{option.platform}</strong>
                    <span className={verdictBadgeClass(option.verdict)}>{formatVerdictLabel(option.verdict)}</span>
                    <span className={`comparison-row-score ${tone.text}`}>{option.score}/100</span>
                  </div>
                  <div className="comparison-bar comparison-row-bar">
                    <div className={`comparison-bar-fill ${tone.fill}`} style={{ width: `${option.score}%` }} />
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
        </Surface>
      </main>
    </>
  );
}

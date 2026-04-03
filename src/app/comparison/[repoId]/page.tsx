import Link from "next/link";

import { formatArchetypeLabel } from "@/lib/archetypes/labels";
import { SiteHeader } from "@/components/layout/site-header";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";

function formatRepoClass(value: string) {
  return value.replaceAll("_", " ");
}

function formatRoot(value?: string) {
  if (!value) return "Not selected";
  return value === "." ? "repo root" : value;
}

function describeSignals(analysis: Awaited<ReturnType<typeof getRepositoryAnalysis>>) {
  const highlights = [];
  const { signals } = analysis;

  if (signals.framework && signals.framework !== "unknown") highlights.push(signals.framework);
  if (signals.runtime && signals.runtime !== "unknown") highlights.push(signals.runtime);
  if (signals.dockerfilePaths?.[0]) highlights.push(signals.dockerfilePaths[0]);
  if (signals.infrastructureFiles?.[0]) highlights.push(signals.infrastructureFiles[0]);
  if (signals.platformConfigFiles?.[0]) highlights.push(signals.platformConfigFiles[0]);

  return highlights.join(" · ");
}

export default async function ComparisonPage({
  params
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const analysis = await getRepositoryAnalysis(repoId);
  const options = analysis.recommendations;

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
        <section className="dashboard-hero" style={{ marginBottom: 24 }}>
          <div className="dashboard-hero-kicker">Platform comparison</div>
          <h1 style={{ fontSize: 34, marginTop: 0, marginBottom: 8, letterSpacing: "-0.04em" }}>
            Compare deployment paths for this specific repo
          </h1>
          <p className="muted" style={{ marginBottom: 0, lineHeight: 1.7 }}>
            {describeSignals(analysis) || "Repository signals are still limited, so confidence will improve as more deployment files are detected."}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <span className="repo-chip">{formatRepoClass(analysis.signals.repoTopology ?? "unknown")}</span>
            {analysis.signals.primaryAppRoot ? (
              <span className="repo-chip repo-chip-outline">Primary app: {formatRoot(analysis.signals.primaryAppRoot)}</span>
            ) : null}
            <span className="repo-chip repo-chip-outline">Repo class: {formatRepoClass(analysis.classification.repoClass)}</span>
            <span className="repo-chip">{Math.round(analysis.classification.confidence * 100)}% class confidence</span>
            {analysis.archetypes[0] ? (
              <span className="repo-chip repo-chip-outline">
                Archetype: {formatArchetypeLabel(analysis.archetypes[0].archetype)}
              </span>
            ) : null}
          </div>
        </section>
        {analysis.classification.repoClass === "insufficient_evidence" ||
        analysis.classification.repoClass === "notebook_repo" ||
        analysis.classification.repoClass === "infra_only" ||
        analysis.classification.repoClass === "library_or_package" ? (
          <section className="panel" style={{ padding: 18, marginBottom: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Shipd does not have enough evidence for a strong platform call yet.</div>
            <ul className="comparison-reason-list" style={{ marginBottom: 0 }}>
              {analysis.classification.reasons.map((reason, index) => (
                <li key={`class-reason-${index}`}>{reason}</li>
              ))}
            </ul>
          </section>
        ) : null}
        <section
          className="comparison-grid"
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
          }}
        >
          {options.map((option, index) => (
            <article key={option.platform} className="panel comparison-card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 14 }}>
                <div>
                  <strong style={{ fontSize: 22, letterSpacing: "-0.03em" }}>
                    {index === 0 ? <span aria-hidden="true">★ </span> : ""}
                    {option.platform}
                  </strong>
                  <div className="muted" style={{ marginTop: 6 }}>
                    {option.verdict}
                  </div>
                </div>
                <span className="comparison-score">{option.score}%</span>
              </div>
              <div className="comparison-bar">
                <div
                  className="comparison-bar-fill"
                  style={{
                    width: `${option.score}%`,
                    background:
                      option.score > 80
                        ? "var(--success)"
                        : option.score > 50
                          ? "var(--warning)"
                          : "var(--danger)"
                  }}
                />
              </div>
              <div className="comparison-evidence">
                {option.evidence.map((item) => (
                  <span key={`${option.platform}-${item}`} className="repo-chip repo-chip-outline">
                    {item}
                  </span>
                ))}
              </div>
              {option.matchedArchetypes.length ? (
                <div className="comparison-evidence" style={{ marginTop: 10 }}>
                  {option.matchedArchetypes.map((item) => (
                    <span key={`${option.platform}-arch-${item}`} className="repo-chip">
                      {formatArchetypeLabel(item)}
                    </span>
                  ))}
                </div>
              ) : null}
              <ul className="comparison-reason-list">
                {option.reasons.map((reason, reasonIndex) => (
                  <li key={`${option.platform}-${reasonIndex}`}>{reason}</li>
                ))}
              </ul>
              {option.disqualifiers.length ? (
                <ul className="comparison-reason-list" style={{ marginTop: 10, color: "var(--text-muted)" }}>
                  {option.disqualifiers.map((reason, reasonIndex) => (
                    <li key={`${option.platform}-dq-${reasonIndex}`}>Constraint: {reason}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

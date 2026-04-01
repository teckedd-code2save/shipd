import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { ArrowLeftIcon, SparklesIcon } from "@/components/ui/icons";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";
import { findRepositoryById } from "@/server/services/repository-service";

export default async function ScanPage({
  params
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const [analysis, repository] = await Promise.all([
    getRepositoryAnalysis(repoId),
    findRepositoryById(repoId)
  ]);
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
      </main>
    </>
  );
}

import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { ArrowLeftIcon, SparklesIcon } from "@/components/ui/icons";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";

export default async function ScanPage({
  params
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const analysis = await getRepositoryAnalysis(repoId);

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
          Full transparency for {analysis.repoId}
        </p>
        <section className="panel" style={{ padding: 20 }}>
          {analysis.findings.map((finding, index) => (
            <div
              key={`${finding.filePath}-${finding.title}-${finding.lineNumber ?? "na"}-${index}`}
              style={{
                padding: "14px 0",
                borderBottom: "1px solid var(--border)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <strong style={{ fontFamily: "monospace" }}>{finding.filePath}</strong>
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
          ))}
        </section>
      </main>
    </>
  );
}

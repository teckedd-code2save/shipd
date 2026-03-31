import { SiteHeader } from "@/components/layout/site-header";
import { scanRepository } from "@/server/services/scan-service";

export default async function ScanPage({
  params
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const scan = await scanRepository(repoId);

  return (
    <>
      <SiteHeader />
      <main className="page">
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Scan results</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Full transparency for {repoId}
        </p>
        <section className="panel" style={{ padding: 20 }}>
          {scan.findings.map((finding) => (
            <div
              key={`${finding.filePath}-${finding.title}`}
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

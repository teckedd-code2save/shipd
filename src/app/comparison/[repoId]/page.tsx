import { SiteHeader } from "@/components/layout/site-header";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";

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
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Platform comparison</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Neutral comparison for {analysis.repoId}
        </p>
        <section
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
          }}
        >
          {options.map((option, index) => (
            <article key={option.platform} className="panel" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <strong>
                  {option.platform}
                  {index === 0 ? " ★" : ""}
                </strong>
                <span>{option.score}%</span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "var(--bg-surface-2)",
                  borderRadius: 999,
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    width: `${option.score}%`,
                    height: "100%",
                    background:
                      option.score > 80
                        ? "var(--success)"
                        : option.score > 50
                          ? "var(--warning)"
                          : "var(--danger)",
                    borderRadius: 999
                  }}
                />
              </div>
              <div className="muted" style={{ marginBottom: 12 }}>
                {option.verdict}
              </div>
              <ul style={{ marginBottom: 0 }}>
                {option.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

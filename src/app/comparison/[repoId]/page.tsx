import { SiteHeader } from "@/components/layout/site-header";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";
import type { RepoSignals } from "@/lib/parsing/types";

function getEvidenceForPlatform(platform: string, signals: RepoSignals) {
  const evidence: string[] = [];

  if (platform === "Vercel") {
    if (signals.framework === "nextjs") evidence.push("package.json: Next.js");
    if (signals.platformConfigFiles.find((file) => file.includes("vercel"))) {
      evidence.push(signals.platformConfigFiles.find((file) => file.includes("vercel"))!);
    }
    if (signals.workflowFiles[0] && signals.hasBuildWorkflow) evidence.push(signals.workflowFiles[0]);
    if (signals.hasCustomServer) evidence.push("custom runtime entrypoint");
  }

  if (platform === "Railway") {
    if (signals.dockerfilePaths[0]) evidence.push(signals.dockerfilePaths[0]);
    if (signals.platformConfigFiles.find((file) => file.includes("railway"))) {
      evidence.push(signals.platformConfigFiles.find((file) => file.includes("railway"))!);
    }
    if (signals.envFilePaths[0]) evidence.push(signals.envFilePaths[0]);
    if (signals.hasCustomServer) evidence.push("custom server process");
    if (signals.infrastructureFiles[0]) evidence.push(signals.infrastructureFiles[0]);
  }

  if (platform === "Fly.io") {
    if (signals.dockerfilePaths[0]) evidence.push(signals.dockerfilePaths[0]);
    if (signals.platformConfigFiles.find((file) => file.includes("fly"))) {
      evidence.push(signals.platformConfigFiles.find((file) => file.includes("fly"))!);
    }
    if (signals.infrastructureFiles.find((file) => file.endsWith(".tf"))) {
      evidence.push(signals.infrastructureFiles.find((file) => file.endsWith(".tf"))!);
    }
    if (signals.hasCustomServer) evidence.push("custom server process");
  }

  if (platform === "Render") {
    if (signals.dockerfilePaths[0]) evidence.push(signals.dockerfilePaths[0]);
    if (signals.platformConfigFiles.find((file) => file.includes("render"))) {
      evidence.push(signals.platformConfigFiles.find((file) => file.includes("render"))!);
    }
    if (signals.envFilePaths[0]) evidence.push(signals.envFilePaths[0]);
    if (signals.workflowFiles[0]) evidence.push(signals.workflowFiles[0]);
  }

  return evidence.slice(0, 4);
}

function describeSignals(signals: RepoSignals) {
  const highlights = [];

  if (signals.framework && signals.framework !== "unknown") highlights.push(signals.framework);
  if (signals.runtime && signals.runtime !== "unknown") highlights.push(signals.runtime);
  if (signals.dockerfilePaths[0]) highlights.push(signals.dockerfilePaths[0]);
  if (signals.infrastructureFiles[0]) highlights.push(signals.infrastructureFiles[0]);
  if (signals.platformConfigFiles[0]) highlights.push(signals.platformConfigFiles[0]);

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
        <section className="dashboard-hero" style={{ marginBottom: 24 }}>
          <div className="dashboard-hero-kicker">Platform comparison</div>
          <h1 style={{ fontSize: 34, marginTop: 0, marginBottom: 8, letterSpacing: "-0.04em" }}>
            Compare deployment paths for this specific repo
          </h1>
          <p className="muted" style={{ marginBottom: 0, lineHeight: 1.7 }}>
            {describeSignals(analysis.signals) || "Repository signals are still limited, so confidence will improve as more deployment files are detected."}
          </p>
        </section>
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
                    {index === 0 ? "★ " : ""}
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
                {getEvidenceForPlatform(option.platform, analysis.signals).map((item) => (
                  <span key={`${option.platform}-${item}`} className="repo-chip repo-chip-outline">
                    {item}
                  </span>
                ))}
              </div>
              <ul className="comparison-reason-list">
                {option.reasons.map((reason, reasonIndex) => (
                  <li key={`${option.platform}-${reasonIndex}`}>{reason}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

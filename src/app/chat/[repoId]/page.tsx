import { SiteHeader } from "@/components/layout/site-header";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { buildDeploymentPlan } from "@/server/services/plan-service";

export default async function ChatPage({
  params
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const plan = await buildDeploymentPlan(repoId);

  return (
    <>
      <SiteHeader />
      <main className="page">
        <div className="app-grid">
          <aside className="panel" style={{ padding: 20 }}>
            <div className="muted" style={{ marginBottom: 12 }}>
              Repo
            </div>
            <div style={{ fontWeight: 700, marginBottom: 20 }}>{repoId}</div>
            <div
              style={{
                fontSize: 42,
                fontWeight: 700,
                color: plan.score > 80 ? "var(--success)" : "var(--warning)",
                marginBottom: 8
              }}
            >
              {plan.score} / 100
            </div>
            <div className="muted">
              {plan.blockers.length} blockers · {plan.warnings.length} warnings · {plan.nextSteps.length} next
              steps
            </div>
            <div style={{ marginTop: 24, display: "grid", gap: 10 }}>
              {plan.blockers.map((blocker) => (
                <div key={blocker} style={{ color: "var(--danger)" }}>
                  [!] {blocker}
                </div>
              ))}
              {plan.warnings.map((warning) => (
                <div key={warning} style={{ color: "var(--warning)" }}>
                  [~] {warning}
                </div>
              ))}
            </div>
          </aside>
          <ChatWorkspace repoId={repoId} initialPlan={plan} />
        </div>
      </main>
    </>
  );
}

import Link from "next/link";

import { auth } from "@/auth";
import { AuthButton } from "@/components/auth/auth-button";
import { RepoBrowser } from "@/components/dashboard/repo-browser";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { listRepositoriesForDashboard } from "@/server/services/repository-service";

export default async function DashboardPage() {
  const session = await auth();
  const repos = await listRepositoriesForDashboard();

  return (
    <>
      <SiteHeader />
      <main className="page">
        <div className="app-grid">
          <DashboardSidebar />
          <section style={{ minWidth: 0 }}>
            <section className="dashboard-hero">
              <div>
                <div className="dashboard-hero-wordmark">Shipd</div>
                <div className="dashboard-hero-kicker">Deployment planning workspace</div>
                <h1 style={{ fontSize: 34, marginBottom: 10, marginTop: 0, letterSpacing: "-0.04em" }}>
                  Point it at your repos. Open the right deployment plan fast.
                </h1>
                <p className="muted" style={{ marginBottom: 0, maxWidth: 760, lineHeight: 1.72 }}>
                  Use the dashboard to triage your repo inventory, open a planning workspace, and keep comparison and scan actions in one place instead of scattering them across every card.
                </p>
              </div>
            </section>
            {!session?.user ? (
              <section className="panel" style={{ padding: 20, marginBottom: 24 }}>
                <h2 style={{ marginTop: 0 }}>Connect GitHub to continue</h2>
                <p className="muted" style={{ marginBottom: 16 }}>
                  Shipd needs read-only GitHub access to list your repositories and analyze deployment
                  signals.
                </p>
                <AuthButton redirectTo="/dashboard" />
              </section>
            ) : null}
            {session?.user ? <RepoBrowser repos={repos} /> : null}
            {!session?.user ? (
              <section
                className="panel"
                style={{
                  padding: 20,
                  marginTop: 18,
                  display: "grid",
                  gap: 10
                }}
              >
                <div style={{ fontWeight: 600 }}>What happens after connect?</div>
                <div className="muted">Shipd syncs your repos, scans deployment-relevant files, and opens the planning flow for the selected repository.</div>
                <Link href="/" style={{ color: "var(--accent-blue)" }}>
                  Back to landing
                </Link>
              </section>
            ) : null}
          </section>
        </div>
      </main>
    </>
  );
}

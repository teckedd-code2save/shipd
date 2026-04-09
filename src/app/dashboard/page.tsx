import Link from "next/link";

import { auth } from "@/auth";
import { AuthButton } from "@/components/auth/auth-button";
import { RepoBrowser } from "@/components/dashboard/repo-browser";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { Surface } from "@/components/ui/surface";
import { Heading, Kicker, Lead } from "@/components/ui/typography";
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
          <section className="dashboard-main">
            <section className="dashboard-hero">
              <div>
                <Kicker className="dashboard-hero-kicker">Deployment planning</Kicker>
                <Heading as="h1" size="section" className="dashboard-hero-h1 dashboard-hero-heading">
                  Pick a repo. Get a deploy plan.
                </Heading>
                <Lead className="dashboard-hero-copy muted">
                  Scan any GitHub repo to get platform recommendations, tradeoff analysis, and a step-by-step deployment plan.
                </Lead>
              </div>
            </section>
            {!session?.user ? (
              <Surface className="dashboard-connect-panel">
                <Heading as="h2" size="card" className="dashboard-connect-title">Connect GitHub to continue</Heading>
                <Lead className="muted dashboard-connect-copy">
                  Shipd needs read-only GitHub access to list your repositories and analyze deployment
                  signals.
                </Lead>
                <AuthButton redirectTo="/dashboard" />
              </Surface>
            ) : null}
            {session?.user ? <RepoBrowser repos={repos} /> : null}
            {!session?.user ? (
              <Surface className="dashboard-connect-flow">
                <div className="dashboard-connect-flow-title">What happens after connect?</div>
                <div className="muted">Shipd syncs your repos, scans deployment-relevant files, and opens the planning flow for the selected repository.</div>
                <Link href="/" className="dashboard-link-accent">
                  Back to landing
                </Link>
              </Surface>
            ) : null}
          </section>
        </div>
      </main>
    </>
  );
}

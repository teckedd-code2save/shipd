import Link from "next/link";

import { auth } from "@/auth";
import { AuthButton } from "@/components/auth/auth-button";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CtaLink } from "@/components/ui/cta-link";
import { getPrismaClient } from "@/lib/db/prisma";

const AVATAR_COLORS = [
  "landing-avatar-blue",
  "landing-avatar-purple",
  "landing-avatar-green",
  "landing-avatar-amber",
  "landing-avatar-coral",
];

function initials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

async function getLandingStats() {
  try {
    const db = getPrismaClient();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const activeRepos = await db.repository.findMany({
      where: { scans: { some: { createdAt: { gte: weekAgo } } } },
      select: {
        userId: true,
        user: { select: { name: true, email: true } },
        scans: { select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
      distinct: ["userId"],
    });

    const activeCount = activeRepos.length;

    const recentUsers = activeRepos
      .sort((a, b) => {
        const aTime = a.scans[0]?.createdAt?.getTime() ?? 0;
        const bTime = b.scans[0]?.createdAt?.getTime() ?? 0;
        return bTime - aTime;
      })
      .slice(0, 5)
      .map((r) => initials(r.user.name, r.user.email));

    return { activeCount, recentUsers };
  } catch {
    return { activeCount: 0, recentUsers: [] };
  }
}


export default async function LandingPage() {
  const [session, { activeCount, recentUsers }] = await Promise.all([
    auth(),
    getLandingStats(),
  ]);

  return (
    <>
      {/* ── Full-page ghost wordmark ────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="landing-ghost"
      >
        Shipd
      </div>

      <main
        className="page"
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative", zIndex: 1 }}
      >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
     {/* ── Hero ─────────────────────────────────────────────────────────── */}
<section
  className="landing-hero"
  style={{
    maxWidth: 680,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    margin: "0 auto",
    textAlign: "center",
    paddingTop: "clamp(40px, 8vw, 72px)",
    paddingBottom: 24,
  }}
>
  {/* Mini UI preview — shows the value before clicking */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 28,
      padding: "12px 20px",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 100,
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--text-muted)",
    }}
  >
    <span style={{ 
      width: 8, 
      height: 8, 
      borderRadius: "50%", 
      background: "#22c55e",
      boxShadow: "0 0 8px #22c55e",
    }} />
    teckedd-code2save/agent-exchange
    <span style={{ color: "var(--text-secondary)" }}>→</span>
    <span style={{ color: "#5b6cf2" }}>96/100 Vercel fit</span>
  </div>

  <h1
    style={{
      fontSize: "clamp(26px, 4vw, 40px)",
      fontWeight: 600,
      lineHeight: 1.35,
      letterSpacing: "-0.02em",
      marginBottom: 16,
      color: "var(--text-primary)",
    }}
  >
    Your deployment genie,<br />
    <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>understands, guides,</span>
  </h1>

  <p
    style={{
      fontSize: 16,
      lineHeight: 1.6,
      color: "var(--text-secondary)",
      maxWidth: 420,
      margin: "0 auto 32px",
    }}
  >
    helping you ship unstressed.
  </p>

  <div className="hero-cta-row">
    {session?.user ? (
      <CtaLink href="/dashboard" label="Open dashboard" />
    ) : (
      <AuthButton redirectTo="/dashboard" />
    )}
    <Link
      href="/pricing"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 20px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.04)",
        fontSize: 14,
        fontWeight: 500,
        color: "var(--text-secondary)",
        textDecoration: "none",
        transition: "border-color 0.15s, color 0.15s",
      }}
    >
      See pricing →
    </Link>
  </div>
</section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 640,
          width: "100%",
          margin: "0 auto",
          padding: "56px 0 48px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            textAlign: "center",
            marginBottom: 36,
          }}
        >
          {"// how it works"}
        </p>

        <HowItWorks />
      </section>

      {/* ── Trust row ────────────────────────────────────────────────────── */}
      {activeCount > 0 ? (
        <div className="landing-trust-row">
          {recentUsers.length > 0 ? (
            <div className="landing-avatars">
              {recentUsers.map((init, i) => (
                <span
                  key={i}
                  className={`landing-avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                >
                  {init}
                </span>
              ))}
            </div>
          ) : null}
          <span className="muted">
            {activeCount} developer{activeCount !== 1 ? "s" : ""} shipped this week
          </span>
        </div>
      ) : null}
    </main>
    </>
  );
}

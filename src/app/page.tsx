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
      <section
        className="landing-hero"
        style={{
          maxWidth: 600,
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

        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            marginBottom: 12,
            color: "var(--text-primary)",
          }}
        >
          Know exactly how to<br />deploy any repo.
        </h1>

        {/* Shipd brand signature */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "0.35em",
            marginBottom: 28,
          }}
        >
          <span
            style={{
              fontSize: "clamp(16px, 2.8vw, 24px)",
              color: "var(--text-muted)",
              fontWeight: 400,
              letterSpacing: "0.01em",
            }}
          >
            with
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(36px, 6.5vw, 58px)",
              fontWeight: 800,
              letterSpacing: "-0.06em",
              lineHeight: 1,
              background: "linear-gradient(125deg, #e0e7ff 0%, #a5b4fc 35%, #5b6cf2 68%, #4338ca 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Shipd.
          </span>
        </div>

        <p
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: "var(--text-secondary)",
            maxWidth: 420,
            margin: "0 auto 36px",
          }}
        >
          Scan your codebase and get the right platform, tradeoffs,
          and a step-by-step deployment plan.
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

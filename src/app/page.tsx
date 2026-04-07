import Link from "next/link";

import { auth } from "@/auth";
import { AuthButton } from "@/components/auth/auth-button";
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

const HOW_IT_WORKS = [
  {
    number: "01",
    title: "Detects your app type",
    desc: "Reads package.json, Dockerfile, CI configs, and more — zero setup.",
  },
  {
    number: "02",
    title: "Finds the best platform",
    desc: "Scores Railway, Fly.io, Vercel, Render, and more against your stack.",
  },
  {
    number: "03",
    title: "Explains the tradeoffs",
    desc: "You see why each platform fits — or doesn't — for your exact repo.",
  },
  {
    number: "04",
    title: "Hands you a deploy plan",
    desc: "Step-by-step instructions, env vars, and config files ready to go.",
  },
];

export default async function LandingPage() {
  const [session, { activeCount, recentUsers }] = await Promise.all([
    auth(),
    getLandingStats(),
  ]);

  return (
    <main
      className="page"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 680,
          flex: 1,
          display: "grid",
          placeItems: "center",
          alignContent: "center",
          width: "100%",
          margin: "0 auto",
          textAlign: "center",
          paddingTop: 48,
          paddingBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.05em",
              marginBottom: 24,
              lineHeight: 1,
            }}
          >
            Shipd
          </div>

          <h1
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Know exactly how to<br />deploy any repo.
          </h1>

          <p
            className="muted"
            style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}
          >
            Scan your codebase and get the right platform, tradeoffs,
            and a step-by-step deployment plan.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {session?.user ? (
              <CtaLink href="/dashboard" label="Open dashboard" />
            ) : (
              <AuthButton redirectTo="/dashboard" />
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <Link
              href="/pricing"
              style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}
            >
              See pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 800,
          width: "100%",
          margin: "0 auto",
          padding: "48px 0",
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
            marginBottom: 28,
          }}
        >
          {"// how it works"}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.number}
              className="panel"
              style={{ padding: "20px 20px 22px" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--accent-blue)",
                  marginBottom: 10,
                  opacity: 0.8,
                }}
              >
                {step.number}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 8,
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Anti-feature callout ─────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 800,
          width: "100%",
          margin: "0 auto",
          paddingBottom: 56,
        }}
      >
        <div
          style={{
            border: "1px solid rgba(248, 113, 113, 0.2)",
            background: "linear-gradient(180deg, rgba(248,113,113,0.06), transparent 60%), var(--bg-surface)",
            borderRadius: 20,
            padding: "28px 32px",
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              fontSize: 22,
              lineHeight: 1,
              marginTop: 2,
            }}
          >
            ✕
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#f87171",
                marginBottom: 8,
              }}
            >
              Honest by design
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: 10,
                lineHeight: 1.3,
              }}
            >
              We&apos;ll tell you when NOT to deploy.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                margin: 0,
                maxWidth: 520,
              }}
            >
              If your repo has no clear platform fit, Shipd says so — with
              reasons. No false confidence, no generic advice. Just the truth
              about what your codebase is ready for.
            </p>
          </div>
        </div>
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
  );
}

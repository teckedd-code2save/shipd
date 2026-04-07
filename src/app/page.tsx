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

    // Distinct users who triggered at least one scan this week
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

    // Up to 5 most recently active users for avatars
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
    <main
      className="page"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        textAlign: "center"
      }}
    >
      <section
        style={{
          maxWidth: 760,
          flex: 1,
          display: "grid",
          placeItems: "center",
          alignContent: "center",
          width: "100%",
          margin: "0 auto"
        }}
      >
        <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 72, fontWeight: 700, marginBottom: 20 }}>
          Shipd
        </div>
        <h1 style={{ fontSize: 24, lineHeight: 1.4, marginBottom: 16 }}>
          Point it at your repo. Get a deployment plan.
        </h1>
        <p className="muted" style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
          Reads your config files. No code changes. No installs.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {session?.user ? (
            <CtaLink href="/dashboard" label="Open dashboard" />
          ) : (
            <AuthButton redirectTo="/dashboard" />
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <a
            href="/pricing"
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: 1,
            }}
          >
            See pricing →
          </a>
        </div>
        </div>
      </section>
      {activeCount > 0 ? (
        <div className="landing-trust-row">
          {recentUsers.length > 0 ? (
            <div className="landing-avatars">
              {recentUsers.map((init, i) => (
                <span key={i} className={`landing-avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
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

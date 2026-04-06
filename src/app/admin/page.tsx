import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getPrismaClient } from "@/lib/db/prisma";
import { hasDatabaseEnv } from "@/lib/env";
import { isAdmin } from "@/config/plans";
import { Plan } from "@/generated/prisma/client";
import { SiteHeader } from "@/components/layout/site-header";
import { setUserPlanAction, resetUserQuotaAction } from "./actions";

export const metadata: Metadata = { title: "Admin — Shipd" };

const PLAN_LABELS: Record<Plan, string> = { FREE: "Free", PRO: "Pro", TEAM: "Team" };

export default async function AdminPage() {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    redirect("/dashboard");
  }

  if (!hasDatabaseEnv()) {
    return (
      <>
        <SiteHeader />
        <main className="page" style={{ paddingTop: 80 }}>
          <p className="muted">No database configured — admin panel unavailable in this environment.</p>
        </main>
      </>
    );
  }

  const prisma = getPrismaClient();

  const [users, scanStats] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        planScanCount: true,
        planPrivateScanCount: true,
        planScanResetAt: true,
        createdAt: true,
      },
    }),
    prisma.user.groupBy({
      by: ["plan"],
      _count: { id: true },
    }),
  ]);

  const planCounts = Object.fromEntries(
    scanStats.map((s) => [s.plan, s._count.id])
  ) as Record<Plan, number>;

  return (
    <>
      <SiteHeader />
      <main className="page" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#e8ff47",
              fontFamily: "var(--font-mono)",
              marginBottom: 8,
            }}
          >
            {"// admin"}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            Admin Panel
          </h1>
          <p className="muted" style={{ fontSize: 13 }}>
            Logged in as {session?.user?.email}
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "var(--border)",
            border: "1px solid var(--border)",
            marginBottom: 40,
          }}
        >
          {(["FREE", "PRO", "TEAM"] as Plan[]).map((p) => (
            <div
              key={p}
              style={{
                background: "var(--bg-surface)",
                padding: "24px 28px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  marginBottom: 8,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {PLAN_LABELS[p]}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>
                {planCounts[p] ?? 0}
              </div>
              <div className="muted" style={{ fontSize: 11 }}>
                users
              </div>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Email", "Plan", "Public scans", "Private scans", "Reset date", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        color: "var(--text-secondary)",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-primary)",
                      maxWidth: 220,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.email ?? user.name ?? user.id}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        color: user.plan === "FREE" ? "var(--text-secondary)" : "#e8ff47",
                        fontWeight: user.plan !== "FREE" ? 600 : 400,
                      }}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                    {user.planScanCount}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                    {user.planPrivateScanCount}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                    {user.planScanResetAt.toISOString().slice(0, 10)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {/* Plan override */}
                      {(["FREE", "PRO", "TEAM"] as Plan[])
                        .filter((p) => p !== user.plan)
                        .map((p) => (
                          <form key={p} action={setUserPlanAction.bind(null, user.id, p)}>
                            <button
                              type="submit"
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 10,
                                padding: "4px 10px",
                                background: "transparent",
                                border: "1px solid var(--border)",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                letterSpacing: 1,
                              }}
                            >
                              → {p}
                            </button>
                          </form>
                        ))}
                      {/* Reset quota */}
                      <form action={resetUserQuotaAction.bind(null, user.id)}>
                        <button
                          type="submit"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            padding: "4px 10px",
                            background: "transparent",
                            border: "1px solid var(--border)",
                            color: "#666",
                            cursor: "pointer",
                            letterSpacing: 1,
                          }}
                        >
                          reset quota
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p
              className="muted"
              style={{ padding: "24px 16px", fontSize: 13, textAlign: "center" }}
            >
              No users yet.
            </p>
          )}
        </div>
      </main>
    </>
  );
}

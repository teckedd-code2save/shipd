import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/layout/site-header";
import {
  getOverviewMetrics,
  getTopUsers,
  getDailyScanCounts,
  getPlatformStats,
  getRecentScans,
} from "@/server/services/metrics-service";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
      {sub ? <div className="admin-stat-sub">{sub}</div> : null}
    </div>
  );
}

function Sparkline({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="admin-sparkline" title="Scans per day (last 14 days)">
      {data.map((d) => (
        <div
          key={d.date}
          className="admin-sparkline-bar"
          style={{ height: `${Math.max(2, (d.count / max) * 40)}px` }}
          title={`${d.date}: ${d.count} scan${d.count !== 1 ? "s" : ""}`}
        />
      ))}
    </div>
  );
}

function timeAgo(date: Date | null): string {
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    redirect("/dashboard");
  }

  const [overview, topUsers, dailyScans, platformStats, recentScans] = await Promise.all([
    getOverviewMetrics(),
    getTopUsers(25),
    getDailyScanCounts(14),
    getPlatformStats(),
    getRecentScans(30),
  ]);

  const totalThisWeek = dailyScans.slice(-7).reduce((s, d) => s + d.count, 0);

  return (
    <>
      <SiteHeader />
      <main className="page">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 6, marginTop: 0 }}>
            Metrics
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Live usage stats — visible to admins only.</p>
        </div>

        {/* Overview stats */}
        <div className="admin-stats-grid">
          <StatCard label="Total users" value={overview.totalUsers} sub={`+${overview.newUsersThisWeek} this week`} />
          <StatCard label="Active users (7d)" value={overview.activeUsersThisWeek} sub="ran at least one scan" />
          <StatCard label="Total scans" value={overview.totalScans} sub={`${overview.scansThisWeek} this week`} />
          <StatCard label="Chat messages" value={overview.totalChatMessages} sub="from users (all time)" />
          <StatCard label="Repositories" value={overview.totalRepositories} />
        </div>

        {/* Scan activity sparkline */}
        <div className="panel admin-section" style={{ marginBottom: 24 }}>
          <div className="admin-section-head">
            <div>
              <div className="admin-section-title">Scan activity</div>
              <div className="admin-section-sub">{totalThisWeek} scans in the last 7 days</div>
            </div>
          </div>
          <Sparkline data={dailyScans} />
          <div className="admin-sparkline-dates">
            <span>{dailyScans[0]?.date}</span>
            <span>{dailyScans[dailyScans.length - 1]?.date}</span>
          </div>
        </div>

        <div className="admin-two-col">
          {/* Platform distribution */}
          <div className="panel admin-section">
            <div className="admin-section-head">
              <div className="admin-section-title">Top recommended platforms</div>
            </div>
            <div className="admin-platform-list">
              {platformStats.slice(0, 10).map((p) => (
                <div key={p.platform} className="admin-platform-row">
                  <span className="admin-platform-name">{p.platform}</span>
                  <span className="admin-platform-count">{p.count}</span>
                  <div
                    className="admin-platform-bar"
                    style={{ width: `${(p.count / (platformStats[0]?.count ?? 1)) * 100}%` }}
                  />
                </div>
              ))}
              {platformStats.length === 0 && <div className="muted" style={{ fontSize: 13 }}>No data yet.</div>}
            </div>
          </div>

          {/* Recent scans feed */}
          <div className="panel admin-section">
            <div className="admin-section-head">
              <div className="admin-section-title">Recent scans</div>
            </div>
            <div className="admin-feed">
              {recentScans.map((s) => (
                <div key={s.scanId} className="admin-feed-row">
                  <div className="admin-feed-repo">{s.repoFullName}</div>
                  <div className="admin-feed-meta">
                    <span className="admin-feed-user">{s.userName ?? s.userEmail ?? "unknown"}</span>
                    {s.topPlatform ? <span className="admin-feed-platform">{s.topPlatform}</span> : null}
                    {s.framework ? <span className="admin-feed-framework">{s.framework}</span> : null}
                  </div>
                  <div className="admin-feed-time">{timeAgo(s.scannedAt)}</div>
                </div>
              ))}
              {recentScans.length === 0 && <div className="muted" style={{ fontSize: 13 }}>No scans yet.</div>}
            </div>
          </div>
        </div>

        {/* Top users table */}
        <div className="panel admin-section">
          <div className="admin-section-head">
            <div className="admin-section-title">Users</div>
            <div className="admin-section-sub">{overview.totalUsers} total</div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Repos</th>
                  <th>Scans</th>
                  <th>Chats</th>
                  <th>Last active</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-user-cell">
                        {u.image ? (
                          <img src={u.image} alt="" className="admin-user-avatar" />
                        ) : (
                          <div className="admin-user-avatar admin-user-avatar-placeholder">
                            {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="admin-user-name">{u.name ?? "—"}</div>
                          <div className="admin-user-email">{u.email ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.repoCount}</td>
                    <td><strong>{u.scanCount}</strong></td>
                    <td>{u.chatCount}</td>
                    <td>{timeAgo(u.lastActiveAt)}</td>
                  </tr>
                ))}
                {topUsers.length === 0 && (
                  <tr><td colSpan={5} className="muted" style={{ fontSize: 13 }}>No users yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

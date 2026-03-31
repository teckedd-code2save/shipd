import type { Route } from "next";
import Link from "next/link";

export function DashboardSidebar() {
  const items: Array<{ href: Route; label: string; meta: string }> = [
    { href: "/dashboard", label: "Repositories", meta: "Connected repos" },
    { href: "/dashboard", label: "Comparisons", meta: "Platform fit" },
    { href: "/dashboard", label: "Scans", meta: "Latest findings" }
  ];

  return (
    <aside className="panel dashboard-sidebar">
      <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        Shipd
      </div>
      <p className="muted" style={{ marginTop: 0, marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
        Read-only deployment intelligence across your GitHub repos.
      </p>
      <nav style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: "block",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: 16,
              background: "rgba(31, 35, 48, 0.72)",
              padding: "14px 16px"
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {item.meta}
            </div>
          </Link>
        ))}
      </nav>
      <div className="dashboard-sidebar-stack">
        <section className="dashboard-side-card">
          <div className="dashboard-side-label">Workflow</div>
          <div className="dashboard-side-title">Connect, scan, compare, decide.</div>
          <div className="dashboard-side-copy">
            Start from repos that already have env files, workflows, or platform config. Those produce the most trustworthy plans first.
          </div>
        </section>
        <section className="dashboard-side-card">
          <div className="dashboard-side-label">Focus</div>
          <div className="dashboard-side-copy">
            Use the scanned filter to narrow the list to repos that already have a saved snapshot, then jump into comparison or chat from there.
          </div>
        </section>
      </div>
      <div
        style={{
          marginTop: 24,
          borderTop: "1px solid var(--border)",
          paddingTop: 18
        }}
      >
        <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
          Launch Focus
        </div>
        <ul style={{ marginBottom: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>GitHub-backed scan</li>
          <li>Neutral comparison</li>
          <li>Deployment plan export</li>
        </ul>
      </div>
    </aside>
  );
}

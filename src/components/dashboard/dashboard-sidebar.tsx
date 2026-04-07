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
      <nav style={{ display: "grid", gap: 8, marginBottom: 20 }}>
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: "block",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: 14,
              background: "rgba(31, 35, 48, 0.72)",
              padding: "12px 14px"
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.label}</div>
            <div className="muted" style={{ fontSize: 12 }}>{item.meta}</div>
          </Link>
        ))}
      </nav>
      <div className="dashboard-sidebar-stack">
        <section className="dashboard-side-card">
          <div className="dashboard-side-label">Tip</div>
          <div className="dashboard-side-copy">
            Repos with Dockerfiles, CI configs, or env files produce the most detailed plans.
          </div>
        </section>
        <section className="dashboard-side-card">
          <div className="dashboard-side-label">Filter</div>
          <div className="dashboard-side-copy">
            Use the Scanned filter to find repos with saved snapshots, then open comparison or chat from the card.
          </div>
        </section>
      </div>
    </aside>
  );
}

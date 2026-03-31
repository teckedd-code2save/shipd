import type { Route } from "next";
import Link from "next/link";

export function DashboardSidebar() {
  const items: Array<{ href: Route; label: string; meta: string }> = [
    { href: "/dashboard", label: "Repositories", meta: "Connected repos" },
    { href: "/dashboard", label: "Comparisons", meta: "Platform fit" },
    { href: "/dashboard", label: "Scans", meta: "Latest findings" }
  ];

  return (
    <aside className="panel" style={{ padding: 20, minHeight: 520 }}>
      <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        Shipd
      </div>
      <p className="muted" style={{ marginTop: 0, marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
        Decision layer for deployment planning.
      </p>
      <nav style={{ display: "grid", gap: 10 }}>
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: "block",
              border: "1px solid var(--border)",
              borderRadius: 14,
              background: "var(--bg-surface-2)",
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

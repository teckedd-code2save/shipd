import type { Route } from "next";
import Link from "next/link";

import { Surface } from "@/components/ui/surface";

export function DashboardSidebar() {
  const items: Array<{ href: Route; label: string; meta: string }> = [
    { href: "/dashboard", label: "Repositories", meta: "Connected repos" },
    { href: "/dashboard", label: "Comparisons", meta: "Platform fit" },
    { href: "/dashboard", label: "Scans", meta: "Latest findings" }
  ];

  return (
    <Surface as="aside" className="dashboard-sidebar">
      <nav className="dashboard-sidebar-nav">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="dashboard-sidebar-link"
          >
            <div className="dashboard-sidebar-link-label">{item.label}</div>
            <div className="muted dashboard-sidebar-link-meta">{item.meta}</div>
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
    </Surface>
  );
}

"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { ChevronDownIcon, SparklesIcon } from "@/components/ui/icons";
import { Surface } from "@/components/ui/surface";

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);

  const items: Array<{ href: Route; label: string; meta: string }> = [
    { href: "/dashboard", label: "Repositories", meta: "Connected repos" },
    { href: "/dashboard", label: "Comparisons", meta: "Platform fit" },
    { href: "/dashboard", label: "Scans", meta: "Latest findings" }
  ];

  return (
    <>
      <Surface as="aside" className="dashboard-sidebar">
        <nav className="dashboard-sidebar-nav">
          {items.map((item) => (
            <Link key={item.label} href={item.href} className="dashboard-sidebar-link">
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

      <div className="dashboard-mobile-nav">
        <button
          type="button"
          className={`dashboard-mobile-nav-toggle${open ? " open" : ""}`}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="dashboard-mobile-nav-panel"
        >
          <span className="dashboard-mobile-nav-toggle-left">
            <SparklesIcon size={14} />
            Navigation
          </span>
          <ChevronDownIcon size={14} className="dashboard-mobile-nav-chevron" />
        </button>

        {open ? (
          <Surface as="section" id="dashboard-mobile-nav-panel" className="dashboard-mobile-nav-panel">
            {items.map((item) => (
              <Link
                key={`mobile-${item.label}`}
                href={item.href}
                className="dashboard-sidebar-link"
                onClick={() => setOpen(false)}
              >
                <div className="dashboard-sidebar-link-label">{item.label}</div>
                <div className="muted dashboard-sidebar-link-meta">{item.meta}</div>
              </Link>
            ))}
            <section className="dashboard-side-card">
              <div className="dashboard-side-label">Tip</div>
              <div className="dashboard-side-copy">
                Use search and scan-state filters to narrow repos before opening plan deployment.
              </div>
            </section>
          </Surface>
        ) : null}
      </div>
    </>
  );
}

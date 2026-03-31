"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { DashboardRepository } from "@/types/repository";

function inferFramework(name: string) {
  return name.includes("api") ? "Express" : "Next.js";
}

export function RepoBrowser({ repos }: { repos: DashboardRepository[] }) {
  const [query, setQuery] = useState("");

  const filteredRepos = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return repos;
    }

    return repos.filter((repo) => repo.fullName.toLowerCase().includes(normalized));
  }, [query, repos]);

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <div className="panel" style={{ padding: 18 }}>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "minmax(0, 1fr) auto"
          }}
        >
          <label style={{ display: "grid", gap: 8 }}>
            <span className="muted" style={{ fontSize: 13 }}>
              Search repositories
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by owner or repo name..."
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--bg-surface-2)",
                color: "var(--text-primary)",
                padding: "14px 16px"
              }}
            />
          </label>
          <div
            style={{
              display: "grid",
              alignContent: "end"
            }}
          >
            <div
              style={{
                minWidth: 140,
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--bg-surface-2)",
                padding: "14px 16px",
                textAlign: "center"
              }}
            >
              {filteredRepos.length} repos
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {filteredRepos.map((repo) => (
          <article
            key={repo.fullName}
            className="panel"
            style={{
              padding: 22,
              display: "grid",
              gap: 16,
              gridTemplateColumns: "minmax(0, 1fr) auto"
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{repo.fullName}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <span className="token-pill token-pill-blue">{inferFramework(repo.name)}</span>
                <span className="token-pill">{repo.owner}</span>
                <span className="token-pill">{repo.lastScanned}</span>
              </div>
              <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Scan this repository, compare realistic hosting options, and generate a deployment plan
                with blockers, warnings, and setup steps.
              </p>
            </div>

            <div style={{ display: "grid", gap: 10, alignContent: "start", minWidth: 180 }}>
              <Link href={`/chat/${repo.id}`} className="action-link action-link-primary">
                Open chat
              </Link>
              <Link href={`/comparison/${repo.id}`} className="action-link">
                Compare platforms
              </Link>
              <Link href={`/scan/${repo.id}`} className="action-link">
                View scan
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


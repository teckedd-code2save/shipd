"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ArrowUpRightIcon, SearchIcon, SparklesIcon } from "@/components/ui/icons";
import { Surface } from "@/components/ui/surface";
import type { DashboardRepository } from "@/types/repository";

function formatLabel(value?: string) {
  if (!value) return "Unknown";
  return value.replaceAll("_", " ");
}

function formatRoot(value?: string) {
  if (!value) return "Not selected";
  return value === "." ? "repo root" : value;
}

function formatLastScanned(value: string) {
  if (value === "Not yet scanned") {
    return "Not yet scanned";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function RepoBrowser({ repos }: { repos: DashboardRepository[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "scanned" | "unscanned">("all");
  const [page, setPage] = useState(1);
  const pageSize = 18;

  const filteredRepos = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return repos
      .filter((repo) => {
        if (statusFilter === "scanned") return repo.lastScanned !== "Not yet scanned";
        if (statusFilter === "unscanned") return repo.lastScanned === "Not yet scanned";
        return true;
      })
      .filter((repo) => {
        if (!normalized) return true;
        return repo.fullName.toLowerCase().includes(normalized);
      });
  }, [query, repos, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRepos.length / pageSize));
  const activePage = Math.min(page, totalPages);
  const paginatedRepos = filteredRepos.slice((activePage - 1) * pageSize, activePage * pageSize);

  const scannedCount = repos.filter((repo) => repo.lastScanned !== "Not yet scanned").length;
  const unscannedCount = repos.length - scannedCount;

  return (
    <section className="repo-browser">
      <Surface as="div" className="dashboard-toolbar">
        <div className="dashboard-toolbar-inner">
          <label className="dashboard-search-wrap">
            <SearchIcon size={16} className="dashboard-search-icon" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search repos by owner or name..."
              className="dashboard-search"
            />
          </label>
          <div className="dashboard-filter-group">
            {[
              { value: "all", label: `All ${repos.length}` },
              { value: "scanned", label: `Scanned ${scannedCount}` },
              { value: "unscanned", label: `Unscanned ${unscannedCount}` }
            ].map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={statusFilter === filter.value ? "dashboard-filter-pill active" : "dashboard-filter-pill"}
                  onClick={() => {
                    setStatusFilter(filter.value as typeof statusFilter);
                    setPage(1);
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
        </div>
      </Surface>

      <div className="dashboard-card-grid">
        {paginatedRepos.map((repo) => (
          <Surface as="article" key={repo.fullName} className="repo-card repo-card-sleek">
            <div className="repo-card-topline">
              <span className="repo-chip repo-chip-outline">{formatLabel(repo.framework)}</span>
              <span className={repo.lastScanned === "Not yet scanned" ? "repo-chip" : "repo-chip repo-chip-accent"}>
                {repo.lastScanned === "Not yet scanned" ? "Awaiting scan" : "Snapshot saved"}
              </span>
            </div>

            <div className="repo-card-content">
              <div className="repo-card-title">{repo.name}</div>
              <div className="repo-card-subtitle">{repo.owner}</div>
              <div className="repo-meta-line repo-meta-offset">
                {repo.fullName}
              </div>
            </div>

            <div className="repo-card-stats">
              <div className="repo-stat-block">
                <div className="repo-stat-label">Last scan</div>
                <div className="repo-stat-value">
                  {repo.lastScanned === "Not yet scanned" ? "Pending" : formatLastScanned(repo.lastScanned)}
                </div>
              </div>
              <div className="repo-stat-block">
                <div className="repo-stat-label">Top platform</div>
                <div className="repo-stat-value">
                  {repo.topPlatform ?? "Not scored"}
                </div>
              </div>
            </div>

            <div className="repo-meta-line repo-tags-row">
              {repo.repoTopology ? <span className="repo-chip">{formatLabel(repo.repoTopology)}</span> : null}
              {repo.primaryAppRoot ? (
                <span className="repo-chip repo-chip-outline">Primary app: {formatRoot(repo.primaryAppRoot)}</span>
              ) : null}
              {repo.repoClass ? <span className="repo-chip repo-chip-outline">{formatLabel(repo.repoClass)}</span> : null}
              {repo.topArchetype ? <span className="repo-chip">{formatLabel(repo.topArchetype)}</span> : null}
            </div>

            <div className="repo-card-footer">
              <div className="repo-card-context">
                <SparklesIcon size={15} className="repo-context-icon" />
                <span>
                  {repo.topPlatform
                    ? `Best fit: ${repo.topPlatform}`
                    : "No scan yet — open to run first analysis."}
                </span>
              </div>
              <Link href={`/chat/${repo.id}`} className="repo-plan-button">
                Plan deployment
                <ArrowUpRightIcon size={16} />
              </Link>
            </div>
          </Surface>
        ))}
      </div>

      {filteredRepos.length === 0 ? (
        <Surface className="repo-empty-state">
          <div className="repo-empty-title">No repositories match this view</div>
          <div className="muted">Try a different search term or switch the scan-state filter.</div>
        </Surface>
      ) : (
        <div className="dashboard-pagination">
          <div className="muted repo-pagination-copy">
            Showing {(activePage - 1) * pageSize + 1}-{Math.min(activePage * pageSize, filteredRepos.length)} of {filteredRepos.length}
          </div>
          <div className="dashboard-pagination-controls">
            <button
              type="button"
              className="dashboard-filter-pill"
              disabled={activePage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <span className="repo-chip">{activePage} / {totalPages}</span>
            <button
              type="button"
              className="dashboard-filter-pill"
              disabled={activePage === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

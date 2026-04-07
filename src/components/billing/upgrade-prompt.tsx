"use client";

import Link from "next/link";
import { PLAN_LIMITS } from "@/config/plans";

interface UpgradePromptProps {
  kind: "scan_quota" | "private_quota";
}

export function UpgradePrompt({ kind }: UpgradePromptProps) {
  const isPrivate = kind === "private_quota";

  const heading = isPrivate
    ? "Private repo scan limit reached"
    : "Monthly scan limit reached";

  const body = isPrivate
    ? `You've used your ${PLAN_LIMITS.FREE.privateScansPerMonth} free private scan${PLAN_LIMITS.FREE.privateScansPerMonth === 1 ? "" : "s"} this month. Upgrade to Pro for unlimited private repo scanning.`
    : `You've used all ${PLAN_LIMITS.FREE.publicScansPerMonth} free public scans this month. Upgrade to Pro for unlimited scans.`;

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "80px auto",
        padding: "32px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "var(--accent-blue)",
          marginBottom: 16,
          fontFamily: "var(--font-mono)",
        }}
      >
        {isPrivate ? "// private_quota" : "// scan_quota"}
      </div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 12,
        }}
      >
        {heading}
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          marginBottom: 28,
        }}
      >
        {body}
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/pricing" className="action-link action-link-primary" style={{ borderRadius: 12, fontSize: 13 }}>
          View pricing →
        </Link>
        <Link href="/dashboard" className="action-link" style={{ borderRadius: 12, fontSize: 13 }}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

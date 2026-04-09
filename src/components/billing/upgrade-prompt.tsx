"use client";

import Link from "next/link";

import { PLAN_LIMITS } from "@/config/plans";
import { Surface } from "@/components/ui/surface";
import { Heading, Kicker, Lead } from "@/components/ui/typography";

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
    <Surface className="upgrade-prompt">
      <Kicker className="upgrade-prompt-kicker">
        {isPrivate ? "// private_quota" : "// scan_quota"}
      </Kicker>
      <Heading as="h2" size="card" className="upgrade-prompt-title">
        {heading}
      </Heading>
      <Lead className="upgrade-prompt-copy">
        {body}
      </Lead>
      <div className="upgrade-prompt-actions">
        <Link href="/pricing" className="action-link action-link-primary upgrade-prompt-cta">
          View pricing →
        </Link>
        <Link href="/dashboard" className="action-link upgrade-prompt-cta">
          Back to dashboard
        </Link>
      </div>
    </Surface>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { PLAN_PRICES } from "@/config/plans";

export const metadata: Metadata = {
  title: "Upgrade — Shipd",
};

type Plan = "pro" | "team";

const PLAN_INFO: Record<Plan, { name: string; price: string; features: string[] }> = {
  pro: {
    name: "Pro",
    price: `${PLAN_PRICES.PRO.display}/mo`,
    features: [
      "Unlimited deployment plans",
      "Public & private repos",
      "Advanced config detection",
      "Docker, CI/CD, env var support",
      "Deployment history & diffs",
    ],
  },
  team: {
    name: "Team",
    price: `${PLAN_PRICES.TEAM.display}/mo`,
    features: [
      "Everything in Pro",
      "Up to 10 seats",
      "Shared deployment plans",
      "Slack notifications",
      "Deployment audit log",
      "Priority support",
    ],
  },
};

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: rawPlan } = await searchParams;
  const plan: Plan = rawPlan === "team" ? "team" : "pro";
  const info = PLAN_INFO[plan];

  const mailtoSubject = encodeURIComponent(`Upgrade to Shipd ${info.name}`);
  const mailtoBody = encodeURIComponent(
    `Hi,\n\nI'd like to upgrade to the ${info.name} plan (${info.price}).\n\nThanks`
  );

  return (
    <main
      style={{
        background: "var(--bg-base)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          padding: "48px 40px",
          textAlign: "center",
        }}
      >
        {/* Status badge */}
        <div
          style={{
            display: "inline-block",
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#e8ff47",
            border: "1px solid rgba(232,255,71,0.3)",
            padding: "4px 12px",
            marginBottom: 28,
            fontFamily: "var(--font-mono)",
          }}
        >
          Coming soon
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          {info.name} — {info.price}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Billing is being set up. Drop us a line and you&apos;ll be first to
          know the moment paid plans go live — we&apos;ll honour your interest
          with a discount.
        </p>

        {/* Feature list */}
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            marginBottom: 32,
            textAlign: "left",
          }}
        >
          {info.features.map((f) => (
            <li
              key={f}
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                padding: "6px 0",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                gap: 10,
                fontFamily: "var(--font-mono)",
              }}
            >
              <span style={{ color: "#e8ff47" }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={`mailto:hello@shipd.io?subject=${mailtoSubject}&body=${mailtoBody}`}
          style={{
            display: "block",
            padding: "13px",
            background: "#e8ff47",
            color: "#000",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 1,
            textDecoration: "none",
            marginBottom: 16,
          }}
        >
          Express interest via email →
        </a>
        <Link
          href="/pricing"
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontFamily: "var(--font-mono)",
          }}
        >
          ← Back to pricing
        </Link>
      </div>
    </main>
  );
}

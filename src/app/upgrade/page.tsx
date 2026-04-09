import Link from "next/link";
import type { Metadata } from "next";

import { PLAN_PRICES } from "@/config/plans";
import { Surface } from "@/components/ui/surface";
import { Heading, Kicker, Lead } from "@/components/ui/typography";

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
    <main className="upgrade-page">
      <Surface className="upgrade-card">
        {/* Status badge */}
        <Kicker className="upgrade-kicker">
          Coming soon
        </Kicker>

        <Heading as="h1" size="hero" className="upgrade-title">
          {info.name} — {info.price}
        </Heading>
        <Lead className="upgrade-copy">
          Billing is being set up. Drop us a line and you&apos;ll be first to
          know the moment paid plans go live — we&apos;ll honour your interest
          with a discount.
        </Lead>

        {/* Feature list */}
        <ul className="upgrade-feature-list">
          {info.features.map((f) => (
            <li key={f} className="upgrade-feature-item">
              <span className="upgrade-feature-check">✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={`mailto:hello@shipd.io?subject=${mailtoSubject}&body=${mailtoBody}`}
          className="action-link action-link-primary upgrade-primary-cta"
        >
          Express interest via email →
        </a>
        <Link href="/pricing" className="upgrade-back-link">
          ← Back to pricing
        </Link>
      </Surface>
    </main>
  );
}

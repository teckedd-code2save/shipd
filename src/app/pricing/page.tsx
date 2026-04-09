import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Heading, Kicker, Lead, FinePrint } from "@/components/ui/typography";
import { PLAN_LIMITS, PLAN_PRICES } from "@/config/plans";

export const metadata = {
  title: "Pricing — Shipd",
  description: "Straightforward pricing for repo-aware deployment planning.",
};

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: PLAN_PRICES.FREE.display,
    period: "forever",
    desc: "For trying Shipd on public repos before you need deeper coverage.",
    features: [
      { label: `${PLAN_LIMITS.FREE.publicScansPerMonth} deployment plans / month`, on: true },
      { label: "Public repos", on: true },
      { label: "Basic config detection", on: true },
      { label: "Private repos", on: false },
      { label: "Deployment history", on: false },
      { label: "Team sharing", on: false },
    ],
    cta: { label: "Get started free", href: "/dashboard" },
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: PLAN_PRICES.PRO.display,
    period: "per month",
    desc: "For developers who want unlimited plans, private repos, and better deployment context.",
    features: [
      { label: "Unlimited deployment plans", on: true },
      { label: "Public & private repos", on: true },
      { label: "Advanced config detection", on: true },
      { label: "Docker, CI/CD, env var support", on: true },
      { label: "Deployment history & diffs", on: true },
      { label: "Team seats", on: false },
    ],
    cta: { label: `Start Pro — ${PLAN_PRICES.PRO.display}/mo`, href: "/upgrade?plan=pro" },
    featured: true,
  },
  {
    id: "team",
    name: "Team",
    price: PLAN_PRICES.TEAM.display,
    period: "per month",
    desc: "For teams that need shared plans, auditability, and fewer deployment surprises.",
    features: [
      { label: "Everything in Pro", on: true },
      { label: "Up to 10 seats", on: true },
      { label: "Shared deployment plans", on: true },
      { label: "Slack notifications", on: true },
      { label: "Deployment audit log", on: true },
      { label: "Priority support", on: true },
    ],
    cta: { label: `Start Team — ${PLAN_PRICES.TEAM.display}/mo`, href: "/upgrade?plan=team" },
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="page pricing-page">

        {/* Hero */}
        <div className="pricing-hero">
          <Kicker className="pricing-kicker">
            Pricing
          </Kicker>
          <Heading as="h1" size="display" className="pricing-title">
            Pricing that matches how deeply you need to plan.
          </Heading>
          <Lead className="pricing-copy">
            Start free on public repos. Upgrade when you need private repo support, unlimited plans, shared context, and more operational confidence.
          </Lead>
          <FinePrint className="pricing-code-copy">
            {"// no credit card required to start"}
          </FinePrint>
        </div>

        {/* Plan cards */}
        <div className="pricing-grid">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={tier.featured ? "panel pricing-card pricing-card-featured" : "panel pricing-card"}
            >
              {tier.featured && (
                <div className="pricing-card-badge">
                  Most popular
                </div>
              )}

              <div className="pricing-card-inner">
                {/* Plan name */}
                <div className={tier.featured ? "pricing-plan-name pricing-plan-name-featured" : "pricing-plan-name"}>
                  {tier.name}
                </div>

                {/* Price */}
                <div className="pricing-price">
                  {tier.price}
                </div>
                <div className="pricing-period">
                  {tier.period}
                </div>

                {/* Desc */}
                <p className="pricing-desc">
                  {tier.desc}
                </p>

                {/* Divider */}
                <div className="pricing-divider" />

                {/* Features */}
                <ul className="pricing-features">
                  {tier.features.map((f) => (
                    <li
                      key={f.label}
                      className={f.on ? "pricing-feature" : "pricing-feature pricing-feature-off"}
                    >
                      <span className={f.on ? "pricing-feature-mark" : "pricing-feature-mark pricing-feature-mark-off"}>
                        {f.on ? "✓" : "✗"}
                      </span>
                      {f.label}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tier.cta.href as never}
                  className={
                    tier.featured
                      ? "action-link action-link-primary pricing-card-cta"
                      : "action-link pricing-card-cta pricing-card-cta-secondary"
                  }
                >
                  {tier.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="pricing-bottom">
          <p className="pricing-bottom-copy">
            Not sure which plan? Start free — no credit card required.
          </p>
          <Link
            href="/dashboard"
            className="action-link action-link-primary pricing-bottom-cta"
          >
            Get started free →
          </Link>
        </div>

      </main>
    </>
  );
}

import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { PLAN_LIMITS, PLAN_PRICES } from "@/config/plans";

export const metadata = {
  title: "Pricing — Shipd",
  description: "Simple, honest pricing for deployment planning. Start free.",
};

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: PLAN_PRICES.FREE.display,
    period: "forever",
    desc: "For solo devs exploring Shipd.",
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
    desc: "For developers who ship regularly.",
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
    desc: "For teams who can't afford a broken deploy.",
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

const FAQS = [
  {
    q: "Do I need to install anything?",
    a: "Nope. Shipd reads your existing config files directly. No CLI installs, no code changes, no new dependencies.",
  },
  {
    q: "What repos does Shipd support?",
    a: `Any GitHub repo. Free tier covers public repos (${PLAN_LIMITS.FREE.publicScansPerMonth} scans/month). Pro and Team unlock unlimited private repos.`,
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancel anytime, no questions asked. You keep access until the end of your billing period.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "The Free plan is your trial. Use it until you're ready to unlock unlimited plans and private repos.",
  },
  {
    q: 'What counts as a "deployment plan"?',
    a: `Each time Shipd analyzes a repo and generates a deployment plan, that counts as one. Free users get ${PLAN_LIMITS.FREE.publicScansPerMonth} per month; Pro and Team get unlimited.`,
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="page" style={{ maxWidth: 1000 }}>

        {/* Hero */}
        <div style={{ textAlign: "center", paddingTop: 48, paddingBottom: 56 }}>
          <div
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent-blue)",
              border: "1px solid rgba(91,108,242,0.3)",
              padding: "4px 14px",
              borderRadius: 999,
              marginBottom: 24,
            }}
          >
            Pricing
          </div>
          <h1
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 700,
              letterSpacing: "-0.05em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Simple, honest pricing.
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 15,
              lineHeight: 1.7,
              maxWidth: 400,
              margin: "0 auto",
            }}
          >
            No installs. No config changes. Connect your repo and go.
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 10,
            }}
          >
            {"// no credit card required to start"}
          </p>
        </div>

        {/* Plan cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 72,
          }}
        >
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className="panel"
              style={
                tier.featured
                  ? {
                      border: "1px solid rgba(91,108,242,0.5)",
                      background:
                        "linear-gradient(180deg, rgba(91,108,242,0.08), transparent 32%), var(--bg-surface)",
                      position: "relative",
                    }
                  : { position: "relative" }
              }
            >
              {tier.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    background: "linear-gradient(135deg, #5b6cf2, #4a5be3)",
                    color: "#fff",
                    padding: "3px 12px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                  }}
                >
                  Most popular
                </div>
              )}

              <div style={{ padding: "32px 28px" }}>
                {/* Plan name */}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: tier.featured ? "#aab3ff" : "var(--text-muted)",
                    marginBottom: 16,
                  }}
                >
                  {tier.name}
                </div>

                {/* Price */}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 44,
                    fontWeight: 700,
                    letterSpacing: "-0.05em",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {tier.price}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginBottom: 20,
                  }}
                >
                  {tier.period}
                </div>

                {/* Desc */}
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    marginBottom: 24,
                    minHeight: 40,
                  }}
                >
                  {tier.desc}
                </p>

                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    background: "rgba(255,255,255,0.06)",
                    marginBottom: 20,
                  }}
                />

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
                  {tier.features.map((f) => (
                    <li
                      key={f.label}
                      style={{
                        fontSize: 12,
                        color: f.on ? "var(--text-secondary)" : "var(--text-muted)",
                        padding: "6px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          color: f.on ? "var(--accent-blue)" : "var(--text-muted)",
                          flexShrink: 0,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {f.on ? "✓" : "✗"}
                      </span>
                      {f.label}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tier.cta.href}
                  className={`action-link${tier.featured ? " action-link-primary" : ""}`}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    borderRadius: 12,
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    ...(tier.featured
                      ? {}
                      : {
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "var(--text-secondary)",
                        }),
                  }}
                >
                  {tier.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 600, margin: "0 auto 80px" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textAlign: "center",
              marginBottom: 28,
            }}
          >
            {"// common questions"}
          </p>

          <style>{`
            .faq-item summary {
              list-style: none;
              cursor: pointer;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 16px;
              padding: 18px 0;
              font-size: 13px;
              color: var(--text-primary);
              border-top: 1px solid rgba(255,255,255,0.06);
            }
            .faq-item summary::-webkit-details-marker { display: none; }
            .faq-item summary::after {
              content: '+';
              color: var(--accent-blue);
              font-size: 18px;
              line-height: 1;
              flex-shrink: 0;
              font-family: var(--font-mono);
            }
            .faq-item[open] summary::after { content: '−'; }
            .faq-item .faq-body {
              font-size: 12px;
              color: var(--text-secondary);
              line-height: 1.7;
              padding-bottom: 16px;
            }
            .faq-last { border-bottom: 1px solid rgba(255,255,255,0.06); }
          `}</style>

          {FAQS.map((f, i) => (
            <details key={f.q} className={`faq-item${i === FAQS.length - 1 ? " faq-last" : ""}`}>
              <summary>{f.q}</summary>
              <p className="faq-body">{f.a}</p>
            </details>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", paddingBottom: 48 }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
            Not sure which plan? Start free — no credit card required.
          </p>
          <Link
            href="/dashboard"
            className="action-link action-link-primary"
            style={{ display: "inline-flex", borderRadius: 12, fontSize: 13 }}
          >
            Get started free →
          </Link>
        </div>

      </main>
    </>
  );
}

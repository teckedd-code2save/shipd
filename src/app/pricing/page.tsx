"use client";

import Link from "next/link";
import { IBM_Plex_Mono, Syne } from "next/font/google";
import { useState } from "react";
import { PLAN_LIMITS, PLAN_PRICES } from "@/config/plans";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--pricing-mono",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--pricing-syne",
});

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = {
  page: {
    background: "#0a0a0a",
    color: "#f0f0f0",
    minHeight: "100vh",
    overflowX: "hidden" as const,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  grid: {
    position: "fixed" as const,
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none" as const,
    zIndex: 0,
  },
  nav: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 40px",
    borderBottom: "1px solid #1e1e1e",
    background: "rgba(10,10,10,0.85)",
    backdropFilter: "blur(12px)",
  },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: "-0.5px",
    color: "#f0f0f0",
    textDecoration: "none",
  },
  navCta: {
    fontSize: 12,
    color: "#e8ff47",
    textDecoration: "none",
    border: "1px solid #e8ff47",
    padding: "7px 16px",
  },
  hero: {
    position: "relative" as const,
    zIndex: 1,
    padding: "160px 40px 80px",
    textAlign: "center" as const,
  },
  badge: {
    display: "inline-block",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    color: "#e8ff47",
    border: "1px solid rgba(232,255,71,0.3)",
    padding: "5px 14px",
    marginBottom: 32,
  },
  h1: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: "clamp(36px, 6vw, 72px)",
    lineHeight: 1.05,
    letterSpacing: "-2px",
    marginBottom: 20,
  },
  heroP: {
    fontSize: 14,
    color: "#666",
    maxWidth: 420,
    margin: "0 auto 16px",
    lineHeight: 1.7,
  },
  githubBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#aaa",
    textDecoration: "none",
    border: "1px solid #2e2e2e",
    padding: "8px 18px",
    marginTop: 20,
    transition: "border-color 0.2s, color 0.2s",
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: PLAN_PRICES.FREE.display,
    period: "forever",
    desc: "For solo devs exploring Shipd.",
    features: [
      { label: `${PLAN_LIMITS.FREE.publicScansPerMonth} deployment plans / month`, on: true },
      { label: `${PLAN_LIMITS.FREE.privateScansPerMonth} private repo scan / month`, on: true },
      { label: "Public repos", on: true },
      { label: "Basic config detection", on: true },
      { label: "Deployment history", on: false },
      { label: "Team sharing", on: false },
    ],
    cta: { label: "Get started free", href: "/dashboard" },
    style: "ghost" as const,
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
    cta: {
      label: `Start Pro — ${PLAN_PRICES.PRO.display}/mo`,
      href: "/upgrade?plan=pro",
    },
    style: "primary" as const,
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
    cta: {
      label: `Start Team — ${PLAN_PRICES.TEAM.display}/mo`,
      href: "/upgrade?plan=team",
    },
    style: "outline" as const,
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
    a: `Any GitHub repo. Free tier covers public repos (${PLAN_LIMITS.FREE.publicScansPerMonth} scans/month) plus ${PLAN_LIMITS.FREE.privateScansPerMonth} private scan. Pro and Team unlock unlimited private repos.`,
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
    a: `Each time Shipd analyzes a repo and generates a deployment plan, that counts as one. Free users get ${PLAN_LIMITS.FREE.publicScansPerMonth} public + ${PLAN_LIMITS.FREE.privateScansPerMonth} private per month; Pro and Team users get unlimited.`,
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function PlanCard({ tier }: { tier: (typeof TIERS)[number] }) {
  const btnStyle: React.CSSProperties =
    tier.style === "primary"
      ? { background: "#e8ff47", color: "#000", border: "none" }
      : tier.style === "outline"
        ? {
            background: "transparent",
            color: "#f0f0f0",
            border: "1px solid #2e2e2e",
          }
        : {
            background: "transparent",
            color: "#666",
            border: "1px solid #2e2e2e",
          };

  return (
    <div
      style={{
        background: tier.featured ? "#0e0e0e" : "#111111",
        padding: "40px 32px",
        position: "relative",
        borderTop: tier.featured ? "2px solid #e8ff47" : "none",
        flex: 1,
        minWidth: 240,
      }}
    >
      {tier.featured && (
        <div
          style={{
            position: "absolute",
            top: -1,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 9,
            letterSpacing: 2,
            background: "#e8ff47",
            color: "#000",
            padding: "4px 12px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          MOST POPULAR
        </div>
      )}
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: tier.featured ? "#e8ff47" : "#666",
          marginBottom: 20,
        }}
      >
        {tier.name}
      </div>
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 48,
          letterSpacing: "-2px",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {tier.price}
      </div>
      <div style={{ fontSize: 11, color: "#666", marginBottom: 28 }}>
        {tier.period}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#666",
          lineHeight: 1.6,
          marginBottom: 28,
          minHeight: 36,
        }}
      >
        {tier.desc}
      </div>
      <div style={{ height: 1, background: "#1e1e1e", marginBottom: 24 }} />
      <ul style={{ listStyle: "none", padding: 0, marginBottom: 36 }}>
        {tier.features.map((f) => (
          <li
            key={f.label}
            style={{
              fontSize: 12,
              color: f.on ? "#aaa" : "#333",
              padding: "7px 0",
              borderBottom: "1px solid #1e1e1e",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ color: f.on ? "#e8ff47" : "#333", flexShrink: 0 }}>
              {f.on ? "✓" : "✗"}
            </span>
            {f.label}
          </li>
        ))}
      </ul>
      <a
        href={tier.cta.href}
        style={{
          display: "block",
          width: "100%",
          padding: "13px",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 1,
          textAlign: "center",
          textDecoration: "none",
          cursor: "pointer",
          ...btnStyle,
        }}
      >
        {tier.cta.label}
      </a>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid #1e1e1e", padding: "20px 0" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          all: "unset",
          width: "100%",
          fontSize: 13,
          fontWeight: 500,
          color: "#f0f0f0",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {q}
        <span
          style={{
            color: "#e8ff47",
            fontSize: 18,
            flexShrink: 0,
            transform: open ? "rotate(45deg)" : "none",
            transition: "transform 0.2s",
            display: "inline-block",
          }}
        >
          +
        </span>
      </button>
      {open && (
        <p
          style={{
            fontSize: 12,
            color: "#666",
            lineHeight: 1.7,
            marginTop: 12,
            marginBottom: 0,
          }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div
      className={`${ibmPlexMono.variable} ${syne.variable}`}
      style={S.page}
    >
      {/* Background grid */}
      <div style={S.grid} />

      {/* Nav */}
      <nav style={S.nav}>
        <Link href="/" style={S.logo}>
          ship<span style={{ color: "#e8ff47" }}>d</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a
            href="https://github.com/teckedd-code2save/shipd"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: "#666", textDecoration: "none" }}
          >
            ★ GitHub
          </a>
          <a href="/dashboard" style={S.navCta}>
            → Open app
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={S.hero}>
        <div style={S.badge}>Pricing</div>
        <h1 style={S.h1}>
          Ship with
          <br />
          <em style={{ fontStyle: "normal", color: "#e8ff47" }}>confidence.</em>
          <br />
          Start free.
        </h1>
        <p style={S.heroP}>
          No installs. No config changes. Just connect your repo and go.
        </p>
        <div style={{ fontSize: 11, color: "#444" }}>
          {"// no credit card required to start"}
        </div>
        <div style={{ marginTop: 24 }}>
          <a
            href="https://github.com/teckedd-code2save/shipd"
            target="_blank"
            rel="noopener noreferrer"
            style={S.githubBtn}
          >
            <span>★</span>
            Star on GitHub
          </a>
        </div>
      </section>

      {/* Plans */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          maxWidth: 960,
          margin: "0 auto 80px",
          padding: "0 40px",
          background: "#1e1e1e",
          border: "1px solid #1e1e1e",
        }}
      >
        {TIERS.map((tier) => (
          <PlanCard key={tier.id} tier={tier} />
        ))}
      </div>

      {/* FAQ */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 640,
          margin: "0 auto 100px",
          padding: "0 40px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#666",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          {"// common questions"}
        </h2>
        {FAQS.map((f) => (
          <FaqItem key={f.q} q={f.q} a={f.a} />
        ))}
        <div style={{ borderTop: "1px solid #1e1e1e" }} />
      </div>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid #1e1e1e",
          padding: "28px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: "#666",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span>© {new Date().getFullYear()} Shipd</span>
        <span>
          Not sure which plan?{" "}
          <a href="/dashboard" style={{ color: "#e8ff47", textDecoration: "none" }}>
            Start free →
          </a>
        </span>
      </footer>
    </div>
  );
}

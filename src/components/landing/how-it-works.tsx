"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    number: "01",
    title: "Detects your app type",
    desc: "Reads package.json, Dockerfile, CI configs, and more — zero setup.",
  },
  {
    number: "02",
    title: "Finds the best platform",
    desc: "Scores Railway, Fly.io, Vercel, Render, and more against your stack.",
  },
  {
    number: "03",
    title: "Explains the tradeoffs",
    desc: "You see why each platform fits — or doesn't — for your exact repo.",
  },
  {
    number: "04",
    title: "Hands you a deploy plan",
    desc: "Step-by-step instructions, env vars, and config files ready to go.",
  },
];

const INTERVAL = 3200;

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPhase("out");
      setTimeout(() => {
        setActive((a) => (a + 1) % STEPS.length);
        setPhase("in");
      }, 320);
    }, INTERVAL);

    return () => clearTimeout(timeout);
  }, [active]);

  const step = STEPS[active];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
      }}
    >
      {/* Step dots nav */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {STEPS.map((s, i) => (
          <button
            key={s.number}
            onClick={() => {
              setPhase("out");
              setTimeout(() => {
                setActive(i);
                setPhase("in");
              }, 160);
            }}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              background: i === active ? "rgba(91,108,242,0.15)" : "transparent",
              border: `1px solid ${i === active ? "rgba(91,108,242,0.4)" : "rgba(255,255,255,0.07)"}`,
              transition: "all 0.2s ease",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.1em",
                color: i === active ? "var(--accent-blue)" : "var(--text-muted)",
                transition: "color 0.2s ease",
              }}
            >
              {s.number}
            </span>
          </button>
        ))}
      </div>

      {/* Animated content */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          minHeight: 108,
          position: "relative",
          textAlign: "center",
        }}
      >
        <div
          style={{
            opacity: phase === "in" ? 1 : 0,
            transform: phase === "in" ? "translateY(0)" : "translateY(-12px)",
            transition: "opacity 0.32s ease, transform 0.32s ease",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              color: "var(--accent-blue)",
              marginBottom: 10,
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            {step.number} / 04
          </p>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              marginBottom: 10,
              color: "var(--text-primary)",
            }}
          >
            {step.title}
          </h3>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {step.desc}
          </p>
        </div>
      </div>

    </div>
  );
}

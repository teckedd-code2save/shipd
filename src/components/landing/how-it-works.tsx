"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    number: "01",
    title: "Scans the repo signals",
    desc: "Reads package.json, Dockerfile, CI workflows, env files, and infra folders with zero setup.",
  },
  {
    number: "02",
    title: "Detects deployment shape",
    desc: "Understands framework, runtime, topology, and the deployment pattern your codebase implies.",
  },
  {
    number: "03",
    title: "Scores 11 hosting platforms",
    desc: "Compares Vercel, Railway, Render, Fly.io, and more against the exact needs of your repo.",
  },
  {
    number: "04",
    title: "Builds the deployment plan",
    desc: "Returns blockers, tradeoffs, setup steps, and a saved recommendation you can revisit.",
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
    <div className="landing-how-it-works">
      {/* Step dots nav */}
      <div className="landing-how-it-works-nav">
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
            className={i === active ? "landing-how-it-works-dot is-active" : "landing-how-it-works-dot"}
          >
            <span className={i === active ? "landing-how-it-works-dot-label is-active" : "landing-how-it-works-dot-label"}>
              {s.number}
            </span>
          </button>
        ))}
      </div>

      {/* Animated content */}
      <div className="landing-how-it-works-content-wrap">
        <div className={phase === "in" ? "landing-how-it-works-content is-in" : "landing-how-it-works-content is-out"}>
          <p className="landing-how-it-works-step">
            {step.number} / 04
          </p>
          <h3 className="landing-how-it-works-title">
            {step.title}
          </h3>
          <p className="landing-how-it-works-copy">
            {step.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const SCAN_MESSAGES = [
  "Reading the file structure...",
  "Looking for framework signals...",
  "Checking runtime and dependencies...",
  "Scanning CI/CD workflows...",
  "Analysing environment variables...",
  "Detecting platform configurations...",
  "Scoring deployment options...",
  "Weighing platform tradeoffs...",
  "Building your deployment plan...",
  "Almost there..."
];

export default function ChatLoading() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => Math.min(i + 1, SCAN_MESSAGES.length - 1));
        setFading(false);
      }, 350);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="scan-loading-page">
      <div className="scan-loading-content">
        <div className="scan-loading-spinner">
          <span /><span /><span /><span />
        </div>
        <div className={`scan-loading-message${fading ? " fading" : ""}`}>
          {SCAN_MESSAGES[index]}
        </div>
        <div className="scan-loading-sub">Shipd is analysing the repository</div>
      </div>
    </main>
  );
}

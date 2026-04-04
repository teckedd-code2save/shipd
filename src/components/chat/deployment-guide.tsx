"use client";

import { useState } from "react";
import { CheckIcon, ChevronDownIcon, TerminalIcon } from "@/components/ui/icons";

interface DeploymentStep {
  title: string;
  description: string;
  commands?: string[];
  notes?: string;
  category: "setup" | "config" | "deploy" | "verify";
}

interface DeploymentGuideProps {
  steps: DeploymentStep[];
  platform: string;
}

const CATEGORY_META: Record<DeploymentStep["category"], { label: string; color: string }> = {
  setup: { label: "Setup", color: "guide-badge-setup" },
  config: { label: "Config", color: "guide-badge-config" },
  deploy: { label: "Deploy", color: "guide-badge-deploy" },
  verify: { label: "Verify", color: "guide-badge-verify" }
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <button type="button" className="guide-copy-btn" onClick={handleCopy} aria-label="Copy command">
      {copied ? <CheckIcon size={13} /> : <span className="guide-copy-label">copy</span>}
    </button>
  );
}

function StepCard({
  step,
  index,
  done,
  onToggle
}: {
  step: DeploymentStep;
  index: number;
  done: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const meta = CATEGORY_META[step.category];

  return (
    <div className={`guide-step${done ? " guide-step-done" : ""}`}>
      <div
        className="guide-step-header"
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpanded((prev) => !prev); }}
        aria-expanded={expanded}
      >
        <button
          type="button"
          className={`guide-check${done ? " guide-check-done" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          aria-label={done ? "Mark incomplete" : "Mark complete"}
        >
          {done ? <CheckIcon size={13} /> : null}
        </button>

        <div className="guide-step-number">{index + 1}</div>

        <div className="guide-step-meta">
          <span className={`guide-badge ${meta.color}`}>{meta.label}</span>
          <span className={`guide-step-title${done ? " guide-step-title-done" : ""}`}>{step.title}</span>
        </div>

        <ChevronDownIcon
          size={16}
          className={`guide-chevron${expanded ? " guide-chevron-open" : ""}`}
        />
      </div>

      {expanded ? (
        <div className="guide-step-body">
          <p className="guide-step-description">{step.description}</p>

          {step.commands && step.commands.length > 0 ? (
            <div className="guide-commands">
              {step.commands.map((cmd, i) => (
                <div key={i} className="guide-command-row">
                  <TerminalIcon size={13} className="guide-terminal-icon" />
                  <code className="guide-command">{cmd}</code>
                  <CopyButton text={cmd} />
                </div>
              ))}
            </div>
          ) : null}

          {step.notes ? (
            <div className="guide-step-notes">{step.notes}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function DeploymentGuide({ steps, platform }: DeploymentGuideProps) {
  const [done, setDone] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const completedCount = done.size;
  const totalCount = steps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (steps.length === 0) {
    return (
      <div className="guide-empty">
        <p>No deployment steps available yet.</p>
        <p className="guide-empty-hint">Ask Shipd in the chat for a step-by-step deployment guide.</p>
      </div>
    );
  }

  return (
    <div className="guide-root">
      <div className="guide-progress-header">
        <div className="guide-progress-label">
          <span className="guide-progress-platform">{platform}</span>
          <span className="guide-progress-count">{completedCount} of {totalCount} steps complete</span>
        </div>
        <div className="guide-progress-bar-track">
          <div
            className="guide-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
        </div>
      </div>

      <div className="guide-steps">
        {steps.map((step, index) => (
          <StepCard
            key={index}
            step={step}
            index={index}
            done={done.has(index)}
            onToggle={() => toggle(index)}
          />
        ))}
      </div>

      {completedCount === totalCount && totalCount > 0 ? (
        <div className="guide-complete-banner">
          <CheckIcon size={16} />
          All steps complete — your {platform} deployment should be live.
        </div>
      ) : null}
    </div>
  );
}

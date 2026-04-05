"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getPlatformSteps } from "@/lib/analysis/platform-steps";
import { SendIcon, SparklesIcon } from "@/components/ui/icons";

type PlanFitType = "clean" | "multi_service" | "no_fit";

interface DeploymentPlan {
  title: string;
  summary: string;
  topPlatform: string;
  score: number;
  confidence: number;
  blockers: string[];
  warnings: string[];
  nextSteps: string[];
  fitType?: PlanFitType;
  altPaths?: string[];
}

interface ChatWorkspaceProps {
  repoId: string;
  repoLabel: string;
  initialPlan: DeploymentPlan;
  repoClass?: string;
  framework?: string;
  runtime?: string;
  primaryAppRoot?: string;
  topology?: string;
}

interface ChatBubble {
  id: string;
  role: "assistant" | "user";
  text: string;
  plan?: DeploymentPlan;
  framework?: string;
  pending?: boolean;
}

// ─── Clipboard ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <button type="button" className="step-copy-btn" onClick={handleCopy} aria-label="Copy command">
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Markdown renderer ───────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="chat-inline-code">{part.slice(1, -1)}</code>;
    return part;
  });
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  const pending: { type: "ul" | "ol"; items: string[] } = { type: "ul", items: [] };
  let key = 0;

  function flushList() {
    if (!pending.items.length) return;
    const Tag = pending.type === "ul" ? "ul" : "ol";
    elements.push(
      <Tag key={key++} className={`chat-md-list${pending.type === "ol" ? " chat-md-ol" : ""}`}>
        {pending.items.map((item, i) => <li key={i} className="chat-md-li">{renderInline(item)}</li>)}
      </Tag>
    );
    pending.items = [];
  }

  for (const line of lines) {
    const bullet = line.match(/^[-*]\s+(.+)/);
    const numbered = line.match(/^\d+\.\s+(.+)/);
    const heading = line.match(/^#{2,3}\s+(.+)/);

    if (bullet) { if (pending.type === "ol" && pending.items.length) flushList(); pending.type = "ul"; pending.items.push(bullet[1]!); }
    else if (numbered) { if (pending.type === "ul" && pending.items.length) flushList(); pending.type = "ol"; pending.items.push(numbered[1]!); }
    else {
      flushList();
      if (heading) elements.push(<div key={key++} className="chat-md-heading">{renderInline(heading[1]!)}</div>);
      else if (line.trim()) elements.push(<p key={key++} className="chat-md-para">{renderInline(line)}</p>);
    }
  }
  flushList();
  return <>{elements}</>;
}

// ─── Expandable step ────────────────────────────────────────────────────────

function ExpandableStep({
  step,
  index,
  isOpen,
  onToggle
}: {
  step: ReturnType<typeof getPlatformSteps>[number];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`exp-step${isOpen ? " exp-step-open" : ""}`}>
      <button type="button" className="exp-step-header" onClick={onToggle}>
        <span className="exp-step-num">{index + 1}</span>
        <span className="exp-step-title">{step.title}</span>
        <svg className="exp-step-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="exp-step-body">
          <p className="exp-step-detail">{step.detail}</p>
          {step.command && (
            <div className="exp-step-cmd-row">
              <code className="exp-step-cmd">{step.command}</code>
              <CopyButton text={step.command} />
            </div>
          )}
          {step.actionUrl && (
            <a href={step.actionUrl} target="_blank" rel="noreferrer" className="exp-step-link">
              {step.actionLabel ?? "Open docs"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── No-fit / multi-service card ────────────────────────────────────────────

function NoFitCard({ plan }: { plan: DeploymentPlan }) {
  const isMulti = plan.fitType === "multi_service";
  return (
    <div className="no-fit-card">
      <div className="no-fit-badge">{isMulti ? "Multi-service repository" : "No clean platform fit"}</div>
      <p className="no-fit-copy">{plan.summary}</p>
      {plan.altPaths && plan.altPaths.length > 0 && (
        <>
          <div className="no-fit-section-label">Better deployment paths</div>
          <div className="no-fit-paths">
            {plan.altPaths.map((path, i) => (
              <div key={i} className="no-fit-path">
                <span className="no-fit-path-bullet" />
                {path}
              </div>
            ))}
          </div>
        </>
      )}
      <div className="no-fit-section-label">Closest available option: {plan.topPlatform} ({plan.score}/100)</div>
    </div>
  );
}

// ─── Plan card (initial structured message) ─────────────────────────────────

function PlanCard({
  plan,
  lead,
  framework
}: {
  plan: DeploymentPlan;
  lead: string;
  framework?: string;
}) {
  const isNoFit = plan.fitType === "no_fit" || plan.fitType === "multi_service";
  const steps = useMemo(() => getPlatformSteps(plan.topPlatform, framework), [plan.topPlatform, framework]);
  const [openStep, setOpenStep] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenStep((prev) => (prev === i ? null : i));
  }

  return (
    <div className="chat-plan-card">
      {isNoFit ? (
        <NoFitCard plan={plan} />
      ) : (
        <p className="chat-plan-lead">{lead}</p>
      )}

      {plan.blockers.length > 0 && (
        <div className="chat-plan-section">
          <div className="chat-plan-section-label">Fix before deploying</div>
          <div className="chat-plan-issues">
            {plan.blockers.map((b, i) => (
              <div key={i} className="chat-plan-issue chat-plan-issue-danger">
                <span className="chat-plan-issue-dot" />{b}
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.warnings.length > 0 && (
        <div className="chat-plan-section">
          <div className="chat-plan-section-label">Worth addressing</div>
          <div className="chat-plan-issues">
            {plan.warnings.map((w, i) => (
              <div key={i} className="chat-plan-issue chat-plan-issue-warn">
                <span className="chat-plan-issue-dot" />{w}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="chat-plan-section">
        <div className="chat-plan-section-label">
          {isNoFit ? "If deploying to " + plan.topPlatform : "Deployment steps"}
          <span className="chat-plan-section-hint">click to expand</span>
        </div>
        <div className="exp-steps">
          {steps.map((step, i) => (
            <ExpandableStep
              key={i}
              step={step}
              index={i}
              isOpen={openStep === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Lead text ───────────────────────────────────────────────────────────────

function buildLead({ repoLabel, initialPlan, repoClass, framework, runtime, primaryAppRoot }: ChatWorkspaceProps) {
  const rootSuffix = primaryAppRoot && primaryAppRoot !== "." ? ` (root: ${primaryAppRoot})` : "";

  if (initialPlan.fitType === "no_fit" || initialPlan.score < 30) {
    return `Shipd couldn't identify a deployment platform for ${repoLabel} from the files alone. Ask me anything — I've read the README and can walk you through getting this deployed step by step.`;
  }
  if (repoClass === "insufficient_evidence" || repoClass === "notebook_repo" || repoClass === "library_or_package") {
    return `Shipd couldn't find enough deployment signals in ${repoLabel} to make a strong call yet. Work through the steps below to surface a cleaner path.`;
  }
  if (framework === "csharp" || runtime === "dotnet") {
    return `${repoLabel}${rootSuffix} is a .NET service — ${initialPlan.topPlatform} is the strongest available fit. Expand each step for the exact commands.`;
  }
  if (framework === "nextjs") {
    return `${repoLabel}${rootSuffix} is a Next.js app — ${initialPlan.topPlatform} is the recommended platform. Expand each step to get live.`;
  }
  if (framework === "python" || repoClass === "python_service") {
    return `${repoLabel}${rootSuffix} is a Python service — ${initialPlan.topPlatform} is the best current fit. Expand each step for commands.`;
  }
  return `${repoLabel}${rootSuffix} — ${initialPlan.topPlatform} scores ${initialPlan.score}/100. Expand each step below to deploy.`;
}

function buildQuickPrompts({ framework, runtime, initialPlan }: Pick<ChatWorkspaceProps, "framework" | "runtime" | "initialPlan">) {
  if (framework === "csharp" || runtime === "dotnet") {
    return [`How do I deploy this to ${initialPlan.topPlatform}?`, "Do I need a Dockerfile?", "Why not a different platform?"];
  }
  if (framework === "nextjs") {
    return [`Walk me through deploying to ${initialPlan.topPlatform}`, "What env vars do I need?", "Why not Railway instead?"];
  }
  if (framework === "python" || runtime === "python") {
    return [`How do I get this live on ${initialPlan.topPlatform}?`, "What start command should I use?", "Do I need a Procfile?"];
  }
  if (initialPlan.fitType === "no_fit" || initialPlan.score < 30) {
    return ["How do I deploy this?", "What platform fits this project?", "Walk me through it step by step"];
  }
  return [`Walk me through ${initialPlan.topPlatform} deployment`, "What's blocking production launch?", "Compare all platform options"];
}

// ─── Assistant message ───────────────────────────────────────────────────────

function AssistantMessage({ bubble, lead }: { bubble: ChatBubble; lead: string }) {
  return (
    <div className="chat-message chat-message-assistant">
      <div className="chat-message-avatar"><SparklesIcon size={14} /></div>
      <div>
        <div className="chat-message-body">
          {bubble.plan ? (
            <PlanCard plan={bubble.plan} lead={lead} framework={bubble.framework} />
          ) : bubble.pending ? (
            <>Looking at your repo...<span className="chat-thinking-indicator" aria-label="responding"><span /><span /><span /></span></>
          ) : (
            renderMarkdown(bubble.text)
          )}
        </div>
        <span className="chat-ai-disclaimer">
          {bubble.pending ? "Shipd is responding..." : "AI-generated · may be inaccurate"}
        </span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ChatWorkspace(props: ChatWorkspaceProps) {
  const { repoId, repoLabel, initialPlan, framework, runtime, repoClass, primaryAppRoot } = props;

  const lead = useMemo(
    () => buildLead({ repoId, repoLabel, initialPlan, framework, runtime, repoClass, primaryAppRoot }),
    [framework, initialPlan, primaryAppRoot, repoClass, repoId, repoLabel, runtime]
  );
  const quickPrompts = useMemo(
    () => buildQuickPrompts({ framework, runtime, initialPlan }),
    [framework, runtime, initialPlan]
  );

  const initialBubble: ChatBubble = useMemo(
    () => ({ id: "initial-assistant", role: "assistant", text: lead, plan: initialPlan, framework }),
    [lead, initialPlan, framework]
  );

  const [messages, setMessages] = useState<ChatBubble[]>([initialBubble]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const historyLoaded = useRef(false);

  // Load persisted chat history once per repoId
  useEffect(() => {
    historyLoaded.current = false;
    setMessages([initialBubble]);
    setInput("");
    setIsSubmitting(false);

    void fetch(`/api/chat/history?repoId=${repoId}`)
      .then((r) => r.json())
      .then((data: { messages?: Array<{ id: string; role: string; content: string }> }) => {
        const history = data.messages ?? [];
        if (history.length === 0) return;
        const bubbles: ChatBubble[] = history.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          text: m.content
        }));
        setMessages([initialBubble, ...bubbles]);
        historyLoaded.current = true;
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoId]);

  async function sendMessage(nextInput?: string) {
    const value = (nextInput ?? input).trim();
    if (!value || isSubmitting) return;

    const userMessage: ChatBubble = { id: `user-${Date.now()}`, role: "user", text: value };
    setMessages((prev) => [...prev, userMessage]);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId, message: userMessage.text })
      });
      if (!res.ok) throw new Error("Chat request failed.");
      const payload = (await res.json()) as { message?: string; plan?: DeploymentPlan };
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: payload.message ?? payload.plan?.summary ?? "Shipd could not generate a response for that request."
        }
      ]);
      setInput("");
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `assistant-error-${Date.now()}`, role: "assistant", text: "Shipd could not complete that request. Try again." }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="chat-workspace panel">
      <div className="chat-workspace-header">
        <div>
          <div className="chat-workspace-title">{initialPlan.title}</div>
          <div className="chat-workspace-copy">Ask anything about deploying this repo — tradeoffs, blockers, or platform differences.</div>
        </div>
        <div className="chat-workspace-chips">
          {initialPlan.fitType !== "no_fit" && initialPlan.score >= 30 ? (
            <>
              <span className="repo-chip repo-chip-accent">{initialPlan.topPlatform}</span>
              <span className="repo-chip">{initialPlan.score}/100 fit</span>
            </>
          ) : (
            <span className="repo-chip">No clear fit detected</span>
          )}
        </div>
      </div>

      <div className="chat-thread">
        {messages.map((msg) =>
          msg.role === "assistant" ? (
            <AssistantMessage key={msg.id} bubble={msg} lead={lead} />
          ) : (
            <div key={msg.id} className="chat-message chat-message-user">
              <div><div className="chat-message-user-bubble">{msg.text}</div></div>
            </div>
          )
        )}
        {isSubmitting && (
          <div className="chat-message chat-message-assistant">
            <div className="chat-message-avatar"><SparklesIcon size={14} /></div>
            <div>
              <div className="chat-message-body">
                Looking at your repo...
                <span className="chat-thinking-indicator" aria-label="responding"><span /><span /><span /></span>
              </div>
              <span className="chat-ai-disclaimer">Shipd is responding...</span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-prompt-row">
        {quickPrompts.map((prompt) => (
          <button key={prompt} type="button" className="chat-quick-prompt" disabled={isSubmitting}
            onClick={() => { setInput(prompt); void sendMessage(prompt); }}>
            {prompt}
          </button>
        ))}
      </div>

      <div className="chat-input-shell">
        <div className="chat-input-wrap">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
            placeholder="Ask about deployment, blockers, or platform fit..."
            className="chat-input"
          />
          <button type="button" onClick={() => void sendMessage()} disabled={isSubmitting} className="chat-send-button" aria-label="Send">
            <SendIcon size={16} />
          </button>
        </div>
        <div className="chat-input-hint">
          Try: &quot;Do I need a Dockerfile?&quot;, &quot;Why not Vercel?&quot;, or &quot;Write me a railway.toml&quot;.
        </div>
      </div>
    </section>
  );
}

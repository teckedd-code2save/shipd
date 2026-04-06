"use client";

import { useEffect, useMemo, useState } from "react";

import { DeploymentGuide } from "@/components/chat/deployment-guide";
import { SendIcon, SparklesIcon } from "@/components/ui/icons";

interface DeploymentStep {
  title: string;
  description: string;
  commands?: string[];
  notes?: string;
  category: "setup" | "config" | "deploy" | "verify";
}

interface DeploymentPlan {
  title: string;
  summary: string;
  topPlatform: string;
  score: number;
  confidence: number;
  blockers: string[];
  warnings: string[];
  steps: DeploymentStep[];
}

interface ChatWorkspaceProps {
  repoId: string;
  repoLabel: string;
  initialPlan: DeploymentPlan;
  repoClass?: string;
  framework?: string;
  runtime?: string;
  primaryAppRoot?: string;
}

interface ChatBubble {
  id: string;
  role: "assistant" | "user";
  text: string;
  pending?: boolean;
}

type ActiveTab = "guide" | "chat";

function formatRoot(value?: string) {
  if (!value) return null;
  return value === "." ? "the repo root" : value;
}

function buildLead({
  repoLabel,
  initialPlan,
  repoClass,
  framework,
  runtime,
  primaryAppRoot
}: ChatWorkspaceProps) {
  const rootLabel = formatRoot(primaryAppRoot);
  void repoClass;

  if (repoClass === "insufficient_evidence" || repoClass === "notebook_repo" || repoClass === "library_or_package") {
    return `Shipd has not found enough deployment evidence to give ${repoLabel} a strong go-live path yet. I can help narrow the runtime, entrypoint, and platform setup you need next.`;
  }

  if (framework === "csharp" || runtime === "dotnet") {
    return `${repoLabel} looks like a .NET service${rootLabel ? ` rooted at ${rootLabel}` : ""}. The fastest path now is to validate the recommended platform, confirm the entrypoint, and generate a clean go-live checklist.`;
  }

  if (framework === "go") {
    return `${repoLabel} looks like a Go service${rootLabel ? ` rooted at ${rootLabel}` : ""}. I can help you confirm the best platform, review env requirements, and produce a minimal launch checklist.`;
  }

  if (framework === "ruby") {
    return `${repoLabel} looks like a Ruby service${rootLabel ? ` rooted at ${rootLabel}` : ""}. I can help you pick the right host, verify the Rack entrypoint, and get this live quickly.`;
  }

  if (framework === "java") {
    return `${repoLabel} looks like a Java service${rootLabel ? ` rooted at ${rootLabel}` : ""}. I can help you choose the best platform, confirm the build toolchain, and create a launch checklist.`;
  }

  if (framework === "rust") {
    return `${repoLabel} looks like a Rust service${rootLabel ? ` rooted at ${rootLabel}` : ""}. I can help you validate platform fit, Docker build settings, and produce a concise go-live plan.`;
  }

  if (framework === "php") {
    return `${repoLabel} looks like a PHP service${rootLabel ? ` rooted at ${rootLabel}` : ""}. I can help you choose the right host, confirm framework requirements, and generate a launch checklist.`;
  }

  if (framework === "sveltekit") {
    return `${repoLabel} looks like a SvelteKit app${rootLabel ? ` rooted at ${rootLabel}` : ""}. I can help you pick the right adapter and platform, and explain the deploy path step by step.`;
  }

  if (framework === "nuxt") {
    return `${repoLabel} looks like a Nuxt app${rootLabel ? ` rooted at ${rootLabel}` : ""}. I can help you choose a Nitro preset, pick a platform, and walk through the deployment.`;
  }

  if (framework === "remix") {
    return `${repoLabel} looks like a Remix app${rootLabel ? ` rooted at ${rootLabel}` : ""}. I can help you pick the right adapter, confirm the runtime target, and step through the deployment.`;
  }

  if (framework === "astro") {
    return `${repoLabel} looks like an Astro site${rootLabel ? ` rooted at ${rootLabel}` : ""}. I can help you pick the right output adapter, choose a platform, and walk through deployment.`;
  }

  if (framework === "nextjs") {
    return `${repoLabel} looks like a Next.js app${rootLabel ? ` rooted at ${rootLabel}` : ""}. I can help you pick the cleanest deploy path, explain tradeoffs, and get this live quickly.`;
  }

  if (framework === "python" || repoClass === "python_service") {
    return `${repoLabel} looks like a Python service${rootLabel ? ` rooted at ${rootLabel}` : ""}. I can help you choose the right host, confirm the runtime path, and produce a minimal launch checklist.`;
  }

  return `${initialPlan.summary} I can now focus on the quickest go-live path, platform tradeoffs, and setup steps for ${repoLabel}.`;
}

function buildQuickPrompts({
  framework,
  runtime,
  initialPlan
}: Pick<ChatWorkspaceProps, "framework" | "runtime" | "initialPlan">) {
  if (framework === "csharp" || runtime === "dotnet") {
    return [
      `How do I get this live quickly on ${initialPlan.topPlatform}?`,
      "What .NET runtime settings do I need?",
      "Give me the shortest launch checklist"
    ];
  }

  if (framework === "go") {
    return [
      `How do I deploy this Go service on ${initialPlan.topPlatform}?`,
      "What environment variables do I need to set?",
      "Give me a step-by-step launch checklist"
    ];
  }

  if (framework === "ruby") {
    return [
      `How do I deploy this Ruby app on ${initialPlan.topPlatform}?`,
      "What does the Procfile or start command need to look like?",
      "What database setup do I need?"
    ];
  }

  if (framework === "java") {
    return [
      `How do I deploy this Java app on ${initialPlan.topPlatform}?`,
      "Do I need a Dockerfile or will a buildpack work?",
      "Give me a minimal launch checklist"
    ];
  }

  if (framework === "rust") {
    return [
      `How do I deploy this Rust service on ${initialPlan.topPlatform}?`,
      "What does the Dockerfile need for a Rust binary?",
      "What are the memory and startup tradeoffs?"
    ];
  }

  if (framework === "php") {
    return [
      `How do I deploy this PHP app on ${initialPlan.topPlatform}?`,
      "What web server config do I need?",
      "Give me a minimal launch checklist"
    ];
  }

  if (framework === "sveltekit") {
    return [
      `Which SvelteKit adapter should I use for ${initialPlan.topPlatform}?`,
      "How do I configure environment variables in SvelteKit?",
      "Give me a step-by-step deploy guide"
    ];
  }

  if (framework === "nuxt") {
    return [
      `Which Nuxt preset works best for ${initialPlan.topPlatform}?`,
      "Do I need SSR or can I use static output?",
      "Give me a minimal deploy checklist"
    ];
  }

  if (framework === "remix") {
    return [
      `Which Remix adapter do I need for ${initialPlan.topPlatform}?`,
      "How do I handle sessions and cookies on ${initialPlan.topPlatform}?",
      "Give me a step-by-step deploy guide"
    ];
  }

  if (framework === "astro") {
    return [
      `Which Astro adapter should I use for ${initialPlan.topPlatform}?`,
      "Can I use static output or do I need SSR?",
      "Give me a minimal deploy checklist"
    ];
  }

  if (framework === "nextjs") {
    return [
      "Where should I deploy this Next.js app?",
      `How do I go live quickly on ${initialPlan.topPlatform}?`,
      "What blocks production launch?"
    ];
  }

  if (framework === "python" || runtime === "python") {
    return [
      `How do I deploy this Python app on ${initialPlan.topPlatform}?`,
      "What entrypoint is Shipd using?",
      "Give me a minimal production checklist"
    ];
  }

  return [
    "Where should I deploy?",
    `How do I go live quickly on ${initialPlan.topPlatform}?`,
    "Summarize blockers before launch"
  ];
}

export function ChatWorkspace(props: ChatWorkspaceProps) {
  const { repoId, repoLabel, initialPlan, framework, runtime, repoClass, primaryAppRoot } = props;
  const [activeTab, setActiveTab] = useState<ActiveTab>("guide");
  const [currentSteps, setCurrentSteps] = useState<DeploymentStep[]>(initialPlan.steps ?? []);

  const initialAssistantText = useMemo(
    () =>
      buildLead({
        repoId,
        repoLabel,
        initialPlan,
        framework,
        runtime,
        repoClass,
        primaryAppRoot
      }),
    [framework, initialPlan, primaryAppRoot, repoClass, repoId, repoLabel, runtime]
  );
  const quickPrompts = useMemo(
    () => buildQuickPrompts({ framework, runtime, initialPlan }),
    [framework, runtime, initialPlan]
  );
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: "initial-assistant",
      role: "assistant",
      text: initialAssistantText
    }
  ]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMessages([
      {
        id: "initial-assistant",
        role: "assistant",
        text: initialAssistantText
      }
    ]);
    setCurrentSteps(initialPlan.steps ?? []);
    setInput("");
    setIsSubmitting(false);
  }, [repoId, initialAssistantText, initialPlan.steps]);

  async function sendMessage(nextInput?: string) {
    const value = (nextInput ?? input).trim();

    if (!value || isSubmitting) {
      return;
    }

    const userMessage: ChatBubble = {
      id: `user-${Date.now()}`,
      role: "user",
      text: value
    };

    setMessages((current) => [...current, userMessage]);
    setActiveTab("chat");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          repoId,
          message: userMessage.text
        })
      });

      if (!response.ok) {
        throw new Error("Chat request failed.");
      }

      const payload = (await response.json()) as {
        message?: string;
        plan?: DeploymentPlan;
        object?: DeploymentPlan;
      };

      // If the AI returned new steps, surface them in the guide
      const newSteps = payload.object?.steps ?? payload.plan?.steps;
      if (newSteps && newSteps.length > 0) {
        setCurrentSteps(newSteps);
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text:
            payload.message ??
            payload.plan?.summary ??
            "Shipd could not generate a response for that request."
        }
      ]);
      setInput("");
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: "Shipd could not complete that request right now. Try again."
        }
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
          <div className="chat-workspace-copy">Work through tradeoffs, blockers, and next steps from one planning thread.</div>
        </div>
        <div className="chat-workspace-chips">
          <span className="repo-chip repo-chip-accent">{initialPlan.topPlatform}</span>
          <span className="repo-chip">{initialPlan.score}/100</span>
          <span className="repo-chip">{Math.round(initialPlan.confidence * 100)}% confidence</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="chat-tabs">
        <button
          type="button"
          className={`chat-tab${activeTab === "guide" ? " chat-tab-active" : ""}`}
          onClick={() => setActiveTab("guide")}
        >
          Deployment Guide
          {currentSteps.length > 0 ? (
            <span className="chat-tab-count">{currentSteps.length}</span>
          ) : null}
        </button>
        <button
          type="button"
          className={`chat-tab${activeTab === "chat" ? " chat-tab-active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          Chat
          {messages.length > 1 ? (
            <span className="chat-tab-count">{messages.length - 1}</span>
          ) : null}
        </button>
      </div>

      {/* Guide panel */}
      {activeTab === "guide" ? (
        <div className="chat-guide-panel">
          <DeploymentGuide steps={currentSteps} platform={initialPlan.topPlatform} />
        </div>
      ) : null}

      {/* Chat panel */}
      {activeTab === "chat" ? (
        <>
          <div className="chat-thread">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "assistant" ? "chat-message chat-message-assistant" : "chat-message chat-message-user"}>
                {message.role === "assistant" ? (
                  <div className="chat-message-avatar">
                    <SparklesIcon size={14} />
                  </div>
                ) : null}
                <div>
                  <div className={message.role === "assistant" ? "chat-message-body" : "chat-message-user-bubble"}>
                    {message.text}
                    {message.pending ? (
                      <span className="chat-thinking-indicator" aria-label="Shipd is responding">
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : null}
                  </div>
                  {message.role === "assistant" ? (
                    <span className="chat-ai-disclaimer">
                      {message.pending ? "Shipd is responding..." : "AI-generated · may be inaccurate"}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
            {isSubmitting ? (
              <div className="chat-message chat-message-assistant">
                <div className="chat-message-avatar">
                  <SparklesIcon size={14} />
                </div>
                <div>
                  <div className="chat-message-body">
                    Thinking through your repo context.
                    <span className="chat-thinking-indicator" aria-label="Shipd is responding">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                  <span className="chat-ai-disclaimer">Shipd is responding...</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="chat-prompt-row">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="chat-quick-prompt"
                disabled={isSubmitting}
                onClick={() => {
                  setInput(prompt);
                  void sendMessage(prompt);
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="chat-input-shell">
        <div className="chat-input-wrap">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask about deployment, blockers, or platform fit..."
            className="chat-input"
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={isSubmitting}
            className="chat-send-button"
            aria-label="Send message"
          >
            <SendIcon size={16} />
          </button>
        </div>
        <div className="chat-input-hint">
          Try: &quot;Give me a step-by-step deploy guide&quot;, &quot;Why not Railway?&quot;, or &quot;Summarize blockers before launch&quot;.
        </div>
      </div>
    </section>
  );
}

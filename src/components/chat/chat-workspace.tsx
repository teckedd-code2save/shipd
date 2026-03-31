"use client";

import { useState } from "react";

interface DeploymentPlan {
  title: string;
  summary: string;
  topPlatform: string;
  score: number;
  confidence: number;
  blockers: string[];
  warnings: string[];
  nextSteps: string[];
}

interface ChatWorkspaceProps {
  repoId: string;
  initialPlan: DeploymentPlan;
}

interface ChatBubble {
  id: string;
  role: "assistant" | "user";
  text: string;
}

export function ChatWorkspace({ repoId, initialPlan }: ChatWorkspaceProps) {
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: "initial-assistant",
      role: "assistant",
      text: `${initialPlan.summary} Top platform: ${initialPlan.topPlatform}.`
    }
  ]);
  const [input, setInput] = useState("Where should I deploy this?");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendMessage() {
    if (!input.trim() || isSubmitting) {
      return;
    }

    const userMessage: ChatBubble = {
      id: `user-${Date.now()}`,
      role: "user",
      text: input.trim()
    };

    setMessages((current) => [...current, userMessage]);
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

      const payload = (await response.json()) as { message?: string; plan?: DeploymentPlan };

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
    <section
      className="panel"
      style={{
        padding: 0,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        minHeight: 620
      }}
    >
      <div style={{ padding: 22, borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, marginBottom: 6 }}>{initialPlan.title}</h1>
            <p className="muted" style={{ margin: 0 }}>
              Chat with Shipd about blockers, tradeoffs, and platform fit.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="token-pill token-pill-green">{initialPlan.topPlatform}</span>
            <span className="token-pill">{initialPlan.score}/100</span>
            <span className="token-pill">{Math.round(initialPlan.confidence * 100)}% confidence</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 22, display: "grid", gap: 14, alignContent: "start" }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              justifySelf: message.role === "user" ? "end" : "start",
              maxWidth: "80%",
              borderRadius: 16,
              border: message.role === "user" ? "1px solid var(--border)" : "1px solid transparent",
              background: message.role === "user" ? "var(--bg-surface-2)" : "transparent",
              padding: message.role === "user" ? "14px 16px" : "0"
            }}
          >
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: message.role === "user" ? "var(--text-primary)" : "var(--text-secondary)"
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--border)", padding: 18 }}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr) auto" }}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask anything about your deployment..."
            style={{
              width: "100%",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg-surface-2)",
              color: "var(--text-primary)",
              padding: "14px 16px"
            }}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={isSubmitting}
            style={{
              borderRadius: 12,
              border: "none",
              background: "var(--accent-blue)",
              color: "#fff",
              padding: "0 18px",
              minWidth: 96,
              fontWeight: 600,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "progress" : "pointer"
            }}
          >
            {isSubmitting ? "Sending" : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}


"use client";

import { useState } from "react";

import { SendIcon, SparklesIcon } from "@/components/ui/icons";

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
  repoLabel: string;
  initialPlan: DeploymentPlan;
}

interface ChatBubble {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const quickPrompts = [
  "Where should I deploy?",
  "Why is this not a Vercel fit?",
  "Summarize blockers before launch"
];

export function ChatWorkspace({ repoId, repoLabel, initialPlan }: ChatWorkspaceProps) {
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: "initial-assistant",
      role: "assistant",
      text: `${initialPlan.summary} Ask for a recommendation, compare tradeoffs, or request a tighter launch checklist for ${repoLabel}.`
    }
  ]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              </div>
              {message.role === "assistant" ? (
                <span className="chat-ai-disclaimer">AI-generated · may be inaccurate</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-prompt-row">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="chat-quick-prompt"
            onClick={() => {
              setInput(prompt);
              void sendMessage(prompt);
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

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
          Try: “Where should I deploy?”, “Why not Railway?”, or “Summarize blockers before launch”.
        </div>
      </div>
    </section>
  );
}

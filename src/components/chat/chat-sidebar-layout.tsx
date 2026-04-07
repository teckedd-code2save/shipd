"use client";
import { useState } from "react";

export function ChatSidebarLayout({
  sidebar,
  children
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="chat-mobile-analysis-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? "Hide analysis" : "View analysis"}
      </button>
      <div className="chat-layout">
        <aside className={`chat-sidebar panel${open ? " mobile-open" : ""}`}>
          {sidebar}
        </aside>
        {children}
      </div>
    </>
  );
}

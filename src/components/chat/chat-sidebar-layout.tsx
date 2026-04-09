"use client";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui/surface";

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
        <Surface as="aside" className={cn("chat-sidebar", open && "mobile-open")}>
          {sidebar}
        </Surface>
        {children}
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BottomScrollActionProps = {
  isLoggedIn: boolean;
};

export function BottomScrollAction({ isLoggedIn }: BottomScrollActionProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const remaining = doc.scrollHeight - (window.scrollY + window.innerHeight);
      setShow(remaining <= 180);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 transition-all duration-300",
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <Button asChild size="lg" className="pointer-events-auto px-6 shadow-[0_18px_40px_rgba(10,14,28,0.5)]">
        <Link href={isLoggedIn ? "/dashboard" : "/pricing"}>
          {isLoggedIn ? "Open dashboard" : "Start with your repo"}
        </Link>
      </Button>
    </div>
  );
}

import type { Route } from "next";
import Link from "next/link";

import { ArrowUpRightIcon } from "@/components/ui/icons";

export function CtaLink({ href, label }: { href: Route; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 999,
        background: "linear-gradient(135deg, #5b6cf2 0%, #4a5be3 100%)",
        color: "#fff",
        padding: "12px 18px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        boxShadow: "0 18px 40px rgba(54, 77, 220, 0.28)"
      }}
    >
      {label}
      <ArrowUpRightIcon size={16} />
    </Link>
  );
}

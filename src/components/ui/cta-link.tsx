import type { Route } from "next";
import Link from "next/link";

import { ChartIcon } from "@/components/ui/icons";

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
        padding: "11px 17px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        boxShadow: "0 18px 40px rgba(54, 77, 220, 0.28)"
      }}
    >
      <ChartIcon size={16} />
      {label}
    </Link>
  );
}

import type { Route } from "next";
import Link from "next/link";

export function CtaLink({ href, label }: { href: Route; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 999,
        background: "var(--accent-blue)",
        color: "#fff",
        padding: "14px 18px",
        fontWeight: 600
      }}
    >
      {label}
    </Link>
  );
}

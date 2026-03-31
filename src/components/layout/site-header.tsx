import Link from "next/link";

import { auth } from "@/auth";
import { AuthButton } from "@/components/auth/auth-button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "18px 24px"
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Link href="/" style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700 }}>
          Shipd
        </Link>
        <nav style={{ display: "flex", gap: 16, color: "var(--text-secondary)", alignItems: "center" }}>
          <Link href="/dashboard">Dashboard</Link>
          {session?.user?.email ? <span>{session.user.email}</span> : null}
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}

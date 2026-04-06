import Link from "next/link";

import { auth } from "@/auth";
import { AuthButton } from "@/components/auth/auth-button";
import { GitHubIcon } from "@/components/ui/icons";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="site-header">
      <div
        style={{
          maxWidth: 1360,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Link href="/" className="site-header-brand">
          Shipd
        </Link>
        <nav className="site-header-nav">
          <Link href="/dashboard" className="site-header-link">
            Dashboard
          </Link>
          {session?.user?.email ? (
            <span className="site-header-account">
              <GitHubIcon size={14} />
              <span className="site-header-email">{session.user.email}</span>
            </span>
          ) : null}
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";

import { auth } from "@/auth";
import { AuthButton } from "@/components/auth/auth-button";
import { GitHubIcon } from "@/components/ui/icons";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function SiteHeader() {
  const session = await auth();
  const isAdmin = session?.user?.email ? ADMIN_EMAILS.includes(session.user.email.toLowerCase()) : false;

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
          {isAdmin ? (
            <Link href="/admin" className="site-header-link">
              Metrics
            </Link>
          ) : null}
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

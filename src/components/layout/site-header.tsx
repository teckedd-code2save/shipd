import Link from "next/link";

import { auth } from "@/auth";
import { AuthButton } from "@/components/auth/auth-button";
import { GitHubIcon } from "@/components/ui/icons";
import { MobileNav } from "@/components/layout/mobile-nav";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function SiteHeader() {
  const session = await auth();
  const isAdmin = session?.user?.email ? ADMIN_EMAILS.includes(session.user.email.toLowerCase()) : false;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-header-brand">
          Shipd
        </Link>

        {/* Desktop nav */}
        <nav className="site-header-nav site-header-nav-desktop">
          <Link href="/dashboard" className="site-header-link">Dashboard</Link>
          <Link href="/pricing" className="site-header-link">Pricing</Link>
          {isAdmin ? (
            <Link href="/admin" className="site-header-link">Metrics</Link>
          ) : null}
          {session?.user?.email ? (
            <span className="site-header-account">
              <GitHubIcon size={14} />
              <span className="site-header-email">{session.user.email}</span>
            </span>
          ) : null}
          <AuthButton />
        </nav>

        {/* Mobile nav */}
        <div className="site-header-nav-mobile">
          <MobileNav
            isAdmin={isAdmin}
            userEmail={session?.user?.email}
            authSlot={<AuthButton />}
          />
        </div>
      </div>
    </header>
  );
}

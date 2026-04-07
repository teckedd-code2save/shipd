"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Props {
  isAdmin: boolean;
  userEmail?: string | null;
  authSlot: React.ReactNode;
}

export function MobileNav({ isAdmin, userEmail, authSlot }: Props) {
  const [open, setOpen] = useState(false);

  // close on route change / resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        className="mobile-nav-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`mobile-nav-bar ${open ? "bar-open-1" : ""}`} />
        <span className={`mobile-nav-bar ${open ? "bar-open-2" : ""}`} />
        <span className={`mobile-nav-bar ${open ? "bar-open-3" : ""}`} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <nav className={`mobile-nav-drawer ${open ? "mobile-nav-drawer-open" : ""}`}>
        <Link href="/dashboard" className="mobile-nav-item" onClick={() => setOpen(false)}>
          Dashboard
        </Link>
        <Link href="/pricing" className="mobile-nav-item" onClick={() => setOpen(false)}>
          Pricing
        </Link>
        {isAdmin && (
          <Link href="/admin" className="mobile-nav-item" onClick={() => setOpen(false)}>
            Metrics
          </Link>
        )}
        {userEmail && (
          <div className="mobile-nav-account">
            <span className="mobile-nav-email">{userEmail}</span>
          </div>
        )}
        <div className="mobile-nav-auth" onClick={() => setOpen(false)}>
          {authSlot}
        </div>
      </nav>
    </>
  );
}

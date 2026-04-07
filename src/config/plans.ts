// ─── Quotas ───────────────────────────────────────────────────────────────────
// Edit these env vars (or change the defaults here) to adjust limits without
// touching service code.
//   FREE_PUBLIC_SCANS=5
//   FREE_PRIVATE_SCANS=1
//   PRO_PRICE_MONTHLY=19
//   TEAM_PRICE_MONTHLY=49

export const PLAN_LIMITS = {
  FREE: {
    publicScansPerMonth: parseInt(process.env.FREE_PUBLIC_SCANS ?? "5", 10),
    privateScansPerMonth: parseInt(process.env.FREE_PRIVATE_SCANS ?? "1", 10),
  },
  PRO: { publicScansPerMonth: Infinity, privateScansPerMonth: Infinity },
  TEAM: { publicScansPerMonth: Infinity, privateScansPerMonth: Infinity },
} as const;

// ─── Prices (display only — no payment processor yet) ─────────────────────────
const proMonthly = parseInt(process.env.PRO_PRICE_MONTHLY ?? "19", 10);
const teamMonthly = parseInt(process.env.TEAM_PRICE_MONTHLY ?? "49", 10);

export const PLAN_PRICES = {
  FREE: { monthly: 0, display: "$0" },
  PRO: { monthly: proMonthly, display: `$${proMonthly}` },
  TEAM: { monthly: teamMonthly, display: `$${teamMonthly}` },
} as const;

// ─── Access control ───────────────────────────────────────────────────────────
// ADMIN_EMAILS    — comma-separated list of emails that can access /admin
// UNLIMITED_EMAILS — comma-separated list of emails that bypass all scan quotas
//
// Example .env.local:
//   ADMIN_EMAILS=you@example.com
//   UNLIMITED_EMAILS=you@example.com,tester@example.com

function parseEmailList(envVar: string | undefined): Set<string> {
  return new Set(
    (envVar ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export const ADMIN_EMAILS = parseEmailList(process.env.ADMIN_EMAILS);
export const UNLIMITED_EMAILS = parseEmailList(process.env.UNLIMITED_EMAILS);

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.has(email.toLowerCase());
}

export function isUnlimited(email: string | null | undefined): boolean {
  return !!email && UNLIMITED_EMAILS.has(email.toLowerCase());
}

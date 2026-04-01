import { auth } from "@/auth";
import { AuthButton } from "@/components/auth/auth-button";
import { CtaLink } from "@/components/ui/cta-link";

export default async function LandingPage() {
  const session = await auth();

  return (
    <main
      className="page"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        textAlign: "center"
      }}
      >
      <section style={{ maxWidth: 760 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 72, fontWeight: 700, marginBottom: 20 }}>
          Shipd
        </div>
        <h1 style={{ fontSize: 24, lineHeight: 1.4, marginBottom: 16 }}>
          Point it at your repo. Get a deployment plan.
        </h1>
        <p className="muted" style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
          Reads your config files. No code changes. No installs.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {session?.user ? (
            <CtaLink href="/dashboard" label="Open dashboard" />
          ) : (
            <AuthButton redirectTo="/dashboard" />
          )}
        </div>
        <div className="landing-trust-row">
          <div className="landing-avatars">
            <span className="landing-avatar landing-avatar-blue">JD</span>
            <span className="landing-avatar landing-avatar-purple">SK</span>
            <span className="landing-avatar landing-avatar-green">AM</span>
            <span className="landing-avatar landing-avatar-amber">RL</span>
            <span className="landing-avatar landing-avatar-coral">TC</span>
          </div>
          <span className="muted">127 developers shipped this week</span>
        </div>
      </section>
    </main>
  );
}

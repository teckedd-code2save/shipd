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
        <div style={{ fontFamily: "monospace", fontSize: 72, fontWeight: 700, marginBottom: 20 }}>
          Shipd
        </div>
        <h1 style={{ fontSize: 24, lineHeight: 1.4, marginBottom: 20 }}>
          Point it at your repo. Compare your options. Deploy with confidence.
        </h1>
        <p className="muted" style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 28 }}>
          Shipd reads deployment-relevant files, compares realistic hosting options, and produces
          a deployment plan before you touch infrastructure.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {session?.user ? (
            <CtaLink href="/dashboard" label="Open dashboard" />
          ) : (
            <AuthButton redirectTo="/dashboard" />
          )}
        </div>
        <p className="muted" style={{ marginTop: 18, fontSize: 13 }}>
          Read-only GitHub access. No code changes. No installs. No secrets stored.
        </p>
      </section>
    </main>
  );
}

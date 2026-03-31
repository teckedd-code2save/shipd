import { auth, signIn, signOut } from "@/auth";
import { GitHubIcon } from "@/components/ui/icons";
import { hasAuthEnv } from "@/lib/env";

function buttonStyle(primary: boolean) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    border: primary ? "none" : "1px solid var(--border)",
    background: primary
      ? "linear-gradient(135deg, #5b6cf2 0%, #4a5be3 100%)"
      : "rgba(255, 255, 255, 0.02)",
    color: "#fff",
    padding: primary ? "12px 18px" : "11px 15px",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    boxShadow: primary ? "0 18px 40px rgba(54, 77, 220, 0.28)" : "none",
    cursor: "pointer"
  } as const;
}

export async function AuthButton({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const session = await auth();

  if (!hasAuthEnv()) {
    return (
      <div className="muted" style={{ fontSize: 13 }}>
        Set `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` to enable GitHub connect.
      </div>
    );
  }

  if (session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button type="submit" style={buttonStyle(false)}>
          Sign out
        </button>
      </form>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo });
      }}
    >
      <button type="submit" style={buttonStyle(true)}>
        <GitHubIcon size={17} />
        Connect GitHub repo
      </button>
    </form>
  );
}

import { auth, signIn, signOut } from "@/auth";
import { hasAuthEnv } from "@/lib/env";

function buttonStyle(primary: boolean) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    border: primary ? "none" : "1px solid var(--border)",
    background: primary ? "var(--accent-blue)" : "transparent",
    color: "#fff",
    padding: "14px 18px",
    fontWeight: 600,
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
        Connect GitHub repo
      </button>
    </form>
  );
}

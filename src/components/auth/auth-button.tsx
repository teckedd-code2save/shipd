import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/icons";
import { hasAuthEnv } from "@/lib/env";

export async function AuthButton({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const session = await auth();

  if (!hasAuthEnv()) {
    return (
      <div className="muted text-[13px]">
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
        <Button type="submit" variant="outline" size="lg" className="h-10 rounded-full px-4">
          Sign out
        </Button>
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
      <Button type="submit" variant="brand" size="lg" className="h-11 rounded-full px-5">
        <GitHubIcon size={17} />
        Connect GitHub repo
      </Button>
    </form>
  );
}

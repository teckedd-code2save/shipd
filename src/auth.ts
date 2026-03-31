import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { env, hasAuthEnv, hasDatabaseEnv } from "@/lib/env";
import { getPrismaClient } from "@/lib/db/prisma";

const authSecret =
  env.AUTH_SECRET ?? (process.env.NODE_ENV === "development" ? "shipd-dev-only-secret" : undefined);

const providers = hasAuthEnv()
  ? [
      GitHub({
        clientId: env.AUTH_GITHUB_ID!,
        clientSecret: env.AUTH_GITHUB_SECRET!,
        allowDangerousEmailAccountLinking: false
      })
    ]
  : [];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: hasDatabaseEnv() ? PrismaAdapter(getPrismaClient()) : undefined,
  session: {
    strategy: hasDatabaseEnv() ? "database" : "jwt"
  },
  providers,
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    }
  },
  secret: authSecret,
  trustHost: true
});

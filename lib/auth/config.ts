import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { upsertGithubUser } from "@/lib/db/queries/users";
import { migrate } from "@/lib/db/migrate";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? ""
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as {
          id?: number | string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          login?: string | null;
        };
        const githubId = String(githubProfile.id);
        await migrate();
        const user = await upsertGithubUser({
          githubId,
          email: githubProfile.email ?? token.email ?? null,
          name: githubProfile.name ?? githubProfile.login ?? token.name ?? null,
          image: githubProfile.avatar_url ?? token.picture ?? null
        });
        token.userId = user.id;
        token.githubId = githubId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};

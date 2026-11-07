import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async signIn({ account, profile }) {
      return (
        account?.provider === "google" &&
        profile !== undefined &&
        "email_verified" in profile &&
        profile.email_verified === true
      );
    },
  },
});

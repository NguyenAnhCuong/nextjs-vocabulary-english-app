import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.BACKEND_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              email: credentials?.email ?? "",
              password: credentials?.password ?? "",
            }),
          });

          const data = await res.json();

          if (res.ok && data?.data?.user) {
            return data; // type now recognized
          }

          return null;
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${process.env.BACKEND_URL}/google-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: account.id_token,
            }),
          });

          const data = await res.json();

          if (!res.ok) return false;

          // ⚠️ return data qua "user"
          (account as any).backendData = data.data;

          return true;
        } catch (err) {
          console.error("Google login error:", err);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // credentials login
      if (account?.provider === "credentials" && user) {
        token.access_token = user.data.access_token;
        token.refresh_token = user.data.refreshToken;
        token.user = user.data.user;
      }

      // google login
      if (account?.provider === "google") {
        const backendData = (account as any).backendData;
        console.log(backendData);

        if (backendData) {
          token.access_token = backendData.access_token;
          token.user = backendData.user;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.access_token = token.access_token;
        session.refresh_token = token.refresh_token;
        session.user = token.user;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);

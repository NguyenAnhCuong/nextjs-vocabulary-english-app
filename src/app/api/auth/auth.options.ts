import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { jwtDecode } from "jwt-decode";

/**
 * Hàm hỗ trợ gọi NestJS để làm mới Access Token
 */
async function refreshAccessToken(token: any) {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: token.refresh_token }),
    });

    const refreshed = await res.json();

    if (!res.ok) throw refreshed;

    console.log(">>> Đã làm mới Token thành công!");

    return {
      ...token,
      access_token: refreshed.data.access_token,
      // Lấy thời hạn mới từ AT vừa được cấp
      expires_at:
        jwtDecode<{ exp: number }>(refreshed.data.access_token).exp * 1000,
      // Nếu backend trả về RT mới thì update, không thì giữ cái cũ
      refresh_token: refreshed.data.refresh_token ?? token.refresh_token,
    };
  } catch (error) {
    console.error("RefreshAccessTokenError:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

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
        const res = await fetch(`${process.env.BACKEND_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            email: credentials?.email ?? "",
            password: credentials?.password ?? "",
          }),
        });

        const data = await res.json();
        console.log(data);

        if (res.ok && data?.data) return data.data; // Trả về object chứa {access_token, refreshToken, user}
        return null;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${process.env.BACKEND_URL}/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: account.id_token }),
          });

          const data = await res.json();
          if (!res.ok) return false;

          // Gắn dữ liệu từ NestJS vào object user để callback JWT có thể nhận được
          (user as any).backendData = data.data;
          return true;
        } catch (err) {
          console.error("Google login error:", err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // 1. Lần đầu đăng nhập (Credentials hoặc Google)
      if (user) {
        // Trường hợp Google: Lấy data từ signIn callback
        // Trường hợp Credentials: user chính là data.data trả về từ authorize()
        const backend = (user as any).backendData || user;

        return {
          access_token: backend.access_token,
          refresh_token: backend.refreshToken || backend.refresh_token,
          user: backend.user,
          expires_at:
            jwtDecode<{ exp: number }>(backend.access_token).exp * 1000,
        };
      }

      // 2. Kiểm tra nếu Access Token vẫn còn hạn (còn hơn 1 phút)
      if (Date.now() < (token.expires_at as number) - 30000) {
        return token;
      }

      // 3. Nếu Token sắp/đã hết hạn -> Gọi refresh
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
      session.user = token.user as any;
      session.error = token.error; // Trả lỗi về cho Client xử lý
      return session;
    },
  },
};

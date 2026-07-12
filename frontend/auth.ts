/**
 * NextAuth v5 configuration — Credentials provider backed by the FastAPI backend.
 *
 * Flow:
 *   1. User submits email + password on /sign-in
 *   2. NextAuth calls authorize() → POST /api/v1/auth/login on FastAPI
 *   3. Backend returns { access_token, expires_in, user: {...} }
 *   4. We persist the access_token + user data inside the NextAuth JWT (encrypted cookie)
 *   5. The jwt callback handles token refresh when the access token expires
 *   6. The session callback exposes safe fields to the client via useSession()
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },

  pages: {
    signIn: "/sign-in",
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.detail || "Invalid credentials");
          }

          const data = await res.json();
          const setCookieHeader = res.headers.get("set-cookie");
          let refreshToken = "";
          if (setCookieHeader) {
            const match = setCookieHeader.match(/refresh_token=([^;]+)/);
            if (match) refreshToken = match[1];
          }
          console.log("[auth] Login setCookieHeader:", setCookieHeader);
          console.log("[auth] Extracted refreshToken:", refreshToken ? "FOUND" : "MISSING");

          // Return user object — this gets passed to the jwt callback
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            status: data.user.status,
            departmentId: data.user.department_id,
            departmentName: data.user.department_name,
            xp: data.user.xp,
            points: data.user.points,
            accessToken: data.access_token,
            // expires_in is in seconds, convert to epoch ms
            accessTokenExpires: Date.now() + data.expires_in * 1000,
            refreshToken,
          };
        } catch (error) {
          console.error("[auth] Login failed:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in — persist user data + access token into JWT
      if (user) {
        token.accessToken = user.accessToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.refreshToken = user.refreshToken;
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.departmentId = user.departmentId;
        token.departmentName = user.departmentName;
        token.xp = user.xp;
        token.points = user.points;
        return token;
      }

      // On subsequent requests — check if access token is still valid
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token; // Token still valid
      }

      // Token expired — attempt refresh via /auth/refresh
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: token.refreshToken }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`[auth] Refresh failed with status ${res.status}:`, errorText);
          throw new Error("Refresh failed");
        }

        const data = await res.json();
        token.accessToken = data.access_token;
        token.accessTokenExpires = Date.now() + data.expires_in * 1000;
        
        // Extract new refresh token if rotated
        const setCookieHeader = res.headers.get("set-cookie");
        if (setCookieHeader) {
          const match = setCookieHeader.match(/refresh_token=([^;]+)/);
          if (match) token.refreshToken = match[1];
        }

        // Update user profile from refresh response
        if (data.user) {
          token.name = data.user.name;
          token.role = data.user.role;
          token.departmentId = data.user.department_id;
          token.departmentName = data.user.department_name;
          token.xp = data.user.xp;
          token.points = data.user.points;
        }
        token.error = undefined;
        return token;
      } catch {
        // Refresh failed — mark token as errored so session callback can handle it
        console.error("[auth] Token refresh failed");
        token.error = "RefreshAccessTokenError";
        return token;
      }
    },

    async session({ session, token }) {
      // Expose custom fields to the client session
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user.id = token.sub!;
      session.user.role = token.role || "EMPLOYEE";
      session.user.departmentId = token.departmentId || null;
      session.user.departmentName = token.departmentName || null;
      session.user.xp = token.xp || 0;
      session.user.points = token.points || 0;
      return session;
    },
  },
});

/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

/**
 * Extend the default NextAuth types to include our custom user fields
 * from the FastAPI backend's TokenResponse / UserProfile schemas.
 */
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      role: string;
      departmentId: string | null;
      departmentName: string | null;
      xp: number;
      points: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    departmentId: string | null;
    departmentName: string | null;
    xp: number;
    points: number;
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    role?: string;
    departmentId?: string | null;
    departmentName?: string | null;
    xp?: number;
    points?: number;
    error?: string;
  }
}

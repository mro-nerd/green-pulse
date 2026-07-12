/**
 * Server Actions for authentication flows.
 *
 * - loginAction:  Calls NextAuth signIn("credentials") → redirects to /dashboard
 * - signupAction: Calls FastAPI POST /api/v1/auth/signup directly (NextAuth doesn't handle registration)
 */
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string } | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    // NextAuth redirects throw NEXT_REDIRECT — we must re-throw it
    throw error;
  }
}

// ── Sign-up ──────────────────────────────────────────────────────────────────

export async function signupAction(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const departmentId = formData.get("department_id") as string;

  if (!name || !email || !password || !departmentId) {
    return { error: "All fields are required." };
  }

  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        department_id: departmentId,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.detail || "Sign-up failed. Please try again." };
    }

    const data = await res.json();
    return {
      success:
        data.message ||
        "Account created! Your registration is pending admin approval.",
    };
  } catch {
    return { error: "Unable to reach the server. Please try again later." };
  }
}

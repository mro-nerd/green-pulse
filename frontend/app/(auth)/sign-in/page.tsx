"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/lib/auth-actions";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="w-full max-w-[420px] rounded-[12px] border border-[#E2E8F0] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-[24px] font-semibold leading-[32px] text-[#191c1e] text-center">
          Sign in to GreenPulse
        </h1>
        <p className="text-[14px] font-normal leading-[20px] text-[#40493d] text-center">
          Enter your credentials to access your ESG dashboard.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#40493d]"
          >
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            required
            type="email"
            placeholder="name@odoo.com"
            className="h-[40px] rounded-[6px] border-[#E2E8F0] bg-white px-3 focus-visible:border-[#0d631b] focus-visible:ring-[#0d631b] focus-visible:ring-2 shadow-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#40493d]"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            required
            type="password"
            placeholder="••••••••"
            className="h-[40px] rounded-[6px] border-[#E2E8F0] bg-white px-3 focus-visible:border-[#0d631b] focus-visible:ring-[#0d631b] focus-visible:ring-2 shadow-none"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 h-[40px] w-full rounded-[6px] bg-[#0d631b] text-[14px] font-medium text-white hover:bg-[#1b6d24] focus-visible:ring-[#0d631b] focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {isPending ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#707A6C]">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-[#0d631b] hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

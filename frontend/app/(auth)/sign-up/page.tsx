"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signupAction } from "@/lib/auth-actions";

// TODO: Replace with a real API call to GET /api/v1/departments once that endpoint exists.
// For now, hardcoded department options matching typical seed data.
const DEPARTMENTS = [
  { id: "dept-engineering", name: "Engineering" },
  { id: "dept-marketing", name: "Marketing" },
  { id: "dept-hr", name: "Human Resources" },
  { id: "dept-finance", name: "Finance" },
  { id: "dept-operations", name: "Operations" },
];

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signupAction, undefined);

  return (
    <div className="w-full max-w-[420px] rounded-[12px] border border-[#E2E8F0] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-[24px] font-semibold leading-[32px] text-[#191c1e] text-center">
          Create your GreenPulse account
        </h1>
        <p className="text-[14px] font-normal leading-[20px] text-[#40493d] text-center">
          Start managing your enterprise ESG performance today.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 rounded-[6px] border border-green-200 bg-green-50 px-3 py-2.5 text-[13px] text-green-700">
          {state.success}{" "}
          <Link href="/sign-in" className="font-medium underline">
            Sign in here
          </Link>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#40493d]"
          >
            Full Name
          </label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Jane Doe"
            className="h-[40px] rounded-[6px] border-[#E2E8F0] bg-white px-3 focus-visible:border-[#0d631b] focus-visible:ring-[#0d631b] focus-visible:ring-2 shadow-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#40493d]"
          >
            Work Email
          </label>
          <Input
            id="email"
            name="email"
            required
            type="email"
            placeholder="jane@odoo.com"
            className="h-[40px] rounded-[6px] border-[#E2E8F0] bg-white px-3 focus-visible:border-[#0d631b] focus-visible:ring-[#0d631b] focus-visible:ring-2 shadow-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="department_id"
            className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#40493d]"
          >
            Department
          </label>
          <select
            id="department_id"
            name="department_id"
            required
            defaultValue=""
            className="h-[40px] rounded-[6px] border border-[#E2E8F0] bg-white px-3 text-[14px] text-[#191c1e] outline-none focus:border-[#0d631b] focus:ring-2 focus:ring-[#0d631b] cursor-pointer"
          >
            <option value="" disabled>
              Select your department
            </option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
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
            minLength={8}
            placeholder="••••••••"
            className="h-[40px] rounded-[6px] border-[#E2E8F0] bg-white px-3 focus-visible:border-[#0d631b] focus-visible:ring-[#0d631b] focus-visible:ring-2 shadow-none"
          />
          <span className="text-[11px] text-[#707A6C]">
            Minimum 8 characters
          </span>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 h-[40px] w-full rounded-[6px] bg-[#0d631b] text-[14px] font-medium text-white hover:bg-[#1b6d24] focus-visible:ring-[#0d631b] focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {isPending ? "Creating Account…" : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#707A6C]">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-[#0d631b] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

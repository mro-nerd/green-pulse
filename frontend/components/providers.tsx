"use client";

import { SessionProvider } from "next-auth/react";
import { SessionErrorCatcher } from "./session-error-catcher";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionErrorCatcher />
      {children}
    </SessionProvider>
  );
}

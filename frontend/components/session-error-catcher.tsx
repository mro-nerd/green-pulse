"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export function SessionErrorCatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      console.warn("Refresh token failed, forcing sign out...");
      signOut({ callbackUrl: "/sign-in" });
    }
  }, [session]);

  return null;
}

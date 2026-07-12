"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopNav() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate initials from name
  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const roleBadgeColor =
    session?.user?.role === "ADMIN"
      ? "bg-[#BA1A1A] text-white"
      : session?.user?.role === "DEPARTMENT_MANAGER"
        ? "bg-[#005DB7] text-white"
        : "bg-[#E2E8F0] text-[#191C1E]";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-end border-b border-[#E2E8F0] bg-white px-8">
      <div className="flex items-center gap-4">
        <button className="relative rounded-[0.5rem] p-1.5 text-[#707A6C] transition-colors hover:bg-[#F2F4F6] hover:text-[#191C1E]">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#BA1A1A] text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="focus:outline-none"
          >
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src="/avatar.png" alt={session?.user?.name || "User"} />
              <AvatarFallback className="bg-[#2E7D32] text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-[240px] rounded-[8px] border border-[#E2E8F0] bg-white py-2 shadow-lg z-50">
              {/* User info */}
              <div className="px-4 py-2.5 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#707A6C] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#191C1E] truncate">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-[11px] text-[#707A6C] truncate">
                      {session?.user?.email || ""}
                    </p>
                  </div>
                </div>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleBadgeColor}`}
                >
                  {session?.user?.role?.replace("_", " ") || "Employee"}
                </span>
              </div>

              {/* Sign out */}
              <button
                onClick={() =>
                  signOut({ redirectTo: "/sign-in" })
                }
                className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#BA1A1A] hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

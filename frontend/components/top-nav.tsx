"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopNav() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-end border-b border-[#E2E8F0] bg-white px-8">
      <div className="flex items-center gap-4">
        <button className="relative rounded-[0.5rem] p-1.5 text-[#707A6C] transition-colors hover:bg-[#F2F4F6] hover:text-[#191C1E]">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#BA1A1A] text-[10px] font-bold text-white">
            3
          </span>
        </button>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src="/avatar.png" alt="User" />
          <AvatarFallback className="bg-[#2E7D32] text-white text-xs">
            AK
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

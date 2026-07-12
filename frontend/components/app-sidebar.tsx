"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Leaf,
  Users,
  Scale,
  Trophy,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Environmental", href: "/environmental", icon: Leaf },
  { label: "Social", href: "/social", icon: Users },
  { label: "Governance", href: "/governance", icon: Scale },
  { label: "Gamification", href: "/gamification", icon: Trophy },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings, adminOnly: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role || "EMPLOYEE";
  const userName = session?.user?.name || "User";
  const userXp = session?.user?.xp ?? 0;
  const userPoints = session?.user?.points ?? 0;

  // Filter nav items based on role
  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || userRole === "ADMIN"
  );

  const roleBadgeColor =
    userRole === "ADMIN"
      ? "bg-[#BA1A1A]/20 text-[#FF6B6B]"
      : userRole === "DEPARTMENT_MANAGER"
        ? "bg-[#005DB7]/20 text-[#64B5F6]"
        : "bg-white/10 text-white/60";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col bg-[#1A202C] text-white">
      <div className="px-6 pt-7 pb-10">
        <h1 className="text-xl font-bold tracking-tight">GreenPulse</h1>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-white/50">
          Enterprise ESG
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-normal transition-colors ${
                isActive
                  ? "bg-[#2E7D32] text-white font-medium"
                  : "text-white/70 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info footer */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2E7D32] text-[13px] font-semibold shrink-0">
            {userName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white truncate">
              {userName}
            </p>
            <span
              className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${roleBadgeColor}`}
            >
              {userRole.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* XP & Points */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-white/50">
            <Sparkles className="h-3 w-3 text-[#F59E0B]" />
            <span className="font-medium text-white/70">
              {userXp.toLocaleString()} XP
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-white/50">
            <span className="text-[#EA580C]">⭐</span>
            <span className="font-medium text-white/70">
              {userPoints.toLocaleString()} pts
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

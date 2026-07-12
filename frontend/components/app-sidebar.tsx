"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Leaf,
  Users,
  Scale,
  Trophy,
  FileText,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Environmental", href: "/environmental", icon: Leaf },
  { label: "Social", href: "/social", icon: Users },
  { label: "Governance", href: "/governance", icon: Scale },
  { label: "Gamification", href: "/gamification", icon: Trophy },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col bg-[#1A202C] text-white">
      <div className="px-6 pt-7 pb-10">
        <h1 className="text-xl font-bold tracking-tight">EcoSphere</h1>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-white/50">
          Enterprise ESG
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {navItems.map((item) => {
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
    </aside>
  );
}

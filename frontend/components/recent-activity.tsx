import { ArrowUpCircle, AlertTriangle, Trophy } from "lucide-react";
import type { RecentActivityItem } from "@/lib/mock-data/dashboard";

const iconMap = {
  upload: { icon: ArrowUpCircle, bg: "bg-[#A3F69C]/30", color: "text-[#0D631B]" },
  alert: { icon: AlertTriangle, bg: "bg-[#FFDAD6]", color: "text-[#BA1A1A]" },
  challenge: { icon: Trophy, bg: "bg-[#F4D9FF]", color: "text-[#7A2FAA]" },
};

export function RecentActivity({ items }: { items: RecentActivityItem[] }) {
  return (
    <div className="rounded-[1rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h3 className="mb-4 text-[18px] font-semibold leading-6 text-[#191C1E]">
        Recent Activity
      </h3>
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const config = iconMap[item.icon];
          const Icon = config.icon;
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg}`}
              >
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] leading-5 text-[#191C1E]">
                  {item.highlight && (
                    <span className="font-semibold">{item.highlight} </span>
                  )}
                  {item.message}
                </p>
                <p className="mt-0.5 text-[13px] text-[#707A6C]">
                  {item.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

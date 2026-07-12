import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KpiData } from "@/lib/mock-data/dashboard";

const trendConfig = {
  up: { icon: TrendingUp, color: "text-[#0D631B]", prefix: "↗" },
  down: { icon: TrendingDown, color: "text-[#BA1A1A]", prefix: "↘" },
  flat: { icon: Minus, color: "text-[#707A6C]", prefix: "—" },
};

export function KpiCard({ label, score, maxScore, deltaPercent, trend }: KpiData) {
  const { color, prefix } = trendConfig[trend];

  return (
    <div className="flex flex-col justify-between rounded-[1rem] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#707A6C]">
          {label}
        </span>
        <Info className="h-4 w-4 text-[#BFC9BA]" />
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[32px] font-bold leading-[1.2] tracking-[-0.01em] text-[#191C1E]">
          {score}
        </span>
        <span className="text-[13px] font-normal text-[#707A6C]">/{maxScore}</span>
        <span className={`ml-2 text-[13px] font-medium ${color}`}>
          {prefix}{deltaPercent}%
        </span>
      </div>
    </div>
  );
}

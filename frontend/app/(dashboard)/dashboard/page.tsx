"use client";

import { KpiCard } from "@/components/kpi-card";
import { EmissionsTrendChart } from "@/components/emissions-trend-chart";
import { DeptRankingChart } from "@/components/dept-ranking-chart";
import { RecentActivity } from "@/components/recent-activity";
import { QuickActions } from "@/components/quick-actions";
import { InsightBanner } from "@/components/insight-banner";
import {
  kpiCards,
  emissionsTrend,
  deptRankings,
  recentActivity,
  insightBanner,
} from "@/lib/mock-data/dashboard";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
      <InsightBanner
        message={insightBanner.message}
        detail={insightBanner.detail}
        actionLabel={insightBanner.actionLabel}
      />

      <div className="grid grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6">
        <EmissionsTrendChart data={emissionsTrend} />
        <DeptRankingChart data={deptRankings} />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6">
        <RecentActivity items={recentActivity} />
        <QuickActions />
      </div>
    </div>
  );
}

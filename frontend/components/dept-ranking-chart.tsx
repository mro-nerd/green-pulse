import { MoreVertical } from "lucide-react";
import type { DeptRanking } from "@/lib/mock-data/dashboard";

export function DeptRankingChart({ data }: { data: DeptRanking[] }) {
  const maxScore = Math.max(...data.map((d) => d.score));

  return (
    <div className="rounded-[1rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[18px] font-semibold leading-6 text-[#191C1E]">
          Dept Ranking
        </h3>
        <button className="rounded-[0.5rem] p-1 text-[#707A6C] hover:bg-[#F2F4F6]">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {data.map((dept) => (
          <div key={dept.department}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[14px] font-normal leading-5 text-[#191C1E]">
                {dept.department}
              </span>
              <span className="text-[14px] font-semibold text-[#191C1E]">
                {dept.score}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EDEEF0]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(dept.score / maxScore) * 100}%`,
                  backgroundColor: dept.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

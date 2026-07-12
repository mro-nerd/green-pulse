"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MoreVertical } from "lucide-react";
import type { EmissionsTrendPoint } from "@/lib/mock-data/dashboard";

export function EmissionsTrendChart({
  data,
}: {
  data: EmissionsTrendPoint[];
}) {
  return (
    <div className="rounded-[1rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[18px] font-semibold leading-6 text-[#191C1E]">
            Emissions Trend
          </h3>
          <span className="text-[13px] font-normal text-[#707A6C]">(12 months)</span>
        </div>
        <button className="rounded-[0.5rem] p-1 text-[#707A6C] hover:bg-[#F2F4F6]">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDEEF0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 13, fill: "#707A6C", fontWeight: 450 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 13, fill: "#707A6C", fontWeight: 450 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                fontSize: 13,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Line
              type="monotone"
              dataKey="emissions"
              stroke="#0D631B"
              strokeWidth={2}
              dot={{ r: 3, fill: "#0D631B" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ActionCardProps {
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  badge?: {
    text: string;
    variant: "default" | "success" | "warning" | "error" | "neutral";
  };
  meta: {
    label: string;
    value: ReactNode;
    align?: "left" | "right";
  }[];
  actionText: string;
  actionState?: "default" | "in-progress" | "disabled" | "success";
  onClickAction?: () => void;
}

export function ActionCard({
  icon,
  iconBgColor = "bg-orange-50",
  iconColor = "text-orange-600",
  title,
  subtitle,
  badge,
  meta,
  actionText,
  actionState = "default",
  onClickAction,
}: ActionCardProps) {
  const getBadgeStyle = (variant: string) => {
    switch (variant) {
      case "warning":
        return "bg-orange-100 text-orange-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "neutral":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getButtonStyle = (state: string) => {
    switch (state) {
      case "in-progress":
        return "bg-[#EA580C] hover:bg-[#C2410C] text-white";
      case "success":
        return "bg-[#0D631B] hover:bg-[#0A4A14] text-white";
      case "disabled":
        return "bg-gray-100 text-gray-400 cursor-not-allowed";
      case "default":
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-900";
    }
  };

  return (
    <div className="flex flex-col rounded-[1rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        {badge && (
          <span className={`px-2 py-0.5 text-[11px] font-semibold rounded ${getBadgeStyle(badge.variant)}`}>
            {badge.text}
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-[18px] font-semibold leading-[24px] text-[#191C1E] mb-2">{title}</h3>
        <p className="text-[14px] leading-[20px] text-[#707A6C] mb-6 line-clamp-3">{subtitle}</p>
      </div>

      <div className="flex justify-between items-end border-t border-[#E2E8F0] pt-4 mb-5">
        {meta.map((item, idx) => (
          <div key={idx} className={`flex flex-col ${item.align === "right" ? "text-right" : "text-left"}`}>
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#707A6C] mb-1">
              {item.label}
            </span>
            <span className="text-[14px] font-semibold text-[#191C1E]">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <button
        disabled={actionState === "disabled"}
        onClick={onClickAction}
        className={`w-full rounded-md py-2 text-[14px] font-medium transition-colors ${getButtonStyle(actionState)}`}
      >
        {actionText}
      </button>
    </div>
  );
}

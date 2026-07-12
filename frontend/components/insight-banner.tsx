import { Lightbulb } from "lucide-react";

type InsightBannerProps = {
  message: string;
  detail: string;
  actionLabel: string;
  onAction?: () => void;
};

export function InsightBanner({
  message,
  detail,
  actionLabel,
  onAction,
}: InsightBannerProps) {
  return (
    <div className="flex items-center justify-between rounded-[1rem] bg-[#F4D9FF] px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#954BC5]">
          <Lightbulb className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-[14px] font-semibold leading-5 text-[#191C1E]">{message}</p>
          <p className="text-[13px] font-normal leading-[18px] text-[#40493D]">{detail}</p>
        </div>
      </div>
      <button
        onClick={onAction}
        className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#7A2FAA] transition-colors hover:text-[#6A1B9A]"
      >
        {actionLabel}
      </button>
    </div>
  );
}

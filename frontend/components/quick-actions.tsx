import { PlusCircle, Flag, BarChart3 } from "lucide-react";

const actions = [
  {
    label: "Log Carbon Data",
    icon: PlusCircle,
    primary: true,
    href: "/environmental",
  },
  {
    label: "Start Challenge",
    icon: Flag,
    primary: false,
    href: "/gamification",
  },
  {
    label: "View Reports",
    icon: BarChart3,
    primary: false,
    href: "/reports",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-[1rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h3 className="mb-4 text-[18px] font-semibold leading-6 text-[#191C1E]">
        Quick Actions
      </h3>
      <div className="flex flex-col gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.label}
              href={action.href}
              className={`flex h-[40px] items-center justify-center gap-2 rounded-[0.5rem] text-[14px] font-medium transition-colors ${
                action.primary
                  ? "bg-[#2E7D32] text-white hover:bg-[#0D631B]"
                  : "border border-[#E2E8F0] bg-white text-[#191C1E] hover:bg-[#F2F4F6]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

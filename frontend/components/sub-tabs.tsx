import Link from "next/link";

interface SubTabsProps {
  tabs: { name: string; href: string }[];
  activeTabName?: string;
}

export function SubTabs({ tabs, activeTabName, activeColor = "#EA580C" }: SubTabsProps & { activeColor?: string }) {

  return (
    <div className="border-b border-[#E2E8F0] bg-white">
      <div className="px-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const isActive = tab.name === activeTabName;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                style={isActive ? { borderColor: activeColor, color: activeColor } : {}}
                className={`whitespace-nowrap border-b-2 py-4 text-[14px] font-medium transition-colors ${
                  isActive
                    ? ""
                    : "border-transparent text-[#707A6C] hover:border-[#E1E2E4] hover:text-[#191C1E]"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

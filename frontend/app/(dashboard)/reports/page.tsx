import { 
  Sparkles, 
  Leaf, 
  Users, 
  Gavel, 
  PieChart, 
  Wrench, 
  Play, 
  FileText, 
  FileSpreadsheet, 
  FileCode,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { prebuiltReports } from "@/lib/mock-data/reports"

export default function ReportsPage() {
  return (
    <div className="flex w-full flex-col bg-[#F7F8FA] min-h-screen">
      {/* Top Header */}
      <header className="flex h-[72px] items-center border-b border-[#E2E8F0] bg-[#F7F8FA] px-8">
        <h1 className="text-[24px] font-semibold text-[#191C1E]">Report Center</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* NL Query Bar */}
          <div className="flex items-center gap-4 rounded-[12px] border border-[#7A2FAA]/30 bg-white p-3 shadow-sm">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7A2FAA]" />
              <Input
                placeholder="Ask for a report, e.g. 'high severity issues in Manufacturing this quarter'"
                className="h-[44px] w-full border-none pl-11 text-[15px] shadow-none focus-visible:ring-0 placeholder:text-[#707A6C]"
              />
            </div>
            <Button className="h-[44px] gap-2 rounded-[8px] bg-[#7A2FAA] px-6 text-[14px] font-semibold hover:bg-[#6a2894]">
              <Sparkles className="h-4 w-4" />
              GENERATE
            </Button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Pre-built Reports */}
            <div className="lg:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2">
              {prebuiltReports.map((report) => (
                <div key={report.id} className="flex flex-col justify-between rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div>
                    <div className="mb-4 flex items-start gap-4">
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-[8px]"
                        style={{ backgroundColor: `${report.color}15` }}
                      >
                        {report.id === 'env-std' && <Leaf className="h-6 w-6" style={{ color: report.color }} />}
                        {report.id === 'soc-std' && <Users className="h-6 w-6" style={{ color: report.color }} />}
                        {report.id === 'gov-std' && <Gavel className="h-6 w-6" style={{ color: report.color }} />}
                        {report.id === 'esg-summary' && <PieChart className="h-6 w-6" style={{ color: report.color }} />}
                      </div>
                      <div>
                        <h3 className="text-[18px] font-semibold text-[#191C1E]">{report.module}</h3>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#707A6C]">
                          {report.badgeLabel}
                        </span>
                      </div>
                    </div>
                    <p className="mb-8 text-[14px] leading-relaxed text-[#40493d]">
                      {report.description}
                    </p>
                  </div>
                  {report.id === 'esg-summary' ? (
                    <Button className="h-[40px] w-full bg-[#191C1E] text-[13px] font-semibold uppercase tracking-[0.05em] text-white hover:bg-[#2e3132]">
                      GENERATE FULL REPORT
                    </Button>
                  ) : (
                    <Button variant="outline" className="h-[40px] w-full border-[#E2E8F0] text-[13px] font-semibold uppercase tracking-[0.05em] text-[#707A6C] hover:bg-[#F7F8FA] hover:text-[#191C1E]">
                      GENERATE
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Builder */}
            <div className="flex flex-col rounded-[12px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="border-b border-[#E2E8F0] p-6">
                <div className="mb-2 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-[#40493d]" />
                  <h2 className="text-[18px] font-semibold text-[#191C1E]">Custom Builder</h2>
                </div>
                <p className="text-[14px] text-[#40493d]">
                  Configure specific parameters for targeted data extraction.
                </p>
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">
                      Date Range
                    </label>
                    <div className="relative">
                      <select className="h-[40px] w-full appearance-none rounded-[6px] border border-[#E2E8F0] bg-white px-3 text-[14px] text-[#191C1E] focus:border-[#0D631B] focus:outline-none focus:ring-1 focus:ring-[#0D631B]">
                        <option>Current Quarter (Q3 2023)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707A6C] pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">
                      Department / Facility
                    </label>
                    <div className="relative">
                      <select className="h-[40px] w-full appearance-none rounded-[6px] border border-[#E2E8F0] bg-white px-3 text-[14px] text-[#191C1E] focus:border-[#0D631B] focus:outline-none focus:ring-1 focus:ring-[#0D631B]">
                        <option>All Departments</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707A6C] pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">
                      Module
                    </label>
                    <div className="relative">
                      <select className="h-[40px] w-full appearance-none rounded-[6px] border border-[#E2E8F0] bg-white px-3 text-[14px] text-[#191C1E] focus:border-[#0D631B] focus:outline-none focus:ring-1 focus:ring-[#0D631B]">
                        <option>Environmental</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707A6C] pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">
                      Category Focus
                    </label>
                    <select multiple className="h-[80px] w-full rounded-[6px] border border-[#E2E8F0] bg-white p-2 text-[14px] text-[#191C1E] focus:border-[#0D631B] focus:outline-none focus:ring-1 focus:ring-[#0D631B]">
                      <option className="rounded-sm bg-[#E2E8F0] p-1">Scope 1 Emissions</option>
                      <option className="p-1">Scope 2 Emissions</option>
                      <option className="p-1">Scope 3 Emissions</option>
                    </select>
                    <span className="text-[11px] text-[#707A6C]">Hold Cmd/Ctrl to select multiple</span>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <Button className="h-[44px] w-full bg-[#0D631B] text-[14px] font-bold tracking-[0.02em] text-white hover:bg-[#1b6d24]">
                    <Play className="mr-2 h-4 w-4 fill-white" />
                    RUN REPORT
                  </Button>
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="h-[40px] border-[#E2E8F0] text-[13px] text-[#40493d]">
                      <FileText className="mr-1.5 h-4 w-4" /> PDF
                    </Button>
                    <Button variant="outline" className="h-[40px] border-[#E2E8F0] text-[13px] text-[#40493d]">
                      <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Excel
                    </Button>
                    <Button variant="outline" className="h-[40px] border-[#E2E8F0] text-[13px] text-[#40493d]">
                      <FileCode className="mr-1.5 h-4 w-4" /> CSV
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

function SearchIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

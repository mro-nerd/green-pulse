import { Leaf, Bell, Plus, Pencil, Trash2, ChevronDown, Search, Info, ListFilter } from "lucide-react"
import { SubTabs } from "@/components/sub-tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { activeGoals } from "@/lib/mock-data/environmental"
import type { EnvironmentalGoal } from "@/lib/types"

const tabs = [
  { name: "Emission Factors", href: "/environmental/emission-factors" },
  { name: "Product ESG Profiles", href: "/environmental/products" },
  { name: "Carbon Transactions", href: "/environmental/transactions" },
  { name: "Environmental Goals", href: "/environmental" },
]

export default function EnvironmentalPage() {
  return (
    <div className="flex w-full flex-col bg-[#F7F8FA] min-h-screen">
      {/* Top Header */}
      <header className="flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-[#F7F8FA] px-8">
        <div className="flex items-center gap-3">
          <Leaf className="h-6 w-6 text-[#0D631B]" />
          <h1 className="text-[24px] font-semibold text-[#191C1E]">Environmental Module</h1>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#40493d] hover:bg-[#E2E8F0]">
          <Bell className="h-5 w-5" />
        </button>
      </header>

      {/* Sub Tabs */}
      <SubTabs tabs={tabs} activeTabName="Environmental Goals" activeColor="#0D631B" />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between rounded-[12px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <Button className="h-[32px] bg-[#0D631B] hover:bg-[#1b6d24] text-white gap-1.5 px-3">
                <Plus className="h-4 w-4" />
                New Goal
              </Button>
              <Button variant="outline" className="h-[32px] gap-1.5 px-3 border-[#E2E8F0] text-[#40493d]">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" className="h-[32px] gap-1.5 px-3 border-[#E2E8F0] text-[#BA1A1A] hover:text-[#BA1A1A] hover:bg-[#ffdad6]/20">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button variant="outline" className="h-[32px] gap-1.5 px-3 border-[#E2E8F0] text-[#40493d]">
                Export
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707A6C]" />
              <Input
                placeholder="Search goals..."
                className="h-[32px] w-full pl-9 rounded-[6px] border-[#E2E8F0] bg-white focus-visible:ring-[#0D631B]"
              />
            </div>
          </div>

          {/* Data Card */}
          <div className="overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-6">
              <h2 className="text-[18px] font-semibold text-[#191C1E]">Active Environmental Goals</h2>
              <button className="text-[#707A6C] hover:text-[#191C1E]">
                <ListFilter className="h-5 w-5" />
              </button>
            </div>

            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-[#E2E8F0] hover:bg-transparent">
                    <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Name</TableHead>
                    <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Department</TableHead>
                    <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Target CO2</TableHead>
                    <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Current CO2</TableHead>
                    <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Progress</TableHead>
                    <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Deadline</TableHead>
                    <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeGoals.map((goal: EnvironmentalGoal) => (
                    <TableRow key={goal.id} className="h-14 border-b-[#E2E8F0] hover:bg-[#F7F8FA]">
                      <TableCell className="text-[13px] font-medium text-[#191C1E]">{goal.name}</TableCell>
                      <TableCell className="text-[13px] text-[#40493d]">
                        {goal.department_id === 'dept-manufacturing-001' ? 'Manufacturing' :
                         goal.department_id === 'dept-facilities-002' ? 'Facilities' : 'Logistics'}
                      </TableCell>
                      <TableCell className="text-[13px] text-[#40493d]">{goal.target_co2}{goal.target_co2 === 100 ? '%' : goal.target_co2 === 250 ? ' EVs' : 't'}</TableCell>
                      <TableCell className="text-[13px] text-[#40493d]">{goal.current_co2}{goal.target_co2 === 100 ? '%' : goal.target_co2 === 250 ? ' EVs' : 't'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-[#E2E8F0]">
                            <div 
                              className={`h-full rounded-full ${goal.status === 'on_track' ? 'bg-[#0D631B]' : 'bg-[#005db7]'}`}
                              style={{ width: `${goal.progress_pct}%` }}
                            />
                          </div>
                          <span className="text-[13px] font-medium text-[#40493d]">{goal.progress_pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-[#40493d]">{goal.deadline.split('T')[0]}</TableCell>
                      <TableCell>
                        {goal.status === 'on_track' ? (
                          <span className="inline-flex items-center rounded-md bg-[#CBFFC2] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#005312]">
                            On Track
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-[#E1E2E4] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">
                            Lagging
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F7F8FA] px-6 py-4">
              <div className="flex items-center gap-2 text-[#707A6C]">
                <Info className="h-4 w-4" />
                <span className="text-[13px] font-medium">Carbon Transactions auto-generated from Purchase/Manufacturing/Fleet/Expenses</span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="peer h-5 w-9 rounded-full bg-[#E2E8F0] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-[#E2E8F0] after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0D631B] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

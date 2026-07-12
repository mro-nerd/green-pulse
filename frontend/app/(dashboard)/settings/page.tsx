import { Bell, Search, Pencil, Trash2, Plus } from "lucide-react"
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
import { mockDepartments, mockEsgConfig } from "@/lib/mock-data/settings"

const tabs = [
  { name: "Departments", href: "/settings" },
  { name: "Categories", href: "#" },
  { name: "ESG Configuration", href: "#" },
  { name: "Notification Settings", href: "#" },
]

export default function SettingsPage() {
  return (
    <div className="flex w-full flex-col bg-[#F7F8FA] min-h-screen">
      {/* Top Header - Settings Specific */}
      <header className="flex h-[72px] items-center justify-between bg-white px-8">
        <div className="flex items-center gap-3">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707A6C]" />
            <Input
              placeholder="Search settings..."
              className="h-[40px] w-full rounded-full border border-[#E2E8F0] bg-white pl-9 focus-visible:ring-[#0D631B]"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#40493d] hover:bg-[#E2E8F0]">
            <Bell className="h-5 w-5" />
          </button>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-[#E2E8F0]">
            {/* Avatar placeholder */}
            <div className="h-full w-full bg-[#D9D9D9]"></div>
          </div>
        </div>
      </header>

      {/* Page Title & SubTabs */}
      <div className="bg-white px-8 pt-8">
        <h1 className="mb-6 text-[32px] font-bold tracking-tight text-[#191C1E]">Settings</h1>
      </div>
      <SubTabs tabs={tabs} activeTabName="Departments" activeColor="#0D631B" />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Left Column (Departments) */}
          <div className="lg:col-span-8 flex flex-col rounded-[12px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-6">
              <h2 className="text-[18px] font-semibold text-[#191C1E]">Manage Departments</h2>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="h-[36px] gap-2 border-[#E2E8F0] text-[#40493d]">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" className="h-[36px] gap-2 border-[#E2E8F0] text-[#BA1A1A] hover:bg-[#ffdad6]/20 hover:text-[#BA1A1A]">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <Button className="h-[36px] gap-2 bg-[#0D631B] text-white hover:bg-[#1b6d24]">
                  <Plus className="h-4 w-4" />
                  New Dept
                </Button>
              </div>
            </div>

            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-[#E2E8F0] hover:bg-transparent">
                    <TableHead className="w-12 px-6 h-12"></TableHead>
                    <TableHead className="h-12 text-[12px] font-semibold text-[#191C1E]">Name</TableHead>
                    <TableHead className="h-12 text-[12px] font-semibold text-[#191C1E]">Code</TableHead>
                    <TableHead className="h-12 text-[12px] font-semibold text-[#191C1E]">Head</TableHead>
                    <TableHead className="h-12 text-[12px] font-semibold text-[#191C1E]">Employee Count</TableHead>
                    <TableHead className="h-12 text-[12px] font-semibold text-[#191C1E]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDepartments.map((dept) => (
                    <TableRow key={dept.id} className="h-[52px] border-b-[#E2E8F0]">
                      <TableCell className="px-6">
                        <input type="checkbox" className="h-4 w-4 rounded border-[#E2E8F0] text-[#0D631B] focus:ring-[#0D631B]" />
                      </TableCell>
                      <TableCell className="text-[13px] text-[#191C1E]">{dept.name}</TableCell>
                      <TableCell className="text-[13px] text-[#40493d]">{dept.code}</TableCell>
                      <TableCell className="text-[13px] text-[#40493d]">
                        {dept.head_user_id ? dept.head_user_id.split('-').slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-[13px] text-[#40493d]">{dept.employee_count}</TableCell>
                      <TableCell>
                        {dept.status === 'active' ? (
                          <span className="inline-flex items-center rounded-full bg-[#CBFFC2] px-2.5 py-0.5 text-[12px] font-medium text-[#005312]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-[#E1E2E4] px-2.5 py-0.5 text-[12px] font-medium text-[#40493d]">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-4">
            
            {/* ESG Config Card */}
            <div className="flex flex-col rounded-[12px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <h2 className="mb-1 text-[18px] font-semibold text-[#191C1E]">ESG Configuration</h2>
              <p className="mb-6 text-[13px] text-[#707A6C]">Manage global reporting rules.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-medium text-[#191C1E]">Auto Emission Calc</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#707A6C]">Use Default Conversion Factors</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked={mockEsgConfig.auto_emission_calc} className="peer sr-only" />
                    <div className="peer h-6 w-11 rounded-full bg-[#E2E8F0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#E2E8F0] after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0D631B] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-medium text-[#191C1E]">Evidence Required</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#707A6C]">Mandate Files For Scope 3</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked={mockEsgConfig.evidence_required} className="peer sr-only" />
                    <div className="peer h-6 w-11 rounded-full bg-[#E2E8F0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#E2E8F0] after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0D631B] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-medium text-[#191C1E]">Auto-Award Badges</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#707A6C]">Gamification Module</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked={mockEsgConfig.badge_auto_award} className="peer sr-only" />
                    <div className="peer h-6 w-11 rounded-full bg-[#E2E8F0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#E2E8F0] after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0D631B] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-medium text-[#191C1E]">Email Alerts</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#707A6C]">Weekly Summary Reports</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked={mockEsgConfig.notification_channels.includes("email")} className="peer sr-only" />
                    <div className="peer h-6 w-11 rounded-full bg-[#E2E8F0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#E2E8F0] after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0D631B] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Score Weighting Card */}
            <div className="flex flex-col rounded-[12px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <h2 className="mb-1 text-[18px] font-semibold text-[#191C1E]">Score Weighting</h2>
              <p className="mb-6 text-[13px] text-[#707A6C]">Adjust pillar impact on overall score.</p>
              
              <div className="mb-6 flex h-[10px] w-full overflow-hidden rounded-full">
                <div style={{ width: '40%' }} className="bg-[#0D631B]"></div>
                <div style={{ width: '30%' }} className="bg-[#4D90FE]"></div>
                <div style={{ width: '30%' }} className="bg-[#7A2FAA]"></div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#0D631B]"></div>
                    <span className="text-[14px] font-medium text-[#191C1E]">Environmental</span>
                  </div>
                  <div className="relative">
                    <input type="text" defaultValue="40%" className="h-[32px] w-[64px] rounded border border-[#E2E8F0] bg-[#F7F8FA] px-2 text-center text-[13px] text-[#40493d] focus:outline-none focus:ring-1 focus:ring-[#0D631B]" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#4D90FE]"></div>
                    <span className="text-[14px] font-medium text-[#191C1E]">Social</span>
                  </div>
                  <div className="relative">
                    <input type="text" defaultValue="30%" className="h-[32px] w-[64px] rounded border border-[#E2E8F0] bg-[#F7F8FA] px-2 text-center text-[13px] text-[#40493d] focus:outline-none focus:ring-1 focus:ring-[#0D631B]" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#7A2FAA]"></div>
                    <span className="text-[14px] font-medium text-[#191C1E]">Governance</span>
                  </div>
                  <div className="relative">
                    <input type="text" defaultValue="30%" className="h-[32px] w-[64px] rounded border border-[#E2E8F0] bg-[#F7F8FA] px-2 text-center text-[13px] text-[#40493d] focus:outline-none focus:ring-1 focus:ring-[#0D631B]" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button variant="secondary" className="h-[36px] bg-[#E1E2E4] px-6 text-[13px] font-medium text-[#191C1E] hover:bg-[#d0d1d3]">
                  Reset
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

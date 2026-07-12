import { Plus, GraduationCap, TreePine, HandHeart, Paperclip, Image as ImageIcon, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockCsrActivities, mockEmployeeParticipations } from "@/lib/mock-data/social"

export default function SocialPage() {
  return (
    <div className="flex w-full flex-col bg-[#F7F8FA] min-h-screen">
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* Title and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[32px] font-bold text-[#191C1E] tracking-tight leading-none">Active CSR Initiatives</h2>
              <p className="text-[14px] text-[#707A6C] mt-2 font-medium">
                Manage and track corporate social responsibility programs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button className="h-[40px] gap-2 bg-[#14532D] hover:bg-[#0f3f22] text-white font-semibold rounded-[8px] px-4 transition-colors">
                <Plus className="h-4 w-4" />
                Create Activity
              </Button>
            </div>
          </div>

          {/* CSR Initiatives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockCsrActivities.map((activity, index) => {
              // Styling based on index to match mockup colors
              const colorTheme = 
                index === 0 ? { bg: "bg-[#7AA4F5]/20", text: "text-[#2563EB]", bar: "bg-[#2563EB]" } :
                index === 1 ? { bg: "bg-[#86EFAC]/40", text: "text-[#166534]", bar: "bg-[#166534]" } :
                { bg: "bg-[#E9D5FF]/50", text: "text-[#7E22CE]", bar: "bg-[#7E22CE]" }

              const Icon = 
                index === 0 ? GraduationCap :
                index === 1 ? TreePine : HandHeart

              const statusBadge = activity.status === "active" 
                ? "bg-[#DBEAFE] text-[#1E3A8A]" // blue active
                : "bg-[#F3F4F6] text-[#374151]" // gray upcoming

              const progressPct = (activity.current_participants / activity.max_participants) * 100

              return (
                <div key={activity.id} className="rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col h-full">
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className={`h-12 w-12 rounded-[8px] flex items-center justify-center ${colorTheme.bg}`}>
                      <Icon className={`h-6 w-6 ${colorTheme.text}`} />
                    </div>
                    <span className={`inline-flex items-center rounded-[6px] px-2.5 py-1 text-[11px] font-bold capitalize ${statusBadge}`}>
                      {activity.status}
                    </span>
                  </div>

                  <h3 className="text-[18px] font-bold text-[#191C1E] mb-2">{activity.title}</h3>
                  
                  <div>
                    <span className="inline-flex items-center rounded-full bg-[#F1F2F4] px-3 py-1 text-[11px] font-bold text-[#40493d]">
                      {activity.evidence_type_text}
                    </span>
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[13px] text-[#707A6C] font-medium">Participants</span>
                      <span className="text-[13px] font-bold text-[#191C1E]">{activity.current_participants} / {activity.max_participants}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F1F2F4] overflow-hidden mb-6">
                      <div className={`h-full ${colorTheme.bar}`} style={{ width: `${progressPct}%` }} />
                    </div>
                    
                    <Button variant="outline" className="w-full h-[40px] border-[#E2E8F0] text-[#191C1E] font-semibold rounded-[8px] bg-white hover:bg-[#F7F8FA] transition-colors">
                      Manage
                    </Button>
                  </div>
                  
                </div>
              )
            })}
          </div>

          {/* Approval Queue Table */}
          <div className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5">
              <h3 className="text-[16px] font-bold text-[#191C1E]">Employee Participation — Approval Queue</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#454f42]">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-[#E2E8F0] hover:bg-transparent">
                    <TableHead className="h-12 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Employee</TableHead>
                    <TableHead className="h-12 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Activity</TableHead>
                    <TableHead className="h-12 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Proof</TableHead>
                    <TableHead className="h-12 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Points</TableHead>
                    <TableHead className="h-12 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Status</TableHead>
                    <TableHead className="h-12 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEmployeeParticipations.map((item) => (
                    <TableRow key={item.id} className="h-[64px] border-b-[#E2E8F0] hover:bg-[#F7F8FA]/50">
                      
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.employee_avatar} alt={item.employee_name} />
                            <AvatarFallback className="bg-[#E1E2E4] text-[11px] text-[#191C1E] font-bold">
                              {item.employee_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[13px] font-bold text-[#191C1E]">{item.employee_name}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-[13px] text-[#40493d] font-semibold">
                        {item.activity_title}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 cursor-pointer group">
                          {item.proof_type === 'pdf' ? (
                            <Paperclip className="h-4 w-4 text-[#2563EB] group-hover:text-blue-700 transition-colors" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-[#2563EB] group-hover:text-blue-700 transition-colors" />
                          )}
                          <span className="text-[13px] font-bold text-[#2563EB] group-hover:text-blue-700 transition-colors">
                            {item.proof_filename}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-[13px] text-[#40493d] font-medium">
                        {item.points_earned}
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-[#E1E2E4] px-2.5 py-0.5 text-[11px] font-bold text-[#40493d] capitalize">
                          {item.approval_status}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        {/* Placeholder for actions */}
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

import { Plus, Download, AlertTriangle, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockAudits, mockComplianceIssues } from "@/lib/mock-data/governance"
import Link from "next/link"

const tabs = [
  { name: "Policies", href: "#" },
  { name: "Policy Acknowledgements", href: "#" },
  { name: "Audits", href: "/governance" },
  { name: "Compliance Issues", href: "#" },
]

export default function GovernancePage() {
  return (
    <div className="flex w-full flex-col bg-[#F7F8FA] min-h-screen">
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* Title and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[32px] font-bold text-[#191C1E] tracking-tight leading-none">Audits & Compliance</h2>
              <p className="text-[14px] text-[#707A6C] mt-2 font-medium">
                Manage governance audits and track compliance issues.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-[40px] gap-2 border-[#E2E8F0] text-[#191C1E] font-semibold rounded-[8px] bg-white hover:bg-[#F7F8FA] transition-colors px-4">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="h-[40px] gap-2 bg-[#7A2FAA] hover:bg-[#6a1b9a] text-white font-semibold rounded-[8px] px-4 transition-colors">
                <Plus className="h-4 w-4" />
                New Audit
              </Button>
            </div>
          </div>

          {/* Recent Audits Table */}
          <div className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="border-b border-[#E2E8F0] p-5">
              <h3 className="text-[16px] font-bold text-[#191C1E]">Recent Audits</h3>
            </div>
            
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-[#E2E8F0] hover:bg-transparent">
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Title</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Department</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Auditor</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Date</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Findings</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42] text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAudits.map((audit) => {
                    const statusStyles = 
                      audit.status === "completed" 
                        ? "bg-[#CBFFC2] text-[#005312]" 
                        : "bg-[#E1E2E4] text-[#40493d]"
                    
                    const deptDisplay = 
                      audit.department_id === "dept-finance" ? "Finance" :
                      audit.department_id === "dept-it" ? "IT" : "Procurement"

                    const auditorDisplay =
                      audit.auditor_id === "auditor-jane" ? "Jane Doe" :
                      audit.auditor_id === "auditor-external" ? "External Sec" : "Michael Chen"

                    return (
                      <TableRow key={audit.id} className="h-[52px] border-b-[#E2E8F0] hover:bg-[#F7F8FA]/50">
                        <TableCell className="text-[13px] font-semibold text-[#191C1E]">{audit.title}</TableCell>
                        <TableCell className="text-[13px] text-[#40493d] font-semibold">{deptDisplay}</TableCell>
                        <TableCell className="text-[13px] text-[#40493d] font-semibold">{auditorDisplay}</TableCell>
                        <TableCell className="text-[13px] text-[#40493d] font-medium">{audit.audit_date}</TableCell>
                        <TableCell className="text-[13px] text-[#40493d] font-semibold">{audit.findings_summary}</TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusStyles}`}>
                            {audit.status === "completed" ? "Completed" : "In Progress"}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Compliance Issues Table */}
          <div className="overflow-hidden rounded-[16px] border border-[#ffdad6] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 bg-[#ffdad6]/20 border-b border-[#ffdad6] p-4 text-[#BA1A1A]">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="text-[15px] font-bold">Compliance Issues</h3>
            </div>
            
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-[#E2E8F0] hover:bg-transparent">
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Severity</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Issue Description</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Department</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Owner</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42]">Due Date</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#454f42] text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockComplianceIssues.map((issue, idx) => {
                    let severityStyles = "bg-[#ffdad6] text-[#BA1A1A]"
                    let severityText = "High"
                    
                    if (issue.severity === "medium") {
                      severityStyles = "bg-[#F2ECF7] text-[#7A2FAA]"
                      severityText = "Medium"
                    } else if (issue.severity === "low") {
                      severityStyles = "bg-[#E1E2E4] text-[#40493d]"
                      severityText = "Low"
                    }

                    const deptDisplay = 
                      issue.owner_id === "owner-john" ? "Operations" :
                      issue.owner_id === "owner-sarah" ? "Procurement" : "HR"

                    const ownerDisplay =
                      issue.owner_id === "owner-john" ? "John Smith" :
                      issue.owner_id === "owner-sarah" ? "Sarah Lee" : "Team Leads"

                    const statusText = idx === 2 ? "In Progress" : "Open"

                    return (
                      <TableRow key={issue.id} className="h-[52px] border-b-[#E2E8F0] hover:bg-[#F7F8FA]/50">
                        <TableCell>
                          <span className={`inline-flex items-center rounded-[6px] px-2 py-0.5 text-[11px] font-bold ${severityStyles}`}>
                            {severityText}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] font-bold text-[#191C1E]">{issue.description}</TableCell>
                        <TableCell className="text-[13px] text-[#40493d] font-semibold">{deptDisplay}</TableCell>
                        <TableCell className="text-[13px] text-[#40493d] font-semibold">{ownerDisplay}</TableCell>
                        <TableCell className="text-[13px] font-semibold">
                          {issue.overdue ? (
                            <span className="text-[#BA1A1A] font-bold">{issue.due_date} (Overdue)</span>
                          ) : (
                            <span className="text-[#40493d] font-medium">{issue.due_date}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center rounded-full bg-[#E1E2E4] px-2.5 py-0.5 text-[11px] font-bold text-[#40493d]">
                            {statusText}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

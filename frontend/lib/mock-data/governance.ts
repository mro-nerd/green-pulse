import type { Audit, ComplianceIssue } from "@/lib/types"

export const mockAudits: Audit[] = [
  {
    id: "audit-1",
    title: "Q3 Financial Audit",
    department_id: "dept-finance",
    auditor_id: "auditor-jane",
    audit_date: "2023-10-15",
    findings_summary: "None",
    status: "completed"
  },
  {
    id: "audit-2",
    title: "Annual IT Security",
    department_id: "dept-it",
    auditor_id: "auditor-external",
    audit_date: "2023-09-20",
    findings_summary: "2 Minor",
    status: "completed"
  },
  {
    id: "audit-3",
    title: "Supplier Ethics Review",
    department_id: "dept-procurement",
    auditor_id: "auditor-michael",
    audit_date: "2023-11-05",
    findings_summary: "-",
    status: "under_review"
  }
]

export const mockComplianceIssues: ComplianceIssue[] = [
  {
    id: "issue-1",
    audit_id: "audit-x",
    severity: "high",
    description: "Missing Data Privacy Addendum",
    owner_id: "owner-john",
    due_date: "2023-10-01",
    status: "open",
    overdue: true
  },
  {
    id: "issue-2",
    audit_id: "audit-y",
    severity: "medium",
    description: "Vendor Assessment Pending",
    owner_id: "owner-sarah",
    due_date: "2023-11-20",
    status: "open",
    overdue: false
  },
  {
    id: "issue-3",
    audit_id: "audit-z",
    severity: "low",
    description: "Policy Acknowledgment Delay",
    owner_id: "owner-team-leads",
    due_date: "2023-12-01",
    status: "open",
    overdue: false
  }
]

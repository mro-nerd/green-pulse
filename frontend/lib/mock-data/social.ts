import { CsrActivity, EmployeeParticipation } from "../types";

export interface UICsrActivity extends CsrActivity {
  evidence_type_text: string;
  current_participants: number;
  max_participants: number;
}

export const mockCsrActivities: UICsrActivity[] = [
  {
    id: "csr-001",
    title: "Local School Mentoring",
    category_id: "cat-edu",
    description: "Mentoring students at local high schools.",
    department_id: "dept-all",
    evidence_required: true,
    status: "active",
    created_at: "2023-10-01",
    evidence_type_text: "Evidence Required",
    current_participants: 42,
    max_participants: 50,
  },
  {
    id: "csr-002",
    title: "Community Tree Planting",
    category_id: "cat-env",
    description: "Planting trees in the local community park.",
    department_id: "dept-all",
    evidence_required: true,
    status: "active",
    created_at: "2023-10-05",
    evidence_type_text: "Photo Proof",
    current_participants: 120,
    max_participants: 200,
  },
  {
    id: "csr-003",
    title: "Food Bank Volunteering",
    category_id: "cat-comm",
    description: "Assisting at the local food bank.",
    department_id: "dept-all",
    evidence_required: true,
    status: "upcoming",
    created_at: "2023-10-10",
    evidence_type_text: "Location Check-in",
    current_participants: 15,
    max_participants: 30,
  },
];

export interface UIEmployeeParticipation extends EmployeeParticipation {
  employee_name: string;
  employee_avatar: string;
  activity_title: string;
  proof_type: 'pdf' | 'image' | 'doc';
  proof_filename: string;
}

export const mockEmployeeParticipations: UIEmployeeParticipation[] = [
  {
    id: "ep-001",
    employee_id: "emp-sarah",
    csr_activity_id: "csr-001",
    proof_url: "/docs/doc_492.pdf",
    approval_status: "pending",
    points_earned: 50,
    completion_date: null,
    employee_name: "Sarah Jenkins",
    employee_avatar: "/avatars/sarah.jpg",
    activity_title: "Local School Mentoring",
    proof_type: "pdf",
    proof_filename: "doc_492.pdf",
  },
  {
    id: "ep-002",
    employee_id: "emp-michael",
    csr_activity_id: "csr-002",
    proof_url: "/images/photo_img.jpg",
    approval_status: "pending",
    points_earned: 120,
    completion_date: null,
    employee_name: "Michael Chen",
    employee_avatar: "/avatars/michael.jpg",
    activity_title: "Community Tree Planting",
    proof_type: "image",
    proof_filename: "photo_img.jpg",
  },
];

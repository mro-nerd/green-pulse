// Auth & Users
export type User = {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'dept_head' | 'employee' | 'auditor'
  department_id: string | null
  xp: number
  points: number
}
export type LoginRequest = { email: string; password: string }
export type LoginResponse = { access_token: string; token_type: 'bearer' }
export type AuthError = { code: string; message: string; details?: any }

// Environmental
export type EmissionFactor = {
  id: string; activity_type: string; unit: string; co2_per_unit: number;
  source: string; effective_date: string
}
export type ProductEsgProfile = {
  id: string; product_name: string; sku: string;
  carbon_footprint: number; recyclable_pct: number; notes: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  esg_score: number; image_url: string; category: string;
}
export type CarbonTransaction = {
  id: string; department_id: string;
  source_type: 'purchase' | 'manufacturing' | 'expense' | 'fleet';
  source_record_id: string | null; emission_factor_id: string;
  quantity: number; co2_calculated: number;
  auto_generated: boolean; created_at: string
}
export type EnvironmentalGoal = {
  id: string; department_id: string; name: string;
  target_co2: number; current_co2: number; progress_pct: number;
  deadline: string; status: 'active' | 'on_track' | 'at_risk' | 'completed' | 'lagging'
}

// Social
export type CsrActivity = {
  id: string; title: string; category_id: string; description: string;
  department_id: string; evidence_required: boolean;
  status: string; created_at: string
}
export type EmployeeParticipation = {
  id: string; employee_id: string; csr_activity_id: string;
  proof_url: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  points_earned: number; completion_date: string | null
}

// Governance
export type Policy = {
  id: string; title: string; body: string; category: string;
  version: string; effective_date: string; status: string
}
export type PolicyAcknowledgement = {
  id: string; employee_id: string; policy_id: string; acknowledged_at: string
}
export type Audit = {
  id: string; title: string; department_id: string; auditor_id: string;
  audit_date: string; findings_summary: string | null;
  status: 'scheduled' | 'under_review' | 'completed'
}
export type ComplianceIssue = {
  id: string; audit_id: string;
  severity: 'low' | 'medium' | 'high';
  description: string; owner_id: string;
  due_date: string; status: 'open' | 'resolved'; overdue: boolean
}

// Gamification
export type Challenge = {
  id: string; title: string; category_id: string; description: string;
  xp: number; difficulty: 'easy' | 'medium' | 'hard';
  evidence_required: boolean; deadline: string;
  status: 'draft' | 'active' | 'under_review' | 'completed' | 'archived'
}
export type ChallengeParticipation = {
  id: string; challenge_id: string; employee_id: string;
  progress_pct: number; proof_url: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  xp_awarded: number
}
export type Badge = {
  id: string; name: string; description: string;
  icon_url: string; unlock_rule: Record<string, any>
}
export type UserBadge = {
  badge: Badge; unlocked: boolean; unlocked_at: string | null
}
export type Reward = {
  id: string; name: string; description: string;
  points_required: number; stock: number; status: string
}
export type LeaderboardEntry = {
  rank: number; user_id: string; name: string;
  department: string; xp: number
}

// Dashboard & Scoring
export type DepartmentScore = {
  id: string; department_id: string;
  environmental_score: number; social_score: number;
  governance_score: number; total_score: number;
  period_start: string; period_end: string
}
export type DashboardSummary = {
  overall_esg_score: number;
  environmental_score: number; social_score: number; governance_score: number;
  trend: Array<{ period: string; score: number }>
  dept_rankings: Array<{ department_id: string; department_name: string; total_score: number }>
}
export type RecentActivityItem = {
  id: string; type: string; payload: Record<string, any>;
  read: boolean; created_at: string
}

// Reports
export type CustomReportRequest = {
  date_range: { start: string; end: string }
  department_ids: string[]
  module: string
  employee_id?: string
  challenge_id?: string
  esg_category?: string
}
export type ReportExportRequest = {
  format: 'pdf' | 'excel' | 'csv'
  report_id?: string
  filters: CustomReportRequest
}
export type NlQueryRequest = { prompt: string }
export type NlQueryResponse = {
  data: any[]
  resolved_filters: CustomReportRequest
  columns: Array<{ key: string; label: string }>
}

// Settings
export type Department = {
  id: string; name: string; code: string;
  head_user_id: string | null; parent_department_id: string | null;
  employee_count: number; status: string; created_at: string
}
export type Category = {
  id: string; name: string;
  type: 'csr_activity' | 'challenge'; status: string
}
export type EsgConfig = {
  environmental_weight: number; social_weight: number; governance_weight: number;
  auto_emission_calc: boolean; evidence_required: boolean;
  badge_auto_award: boolean; notification_channels: string[]
}
export type Notification = {
  id: string; user_id: string; type: string;
  payload: Record<string, any>; read: boolean; created_at: string
}

// Pagination
export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

// Shared Error
export type ApiError = {
  code: string
  message: string
  details?: any
}

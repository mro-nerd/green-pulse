import type { Department, EsgConfig } from "@/lib/types"

export const mockDepartments: Department[] = [
  {
    id: "dept-ops-100",
    name: "Operations",
    code: "OP-100",
    head_user_id: "user-sarah-jenkins",
    parent_department_id: null,
    employee_count: 452,
    status: "active",
    created_at: "2023-01-15T00:00:00Z"
  },
  {
    id: "dept-log-200",
    name: "Logistics",
    code: "LG-200",
    head_user_id: "user-michael-chang",
    parent_department_id: null,
    employee_count: 890,
    status: "active",
    created_at: "2023-02-20T00:00:00Z"
  },
  {
    id: "dept-fac-300",
    name: "Facilities",
    code: "FC-300",
    head_user_id: "user-elena-rostova",
    parent_department_id: null,
    employee_count: 124,
    status: "active",
    created_at: "2023-03-10T00:00:00Z"
  },
  {
    id: "dept-mkt-400",
    name: "Marketing",
    code: "MK-400",
    head_user_id: "user-david-kim",
    parent_department_id: null,
    employee_count: 65,
    status: "inactive",
    created_at: "2023-04-05T00:00:00Z"
  }
]

export const mockEsgConfig: EsgConfig = {
  environmental_weight: 40,
  social_weight: 30,
  governance_weight: 30,
  auto_emission_calc: true,
  evidence_required: true,
  badge_auto_award: false,
  notification_channels: ["email"]
}

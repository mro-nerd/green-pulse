# AGENTS.md — Green-Pulse Frontend

This file governs any agent working in this repo. Read it fully before touching code.

> **Cross-team contract:** A separate backend team is building the FastAPI backend using the same `../docs/Build_Spec.md` and `../docs/build_order.md` as their source of truth. Every type, mock shape, API call signature, and auth pattern in this frontend MUST align with those documents so that wiring frontend → backend is a configuration change, not a rewrite. If something here contradicts `../docs/Build_Spec.md` or `../docs/build_order.md`, those documents win.

---

## What this project is

Green-Pulse is an enterprise ESG management platform. The frontend is Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui. Design reference lives in `DESIGN.md` — it defines the full color system, typography scale, spacing, and component rules. Every screen must be built against those tokens, not invented values. If a mockup screenshot and DESIGN.md ever disagree on a hex value or spacing number, DESIGN.md wins — the screenshots are layout/content references, the doc is the source of truth for values.

Screens to build (from Stitch mockups, uploaded as PNGs when this agent is triggered):

1. Dashboard — KPI tiles, AI insight banner, emissions trend chart, dept ranking, recent activity, quick actions
2. Environmental — sub-tabs: Emission Factors, Product ESG Profiles, Carbon Transactions, Environmental Goals
3. Social — sub-tabs: CSR Activities, Employee Participation, Diversity Dashboard
4. Governance — sub-tabs: Policies, Policy Acknowledgements, Audits, Compliance Issues
5. Gamification — sub-tabs: Challenges, Challenge Participation, Badges, Rewards, Leaderboard
6. Reports — report cards, NL search bar, Custom Report Builder
7. Settings — sub-tabs: Departments, Categories, ESG Configuration, Notification Settings, User & Role Management

## When triggered with mockup PNGs

1. Identify which screen(s) the uploaded image(s) correspond to from the list above.
2. Check `/components` for anything that already covers what you're about to build (see Component Reuse below) before writing anything new.
3. Build the screen as a route under `/app/(dashboard)/<module>/page.tsx`, composed from shared components.
4. Match the mockup's layout, spacing, and hierarchy — but pull actual values (colors, radii, type scale) from `DESIGN.md`, never eyeball them from the PNG.
5. Wire it with placeholder/mock data typed against the real shape it'll eventually receive from the API (see Data & Backend Integration section) — don't hardcode strings into JSX where a prop would do.
6. Update `/components/README.md` (one line per component: name + what it's for) so the other dev and future agent runs know what exists without re-reading every file.

## Component reuse — this is the most important rule

Before creating any component, grep `/components` for something close. Reuse patterns:

- One `<KpiCard>` powers all 4 Dashboard tiles AND can be reused anywhere else a big-number-plus-label pattern shows up. Don't build `<EnvironmentalScoreCard>`, `<SocialScoreCard>`, etc. as separate files.
- One `<DataTable>` (columns + rows + optional row actions prop) powers Environmental Goals, Audits, Compliance Issues, Employee Participation, Departments, Leaderboard. These all look different in content but identical in structure — same component, different column config.
- One `<StatusPill>` handles every colored status chip across every screen (Active/Completed/Pending/Overdue/etc). Pass a status string + it maps to the right color via a single lookup table, not per-screen conditionals.
- One `<SubTabs>` component handles every screen's second-level tab row (Environmental's 4 tabs, Governance's 4 tabs, Gamification's 5 tabs, Settings' 5 tabs). Same component, different tab list prop.
- One `<CardGrid>` + `<ActionCard>` pattern covers Challenges, CSR Activities, and Rewards Catalog — icon, title, meta row, button.
- Sidebar and top nav are each ONE component shared across all 7 screens. Never duplicate nav markup per page.
- **Navigation lives ONLY in the sidebar.** The `<TopNav>` component is a utility bar (notification bell, user avatar, search — NOT module links). Do NOT add horizontal module navigation links to the top bar. There must be exactly one way to navigate between modules: the sidebar. Duplicating nav links creates a cluttered, redundant UI.

If you're about to write JSX that looks like something you already built for a different screen, stop and extract/reuse instead of copy-pasting with minor tweaks. Two similar-but-not-identical components is a smell — parameterize one instead.

## Code style — this should not read as AI-generated

- No placeholder comments like `// TODO: implement this later` or `// This component renders the dashboard`. If a comment doesn't explain a non-obvious decision, delete it.
- No defensive over-engineering for cases that can't happen (don't null-check props that TypeScript already guarantees exist).
- No inflated file headers, no "Author:" blocks, no restating the filename in a comment at the top of the file.
- Name things the way a human on this team would — `DeptRankingChart`, not `DepartmentEsgRankingVisualizationComponent`.
- Don't wrap every component in unnecessary abstraction layers (no `withDashboardLayout(withTheme(withAuth(Component)))` stacking) — one clear layout wrapper per route group is enough.
- Keep components focused — if a file is doing data-fetching, transformation, AND rendering, split it, but don't split so finely that a one-line change touches five files.
- Match the existing formatting already in the repo (whatever Prettier config is checked in) — don't reformat files you're not otherwise editing.
- Skip boilerplate scaffolding that isn't earning its keep — no unused Storybook stories, no test files for components with zero logic, no generated API client code for endpoints that don't exist yet.

## Design consistency — read DESIGN.md before writing any UI code

Every screen must look like it belongs to the same application. This means:

- **All colors, spacing, radii, typography, and shadows come from `DESIGN.md` tokens.** Never eyeball a value from a PNG or invent a hex code. If a token doesn't exist for what you need, flag it — don't make one up.
- **Card style is uniform everywhere:** white background, 1px `#E2E8F0` border, `1rem` radius, `0 1px 3px rgba(0,0,0,0.04)` shadow. No variations unless DESIGN.md explicitly defines one.
- **Typography scale is fixed:** Use `stat-md` for KPI numbers, `headline-sm` for section headers, `body-md` for content, `label-caps` for metadata labels, `table-data` for table cells. Do not mix arbitrary `text-*` sizes.
- **Pillar colors are semantic:** Green (`#0D631B`) = Environmental, Blue (`#005DB7`) = Social, Purple (`#7A2FAA`) = Governance, Orange (`#E65100`) = Gamification. Use these consistently across every screen — a governance-related element should always use the purple palette, never green or blue. Gamification elements (XP, badges, challenges, rewards, leaderboard) always use the orange palette.
- **If you're unsure whether something matches the design system, check DESIGN.md first.** The goal is that any two screens placed side by side look like they were designed and built by the same team in the same session.

---

## Backend Integration Architecture

> This section is the contract between frontend and backend teams. The backend team builds FastAPI endpoints, Pydantic schemas, and SQLAlchemy models against `../docs/Build_Spec.md`. The frontend must mirror those shapes exactly so wiring is trivial.

### API Client — `/lib/api.ts`

All HTTP calls go through a single Axios (or fetch wrapper) instance configured in `/lib/api.ts`. This is the ONLY file that knows the backend URL.

```
Structure:
- Base URL: read from NEXT_PUBLIC_API_URL env var (defaults to http://localhost:8000 in dev)
- Request interceptor: attaches the access token (JWT) from in-memory store to every request as Authorization: Bearer <token>
- Response interceptor: on 401, attempt silent refresh via POST /auth/refresh (httpOnly cookie carries refresh token), retry original request once. On second 401, redirect to /login.
- Error normalization: every API error is caught and transformed to { code: string, message: string, details?: any } — this matches the backend's standard error envelope.
```

Never call `fetch()` or `axios` directly from a component. Always go through the API client so auth and error handling happen in one place.

### TypeScript Types — `/lib/types.ts`

This file contains TypeScript types that mirror the backend's Pydantic response schemas **field-for-field**. The field names use `snake_case` to match the JSON the backend sends — do NOT convert to camelCase in type definitions. If a component needs camelCase props for readability, map in the component, not in the types.

The backend team's Pydantic schemas are derived from the database tables in `../docs/Build_Spec.md` Section 4. Every type defined in `/lib/types.ts` must trace back to one of those tables.

**Required types (grouped by module, must match backend schemas):**

#### Auth & Users
```typescript
type User = {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'dept_head' | 'employee' | 'auditor'
  department_id: string | null
  xp: number
  points: number
}
type LoginRequest = { email: string; password: string }
type LoginResponse = { access_token: string; token_type: 'bearer' }
type AuthError = { code: string; message: string; details?: any }
```

#### Environmental
```typescript
type EmissionFactor = {
  id: string; activity_type: string; unit: string; co2_per_unit: number;
  source: string; effective_date: string
}
type ProductEsgProfile = {
  id: string; product_name: string; sku: string;
  carbon_footprint: number; recyclable_pct: number; notes: string
}
type CarbonTransaction = {
  id: string; department_id: string;
  source_type: 'purchase' | 'manufacturing' | 'expense' | 'fleet';
  source_record_id: string | null; emission_factor_id: string;
  quantity: number; co2_calculated: number;
  auto_generated: boolean; created_at: string
}
type EnvironmentalGoal = {
  id: string; department_id: string; name: string;
  target_co2: number; current_co2: number; progress_pct: number;
  deadline: string; status: 'active' | 'on_track' | 'at_risk' | 'completed'
}
```

#### Social
```typescript
type CsrActivity = {
  id: string; title: string; category_id: string; description: string;
  department_id: string; evidence_required: boolean;
  status: string; created_at: string
}
type EmployeeParticipation = {
  id: string; employee_id: string; csr_activity_id: string;
  proof_url: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  points_earned: number; completion_date: string | null
}
```

#### Governance
```typescript
type Policy = {
  id: string; title: string; body: string; category: string;
  version: string; effective_date: string; status: string
}
type PolicyAcknowledgement = {
  id: string; employee_id: string; policy_id: string; acknowledged_at: string
}
type Audit = {
  id: string; title: string; department_id: string; auditor_id: string;
  audit_date: string; findings_summary: string | null;
  status: 'scheduled' | 'under_review' | 'completed'
}
type ComplianceIssue = {
  id: string; audit_id: string;
  severity: 'low' | 'medium' | 'high';
  description: string; owner_id: string;
  due_date: string; status: 'open' | 'resolved'; overdue: boolean
}
```

#### Gamification
```typescript
type Challenge = {
  id: string; title: string; category_id: string; description: string;
  xp: number; difficulty: 'easy' | 'medium' | 'hard';
  evidence_required: boolean; deadline: string;
  status: 'draft' | 'active' | 'under_review' | 'completed' | 'archived'
}
type ChallengeParticipation = {
  id: string; challenge_id: string; employee_id: string;
  progress_pct: number; proof_url: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  xp_awarded: number
}
type Badge = {
  id: string; name: string; description: string;
  icon_url: string; unlock_rule: Record<string, any>
}
type UserBadge = {
  badge: Badge; unlocked: boolean; unlocked_at: string | null
}
type Reward = {
  id: string; name: string; description: string;
  points_required: number; stock: number; status: string
}
type LeaderboardEntry = {
  rank: number; user_id: string; name: string;
  department: string; xp: number
}
```

#### Dashboard & Scoring
```typescript
type DepartmentScore = {
  id: string; department_id: string;
  environmental_score: number; social_score: number;
  governance_score: number; total_score: number;
  period_start: string; period_end: string
}
type DashboardSummary = {
  overall_esg_score: number;
  environmental_score: number; social_score: number; governance_score: number;
  trend: Array<{ period: string; score: number }>
  dept_rankings: Array<{ department_id: string; department_name: string; total_score: number }>
}
type RecentActivityItem = {
  id: string; type: string; payload: Record<string, any>;
  read: boolean; created_at: string
}
```

#### Reports
```typescript
type CustomReportRequest = {
  date_range: { start: string; end: string }
  department_ids: string[]
  module: string
  employee_id?: string
  challenge_id?: string
  esg_category?: string
}
type ReportExportRequest = {
  format: 'pdf' | 'excel' | 'csv'
  report_id?: string
  filters: CustomReportRequest
}
type NlQueryRequest = { prompt: string }
type NlQueryResponse = {
  data: any[]
  resolved_filters: CustomReportRequest
  columns: Array<{ key: string; label: string }>
}
```

#### Settings
```typescript
type Department = {
  id: string; name: string; code: string;
  head_user_id: string | null; parent_department_id: string | null;
  employee_count: number; status: string; created_at: string
}
type Category = {
  id: string; name: string;
  type: 'csr_activity' | 'challenge'; status: string
}
type EsgConfig = {
  environmental_weight: number; social_weight: number; governance_weight: number;
  auto_emission_calc: boolean; evidence_required: boolean;
  badge_auto_award: boolean; notification_channels: string[]
}
type Notification = {
  id: string; user_id: string; type: string;
  payload: Record<string, any>; read: boolean; created_at: string
}
```

### Mock Data — `/lib/mock-data/<module>.ts`

Each mock file exports data shaped **exactly** as the API will return it. Rules:

1. **Import types from `/lib/types.ts`** — every mock array must be typed as `Type[]`, not ad-hoc inline shapes.
2. **Use `snake_case` field names** matching the backend JSON, not camelCase.
3. **Use realistic IDs** (UUIDs like `"550e8400-e29b-41d4-a716-446655440001"`) — not `"1"`, `"2"`, `"3"`.
4. **Include all fields the backend will send**, even if the UI currently doesn't display them — this prevents type mismatches when new UI features reference them.
5. **Use ISO 8601 date strings** (`"2026-01-15T09:30:00Z"`) for all date fields — the backend sends these, not `"Jan 15"` or `"2 hours ago"` (format those in the component layer).
6. **Enum values must exactly match** the backend's Python enum strings (e.g., `'pending' | 'approved' | 'rejected'`, not `'Pending'` or `'PENDING'`).

### API Service Layer — `/lib/services/<module>.ts`

Each module gets a thin service file that wraps API client calls. During mock phase, these return mock data. When the backend is live, swap the implementation — the component layer doesn't change.

```
Pattern:
// /lib/services/gamification.ts
import { api } from '@/lib/api'
import type { Challenge, ChallengeParticipation, Badge, Reward, LeaderboardEntry } from '@/lib/types'

// Mock phase — returns mock data
// Live phase — uncomment the api.get() calls

export async function getChallenges(): Promise<Challenge[]> { ... }
export async function joinChallenge(challengeId: string): Promise<void> { ... }
export async function getLeaderboard(scope: 'global' | 'dept'): Promise<LeaderboardEntry[]> { ... }
export async function redeemReward(rewardId: string): Promise<void> { ... }
```

Components call these service functions, never raw API endpoints. This is the seam where mock → real happens.

### Endpoint-to-Route Mapping (Backend ↔ Frontend contract)

Every frontend route maps to specific backend endpoints. Use this table as the wiring reference:

| Frontend Route | Backend Endpoints | Sprint |
|---|---|---|
| `/login` | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` | S1 |
| `/dashboard` | `GET /dashboard/summary`, `GET /dashboard/recent-activity`, `POST /scores/recalculate` | S6 |
| `/environmental` | `GET/POST /emission-factors`, `GET/POST /carbon-transactions`, `POST /carbon-transactions/bulk-import`, `GET/POST /environmental-goals`, `GET/POST /product-esg-profiles` | S2 |
| `/social` | `GET/POST /csr-activities`, `POST /csr-activities/{id}/join`, `POST /csr-activities/{id}/submit-proof`, `GET /csr-activities/{id}/participations`, `POST /participations/{id}/approve`, `GET /social/diversity` | S3 |
| `/governance` | `GET/POST /policies`, `POST /policies/{id}/acknowledge`, `GET /acknowledgements`, `GET/POST /audits`, `POST /audits/{id}/ai-summarize`, `GET/POST /compliance-issues` | S4 |
| `/gamification` | `GET/POST /challenges`, `POST /challenges/{id}/join`, `POST /challenge-participations/{id}/update-progress`, `POST /challenge-participations/{id}/submit-proof`, `POST /challenge-participations/{id}/approve`, `GET/POST /badges`, `GET /badges/mine`, `GET /rewards`, `POST /rewards/{id}/redeem`, `GET /leaderboard?scope=global\|dept` | S5 |
| `/reports` | `GET /reports/environmental\|social\|governance\|summary`, `POST /reports/custom`, `POST /reports/export`, `POST /reports/nl-query` | S7 |
| `/settings` | `GET/POST /departments`, `GET/POST /categories`, `GET/PUT /settings/esg-config`, `GET/PUT /settings/notifications`, `GET/POST /users`, `PUT /users/{id}` | S1 + S8 |

---

## Auth & RBAC — Frontend Patterns

The backend implements JWT auth with role-based access control. The frontend must match these patterns exactly:

### Auth Flow
1. **Login:** `POST /auth/login` returns `{ access_token, token_type }`. Store access token **in memory only** (React state/context), never localStorage. The refresh token is set as an `httpOnly` cookie by the backend automatically.
2. **Token refresh:** On 401, the API client calls `POST /auth/refresh` (cookie sent automatically). If refresh fails, redirect to `/login` and clear auth state.
3. **User context:** After login, call `GET /auth/me` to populate `AuthContext` with `{ id, name, email, role, department_id, xp, points }`.
4. **Logout:** `POST /auth/logout` (invalidates refresh token server-side), then clear in-memory access token and redirect.

### Auth Context & Hook — `/hooks/use-auth.ts`
```
Provides:
- user: User | null
- isLoading: boolean
- login(email, password): Promise<void>
- logout(): Promise<void>
- hasRole(...roles: User['role'][]): boolean
- isOwnDepartment(deptId: string): boolean
```

### Route Protection — `<RouteGuard>`
Wrap protected route groups in a `<RouteGuard>` that reads from `AuthContext`:
- Redirects unauthenticated users to `/login`
- Accepts `allowedRoles` prop — renders children only if `user.role` is in the list
- Shows a 403 fallback (not a redirect) if the user is authenticated but lacks the required role

### Role-Based UI Rendering
The backend enforces 4 roles. The frontend must conditionally render UI elements:

| Role | Dashboard | Environmental | Social | Governance | Gamification | Reports | Settings |
|---|---|---|---|---|---|---|---|
| `super_admin` | Full org-wide | Full CRUD | Full CRUD + approval queue | Full CRUD + AI summarize | Full CRUD + approval queue | All reports, all dept filters | Full access to all tabs |
| `dept_head` | Own dept view | CRUD scoped to own dept | CRUD scoped + approval for own dept | View own dept audits, manage own dept issues | CRUD scoped + approval for own dept | Reports scoped to own dept | View own dept, manage own dept users |
| `employee` | Personal dashboard (XP, badges, pending) | Read-only | Join CSR activities, submit proof | Read policies, acknowledge only | Join challenges, submit progress/proof, view own badges | Read-only, own dept | View own profile only |
| `auditor` | Read-only | Read-only | Read-only | Full CRUD on Audits + Compliance Issues | Read-only | Governance reports only | None |

Use the `hasRole()` helper from `useAuth()` to conditionally render:
- CRUD buttons (New, Edit, Delete) — only for roles with write access
- Approval actions (Approve/Reject buttons) — only for `super_admin` and `dept_head`
- Admin-only sections (Settings, ESG Config) — only for `super_admin`

Do NOT hide entire navigation items based on role — all users see all sidebar links, but the page content adapts. The backend enforces permissions; the frontend provides UX guidance.

---

## Pagination, Filtering & Sorting Convention

All list endpoints support the same query parameter pattern. Build UI components to emit these params:

```
GET /endpoint?page=1&per_page=20&sort_by=created_at&sort_order=desc&search=keyword

Filters are module-specific query params:
  - department_id=<uuid>
  - status=active
  - severity=high
  - date_from=2026-01-01&date_to=2026-06-30
```

The `<DataTable>` component should accept an `onParamsChange(params)` callback that the parent page uses to update the URL query string and re-fetch data. This keeps filtering/sorting logic consistent and URL-shareable.

### Standard API Response Envelope

All paginated list responses from the backend follow this shape:

```typescript
type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}
```

Build `<DataTable>` and any list component to expect this shape, not raw arrays.

### Standard Error Envelope

All API errors follow:

```typescript
type ApiError = {
  code: string      // e.g., "VALIDATION_ERROR", "NOT_FOUND", "FORBIDDEN"
  message: string   // human-readable message
  details?: any     // optional field-level validation errors
}
```

Use this in toast/error-boundary rendering. Do NOT invent frontend-only error shapes.

---

## File Uploads (S3 Presigned URL Pattern)

The backend uses S3-compatible storage (MinIO in Docker). File uploads follow a presigned URL pattern:

1. Frontend calls backend to get a presigned upload URL: e.g., `POST /csr-activities/{id}/submit-proof` or `POST /challenge-participations/{id}/submit-proof`
2. Backend returns `{ upload_url: string, file_key: string }`
3. Frontend uploads the file directly to the presigned URL via `PUT` with the file body
4. Frontend confirms upload by sending `file_key` back to the backend

Build a reusable `<FileUpload>` component that handles this flow. It should show upload progress and handle errors.

---

## WebSocket / Real-time Notifications

The backend exposes `WS /ws/notifications?token=<jwt>` for real-time push. Build:

1. **`/hooks/use-notifications.ts`** — connects to WS on auth, reconnects on disconnect, appends messages to a notification store
2. **Notification bell** in `<TopNav>` — shows unread count badge, dropdown with last 5 items, "Mark all read" action
3. **Toast system** — use shadcn/ui `<Sonner>` to show toasts on incoming WS messages (badge unlocks, approval decisions)
4. **Fallback** — if WS is unavailable, poll `GET /notifications?page=1&per_page=5` every 30 seconds

---

## Module-Specific Build Notes

### Gamification (matches uploaded mockup PNG)

The Gamification screen has 5 sub-tabs: **Challenges, Challenge Participation, Badges, Rewards, Leaderboard**.

- **Challenges tab:** Use `<CardGrid>` + `<ActionCard>` for challenge cards. Each card shows: icon (use the orange gamification color), difficulty chip (`<StatusPill>` with `easy`=green, `medium`=orange, `hard`=red), title, description, XP reward with orange coin icon, deadline, and primary action button (Join Challenge / In Progress with percentage / Completed). The `status` field from the backend drives which button state renders.
- **Challenge Participation tab:** `<DataTable>` showing all participations for a challenge (admin/manager view). Columns: employee name, progress %, proof link, approval status (`<StatusPill>`), XP awarded. Include Approve/Reject action buttons (role-gated to `super_admin` and `dept_head`).
- **Badges tab:** Grid layout with `<BadgeCard>` — circular icon container, badge name below. Locked badges use grayscale CSS filter + lock icon overlay. Unlocked badges show full color. Tooltip on hover shows the `unlock_rule` description.
- **Rewards tab:** `<CardGrid>` + `<ActionCard>` for reward catalog. Each card shows: icon, name, description, XP cost (with orange coin icon), stock indicator ("12 in stock" / "Unlimited"), and Redeem button. If `user.points < points_required`, show disabled "Insufficient XP" button instead. Redeem triggers a confirmation dialog before calling `POST /rewards/{id}/redeem`.
- **Leaderboard tab:** `<DataTable>` with columns: Rank (top 3 get gold/silver/bronze trophy icons), Name, Department, Total XP. Include a Global/Department scope toggle that changes the `?scope=` query param. Department scope auto-filters to the user's own department for non-admin roles.

### Dashboard

- The 4 KPI tiles map to `DashboardSummary.environmental_score`, `.social_score`, `.governance_score`, `.overall_esg_score`
- Emissions Trend chart uses `DashboardSummary.trend` array
- Department Ranking bar chart uses `DashboardSummary.dept_rankings` array
- Recent Activity feed uses `GET /dashboard/recent-activity` — maps to `Notification` type
- Role-gated views: Admin = org-wide, Dept Manager = own dept, Employee = personal (XP, badges, pending items)

### Environmental

- Carbon Transactions table includes a "bulk import" button that triggers CSV upload → `POST /carbon-transactions/bulk-import` (background Celery task on backend). Show an upload progress indicator and a "processing" state while the task runs.
- `co2_calculated` is auto-computed by backend when `auto_emission_calc` is enabled in ESG config. The frontend should show this as a read-only computed field, not an editable input.
- Anomaly-flagged transactions should show a warning badge in the table row.

### Social

- The Employee Participation approval queue is scoped: `dept_head` sees only their department's submissions, `super_admin` sees all.
- Proof uploads use the S3 presigned URL pattern (see File Uploads section).
- Diversity Dashboard uses Recharts: donut chart (gender ratio), bar chart (age bands), stacked bar (seniority breakdown).

### Governance

- "AI Summarize" button on completed audits calls `POST /audits/{id}/ai-summarize` — show a loading skeleton, then render the AI-generated summary in a slide-over panel. The response includes suggested compliance issues with severity.
- Compliance Issues table must enforce mandatory Severity + Owner + Due Date in the New Issue form validation (backend also enforces).
- Overdue flag is auto-set by backend (nightly Celery job) — frontend just reads the `overdue: boolean` field and renders a red flag icon.

### Reports

- NL Report Builder: text box above the filter row. User types a natural language query → `POST /reports/nl-query` → backend returns data + resolved filters → auto-populate the filter row + render the preview table.
- Export flow: user clicks Export PDF/Excel/CSV → `POST /reports/export` → backend returns a presigned S3 download URL → browser downloads the file.
- `dept_head` role: department filter is pre-set and locked to their own department(s).

### Settings

- **Departments tab:** Tree view for hierarchy (uses `parent_department_id`). Add/Edit/Delete modal.
- **Categories tab:** Simple CRUD table.
- **ESG Configuration tab:** Weight sliders for E/S/G that must sum to 100 (live validation). 4 toggle switches: auto emission calc, evidence required, badge auto-award, notification channels.
- **Notification Settings tab:** Toggle grid — event type × channel (in-app / email / Slack) per role scope.
- **User & Role Management tab:** Table with role dropdown, department assignment, CSV bulk import with column mapping preview.

---

## Data

Backend isn't live yet for most modules. Use typed mock data (`/lib/mock-data/<module>.ts`) shaped exactly like the eventual API response so swapping in real fetches later is a one-line change, not a rewrite. Don't invent a different shape "for now."

Mock data must follow the rules in the "Mock Data" section above: imported types from `/lib/types.ts`, `snake_case` fields, UUID-style IDs, ISO 8601 dates, exact enum strings.

---

## Dev server — do NOT run it

You do **not** have permission to start the dev server. Never run `npm run dev`, `npm start`, `npx next dev`, or any command that starts the application. The user will run the dev server themselves. You may run `npx tsc --noEmit` for type-checking only.

## Version control — read this carefully

You do **not** have permission to run any git command that changes repo or remote state on your own. This means:

- Never run `git add`, `git commit`, `git push`, `git pull`, `git fetch`, `git merge`, `git rebase`, `git checkout -b`, `git stash`, or anything that mutates local or remote state — even if it seems like the obviously helpful next step.
- You MAY run read-only checks: `git status`, `git log`, `git diff` — to see what's changed locally.
- If you need to know whether the other developer has pushed new work, ask the user to run `git fetch` themselves (or tell them you'd like them to), then check `git log origin/<branch> --oneline` yourself only after they confirm they've fetched. Do not fetch or pull on your own initiative.
- If you detect the local branch is behind or diverged from remote, stop and tell the person directly — do not attempt to resolve it (no auto-merge, no auto-rebase, no force push, ever).
- If your work would conflict with files the other dev is likely also touching (e.g. shared `/components` files), flag it before proceeding instead of just editing.

## Working alongside another dev on the same repo

- Before building a screen, check if a component you need already exists — the other dev may have built it first. Reuse, don't duplicate.
- Keep each screen's route-specific code inside its own folder; only touch `/components` (shared) when you're intentionally adding or improving something meant to be shared.
- If you change a shared component's props in a way that could break another screen, check where else it's used first and update those call sites in the same pass — don't leave it broken for someone else to discover.

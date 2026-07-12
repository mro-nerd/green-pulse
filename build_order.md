# EcoSphere — Build Order & Parallel Execution Plan
**Stack:** Next.js 14 (App Router + TypeScript + Tailwind + shadcn/ui) · FastAPI (Python) · PostgreSQL · Redis · Celery · S3-compatible storage

> **Legend**
> - 🔴 **Blocking** — must finish before anything that depends on it starts
> - 🟡 **Can start in parallel** — only partially depends on the other track
> - 🟢 **Fully parallel** — zero dependency on the other track right now
> - `[BE]` Backend task · `[FE]` Frontend task · `[BOTH]` requires coordination

---

## Sprint 0 — Project Scaffolding & Contracts (Day 1, ~4 hrs)
> **Goal:** Both tracks can work independently after this sprint. This is the only true serial blocker.

### Must be done together (full team, ~2–3 hrs)
- [ ] `[BOTH]` 🔴 Define & freeze **OpenAPI contract** for all modules (Swagger YAML/JSON). Write stubs — even empty `200 OK` responses. This is the "API as interface" that lets FE mock and BE implement simultaneously.
- [ ] `[BOTH]` 🔴 Agree on **shared type contracts** (request/response shapes, enum values, error format `{code, message, details}`).
- [ ] `[BOTH]` 🔴 Set up **monorepo structure**:
  - `frontend/` — `npx create-next-app@latest --typescript --tailwind --app`
  - `backend/` — FastAPI with `pyproject.toml` / `uv` or `poetry`
- [ ] `[BOTH]` 🔴 Set up **Docker Compose** with services: `postgres`, `redis`, `backend`, `frontend`, `celery_worker`
- [ ] `[BOTH]` 🔴 Write & run **initial Alembic migration** (all tables from Build_Spec.md in one shot)

### Parallel after contracts are frozen
| Backend | Frontend |
|---|---|
| `[BE]` Configure FastAPI app skeleton (routers, CORS, exception handlers, middleware stubs) | `[FE]` Configure Next.js app skeleton (App Router layout, global CSS/Tailwind tokens, shadcn/ui init) |
| `[BE]` Set up SQLAlchemy models mirroring all DB tables | `[FE]` Set up **MSW (Mock Service Worker)** or a local JSON mock server using the agreed OpenAPI spec |
| `[BE]` Set up Alembic migration workflow | `[FE]` Create shared TypeScript types from the OpenAPI contract (run `openapi-typescript`) |
| `[BE]` Configure pytest + test DB | `[FE]` Configure Jest + React Testing Library |

---

## Sprint 1 — Auth & RBAC Foundation (Day 1–2, ~6 hrs)
> **Goal:** A working login/logout with JWT, role guard middleware, and the Settings shell. Every subsequent sprint depends on this.

### Backend (🔴 Blocking for all protected endpoints)
- [ ] `[BE]` 🔴 `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
  - Argon2/bcrypt password hashing
  - Access token (JWT, 15 min) + refresh token (httpOnly cookie, 7 days, rotated on use)
- [ ] `[BE]` 🔴 RBAC middleware: `require_role(*roles)` + `require_dept_scope(dept_id)` dependency injections
  - Admin → unrestricted
  - Department Manager → all queries auto-scoped to `department_id IN (own + descendants)`
  - Employee → own-record scope only
- [ ] `[BE]` 🔴 `GET /auth/me` — returns `{id, name, email, role, department_id, xp, points}`
- [ ] `[BE]` Settings — **Departments CRUD**: `GET/POST /departments`, `GET/PUT/DELETE /departments/{id}` (hierarchy support via `parent_department_id`)
- [ ] `[BE]` Settings — **User & Role Management CRUD**: `GET/POST /users`, `PUT /users/{id}` (role + department assignment), bulk CSV import endpoint
- [ ] `[BE]` Settings — **Categories CRUD**: `GET/POST /categories`, `GET/PUT/DELETE /categories/{id}`

### Frontend (🟡 Can mock-develop while BE builds)
- [ ] `[FE]` 🟢 Login page UI (`/login`) — email + password form, JWT storage in memory + cookie, redirect on success
- [ ] `[FE]` 🟢 `AuthContext` + `useAuth()` hook — wraps `GET /auth/me`, persists user state
- [ ] `[FE]` 🟢 Role-based `<RouteGuard>` component — reads role from context, redirects unauthorized access
- [ ] `[FE]` 🟢 Main app shell: collapsible sidebar with all 7 module groups (matches mockup nav exactly), top bar with user avatar + notification bell
- [ ] `[FE]` 🟢 Settings page shell (`/settings`) with 5 tabs: Departments · Categories · ESG Configuration · Notification Settings · User & Role Management
- [ ] `[FE]` 🟢 Settings → Departments tab UI (tree view of hierarchy, add/edit/delete modal)
- [ ] `[FE]` 🟢 Settings → User & Role Management tab UI (table + role dropdown + CSV upload button)

> **Sync point:** Wire FE auth to real BE endpoints at end of Sprint 1. All subsequent FE work can use real tokens.

---

## Sprint 2 — Environmental Module (Day 2–3, ~8 hrs)
> Both tracks work **fully in parallel** here. FE uses mock data until BE endpoints land.

### Backend 🟢
- [ ] `[BE]` **Emission Factors CRUD**: `GET/POST /emission-factors`, `PUT/DELETE /emission-factors/{id}`
- [ ] `[BE]` **Product ESG Profiles CRUD**: `GET/POST /product-esg-profiles`, `PUT/DELETE /product-esg-profiles/{id}`
- [ ] `[BE]` **Carbon Transactions**:
  - `GET /carbon-transactions` (filtered by dept, date, source_type)
  - `POST /carbon-transactions` (manual entry)
  - Auto-calc on entry: `co2_calculated = quantity × emission_factor.co2_per_unit` (toggle from ESG config)
  - `POST /carbon-transactions/bulk-import` (CSV upload → background Celery task)
- [ ] `[BE]` **Environmental Goals CRUD**: `GET/POST /environmental-goals`, `PUT/DELETE /environmental-goals/{id}`
  - Include `progress_pct = current_co2 / target_co2 * 100` in response
  - Auto-update `current_co2` via aggregation from `carbon_transactions`
- [ ] `[BE]` 🔴 **Scoring — Environmental Score**: `GET /scores/environmental?dept_id=&period=` (needed for Dashboard Sprint 6)
- [ ] `[BE]` **Anomaly detection** (AI feature #4 bonus): Celery task — z-score vs. 90-day rolling baseline, writes flag to `carbon_transactions`

### Frontend 🟢
- [ ] `[FE]` Environmental page shell (`/environmental`) with 4 sub-tabs: Emission Factors · Product ESG Profiles · Carbon Transactions · Goals
- [ ] `[FE]` **Emission Factors tab**: filterable table + New/Edit/Delete modal (activity_type, unit, CO₂/unit, source, effective_date)
- [ ] `[FE]` **Product ESG Profiles tab**: card grid or table + CRUD modal
- [ ] `[FE]` **Carbon Transactions tab**: table with filters (dept, date range, source_type) + manual entry form + bulk CSV upload with progress indicator + anomaly flag badge
- [ ] `[FE]` **Environmental Goals tab**: goal cards with progress bar (matches mockup) + CRUD modal, "at risk" / "on track" status chip
- [ ] `[FE]` Wire all 4 tabs to real BE endpoints (swap MSW mocks)

---

## Sprint 3 — Social Module (Day 3–4, ~7 hrs)
> Fully parallel across tracks.

### Backend 🟢
- [ ] `[BE]` **CSR Activities CRUD**: `GET/POST /csr-activities`, `PUT/DELETE /csr-activities/{id}` (dept-scoped for Dept Manager)
- [ ] `[BE]` **Employee Participation**:
  - `POST /csr-activities/{id}/join` → creates `employee_participation` row with `approval_status=pending`
  - `POST /csr-activities/{id}/submit-proof` → uploads to S3, updates `proof_url`
  - `GET /csr-activities/{id}/participations` (Dept Manager approval queue — dept-scoped)
  - `POST /participations/{id}/approve` + `/reject` (role-checked: Admin or same-dept Manager)
- [ ] `[BE]` **Diversity Dashboard** aggregation endpoint: `GET /social/diversity?dept_id=` (gender ratio, age band counts, seniority breakdown from `users` table — use seeded data)
- [ ] `[BE]` 🔴 **Scoring — Social Score**: `GET /scores/social?dept_id=&period=`
- [ ] `[BE]` S3 integration (presigned URL pattern for proof uploads)

### Frontend 🟢
- [ ] `[FE]` Social page shell (`/social`) with 3 sub-tabs: CSR Activities · Employee Participation · Diversity Dashboard
- [ ] `[FE]` **CSR Activities tab**: activity cards (matches mockup — title, category badge, join button, status) + New Activity modal (Admin/Manager only)
- [ ] `[FE]` **Employee Participation tab**: approval queue table with proof thumbnail, Approve/Reject buttons (conditionally rendered by role) + proof upload modal for Employees
- [ ] `[FE]` **Diversity Dashboard tab**: donut charts (gender), bar chart (age bands), stacked bar (seniority) using Recharts
- [ ] `[FE]` Wire all tabs + presigned URL upload flow

---

## Sprint 4 — Governance Module (Day 4–5, ~7 hrs)
> Fully parallel across tracks.

### Backend 🟢
- [ ] `[BE]` **Policies CRUD**: `GET/POST /policies`, `PUT/DELETE /policies/{id}`, `GET /policies/{id}` (Employee: read-only + acknowledge)
- [ ] `[BE]` **Policy Acknowledgements**: `POST /policies/{id}/acknowledge` → creates `policy_acknowledgements` row; `GET /acknowledgements?dept_id=&policy_id=` (Manager: see own dept completion rate)
- [ ] `[BE]` **Audits CRUD**: `GET/POST /audits`, `PUT/DELETE /audits/{id}` (Admin only F; Manager: V own dept)
- [ ] `[BE]` **Compliance Issues CRUD**: `GET/POST /compliance-issues`, `PUT /compliance-issues/{id}` (enforce mandatory Severity + Owner + Due Date at API level)
  - `GET /compliance-issues?audit_id=&dept_id=&severity=&status=`
  - Auto-set `overdue = (status='open' AND due_date < NOW())` via Celery nightly job
  - Owner update endpoint (Employee assigned as owner can update `status` only)
- [ ] `[BE]` 🔴 **Scoring — Governance Score**: `GET /scores/governance?dept_id=&period=`
- [ ] `[BE]` AI Feature #1: `POST /audits/{id}/ai-summarize` → calls LLM with findings_summary text, returns suggested compliance issues with severity (called after audit status = 'completed')

### Frontend 🟢
- [ ] `[FE]` Governance page shell (`/governance`) with 4 sub-tabs: Policies · Policy Acknowledgements · Audits · Compliance Issues
- [ ] `[FE]` **Policies tab**: table with status chip + New/Edit modal + Acknowledge button (Employee view) — Version and Effective Date columns
- [ ] `[FE]` **Policy Acknowledgements tab**: completion rate progress bar per policy + drill-down table (Manager sees own dept only)
- [ ] `[FE]` **Audits tab**: table (title, dept, date, status) + New Audit modal + AI Summarize button (fires `POST /audits/{id}/ai-summarize`, shows streamed result in a slide-over)
- [ ] `[FE]` **Compliance Issues tab**: table with Severity badge (High=red, Medium=amber, Low=green), Overdue flag, Owner field + New Issue modal (mandatory Severity/Owner/Due Date enforced in form validation)
- [ ] `[FE]` Wire all tabs

---

## Sprint 5 — Gamification Module (Day 5–6, ~8 hrs)
> Note: Build_Spec originally suggested a Go microservice for Gamification. For hackathon speed, implement directly in FastAPI unless you specifically want to show polyglot architecture — document the decision either way.

### Backend 🟢
- [ ] `[BE]` **Challenges CRUD**: `GET/POST /challenges`, `PUT/DELETE /challenges/{id}` (lifecycle: draft → active → under_review → completed → archived)
- [ ] `[BE]` **Challenge Participation**:
  - `POST /challenges/{id}/join` → creates `challenge_participation` row
  - `POST /challenge-participations/{id}/update-progress` (Employee submits progress %)
  - `POST /challenge-participations/{id}/submit-proof` (S3 upload)
  - `GET /challenges/{id}/participations` (approval queue — Manager/Admin)
  - `POST /challenge-participations/{id}/approve` → triggers XP award + badge check
- [ ] `[BE]` **XP Engine**: on approval, credit `xp_awarded` to employee; update Redis sorted sets `leaderboard:global` and `leaderboard:dept:{dept_id}`
- [ ] `[BE]` **Badge Rule Engine**: after every XP event, evaluate each badge's `unlock_rule` JSONB against employee stats; auto-award if threshold met (respects Settings toggle)
- [ ] `[BE]` **Badges CRUD**: `GET/POST /badges`, `PUT/DELETE /badges/{id}` (Admin only F); `GET /badges/mine` (Employee)
- [ ] `[BE]` **Rewards**: `GET /rewards`, `POST /rewards` (Admin), `POST /rewards/{id}/redeem` (atomic: stock > 0 AND points >= required, deduct both)
- [ ] `[BE]` **Leaderboard**: `GET /leaderboard?scope=global|dept` → `ZREVRANGE` from Redis

### Frontend 🟢
- [ ] `[FE]` Gamification page shell (`/gamification`) with 4 sub-tabs: Challenges · Badges · Rewards · Leaderboard
- [ ] `[FE]` **Challenges tab**: challenge cards (title, XP badge, difficulty chip, deadline, status) + Join/Submit Progress buttons + New Challenge modal (Admin/Manager) — matches mockup cards exactly
- [ ] `[FE]` **Badges tab**: badge grid with locked/unlocked state (grayscale filter for locked) + unlock rule tooltip
- [ ] `[FE]` **Rewards tab**: reward catalog cards with points cost + stock indicator + Redeem button (deducted points confirmation dialog)
- [ ] `[FE]` **Leaderboard tab**: ranked table (rank, name, dept, XP) with gold/silver/bronze highlight for top 3 + global/dept toggle
- [ ] `[FE]` Wire all tabs

---

## Sprint 6 — Dashboard & Scoring Engine (Day 6–7, ~6 hrs)
> **Depends on:** Sprints 2–5 scoring endpoints all being live. Build the FE shell early, wire data last.

### Backend 🟡 (depends on Sprint 2–4 scoring endpoints)
- [ ] `[BE]` **Scoring Engine** (nightly Celery job + on-demand endpoint):
  - `POST /scores/recalculate?dept_id=` → runs all three sub-scores, writes snapshot to `department_scores`
  - `GET /dashboard/summary` → returns overall ESG score, E/S/G sub-scores, 12-month trend array, dept ranking array (for bar chart)
- [ ] `[BE]` Department ranking aggregation (avg or employee-count-weighted across child depts)
- [ ] `[BE]` `GET /dashboard/recent-activity` → last 10 notification-worthy events (approval decisions, badge awards, compliance flags) for the "Recent Activity" widget

### Frontend 🟡
- [ ] `[FE]` 🟢 Dashboard page shell (`/dashboard`) — can be built immediately with mocked KPI tile data
- [ ] `[FE]` 🟢 4 KPI tiles (Environmental Score, Social Score, Governance Score, Overall ESG Score) — match mockup card layout with score/100 display + delta vs. last period
- [ ] `[FE]` 🟢 **Emissions Trend chart** (12-month line chart using Recharts) — mock with fake time series, wire to `dashboard/summary.trend` later
- [ ] `[FE]` 🟢 **Department ESG Ranking bar chart** (Recharts horizontal bar, dept names on Y axis)
- [ ] `[FE]` 🟢 **Explainable Scoring** (bonus): clicking a KPI tile opens a drill-down panel showing E/S/G sub-components breakdown
- [ ] `[FE]` 🟢 **Recent Activity feed** (right sidebar) + Quick Action buttons (Log Emission, New Challenge, New Report)
- [ ] `[FE]` Wire all dashboard widgets to `GET /dashboard/summary` and `GET /dashboard/recent-activity`
- [ ] `[FE]` Role-gating: Admin sees org-wide, Dept Manager sees own dept, Employee sees simplified personal dashboard (XP, badges, pending items)

---

## Sprint 7 — Reports Module (Day 7–8, ~5 hrs)
> Fully parallel across tracks.

### Backend 🟢
- [ ] `[BE]` **4 Pre-built Reports**:
  - `GET /reports/environmental` — emissions trend, goal progress, top emitting depts
  - `GET /reports/social` — CSR participation rate, diversity metrics, approval turnaround
  - `GET /reports/governance` — policy ack rate, open compliance issues, audit pass rate
  - `GET /reports/summary` — all three combined with ESG scores (matches "ESG Summary" report card in mockup)
- [ ] `[BE]` **Custom Report Builder**: `POST /reports/custom` — accepts `{date_range, department_ids[], module, employee_id, challenge_id, esg_category}`, returns JSON data + column metadata
- [ ] `[BE]` **Export**: `POST /reports/export` — `{format: 'pdf'|'excel'|'csv', report_id, filters}` → WeasyPrint / openpyxl / pandas, return presigned S3 download URL
- [ ] `[BE]` AI Feature #2: **NL Report Builder** — `POST /reports/nl-query` accepts `{prompt: "show high severity issues in Manufacturing this quarter"}`, LLM maps to filter JSON, calls `/reports/custom` internally, returns data + the resolved filters so user can see/edit them

### Frontend 🟢
- [ ] `[FE]` Reports page shell (`/reports`) — 4 pre-built report cards + Custom Report Builder section below (matches mockup exactly)
- [ ] `[FE]` **Pre-built Report cards**: Generate button per card, opens a modal/panel with rendered chart + table preview + export buttons (PDF · Excel · CSV)
- [ ] `[FE]` **Custom Report Builder UI**: filter row (date range, department multi-select, module select, employee, challenge, ESG category) + NL text box above it (AI feature) + Preview table + Export buttons
- [ ] `[FE]` NL query UX: user types, hits Enter → loading skeleton → resolved filters auto-populate the filter row + preview renders
- [ ] `[FE]` Export flow: clicks "Export PDF" → POST request → polling or presigned URL → browser download trigger
- [ ] `[FE]` Role guard: Dept Manager's department filter is locked to their scope (backend enforces too)

---

## Sprint 8 — Settings Module Completion (Day 8, ~4 hrs)
> Mostly FE-heavy; most BE endpoints were built in Sprint 1.

### Backend 🟡 (mostly done in Sprint 1, only ESG config remains)
- [ ] `[BE]` **ESG Configuration**: `GET/PUT /settings/esg-config` — stores `{environmental_weight, social_weight, governance_weight, auto_emission_calc, evidence_required, badge_auto_award, notification_channels[]}` (the 4 toggles + 3 weights from mockup)
- [ ] `[BE]` **Notification Settings**: `GET/PUT /settings/notifications?scope=org|dept|user` (role-scoped: Admin sets org defaults, Manager sets dept, Employee sets own)

### Frontend 🟡
- [ ] `[FE]` Settings → **ESG Configuration tab**: weight sliders (must sum to 100, show live validation), 4 toggle switches — matches mockup bottom section exactly
- [ ] `[FE]` Settings → **Notification Settings tab**: toggle grid (event type × channel: in-app / email / Slack) per role scope
- [ ] `[FE]` Settings → **User & Role Management tab** (designed Sprint 1, wire here): role dropdown, dept assignment, CSV bulk import UX with column mapping preview
- [ ] `[FE]` Wire all Settings tabs to real BE endpoints

---

## Sprint 9 — Notifications & Real-time (Day 8–9, ~4 hrs)
> Both tracks run in parallel.

### Backend 🟢
- [ ] `[BE]` **WebSocket endpoint**: `WS /ws/notifications?token=` — fan-out via Redis pub/sub → each connected client gets their own channel
- [ ] `[BE]` **Notification event emitters** wired to all trigger points:
  - Compliance issue created/overdue → notify auditor + dept head + owner
  - CSR/Challenge participation approved/rejected → notify the employee
  - Badge unlocked → notify the employee (from XP engine)
  - Policy ack reminder → Celery scheduled job (nightly), pushes to unacknowledged employees
- [ ] `[BE]` `GET /notifications` (paginated, unread first) + `POST /notifications/{id}/read`

### Frontend 🟢
- [ ] `[FE]` WebSocket client hook (`useNotifications`) — connects to WS, appends to notification store
- [ ] `[FE]` Notification bell in top bar: unread count badge, dropdown with last 5 items + "Mark all read"
- [ ] `[FE]` Toast system (shadcn/ui `<Sonner>`) — fires on incoming WS message for badge unlocks and approval decisions
- [ ] `[FE]` Recent Activity feed on Dashboard wired to WS + REST fallback

---

## Sprint 10 — Polish, Seed Data & Demo Prep (Day 9–10, ~6 hrs)

### Backend 🟢
- [ ] `[BE]` Write a **seed script** (`seed.py`): 3 departments, 15–20 employees across all 3 roles, 12 months of carbon transactions (realistic variance for a good trend chart), 5 CSR activities (mix of approved/pending), 3 audits with compliance issues, 4 challenges at different lifecycle stages, 3 rewards in catalog
- [ ] `[BE]` Run Celery scoring job over seeded data so `department_scores` has 12 months of snapshots
- [ ] `[BE]` Add rate limiting (`slowapi`) and proper 403/404/422 error responses everywhere
- [ ] `[BE]` Write OpenAPI description strings so the auto-generated docs are presentable for judges

### Frontend 🟢
- [ ] `[FE]` **Empty states** for every list/table (icon + message + primary CTA button) — no blank white boxes
- [ ] `[FE]` **Loading skeletons** on all data-fetching components (shadcn/ui Skeleton)
- [ ] `[FE]` **Mobile responsiveness** pass: sidebar collapses to hamburger, tables scroll horizontally, cards stack to single column below 768px
- [ ] `[FE]` **Dark mode** toggle (Tailwind `dark:` classes, persisted to localStorage)
- [ ] `[FE]` Accessibility pass: focus rings, aria-labels on icon buttons, keyboard navigation in modals
- [ ] `[FE]` Error boundary + `<ErrorFallback>` component for failed API calls

---

## Parallel Execution Summary

```
Day 1          Day 2          Day 3          Day 4          Day 5          Day 6          Day 7          Day 8          Day 9          Day 10
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ BACKEND  │ S0 Scaffold │ S1 Auth+RBAC │ S2 Environ.  │ S3 Social    │ S4 Govern.   │ S5 Gamif.    │ S6 Scoring   │ S7 Reports   │ S8+S9 Settings+Notif │ S10 Seed+Polish │
├──────────┼─────────────┼─────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────────┼─────────────────┤
│ FRONTEND │ S0 Scaffold │ S1 AuthShell │ S2 Environ.  │ S3 Social    │ S4 Govern.   │ S5 Gamif.    │ S6 Dashboard │ S7 Reports   │ S8+S9 Settings+Notif │ S10 Polish+a11y │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
   ←Serial→ ←──────────────────────────── Parallel (FE mocks while BE builds) ────────────────────────────────────────────────────────→
```

> **Rule of thumb:** FE should always be 0.5–1 sprint ahead of BE using MSW mocks, then wire once BE lands. This prevents FE from sitting idle.

---

## Dependency Graph (Critical Path)

```
S0 Scaffold
    └── S1 Auth & RBAC  ← 🔴 All protected routes depend on this
            ├── S2 Environmental  (BE score endpoint → needed by S6)
            ├── S3 Social         (BE score endpoint → needed by S6)
            ├── S4 Governance     (BE score endpoint → needed by S6)
            │       └── AI Feature #1 (audit summarize)
            ├── S5 Gamification   (XP engine, Redis leaderboard)
            ├── S6 Dashboard Scoring Engine  ← aggregates S2 + S3 + S4 + S5
            │       └── S7 Reports (needs real data in DB)
            │               └── AI Feature #2 (NL report builder)
            ├── S8 Settings completion
            └── S9 Notifications  (wires into S2–S5 event triggers)
                    └── S10 Polish & Seed
```

---

## Recommended Folder Structure

```
green-pulse/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── environmental.py   # emission_factors, carbon_txns, goals
│   │   │   ├── social.py          # csr_activities, participations, diversity
│   │   │   ├── governance.py      # policies, acks, audits, compliance_issues
│   │   │   ├── gamification.py    # challenges, badges, rewards, leaderboard
│   │   │   ├── dashboard.py       # summary, scoring, recent_activity
│   │   │   ├── reports.py         # pre-built + custom + export + NL query
│   │   │   ├── settings.py        # depts, categories, esg_config, notif, users
│   │   │   └── notifications.py   # WS endpoint, REST list/read
│   │   ├── core/
│   │   │   ├── auth.py            # JWT encode/decode, RBAC deps
│   │   │   ├── config.py          # env vars, settings
│   │   │   └── database.py        # SQLAlchemy engine, session
│   │   ├── models/                # SQLAlchemy ORM models (1 file per domain)
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── services/              # business logic (scoring engine, XP, badge)
│   │   ├── tasks/                 # Celery tasks (overdue flagging, scoring job)
│   │   └── ai/                    # LLM wrappers (audit summarize, NL report)
│   ├── migrations/                # Alembic
│   ├── tests/
│   └── seed.py
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── environmental/
│   │   │   ├── social/
│   │   │   ├── governance/
│   │   │   ├── gamification/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── layout.tsx             # AuthProvider + sidebar shell
│   ├── components/
│   │   ├── ui/                    # shadcn/ui base components
│   │   ├── charts/                # Recharts wrappers
│   │   ├── layout/                # Sidebar, Topbar, RouteGuard
│   │   └── shared/                # DataTable, Modal, EmptyState, Skeleton
│   ├── hooks/                     # useAuth, useNotifications, usePermissions
│   ├── lib/
│   │   ├── api.ts                 # Axios instance with JWT interceptor
│   │   ├── types.ts               # openapi-typescript generated types
│   │   └── permissions.ts         # client-side permission helpers (mirrors BE RBAC)
│   └── mocks/                     # MSW handlers (removed once BE is live)
│
└── docker-compose.yml
```

---

## AI Features — Build Triggers

| AI Feature | When to Build | Sprint | BE Endpoint | FE Integration |
|---|---|---|---|---|
| **#1 Audit Auto-Summarize** | After Governance module is live | S4 | `POST /audits/{id}/ai-summarize` | "AI Summarize" button in Audit detail → slide-over panel |
| **#2 NL Report Builder** | After Reports module is live | S7 | `POST /reports/nl-query` | Text box above Custom Report Builder filter row |

Both features use the same LLM client wrapper (`app/ai/client.py`). Build the wrapper in S4 and reuse it for S7.

---

## Key Decisions to Lock Before Coding

| Decision | Options | Recommendation |
|---|---|---|
| Go Gamification service vs. FastAPI-only | Go (polyglot story) vs. FastAPI (speed) | **FastAPI-only for hackathon** unless you have 3+ devs. Document the Go option in architecture slides. |
| MSW vs. JSON Server for FE mocking | MSW (in-process) vs. JSON Server (separate process) | **MSW** — no extra process, lives in tests too |
| S3 provider | Cloudflare R2 (free tier) vs. MinIO (self-hosted in Docker) | **MinIO in Docker Compose** for offline demo safety |
| Auth token storage | httpOnly cookie vs. memory + cookie hybrid | **httpOnly cookie for refresh + memory for access token** |
| LLM provider | OpenAI GPT-4o vs. Anthropic Claude Sonnet | Either works; pick based on available API key. Abstract behind `app/ai/client.py` |

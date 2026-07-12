# Green-Pulse — Full Build Specification

Based on the 7-screen mockup: Dashboard, Environmental, Social, Governance, Gamification, Reports, Settings.

---

## 1. Tech Stack (full build, no time constraint)

| Layer | Choice | Reasoning |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui | Matches mockup's tabbed, card-heavy layout well; you already know this stack (Workbench) |
| Charts | Recharts (trend lines, bar rankings) + Tremor for KPI tiles | Matches Dashboard tile + Emissions Trend + Dept Ranking bar chart directly |
| Core Backend | **FastAPI (Python)** | Owns: Environmental, Social, Governance, Reports, Settings, AI features, orchestration |
| Secondary Service | **Go + GoFiber** | Owns: Gamification engine (XP/badges/leaderboard) + Carbon Transaction ingestion — both are high-throughput, latency-sensitive paths where Go's concurrency model pays off, and it's a good "polyglot" story for interviews |
| Inter-service comm | REST internally, or NATS/simple HTTP calls (skip gRPC unless you want the complexity) | FastAPI calls Go service for XP/leaderboard writes and carbon transaction bulk inserts |
| Database | PostgreSQL (single instance, shared by both services — no schema duplication) | Relational fits Master/Transactional model in the doc exactly |
| Cache / Leaderboard store | Redis (sorted sets for Leaderboard, dept rankings; pub/sub for notification fanout) | Go service owns Redis interactions for gamification |
| Auth | **Custom JWT auth** — see Section 3 | RBAC maps directly to Departments/roles in the doc |
| File storage | S3-compatible (Cloudflare R2 / MinIO if self-hosting) | CSR proof uploads, badge icons, audit attachments |
| Background jobs | Celery + Redis broker (Python side) for scheduled jobs: overdue compliance flagging, auto emission calc, badge sweep fallback | |
| Notifications | Resend/SendGrid (email) + WebSocket (in-app, via FastAPI's native WS support) | Matches "Recent Activity" feed + notification settings screen |
| Reports export | WeasyPrint (PDF), openpyxl (Excel), pandas (CSV) | Matches Custom Report Builder's 3 export buttons |
| AI layer | Anthropic/OpenAI API, called from FastAPI | Compliance issue summarization, NL report filters — see Section 8 |
| Deployment | Docker Compose (all services) → Railway/Fly.io for demo, or k8s if you want to show that skill | |

---

## 2. System Architecture

```
                         ┌─────────────────────┐
                         │   Next.js Frontend    │
                         │  (7 tabbed screens)   │
                         └──────────┬────────────┘
                                    │ REST / WS
                         ┌──────────▼────────────┐
                         │   FastAPI Core API     │
                         │  Auth · Env · Social    │
                         │  Governance · Reports   │
                         │  Settings · AI          │
                         └──────┬──────────┬───────┘
                                │          │
                   ┌────────────▼───┐  ┌───▼────────────┐
                   │  Go Gamification │  │   PostgreSQL    │
                   │  + Carbon Txn    │◄─┤  (shared DB)    │
                   │  Service         │  └────────────────┘
                   └────────┬─────────┘
                             │
                       ┌─────▼─────┐
                       │   Redis    │
                       │ (leaderboard,│
                       │  pub/sub)  │
                       └────────────┘
```

---

## 3. Custom Auth & RBAC

Build this yourself (no Clerk/Auth0) since it's a good showcase and the domain needs department-scoped roles anyway.

**Tables:** `users`, `roles`, `user_roles`, `refresh_tokens`

**Roles (mapped to what the mockup implies):**
- `super_admin` — full access, Settings screen, all departments
- `dept_head` — full access scoped to their Department (matches "Department Head" field in Department table)
- `employee` — Dashboard (own scores), Social (join CSR/Challenges), Gamification (own XP/badges), read-only Governance (Policy Acknowledgement only)
- `auditor` — Governance module only (Audits, Compliance Issues), read-only elsewhere

**Flow:**
- Argon2/bcrypt password hashing
- Access token (JWT, 15 min) + refresh token (httpOnly cookie, 7 days, rotated on use)
- Middleware in FastAPI checks role + department scope on every request — e.g. a `dept_head` for Manufacturing can only write Carbon Transactions / CSR Activities tagged to Manufacturing
- Go service validates the same JWT (shared secret/JWKS) so auth is consistent across both backends

---

## 4. Full Database Schema

### Master Data

```sql
departments (
  id, name, code, head_user_id, parent_department_id,
  employee_count, status, created_at
)

categories (
  id, name, type ENUM('csr_activity','challenge'), status
)

emission_factors (
  id, activity_type, unit, co2_per_unit, source, effective_date
)

product_esg_profiles (
  id, product_name, sku, carbon_footprint, recyclable_pct, notes
)

environmental_goals (
  id, department_id, name, target_co2, current_co2,
  deadline, status ENUM('active','on_track','at_risk','completed')
)

esg_policies (
  id, title, body, category, version, effective_date, status
)

badges (
  id, name, description, icon_url, unlock_rule JSONB
  -- unlock_rule example: {"type":"xp_threshold","value":500}
  --                      {"type":"challenges_completed","value":5}
)

rewards (
  id, name, description, points_required, stock, status
)
```

### Transactional Data

```sql
carbon_transactions (
  id, department_id, source_type ENUM('purchase','manufacturing','expense','fleet'),
  source_record_id, emission_factor_id, quantity, co2_calculated,
  auto_generated BOOLEAN, created_at
)

csr_activities (
  id, title, category_id, description, department_id,
  evidence_required BOOLEAN, status, created_at
)

employee_participation (
  id, employee_id, csr_activity_id, proof_url,
  approval_status ENUM('pending','approved','rejected'),
  points_earned, completion_date
)

challenges (
  id, title, category_id, description, xp, difficulty,
  evidence_required BOOLEAN, deadline,
  status ENUM('draft','active','under_review','completed','archived')
)

challenge_participation (
  id, challenge_id, employee_id, progress_pct, proof_url,
  approval_status ENUM('pending','approved','rejected'), xp_awarded
)

policy_acknowledgements (
  id, employee_id, policy_id, acknowledged_at
)

audits (
  id, title, department_id, auditor_id, audit_date,
  findings_summary, status ENUM('scheduled','under_review','completed')
)

compliance_issues (
  id, audit_id, severity ENUM('low','medium','high'),
  description, owner_id, due_date,
  status ENUM('open','resolved'), overdue BOOLEAN GENERATED
)

department_scores (
  id, department_id, environmental_score, social_score,
  governance_score, total_score, period_start, period_end
)

notifications (
  id, user_id, type, payload JSONB, read BOOLEAN, created_at
)
```

Every table above maps 1:1 to a tab visible in the mockup — e.g. Environmental screen's 4 sub-tabs (Emission Factors / Product ESG Profiles / Carbon Transactions / Environmental Goals) are exactly `emission_factors`, `product_esg_profiles`, `carbon_transactions`, `environmental_goals`.

---

## 5. Scoring Engine (feeds the 4 KPI tiles on Dashboard)

Runs as a scheduled job (nightly) or on-demand recalculation:

```
Environmental Score = f(goal progress %, avg across dept goals, emission trend direction)
Social Score        = f(CSR participation rate, diversity metric targets, training completion %)
Governance Score     = f(policy ack rate, audit pass rate, open compliance issues weighted by severity)

Department Total Score = weighted avg (default 40/30/30, configurable — matches Settings → ESG Configuration)
Overall ESG Score       = avg(Department Total Scores) or weighted by employee_count
```

Store snapshots in `department_scores` per period so the Dashboard's "Emissions Trend (12 mo)" chart and score history are real trends, not just current-state numbers.

---

## 6. Gamification Engine (Go service — owns this fully)

- **XP award**: on `challenge_participation.approval_status = 'approved'`, Go service credits `xp_awarded` to the employee and pushes an update to Redis sorted set `leaderboard:global` and `leaderboard:dept:{id}`
- **Badge auto-award**: rule engine evaluates `unlock_rule` JSONB against employee's running stats (total XP, challenges completed) after every XP event — matches the "Auto-award badges on challenge completion" toggle in Settings
- **Reward redemption**: atomic transaction — check `stock > 0` and `employee.points >= points_required`, decrement both, matches the mockup's Rewards tab (present but worth building even though not drawn in detail)
- **Leaderboard read**: `ZREVRANGE leaderboard:global 0 9 WITHSCORES` — powers both the Gamification screen's Leaderboard table and the Dashboard's Department ESG Ranking bar chart (same underlying data, different aggregation)

---

## 7. Reports Module

Matches the 4 report cards + Custom Report Builder exactly:

- `GET /reports/environmental|social|governance|summary` → pre-built report with default filters
- `POST /reports/custom` → accepts `{date_range, department, module, employee, challenge, esg_category}`, runs a parameterized query, returns JSON preview
- `POST /reports/export` → `{format: 'pdf'|'excel'|'csv', report_data}` → WeasyPrint/openpyxl/pandas generate file, return signed download URL

---

## 8. AI Features (your differentiator — build at least 2 of these)

1. **Compliance Issue Auto-Summary**: when an Audit is closed with findings, call the LLM to summarize findings into 1-2 Compliance Issues with suggested severity — sits right on the Governance screen's "+ New Audit" flow.
2. **Natural-language Custom Report Builder**: text box above the filter row in Reports — "show me high severity issues in Manufacturing this quarter" → LLM maps to the filter JSON, then runs the same `/reports/custom` endpoint. Directly upgrades the exact UI already in the mockup.
3. **Policy Gap Detector**: RAG over `esg_policies` — flag policies missing standard clauses vs. a reference framework (GRI/ISSB summary you embed as reference docs).
4. **Anomaly detection on Carbon Transactions**: z-score against department's rolling 90-day baseline, flag on the Environmental dashboard.

---

## 9. Notifications

Matches Settings → Notification Settings toggles exactly:

- `new_compliance_issue` → auditor + dept_head + issue owner
- `csr_challenge_approval_decision` → the employee whose submission was approved/rejected
- `policy_ack_reminder` → scheduled Celery job, nags employees with unacknowledged policies past a threshold
- `badge_unlock` → fired by Go gamification service via Redis pub/sub → FastAPI WS relay → toast/in-app feed (matches "Recent Activity" widget on Dashboard)

---

## 10. Build Order (no time constraint — do it right)

1. **Foundation**: Postgres schema (all tables above), custom auth + RBAC, Departments/Categories CRUD, Settings screen wiring
2. **Environmental module**: Emission Factors → Carbon Transactions (manual first, auto-calc toggle second) → Goals → Dashboard tile wiring
3. **Social module**: CSR Activities → Employee Participation + approval queue → Diversity Dashboard
4. **Governance module**: Policies → Acknowledgements → Audits → Compliance Issues (with overdue flagging job)
5. **Go Gamification service**: stand it up as a separate service now — Challenges → Participation → XP → Badge rule engine → Redis leaderboard
6. **Scoring engine**: wire E/S/G scores → Department Total → Overall ESG Score → Dashboard KPI tiles + trend chart
7. **Reports**: 4 pre-built reports → Custom Report Builder → exports
8. **AI features**: pick 2 from Section 8, build them last so they sit on top of real data
9. **Notifications**: wire all 4 event types + WS relay
10. **Polish**: mobile responsiveness pass, seed realistic demo data, empty states

---

## 11. New Ideas Worth Adding (beyond the doc's bonus list)

- **Explainable scoring**: clicking a KPI tile shows *why* the score is what it is (which sub-metrics dragged it down) — cheap to build since scoring engine already computes sub-components, big trust/interview-story payoff.
- **CSV/ERP import connector**: generic mapper for Carbon Transaction bulk import — sells the "plugs into any ERP" pitch from the original doc's background section.
- **Slack/Teams webhook** for compliance alerts and badge unlocks, as an alternative notification channel.
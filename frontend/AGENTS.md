# AGENTS.md — Green-Pulse Frontend

This file governs any agent working in this repo. Read it fully before touching code.

## What this project is

Green-Pulse is an enterprise ESG management platform. The frontend is Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui. Design reference lives in `DESIGN.md` — it defines the full color system, typography scale, spacing, and component rules. Every screen must be built against those tokens, not invented values. If a mockup screenshot and DESIGN.md ever disagree on a hex value or spacing number, DESIGN.md wins — the screenshots are layout/content references, the doc is the source of truth for values.

Screens to build (from Stitch mockups, uploaded as PNGs when this agent is triggered):

1. Dashboard — KPI tiles, AI insight banner, emissions trend chart, dept ranking, recent activity, quick actions
2. Environmental — sub-tabs: Emission Factors, Product ESG Profiles, Carbon Transactions, Environmental Goals
3. Social — sub-tabs: CSR Activities, Employee Participation, Diversity Dashboard
4. Governance — sub-tabs: Policies, Policy Acknowledgements, Audits, Compliance Issues
5. Gamification — sub-tabs: Challenges, Challenge Participation, Badges, Rewards, Leaderboard
6. Reports — report cards, NL search bar, Custom Report Builder
7. Settings — sub-tabs: Departments, Categories, ESG Configuration, Notification Settings

## When triggered with mockup PNGs

1. Identify which screen(s) the uploaded image(s) correspond to from the list above.
2. Check `/components` for anything that already covers what you're about to build (see Component Reuse below) before writing anything new.
3. Build the screen as a route under `/app/(dashboard)/<module>/page.tsx`, composed from shared components.
4. Match the mockup's layout, spacing, and hierarchy — but pull actual values (colors, radii, type scale) from `DESIGN.md`, never eyeball them from the PNG.
5. Wire it with placeholder/mock data typed against the real shape it'll eventually receive from the API (see Data section) — don't hardcode strings into JSX where a prop would do.
6. Update `/components/README.md` (one line per component: name + what it's for) so the other dev and future agent runs know what exists without re-reading every file.

## Component reuse — this is the most important rule

Before creating any component, grep `/components` for something close. Reuse patterns:

- One `<KpiCard>` powers all 4 Dashboard tiles AND can be reused anywhere else a big-number-plus-label pattern shows up. Don't build `<EnvironmentalScoreCard>`, `<SocialScoreCard>`, etc. as separate files.
- One `<DataTable>` (columns + rows + optional row actions prop) powers Environmental Goals, Audits, Compliance Issues, Employee Participation, Departments, Leaderboard. These all look different in content but identical in structure — same component, different column config.
- One `<StatusPill>` handles every colored status chip across every screen (Active/Completed/Pending/Overdue/etc). Pass a status string + it maps to the right color via a single lookup table, not per-screen conditionals.
- One `<SubTabs>` component handles every screen's second-level tab row (Environmental's 4 tabs, Governance's 4 tabs, Gamification's 5 tabs, Settings' 4 tabs). Same component, different tab list prop.
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
- **Pillar colors are semantic:** Green (`#0D631B`) = Environmental, Blue (`#005DB7`) = Social, Purple (`#7A2FAA`) = Governance. Use these consistently across every screen — a governance-related element should always use the purple palette, never green or blue.
- **If you're unsure whether something matches the design system, check DESIGN.md first.** The goal is that any two screens placed side by side look like they were designed and built by the same team in the same session.

## Data

Backend isn't live yet for most modules. Use typed mock data (`/lib/mock-data/<module>.ts`) shaped exactly like the eventual API response so swapping in real fetches later is a one-line change, not a rewrite. Don't invent a different shape "for now."

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

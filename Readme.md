# EcoSphere — Enterprise ESG Management Platform

> **EcoSphere** (internally known as Green-Pulse) is a full-stack enterprise platform for tracking, reporting, and improving Environmental, Social, and Governance (ESG) performance across departments. It integrates carbon tracking, CSR activity management, compliance audits, gamification, and AI-powered reporting in a single cohesive dashboard.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup & Running](#setup--running)
  - [Backend](#backend-setup)
  - [Frontend](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Module Overview](#module-overview)
- [Design System](#design-system)
- [Contributing](#contributing)

---

## Features

- 📊 **ESG Dashboard** — Real-time KPI tiles, emissions trend charts, department rankings, and an AI insight banner.
- 🌿 **Environmental Module** — Track emission factors, product ESG profiles, carbon transactions, and environmental goals.
- 🤝 **Social Module** — Manage CSR activities, employee participation with proof-based approvals, and diversity metrics.
- ⚖️ **Governance Module** — Policies, policy acknowledgements, audit scheduling, and compliance issue tracking.
- 🏆 **Gamification** — XP-based challenges, badge unlocks, leaderboard, and a rewards catalog.
- 📈 **Reports** — Custom report builder, natural language query interface, and multi-format export (PDF, Excel, CSV).
- ⚙️ **Settings** — Department management, category setup, ESG weighting configuration, notification channels, and user/role management.
- 🔐 **Authentication** — JWT-based auth with NextAuth v5 (credentials provider) backed by the FastAPI backend.

---

## Project Structure

```
green-pulse/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/                # Route handlers (auth, environmental, governance, ...)
│   │   ├── core/               # Config, database, security utilities
│   │   └── schemas/            # Pydantic request/response models
│   ├── prisma/                 # Prisma schema for PostgreSQL
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── (auth)/             # Sign-in and Sign-up pages
│   │   └── (dashboard)/        # Protected dashboard routes
│   │       ├── dashboard/
│   │       ├── environmental/
│   │       ├── social/
│   │       ├── governance/
│   │       ├── gamification/
│   │       ├── reports/
│   │       └── settings/
│   ├── components/             # Shared UI components (Sidebar, TopNav, KpiCard, ...)
│   ├── lib/
│   │   ├── api.ts              # Centralised API client
│   │   ├── mock-data/          # Typed mock data for each module
│   │   └── types.ts            # Shared TypeScript types aligned with API schemas
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # NextAuth session type augmentations
│   ├── auth.ts                 # NextAuth v5 configuration
│   ├── middleware.ts            # Route protection (redirects unauthenticated users)
│   └── DESIGN.md               # Design system tokens (colors, spacing, typography)
│
└── docs/                       # Build spec and architecture documents
```

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + Base UI |
| Charts | [Recharts](https://recharts.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Authentication | [NextAuth v5 (Auth.js)](https://authjs.dev/) |
| HTTP Client | Native `fetch` (via centralised `/lib/api.ts`) |

### Backend
| Layer | Technology |
|---|---|
| Framework | [FastAPI](https://fastapi.tiangolo.com/) |
| Language | Python 3.11+ |
| Database ORM | [Prisma (Python client)](https://prisma-client-py.readthedocs.io/) |
| Database | PostgreSQL |
| Auth | PyJWT + bcrypt |
| Validation | Pydantic v2 |
| Server | Uvicorn (ASGI) |

---

## Prerequisites

- **Node.js** v20+
- **Python** 3.11+
- **PostgreSQL** 14+
- **npm** or **pnpm**

---

## Setup & Running

### Backend Setup

1. **Clone the repo and navigate to the backend:**
   ```bash
   cd green-pulse/backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # macOS / Linux
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL connection string and JWT secret
   ```

5. **Apply database migrations:**
   ```bash
   prisma db push
   ```

6. **Run the development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`.  
   Interactive API docs: `http://localhost:8000/docs`

---

### Frontend Setup

1. **Navigate to the frontend:**
   ```bash
   cd green-pulse/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Create a .env.local file in the frontend directory
   cp .env.example .env.local   # or create manually
   ```
   Minimum required variables:
   ```env
   AUTH_SECRET=your-secret-here          # Required by NextAuth v5
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```
   To generate a secure `AUTH_SECRET`:
   ```bash
   npx auth secret
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend (`.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/greenpulse` |
| `JWT_SECRET` | Secret key for JWT signing | _(required)_ |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | `7` |
| `ADMIN_EMAIL` | Seed admin email | `admin@odoo.com` |
| `ADMIN_PASSWORD` | Seed admin password | `admin@odoo.com` |
| `ALLOWED_EMAIL_DOMAIN` | Restrict sign-ups to this domain | `odoo.com` |
| `CORS_ORIGINS` | Allowed frontend origins (JSON array) | `["http://localhost:3000"]` |

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Secret key for NextAuth JWT encryption (**required**) |
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## API Overview

All API routes are prefixed with `/api/v1`.

| Module | Base Path | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Login, logout, token refresh |
| Environmental | `/api/v1/environmental` | Emission factors, carbon transactions, ESG goals |
| Governance | `/api/v1/governance` | Audits, compliance issues, policies |
| Social | _(in progress)_ | CSR activities, employee participation |
| Gamification | _(in progress)_ | Challenges, badges, rewards, leaderboard |
| Reports | _(in progress)_ | Custom reports, NL queries, exports |

Interactive Swagger docs available at **`http://localhost:8000/docs`** when the backend is running.

---

## Module Overview

| Module | Description |
|---|---|
| **Dashboard** | Aggregated ESG KPIs, emissions trend, department ranking, recent activity feed |
| **Environmental** | Track CO₂ emissions from purchases, fleet, manufacturing; manage reduction goals |
| **Social** | CSR activity management, employee participation with proof-based approvals |
| **Governance** | Audit lifecycle management, compliance issue tracking with severity levels |
| **Gamification** | XP challenges, badge unlocks, rewards catalog, company-wide leaderboard |
| **Reports** | Custom report builder with date/department filters; natural language query interface |
| **Settings** | Departments, categories, ESG weights, notification channels, user & role management |

---

## Design System

The frontend follows a strict design token system documented in [`frontend/DESIGN.md`](./frontend/DESIGN.md).

**Pillar color semantics:**

| Pillar | Color | Hex |
|---|---|---|
| Environmental | Green | `#0D631B` |
| Social | Blue | `#005DB7` |
| Governance | Purple | `#7A2FAA` |
| Gamification | Orange | `#E65100` |

All colors, spacing, radii, shadows, and typography scales are defined in `DESIGN.md` and must be used consistently — no ad-hoc hex values in component code.

---

## Contributing

1. Read [`frontend/AGENTS.md`](./frontend/AGENTS.md) before making any frontend changes — it defines component reuse rules, naming conventions, and the design contract.
2. All API types in the frontend (`lib/types.ts`) must stay in sync with the backend Pydantic schemas.
3. Run type checks before committing:
   ```bash
   cd frontend && npx tsc --noEmit
   ```
4. Keep mock data shapes (`lib/mock-data/`) consistent with real API response types so wiring frontend → backend is a configuration change, not a rewrite.

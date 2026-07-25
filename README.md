# BASSIR CORPORATE ACADEMY PLATFORM (BCAP)

**Powered by Bassir Technology**

A **multi-tenant enterprise SaaS platform** for continuous employee development,
competency growth, corporate universities, leadership development and
AI-powered workforce transformation — built to be sold to unlimited companies
across Saudi Arabia, the GCC and international markets.

> This is **not** a Learning Management System. It is an Employee Growth,
> Talent Development, Competency Management and Workforce Transformation
> platform. Training programs are simply the first module.

---

## Status — Phase 1 (Foundation)

This repository currently delivers the **production-grade foundation** every
future module builds on:

| Area | Delivered |
|------|-----------|
| **Multi-tenancy** | Shared database, `tenantId` on every scoped table, enforced by PostgreSQL **Row-Level Security** — tenant isolation cannot be bypassed by an application bug. |
| **Authentication** | Email + password per company, bcrypt hashing, signed JWT session cookies (httpOnly). |
| **Authorization (RBAC)** | Global permission catalog, per-tenant roles (Administrator, HR/L&D Manager, Line Manager, Employee), `can()` checks in code. |
| **Org structure** | Companies → Branches → Departments → Users (with manager hierarchy). |
| **Competency framework** | Competency categories & competencies (the differentiator vs. an LMS). |
| **Training module (end-to-end)** | Create/publish programs, self-enroll, track progress to completion — the first vertical slice. |
| **Audit log** | Tenant-scoped audit trail (logins, program creation, …). |
| **Seed** | Provisions the three launch customers: Alarrab Engineering Consultancy, Azoom United Contracting, Hadathah Logistics. |

## Status — Phase 2 (Talent modules)

Built on the Phase 1 core, these modules are live end-to-end (schema + RLS +
seed + UI), all tenant-scoped and permission-gated:

| Module | Delivered |
|--------|-----------|
| **Competency assessments** | Per-employee self / manager / target levels (1–5), an interactive skill matrix (managers & HR click a cell to re-assess), and organization skill-gap analysis. |
| **Certifications** | Internal corporate-university certifications with awards, holders, validity and status; managers issue certificates to employees. |
| **Leadership & succession** | 9-box talent grid (performance × potential) and succession pipelines with successor readiness for critical roles. |
| **Analytics** | Completion / active-learner / compliance donuts, enrollments-by-level, a 6-month trend and competency coverage. |
| **AI insights** | Priority skill gaps, program recommendations that close the largest gaps, role-readiness scoring and a retention watch. |

## Status — Phase 3 (Production readiness)

The platform is ready to run for real employees:

| Capability | Delivered |
|-----------|-----------|
| **Invite employees** | Admins & HR invite employees from **People** — pick a role and department; an **invitation email** with a secure link is sent (and the admin always gets the link to share manually). |
| **Secure onboarding** | Invitees click the link, set their own password, and are signed in. Links are single-use and expire in 7 days; no password is ever emailed. |
| **Manage access** | Reset an employee's password, disable/enable accounts (the owner and yourself are protected). |
| **Self-service** | Anyone can change their own password from **Settings → Account security**. |
| **Provision a company** | `npm run provision` stands up a new company + its first administrator (no demo data). |
| **Deploy** | One-command **Docker Compose** stack (app + PostgreSQL) that auto-runs migrations, including Row-Level Security. |
| **Hardened config** | Real Prisma migrations, security headers, `AUTH_SECRET` strength checks, secure cookies in production, non-superuser DB role. |

### Deploy in one command

```bash
# 1. Set a strong AUTH_SECRET in docker-compose.yml  (openssl rand -base64 48)
#    and change the database passwords.
# 2. Build and start:
docker compose up -d --build
# 3. Create your company + admin:
docker compose exec app npm run provision -- \
  --name "Your Company" --slug yourco \
  --industry CONSTRUCTION_CONTRACTING \
  --admin-name "Your Name" --admin-email you@yourco.com \
  --admin-password 'ChangeThisPassword1'
# 4. Open http://localhost:3000 → sign in with company "yourco".
```

Then, as the admin, open **People → Invite employee** to onboard your team.
If you've configured SMTP (see `.env.example`), each person receives an
invitation email; otherwise share the link the app shows you. They click it,
set their own password, and they're in.

> Put the app behind HTTPS (a reverse proxy such as Caddy/Nginx, or a platform
> like Vercel + managed Postgres) before going live — secure session cookies
> require it.

## Status — Phase 5–8 (Commercial & enterprise)

| Capability | Delivered |
|-----------|-----------|
| **Subscription plans** | Starter / Growth / Enterprise with seat limits and per-feature access; premium modules gated, seat limits enforced on invites, self-serve plan changes on the Billing page. |
| **Per-company branding** | Company logo + brand color applied to the workspace and to branded invitation emails, editable in Settings. |
| **Arabic / RTL** | Bilingual English/Arabic with a locale toggle and right-to-left layout across the app shell, dashboard and login (extensible dictionary in `src/lib/i18n.ts`). |
| **Single sign-on** | Per-company OpenID Connect SSO (Google, Microsoft Entra, Okta, Auth0, …) with discovery, ID-token verification and just-in-time provisioning. Enterprise plan. |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design and the
[roadmap](docs/ARCHITECTURE.md#roadmap) of remaining work (payment processing,
platform-admin plane, deep per-page Arabic coverage, …).

---

## Tech stack

- **Next.js 15** (App Router, React Server Components, Server Actions)
- **TypeScript**
- **PostgreSQL** + **Prisma ORM**
- **Row-Level Security** for tenant isolation
- **Tailwind CSS**
- **jose** (JWT sessions) + **bcryptjs** (password hashing) + **zod** (validation)

---

## Getting started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 14+

### 2. Configure environment
```bash
cp .env.example .env
# edit DATABASE_URL and AUTH_SECRET (generate one with: openssl rand -base64 48)
```

> **Important:** the app must connect as a **non-superuser** PostgreSQL role.
> Superusers bypass Row-Level Security, which would disable tenant isolation.

```sql
CREATE ROLE bcap_app WITH LOGIN PASSWORD '...' NOSUPERUSER NOCREATEDB NOCREATEROLE;
GRANT ALL ON DATABASE bcap TO bcap_app;
```

### 3. Install & set up the database
```bash
npm install
npm run db:push            # apply the Prisma schema
psql "$DATABASE_URL" -f prisma/rls.sql   # enable Row-Level Security policies
npm run db:seed            # provision the 3 launch tenants + sample data
```

### 4. Run
```bash
npm run dev
# open http://localhost:3000
```

### Sample logins (seeded)
Password for all: `Password123!`

| Company (slug) | Email | Role |
|----------------|-------|------|
| `alarrab` | `admin@alarrab.bcap` | Administrator |
| `azoom` | `admin@azoom.bcap` | Administrator |
| `hadathah` | `admin@hadathah.bcap` | Administrator |

Each tenant also has `huda@…` (HR/L&D Manager), `faisal@…` (Line Manager),
`sara@…` and `omar@…` (Employees).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run the unit test suite (Vitest) |
| `npm run db:push` | Sync schema to the database |
| `npm run db:migrate` | Create a migration (for production workflows) |
| `npm run db:seed` | Seed tenants + sample data |
| `npm run db:studio` | Open Prisma Studio |

## Testing & CI

- **Unit tests** (`npm test`, Vitest) cover the core logic: RBAC permissions,
  plan/feature entitlements, Stripe plan↔price mapping, invite-token hashing,
  password hashing, branding validation and OIDC auth-URL building.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs on every push/PR:
  typecheck → tests → production build, plus a job that spins up PostgreSQL,
  applies the full migration chain and asserts Row-Level Security is enabled
  on tenant tables.

---

## Project structure
```
prisma/
  schema.prisma      # multi-tenant data model
  rls.sql            # Row-Level Security policies (run after schema)
  seed.ts            # provisions launch tenants
src/
  lib/               # prisma client, tenant-db (RLS), auth, session, rbac
  middleware.ts      # route protection
  components/        # shared UI
  app/
    page.tsx         # public landing
    login/           # authentication
    (app)/           # authenticated shell: dashboard, training, people, settings
```

---

© Bassir Technology. All rights reserved.

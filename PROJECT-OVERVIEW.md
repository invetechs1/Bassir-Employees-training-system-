# BCAP — Project Overview (for developers)

**Product:** Bassir Corporate Academy Platform (BCAP)
**Owner:** Invetech / Bassir Technology
**Audience of this document:** the engineer(s) who will run, extend, and maintain the system.

> نبذة سريعة (بالعربية): هذا النظام منصّة **SaaS متعددة الشركات** لتطوير الموظفين وإدارة الكفاءات والتعاقب الوظيفي، مبنية لتُباع للشركات في السعودية والخليج. كل شركة تعمل في مساحة معزولة، والواجهة ثنائية اللغة (عربي/إنجليزي مع RTL). بقية الوثيقة بالإنجليزية لأنها موجّهة للمطوّر.

---

## 1. Why this exists (the business rationale)

Companies in Saudi Arabia and the GCC are under real pressure to **develop and retain their workforce** — driven by Vision 2030, Saudization, and a shift from "training as compliance" to "talent as strategy." The tools most companies use today are a patchwork:

- HR keeps competencies and succession plans in **spreadsheets** — no history, no analytics, no single source of truth.
- Generic foreign LMS products are **course-completion trackers**, not talent-development systems, and most have **weak Arabic/RTL support**.
- Buying separate tools for learning, competencies, succession, and analytics is expensive and doesn't join up.

**BCAP is our answer:** one platform that treats employee growth as a measurable, ongoing process — competencies over time, not just courses finished — and is **built for this region first** (Arabic-native, RTL, PDPL-aware, VAT-ready).

**The commercial model:** BCAP is **multi-tenant SaaS**. We onboard many client companies onto one platform, each in an isolated workspace, on a subscription. That means: build once, sell many times; low marginal cost per new customer; recurring revenue. The first target tenants are **Alarrab Engineering Consultancy, Azoom United Contracting, and Hadathah Logistics**, with the platform designed to scale to unlimited companies, users, departments, and branches.

**In one sentence:** *BCAP is a region-first, multi-tenant SaaS for corporate talent development — competencies, learning, succession, and workforce analytics — that we can sell across KSA and the GCC.*

---

## 2. What it does (the product)

Each client company ("tenant") gets its own workspace with:

| Area | What it does |
|---|---|
| **Multi-company workspaces** | Every company is isolated: its own users, departments, branches, data, and branding. |
| **Authentication & roles** | Per-company email/password login; role-based access (Admin, HR / L&D Manager, Line Manager, Employee). |
| **Employee onboarding** | Admins invite staff by email (secure one-time link); employees set their own password. Self-service password reset + email verification. |
| **Training** | Role-based programs, enrollments, internal certifications, progress tracking. |
| **Competency management** | Define competency frameworks and score employees over time — an interactive skill matrix, not just "course done". |
| **Leadership & succession** | 9-box talent grid (performance × potential) and succession pipelines for critical roles. |
| **Analytics & AI insights** | Skill gaps, completion rates, succession readiness, attrition-risk signals for decision-makers. |
| **Bilingual UI** | Full English/Arabic with right-to-left (RTL) layout across every screen. |
| **Commercial** | Subscription plans (Starter / Growth / Enterprise) with seat limits and feature gating; Stripe billing; VAT-aware. |
| **Enterprise** | Optional SSO (OpenID Connect), per-company branding, and a vendor-side **platform-admin console** for cross-tenant operations. |
| **Legal** | Bilingual Terms of Service and Privacy Policy pages, aligned with Saudi PDPL. |

There's an **interactive demo** (a single self-contained HTML file) that mirrors these screens with sample data — useful for showing the product to prospects without a running server.

---

## 3. How it's built (architecture)

**Stack:** Next.js (App Router, React, TypeScript) · Prisma ORM · PostgreSQL · Tailwind CSS · deployed via Docker Compose.

The three decisions a new developer must understand first:

1. **Multi-tenancy = shared database + `tenantId` + PostgreSQL Row-Level Security (RLS).**
   All tenants share one database. Every tenant-owned row carries a `tenantId`. **RLS policies in the database** enforce that a request can only ever see/modify its own tenant's rows — even if application code has a bug. The app opens a transaction that sets the current tenant (`app.current_tenant`), and **connects as a non-superuser DB role** so RLS is actually enforced. This is the security backbone — do not bypass it.
   - See `prisma/rls.sql`, `src/lib/tenant-db.ts` (the `withTenant()` helper), and the RLS migration under `prisma/migrations/`.

2. **Auth = signed JWT session cookies.** Passwords are hashed with bcrypt (never stored in plain text). Sessions are signed, httpOnly cookies verified in `src/middleware.ts`, which gates protected routes. Roles/permissions live in `src/lib/rbac.ts`.

3. **Server-first Next.js.** Pages are React Server Components; mutations are Server Actions (`actions.ts` files next to each page). There's very little client-side state — data is read and written on the server, inside tenant-scoped transactions.

**Optional integrations are all env-gated and degrade gracefully** (the app runs fine with them off): SMTP email, Stripe billing, SSO, and the platform-admin console. Copy `.env.example` → `.env` to configure.

---

## 4. Where things live (code map)

```
prisma/
  schema.prisma            # data model (tenants, users, competencies, programs, …)
  migrations/              # versioned SQL migrations (incl. a dedicated RLS migration)
  rls.sql                  # Row-Level Security policies
  seed.ts                  # demo tenants + sample data
src/
  middleware.ts            # route gating from the session cookie
  lib/
    tenant-db.ts           # withTenant() — runs queries inside a tenant-scoped tx (RLS)
    session.ts             # JWT session create/verify
    rbac.ts                # permissions + system roles
    plans.ts               # subscription tiers + feature gating
    stripe.ts, email.ts    # optional integrations (graceful fallback)
    oidc.ts                # SSO (OpenID Connect)
    i18n.ts                # EN/AR dictionary + locale helpers
    legal.ts               # Terms / Privacy content (bilingual, PDPL-aligned)
    reset-token.ts, invite-token.ts   # one-time token helpers
  app/
    (app)/                 # authenticated modules: dashboard, training, competencies,
                           #   certifications, succession, analytics, insights, billing, settings
    login/ forgot/ reset/ verify/ invite/   # auth & onboarding flows
    legal/terms, legal/privacy              # public policy pages
    platform/              # vendor-side cross-tenant admin console
    api/stripe/webhook     # Stripe webhook endpoint
  components/              # shared UI (e.g. locale toggle)
e2e/                       # Playwright end-to-end tests
Dockerfile, docker-compose.yml, docker/   # deployment (app + PostgreSQL + non-superuser role)
.github/workflows/ci.yml   # CI: typecheck + unit tests + build, migrations+RLS, E2E
README.md, docs/ARCHITECTURE.md
```

---

## 5. How to run it locally

```bash
cp .env.example .env          # then set DATABASE_URL and AUTH_SECRET (32+ chars)
npm install
npx prisma migrate deploy     # applies the full migration chain incl. RLS
npm run db:seed               # loads the three demo companies + sample users
npm run dev                   # http://localhost:3000
```

Sample logins are printed by the seed (e.g. `company=alarrab`, `email=admin@alarrab.bcap`).
**Important:** the app must connect to PostgreSQL as a **non-superuser role** or RLS won't be enforced — see the README and `docker/postgres-init/`.

**Quality gates (run before pushing):**
```bash
npm run typecheck
npm test          # Vitest unit tests
npm run test:e2e  # Playwright (needs a DB + built app)
```
CI runs all of these plus a migrations+RLS check on every push.

---

## 6. Current status & roadmap

**Done and verified (unit + E2E tests pass, migrations apply with no drift, RLS enforced):** all core modules, auth/RBAC, onboarding + password reset + email verification, plans + Stripe, branding, SSO, bilingual UI, platform console, and bilingual PDPL-aligned legal pages.

**Before commercial go-live, the remaining work is mostly operational, not product:**
1. **Infrastructure** — production hosting, managed PostgreSQL, **backups & disaster recovery**, monitoring + error tracking, rate limiting.
2. **Compliance (KSA)** — legal review of the policy templates; **VAT 15% + ZATCA e-invoicing** wiring on top of Stripe.
3. **Hardening** — load/performance testing, a security review before real data goes in.

For a deeper technical description, read `README.md` and `docs/ARCHITECTURE.md`.

---

## 7. What NOT to do

- Don't query tenant tables outside `withTenant()` / without a tenant context — you'll either see nothing (RLS) or, worse, leak across tenants if you also disable RLS. Keep RLS on.
- Don't connect the app as a database superuser in any environment — RLS is bypassed for superusers.
- Don't store secrets in the repo. All integrations read from environment variables.
- Don't put plain-text passwords or tokens anywhere — only hashes are persisted.

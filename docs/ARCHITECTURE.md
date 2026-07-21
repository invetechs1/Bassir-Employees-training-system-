# BCAP — Architecture

**Bassir Corporate Academy Platform** — a multi-tenant enterprise SaaS platform
for employee growth, competency management, corporate universities, leadership
development and AI-powered workforce transformation.

This document describes the Phase 1 foundation and the roadmap. It is written
for engineers and technical decision-makers.

---

## 1. Design principles

1. **Multi-tenant from day one.** Every scoped record carries a `tenantId`.
   Isolation is enforced by the database, not just application code.
2. **Secure by default.** A missing `where: { tenantId }` in application code
   must never leak data across companies — Row-Level Security is the backstop.
3. **Modular.** The domain is split so new modules (leadership, succession,
   certifications, AI insights) plug in without reworking the core.
4. **Commercial SaaS.** Plans, tenant lifecycle (trial/active/suspended) and
   auditability are first-class from the start.

---

## 2. Tenancy model — Shared DB + `tenant_id` + Row-Level Security

We use a **single shared database** where every tenant-scoped table has a
`tenantId` column, protected by PostgreSQL **Row-Level Security (RLS)**.

### Why this model
- **Scales to unlimited tenants** cheaply (one schema, one connection pool).
- **Strong isolation** without per-tenant operational overhead.
- Upgrade path: high-compliance customers can later be moved to
  database-per-tenant without changing the application's tenant-context API.

### How isolation is enforced
Every request runs its queries inside a transaction that first sets a
transaction-local variable:

```sql
SELECT set_config('app.current_tenant', '<tenantId>', true);
```

Each scoped table has a policy:

```sql
CREATE POLICY tenant_isolation ON <table>
  USING     ("tenantId" = current_tenant_id())
  WITH CHECK ("tenantId" = current_tenant_id());
```

- `USING` filters **reads** (and the rows an UPDATE/DELETE can touch).
- `WITH CHECK` blocks **writes** that would create/modify a row for another
  tenant.
- `FORCE ROW LEVEL SECURITY` ensures the policy applies even to the table
  owner.

The application connects as a **non-superuser** role (`bcap_app`). This is
critical: superusers and `BYPASSRLS` roles skip policies entirely.

**Verified behaviour** (see `prisma/rls.sql`):

| Scenario | Result |
|----------|--------|
| No tenant context | 0 rows visible |
| Context = Tenant A | only Tenant A rows |
| Insert Tenant-A row while in Tenant-B context | rejected by policy |

### Application API
`src/lib/tenant-db.ts` exposes:

```ts
withTenant(tenantId, (tx) => tx.trainingProgram.findMany())
```

which opens the transaction, sets the tenant variable, and runs the callback.
The `tenants` table itself is **not** RLS-scoped, because resolving a company
by slug at login happens *before* a tenant context exists; it is reached only
through the base client on trusted paths (login, provisioning).

---

## 3. Identity & access

### Authentication
- Users belong to exactly one tenant; **email is unique per tenant**, so the
  same person can exist in multiple companies.
- Passwords hashed with **bcrypt** (cost 12).
- Sessions are **signed JWTs** (HS256, `jose`) stored in an **httpOnly,
  SameSite=Lax** cookie. The token carries `userId`, `tenantId`, `tenantSlug`,
  role keys and `isTenantOwner`, so most authorization checks need no DB round
  trip.
- `src/middleware.ts` gates `/dashboard`, `/training`, `/people`, `/settings`.

### Authorization (RBAC)
- **Permission catalog** (`src/lib/rbac.ts`) — global, code-referenced keys
  such as `training.program.create`, `user.manage`, `report.view`.
- **System roles**, cloned into each tenant at provisioning:
  - `admin` — Administrator (all permissions)
  - `hr_manager` — HR / L&D Manager
  - `manager` — Line Manager
  - `learner` — Employee
- Grants are stored in the DB (`role_permissions`) *and* mirrored in code as the
  canonical default bundle. Tenant owners implicitly get everything.
- Checks: `can(session, "training.program.create")` in server components and
  server actions.

---

## 4. Data model (Phase 1)

```
Tenant ─┬─ Branch ──┬─ Department ──┬─ User ─┬─ UserRole ─ Role ─ RolePermission ─ Permission(global)
        │           │               │        ├─ Enrollment ─ TrainingProgram ─ Competency ─ CompetencyCategory
        │           │               │        └─ (manager self-relation)
        └─ AuditLog                          
```

Key tables (see `prisma/schema.prisma`):
- **Tenant** — company; `slug`, `industry`, `status` (trial/active/suspended/
  cancelled), `plan` (starter/growth/enterprise).
- **Branch / Department** — org structure.
- **User** — employee; department, branch, manager hierarchy, status.
- **Role / Permission / RolePermission / UserRole** — RBAC.
- **CompetencyCategory / Competency** — the competency framework.
- **TrainingProgram / Enrollment** — the first end-to-end module.
- **AuditLog** — tenant-scoped activity trail.

Enums encode domain vocabulary (industries, program levels, statuses) so the
same schema serves engineering consultancies, contractors and logistics firms.

---

## 5. Application architecture

- **Next.js App Router** with React Server Components: pages fetch tenant-scoped
  data directly on the server via `withTenant`, so tenant context is bound to
  the request and never trusted from the client.
- **Server Actions** for mutations (login, create program, enroll, update
  progress) — validated with **zod**, permission-checked with `can()`.
- **Route groups**: `(app)` holds the authenticated shell (sidebar, topbar);
  `login` and the landing page are public.
- **No client-side data fetching of tenant data** — the session cookie + server
  components keep tenant boundaries server-side.

---

## 6. Security posture

- Tenant isolation enforced in the database (defence in depth over app code).
- App connects as a least-privilege, non-superuser role.
- Passwords bcrypt-hashed; sessions signed and httpOnly.
- All mutations validated and authorized server-side.
- Audit log for sensitive actions.
- Secrets via environment variables; `.env` git-ignored.

**Hardening planned:** rate limiting on login, refresh-token rotation, SSO/SAML
& OIDC for enterprise customers, per-tenant encryption options, and a privileged
platform-admin plane separated from tenant traffic.

---

## 7. Roadmap

Phase 1 (this repo) is the foundation. Planned modules, each plugging into the
same tenancy + RBAC core:

1. **People management** — invitations, bulk import, org chart, profiles.
2. **Competency assessments** — self/manager/360 ratings, competency growth over
   time, skill-gap analysis.
3. **Learning paths & Corporate University** — sequenced programs, internal
   certifications with expiry and renewal.
4. **Leadership & succession** — high-potential identification, 9-box,
   succession pipelines for critical roles.
5. **Analytics & reporting** — workforce dashboards, readiness, retention risk,
   ROI of development spend.
6. **AI workforce insights** — skill-gap detection, personalized development
   recommendations, and role-readiness scoring (built on the latest Claude
   models).
7. **Billing & plans** — subscription tiers, seat management, usage limits.
8. **Platform admin plane** — cross-tenant provisioning, support, and
   observability, isolated from tenant traffic.
9. **Localization** — full Arabic/English (RTL) support for the GCC market.

---

## 8. Operational notes

- **Migrations:** Phase 1 uses `prisma db push` + `rls.sql` for speed. For
  production, switch to `prisma migrate` and include the RLS statements as a SQL
  migration so policies are versioned with the schema.
- **Connection pooling:** because tenant context is transaction-local, BCAP is
  safe behind PgBouncer in transaction mode.
- **Backups & isolation upgrades:** the `withTenant` abstraction means moving a
  large customer to a dedicated database later requires no application rewrite.

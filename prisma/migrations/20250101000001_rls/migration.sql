-- ===========================================================================
-- BCAP — Row-Level Security (RLS) tenant isolation
-- ---------------------------------------------------------------------------
-- Run this AFTER the Prisma schema has been applied (migrate deploy / db push).
--   psql "$DATABASE_URL" -f prisma/rls.sql
--
-- How it works:
--   * Every request opens a transaction and runs
--       SELECT set_config('app.current_tenant', '<tenantId>', true);
--     (see src/lib/tenant-db.ts). The `true` makes it transaction-local.
--   * Each policy compares the row's tenant_id ("tenantId" column) against
--     current_setting('app.current_tenant'). Rows for other tenants are
--     invisible AND unwritable — even if application code has a bug.
--   * The app MUST connect as a NON-superuser, non-BYPASSRLS role, otherwise
--     PostgreSQL skips policy checks entirely.
--
-- Platform-admin / cross-tenant operations (provisioning a new company, billing)
-- run through a separate privileged path that sets app.current_tenant to the
-- target tenant explicitly, or uses a role granted BYPASSRLS.
-- ===========================================================================

-- Helper: current tenant from the session/transaction variable.
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS text AS $$
  SELECT nullif(current_setting('app.current_tenant', true), '')
$$ LANGUAGE sql STABLE;

DO $$
DECLARE
  t text;
  tenant_tables text[] := ARRAY[
    'branches',
    'departments',
    'users',
    'roles',
    'competency_categories',
    'competencies',
    'competency_ratings',
    'training_programs',
    'enrollments',
    'certifications',
    'certification_awards',
    'critical_roles',
    'succession_candidates',
    'audit_logs'
  ];
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);

    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);
    EXECUTE format($p$
      CREATE POLICY tenant_isolation ON %I
      USING ("tenantId" = current_tenant_id())
      WITH CHECK ("tenantId" = current_tenant_id());
    $p$, t);
  END LOOP;
END $$;

-- The `tenants` table itself is readable/writable only through the privileged
-- provisioning path; it is NOT protected by the per-tenant policy above because
-- resolving a tenant by slug must happen BEFORE a tenant context exists.
-- Lock it down at the grant level instead (see docs/ARCHITECTURE.md).

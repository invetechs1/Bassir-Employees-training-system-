-- Bring sso_connections under Row-Level Security. It is tenant-scoped and holds
-- each tenant's (now-encrypted) OIDC client secret; all app access to it now
-- runs inside a tenant context (withTenant), so RLS can enforce isolation as a
-- defense-in-depth backstop like every other tenant table.
DO $$
BEGIN
  EXECUTE 'ALTER TABLE "sso_connections" ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE "sso_connections" FORCE ROW LEVEL SECURITY';
  EXECUTE 'DROP POLICY IF EXISTS tenant_isolation ON "sso_connections"';
  EXECUTE $p$
    CREATE POLICY tenant_isolation ON "sso_connections"
    USING ("tenantId" = current_tenant_id())
    WITH CHECK ("tenantId" = current_tenant_id());
  $p$;
END $$;

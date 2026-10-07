-- Job positions + position→course mapping.
-- A position carries a default set of training courses; assigning an employee a
-- position pre-selects those courses for them (adjustable per employee).

-- Positions (managed list per company).
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "positions_tenantId_title_key" ON "positions"("tenantId", "title");
CREATE INDEX "positions_tenantId_idx" ON "positions"("tenantId");

ALTER TABLE "positions" ADD CONSTRAINT "positions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Position → course mapping (the position's default course set).
CREATE TABLE "position_programs" (
    "tenantId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "position_programs_pkey" PRIMARY KEY ("positionId", "programId")
);

CREATE INDEX "position_programs_tenantId_idx" ON "position_programs"("tenantId");
CREATE INDEX "position_programs_programId_idx" ON "position_programs"("programId");

ALTER TABLE "position_programs" ADD CONSTRAINT "position_programs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "position_programs" ADD CONSTRAINT "position_programs_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "position_programs" ADD CONSTRAINT "position_programs_programId_fkey" FOREIGN KEY ("programId") REFERENCES "training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Link an employee to a position (nullable; set null if the position is removed).
ALTER TABLE "users" ADD COLUMN "positionId" TEXT;
CREATE INDEX "users_positionId_idx" ON "users"("positionId");
ALTER TABLE "users" ADD CONSTRAINT "users_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS (tenant isolation), consistent with every other tenant-scoped table.
DO $$
DECLARE
  t text;
  tenant_tables text[] := ARRAY['positions', 'position_programs'];
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

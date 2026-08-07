-- Course completion certificates (auto-issued when a learner finishes a course).
CREATE TABLE "course_certificates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "score" INTEGER,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_certificates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "course_certificates_serial_key" ON "course_certificates"("serial");
CREATE UNIQUE INDEX "course_certificates_programId_userId_key" ON "course_certificates"("programId", "userId");
CREATE INDEX "course_certificates_tenantId_idx" ON "course_certificates"("tenantId");
CREATE INDEX "course_certificates_userId_idx" ON "course_certificates"("userId");

ALTER TABLE "course_certificates" ADD CONSTRAINT "course_certificates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_certificates" ADD CONSTRAINT "course_certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_certificates" ADD CONSTRAINT "course_certificates_programId_fkey" FOREIGN KEY ("programId") REFERENCES "training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS (tenant isolation), consistent with every other tenant-scoped table.
DO $$
BEGIN
  EXECUTE 'ALTER TABLE "course_certificates" ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE "course_certificates" FORCE ROW LEVEL SECURITY';
  EXECUTE 'DROP POLICY IF EXISTS tenant_isolation ON "course_certificates"';
  EXECUTE $p$
    CREATE POLICY tenant_isolation ON "course_certificates"
    USING ("tenantId" = current_tenant_id())
    WITH CHECK ("tenantId" = current_tenant_id());
  $p$;
END $$;

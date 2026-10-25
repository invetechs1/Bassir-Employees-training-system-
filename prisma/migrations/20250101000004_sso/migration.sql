-- Per-company OpenID Connect single sign-on.
CREATE TABLE "sso_connections" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "autoProvision" BOOLEAN NOT NULL DEFAULT true,
    "defaultRoleKey" TEXT NOT NULL DEFAULT 'learner',
    "allowedDomain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sso_connections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sso_connections_tenantId_key" ON "sso_connections"("tenantId");

ALTER TABLE "sso_connections" ADD CONSTRAINT "sso_connections_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

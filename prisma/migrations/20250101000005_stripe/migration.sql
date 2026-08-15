-- Stripe billing fields on tenants.
ALTER TABLE "tenants" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "tenants" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "tenants" ADD COLUMN "subscriptionStatus" TEXT;

CREATE UNIQUE INDEX "tenants_stripeCustomerId_key" ON "tenants"("stripeCustomerId");
CREATE UNIQUE INDEX "tenants_stripeSubscriptionId_key" ON "tenants"("stripeSubscriptionId");

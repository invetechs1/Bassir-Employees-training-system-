-- Self-service password-reset and email-verification state on users.
ALTER TABLE "users" ADD COLUMN "resetTokenHash" TEXT;
ALTER TABLE "users" ADD COLUMN "resetExpiresAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "verifyTokenHash" TEXT;
ALTER TABLE "users" ADD COLUMN "verifyExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "users_resetTokenHash_key" ON "users"("resetTokenHash");
CREATE UNIQUE INDEX "users_verifyTokenHash_key" ON "users"("verifyTokenHash");

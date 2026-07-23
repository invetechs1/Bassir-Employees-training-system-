-- Email-invitation state on users.
ALTER TABLE "users" ADD COLUMN "inviteTokenHash" TEXT;
ALTER TABLE "users" ADD COLUMN "inviteExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "users_inviteTokenHash_key" ON "users"("inviteTokenHash");

import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { hashInviteToken } from "@/lib/invite-token";
import { AcceptForm } from "./accept-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  let invitee: { firstName: string; email: string } | null = null;
  if (tenant) {
    invitee = await withTenant(tenant.id, async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          inviteTokenHash: hashInviteToken(token),
          status: "INVITED",
          inviteExpiresAt: { gt: new Date() },
        },
        select: { firstName: true, email: true },
      });
      return user;
    });
  }

  const valid = Boolean(tenant && invitee);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            B
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            {valid ? `Welcome, ${invitee!.firstName}` : "Invitation unavailable"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {valid
              ? `Join ${tenant!.name} on BCAP — choose a password to get started.`
              : "This invitation link is invalid or has expired."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {valid ? (
            <AcceptForm slug={slug} token={token} email={invitee!.email} />
          ) : (
            <p className="text-sm text-slate-500">
              Please ask an administrator at your company to send you a new
              invitation, then use the latest link.
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Powered by Bassir Technology
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { hashToken } from "@/lib/reset-token";
import { getLocale, translator } from "@/lib/i18n";

// Consuming the token is a state change, so this page must never be cached or
// statically prerendered.
export const dynamic = "force-dynamic";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const t = translator(await getLocale());

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  let ok = false;
  if (tenant) {
    ok = await withTenant(tenant.id, async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          verifyTokenHash: hashToken(token),
          verifyExpiresAt: { gt: new Date() },
        },
        select: { id: true },
      });
      if (!user) return false;
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: new Date(),
          verifyTokenHash: null,
          verifyExpiresAt: null,
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          actorId: user.id,
          action: "user.email.verified",
          entity: "User",
          entityId: user.id,
        },
      });
      return true;
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
          B
        </div>
        <h1 className="text-xl font-semibold text-slate-900">
          {ok ? t("verify.okTitle") : t("verify.badTitle")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {ok ? t("verify.okBody") : t("verify.badBody")}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {t("verify.continue")}
        </Link>
      </div>
    </main>
  );
}

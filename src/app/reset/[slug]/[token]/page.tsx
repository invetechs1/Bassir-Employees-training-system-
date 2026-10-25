import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { hashToken } from "@/lib/reset-token";
import { getLocale, translator } from "@/lib/i18n";
import { ResetForm } from "./reset-form";

export default async function ResetPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const t = translator(await getLocale());

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  let valid = false;
  if (tenant) {
    valid = await withTenant(tenant.id, async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          resetTokenHash: hashToken(token),
          status: "ACTIVE",
          resetExpiresAt: { gt: new Date() },
        },
        select: { id: true },
      });
      return Boolean(user);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            B
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            {valid ? t("reset.title") : t("reset.invalidTitle")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {valid ? t("reset.subtitle") : t("reset.invalidBody")}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {valid ? (
            <ResetForm
              slug={slug}
              token={token}
              labels={{
                password: t("reset.password"),
                hint: t("reset.hint"),
                confirm: t("reset.confirm"),
                submit: t("reset.submit"),
                submitting: t("reset.submitting"),
              }}
            />
          ) : (
            <Link
              href="/forgot"
              className="block w-full rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
            >
              {t("reset.requestNew")}
            </Link>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {t("poweredByBcap")} ·{" "}
          <Link href="/login" className="underline hover:text-slate-600">
            {t("forgot.backToLogin")}
          </Link>
        </p>
      </div>
    </main>
  );
}

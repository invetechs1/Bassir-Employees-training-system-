import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { prisma } from "@/lib/prisma";
import { getLocale, translator } from "@/lib/i18n";
import { pickText } from "@/lib/content";
import { brandingOf } from "@/lib/branding";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ user?: string }>;
}) {
  const { id } = await params;
  const { user: userParam } = await searchParams;
  const session = await requireSession();
  const locale = await getLocale();
  const t = translator(locale);

  // Managers/HR (report.view) may view any employee's certificate; everyone
  // else can only view their own.
  const canViewOthers = can(session, "report.view");
  const targetUserId =
    userParam && canViewOthers ? userParam : session.userId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { name: true, brandColor: true, logoUrl: true },
  });
  const brand = brandingOf(tenant ?? { name: "BCAP" });

  const data = await withTenant(session.tenantId, async (tx) => {
    const cert = await tx.courseCertificate.findFirst({
      where: { programId: id, userId: targetUserId },
      include: {
        program: true,
        user: { select: { firstName: true, lastName: true } },
      },
    });
    return cert;
  });

  if (!data) {
    return (
      <div className="mx-auto max-w-xl space-y-4 text-center">
        <p className="text-sm text-slate-500">{t("cert.notEarned")}</p>
        <Link
          href={`/training/${id}`}
          className="inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          ← {t("course.backToProgram")}
        </Link>
      </div>
    );
  }

  const fullName = `${data.user.firstName} ${data.user.lastName}`.trim();
  const courseTitle = pickText(data.program.title, data.program.titleAr, locale);
  const issued = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(data.issuedAt);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/training/${id}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← {t("course.backToProgram")}
        </Link>
        <PrintButton label={t("cert.print")} />
      </div>

      {/* The certificate itself. */}
      <div
        className="relative overflow-hidden rounded-2xl border bg-white p-10 text-center shadow-sm print:border-0 print:shadow-none"
        style={{ borderColor: brand.color }}
      >
        <div
          className="absolute inset-x-0 top-0 h-2"
          style={{ backgroundColor: brand.color }}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          {brand.name}
        </p>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">
          {t("cert.title")}
        </h1>
        <p className="mt-6 text-sm text-slate-500">{t("cert.presentedTo")}</p>
        <p className="mt-1 text-3xl font-bold" style={{ color: brand.color }}>
          {fullName}
        </p>
        <p className="mt-6 text-sm text-slate-500">{t("cert.forCompleting")}</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{courseTitle}</p>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-slate-600">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {t("cert.date")}
            </p>
            <p className="font-medium">{issued}</p>
          </div>
          {data.score !== null ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {t("cert.score")}
              </p>
              <p className="font-medium">{data.score}%</p>
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {t("cert.serial")}
            </p>
            <p className="font-mono font-medium">{data.serial}</p>
          </div>
        </div>

        <p className="mt-8 text-[11px] text-slate-400">{t("cert.footer")}</p>
      </div>
    </div>
  );
}

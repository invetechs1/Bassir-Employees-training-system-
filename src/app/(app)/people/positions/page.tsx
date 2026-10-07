import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { withTenant } from "@/lib/tenant-db";
import { getLocale, translator } from "@/lib/i18n";
import { pickText } from "@/lib/content";
import {
  PositionsClient,
  type PositionRow,
  type ProgramOption,
} from "./positions-client";

export const dynamic = "force-dynamic";

export default async function PositionsPage() {
  const session = await requirePermission("user.manage");
  const locale = await getLocale();
  const t = translator(locale);

  const { positions, programs } = await withTenant(
    session.tenantId,
    async (tx) => {
      const [positions, programs] = await Promise.all([
        tx.position.findMany({
          orderBy: { title: "asc" },
          include: {
            programs: { select: { programId: true } },
            _count: { select: { users: true } },
          },
        }),
        tx.trainingProgram.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, titleAr: true },
        }),
      ]);
      return { positions, programs };
    }
  );

  const positionRows: PositionRow[] = positions.map((p) => ({
    id: p.id,
    title: p.title,
    titleAr: p.titleAr ?? "",
    programIds: p.programs.map((pp) => pp.programId),
    memberCount: p._count.users,
  }));

  const programOptions: ProgramOption[] = programs.map((p) => ({
    id: p.id,
    title: pickText(p.title, p.titleAr, locale),
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/people" className="text-sm text-slate-500 hover:text-slate-700">
          ← {t("nav.People")}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          {t("pos.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("pos.subtitle")}</p>
      </div>

      <PositionsClient
        positions={positionRows}
        programs={programOptions}
        labels={{
          addTitle: t("pos.addTitle"),
          addHint: t("pos.addHint"),
          titleEn: t("pos.titleEn"),
          titleAr: t("pos.titleAr"),
          create: t("pos.create"),
          creating: t("pos.creating"),
          none: t("pos.none"),
          members: t("pos.members"),
          coursesLabel: t("pos.coursesLabel"),
          coursesHint: t("pos.coursesHint"),
          noCourses: t("pos.noCourses"),
          saveCourses: t("pos.saveCourses"),
          assignNow: t("pos.assignNow"),
          assignHint: t("pos.assignHint"),
          rename: t("pos.rename"),
          save: t("pos.save"),
          delete: t("pos.delete"),
          confirmDelete: t("pos.confirmDelete"),
        }}
      />
    </div>
  );
}

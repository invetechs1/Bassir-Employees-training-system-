import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { getLocale, translator } from "@/lib/i18n";
import { pickText } from "@/lib/content";
import { canEmployeeAccessProgram } from "@/lib/assign";
import { enrollSelfAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const locale = await getLocale();
  const t = translator(locale);

  const data = await withTenant(session.tenantId, async (tx) => {
    const program = await tx.trainingProgram.findFirst({
      where: { id },
      include: {
        modules: {
          orderBy: { orderIndex: "asc" },
          include: { lessons: { orderBy: { orderIndex: "asc" } } },
        },
      },
    });
    if (!program) return null;

    // Employees may only open courses in their department's track or ones
    // assigned to them by name; managers / HR can open anything.
    if (
      !can(session, "training.program.manage") &&
      !(await canEmployeeAccessProgram(tx, session.userId, program))
    ) {
      return null;
    }

    const enrollment = await tx.enrollment.findFirst({
      where: { programId: program.id, userId: session.userId },
    });
    const completions = await tx.lessonCompletion.findMany({
      where: {
        userId: session.userId,
        lesson: { module: { programId: program.id } },
      },
      select: { lessonId: true },
    });
    return { program, enrollment, completedIds: new Set(completions.map((c) => c.lessonId)) };
  });

  if (!data) notFound();
  const { program, enrollment, completedIds } = data;

  const lessons = program.modules.flatMap((m) => m.lessons);
  const total = lessons.length;
  const done = lessons.filter((l) => completedIds.has(l.id)).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : enrollment?.progress ?? 0;
  const firstIncomplete = lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0];
  const enrolled = Boolean(enrollment);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/training" className="text-sm text-slate-500 hover:text-slate-700">
          ← {t("nav.Training Programs")}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {program.category ? (
            <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {t(`track.${program.category}`) === `track.${program.category}`
                ? program.category
                : t(`track.${program.category}`)}
            </span>
          ) : null}
          <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {t(`level.${program.level}`)}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {pickText(program.title, program.titleAr, locale)}
        </h1>
        {pickText(program.description, program.descriptionAr, locale) ? (
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            {pickText(program.description, program.descriptionAr, locale)}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-slate-400">
          {program.durationHours}
          {t("training.hours")} · {total} {t("course.lessons")}
        </p>
      </div>

      {/* Progress + primary action */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            {t("course.yourProgress")}
          </span>
          <span className="text-sm font-semibold text-brand-700">{progress}%</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {firstIncomplete ? (
            <Link
              href={`/training/${program.id}/${firstIncomplete.id}`}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {done === 0 ? t("course.start") : t("course.continue")}
            </Link>
          ) : null}
          {!enrolled ? (
            <form action={enrollSelfAction}>
              <input type="hidden" name="programId" value={program.id} />
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t("training.enroll")}
              </button>
            </form>
          ) : null}
          {total > 0 && done === total ? (
            <Link
              href={`/training/${program.id}/certificate`}
              className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              🎓 {t("cert.view")}
            </Link>
          ) : null}
        </div>
      </div>

      {/* Modules & lessons */}
      <div className="space-y-6">
        {program.modules.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            {t("course.noContent")}
          </p>
        ) : (
          program.modules.map((mod, mi) => (
            <section key={mod.id}>
              <h2 className="mb-3 text-sm font-semibold text-slate-800">
                {mi + 1}. {pickText(mod.title, mod.titleAr, locale)}
              </h2>
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {mod.lessons.map((lesson) => {
                  const isDone = completedIds.has(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/training/${program.id}/${lesson.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                              isDone
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-slate-300 text-transparent"
                            }`}
                            aria-hidden
                          >
                            ✓
                          </span>
                          <span className="text-sm text-slate-700">
                            {pickText(lesson.title, lesson.titleAr, locale)}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                            {t(`ltype.${lesson.type}`)}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {lesson.durationMinutes} {t("course.min")}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

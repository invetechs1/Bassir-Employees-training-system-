import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { withTenant } from "@/lib/tenant-db";
import { getLocale, translator } from "@/lib/i18n";
import { pickText } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { toggleLessonAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
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
    const completion = await tx.lessonCompletion.findUnique({
      where: { lessonId_userId: { lessonId, userId: session.userId } },
    });
    return { program, done: Boolean(completion) };
  });

  if (!data) notFound();
  const { program, done } = data;

  const ordered = program.modules.flatMap((m) => m.lessons);
  const index = ordered.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();
  const lesson = ordered[index];
  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index < ordered.length - 1 ? ordered[index + 1] : null;

  const body = pickText(lesson.content, lesson.contentAr, locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/training/${program.id}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← {pickText(program.title, program.titleAr, locale)}
        </Link>
        <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
          {t("course.lesson")} {index + 1} / {ordered.length}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          {pickText(lesson.title, lesson.titleAr, locale)}
        </h1>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-6">
        {lesson.type === "TEXT" ? (
          <div
            className="space-y-3 text-sm leading-relaxed text-slate-700 [&_h2]:mt-5 [&_h2]:text-lg [&_h3]:mt-4 [&_h3]:text-base [&_p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {lesson.type === "VIDEO" ? t("course.videoLesson") : t("course.resourceLesson")}
            </p>
            <a
              href={body}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {lesson.type === "VIDEO" ? t("course.watch") : t("course.open")} ↗
            </a>
            <p className="break-all text-xs text-slate-400">{body}</p>
          </div>
        )}
      </article>

      {/* Complete toggle */}
      <form action={toggleLessonAction} className="flex items-center gap-3">
        <input type="hidden" name="lessonId" value={lesson.id} />
        <input type="hidden" name="programId" value={program.id} />
        <button
          type="submit"
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            done
              ? "border border-slate-300 text-slate-600 hover:bg-slate-50"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          {done ? t("course.markIncomplete") : t("course.markComplete")}
        </button>
        {done ? (
          <span className="text-sm text-brand-700">✓ {t("estatus.COMPLETED")}</span>
        ) : null}
      </form>

      {/* Prev / next */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        {prev ? (
          <Link
            href={`/training/${program.id}/${prev.id}`}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← {t("course.previous")}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/training/${program.id}/${next.id}`}
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            {t("course.next")} →
          </Link>
        ) : (
          <Link
            href={`/training/${program.id}`}
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            {t("course.backToProgram")} →
          </Link>
        )}
      </div>
    </div>
  );
}

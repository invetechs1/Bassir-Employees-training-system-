import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { withTenant } from "@/lib/tenant-db";
import { getLocale, translator } from "@/lib/i18n";
import { pickText } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { toggleLessonAction } from "../../actions";
import { QuizForm, type QuizFormQuestion } from "./quiz-form";

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
    // Load quiz questions + options for a quiz lesson (correctness stripped
    // before it reaches the client).
    const quiz = await tx.lesson.findFirst({
      where: { id: lessonId, type: "QUIZ" },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          include: { options: { orderBy: { orderIndex: "asc" } } },
        },
      },
    });
    const bestAttempt = quiz
      ? await tx.quizAttempt.findFirst({
          where: { lessonId, userId: session.userId },
          orderBy: [{ passed: "desc" }, { score: "desc" }],
        })
      : null;
    return { program, done: Boolean(completion), quiz, bestAttempt };
  });

  if (!data) notFound();
  const { program, done, quiz, bestAttempt } = data;

  const ordered = program.modules.flatMap((m) => m.lessons);
  const index = ordered.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();
  const lesson = ordered[index];
  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index < ordered.length - 1 ? ordered[index + 1] : null;

  const body = pickText(lesson.content, lesson.contentAr, locale);
  const isQuiz = lesson.type === "QUIZ";

  const quizQuestions: QuizFormQuestion[] = (quiz?.questions ?? []).map((q) => ({
    id: q.id,
    prompt: pickText(q.prompt, q.promptAr, locale),
    options: q.options.map((o) => ({
      id: o.id,
      text: pickText(o.text, o.textAr, locale),
    })),
  }));

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
          {isQuiz ? ` · ${t("ltype.QUIZ")}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          {pickText(lesson.title, lesson.titleAr, locale)}
        </h1>
      </div>

      {isQuiz ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {t("quiz.intro")} <strong>{lesson.passMark}%</strong>.
          </p>
          {done ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              ✓ {t("quiz.alreadyPassed")}
              {bestAttempt ? ` (${bestAttempt.score}%)` : ""}
            </p>
          ) : null}
          {quizQuestions.length > 0 ? (
            <QuizForm
              lessonId={lesson.id}
              programId={program.id}
              questions={quizQuestions}
              passMark={lesson.passMark}
              labels={{
                submit: t("quiz.submit"),
                retake: t("quiz.retake"),
                passed: t("quiz.passed"),
                failed: t("quiz.failed"),
                scoreLabel: t("quiz.score"),
                passMarkLabel: t("quiz.passMark"),
                correct: t("quiz.correct"),
                incorrect: t("quiz.incorrect"),
                explanation: t("quiz.explanation"),
                chooseAll: t("quiz.chooseAll"),
              }}
            />
          ) : (
            <p className="text-sm text-slate-500">{t("course.noContent")}</p>
          )}
        </div>
      ) : (
        <>
          <article className="rounded-xl border border-slate-200 bg-white p-6">
            {lesson.type === "TEXT" ? (
              <div
                className="space-y-3 text-sm leading-relaxed text-slate-700 [&_h2]:mt-5 [&_h2]:text-lg [&_h3]:mt-4 [&_h3]:text-base [&_p]:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
              />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  {lesson.type === "VIDEO"
                    ? t("course.videoLesson")
                    : t("course.resourceLesson")}
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

          {/* Complete toggle (reading/resource lessons only) */}
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
              <span className="text-sm text-brand-700">
                ✓ {t("estatus.COMPLETED")}
              </span>
            ) : null}
          </form>
        </>
      )}

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

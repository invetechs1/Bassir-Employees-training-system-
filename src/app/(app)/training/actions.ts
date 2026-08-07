"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { enrollmentUpdateFor } from "@/lib/progress";
import { gradeQuiz } from "@/lib/quiz";
import { getLocale } from "@/lib/i18n";
import { pickText } from "@/lib/content";

/**
 * Recompute an enrollment's progress from the learner's completed lessons in a
 * program. Shared by the lesson toggle and the quiz submission.
 */
async function recomputeEnrollment(
  tx: Prisma.TransactionClient,
  tenantId: string,
  programId: string,
  userId: string
): Promise<void> {
  const [total, completed] = await Promise.all([
    tx.lesson.count({ where: { module: { programId } } }),
    tx.lessonCompletion.count({
      where: { userId, lesson: { module: { programId } } },
    }),
  ]);
  const update = enrollmentUpdateFor(completed, total);
  await tx.enrollment.update({
    where: { programId_userId: { programId, userId } },
    data: {
      progress: update.progress,
      status: update.status,
      completedAt: update.completed ? new Date() : null,
    },
  });
}

const CreateProgramSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(160),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  level: z.enum(["FOUNDATION", "INTERMEDIATE", "ADVANCED", "LEADERSHIP"]),
  durationHours: z.coerce.number().int().min(0).max(1000),
  publish: z.union([z.literal("on"), z.null()]).optional(),
});

export interface ActionState {
  error?: string;
  ok?: boolean;
}

export async function createProgramAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  if (!can(session, "training.program.create")) {
    return { error: "You do not have permission to create programs." };
  }

  const parsed = CreateProgramSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    level: formData.get("level"),
    durationHours: formData.get("durationHours"),
    publish: formData.get("publish"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { title, description, level, durationHours, publish } = parsed.data;

  await withTenant(session.tenantId, async (tx) => {
    const program = await tx.trainingProgram.create({
      data: {
        tenantId: session.tenantId,
        title,
        description: description || null,
        level,
        durationHours,
        status: publish === "on" ? "PUBLISHED" : "DRAFT",
        authorId: session.userId,
      },
    });
    await tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "training.program.create",
        entity: "TrainingProgram",
        entityId: program.id,
      },
    });
  });

  revalidatePath("/training");
  return { ok: true };
}

const EnrollSchema = z.object({ programId: z.string().min(1) });

export async function enrollSelfAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!can(session, "training.enroll.self")) return;

  const parsed = EnrollSchema.safeParse({
    programId: formData.get("programId"),
  });
  if (!parsed.success) return;

  await withTenant(session.tenantId, async (tx) => {
    const program = await tx.trainingProgram.findFirst({
      where: { id: parsed.data.programId, status: "PUBLISHED" },
    });
    if (!program) return;

    await tx.enrollment.upsert({
      where: {
        programId_userId: {
          programId: program.id,
          userId: session.userId,
        },
      },
      create: {
        tenantId: session.tenantId,
        programId: program.id,
        userId: session.userId,
      },
      update: {},
    });
  });

  revalidatePath("/training");
}

const ToggleLessonSchema = z.object({ lessonId: z.string().min(1) });

/**
 * Mark a lesson complete / incomplete for the current user. Enrollment is
 * created on first completion, and the enrollment's progress is RECOMPUTED from
 * the number of completed lessons in the program (never entered by hand).
 */
export async function toggleLessonAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!can(session, "training.enroll.self")) return;

  const parsed = ToggleLessonSchema.safeParse({
    lessonId: formData.get("lessonId"),
  });
  if (!parsed.success) return;

  await withTenant(session.tenantId, async (tx) => {
    const lesson = await tx.lesson.findFirst({
      where: { id: parsed.data.lessonId },
      include: { module: { select: { programId: true } } },
    });
    if (!lesson) return;
    const programId = lesson.module.programId;

    // Ensure the learner is enrolled (opening a course and completing a lesson
    // implies enrollment).
    await tx.enrollment.upsert({
      where: { programId_userId: { programId, userId: session.userId } },
      create: { tenantId: session.tenantId, programId, userId: session.userId },
      update: {},
    });

    const existing = await tx.lessonCompletion.findUnique({
      where: {
        lessonId_userId: { lessonId: lesson.id, userId: session.userId },
      },
    });
    if (existing) {
      await tx.lessonCompletion.delete({ where: { id: existing.id } });
    } else {
      await tx.lessonCompletion.create({
        data: {
          tenantId: session.tenantId,
          lessonId: lesson.id,
          userId: session.userId,
        },
      });
    }

    // Recompute progress from completions across the whole program.
    await recomputeEnrollment(tx, session.tenantId, programId, session.userId);
  });

  revalidatePath("/training");
  revalidatePath(`/training/${formData.get("programId") ?? ""}`);
}

export interface QuizSubmitState {
  error?: string;
  result?: {
    score: number;
    passed: boolean;
    total: number;
    correctCount: number;
    passMark: number;
    perQuestion: {
      questionId: string;
      correct: boolean;
      correctOptionId: string;
      explanation: string | null;
    }[];
  };
}

/**
 * Grade a quiz submission, record the attempt, and — if the learner passed —
 * complete the lesson and recompute the enrollment progress. Answers arrive as
 * `answer_<questionId>` = optionId form fields.
 */
export async function submitQuizAction(
  _prev: QuizSubmitState,
  formData: FormData
): Promise<QuizSubmitState> {
  const session = await requireSession();
  if (!can(session, "training.enroll.self")) {
    return { error: "You cannot take this quiz." };
  }
  const locale = await getLocale();
  const lessonId = String(formData.get("lessonId") ?? "");
  if (!lessonId) return { error: "Missing quiz." };

  return withTenant(session.tenantId, async (tx) => {
    const lesson = await tx.lesson.findFirst({
      where: { id: lessonId, type: "QUIZ" },
      include: {
        module: { select: { programId: true } },
        questions: { include: { options: true } },
      },
    });
    if (!lesson || lesson.questions.length === 0) {
      return { error: "Quiz not found." };
    }
    const programId = lesson.module.programId;

    const answers: Record<string, string> = {};
    for (const q of lesson.questions) {
      const chosen = formData.get(`answer_${q.id}`);
      if (typeof chosen === "string" && chosen) answers[q.id] = chosen;
    }

    const gradable = lesson.questions.map((q) => ({
      id: q.id,
      correctOptionId: q.options.find((o) => o.isCorrect)?.id ?? "",
    }));
    const graded = gradeQuiz(gradable, answers, lesson.passMark);

    await tx.quizAttempt.create({
      data: {
        tenantId: session.tenantId,
        lessonId: lesson.id,
        userId: session.userId,
        score: graded.score,
        passed: graded.passed,
        answers: JSON.stringify(answers),
      },
    });

    // Ensure enrollment exists; on pass, mark the lesson complete (idempotent).
    await tx.enrollment.upsert({
      where: { programId_userId: { programId, userId: session.userId } },
      create: { tenantId: session.tenantId, programId, userId: session.userId },
      update: {},
    });
    if (graded.passed) {
      await tx.lessonCompletion.upsert({
        where: {
          lessonId_userId: { lessonId: lesson.id, userId: session.userId },
        },
        create: {
          tenantId: session.tenantId,
          lessonId: lesson.id,
          userId: session.userId,
        },
        update: {},
      });
    }
    await recomputeEnrollment(tx, session.tenantId, programId, session.userId);

    const perQuestion = lesson.questions.map((q) => ({
      questionId: q.id,
      correct: graded.correctByQuestion[q.id] ?? false,
      correctOptionId: q.options.find((o) => o.isCorrect)?.id ?? "",
      explanation: pickText(q.explanation, q.explanationAr, locale) || null,
    }));

    revalidatePath("/training");
    revalidatePath(`/training/${programId}`);
    return {
      result: {
        score: graded.score,
        passed: graded.passed,
        total: graded.total,
        correctCount: graded.correctCount,
        passMark: lesson.passMark,
        perQuestion,
      },
    };
  });
}

const ProgressSchema = z.object({
  enrollmentId: z.string().min(1),
  progress: z.coerce.number().int().min(0).max(100),
});

export async function updateProgressAction(formData: FormData): Promise<void> {
  const session = await requireSession();

  const parsed = ProgressSchema.safeParse({
    enrollmentId: formData.get("enrollmentId"),
    progress: formData.get("progress"),
  });
  if (!parsed.success) return;
  const { enrollmentId, progress } = parsed.data;

  await withTenant(session.tenantId, async (tx) => {
    const enrollment = await tx.enrollment.findFirst({
      where: { id: enrollmentId },
    });
    if (!enrollment) return;

    // Learners may only update their own enrollment; managers/HR may update any.
    const ownsIt = enrollment.userId === session.userId;
    if (!ownsIt && !can(session, "training.progress.manage")) return;

    const completed = progress >= 100;
    await tx.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress,
        status: completed
          ? "COMPLETED"
          : progress > 0
            ? "IN_PROGRESS"
            : "ENROLLED",
        completedAt: completed ? new Date() : null,
      },
    });
  });

  revalidatePath("/training");
}

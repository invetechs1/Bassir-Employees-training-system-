"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { enrollmentUpdateFor } from "@/lib/progress";

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
    const [total, completed] = await Promise.all([
      tx.lesson.count({ where: { module: { programId } } }),
      tx.lessonCompletion.count({
        where: { userId: session.userId, lesson: { module: { programId } } },
      }),
    ]);
    const update = enrollmentUpdateFor(completed, total);
    await tx.enrollment.update({
      where: { programId_userId: { programId, userId: session.userId } },
      data: {
        progress: update.progress,
        status: update.status,
        completedAt: update.completed ? new Date() : null,
      },
    });
  });

  revalidatePath("/training");
  revalidatePath(`/training/${formData.get("programId") ?? ""}`);
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

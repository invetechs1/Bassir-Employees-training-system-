"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { assignPositionMembers } from "@/lib/assign";

const CreateSchema = z.object({
  title: z.string().trim().min(1, "Position title is required").max(120),
  titleAr: z.string().trim().max(120).optional().or(z.literal("")),
});

export interface PositionState {
  error?: string;
  ok?: boolean;
}

/** Create a new job position for the company. */
export async function createPositionAction(
  _prev: PositionState,
  formData: FormData
): Promise<PositionState> {
  const session = await requireSession();
  if (!can(session, "user.manage")) {
    return { error: "You do not have permission to manage positions." };
  }
  const parsed = CreateSchema.safeParse({
    title: formData.get("title"),
    titleAr: formData.get("titleAr"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await withTenant(session.tenantId, async (tx) => {
      await tx.position.create({
        data: {
          tenantId: session.tenantId,
          title: parsed.data.title,
          titleAr: parsed.data.titleAr || null,
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: session.tenantId,
          actorId: session.userId,
          action: "position.create",
          entity: "Position",
        },
      });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "A position with that title already exists." };
    }
    throw e;
  }

  revalidatePath("/people/positions");
  return { ok: true };
}

const RenameSchema = z.object({
  positionId: z.string().min(1),
  title: z.string().trim().min(1, "Position title is required").max(120),
  titleAr: z.string().trim().max(120).optional().or(z.literal("")),
});

/** Rename a position / update its Arabic title. */
export async function renamePositionAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!can(session, "user.manage")) return;
  const parsed = RenameSchema.safeParse({
    positionId: formData.get("positionId"),
    title: formData.get("title"),
    titleAr: formData.get("titleAr"),
  });
  if (!parsed.success) return;

  await withTenant(session.tenantId, async (tx) => {
    const existing = await tx.position.findFirst({
      where: { id: parsed.data.positionId },
      select: { id: true },
    });
    if (!existing) return;
    await tx.position.update({
      where: { id: existing.id },
      data: {
        title: parsed.data.title,
        titleAr: parsed.data.titleAr || null,
      },
    });
  });

  revalidatePath("/people/positions");
}

const DeleteSchema = z.object({ positionId: z.string().min(1) });

/** Delete a position. Employees keep their enrollments; they are simply
 *  detached from the position (positionId set to null via the DB FK). */
export async function deletePositionAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!can(session, "user.manage")) return;
  const parsed = DeleteSchema.safeParse({
    positionId: formData.get("positionId"),
  });
  if (!parsed.success) return;

  await withTenant(session.tenantId, async (tx) => {
    const existing = await tx.position.findFirst({
      where: { id: parsed.data.positionId },
      select: { id: true },
    });
    if (!existing) return;
    await tx.position.delete({ where: { id: existing.id } });
    await tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "position.delete",
        entity: "Position",
        entityId: existing.id,
      },
    });
  });

  revalidatePath("/people/positions");
}

const SetCoursesSchema = z.object({
  positionId: z.string().min(1),
  programIds: z.array(z.string().min(1)).default([]),
});

/** Replace the set of courses mapped to a position. */
export async function setPositionCoursesAction(
  formData: FormData
): Promise<void> {
  const session = await requireSession();
  if (!can(session, "user.manage")) return;
  const parsed = SetCoursesSchema.safeParse({
    positionId: formData.get("positionId"),
    programIds: formData.getAll("programIds").map(String),
  });
  if (!parsed.success) return;

  await withTenant(session.tenantId, async (tx) => {
    const position = await tx.position.findFirst({
      where: { id: parsed.data.positionId },
      select: { id: true },
    });
    if (!position) return;

    // Only real programs in this tenant may be linked (RLS scopes the lookup).
    const valid = await tx.trainingProgram.findMany({
      where: { id: { in: parsed.data.programIds } },
      select: { id: true },
    });

    // Replace the mapping wholesale: clear then re-insert the valid set.
    await tx.positionProgram.deleteMany({ where: { positionId: position.id } });
    if (valid.length > 0) {
      await tx.positionProgram.createMany({
        data: valid.map((p) => ({
          tenantId: session.tenantId,
          positionId: position.id,
          programId: p.id,
        })),
        skipDuplicates: true,
      });
    }
    await tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "position.courses.set",
        entity: "Position",
        entityId: position.id,
        metadata: { courses: valid.length },
      },
    });
  });

  revalidatePath("/people/positions");
}

const AssignNowSchema = z.object({ positionId: z.string().min(1) });

/** Enroll every current holder of a position into its mapped courses. */
export async function assignPositionNowAction(
  formData: FormData
): Promise<void> {
  const session = await requireSession();
  if (!can(session, "user.manage")) return;
  const parsed = AssignNowSchema.safeParse({
    positionId: formData.get("positionId"),
  });
  if (!parsed.success) return;

  await withTenant(session.tenantId, async (tx) => {
    const position = await tx.position.findFirst({
      where: { id: parsed.data.positionId },
      select: { id: true },
    });
    if (!position) return;
    await assignPositionMembers(tx, session.tenantId, position.id);
  });

  revalidatePath("/people/positions");
  revalidatePath("/training");
}

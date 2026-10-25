"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";

const AssessSchema = z.object({
  userId: z.string().min(1),
  competencyId: z.string().min(1),
  managerLevel: z.coerce.number().int().min(1).max(5),
  targetLevel: z.coerce.number().int().min(1).max(5),
});

export interface AssessState {
  error?: string;
  ok?: boolean;
}

/**
 * Update a manager assessment for one employee/competency. The working
 * `currentLevel` is recomputed from self + manager. Requires competency.manage.
 */
export async function assessAction(
  _prev: AssessState,
  formData: FormData
): Promise<AssessState> {
  const session = await requireSession();
  if (!can(session, "competency.manage")) {
    return { error: "You do not have permission to assess competencies." };
  }

  const parsed = AssessSchema.safeParse({
    userId: formData.get("userId"),
    competencyId: formData.get("competencyId"),
    managerLevel: formData.get("managerLevel"),
    targetLevel: formData.get("targetLevel"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { userId, competencyId, managerLevel, targetLevel } = parsed.data;

  await withTenant(session.tenantId, async (tx) => {
    const rating = await tx.competencyRating.findUnique({
      where: { userId_competencyId: { userId, competencyId } },
    });
    const selfLevel = rating?.selfLevel ?? managerLevel;
    const currentLevel = Math.round((selfLevel + managerLevel) / 2);

    await tx.competencyRating.upsert({
      where: { userId_competencyId: { userId, competencyId } },
      create: {
        tenantId: session.tenantId,
        userId,
        competencyId,
        selfLevel,
        managerLevel,
        currentLevel,
        targetLevel,
      },
      update: { managerLevel, targetLevel, currentLevel },
    });

    await tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "competency.assess",
        entity: "CompetencyRating",
        entityId: `${userId}:${competencyId}`,
      },
    });
  });

  revalidatePath("/competencies");
  return { ok: true };
}

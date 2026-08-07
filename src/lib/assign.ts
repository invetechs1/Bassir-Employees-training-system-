/**
 * Department-based course auto-assignment. A department can be mapped to a
 * training track (curriculum category); members are then auto-enrolled into
 * every published program in that category — on invite acceptance, or via an
 * admin "assign now" action / backfill script.
 */
import type { Prisma } from "@prisma/client";

/** Pure: which program ids to enroll for a given department category. */
export function programsToAssign(
  programs: { id: string; status: string; category: string | null }[],
  category: string | null
): string[] {
  if (!category) return [];
  return programs
    .filter((p) => p.status === "PUBLISHED" && p.category === category)
    .map((p) => p.id);
}

/**
 * Enroll a single user into their department's mapped programs (idempotent).
 * Returns the number of new enrollments created. Requires an active tenant
 * context (RLS) on `tx`.
 */
export async function assignDepartmentCourses(
  tx: Prisma.TransactionClient,
  tenantId: string,
  userId: string
): Promise<number> {
  const user = await tx.user.findFirst({
    where: { id: userId },
    select: { departmentId: true },
  });
  if (!user?.departmentId) return 0;

  const department = await tx.department.findFirst({
    where: { id: user.departmentId },
    select: { trainingCategory: true },
  });
  const category = department?.trainingCategory ?? null;
  if (!category) return 0;

  const programs = await tx.trainingProgram.findMany({
    where: { status: "PUBLISHED", category },
    select: { id: true, status: true, category: true },
  });
  const ids = programsToAssign(programs, category);

  let created = 0;
  for (const programId of ids) {
    const existing = await tx.enrollment.findUnique({
      where: { programId_userId: { programId, userId } },
      select: { id: true },
    });
    if (existing) continue;
    await tx.enrollment.create({
      data: { tenantId, programId, userId },
    });
    created++;
  }
  return created;
}

/**
 * Assign a whole department's active members to its mapped programs.
 * Returns totals for reporting. Requires an active tenant context on `tx`.
 */
export async function assignDepartmentMembers(
  tx: Prisma.TransactionClient,
  tenantId: string,
  departmentId: string
): Promise<{ users: number; enrollments: number }> {
  const members = await tx.user.findMany({
    where: { departmentId, status: "ACTIVE" },
    select: { id: true },
  });
  let enrollments = 0;
  for (const m of members) {
    enrollments += await assignDepartmentCourses(tx, tenantId, m.id);
  }
  return { users: members.length, enrollments };
}

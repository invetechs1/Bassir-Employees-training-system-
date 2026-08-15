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
 * Pure: which published programs an employee is allowed to SEE in the catalog —
 * those belonging to their department's training track, PLUS any they were
 * individually assigned (enrolled by name). Managers/HR bypass this and see the
 * whole library. Returns the set of visible program ids.
 */
export function visibleProgramIds(
  programs: { id: string; category: string | null }[],
  departmentCategory: string | null,
  enrolledProgramIds: Iterable<string>
): Set<string> {
  const enrolled = new Set(enrolledProgramIds);
  const visible = new Set<string>();
  for (const p of programs) {
    if (
      enrolled.has(p.id) ||
      (departmentCategory !== null && p.category === departmentCategory)
    ) {
      visible.add(p.id);
    }
  }
  return visible;
}

/** Published program ids in a category (empty for a null/unknown category). */
async function programIdsForCategory(
  tx: Prisma.TransactionClient,
  category: string | null
): Promise<string[]> {
  if (!category) return [];
  const programs = await tx.trainingProgram.findMany({
    where: { status: "PUBLISHED", category },
    select: { id: true, status: true, category: true },
  });
  return programsToAssign(programs, category);
}

/**
 * Enroll a user into a set of programs in one batch. Idempotent via the
 * (programId, userId) unique constraint. Returns the number of NEW enrollments.
 */
async function enrollUserInPrograms(
  tx: Prisma.TransactionClient,
  tenantId: string,
  userId: string,
  programIds: string[]
): Promise<number> {
  if (programIds.length === 0) return 0;
  const res = await tx.enrollment.createMany({
    data: programIds.map((programId) => ({ tenantId, programId, userId })),
    skipDuplicates: true,
  });
  return res.count;
}

/**
 * Whether an employee may access a specific program: it is in their
 * department's training track, OR they are already enrolled (assigned to it by
 * name). Managers / HR bypass this. Requires an active tenant context on `tx`.
 */
export async function canEmployeeAccessProgram(
  tx: Prisma.TransactionClient,
  userId: string,
  program: { id: string; category: string | null }
): Promise<boolean> {
  const enrolled = await tx.enrollment.findFirst({
    where: { programId: program.id, userId },
    select: { id: true },
  });
  if (enrolled) return true;

  const user = await tx.user.findFirst({
    where: { id: userId },
    select: { departmentId: true },
  });
  if (!user?.departmentId) return false;

  const department = await tx.department.findFirst({
    where: { id: user.departmentId },
    select: { trainingCategory: true },
  });
  const category = department?.trainingCategory ?? null;
  return category !== null && program.category === category;
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
  const ids = await programIdsForCategory(tx, department?.trainingCategory ?? null);
  return enrollUserInPrograms(tx, tenantId, userId, ids);
}

/**
 * Assign a whole department's active members to its mapped programs. Fetches the
 * department's track and program list ONCE, then batch-enrolls each member.
 * Returns totals for reporting. Requires an active tenant context on `tx`.
 */
export async function assignDepartmentMembers(
  tx: Prisma.TransactionClient,
  tenantId: string,
  departmentId: string
): Promise<{ users: number; enrollments: number }> {
  const department = await tx.department.findFirst({
    where: { id: departmentId },
    select: { trainingCategory: true },
  });
  const ids = await programIdsForCategory(tx, department?.trainingCategory ?? null);

  const members = await tx.user.findMany({
    where: { departmentId, status: "ACTIVE" },
    select: { id: true },
  });
  let enrollments = 0;
  for (const m of members) {
    enrollments += await enrollUserInPrograms(tx, tenantId, m.id, ids);
  }
  return { users: members.length, enrollments };
}

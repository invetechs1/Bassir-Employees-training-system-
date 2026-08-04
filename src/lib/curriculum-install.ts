/**
 * Install the starter curriculum (src/lib/curriculum.ts) into a tenant.
 *
 * Idempotent: a program is matched by (tenantId, title) and skipped if it
 * already exists, so this is safe to re-run after adding new content.
 *
 * MUST be called inside a transaction that has already set
 * `app.current_tenant` to `tenantId` (see withTenant in seed/provision), so the
 * inserts satisfy Row-Level Security.
 */
import { Prisma } from "@prisma/client";
import { CURRICULUM, programDurationHours, type CurriculumProgram } from "./curriculum";

export interface InstallResult {
  programsCreated: number;
  programsSkipped: number;
  lessonsCreated: number;
}

async function ensureCompetency(
  tx: Prisma.TransactionClient,
  tenantId: string,
  categoryId: string,
  name: string
): Promise<string> {
  const existing = await tx.competency.findFirst({ where: { tenantId, name } });
  if (existing) return existing.id;
  const created = await tx.competency.create({
    data: { tenantId, categoryId, name },
  });
  return created.id;
}

async function installProgram(
  tx: Prisma.TransactionClient,
  tenantId: string,
  categoryId: string,
  spec: CurriculumProgram,
  authorId: string | null
): Promise<number> {
  const competencyId = await ensureCompetency(
    tx,
    tenantId,
    categoryId,
    spec.competency
  );

  const program = await tx.trainingProgram.create({
    data: {
      tenantId,
      title: spec.title,
      titleAr: spec.titleAr,
      description: spec.description,
      descriptionAr: spec.descriptionAr,
      category: spec.category,
      level: spec.level,
      status: "PUBLISHED",
      durationHours: programDurationHours(spec),
      competencyId,
      authorId,
    },
  });

  let lessonsCreated = 0;
  for (let mi = 0; mi < spec.modules.length; mi++) {
    const mod = spec.modules[mi];
    const module = await tx.trainingModule.create({
      data: {
        tenantId,
        programId: program.id,
        title: mod.title,
        titleAr: mod.titleAr,
        orderIndex: mi,
      },
    });
    for (let li = 0; li < mod.lessons.length; li++) {
      const lesson = mod.lessons[li];
      await tx.lesson.create({
        data: {
          tenantId,
          moduleId: module.id,
          title: lesson.title,
          titleAr: lesson.titleAr,
          type: lesson.type,
          content: lesson.content,
          contentAr: lesson.contentAr,
          durationMinutes: lesson.durationMinutes,
          orderIndex: li,
        },
      });
      lessonsCreated++;
    }
  }
  return lessonsCreated;
}

export async function installCurriculum(
  tx: Prisma.TransactionClient,
  tenantId: string,
  opts: { authorId?: string | null } = {}
): Promise<InstallResult> {
  const authorId = opts.authorId ?? null;

  // A dedicated competency category groups the library's linked competencies.
  const CATEGORY_NAME = "Professional Development";
  let category = await tx.competencyCategory.findFirst({
    where: { tenantId, name: CATEGORY_NAME },
  });
  if (!category) {
    category = await tx.competencyCategory.create({
      data: { tenantId, name: CATEGORY_NAME },
    });
  }

  const result: InstallResult = {
    programsCreated: 0,
    programsSkipped: 0,
    lessonsCreated: 0,
  };

  for (const spec of CURRICULUM) {
    const exists = await tx.trainingProgram.findFirst({
      where: { tenantId, title: spec.title },
      select: { id: true },
    });
    if (exists) {
      result.programsSkipped++;
      continue;
    }
    const lessons = await installProgram(
      tx,
      tenantId,
      category.id,
      spec,
      authorId
    );
    result.programsCreated++;
    result.lessonsCreated += lessons;
  }

  return result;
}

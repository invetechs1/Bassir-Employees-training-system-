/**
 * Teacher agent — monthly pipeline.
 *
 * For each active employee it finds their most urgent competency gap, generates
 * a personalized bilingual enhancement course (LLM or deterministic engine),
 * publishes it, and assigns it with a due date. Employees already enrolled in
 * that course are left alone, so re-running is safe (idempotent per course).
 *
 * Content generation (which may call the Claude API) runs OUTSIDE any database
 * transaction; only the short read and write phases use `withTenant` so RLS
 * transactions stay brief.
 */
import { withTenant } from "@/lib/tenant-db";
import { installSingleProgram } from "@/lib/curriculum-install";
import { rankGaps } from "@/lib/agents/weakness-agent";
import type { CompetencyGap, RankedGap } from "@/lib/agents/types";
import {
  generateEnhancementProgram,
  type ContentEngine,
  type EnhancementInput,
} from "./content-engine";

export interface TeacherAgentOptions {
  /** Days until the assigned course is due. Default 30. */
  dueInDays?: number;
  /** Safety cap on how many distinct courses to generate per run. Default 50. */
  maxCourses?: number;
}

export interface TeacherAgentResult {
  tenantId: string;
  usersProcessed: number;
  usersWithGap: number;
  coursesCreated: number;
  enrollmentsCreated: number;
  enrollmentsSkipped: number;
  byEngine: Record<ContentEngine, number>;
}

/**
 * Pure: pick the single most urgent gap from a set of competency ratings, or
 * null when there is nothing to improve. Arabic names fall back to the English
 * name (the Competency model is English-only).
 */
export function selectTopGap(
  ratings: { name: string; currentLevel: number; targetLevel: number }[]
): RankedGap | null {
  const gaps: CompetencyGap[] = ratings.map((r) => ({
    competency: r.name,
    competencyAr: r.name,
    currentLevel: r.currentLevel,
    targetLevel: r.targetLevel,
  }));
  return rankGaps(gaps)[0] ?? null;
}

interface UserTask {
  userId: string;
  input: EnhancementInput;
}

/** Run the teacher agent for one tenant. Requires no active tenant context. */
export async function runTeacherAgentForTenant(
  tenantId: string,
  opts: TeacherAgentOptions = {}
): Promise<TeacherAgentResult> {
  const dueInDays = opts.dueInDays ?? 30;
  const maxCourses = opts.maxCourses ?? 50;

  const result: TeacherAgentResult = {
    tenantId,
    usersProcessed: 0,
    usersWithGap: 0,
    coursesCreated: 0,
    enrollmentsCreated: 0,
    enrollmentsSkipped: 0,
    byEngine: { llm: 0, deterministic: 0 },
  };

  // --- Phase 1: read employees + their competency gaps (short RLS tx) --------
  const users = await withTenant(tenantId, (tx) =>
    tx.user.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        department: { select: { trainingCategory: true } },
        competencyRatings: {
          select: {
            currentLevel: true,
            targetLevel: true,
            competency: { select: { name: true } },
          },
        },
      },
    })
  );
  result.usersProcessed = users.length;

  // Build one task per employee that has a gap.
  const tasks: UserTask[] = [];
  for (const u of users) {
    const top = selectTopGap(
      u.competencyRatings.map((r) => ({
        name: r.competency.name,
        currentLevel: r.currentLevel,
        targetLevel: r.targetLevel,
      }))
    );
    if (!top) continue;
    result.usersWithGap++;
    tasks.push({
      userId: u.id,
      input: {
        competency: top.competency,
        competencyAr: top.competencyAr,
        currentLevel: top.currentLevel,
        targetLevel: top.targetLevel,
        category: u.department?.trainingCategory ?? "Professional Development",
        employeeName: `${u.firstName} ${u.lastName}`.trim(),
        jobTitle: u.jobTitle ?? undefined,
      },
    });
  }

  // --- Phase 2: generate content ONCE per distinct course (no tx) ------------
  // Many employees share a gap → one course, many enrollments. Dedupe by the
  // course's canonical title so we don't generate (or pay for) it twice.
  const courseByTitle = new Map<
    string,
    { input: EnhancementInput; userIds: string[]; engine: ContentEngine; program: Awaited<ReturnType<typeof generateEnhancementProgram>>["program"] | null }
  >();
  for (const t of tasks) {
    const title = `Enhancing ${t.input.competency}`;
    const entry = courseByTitle.get(title);
    if (entry) {
      entry.userIds.push(t.userId);
    } else {
      courseByTitle.set(title, {
        input: t.input,
        userIds: [t.userId],
        engine: "deterministic",
        program: null,
      });
    }
  }

  let generated = 0;
  for (const entry of courseByTitle.values()) {
    if (generated >= maxCourses) break;
    const { program, engine } = await generateEnhancementProgram(entry.input);
    entry.program = program;
    entry.engine = engine;
    result.byEngine[engine]++;
    generated++;
  }

  // --- Phase 3: persist programs + assign with due dates (one RLS tx) --------
  const dueAt = new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000);

  await withTenant(tenantId, async (tx) => {
    for (const entry of courseByTitle.values()) {
      if (!entry.program) continue; // skipped by maxCourses
      const { programId, created } = await installSingleProgram(
        tx,
        tenantId,
        entry.program
      );
      if (created) result.coursesCreated++;

      for (const userId of entry.userIds) {
        const existing = await tx.enrollment.findFirst({
          where: { programId, userId },
          select: { id: true },
        });
        if (existing) {
          result.enrollmentsSkipped++;
          continue;
        }
        await tx.enrollment.create({
          data: {
            tenantId,
            programId,
            userId,
            status: "ENROLLED",
            dueAt,
            assignedVia: "teacher-agent",
          },
        });
        result.enrollmentsCreated++;
      }
    }

    if (result.coursesCreated > 0 || result.enrollmentsCreated > 0) {
      await tx.auditLog.create({
        data: {
          tenantId,
          action: "teacher.agent.run",
          entity: "Tenant",
          entityId: tenantId,
          metadata: {
            coursesCreated: result.coursesCreated,
            enrollmentsCreated: result.enrollmentsCreated,
            byEngine: result.byEngine,
          },
        },
      });
    }
  });

  return result;
}

/**
 * Course completion certificates. Issued automatically the moment a learner
 * finishes a course (enrollment reaches COMPLETED). One per (program, user).
 */
import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";

/** Average of scores, rounded — null when there were none. Pure/testable. */
export function averageScore(scores: number[]): number | null {
  if (scores.length === 0) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round(sum / scores.length);
}

/** Human-readable, verifiable serial, e.g. "BCAP-4F9C-1A7E". */
export function generateSerial(): string {
  const hex = randomBytes(4).toString("hex").toUpperCase();
  return `BCAP-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/**
 * Issue a certificate for (userId, programId) if one doesn't already exist.
 * Score is the average of the learner's best passing quiz scores in the course
 * (null if the course has no quizzes). Idempotent. Requires an active tenant
 * context (RLS) on `tx`. Returns the certificate id (existing or new).
 */
export async function issueCertificate(
  tx: Prisma.TransactionClient,
  tenantId: string,
  userId: string,
  programId: string
): Promise<string> {
  const existing = await tx.courseCertificate.findUnique({
    where: { programId_userId: { programId, userId } },
    select: { id: true },
  });
  if (existing) return existing.id;

  // Best passing score per quiz lesson in this program.
  const passed = await tx.quizAttempt.findMany({
    where: {
      userId,
      passed: true,
      lesson: { module: { programId } },
    },
    select: { lessonId: true, score: true },
    orderBy: { score: "desc" },
  });
  const bestByLesson = new Map<string, number>();
  for (const a of passed) {
    if (!bestByLesson.has(a.lessonId)) bestByLesson.set(a.lessonId, a.score);
  }
  const score = averageScore([...bestByLesson.values()]);

  const created = await tx.courseCertificate.create({
    data: {
      tenantId,
      userId,
      programId,
      serial: generateSerial(),
      score,
    },
    select: { id: true },
  });
  return created.id;
}

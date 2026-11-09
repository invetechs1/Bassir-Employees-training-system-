/**
 * Development "agents" — pure, deterministic, bilingual generators that compose
 * into an employee weakness-enhancement engine:
 *
 *   - quiz-agent     → gradable knowledge-check lessons
 *   - course-agent   → full CurriculumProgram courses (ending in a quiz)
 *   - kpi-agent      → engagement scorecards + next-period targets
 *   - weakness-agent → orchestrates the above into a DevelopmentPlan
 *
 * Everything here is DB- and network-free so it can be unit-tested and later
 * wired into Prisma / server actions.
 */

export * from "./types";
export * from "./quiz-agent";
export * from "./course-agent";
export * from "./kpi-agent";
export * from "./weakness-agent";

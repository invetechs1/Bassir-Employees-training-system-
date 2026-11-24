/**
 * Teacher agent — content engine.
 *
 * Generates a focused, bilingual (EN/AR) *enhancement course* that closes one
 * employee competency gap. Two interchangeable backends:
 *
 *   • LLM engine (Claude) — richer, novel lessons. Used when ANTHROPIC_API_KEY
 *     is set (and TEACHER_AGENT_ENGINE !== "deterministic").
 *   • Deterministic engine — the existing weakness-agent. Always available,
 *     offline, free, and reproducible.
 *
 * The public API always resolves to a valid CurriculumProgram: if the LLM is
 * unavailable, disabled, errors, or returns something that fails validation, it
 * falls back to the deterministic engine. Output is normalized so the program's
 * identity (title, category, level, competency) is canonical regardless of
 * engine — that keeps install-by-title idempotent and categorization reliable.
 */
import { z } from "zod";
import type {
  CurriculumProgram,
  CurriculumModule,
  CurriculumLesson,
} from "@/lib/curriculum";
import { enhancementCourse, levelForTarget } from "@/lib/agents/weakness-agent";
import type { RankedGap } from "@/lib/agents/types";

export interface EnhancementInput {
  competency: string;
  competencyAr: string;
  currentLevel: number; // 1..5
  targetLevel: number; // 1..5
  /** Specialist track used to categorize the generated course. */
  category: string;
  employeeName?: string;
  jobTitle?: string;
}

export type ContentEngine = "llm" | "deterministic";

export interface GeneratedProgram {
  program: CurriculumProgram;
  engine: ContentEngine;
}

/** URL/id-safe slug from a competency name. */
function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "competency"
  );
}

/** Canonical identity for an enhancement course (engine-independent). */
function identity(input: EnhancementInput) {
  return {
    key: `enh-${slug(input.competency)}`,
    title: `Enhancing ${input.competency}`,
    titleAr: `تطوير ${input.competencyAr}`,
    category: input.category,
    level: levelForTarget(input.targetLevel),
    competency: input.competency,
    competencyAr: input.competencyAr,
  };
}

function rankedGapFrom(input: EnhancementInput): RankedGap {
  const gap = Math.max(0, input.targetLevel - input.currentLevel);
  return {
    competency: input.competency,
    competencyAr: input.competencyAr,
    currentLevel: input.currentLevel,
    targetLevel: input.targetLevel,
    gap: gap || 1,
    priority: 1,
  };
}

/** Deterministic backend — reuse the existing weakness-agent generator. */
export function deterministicProgram(
  input: EnhancementInput
): CurriculumProgram {
  return enhancementCourse(rankedGapFrom(input), input.category);
}

// ---------------------------------------------------------------------------
// LLM backend (Claude)
// ---------------------------------------------------------------------------

const OptionSchema = z.object({
  text: z.string().min(1),
  textAr: z.string().min(1),
  correct: z.boolean().optional(),
});

const QuestionSchema = z.object({
  prompt: z.string().min(1),
  promptAr: z.string().min(1),
  options: z.array(OptionSchema).min(2),
  explanation: z.string().optional(),
  explanationAr: z.string().optional(),
});

const LessonSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().min(1),
  type: z.enum(["TEXT", "QUIZ"]),
  durationMinutes: z.number().int().positive().max(120).optional(),
  content: z.string().optional(),
  contentAr: z.string().optional(),
  questions: z.array(QuestionSchema).optional(),
});

const ModuleSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().min(1),
  lessons: z.array(LessonSchema).min(1),
});

const LlmCourseSchema = z.object({
  description: z.string().min(1),
  descriptionAr: z.string().min(1),
  modules: z.array(ModuleSchema).min(1).max(4),
});

type LlmCourse = z.infer<typeof LlmCourseSchema>;

/** True when the LLM engine is configured and not explicitly disabled. */
export function llmEngineEnabled(): boolean {
  return (
    Boolean(process.env.ANTHROPIC_API_KEY) &&
    process.env.TEACHER_AGENT_ENGINE !== "deterministic"
  );
}

const MODEL = process.env.TEACHER_AGENT_MODEL || "claude-opus-5-5";

function buildPrompt(input: EnhancementInput): string {
  return [
    `Create a short, practical corporate training course that helps an employee improve the competency "${input.competency}".`,
    input.jobTitle ? `The employee's role is "${input.jobTitle}".` : "",
    `They are currently at proficiency level ${input.currentLevel} of 5 and should reach level ${input.targetLevel}.`,
    `Audience: employees in Saudi Arabia / the GCC — keep examples relevant and professional.`,
    "",
    "Return ONLY a JSON object (no markdown, no code fences) with exactly this shape:",
    "{",
    '  "description": string, "descriptionAr": string,',
    '  "modules": [',
    '    { "title": string, "titleAr": string, "lessons": [',
    '        { "type": "TEXT", "title": string, "titleAr": string, "durationMinutes": number,',
    '          "content": "<Markdown body, English>", "contentAr": "<Markdown body, Arabic>" }',
    "    ] }",
    "  ]",
    "}",
    "",
    "Rules:",
    "- Provide 2 modules, each with 2 TEXT lessons (Markdown: ## headings, bullet points, a short > takeaway).",
    "- Add ONE final module titled \"Knowledge Check\" / \"اختبار المعرفة\" whose single lesson has",
    '  "type": "QUIZ" with a "questions" array of 4 questions.',
    '  Each question: { "prompt", "promptAr", "options": [4 x { "text", "textAr", "correct"? }],',
    '  "explanation", "explanationAr" } with EXACTLY ONE option marked "correct": true.',
    "- Every English field must have a non-empty Arabic counterpart. durationMinutes 8–20.",
    "- Do not include a title/level/category — those are set by the system.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Strip accidental ```json fences and parse. Throws on invalid JSON. */
function parseJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "");
  return JSON.parse(trimmed);
}

/** Convert a validated LLM course into a CurriculumProgram with canonical identity. */
function toProgram(input: EnhancementInput, course: LlmCourse): CurriculumProgram {
  const id = identity(input);
  const modules: CurriculumModule[] = course.modules.map((m) => ({
    title: m.title,
    titleAr: m.titleAr,
    lessons: m.lessons.map((l): CurriculumLesson => {
      if (l.type === "QUIZ") {
        return {
          title: l.title,
          titleAr: l.titleAr,
          type: "QUIZ",
          durationMinutes: l.durationMinutes ?? 8,
          content: "",
          contentAr: "",
          passMark: 70,
          questions: (l.questions ?? []).map((q) => ({
            prompt: q.prompt,
            promptAr: q.promptAr,
            type: "SINGLE" as const,
            options: q.options.map((o) => ({
              text: o.text,
              textAr: o.textAr,
              correct: Boolean(o.correct),
            })),
            explanation: q.explanation,
            explanationAr: q.explanationAr,
          })),
        };
      }
      return {
        title: l.title,
        titleAr: l.titleAr,
        type: "TEXT",
        durationMinutes: l.durationMinutes ?? 12,
        content: l.content ?? "",
        contentAr: l.contentAr ?? "",
      };
    }),
  }));

  return {
    key: id.key,
    title: id.title,
    titleAr: id.titleAr,
    description: course.description,
    descriptionAr: course.descriptionAr,
    category: id.category,
    level: id.level,
    competency: id.competency,
    competencyAr: id.competencyAr,
    modules,
  };
}

/** Every QUIZ lesson must have ≥3 questions, each with exactly one correct option. */
function quizzesAreValid(program: CurriculumProgram): boolean {
  const quizzes = program.modules
    .flatMap((m) => m.lessons)
    .filter((l) => l.type === "QUIZ");
  if (quizzes.length === 0) return false;
  for (const quiz of quizzes) {
    const qs = quiz.questions ?? [];
    if (qs.length < 3) return false;
    for (const q of qs) {
      if (q.options.filter((o) => o.correct).length !== 1) return false;
    }
  }
  return true;
}

/** Generate a program with Claude. Throws on any failure (caller falls back). */
async function llmProgram(input: EnhancementInput): Promise<CurriculumProgram> {
  // Imported lazily so the Anthropic SDK is only loaded when actually used.
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system:
      "You are an expert bilingual (English/Arabic) corporate learning designer. " +
      "You output only valid JSON that exactly matches the requested shape.",
    messages: [{ role: "user", content: buildPrompt(input) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("LLM refused to generate content");
  }
  const text = response.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (!text.trim()) throw new Error("LLM returned no text");

  const course = LlmCourseSchema.parse(parseJson(text));
  const program = toProgram(input, course);
  if (!quizzesAreValid(program)) {
    throw new Error("LLM course failed quiz validation");
  }
  return program;
}

/**
 * Generate an enhancement program, preferring the LLM engine and falling back
 * to the deterministic one on any problem. Never throws.
 */
export async function generateEnhancementProgram(
  input: EnhancementInput
): Promise<GeneratedProgram> {
  if (llmEngineEnabled()) {
    try {
      const program = await llmProgram(input);
      return { program, engine: "llm" };
    } catch (err) {
      // Fall through to the deterministic engine — the job must always produce
      // valid content.
      console.warn(
        `[teacher-agent] LLM engine failed, using deterministic fallback: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }
  return { program: deterministicProgram(input), engine: "deterministic" };
}

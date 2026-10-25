import { describe, it, expect } from "vitest";
import {
  generateDevelopmentPlan,
  levelForTarget,
  rankGaps,
  toGradableQuiz,
} from "@/lib/agents";
import type { EmployeeProfile } from "@/lib/agents";
import { gradeQuiz } from "@/lib/quiz";

const PROFILE: EmployeeProfile = {
  name: "Sara",
  jobTitle: "Accountant",
  category: "Accounting & Finance",
  activity: { lessonsCompleted: 1, quizzesPassed: 0, coursesCompleted: 0 },
  gaps: [
    { competency: "Budgeting", competencyAr: "إعداد الموازنات", currentLevel: 2, targetLevel: 4 },
    { competency: "VAT Compliance", competencyAr: "الامتثال الضريبي", currentLevel: 3, targetLevel: 3 }, // no gap
    { competency: "Reporting", competencyAr: "إعداد التقارير", currentLevel: 1, targetLevel: 5 },
  ],
};

describe("weakness-enhancement agent", () => {
  it("ranks gaps most-urgent first and drops non-gaps", () => {
    const ranked = rankGaps(PROFILE.gaps);
    expect(ranked.map((g) => g.competency)).toEqual(["Reporting", "Budgeting"]);
    expect(ranked[0].gap).toBe(4);
    expect(ranked[0].priority).toBe(1);
    expect(ranked[1].priority).toBe(2);
  });

  it("maps a target proficiency to a program level", () => {
    expect(levelForTarget(2)).toBe("FOUNDATION");
    expect(levelForTarget(3)).toBe("INTERMEDIATE");
    expect(levelForTarget(4)).toBe("ADVANCED");
    expect(levelForTarget(5)).toBe("LEADERSHIP");
  });

  it("generates a bilingual plan with one enhancement course per top gap", () => {
    const plan = generateDevelopmentPlan(PROFILE);
    expect(plan.employee).toBe("Sara");
    expect(plan.priorityGaps).toHaveLength(2);
    expect(plan.courses).toHaveLength(2);
    expect(plan.summary.length).toBeGreaterThan(0);
    expect(plan.summaryAr.trim().length).toBeGreaterThan(0);

    for (const course of plan.courses) {
      expect(course.titleAr.trim().length).toBeGreaterThan(0);
      const quizzes = course.modules
        .flatMap((m) => m.lessons)
        .filter((l) => l.type === "QUIZ");
      expect(quizzes.length).toBeGreaterThan(0);
      // Every generated quiz is passable via its answer key.
      for (const quiz of quizzes) {
        const { questions, answerKey } = toGradableQuiz(quiz);
        expect(gradeQuiz(questions, answerKey, quiz.passMark ?? 70).passed).toBe(true);
      }
    }
  });

  it("caps the number of generated courses", () => {
    const plan = generateDevelopmentPlan(PROFILE, { maxCourses: 1 });
    expect(plan.courses).toHaveLength(1);
    expect(plan.courses[0].competency).toBe("Reporting"); // the top gap
  });

  it("carries a KPI scorecard and a recommended activity", () => {
    const plan = generateDevelopmentPlan(PROFILE);
    expect(plan.kpi.band).toBe("LOW"); // 1 lesson = 1 point
    // Recommends completing the two generated courses (+ their quizzes).
    expect(plan.recommendedActivity.coursesCompleted).toBeGreaterThanOrEqual(2);
    expect(plan.recommendedActivity.quizzesPassed).toBeGreaterThanOrEqual(2);
  });

  it("handles an employee with no gaps", () => {
    const plan = generateDevelopmentPlan({
      name: "Omar",
      activity: { lessonsCompleted: 0, quizzesPassed: 0, coursesCompleted: 3 },
      gaps: [],
    });
    expect(plan.priorityGaps).toHaveLength(0);
    expect(plan.courses).toHaveLength(0);
    expect(plan.kpi.band).toBe("HIGH");
    expect(plan.summaryAr.trim().length).toBeGreaterThan(0);
  });
});

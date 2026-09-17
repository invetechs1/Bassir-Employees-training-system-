import { describe, it, expect } from "vitest";
import { generateKpiScorecard, targetForPoints } from "@/lib/agents";
import { computeKpi, engagementLabel } from "@/lib/kpi";

describe("kpi agent", () => {
  it("labels an inactive employee and targets the LOW band", () => {
    const card = generateKpiScorecard({
      lessonsCompleted: 0,
      quizzesPassed: 0,
      coursesCompleted: 0,
    });
    expect(card.kpi).toBe(0);
    expect(card.band).toBe("INACTIVE");
    expect(card.nextBand).toBe("LOW");
    expect(card.pointsToNextBand).toBe(1);
    expect(computeKpi(card.target)).toBeGreaterThanOrEqual(card.pointsToNextBand);
    expect(card.bandLabelAr.trim().length).toBeGreaterThan(0);
  });

  it("agrees with engagementLabel for any activity", () => {
    const activity = { lessonsCompleted: 3, quizzesPassed: 2, coursesCompleted: 0 };
    const card = generateKpiScorecard(activity);
    expect(card.kpi).toBe(computeKpi(activity)); // 3 + 6 = 9
    expect(card.band).toBe(engagementLabel(card.kpi)); // MEDIUM
    expect(card.nextBand).toBe("HIGH");
    expect(card.pointsToNextBand).toBe(11);
  });

  it("reports no next band once HIGH is reached", () => {
    const card = generateKpiScorecard({
      lessonsCompleted: 0,
      quizzesPassed: 0,
      coursesCompleted: 2,
    });
    expect(card.band).toBe("HIGH");
    expect(card.nextBand).toBeNull();
    expect(card.pointsToNextBand).toBe(0);
    expect(card.target).toEqual({
      lessonsCompleted: 0,
      quizzesPassed: 0,
      coursesCompleted: 0,
    });
  });

  it("targetForPoints always scores at least the requested points", () => {
    for (const pts of [0, 1, 5, 8, 11, 20, 37]) {
      expect(computeKpi(targetForPoints(pts))).toBeGreaterThanOrEqual(pts);
    }
  });
});

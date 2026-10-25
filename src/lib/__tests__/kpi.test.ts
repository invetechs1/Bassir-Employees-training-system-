import { describe, it, expect } from "vitest";
import {
  computeKpi,
  engagementLabel,
  parseMonth,
  formatMonth,
  monthBounds,
} from "../kpi";

describe("computeKpi", () => {
  it("weights courses > quizzes > lessons", () => {
    expect(computeKpi({ lessonsCompleted: 0, quizzesPassed: 0, coursesCompleted: 0 })).toBe(0);
    expect(computeKpi({ lessonsCompleted: 5, quizzesPassed: 0, coursesCompleted: 0 })).toBe(5);
    expect(computeKpi({ lessonsCompleted: 0, quizzesPassed: 2, coursesCompleted: 0 })).toBe(6);
    expect(computeKpi({ lessonsCompleted: 0, quizzesPassed: 0, coursesCompleted: 1 })).toBe(10);
    expect(computeKpi({ lessonsCompleted: 4, quizzesPassed: 1, coursesCompleted: 1 })).toBe(17);
  });
});

describe("engagementLabel", () => {
  it("buckets scores including the lazy/inactive case", () => {
    expect(engagementLabel(0)).toBe("INACTIVE");
    expect(engagementLabel(3)).toBe("LOW");
    expect(engagementLabel(8)).toBe("MEDIUM");
    expect(engagementLabel(19)).toBe("MEDIUM");
    expect(engagementLabel(20)).toBe("HIGH");
  });
});

describe("month helpers", () => {
  it("parses valid YYYY-MM and falls back otherwise", () => {
    expect(parseMonth("2026-03", { year: 2000, month0: 0 })).toEqual({ year: 2026, month0: 2 });
    expect(parseMonth("bad", { year: 2000, month0: 0 })).toEqual({ year: 2000, month0: 0 });
    expect(parseMonth("2026-13", { year: 2000, month0: 0 })).toEqual({ year: 2000, month0: 0 });
  });

  it("formats and bounds a month correctly", () => {
    expect(formatMonth(2026, 2)).toBe("2026-03");
    const { start, end } = monthBounds(2026, 2); // March 2026
    expect(start.toISOString()).toBe("2026-03-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-04-01T00:00:00.000Z");
  });
});

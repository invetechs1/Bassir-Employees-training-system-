import { describe, it, expect } from "vitest";
import { averageScore, generateSerial } from "../certificate";

describe("averageScore", () => {
  it("returns null with no scores (course had no quizzes)", () => {
    expect(averageScore([])).toBeNull();
  });
  it("rounds the average", () => {
    expect(averageScore([100])).toBe(100);
    expect(averageScore([80, 90])).toBe(85);
    expect(averageScore([70, 80, 81])).toBe(77); // 231/3 = 77
  });
});

describe("generateSerial", () => {
  it("matches the BCAP-XXXX-XXXX format", () => {
    const s = generateSerial();
    expect(s).toMatch(/^BCAP-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });
  it("is effectively unique across calls", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateSerial()));
    expect(seen.size).toBe(200);
  });
});

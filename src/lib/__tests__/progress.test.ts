import { describe, it, expect } from "vitest";
import {
  computeProgress,
  statusForProgress,
  enrollmentUpdateFor,
} from "../progress";

describe("computeProgress", () => {
  it("is 0 when a program has no lessons", () => {
    expect(computeProgress(0, 0)).toBe(0);
    expect(computeProgress(3, 0)).toBe(0);
  });

  it("rounds to the nearest percent and clamps to 0..100", () => {
    expect(computeProgress(0, 4)).toBe(0);
    expect(computeProgress(1, 3)).toBe(33);
    expect(computeProgress(2, 3)).toBe(67);
    expect(computeProgress(4, 4)).toBe(100);
    expect(computeProgress(5, 4)).toBe(100); // never exceeds 100
  });
});

describe("statusForProgress", () => {
  it("maps progress to an enrollment status", () => {
    expect(statusForProgress(0)).toBe("ENROLLED");
    expect(statusForProgress(1)).toBe("IN_PROGRESS");
    expect(statusForProgress(99)).toBe("IN_PROGRESS");
    expect(statusForProgress(100)).toBe("COMPLETED");
  });
});

describe("enrollmentUpdateFor", () => {
  it("derives progress, status and completion together", () => {
    expect(enrollmentUpdateFor(0, 5)).toEqual({
      progress: 0,
      status: "ENROLLED",
      completed: false,
    });
    expect(enrollmentUpdateFor(2, 5)).toEqual({
      progress: 40,
      status: "IN_PROGRESS",
      completed: false,
    });
    expect(enrollmentUpdateFor(5, 5)).toEqual({
      progress: 100,
      status: "COMPLETED",
      completed: true,
    });
  });
});

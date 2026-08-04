import { describe, it, expect } from "vitest";
import {
  CURRICULUM,
  TRACKS,
  totalLessonCount,
  programDurationHours,
} from "../curriculum";

describe("starter curriculum", () => {
  it("ships a program for each specialist track", () => {
    const categories = new Set(CURRICULUM.map((p) => p.category));
    for (const track of TRACKS) {
      expect(categories.has(track.key)).toBe(true);
    }
  });

  it("has unique program keys and titles", () => {
    const keys = CURRICULUM.map((p) => p.key);
    const titles = CURRICULUM.map((p) => p.title);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("is fully bilingual (every program, module and lesson has Arabic)", () => {
    for (const p of CURRICULUM) {
      expect(p.titleAr.trim().length).toBeGreaterThan(0);
      expect(p.descriptionAr.trim().length).toBeGreaterThan(0);
      expect(p.modules.length).toBeGreaterThan(0);
      for (const m of p.modules) {
        expect(m.titleAr.trim().length).toBeGreaterThan(0);
        expect(m.lessons.length).toBeGreaterThan(0);
        for (const l of m.lessons) {
          expect(l.titleAr.trim().length).toBeGreaterThan(0);
          expect(l.contentAr.trim().length).toBeGreaterThan(0);
          expect(l.durationMinutes).toBeGreaterThan(0);
        }
      }
    }
  });

  it("gives every program a positive duration derived from its lessons", () => {
    for (const p of CURRICULUM) {
      expect(programDurationHours(p)).toBeGreaterThan(0);
    }
  });

  it("contains a meaningful amount of content", () => {
    expect(totalLessonCount()).toBeGreaterThanOrEqual(20);
  });

  it("resource/video lessons carry a URL as their content", () => {
    for (const p of CURRICULUM) {
      for (const m of p.modules) {
        for (const l of m.lessons) {
          if (l.type === "RESOURCE" || l.type === "VIDEO") {
            expect(l.content).toMatch(/^https?:\/\//);
          }
        }
      }
    }
  });
});

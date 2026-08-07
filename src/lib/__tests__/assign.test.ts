import { describe, it, expect } from "vitest";
import { programsToAssign } from "../assign";

const programs = [
  { id: "p1", status: "PUBLISHED", category: "Human Resources" },
  { id: "p2", status: "PUBLISHED", category: "Human Resources" },
  { id: "p3", status: "DRAFT", category: "Human Resources" }, // draft — excluded
  { id: "p4", status: "PUBLISHED", category: "Sales & Business Development" },
  { id: "p5", status: "PUBLISHED", category: null },
];

describe("programsToAssign", () => {
  it("returns published programs matching the category", () => {
    expect(programsToAssign(programs, "Human Resources").sort()).toEqual(["p1", "p2"]);
  });

  it("excludes drafts and other categories", () => {
    const ids = programsToAssign(programs, "Human Resources");
    expect(ids).not.toContain("p3"); // draft
    expect(ids).not.toContain("p4"); // other category
  });

  it("returns nothing when the department has no mapped track", () => {
    expect(programsToAssign(programs, null)).toEqual([]);
    expect(programsToAssign(programs, "")).toEqual([]);
  });

  it("returns nothing for a category with no published programs", () => {
    expect(programsToAssign(programs, "Nonexistent")).toEqual([]);
  });
});

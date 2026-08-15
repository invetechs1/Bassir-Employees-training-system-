import { describe, it, expect } from "vitest";
import { programsToAssign, visibleProgramIds } from "../assign";

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

const catalog = [
  { id: "p1", category: "Human Resources" },
  { id: "p2", category: "Human Resources" },
  { id: "p4", category: "Sales & Business Development" },
  { id: "p5", category: null },
];

describe("visibleProgramIds", () => {
  it("shows every course in the employee's department track", () => {
    const visible = visibleProgramIds(catalog, "Human Resources", []);
    expect([...visible].sort()).toEqual(["p1", "p2"]);
  });

  it("also shows courses assigned to the employee by name (enrolled)", () => {
    const visible = visibleProgramIds(catalog, "Human Resources", ["p4"]);
    expect([...visible].sort()).toEqual(["p1", "p2", "p4"]);
  });

  it("hides courses from other departments the employee is not enrolled in", () => {
    const visible = visibleProgramIds(catalog, "Human Resources", []);
    expect(visible.has("p4")).toBe(false);
    expect(visible.has("p5")).toBe(false);
  });

  it("with no department mapping, shows only individually-assigned courses", () => {
    const visible = visibleProgramIds(catalog, null, ["p4"]);
    expect([...visible]).toEqual(["p4"]);
  });

  it("shows nothing to an employee with no department and no assignments", () => {
    expect(visibleProgramIds(catalog, null, []).size).toBe(0);
  });
});

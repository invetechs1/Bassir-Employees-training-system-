import { describe, it, expect } from "vitest";
import { publishedPositionPrograms } from "../assign";

const programs = [
  { id: "p1", status: "PUBLISHED" },
  { id: "p2", status: "PUBLISHED" },
  { id: "p3", status: "DRAFT" }, // unpublished — excluded
  { id: "p4", status: "ARCHIVED" }, // archived — excluded
  { id: "p5", status: "PUBLISHED" },
];

describe("publishedPositionPrograms", () => {
  it("keeps only the mapped courses that are currently published", () => {
    expect(publishedPositionPrograms(programs, ["p1", "p2", "p3"])).toEqual([
      "p1",
      "p2",
    ]);
  });

  it("drops mapped courses that were unpublished or archived", () => {
    const ids = publishedPositionPrograms(programs, ["p3", "p4", "p5"]);
    expect(ids).toEqual(["p5"]);
    expect(ids).not.toContain("p3");
    expect(ids).not.toContain("p4");
  });

  it("ignores mapped ids that no longer exist in the catalog", () => {
    expect(publishedPositionPrograms(programs, ["p1", "ghost"])).toEqual(["p1"]);
  });

  it("preserves the order of the linked ids, not the catalog order", () => {
    expect(publishedPositionPrograms(programs, ["p5", "p1"])).toEqual([
      "p5",
      "p1",
    ]);
  });

  it("returns nothing for an empty mapping", () => {
    expect(publishedPositionPrograms(programs, [])).toEqual([]);
  });
});

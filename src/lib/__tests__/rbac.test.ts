import { describe, it, expect } from "vitest";
import { can, permissionsForRoles, SYSTEM_ROLES } from "../rbac";

describe("rbac.can", () => {
  it("grants everything to a tenant owner regardless of roles", () => {
    expect(can({ roles: [], isTenantOwner: true }, "role.manage")).toBe(true);
    expect(can({ roles: ["learner"], isTenantOwner: true }, "user.manage")).toBe(
      true
    );
  });

  it("grants all catalog permissions to admin", () => {
    expect(can({ roles: ["admin"] }, "org.manage")).toBe(true);
    expect(can({ roles: ["admin"] }, "training.program.create")).toBe(true);
  });

  it("limits an employee (learner) to self-service", () => {
    expect(can({ roles: ["learner"] }, "training.enroll.self")).toBe(true);
    expect(can({ roles: ["learner"] }, "user.manage")).toBe(false);
    expect(can({ roles: ["learner"] }, "report.view")).toBe(false);
  });

  it("lets HR manage people and programs but not org settings", () => {
    expect(can({ roles: ["hr_manager"] }, "user.manage")).toBe(true);
    expect(can({ roles: ["hr_manager"] }, "training.program.manage")).toBe(true);
    expect(can({ roles: ["hr_manager"] }, "org.manage")).toBe(false);
  });

  it("aggregates permissions across multiple roles", () => {
    const set = permissionsForRoles(["learner", "manager"]);
    expect(set.has("report.view")).toBe(true); // from manager
    expect(set.has("training.enroll.self")).toBe(true); // from learner
  });

  it("defines the four system roles", () => {
    expect(Object.keys(SYSTEM_ROLES).sort()).toEqual([
      "admin",
      "hr_manager",
      "learner",
      "manager",
    ]);
  });
});

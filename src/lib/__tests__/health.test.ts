import { describe, it, expect } from "vitest";
import { buildHealthReport } from "../health";

const NOW = new Date("2026-01-01T00:00:00.000Z");

describe("health report", () => {
  it("reports ok when the database is up", () => {
    const r = buildHealthReport({ dbUp: true, uptimeSeconds: 12.7, version: "1.2.3", now: NOW });
    expect(r.ok).toBe(true);
    expect(r.status).toBe("ok");
    expect(r.db).toBe("up");
    expect(r.uptimeSeconds).toBe(13); // rounded
    expect(r.version).toBe("1.2.3");
    expect(r.timestamp).toBe("2026-01-01T00:00:00.000Z");
  });

  it("reports degraded + not-ok when the database is down", () => {
    const r = buildHealthReport({ dbUp: false, uptimeSeconds: 1, version: "dev", now: NOW });
    expect(r.ok).toBe(false);
    expect(r.status).toBe("degraded");
    expect(r.db).toBe("down");
  });
});

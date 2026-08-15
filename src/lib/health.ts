import { prisma } from "@/lib/prisma";

/**
 * Health reporting for uptime monitors, load-balancer probes, and container
 * HEALTHCHECKs. Kept separate from the route handler so the report shape is
 * unit-testable without a running server.
 */

export interface HealthReport {
  ok: boolean;
  status: "ok" | "degraded";
  db: "up" | "down";
  uptimeSeconds: number;
  version: string;
  timestamp: string;
}

/** Pure builder — no I/O, easy to test. */
export function buildHealthReport(params: {
  dbUp: boolean;
  uptimeSeconds: number;
  version: string;
  now: Date;
}): HealthReport {
  const { dbUp, uptimeSeconds, version, now } = params;
  return {
    ok: dbUp,
    status: dbUp ? "ok" : "degraded",
    db: dbUp ? "up" : "down",
    uptimeSeconds: Math.round(uptimeSeconds),
    version,
    timestamp: now.toISOString(),
  };
}

/** Lightweight DB liveness probe (runs outside any tenant context). */
export async function databaseOk(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/** Compose a full health report against live dependencies. */
export async function healthReport(): Promise<HealthReport> {
  const dbUp = await databaseOk();
  return buildHealthReport({
    dbUp,
    uptimeSeconds: process.uptime(),
    version: process.env.APP_VERSION ?? "dev",
    now: new Date(),
  });
}

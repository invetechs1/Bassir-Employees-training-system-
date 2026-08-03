import { NextResponse } from "next/server";
import { healthReport } from "@/lib/health";

// Always evaluated live; never cached or statically rendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health — liveness/readiness probe.
 * Returns 200 when the app and database are healthy, 503 otherwise, with a
 * small JSON body suitable for uptime monitors and load balancers.
 */
export async function GET() {
  const report = await healthReport();
  return NextResponse.json(report, {
    status: report.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}

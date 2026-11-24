/**
 * Teacher-agent runner endpoint.
 *
 * Intended to be called on a schedule (e.g. monthly) by an external cron / the
 * platform scheduler. Protected by a shared secret: send the `CRON_SECRET`
 * value in the `x-cron-secret` header (or `Authorization: Bearer <secret>`).
 *
 *   curl -X POST https://<host>/api/teacher-agent/run -H "x-cron-secret: $CRON_SECRET"
 *
 * Runs the monthly pipeline for every tenant and returns a per-tenant summary.
 * Disabled (503) until CRON_SECRET is configured.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runTeacherAgentForTenant } from "@/lib/teacher/pipeline";

export const dynamic = "force-dynamic";
// Content generation can take a while per tenant; allow a long budget.
export const maxDuration = 300;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header =
    req.headers.get("x-cron-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  return header === secret;
}

export async function POST(req: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "Teacher agent is not configured (set CRON_SECRET)." },
      { status: 503 }
    );
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The tenants table is not tenant-scoped; the per-tenant work below runs
  // under each tenant's RLS context via withTenant.
  const tenants = await prisma.tenant.findMany({
    where: { status: { in: ["ACTIVE", "TRIAL"] } },
    select: { id: true, slug: true },
  });

  const results = [];
  for (const t of tenants) {
    try {
      const r = await runTeacherAgentForTenant(t.id);
      results.push({ slug: t.slug, ...r });
    } catch (e) {
      results.push({
        slug: t.slug,
        tenantId: t.id,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ ranAt: new Date().toISOString(), tenants: results });
}

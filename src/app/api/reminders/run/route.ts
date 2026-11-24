/**
 * Training-reminder runner endpoint.
 *
 * Call on a schedule (e.g. daily) to email employees about assigned courses
 * that are due soon or overdue. Protected by the shared CRON_SECRET (same as
 * the teacher-agent runner): send it in `x-cron-secret` or `Authorization:
 * Bearer <secret>`. Disabled (503) until CRON_SECRET is configured.
 *
 *   curl -X POST https://<host>/api/reminders/run -H "x-cron-secret: $CRON_SECRET"
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runRemindersForTenant } from "@/lib/reminders";

export const dynamic = "force-dynamic";
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
      { error: "Reminders are not configured (set CRON_SECRET)." },
      { status: 503 }
    );
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenants = await prisma.tenant.findMany({
    where: { status: { in: ["ACTIVE", "TRIAL"] } },
    select: { id: true, slug: true },
  });

  const results = [];
  for (const t of tenants) {
    try {
      const r = await runRemindersForTenant(t.id);
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

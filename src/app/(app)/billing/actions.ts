"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { seatLimit, planConfig } from "@/lib/plans";

const Schema = z.object({ plan: z.enum(["STARTER", "GROWTH", "ENTERPRISE"]) });

/**
 * Change the company's subscription plan. Owner / org.manage only. Downgrades
 * are blocked while active seat usage exceeds the target plan's limit.
 * (Payment processing is a separate future integration.)
 */
export async function changePlanAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const allowed = session.isTenantOwner || can(session, "org.manage");
  if (!allowed) redirect("/dashboard?forbidden=1");

  const parsed = Schema.safeParse({ plan: formData.get("plan") });
  if (!parsed.success) redirect("/billing?err=invalid");
  const target = parsed.data.plan;

  const limit = seatLimit(target);
  if (limit !== null) {
    const used = await withTenant(session.tenantId, (tx) =>
      tx.user.count({ where: { status: { in: ["ACTIVE", "INVITED"] } } })
    );
    if (used > limit) {
      redirect(`/billing?err=seats&need=${used}&limit=${limit}`);
    }
  }

  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: { plan: target },
  });
  await withTenant(session.tenantId, (tx) =>
    tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "billing.plan.change",
        entity: "Tenant",
        entityId: session.tenantId,
        metadata: { plan: target },
      },
    })
  );

  revalidatePath("/billing");
  redirect(`/billing?ok=${planConfig(target).name}`);
}

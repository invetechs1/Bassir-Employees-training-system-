"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";

const AwardSchema = z.object({
  certificationId: z.string().min(1),
  userId: z.string().min(1),
});

/** Issue a certification to an employee. Requires training.program.manage. */
export async function awardCertificationAction(
  formData: FormData
): Promise<void> {
  const session = await requireSession();
  if (!can(session, "training.program.manage")) return;

  const parsed = AwardSchema.safeParse({
    certificationId: formData.get("certificationId"),
    userId: formData.get("userId"),
  });
  if (!parsed.success) return;
  const { certificationId, userId } = parsed.data;

  await withTenant(session.tenantId, async (tx) => {
    const cert = await tx.certification.findFirst({
      where: { id: certificationId },
    });
    if (!cert) return;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + cert.validityMonths);

    await tx.certificationAward.upsert({
      where: {
        certificationId_userId: { certificationId, userId },
      },
      create: { tenantId: session.tenantId, certificationId, userId, expiresAt },
      update: { issuedAt: new Date(), expiresAt },
    });

    await tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "certification.award",
        entity: "Certification",
        entityId: certificationId,
      },
    });
  });

  revalidatePath("/certifications");
}

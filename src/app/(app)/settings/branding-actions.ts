"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";

const Schema = z.object({
  brandColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Use a hex color like #2953d9")
    .or(z.literal("")),
  logoUrl: z
    .string()
    .trim()
    .url("Enter a valid image URL")
    .or(z.literal("")),
});

export interface BrandingState {
  error?: string;
  ok?: boolean;
}

export async function updateBrandingAction(
  _prev: BrandingState,
  formData: FormData
): Promise<BrandingState> {
  const session = await requireSession();
  if (!(session.isTenantOwner || can(session, "org.manage"))) {
    return { error: "You do not have permission to change branding." };
  }

  const parsed = Schema.safeParse({
    brandColor: formData.get("brandColor"),
    logoUrl: formData.get("logoUrl"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: {
      brandColor: parsed.data.brandColor || null,
      logoUrl: parsed.data.logoUrl || null,
    },
  });
  await withTenant(session.tenantId, (tx) =>
    tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "branding.update",
      },
    })
  );

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

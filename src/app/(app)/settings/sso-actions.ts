"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { planHasFeature } from "@/lib/plans";

const Schema = z.object({
  issuer: z.string().trim().url("Enter the provider's issuer URL"),
  clientId: z.string().trim().min(1, "Client ID is required"),
  clientSecret: z.string(), // blank on update = keep existing
  enabled: z.union([z.literal("on"), z.null()]).optional(),
  autoProvision: z.union([z.literal("on"), z.null()]).optional(),
  defaultRoleKey: z.enum(["learner", "manager", "hr_manager", "admin"]),
  allowedDomain: z.string().trim().optional().or(z.literal("")),
});

export interface SsoState {
  error?: string;
  ok?: boolean;
}

export async function saveSsoAction(
  _prev: SsoState,
  formData: FormData
): Promise<SsoState> {
  const session = await requireSession();
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { plan: true },
  });
  if (!session.isTenantOwner || !planHasFeature(tenant?.plan ?? "STARTER", "sso")) {
    return { error: "SSO is available to owners on the Enterprise plan." };
  }

  const parsed = Schema.safeParse({
    issuer: formData.get("issuer"),
    clientId: formData.get("clientId"),
    clientSecret: formData.get("clientSecret") ?? "",
    enabled: formData.get("enabled"),
    autoProvision: formData.get("autoProvision"),
    defaultRoleKey: formData.get("defaultRoleKey"),
    allowedDomain: formData.get("allowedDomain"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  const existing = await prisma.ssoConnection.findUnique({
    where: { tenantId: session.tenantId },
  });
  const secret = d.clientSecret.trim() || existing?.clientSecret;
  if (!secret) {
    return { error: "Client secret is required." };
  }

  await prisma.ssoConnection.upsert({
    where: { tenantId: session.tenantId },
    create: {
      tenantId: session.tenantId,
      issuer: d.issuer,
      clientId: d.clientId,
      clientSecret: secret,
      enabled: d.enabled === "on",
      autoProvision: d.autoProvision === "on",
      defaultRoleKey: d.defaultRoleKey,
      allowedDomain: d.allowedDomain || null,
    },
    update: {
      issuer: d.issuer,
      clientId: d.clientId,
      clientSecret: secret,
      enabled: d.enabled === "on",
      autoProvision: d.autoProvision === "on",
      defaultRoleKey: d.defaultRoleKey,
      allowedDomain: d.allowedDomain || null,
    },
  });
  await withTenant(session.tenantId, (tx) =>
    tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "sso.configure",
      },
    })
  );

  revalidatePath("/settings");
  return { ok: true };
}

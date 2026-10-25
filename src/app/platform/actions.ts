"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePlatform, clearPlatformCookie } from "@/lib/platform";
import { prisma } from "@/lib/prisma";
import { provisionTenant } from "@/lib/provisioning";

export async function platformLogoutAction(): Promise<void> {
  await clearPlatformCookie();
  redirect("/platform/login");
}

const PlanSchema = z.object({
  tenantId: z.string().min(1),
  plan: z.enum(["STARTER", "GROWTH", "ENTERPRISE"]),
});

export async function setTenantPlanAction(formData: FormData): Promise<void> {
  await requirePlatform();
  const parsed = PlanSchema.safeParse({
    tenantId: formData.get("tenantId"),
    plan: formData.get("plan"),
  });
  if (!parsed.success) redirect("/platform");
  await prisma.tenant.update({
    where: { id: parsed.data.tenantId },
    data: { plan: parsed.data.plan },
  });
  revalidatePath("/platform");
  redirect(`/platform/${parsed.data.tenantId}?ok=plan`);
}

const StatusSchema = z.object({
  tenantId: z.string().min(1),
  status: z.enum(["ACTIVE", "SUSPENDED", "TRIAL", "CANCELLED"]),
});

export async function setTenantStatusAction(formData: FormData): Promise<void> {
  await requirePlatform();
  const parsed = StatusSchema.safeParse({
    tenantId: formData.get("tenantId"),
    status: formData.get("status"),
  });
  if (!parsed.success) redirect("/platform");
  await prisma.tenant.update({
    where: { id: parsed.data.tenantId },
    data: { status: parsed.data.status },
  });
  revalidatePath("/platform");
  redirect(`/platform/${parsed.data.tenantId}?ok=status`);
}

const ProvisionSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  industry: z.enum([
    "ENGINEERING_CONSULTANCY",
    "CONSTRUCTION_CONTRACTING",
    "LOGISTICS",
    "MANUFACTURING",
    "FINANCE",
    "HEALTHCARE",
    "TECHNOLOGY",
    "RETAIL",
    "OTHER",
  ]),
  adminName: z.string().trim().min(2),
  adminEmail: z.string().trim().email(),
  adminPassword: z.string().min(8),
});

export interface ProvisionState {
  error?: string;
}

export async function provisionTenantAction(
  _prev: ProvisionState,
  formData: FormData
): Promise<ProvisionState> {
  await requirePlatform();
  const parsed = ProvisionSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    industry: formData.get("industry"),
    adminName: formData.get("adminName"),
    adminEmail: formData.get("adminEmail"),
    adminPassword: formData.get("adminPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const result = await provisionTenant(parsed.data);
  if (!result.ok) {
    return { error: result.error ?? "Could not provision the company." };
  }
  revalidatePath("/platform");
  redirect(`/platform/${result.tenantId}?ok=created`);
}

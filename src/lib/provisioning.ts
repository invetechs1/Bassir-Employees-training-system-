import type { Industry } from "@prisma/client";
import { prisma } from "./prisma";
import { withTenant } from "./tenant-db";
import { hashPassword } from "./password";
import { PERMISSIONS, SYSTEM_ROLES } from "./rbac";

export interface ProvisionInput {
  name: string;
  slug: string;
  industry: Industry;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface ProvisionResult {
  ok: boolean;
  error?: string;
  tenantId?: string;
}

/**
 * Provision a brand-new company (tenant) + its first administrator, with the
 * four system roles and their permission grants. No demo data. Shared by the
 * CLI script and the platform-admin console.
 */
export async function provisionTenant(
  input: ProvisionInput
): Promise<ProvisionResult> {
  const slug = input.slug.trim().toLowerCase();
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) {
    return { ok: false, error: "Slug must be lowercase letters, numbers or hyphens." };
  }
  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) {
    return { ok: false, error: `A company with slug "${slug}" already exists.` };
  }

  // Ensure the global permission catalog exists.
  for (const [key, description] of Object.entries(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { key },
      create: { key, description, category: key.split(".")[0] },
      update: { description },
    });
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: input.name,
      slug,
      industry: input.industry,
      status: "ACTIVE",
      plan: "GROWTH",
    },
  });

  const [firstName, ...rest] = input.adminName.trim().split(" ");
  const lastName = rest.join(" ") || "Admin";
  const passwordHash = await hashPassword(input.adminPassword);

  await withTenant(tenant.id, async (tx) => {
    const roleByKey: Record<string, string> = {};
    for (const [key, def] of Object.entries(SYSTEM_ROLES)) {
      const role = await tx.role.create({
        data: {
          tenantId: tenant.id,
          key,
          name: def.name,
          description: def.description,
          isSystem: true,
        },
      });
      roleByKey[key] = role.id;
      const perms = await tx.permission.findMany({
        where: { key: { in: [...def.permissions] } },
      });
      await tx.rolePermission.createMany({
        data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
        skipDuplicates: true,
      });
    }

    const owner = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: input.adminEmail.trim().toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        jobTitle: "Administrator",
        isTenantOwner: true,
        status: "ACTIVE",
      },
    });
    await tx.userRole.create({ data: { userId: owner.id, roleId: roleByKey.admin } });
  });

  return { ok: true, tenantId: tenant.id };
}

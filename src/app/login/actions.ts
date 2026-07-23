"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/session";

const LoginSchema = z.object({
  company: z.string().trim().min(1, "Company is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  next: z.string().optional(),
});

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    company: formData.get("company"),
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { company, email, password } = parsed.data;

  // Resolving a tenant by slug happens BEFORE a tenant context exists, so this
  // read goes through the base client (the `tenants` table is not RLS-scoped).
  const tenant = await prisma.tenant.findUnique({ where: { slug: company } });
  if (!tenant || tenant.status === "CANCELLED" || tenant.status === "SUSPENDED") {
    return { error: "Invalid company, email or password" };
  }

  const result = await withTenant(tenant.id, async (tx) => {
    const user = await tx.user.findFirst({
      where: { email, status: "ACTIVE" },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) return null;

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return null;

    await tx.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await tx.auditLog.create({
      data: { tenantId: tenant.id, actorId: user.id, action: "user.login" },
    });

    return {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      isTenantOwner: user.isTenantOwner,
      roles: user.userRoles.map((ur) => ur.role.key),
      mustChangePassword: user.mustChangePassword,
    };
  });

  if (!result) {
    return { error: "Invalid company, email or password" };
  }

  const token = await createSessionToken({
    userId: result.userId,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    email: result.email,
    name: result.name,
    roles: result.roles,
    isTenantOwner: result.isTenantOwner,
    mustChangePassword: result.mustChangePassword,
  });
  await setSessionCookie(token);

  // New / admin-invited employees must set their own password first.
  if (result.mustChangePassword) {
    redirect("/account/password");
  }

  const next = parsed.data.next;
  redirect(next && next.startsWith("/") ? next : "/dashboard");
}

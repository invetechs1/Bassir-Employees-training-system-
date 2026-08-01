"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { hashPassword } from "@/lib/password";
import { hashToken } from "@/lib/reset-token";
import { createSessionToken, setSessionCookie } from "@/lib/session";

const Schema = z
  .object({
    slug: z.string().min(1),
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(1),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export interface ResetState {
  error?: string;
}

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = Schema.safeParse({
    slug: formData.get("slug"),
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { slug, token, password } = parsed.data;

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return { error: "This reset link is no longer valid." };

  const tokenHash = hashToken(token);

  const result = await withTenant(tenant.id, async (tx) => {
    const user = await tx.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        status: "ACTIVE",
        resetExpiresAt: { gt: new Date() },
      },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) return null;

    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(password),
        // A successful reset proves control of the mailbox, so the address is
        // now verified and any forced-change flag is cleared. The one-time
        // reset token is consumed.
        mustChangePassword: false,
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
        resetTokenHash: null,
        resetExpiresAt: null,
        lastLoginAt: new Date(),
      },
    });
    await tx.auditLog.create({
      data: {
        tenantId: tenant.id,
        actorId: user.id,
        action: "user.password.reset",
        entity: "User",
        entityId: user.id,
      },
    });

    return {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      isTenantOwner: user.isTenantOwner,
      roles: user.userRoles.map((ur) => ur.role.key),
    };
  });

  if (!result) {
    return {
      error:
        "This reset link is invalid or has expired. Request a new one from the sign-in page.",
    };
  }

  const sessionToken = await createSessionToken({
    userId: result.userId,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    email: result.email,
    name: result.name,
    roles: result.roles,
    isTenantOwner: result.isTenantOwner,
    mustChangePassword: false,
  });
  await setSessionCookie(sessionToken);

  redirect("/dashboard");
}

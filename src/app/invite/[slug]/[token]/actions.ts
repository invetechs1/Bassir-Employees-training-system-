"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { hashPassword } from "@/lib/password";
import { hashInviteToken } from "@/lib/invite-token";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { assignDepartmentCourses } from "@/lib/assign";

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

export interface AcceptState {
  error?: string;
}

export async function acceptInviteAction(
  _prev: AcceptState,
  formData: FormData
): Promise<AcceptState> {
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
  if (!tenant) return { error: "This invitation is no longer valid." };

  const tokenHash = hashInviteToken(token);

  const result = await withTenant(tenant.id, async (tx) => {
    const user = await tx.user.findFirst({
      where: {
        inviteTokenHash: tokenHash,
        status: "INVITED",
        inviteExpiresAt: { gt: new Date() },
      },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) return null;

    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(password),
        status: "ACTIVE",
        mustChangePassword: false,
        // Accepting an emailed invite proves control of the mailbox.
        emailVerifiedAt: new Date(),
        inviteTokenHash: null,
        inviteExpiresAt: null,
        lastLoginAt: new Date(),
      },
    });
    await tx.auditLog.create({
      data: {
        tenantId: tenant.id,
        actorId: user.id,
        action: "user.invite.accept",
        entity: "User",
        entityId: user.id,
      },
    });

    // Auto-enroll the new hire into their department's training track (if set).
    await assignDepartmentCourses(tx, tenant.id, user.id);

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
      error: "This invitation is invalid or has expired. Ask an administrator to resend it.",
    };
  }

  // Sign the new employee in immediately.
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

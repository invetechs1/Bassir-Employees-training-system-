"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { hashPassword } from "@/lib/password";
import { generateTempPassword } from "@/lib/temp-password";
import {
  generateInviteToken,
  hashInviteToken,
  inviteLink,
  INVITE_TTL_DAYS,
} from "@/lib/invite-token";
import { sendMail, invitationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { seatLimit, planConfig } from "@/lib/plans";
import { brandingOf } from "@/lib/branding";

const ASSIGNABLE_ROLES = ["learner", "manager", "hr_manager", "admin"] as const;

const InviteSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  roleKey: z.enum(ASSIGNABLE_ROLES),
  departmentId: z.string().optional().or(z.literal("")),
});

export interface InviteState {
  error?: string;
  ok?: boolean;
  createdEmail?: string;
  // The accept link is always returned so the admin can share it manually if
  // email delivery isn't configured or fails.
  inviteLink?: string;
  emailSent?: boolean;
}

export async function inviteUserAction(
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  const session = await requireSession();
  if (!can(session, "user.manage")) {
    return { error: "You do not have permission to add employees." };
  }

  const parsed = InviteSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    jobTitle: formData.get("jobTitle"),
    roleKey: formData.get("roleKey"),
    departmentId: formData.get("departmentId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  // Only a tenant owner may mint new administrators.
  if (data.roleKey === "admin" && !session.isTenantOwner) {
    return { error: "Only the account owner can create administrators." };
  }

  // Seat limit enforcement based on the company's plan.
  const tenantForSeats = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { plan: true },
  });
  const limit = seatLimit(tenantForSeats?.plan ?? "STARTER");
  if (limit !== null) {
    const used = await withTenant(session.tenantId, (tx) =>
      tx.user.count({ where: { status: { in: ["ACTIVE", "INVITED"] } } })
    );
    if (used >= limit) {
      return {
        error: `Your ${planConfig(tenantForSeats?.plan ?? "STARTER").name} plan is limited to ${limit} seats (all in use). Upgrade your plan to add more employees.`,
      };
    }
  }

  // The invited user has no usable password until they accept; store a random
  // unguessable hash as a placeholder.
  const placeholderHash = await hashPassword(generateTempPassword(24));
  const rawToken = generateInviteToken();
  const inviteExpiresAt = new Date(
    Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const result = await withTenant(session.tenantId, async (tx) => {
    const role = await tx.role.findFirst({ where: { key: data.roleKey } });
    if (!role) return { err: "That role does not exist." as string };

    try {
      const user = await tx.user.create({
        data: {
          tenantId: session.tenantId,
          email: data.email,
          passwordHash: placeholderHash,
          firstName: data.firstName,
          lastName: data.lastName,
          jobTitle: data.jobTitle || null,
          departmentId: data.departmentId || null,
          status: "INVITED",
          mustChangePassword: false,
          inviteTokenHash: hashInviteToken(rawToken),
          inviteExpiresAt,
        },
      });
      await tx.userRole.create({ data: { userId: user.id, roleId: role.id } });
      await tx.auditLog.create({
        data: {
          tenantId: session.tenantId,
          actorId: session.userId,
          action: "user.invite",
          entity: "User",
          entityId: user.id,
        },
      });
      return { ok: true as const };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { err: "An employee with that email already exists." };
      }
      throw e;
    }
  });

  if ("err" in result && result.err) {
    return { error: result.err };
  }

  // Company name + branding for the email (tenants table is not tenant-scoped).
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { name: true, slug: true, brandColor: true, logoUrl: true },
  });
  const link = inviteLink(tenant?.slug ?? session.tenantSlug, rawToken);
  const brand = tenant ? brandingOf(tenant) : null;
  const mail = invitationEmail({
    companyName: tenant?.name ?? "your company",
    inviteeName: data.firstName,
    link,
    brand: brand
      ? { color: brand.color, logoUrl: brand.logoUrl, initial: brand.initial }
      : undefined,
  });
  const { sent } = await sendMail({ to: data.email, ...mail });

  revalidatePath("/people");
  return { ok: true, createdEmail: data.email, inviteLink: link, emailSent: sent };
}

const IdSchema = z.object({ userId: z.string().min(1) });

export async function setUserStatusAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!can(session, "user.manage")) return;

  const parsed = z
    .object({ userId: z.string().min(1), disable: z.enum(["true", "false"]) })
    .safeParse({
      userId: formData.get("userId"),
      disable: formData.get("disable"),
    });
  if (!parsed.success) return;
  if (parsed.data.userId === session.userId) return; // never disable yourself

  await withTenant(session.tenantId, async (tx) => {
    const target = await tx.user.findFirst({ where: { id: parsed.data.userId } });
    if (!target || target.isTenantOwner) return; // never disable the owner
    await tx.user.update({
      where: { id: target.id },
      data: { status: parsed.data.disable === "true" ? "DISABLED" : "ACTIVE" },
    });
    await tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: parsed.data.disable === "true" ? "user.disable" : "user.enable",
        entity: "User",
        entityId: target.id,
      },
    });
  });

  revalidatePath("/people");
}

export interface ResetState {
  error?: string;
  ok?: boolean;
  resetEmail?: string;
  tempPassword?: string;
}

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const session = await requireSession();
  if (!can(session, "user.manage")) {
    return { error: "You do not have permission to reset passwords." };
  }
  const parsed = IdSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { error: "Invalid request" };

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const result = await withTenant(session.tenantId, async (tx) => {
    const target = await tx.user.findFirst({ where: { id: parsed.data.userId } });
    if (!target) return null;
    await tx.user.update({
      where: { id: target.id },
      data: { passwordHash, mustChangePassword: true },
    });
    await tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "user.password.reset",
        entity: "User",
        entityId: target.id,
      },
    });
    return { email: target.email };
  });

  if (!result) return { error: "Employee not found" };
  revalidatePath("/people");
  return { ok: true, resetEmail: result.email, tempPassword };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { hashPassword } from "@/lib/password";
import { generateTempPassword } from "@/lib/temp-password";

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
  // Shown once to the admin so they can hand the credentials to the employee.
  createdEmail?: string;
  tempPassword?: string;
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

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const result = await withTenant(session.tenantId, async (tx) => {
    const role = await tx.role.findFirst({ where: { key: data.roleKey } });
    if (!role) return { err: "That role does not exist." as string };

    try {
      const user = await tx.user.create({
        data: {
          tenantId: session.tenantId,
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          jobTitle: data.jobTitle || null,
          departmentId: data.departmentId || null,
          status: "ACTIVE",
          mustChangePassword: true,
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

  revalidatePath("/people");
  return { ok: true, createdEmail: data.email, tempPassword };
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

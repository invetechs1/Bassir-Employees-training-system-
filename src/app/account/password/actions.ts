"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { withTenant } from "@/lib/tenant-db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/session";

const Schema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(8, "New password must be at least 8 characters"),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.next === d.confirm, {
    message: "New passwords do not match",
    path: ["confirm"],
  })
  .refine((d) => d.next !== d.current, {
    message: "New password must be different from the current one",
    path: ["next"],
  });

export interface PasswordState {
  error?: string;
}

export async function changeOwnPasswordAction(
  _prev: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const session = await requireSession();

  const parsed = Schema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ok = await withTenant(session.tenantId, async (tx) => {
    const user = await tx.user.findFirst({ where: { id: session.userId } });
    if (!user) return false;

    const valid = await verifyPassword(parsed.data.current, user.passwordHash);
    if (!valid) return false;

    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(parsed.data.next),
        mustChangePassword: false,
      },
    });
    await tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: user.id,
        action: "user.password.change",
      },
    });
    return true;
  });

  if (!ok) {
    return { error: "Your current password is incorrect" };
  }

  // Re-issue the session so the mustChangePassword flag is cleared.
  const token = await createSessionToken({ ...session, mustChangePassword: false });
  await setSessionCookie(token);

  redirect("/dashboard");
}

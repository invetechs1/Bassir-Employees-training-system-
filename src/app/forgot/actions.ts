"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import {
  generateToken,
  hashToken,
  resetLink,
  RESET_TTL_MINUTES,
} from "@/lib/reset-token";
import { sendMail, passwordResetEmail } from "@/lib/email";
import { brandingOf } from "@/lib/branding";

const Schema = z.object({
  company: z.string().trim().min(1, "Company is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export interface ForgotState {
  error?: string;
  done?: boolean;
}

// A single generic outcome for every valid submission — whether or not a
// matching account exists — so the form cannot be used to discover which
// emails are registered (no user enumeration).
const GENERIC_DONE: ForgotState = { done: true };

export async function forgotAction(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  const parsed = Schema.safeParse({
    company: formData.get("company"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { company, email } = parsed.data;

  // Resolving a tenant by slug happens before a tenant context exists (the
  // `tenants` table is not RLS-scoped).
  const tenant = await prisma.tenant.findUnique({ where: { slug: company } });
  if (!tenant || tenant.status === "CANCELLED" || tenant.status === "SUSPENDED") {
    return GENERIC_DONE;
  }

  // Mint the raw token OUTSIDE the transaction so we can email it after; only
  // its hash is ever written to the database.
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);

  const recipient = await withTenant(tenant.id, async (tx) => {
    const user = await tx.user.findFirst({
      where: { email, status: "ACTIVE" },
    });
    if (!user) return null;

    await tx.user.update({
      where: { id: user.id },
      data: { resetTokenHash: tokenHash, resetExpiresAt: expiresAt },
    });
    await tx.auditLog.create({
      data: {
        tenantId: tenant.id,
        actorId: user.id,
        action: "user.password.reset_request",
        entity: "User",
        entityId: user.id,
      },
    });
    return { name: `${user.firstName} ${user.lastName}`.trim(), email: user.email };
  });

  if (recipient) {
    const link = resetLink(tenant.slug, rawToken);
    const brand = brandingOf(tenant);
    const mail = passwordResetEmail({
      companyName: tenant.name,
      userName: recipient.name || recipient.email,
      link,
      ttlMinutes: RESET_TTL_MINUTES,
      brand: { color: brand.color, logoUrl: brand.logoUrl, initial: brand.initial },
    });
    const res = await sendMail({ to: recipient.email, ...mail });
    if (!res.sent) {
      // SMTP not configured (or failed): surface the link in server logs so an
      // operator can still deliver it manually, mirroring invitations.
      console.info(`[password-reset] link for ${recipient.email}: ${link}`);
    }
  }

  return GENERIC_DONE;
}

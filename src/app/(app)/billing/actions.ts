"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { seatLimit, planConfig } from "@/lib/plans";
import {
  getStripe,
  isStripeEnabled,
  isPaidPlan,
  priceIdForPlan,
} from "@/lib/stripe";

const Schema = z.object({ plan: z.enum(["STARTER", "GROWTH", "ENTERPRISE"]) });

function baseUrl(): string {
  return (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Change the company's subscription plan. Owner / org.manage only. Downgrades
 * are blocked while active seat usage exceeds the target plan's limit.
 * (Payment processing is a separate future integration.)
 */
export async function changePlanAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const allowed = session.isTenantOwner || can(session, "org.manage");
  if (!allowed) redirect("/dashboard?forbidden=1");

  const parsed = Schema.safeParse({ plan: formData.get("plan") });
  if (!parsed.success) redirect("/billing?err=invalid");
  const target = parsed.data.plan;

  const limit = seatLimit(target);
  if (limit !== null) {
    const used = await withTenant(session.tenantId, (tx) =>
      tx.user.count({ where: { status: { in: ["ACTIVE", "INVITED"] } } })
    );
    if (used > limit) {
      redirect(`/billing?err=seats&need=${used}&limit=${limit}`);
    }
  }

  // Paid plan with Stripe configured → go through Stripe Checkout. The plan is
  // applied by the webhook once payment succeeds. (redirect() throws, so this
  // exits the action.)
  const stripe = getStripe();
  const priceId = isPaidPlan(target) ? priceIdForPlan(target) : null;
  if (stripe && isPaidPlan(target) && priceId) {
    let checkoutUrl: string | null = null;
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: session.tenantId },
        select: { name: true, stripeCustomerId: true },
      });
      let customerId = tenant?.stripeCustomerId ?? undefined;
      if (!customerId) {
        const customer = await stripe.customers.create({
          name: tenant?.name ?? undefined,
          email: session.email,
          metadata: { tenantId: session.tenantId },
        });
        customerId = customer.id;
        await prisma.tenant.update({
          where: { id: session.tenantId },
          data: { stripeCustomerId: customerId },
        });
      }
      const checkout = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl()}/billing?checkout=success`,
        cancel_url: `${baseUrl()}/billing?checkout=cancel`,
        metadata: { tenantId: session.tenantId, plan: target },
        subscription_data: { metadata: { tenantId: session.tenantId } },
      });
      checkoutUrl = checkout.url;
    } catch {
      redirect("/billing?err=stripe");
    }
    if (checkoutUrl) redirect(checkoutUrl);
  }

  // Otherwise apply the change in-app (free plan, Stripe disabled, or no price).
  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: { plan: target },
  });
  await withTenant(session.tenantId, (tx) =>
    tx.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "billing.plan.change",
        entity: "Tenant",
        entityId: session.tenantId,
        metadata: { plan: target },
      },
    })
  );

  revalidatePath("/billing");
  redirect(`/billing?ok=${planConfig(target).name}`);
}

/**
 * Open the Stripe Customer Portal so the owner can update payment methods,
 * change or cancel their subscription.
 */
export async function openPortalAction(): Promise<void> {
  const session = await requireSession();
  if (!(session.isTenantOwner || can(session, "org.manage"))) {
    redirect("/dashboard?forbidden=1");
  }
  const stripe = getStripe();
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { stripeCustomerId: true },
  });
  if (!stripe || !tenant?.stripeCustomerId) {
    redirect("/billing");
  }
  let portalUrl: string | null = null;
  try {
    const portal = await stripe!.billingPortal.sessions.create({
      customer: tenant!.stripeCustomerId!,
      return_url: `${baseUrl()}/billing`,
    });
    portalUrl = portal.url;
  } catch {
    redirect("/billing?err=stripe");
  }
  if (portalUrl) redirect(portalUrl);
}

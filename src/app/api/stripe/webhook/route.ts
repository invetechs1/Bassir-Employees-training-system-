import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, planForPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type { PlanTier } from "@/lib/plans";

// Stripe requires the raw request body for signature verification.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", secret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  async function setPlan(
    tenantId: string,
    plan: PlanTier | null,
    subscriptionId?: string | null,
    status?: string
  ) {
    const data: Record<string, unknown> = {};
    if (plan) data.plan = plan;
    if (subscriptionId !== undefined) data.stripeSubscriptionId = subscriptionId;
    if (status !== undefined) data.subscriptionStatus = status;
    if (Object.keys(data).length === 0) return;
    await prisma.tenant.update({ where: { id: tenantId }, data });
  }

  async function tenantIdForCustomer(customerId: string): Promise<string | null> {
    const t = await prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    });
    return t?.id ?? null;
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const tenantId = s.metadata?.tenantId;
      const plan = (s.metadata?.plan as PlanTier | undefined) ?? null;
      if (tenantId) {
        await setPlan(
          tenantId,
          plan,
          typeof s.subscription === "string" ? s.subscription : undefined,
          "active"
        );
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const tenantId =
        (sub.metadata?.tenantId as string | undefined) ??
        (typeof sub.customer === "string"
          ? await tenantIdForCustomer(sub.customer)
          : null);
      const priceId = sub.items.data[0]?.price.id ?? "";
      const plan = planForPriceId(priceId);
      if (tenantId) await setPlan(tenantId, plan, sub.id, sub.status);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const tenantId =
        (sub.metadata?.tenantId as string | undefined) ??
        (typeof sub.customer === "string"
          ? await tenantIdForCustomer(sub.customer)
          : null);
      // Subscription ended → revert to the free Starter plan.
      if (tenantId) await setPlan(tenantId, "STARTER", null, "canceled");
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

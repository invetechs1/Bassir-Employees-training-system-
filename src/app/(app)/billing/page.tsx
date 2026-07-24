import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import {
  PLANS,
  PLAN_ORDER,
  planConfig,
  seatLimit,
  FEATURE_LABEL,
  type FeatureKey,
} from "@/lib/plans";
import { ProgressBar } from "@/components/charts";
import { changePlanAction } from "./actions";

const ALL_FEATURES = Object.keys(FEATURE_LABEL) as FeatureKey[];

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{
    locked?: string;
    err?: string;
    need?: string;
    limit?: string;
    ok?: string;
  }>;
}) {
  const session = await requireSession();
  if (!(session.isTenantOwner || can(session, "org.manage"))) {
    redirect("/dashboard?forbidden=1");
  }
  const sp = await searchParams;

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { plan: true, name: true },
  });
  const currentPlan = tenant?.plan ?? "STARTER";
  const current = planConfig(currentPlan);
  const seats = seatLimit(currentPlan);

  const seatsUsed = await withTenant(session.tenantId, (tx) =>
    tx.user.count({ where: { status: { in: ["ACTIVE", "INVITED"] } } })
  );
  const usagePct = seats ? Math.min(100, Math.round((seatsUsed / seats) * 100)) : 0;

  const lockedFeature = sp.locked as FeatureKey | undefined;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Billing &amp; Plan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage {tenant?.name}&apos;s subscription and seats.
        </p>
      </div>

      {lockedFeature ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <b>{FEATURE_LABEL[lockedFeature] ?? "That feature"}</b> isn&apos;t
          included in your {current.name} plan. Upgrade below to unlock it.
        </div>
      ) : null}
      {sp.ok ? (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Your plan is now <b>{sp.ok}</b>.
        </div>
      ) : null}
      {sp.err === "seats" ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          You have <b>{sp.need}</b> employees but that plan allows only{" "}
          <b>{sp.limit}</b>. Remove or disable employees first, then downgrade.
        </div>
      ) : null}

      {/* Current usage */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Current plan
            </p>
            <p className="mt-0.5 text-lg font-semibold text-slate-900">
              {current.name}
            </p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            {current.priceLabel}
          </span>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-slate-600">Seats used</span>
            <span className="tabular-nums text-slate-500">
              {seatsUsed} / {seats ?? "Unlimited"}
            </span>
          </div>
          {seats ? (
            <ProgressBar
              pct={usagePct}
              variant={usagePct >= 100 ? "amber" : "blue"}
            />
          ) : (
            <p className="text-xs text-slate-400">
              Unlimited seats on the Enterprise plan.
            </p>
          )}
        </div>
      </div>

      {/* Plan comparison */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        Plans
      </h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {PLAN_ORDER.map((tier) => {
          const p = PLANS[tier];
          const isCurrent = tier === currentPlan;
          return (
            <div
              key={tier}
              className={`flex flex-col rounded-xl border bg-white p-5 ${
                isCurrent ? "border-brand-400 ring-1 ring-brand-200" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                {isCurrent ? (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                    Current
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {p.priceLabel}
              </p>
              <p className="mt-1 text-xs text-slate-500">{p.blurb}</p>
              <p className="mt-3 text-xs font-semibold text-slate-600">
                {p.seats ? `${p.seats} seats` : "Unlimited seats"}
              </p>

              <ul className="mt-3 flex-1 space-y-1.5">
                {ALL_FEATURES.map((f) => {
                  const included = p.features.includes(f);
                  return (
                    <li
                      key={f}
                      className={`flex items-center gap-2 text-xs ${
                        included ? "text-slate-700" : "text-slate-300"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {included ? <path d="M20 6L9 17l-5-5" /> : <path d="M18 6L6 18M6 6l12 12" />}
                      </svg>
                      {FEATURE_LABEL[f]}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full cursor-default rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400"
                  >
                    Current plan
                  </button>
                ) : (
                  <form action={changePlanAction}>
                    <input type="hidden" name="plan" value={tier} />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                    >
                      {p.rank > current.rank ? "Upgrade" : "Switch"} to {p.name}
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Plan changes apply immediately. Payment processing (invoicing, cards) is
        handled by your Bassir Technology account manager.
      </p>
    </div>
  );
}

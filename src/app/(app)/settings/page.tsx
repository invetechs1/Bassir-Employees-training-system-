import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { planHasFeature } from "@/lib/plans";
import { getLocale, translator } from "@/lib/i18n";
import { BrandingForm } from "./branding-form";
import { SsoForm } from "./sso-form";

export default async function SettingsPage() {
  const session = await requireSession();
  const t = translator(await getLocale());
  const canBrand = session.isTenantOwner || can(session, "org.manage");

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    include: { ssoConnection: true },
  });
  const showSso =
    session.isTenantOwner && planHasFeature(tenant?.plan ?? "STARTER", "sso");

  const roles = await withTenant(session.tenantId, (tx) =>
    tx.role.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { userRoles: true } } },
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {t("nav.Settings")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("set.subtitle")}</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800">{t("set.company")}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">{t("set.name")}</dt>
            <dd className="text-sm text-slate-800">{tenant?.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">{t("set.slug")}</dt>
            <dd className="text-sm text-slate-800">{tenant?.slug}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">{t("set.industry")}</dt>
            <dd className="text-sm text-slate-800">{tenant?.industry}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">{t("set.plan")}</dt>
            <dd className="text-sm text-slate-800">
              {tenant?.plan ? t(`plan.${tenant.plan}`) : ""}
            </dd>
          </div>
        </dl>
      </section>

      {canBrand ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-800">{t("set.branding")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("set.brandingSub")}</p>
          <div className="mt-4">
            <BrandingForm
              brandColor={tenant?.brandColor ?? ""}
              logoUrl={tenant?.logoUrl ?? ""}
            />
          </div>
        </section>
      ) : null}

      {showSso ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-800">{t("set.sso")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("set.ssoSub")}</p>
          <div className="mt-4">
            <SsoForm
              values={{
                issuer: tenant?.ssoConnection?.issuer ?? "",
                clientId: tenant?.ssoConnection?.clientId ?? "",
                enabled: tenant?.ssoConnection?.enabled ?? false,
                autoProvision: tenant?.ssoConnection?.autoProvision ?? true,
                defaultRoleKey:
                  tenant?.ssoConnection?.defaultRoleKey ?? "learner",
                allowedDomain: tenant?.ssoConnection?.allowedDomain ?? "",
                hasSecret: Boolean(tenant?.ssoConnection?.clientSecret),
                slug: tenant?.slug ?? "",
              }}
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800">{t("set.security")}</h2>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">{t("set.securitySub")}</p>
          <Link
            href="/account/password"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t("set.changePassword")}
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800">{t("set.roles")}</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {roles.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {t(`role.${r.key}`)}
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {r._count.userRoles} {t("set.members")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

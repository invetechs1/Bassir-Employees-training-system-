import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { can, type PermissionKey } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { planHasFeature, type FeatureKey } from "@/lib/plans";
import { brandingOf } from "@/lib/branding";
import { SidebarNav, type NavItem } from "@/components/nav";
import { logoutAction } from "./logout-action";

const NAV_DEFS: (NavItem & { perm?: PermissionKey; feature?: FeatureKey; owner?: boolean })[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/training", label: "Training Programs", group: "Develop", perm: "training.program.read", feature: "training" },
  { href: "/competencies", label: "Competencies", group: "Develop", perm: "competency.read", feature: "competencies" },
  { href: "/certifications", label: "Certifications", group: "Develop", perm: "training.program.read", feature: "certifications" },
  { href: "/people", label: "People", group: "Talent", perm: "user.read", feature: "people" },
  { href: "/succession", label: "Leadership & Succession", group: "Talent", perm: "report.view", feature: "succession" },
  { href: "/analytics", label: "Analytics", group: "Talent", perm: "report.view", feature: "analytics" },
  { href: "/insights", label: "AI Insights", group: "Intelligence", perm: "report.view", feature: "insights" },
  { href: "/billing", label: "Billing & Plan", group: "Company", owner: true },
  { href: "/settings", label: "Settings", group: "Company" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  if (session.mustChangePassword) {
    redirect("/account/password");
  }
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { plan: true, name: true, brandColor: true, logoUrl: true },
  });
  const plan = tenant?.plan ?? "STARTER";
  const brand = brandingOf({
    name: tenant?.name ?? session.tenantSlug,
    brandColor: tenant?.brandColor,
    logoUrl: tenant?.logoUrl,
  });
  const canManageBilling = session.isTenantOwner || can(session, "org.manage");

  const navItems: NavItem[] = NAV_DEFS.filter((i) => {
    if (i.perm && !can(session, i.perm)) return false;
    if (i.feature && !planHasFeature(plan, i.feature)) return false;
    if (i.owner && !canManageBilling) return false;
    return true;
  }).map(({ href, label, group }) => ({ href, label, group }));
  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-1">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-8 w-8 rounded-lg object-contain"
            />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: brand.color }}
            >
              {brand.initial}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold leading-tight">{brand.name}</p>
            <p className="text-xs text-slate-500 leading-tight">
              Powered by BCAP
            </p>
          </div>
        </div>
        <SidebarNav items={navItems} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="text-sm text-slate-500">
            Bassir Corporate Academy Platform
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-tight text-slate-800">
                {session.name}
              </p>
              <p className="text-xs leading-tight text-slate-500">
                {session.email}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {initials}
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

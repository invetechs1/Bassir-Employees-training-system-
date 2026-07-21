import { requireSession } from "@/lib/auth";
import { can, type PermissionKey } from "@/lib/rbac";
import { SidebarNav, type NavItem } from "@/components/nav";
import { logoutAction } from "./logout-action";

const NAV_DEFS: (NavItem & { perm?: PermissionKey })[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/training", label: "Training Programs", group: "Develop", perm: "training.program.read" },
  { href: "/competencies", label: "Competencies", group: "Develop", perm: "competency.read" },
  { href: "/certifications", label: "Certifications", group: "Develop", perm: "training.program.read" },
  { href: "/people", label: "People", group: "Talent", perm: "user.read" },
  { href: "/succession", label: "Leadership & Succession", group: "Talent", perm: "report.view" },
  { href: "/analytics", label: "Analytics", group: "Talent", perm: "report.view" },
  { href: "/insights", label: "AI Insights", group: "Intelligence", perm: "report.view" },
  { href: "/settings", label: "Settings" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const navItems: NavItem[] = NAV_DEFS.filter(
    (i) => !i.perm || can(session, i.perm)
  ).map(({ href, label, group }) => ({ href, label, group }));
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            B
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">BCAP</p>
            <p className="text-xs capitalize text-slate-500 leading-tight">
              {session.tenantSlug}
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

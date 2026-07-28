import Link from "next/link";
import { platformLogoutAction } from "./actions";

export function PlatformShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/platform" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              B
            </span>
            <span className="text-sm font-semibold">Platform Console</span>
            <span className="text-xs text-slate-500">· Bassir Technology</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{email}</span>
            <form action={platformLogoutAction}>
              <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

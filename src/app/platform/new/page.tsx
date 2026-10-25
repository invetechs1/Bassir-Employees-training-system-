import Link from "next/link";
import { requirePlatform } from "@/lib/platform";
import { PlatformShell } from "../shell";
import { ProvisionForm } from "./new-form";

export default async function NewCompanyPage() {
  const session = await requirePlatform();
  return (
    <PlatformShell email={session.email}>
      <Link href="/platform" className="text-sm text-slate-400 hover:text-slate-200">
        ← All companies
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-white">Provision a company</h1>
      <p className="mb-6 text-sm text-slate-500">
        Creates the company, its four system roles and the first administrator.
      </p>
      <div className="max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6">
        <ProvisionForm />
      </div>
    </PlatformShell>
  );
}

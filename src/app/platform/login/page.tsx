import { PlatformLoginForm } from "./login-form";

export default function PlatformLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            B
          </div>
          <h1 className="text-xl font-semibold text-white">BCAP Platform Console</h1>
          <p className="mt-1 text-sm text-slate-400">Bassir Technology · operators only</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <PlatformLoginForm />
        </div>
      </div>
    </main>
  );
}

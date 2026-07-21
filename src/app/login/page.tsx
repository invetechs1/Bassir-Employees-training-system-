import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            B
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Sign in to BCAP
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Bassir Corporate Academy Platform
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Powered by Bassir Technology ·{" "}
          <Link href="/" className="underline hover:text-slate-600">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

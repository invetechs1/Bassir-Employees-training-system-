import { requireSession } from "@/lib/auth";
import { logoutAction } from "@/app/(app)/logout-action";
import { PasswordForm } from "./password-form";

export default async function ChangePasswordPage() {
  const session = await requireSession();
  const forced = session.mustChangePassword;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            B
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            {forced ? "Set your password" : "Change password"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {forced
              ? "For your security, choose a new password before continuing."
              : "Update the password for your account."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <PasswordForm forced={forced} />
        </div>

        <div className="mt-6 text-center">
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs text-slate-400 underline hover:text-slate-600"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

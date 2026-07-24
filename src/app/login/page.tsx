import Link from "next/link";
import { getLocale, translator } from "@/lib/i18n";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const t = translator(await getLocale());

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            B
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            {t("login.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("login.subtitle")}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm
            next={next}
            labels={{
              company: t("login.company"),
              email: t("login.email"),
              password: t("login.password"),
              signIn: t("login.signIn"),
              signingIn: t("login.signingIn"),
            }}
          />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {t("poweredByBcap")} ·{" "}
          <Link href="/" className="underline hover:text-slate-600">
            {t("login.back")}
          </Link>
        </p>
      </div>
    </main>
  );
}

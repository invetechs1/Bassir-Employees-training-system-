import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { LocaleToggle } from "@/components/locale-toggle";
import {
  legalDoc,
  pick,
  LEGAL_DISCLAIMER,
  LEGAL_META,
} from "@/lib/legal";

/** Shared server-rendered layout for the Terms and Privacy documents. */
export async function LegalPage({ slug }: { slug: "terms" | "privacy" }) {
  const locale = await getLocale();
  const doc = legalDoc(slug);
  const meta = LEGAL_META;
  const other = slug === "terms" ? "privacy" : "terms";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
              B
            </span>
            <span className="text-sm font-semibold">BCAP</span>
          </Link>
          <LocaleToggle locale={locale} />
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {pick(doc.title, locale)}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {pick(meta.updatedLabel, locale)}: {meta.entity.lastUpdated}
        </p>

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">
            {pick(meta.disclaimerLabel, locale)}:
          </span>{" "}
          {pick(LEGAL_DISCLAIMER, locale)}
        </div>

        <p className="mt-6 text-slate-700">{pick(doc.intro, locale)}</p>

        <div className="mt-8 space-y-8">
          {doc.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold text-slate-900">
                {pick(s.heading, locale)}
              </h2>
              <div className="mt-2 space-y-2">
                {pick(s.body, locale).map((p, j) => (
                  <p key={j} className="text-sm leading-relaxed text-slate-600">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-slate-200 pt-6 text-sm">
          <Link href={`/legal/${other}`} className="text-brand-600 hover:text-brand-700">
            {pick(meta[other], locale)}
          </Link>
          <Link href="/" className="text-slate-500 hover:text-slate-700">
            {pick(meta.backHome, locale)}
          </Link>
        </div>
      </article>
    </main>
  );
}

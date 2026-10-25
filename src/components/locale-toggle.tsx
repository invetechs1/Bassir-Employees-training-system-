"use client";

import type { Locale } from "@/lib/i18n";

/**
 * Toggles the UI language by setting the locale cookie and reloading, so the
 * server re-renders everything (including <html dir>) in the chosen language.
 */
export function LocaleToggle({ locale }: { locale: Locale }) {
  const next: Locale = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "English" : "العربية";

  function switchTo() {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `bcap_locale=${next}; path=/; max-age=${oneYear}; samesite=lax`;
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={switchTo}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
      aria-label="Switch language"
    >
      {label}
    </button>
  );
}

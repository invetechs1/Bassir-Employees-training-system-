import type { Locale } from "@/lib/i18n";

/**
 * Pick the localized value for a bilingual content field. Arabic content falls
 * back to English when it hasn't been authored (so tenant-created programs that
 * only filled the English field still render in an Arabic session).
 */
export function pickText(
  en: string | null | undefined,
  ar: string | null | undefined,
  locale: Locale
): string {
  if (locale === "ar") return (ar && ar.trim()) || en || "";
  return en || (ar && ar.trim()) || "";
}

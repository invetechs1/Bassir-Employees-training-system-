import { cookies } from "next/headers";

export type Locale = "en" | "ar";
export const LOCALES: Locale[] = ["en", "ar"];
export const LOCALE_COOKIE = "bcap_locale";
export const DEFAULT_LOCALE: Locale = "en";

export function dir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Read the current UI locale from the cookie (server components / actions). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return v === "ar" ? "ar" : "en";
}

/**
 * Translation dictionary. Keys are grouped by area but live in one flat map so
 * `t(key)` is simple. Add entries here to translate more of the UI.
 */
type Entry = { en: string; ar: string };

export const DICT: Record<string, Entry> = {
  // Brand / chrome
  poweredByBcap: { en: "Powered by BCAP", ar: "مدعوم من BCAP" },
  signOut: { en: "Sign out", ar: "تسجيل الخروج" },
  switchAccount: { en: "Switch account / sign out", ar: "تبديل الحساب / خروج" },
  language: { en: "Language", ar: "اللغة" },
  platformName: { en: "Bassir Corporate Academy Platform", ar: "منصة بشير لأكاديمية الشركات" },

  // Nav groups + items
  "group.Develop": { en: "Develop", ar: "التطوير" },
  "group.Talent": { en: "Talent", ar: "المواهب" },
  "group.Intelligence": { en: "Intelligence", ar: "الذكاء" },
  "group.Company": { en: "Company", ar: "الشركة" },
  "nav.Dashboard": { en: "Dashboard", ar: "لوحة القيادة" },
  "nav.Training Programs": { en: "Training Programs", ar: "البرامج التدريبية" },
  "nav.Competencies": { en: "Competencies", ar: "الجدارات" },
  "nav.Certifications": { en: "Certifications", ar: "الشهادات" },
  "nav.People": { en: "People", ar: "الموظفون" },
  "nav.Leadership & Succession": { en: "Leadership & Succession", ar: "القيادة والإحلال" },
  "nav.Analytics": { en: "Analytics", ar: "التحليلات" },
  "nav.AI Insights": { en: "AI Insights", ar: "رؤى الذكاء الاصطناعي" },
  "nav.Billing & Plan": { en: "Billing & Plan", ar: "الفوترة والباقة" },
  "nav.Settings": { en: "Settings", ar: "الإعدادات" },

  // Dashboard
  "dash.welcome": { en: "Welcome back", ar: "مرحبًا بعودتك" },
  "dash.subtitle": { en: "Here is how your academy is performing.", ar: "إليك أداء أكاديميتك." },
  "dash.employees": { en: "Active employees", ar: "الموظفون النشطون" },
  "dash.readiness": { en: "Avg. readiness", ar: "متوسط الجاهزية" },
  "dash.activeEnrollments": { en: "Active enrollments", ar: "التسجيلات النشطة" },
  "dash.trainingPrograms": { en: "Training programs", ar: "البرامج التدريبية" },
  "dash.completions": { en: "Completions", ar: "حالات الإتمام" },
  "dash.openGaps": { en: "Open skill gaps", ar: "فجوات المهارات" },
  "dash.more": {
    en: "More modules — competency growth, leadership pipelines and AI workforce insights — plug into this dashboard.",
    ar: "وحدات إضافية — نمو الجدارات ومسارات القيادة ورؤى الذكاء الاصطناعي — تتكامل مع هذه اللوحة.",
  },
  "dash.devGlance": { en: "Workforce development at a glance", ar: "تطوير القوى العاملة بلمحة" },
  "dash.covNote": {
    en: "Average competency coverage across the organization — the metric that sets BCAP apart from a course-completion LMS.",
    ar: "متوسط تغطية الجدارات عبر المنشأة — المقياس الذي يميّز BCAP عن أنظمة إدارة التعلم التقليدية.",
  },
  "dash.isoTitle": { en: "Multi-tenant isolation:", ar: "العزل متعدد المؤسسات:" },
  "dash.isoBody": {
    en: "every number above is scoped to this company only, enforced by database Row-Level Security.",
    ar: "كل رقم أعلاه مقصور على هذه الشركة فقط، ومفروض عبر أمان مستوى الصف في قاعدة البيانات.",
  },

  // Login
  "login.title": { en: "Sign in to BCAP", ar: "تسجيل الدخول إلى BCAP" },
  "login.subtitle": { en: "Bassir Corporate Academy Platform", ar: "منصة بشير لأكاديمية الشركات" },
  "login.company": { en: "Company", ar: "الشركة" },
  "login.email": { en: "Email", ar: "البريد الإلكتروني" },
  "login.password": { en: "Password", ar: "كلمة المرور" },
  "login.signIn": { en: "Sign in", ar: "دخول" },
  "login.signingIn": { en: "Signing in…", ar: "جارٍ الدخول…" },
  "login.back": { en: "Back to home", ar: "العودة للرئيسية" },

  // Common
  "common.settings": { en: "Settings", ar: "الإعدادات" },
};

export function translator(locale: Locale) {
  return (key: string): string => DICT[key]?.[locale] ?? DICT[key]?.en ?? key;
}

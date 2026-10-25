import type { Metadata } from "next";
import "./globals.css";
import { getLocale, dir } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "BCAP — Bassir Corporate Academy Platform",
  description:
    "Employee growth, competency management and AI-powered workforce transformation. Powered by Bassir Technology.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={dir(locale)}>
      <body>{children}</body>
    </html>
  );
}

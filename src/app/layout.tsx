import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BCAP — Bassir Corporate Academy Platform",
  description:
    "Employee growth, competency management and AI-powered workforce transformation. Powered by Bassir Technology.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Terms of Service — BCAP" };

export default function TermsPage() {
  return <LegalPage slug="terms" />;
}

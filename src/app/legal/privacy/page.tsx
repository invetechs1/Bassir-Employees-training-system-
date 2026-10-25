import type { Metadata } from "next";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Privacy Policy — BCAP" };

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />;
}

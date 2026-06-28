import type { Metadata } from "next";
import { LegalPageShell } from "@/components/public/legal-page-shell";
import { t } from "@/lib/i18n/translation";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/terms",
  description: t("legal.terms.description"),
  title: t("legal.terms.title"),
});

const sections = [
  {
    bodyKeys: ["legal.terms.service.body", "legal.terms.service.body2"],
    titleKey: "legal.terms.service.title",
  },
  {
    bodyKeys: ["legal.terms.account.body", "legal.terms.account.body2"],
    titleKey: "legal.terms.account.title",
  },
  {
    bodyKeys: ["legal.terms.content.body", "legal.terms.content.body2"],
    titleKey: "legal.terms.content.title",
  },
  {
    bodyKeys: ["legal.terms.limits.body", "legal.terms.limits.body2"],
    titleKey: "legal.terms.limits.title",
  },
] as const;

export default function TermsPage() {
  return (
    <LegalPageShell
      descriptionKey="legal.terms.description"
      sections={sections}
      titleKey="legal.terms.title"
    />
  );
}

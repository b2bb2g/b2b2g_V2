import type { Metadata } from "next";
import { LegalPageShell } from "@/components/public/legal-page-shell";
import { t } from "@/lib/i18n/translation";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/privacy",
  description: t("legal.privacy.description"),
  title: t("legal.privacy.title"),
});

const sections = [
  {
    bodyKeys: ["legal.privacy.collect.body", "legal.privacy.collect.body2"],
    titleKey: "legal.privacy.collect.title",
  },
  {
    bodyKeys: ["legal.privacy.use.body", "legal.privacy.use.body2"],
    titleKey: "legal.privacy.use.title",
  },
  {
    bodyKeys: ["legal.privacy.share.body", "legal.privacy.share.body2"],
    titleKey: "legal.privacy.share.title",
  },
  {
    bodyKeys: ["legal.privacy.rights.body", "legal.privacy.rights.body2"],
    titleKey: "legal.privacy.rights.title",
  },
] as const;

export default function PrivacyPage() {
  return (
    <LegalPageShell
      descriptionKey="legal.privacy.description"
      sections={sections}
      titleKey="legal.privacy.title"
    />
  );
}

import type { Metadata } from "next";
import { LegalPageShell } from "@/components/public/legal-page-shell";
import { t } from "@/lib/i18n/translation";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/guide",
  description: t("legal.guide.description"),
  title: t("legal.guide.title"),
});

const sections = [
  {
    bodyKeys: ["legal.guide.member.body", "legal.guide.member.body2"],
    titleKey: "legal.guide.member.title",
  },
  {
    bodyKeys: ["legal.guide.approval.body", "legal.guide.approval.body2"],
    titleKey: "legal.guide.approval.title",
  },
  {
    bodyKeys: ["legal.guide.requests.body", "legal.guide.requests.body2"],
    titleKey: "legal.guide.requests.title",
  },
  {
    bodyKeys: ["legal.guide.support.body", "legal.guide.support.body2"],
    titleKey: "legal.guide.support.title",
  },
] as const;

export default function GuidePage() {
  return (
    <LegalPageShell
      descriptionKey="legal.guide.description"
      sections={sections}
      titleKey="legal.guide.title"
    />
  );
}

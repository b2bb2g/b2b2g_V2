import type { Metadata } from "next";
import { LegalPageShell } from "@/components/public/legal-page-shell";
import { t } from "@/lib/i18n/translation";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/cookies",
  description: t("legal.cookies.description"),
  title: t("legal.cookies.title"),
});

const sections = [
  {
    bodyKeys: ["legal.cookies.use.body", "legal.cookies.use.body2"],
    titleKey: "legal.cookies.use.title",
  },
  {
    bodyKeys: ["legal.cookies.types.body", "legal.cookies.types.body2"],
    titleKey: "legal.cookies.types.title",
  },
  {
    bodyKeys: ["legal.cookies.choice.body", "legal.cookies.choice.body2"],
    titleKey: "legal.cookies.choice.title",
  },
  {
    bodyKeys: ["legal.cookies.update.body", "legal.cookies.update.body2"],
    titleKey: "legal.cookies.update.title",
  },
] as const;

export default function CookiesPage() {
  return (
    <LegalPageShell
      descriptionKey="legal.cookies.description"
      sections={sections}
      titleKey="legal.cookies.title"
    />
  );
}

import type { Metadata } from "next";
import { PublicContentListPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getSampleItems } from "@/lib/sample/public-samples";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/service",
  description: t("content.thailandFda.description"),
  title: t("content.thailandFda.title"),
});

export default function ServicePage() {
  return (
    <PublicContentListPage
      descriptionKey="content.thailandFda.description"
      items={getSampleItems("service")}
      titleKey="content.thailandFda.title"
    />
  );
}

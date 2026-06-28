import type { Metadata } from "next";
import { PublicContentListPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getPublicContentList } from "@/lib/queries/public-content";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/commercial",
  description: t("content.commercial.description"),
  title: t("content.commercial.title"),
});

export default async function CommercialPage() {
  const items = await getPublicContentList("commercial");

  return (
    <PublicContentListPage
      descriptionKey="content.commercial.description"
      items={items}
      titleKey="content.commercial.title"
    />
  );
}

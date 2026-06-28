import type { Metadata } from "next";
import { PublicContentListPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getPublicContentList } from "@/lib/queries/public-content";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/industrial",
  description: t("content.industrial.description"),
  title: t("content.industrial.title"),
});

export default async function IndustrialPage() {
  const items = await getPublicContentList("industrial");

  return (
    <PublicContentListPage
      descriptionKey="content.industrial.description"
      items={items}
      titleKey="content.industrial.title"
    />
  );
}

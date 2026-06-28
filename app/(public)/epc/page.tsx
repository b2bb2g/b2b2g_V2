import type { Metadata } from "next";
import { PublicContentListPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getPublicContentList } from "@/lib/queries/public-content";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/epc",
  description: t("content.epc.description"),
  title: t("content.epc.title"),
});

export default async function EpcPage() {
  const items = await getPublicContentList("epc");

  return (
    <PublicContentListPage
      descriptionKey="content.epc.description"
      items={items}
      titleKey="content.epc.title"
    />
  );
}

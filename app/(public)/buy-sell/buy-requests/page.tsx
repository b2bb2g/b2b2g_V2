import type { Metadata } from "next";
import { PublicContentListPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getPublicContentList } from "@/lib/queries/public-content";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/buy-sell/buy-requests",
  description: t("content.buyRequests.description"),
  title: t("content.buyRequests.title"),
});

export default async function BuyRequestsPage() {
  const items = await getPublicContentList("buy-requests");

  return (
    <PublicContentListPage
      descriptionKey="content.buyRequests.description"
      items={items}
      titleKey="content.buyRequests.title"
    />
  );
}

import type { Metadata } from "next";
import { PublicContentListPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getPublicContentList } from "@/lib/queries/public-content";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/buy-sell/sell-products",
  description: t("content.sellProducts.description"),
  title: t("content.sellProducts.title"),
});

export default async function SellProductsPage() {
  const items = await getPublicContentList("sell-products");

  return (
    <PublicContentListPage
      descriptionKey="content.sellProducts.description"
      items={items}
      titleKey="content.sellProducts.title"
    />
  );
}

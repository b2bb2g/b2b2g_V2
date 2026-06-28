import type { Metadata } from "next";
import { PublicContentListPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getSampleItems } from "@/lib/sample/public-samples";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/networking",
  description: t("content.networking.description"),
  title: t("content.networking.title"),
});

export default function NetworkingPage() {
  return (
    <PublicContentListPage
      descriptionKey="content.networking.description"
      items={getSampleItems("networking")}
      titleKey="content.networking.title"
    />
  );
}


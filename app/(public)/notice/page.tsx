import type { Metadata } from "next";
import { PublicContentListPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getSampleItems } from "@/lib/sample/public-samples";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/notice",
  description: t("content.notice.description"),
  title: t("content.notice.title"),
});

export default function NoticePage() {
  return (
    <PublicContentListPage
      descriptionKey="content.notice.description"
      items={getSampleItems("notice")}
      titleKey="content.notice.title"
      variant="notice"
    />
  );
}

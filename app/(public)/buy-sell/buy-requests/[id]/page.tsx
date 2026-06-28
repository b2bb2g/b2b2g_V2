import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/json-ld";
import { PublicContentDetailPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getPublicContentDetail } from "@/lib/queries/public-content";
import {
  buildContentStructuredData,
  buildPublicMetadata,
} from "@/lib/seo/metadata";

type ContentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getPublicContentDetail("buy-requests", id);

  return buildPublicMetadata({
    canonicalPath: `/buy-sell/buy-requests/${id}`,
    description: content?.summary,
    title: content?.title ?? t("content.buyRequests.title"),
  });
}

export default async function BuyRequestDetailPage({
  params,
}: ContentPageProps) {
  const { id } = await params;
  const content = await getPublicContentDetail("buy-requests", id);

  if (!content) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={buildContentStructuredData({
          companyName: content.companyName,
          description: content.summary ?? content.body,
          kind: content.kind,
          path: content.href,
          title: content.title,
        })}
      />
      <PublicContentDetailPage content={content} />
    </>
  );
}

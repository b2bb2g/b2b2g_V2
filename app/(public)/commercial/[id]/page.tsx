import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/json-ld";
import { PublicContentDetailPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getPublicContentDetail } from "@/lib/queries/public-content";
import {
  buildContentStructuredData,
  buildPublicMetadata,
  getPublicSeoMetadata,
  getStructuredData,
} from "@/lib/seo/metadata";

type ContentPageProps = {
  params: Promise<{ id: string }>;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getPublicContentDetail("commercial", id);
  const seo = content && isUuid(id) ? await getPublicSeoMetadata("products", id) : null;

  return buildPublicMetadata({
    canonicalPath: `/commercial/${id}`,
    description: content?.summary,
    seo,
    title: content?.title ?? t("content.commercial.title"),
  });
}

export default async function CommercialDetailPage({ params }: ContentPageProps) {
  const { id } = await params;
  const content = await getPublicContentDetail("commercial", id);

  if (!content) {
    notFound();
  }

  const seo = isUuid(id) ? await getPublicSeoMetadata("products", id) : null;
  const structuredData = getStructuredData(
    seo,
    buildContentStructuredData({
      companyName: content.companyName,
      description: content.summary ?? content.body,
      kind: content.kind,
      path: content.href,
      title: content.title,
    }),
  );

  return (
    <>
      <JsonLd data={structuredData} />
      <PublicContentDetailPage content={content} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicContentDetailPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getSampleItem } from "@/lib/sample/public-samples";
import { buildPublicMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ id: string }>;
};

function getBuySellSampleDetail(id: string) {
  const sample = getSampleItem("buy-sell", id);

  if (!sample) {
    return null;
  }

  return {
    ...sample,
    backHref: "/buy-sell",
    detailTitleKey: "nav.buySell",
    facts: [
      { labelKey: "content.fact.company", value: sample.companyName },
      { labelKey: "content.fact.industry", value: sample.meta },
      { labelKey: "content.fact.status", value: "Sample approved" },
    ],
    kind: "sell-products" as const,
    listTitleKey: "nav.buySell",
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = getBuySellSampleDetail(id);

  return buildPublicMetadata({
    canonicalPath: `/buy-sell/${id}`,
    description: content?.summary,
    title: content?.title ?? t("nav.buySell"),
  });
}

export default async function BuySellDetailPage({ params }: PageProps) {
  const { id } = await params;
  const content = getBuySellSampleDetail(id);

  if (!content) {
    notFound();
  }

  return <PublicContentDetailPage content={content} />;
}


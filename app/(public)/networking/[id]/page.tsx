import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicContentDetailPage } from "@/components/public/content-page-shell";
import { t } from "@/lib/i18n/translation";
import { getSamplePublicContentDetail } from "@/lib/queries/sample-public-content";
import { buildPublicMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = getSamplePublicContentDetail("networking", id);

  return buildPublicMetadata({
    canonicalPath: `/networking/${id}`,
    description: content?.summary,
    title: content?.title ?? t("content.networking.title"),
  });
}

export default async function NetworkingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const content = getSamplePublicContentDetail("networking", id);

  if (!content) {
    notFound();
  }

  return <PublicContentDetailPage content={content} />;
}


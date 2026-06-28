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
  const content = getSamplePublicContentDetail("events", id);

  return buildPublicMetadata({
    canonicalPath: `/events/${id}`,
    description: content?.summary,
    title: content?.title ?? t("content.events.title"),
  });
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const content = getSamplePublicContentDetail("events", id);

  if (!content) {
    notFound();
  }

  return <PublicContentDetailPage content={content} />;
}


import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardProductDraftDetailPage } from "@/components/dashboard/product-draft-detail-page";
import { t } from "@/lib/i18n/translation";
import { getMySupplierProductDraft } from "@/lib/queries/products";

type DashboardProductDraftPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: t("dashboard.products.draftDetail.metadataTitle"),
};

export default async function DashboardProductDraftPage({
  params,
}: DashboardProductDraftPageProps) {
  const { id } = await params;
  const draft = await getMySupplierProductDraft(id);

  if (!draft) {
    notFound();
  }

  return <DashboardProductDraftDetailPage draft={draft} />;
}

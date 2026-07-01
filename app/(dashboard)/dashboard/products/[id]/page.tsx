import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardProductDraftDetailPage } from "@/components/dashboard/product-draft-detail-page";
import { t } from "@/lib/i18n/translation";
import { getMySupplierProductDraft } from "@/lib/queries/products";

type DashboardProductDraftPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: t("dashboard.products.draftDetail.metadataTitle"),
};

export default async function DashboardProductDraftPage({
  params,
  searchParams,
}: DashboardProductDraftPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const draft = await getMySupplierProductDraft(id);

  if (!draft) {
    notFound();
  }

  const result = typeof query?.result === "string" ? query.result : null;
  const error = typeof query?.error === "string" ? query.error : null;
  const noticeMessage =
    result === "submitted" ? t("dashboard.products.draftDetail.result.submitted") : null;
  const errorMessage =
    error === "missing_required"
      ? t("dashboard.products.draftDetail.error.missingRequired")
      : error === "submit_failed"
        ? t("dashboard.products.draftDetail.error.submitFailed")
        : null;

  return (
    <DashboardProductDraftDetailPage
      draft={draft}
      errorMessage={errorMessage}
      noticeMessage={noticeMessage}
    />
  );
}

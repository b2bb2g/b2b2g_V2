import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SupplierProductRegistrationForm } from "@/components/dashboard/supplier-product-registration-form";
import { t } from "@/lib/i18n/translation";
import { getMySupplierProductDraft } from "@/lib/queries/products";

type DashboardProductDraftEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: t("dashboard.products.draftEdit.metadataTitle"),
};

export default async function DashboardProductDraftEditPage({
  params,
}: DashboardProductDraftEditPageProps) {
  const { id } = await params;
  const draft = await getMySupplierProductDraft(id);

  if (!draft) {
    notFound();
  }

  return <SupplierProductRegistrationForm draft={draft} />;
}

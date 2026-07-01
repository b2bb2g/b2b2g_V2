import type { Metadata } from "next";
import { ApprovalWorkflow } from "@/components/admin/approval-workflow";
import { requireAdminRoute } from "@/lib/auth/guards";
import { t } from "@/lib/i18n/translation";
import { getPendingApprovalQueue, getProductPublishQueue } from "@/lib/queries/admin-approvals";

type AdminContentPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: t("admin.approval.title", "ko"),
};

function getResult(
  value: string | string[] | undefined,
): "approved" | "error" | "published" | "rejected" | null {
  const result = Array.isArray(value) ? value[0] : value;

  if (result === "approved" || result === "error" || result === "published" || result === "rejected") {
    return result;
  }

  return null;
}

export default async function AdminContentPage({
  searchParams,
}: AdminContentPageProps) {
  await requireAdminRoute();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [sections, productPublishQueue] = await Promise.all([
    getPendingApprovalQueue(),
    getProductPublishQueue(),
  ]);

  return (
    <ApprovalWorkflow
      productPublishQueue={productPublishQueue}
      result={getResult(resolvedSearchParams.result)}
      sections={sections}
    />
  );
}

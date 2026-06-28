import type { Metadata } from "next";
import { CompanyManagement } from "@/components/admin/company-management";
import { requireAdminRoute } from "@/lib/auth/guards";
import { t } from "@/lib/i18n/translation";
import { getAdminCompanies } from "@/lib/queries/admin-companies";
import type {
  CompanyApprovalStatus,
  VerificationStatus,
} from "@/types/database";

type AdminCompaniesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ResultStatus = "approved" | "error" | "rejected" | "suspended" | "verified";

export const metadata: Metadata = {
  title: t("admin.companies.title", "ko"),
};

function getSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getResult(value: string | string[] | undefined): ResultStatus | null {
  const result = getSingle(value);

  if (
    result === "approved" ||
    result === "error" ||
    result === "rejected" ||
    result === "suspended" ||
    result === "verified"
  ) {
    return result;
  }

  return null;
}

export default async function AdminCompaniesPage({
  searchParams,
}: AdminCompaniesPageProps) {
  await requireAdminRoute();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const data = await getAdminCompanies({
    approvalStatus: getSingle(resolvedSearchParams.approval) as
      | CompanyApprovalStatus
      | "all"
      | undefined,
    query: getSingle(resolvedSearchParams.q),
    verificationStatus: getSingle(resolvedSearchParams.verification) as
      | VerificationStatus
      | "all"
      | undefined,
  });

  return (
    <CompanyManagement
      filters={data.filters}
      items={data.items}
      result={getResult(resolvedSearchParams.result)}
      summary={data.summary}
    />
  );
}

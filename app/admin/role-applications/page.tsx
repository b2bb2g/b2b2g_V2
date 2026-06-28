import type { Metadata } from "next";
import { RoleApplicationList } from "@/components/admin/role-application-list";
import { requireAdminRoute } from "@/lib/auth/guards";
import { t } from "@/lib/i18n/translation";
import { getPendingRoleApplicationsForAdmin } from "@/lib/queries/identity";

type AdminRoleApplicationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ResultStatus = "approved" | "error" | "rejected";

export const metadata: Metadata = {
  title: t("admin.roleApplications.title", "ko"),
};

function getSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getResult(value: string | string[] | undefined): ResultStatus | null {
  const result = getSingle(value);

  if (result === "approved" || result === "error" || result === "rejected") {
    return result;
  }

  return null;
}

export default async function AdminRoleApplicationsPage({
  searchParams,
}: AdminRoleApplicationsPageProps) {
  await requireAdminRoute();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const applications = await getPendingRoleApplicationsForAdmin();

  return (
    <RoleApplicationList
      applications={applications}
      result={getResult(resolvedSearchParams.result)}
    />
  );
}

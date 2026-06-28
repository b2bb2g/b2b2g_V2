import type { Metadata } from "next";
import { MemberManagement } from "@/components/admin/member-management";
import { requireAdminRoute } from "@/lib/auth/guards";
import { t } from "@/lib/i18n/translation";
import { getAdminMembers } from "@/lib/queries/admin-members";
import type { MemberTypeCode } from "@/types/database";
import type {
  MemberActivityStatus,
  MemberApprovalStatus,
} from "@/lib/queries/admin-members";

type AdminMembersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ResultStatus =
  | "approved"
  | "created"
  | "error"
  | "messaged"
  | "reactivated"
  | "rejected"
  | "rolesUpdated"
  | "suspended"
  | "updated"
  | "withdrawn";

export const metadata: Metadata = {
  title: t("admin.members.title", "ko"),
};

function getSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getResult(value: string | string[] | undefined): ResultStatus | null {
  const result = getSingle(value);

  if (
    result === "approved" ||
    result === "created" ||
    result === "error" ||
    result === "messaged" ||
    result === "reactivated" ||
    result === "rejected" ||
    result === "rolesUpdated" ||
    result === "suspended" ||
    result === "updated" ||
    result === "withdrawn"
  ) {
    return result;
  }

  return null;
}

export default async function AdminMembersPage({
  searchParams,
}: AdminMembersPageProps) {
  await requireAdminRoute();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const data = await getAdminMembers({
    activityStatus: getSingle(resolvedSearchParams.activity) as
      | MemberActivityStatus
      | "all"
      | undefined,
    approvalStatus: getSingle(resolvedSearchParams.approval) as
      | MemberApprovalStatus
      | "all"
      | undefined,
    memberType: getSingle(resolvedSearchParams.memberType) as
      | MemberTypeCode
      | "all"
      | undefined,
    query: getSingle(resolvedSearchParams.q),
  });

  return (
    <MemberManagement
      countryOptions={data.countryOptions}
      filters={data.filters}
      items={data.items}
      memberTypeOptions={data.memberTypeOptions}
      result={getResult(resolvedSearchParams.result)}
      roleOptions={data.roleOptions}
      summary={data.summary}
    />
  );
}

import { redirect } from "next/navigation";
import {
  adminRoutePrefix,
  pendingApprovalPath,
  selectMemberTypePath,
  signInPath,
} from "@/lib/constants/routes";
import {
  getPrimaryDashboardRole,
  hasEffectiveRole,
  resolveEffectiveRoles,
  type AccountRoleLike,
} from "@/lib/auth/account-roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MemberTypeCode } from "@/types/database";

export type DashboardRouteContext = {
  activityStatus: string;
  careerRankName: string | null;
  displayName: string | null;
  email: string;
  memberTypeCode: Exclude<MemberTypeCode, "administrator">;
  profileId: string;
};

export async function requireAuthenticatedRoute() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(signInPath);
  }

  return user;
}

export async function requireAdminRoute() {
  const user = await requireAuthenticatedRoute();
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("member_type_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.member_type_id) {
    const { data: accountRoles } = await supabase
      .from("account_roles")
      .select("role_key,status,deleted_at")
      .eq("account_id", user.id)
      .is("deleted_at", null);

    const effectiveRoles = resolveEffectiveRoles({
      accountRoles: accountRoles ?? [],
      legacyMemberTypeCode: null,
    });

    if (!hasEffectiveRole(effectiveRoles, "administrator")) {
      redirect("/");
    }

    return user;
  }

  const [memberTypeResult, accountRolesResult] = await Promise.all([
    supabase
      .from("member_types")
      .select("code")
      .eq("id", profile.member_type_id)
      .maybeSingle(),
    supabase
      .from("account_roles")
      .select("role_key,status,deleted_at")
      .eq("account_id", user.id)
      .is("deleted_at", null),
  ]);
  const effectiveRoles = resolveEffectiveRoles({
    accountRoles: accountRolesResult.data ?? [],
    legacyMemberTypeCode: memberTypeResult.data?.code ?? null,
  });

  if (!hasEffectiveRole(effectiveRoles, "administrator")) {
    redirect("/");
  }

  return user;
}

export async function requireDashboardRoute(): Promise<DashboardRouteContext> {
  const user = await requireAuthenticatedRoute();
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id,email,display_name,approval_status,activity_status,member_type_id,career_rank_id",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect(selectMemberTypePath);
  }

  if (
    profile.approval_status !== "approved" ||
    profile.activity_status !== "active"
  ) {
    redirect(pendingApprovalPath);
  }

  const [{ data: memberType }, { data: careerRank }, { data: accountRoles }] = await Promise.all([
    supabase
      .from("member_types")
      .select("code")
      .eq("id", profile.member_type_id)
      .maybeSingle(),
    profile.career_rank_id
      ? supabase
          .from("career_ranks")
          .select("name")
          .eq("id", profile.career_rank_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("account_roles")
      .select("role_key,status,deleted_at")
      .eq("account_id", user.id)
      .is("deleted_at", null),
  ]);
  const effectiveRoles = resolveEffectiveRoles({
    accountRoles: (accountRoles ?? []) satisfies AccountRoleLike[],
    legacyMemberTypeCode: memberType?.code ?? null,
  });
  const dashboardRole = getPrimaryDashboardRole(effectiveRoles);

  if (!dashboardRole) {
    if (hasEffectiveRole(effectiveRoles, "administrator")) {
      redirect(adminRoutePrefix);
    }

    redirect(pendingApprovalPath);
  }

  return {
    activityStatus: profile.activity_status,
    careerRankName: careerRank?.name ?? null,
    displayName: profile.display_name,
    email: profile.email,
    memberTypeCode: dashboardRole,
    profileId: profile.id,
  };
}

export function isAdminPath(pathname: string): boolean {
  return pathname === adminRoutePrefix || pathname.startsWith(`${adminRoutePrefix}/`);
}

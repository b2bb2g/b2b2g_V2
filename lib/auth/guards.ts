import { redirect } from "next/navigation";
import {
  adminRoutePrefix,
  pendingApprovalPath,
  selectMemberTypePath,
  signInPath,
} from "@/lib/constants/routes";
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
    redirect("/");
  }

  const { data: memberType } = await supabase
    .from("member_types")
    .select("code")
    .eq("id", profile.member_type_id)
    .maybeSingle();

  if (memberType?.code !== "administrator") {
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

  const [{ data: memberType }, { data: careerRank }] = await Promise.all([
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
  ]);

  if (!memberType?.code) {
    redirect(pendingApprovalPath);
  }

  if (memberType.code === "administrator") {
    redirect(adminRoutePrefix);
  }

  return {
    activityStatus: profile.activity_status,
    careerRankName: careerRank?.name ?? null,
    displayName: profile.display_name,
    email: profile.email,
    memberTypeCode: memberType.code,
    profileId: profile.id,
  };
}

export function isAdminPath(pathname: string): boolean {
  return pathname === adminRoutePrefix || pathname.startsWith(`${adminRoutePrefix}/`);
}

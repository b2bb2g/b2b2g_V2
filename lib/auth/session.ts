import {
  getPrimaryMemberTypeRole,
  hasEffectiveRole,
  resolveEffectiveRoles,
  type AccountRoleLike,
} from "@/lib/auth/account-roles";
import { adminRoutePrefix, selectMemberTypePath } from "@/lib/constants/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MemberTypeCode } from "@/types/database";

export type PublicHeaderNotification = {
  body: string | null;
  createdAt: string | null;
  priority: string;
  readAt: string | null;
  title: string;
  type: string;
};

export type PublicHeaderUserContext = {
  activityStatus: string | null;
  approvalStatus: string | null;
  displayName: string | null;
  email: string;
  href: string;
  memberTypeCode: MemberTypeCode | null;
  notifications: PublicHeaderNotification[];
  unreadNotificationCount: number;
};

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

export async function getPublicHeaderUserContext(): Promise<PublicHeaderUserContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("activity_status,approval_status,display_name,email,member_type_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return {
      activityStatus: null,
      approvalStatus: null,
      displayName: user.user_metadata?.display_name ?? null,
      email: user.email ?? "",
      href: selectMemberTypePath,
      memberTypeCode: null,
      notifications: [],
      unreadNotificationCount: 0,
    };
  }

  const [memberTypeResult, accountRolesResult, notificationsResult, unreadNotificationsResult] = await Promise.all([
    profile.member_type_id
      ? supabase
          .from("member_types")
          .select("code")
          .eq("id", profile.member_type_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("account_roles")
      .select("role_key,status,deleted_at")
      .eq("account_id", user.id)
      .is("deleted_at", null),
    supabase
      .from("notifications")
      .select("body,created_at,notification_type,priority,read_at,title")
      .eq("profile_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .is("read_at", null)
      .is("deleted_at", null),
  ]);
  const memberType = memberTypeResult.data;
  const effectiveRoles = resolveEffectiveRoles({
    accountRoles: (accountRolesResult.data ?? []) satisfies AccountRoleLike[],
    legacyMemberTypeCode: memberType?.code ?? null,
  });
  const memberTypeCode = getPrimaryMemberTypeRole(effectiveRoles);
  const notifications =
    notificationsResult.data?.map((notification) => ({
      body: notification.body,
      createdAt: notification.created_at,
      priority: notification.priority,
      readAt: notification.read_at,
      title: notification.title,
      type: notification.notification_type,
    })) ?? [];

  return {
    activityStatus: profile.activity_status,
    approvalStatus: profile.approval_status,
    displayName: profile.display_name,
    email: profile.email || user.email || "",
    href: hasEffectiveRole(effectiveRoles, "administrator") ? adminRoutePrefix : "/dashboard",
    memberTypeCode,
    notifications,
    unreadNotificationCount: unreadNotificationsResult.count ?? 0,
  };
}

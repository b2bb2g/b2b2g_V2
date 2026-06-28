import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseSignupPolicy, SIGNUP_POLICY_SETTING_KEY, type SignupPolicy } from "@/lib/queries/signup-policy";
import type {
  CompanyApprovalStatus,
  ContentApprovalStatus,
  Database,
  ThailandFdaStatus,
} from "@/types/database";

type Tables = Database["public"]["Tables"];
type AdminLogRow = Tables["admin_logs"]["Row"];
type NotificationRow = Tables["notifications"]["Row"];

export type AdminOverview = {
  alerts: {
    criticalAuditEvents: number;
    unreadNotifications: number;
  };
  auth: {
    signupPolicy: SignupPolicy;
  };
  content: {
    buyRequests: number;
    buySellPosts: number;
    companies: number;
    epcPosts: number;
    industrialPosts: number;
    marketResearchReports: number;
    products: number;
    studentShowcases: number;
    totalPending: number;
  };
  fda: {
    activeApplications: number;
  };
  governance: {
    recentLogs: Pick<
      AdminLogRow,
      "action" | "occurred_at" | "target_label" | "target_table"
    >[];
  };
  members: {
    active: number;
    blocked: number;
    pendingApproval: number;
    total: number;
  };
  notifications: Pick<
    NotificationRow,
    "created_at" | "priority" | "read_at" | "title"
  >[];
  platform: {
    banners: number;
    featuredContents: number;
    menus: number;
    publicSettings: number;
    translations: number;
  };
  rewards: {
    pending: number;
  };
};

function toCount(value: number | null): number {
  return value ?? 0;
}

export async function getAdminOverview(adminProfileId: string): Promise<AdminOverview> {
  const supabase = await createSupabaseServerClient();
  const { data: memberTypes, error: memberTypeError } = await supabase
    .from("member_types")
    .select("id")
    .in("code", ["supplier", "buyer", "agent", "professor", "student"]);

  if (memberTypeError) {
    throw new Error(memberTypeError.message);
  }

  const memberTypeIds = (memberTypes ?? []).map((memberType) => memberType.id);
  const emptyMemberQuery = Promise.resolve({ count: 0, error: null });
  const pendingCompanyStatuses: CompanyApprovalStatus[] = [
    "submitted",
    "reviewing",
  ];
  const pendingContentStatuses: ContentApprovalStatus[] = [
    "submitted",
    "reviewing",
  ];
  const pendingStudentContentStatuses: Array<
    "reviewing" | "submitted"
  > = ["submitted", "reviewing"];
  const activeFdaStatuses: ThailandFdaStatus[] = [
    "submitted",
    "reviewing",
    "waiting_documents",
    "quoted",
    "in_progress",
  ];

  const [
    totalMembersResult,
    pendingMembersResult,
    activeMembersResult,
    blockedMembersResult,
    companiesResult,
    productsResult,
    industrialResult,
    epcResult,
    buySellResult,
    buyRequestResult,
    studentShowcaseResult,
    marketResearchResult,
    fdaResult,
    rewardsResult,
    notificationsResult,
    unreadNotificationsResult,
    criticalAuditResult,
    adminLogsResult,
    menusResult,
    bannersResult,
    featuredContentsResult,
    publicSettingsResult,
    signupPolicyResult,
    translationsResult,
  ] = await Promise.all([
    memberTypeIds.length
      ? supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .in("member_type_id", memberTypeIds)
          .is("deleted_at", null)
      : emptyMemberQuery,
    memberTypeIds.length
      ? supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .in("member_type_id", memberTypeIds)
          .eq("approval_status", "pending")
          .is("deleted_at", null)
      : emptyMemberQuery,
    memberTypeIds.length
      ? supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .in("member_type_id", memberTypeIds)
          .eq("approval_status", "approved")
          .eq("activity_status", "active")
          .is("deleted_at", null)
      : emptyMemberQuery,
    memberTypeIds.length
      ? supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .in("member_type_id", memberTypeIds)
          .eq("activity_status", "blocked")
          .is("deleted_at", null)
      : emptyMemberQuery,
    supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .in("approval_status", pendingCompanyStatuses)
      .is("deleted_at", null),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .in("approval_status", pendingContentStatuses)
      .is("deleted_at", null),
    supabase
      .from("industrial_posts")
      .select("id", { count: "exact", head: true })
      .in("approval_status", pendingContentStatuses)
      .is("deleted_at", null),
    supabase
      .from("epc_posts")
      .select("id", { count: "exact", head: true })
      .in("approval_status", pendingContentStatuses)
      .is("deleted_at", null),
    supabase
      .from("buy_sell_posts")
      .select("id", { count: "exact", head: true })
      .in("approval_status", pendingContentStatuses)
      .is("deleted_at", null),
    supabase
      .from("buy_requests")
      .select("id", { count: "exact", head: true })
      .in("approval_status", pendingContentStatuses)
      .is("deleted_at", null),
    supabase
      .from("student_showcases")
      .select("id", { count: "exact", head: true })
      .in("approval_status", pendingStudentContentStatuses)
      .is("deleted_at", null),
    supabase
      .from("market_research_reports")
      .select("id", { count: "exact", head: true })
      .in("approval_status", pendingStudentContentStatuses)
      .is("deleted_at", null),
    supabase
      .from("thailand_fda_applications")
      .select("id", { count: "exact", head: true })
      .in("status", activeFdaStatuses)
      .is("deleted_at", null),
    supabase
      .from("rewards")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .is("deleted_at", null),
    supabase
      .from("notifications")
      .select("created_at,priority,read_at,title")
      .eq("profile_id", adminProfileId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", adminProfileId)
      .is("read_at", null)
      .is("deleted_at", null),
    supabase
      .from("audit_events")
      .select("id", { count: "exact", head: true })
      .in("severity", ["critical", "error"])
      .is("deleted_at", null),
    supabase
      .from("admin_logs")
      .select("action,occurred_at,target_label,target_table")
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false })
      .limit(6),
    supabase
      .from("menus")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("banners")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("featured_contents")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("site_settings")
      .select("id", { count: "exact", head: true })
      .eq("is_public", true)
      .is("deleted_at", null),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", SIGNUP_POLICY_SETTING_KEY)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("translations")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
  ]);

  [
    totalMembersResult.error,
    pendingMembersResult.error,
    activeMembersResult.error,
    blockedMembersResult.error,
    companiesResult.error,
    productsResult.error,
    industrialResult.error,
    epcResult.error,
    buySellResult.error,
    buyRequestResult.error,
    studentShowcaseResult.error,
    marketResearchResult.error,
    fdaResult.error,
    rewardsResult.error,
    notificationsResult.error,
    unreadNotificationsResult.error,
    criticalAuditResult.error,
    adminLogsResult.error,
    menusResult.error,
    bannersResult.error,
    featuredContentsResult.error,
    publicSettingsResult.error,
    signupPolicyResult.error,
    translationsResult.error,
  ].forEach((error) => {
    if (error) {
      throw new Error(error.message);
    }
  });

  const content = {
    buyRequests: toCount(buyRequestResult.count),
    buySellPosts: toCount(buySellResult.count),
    companies: toCount(companiesResult.count),
    epcPosts: toCount(epcResult.count),
    industrialPosts: toCount(industrialResult.count),
    marketResearchReports: toCount(marketResearchResult.count),
    products: toCount(productsResult.count),
    studentShowcases: toCount(studentShowcaseResult.count),
  };

  return {
    alerts: {
      criticalAuditEvents: toCount(criticalAuditResult.count),
      unreadNotifications: toCount(unreadNotificationsResult.count),
    },
    auth: {
      signupPolicy: parseSignupPolicy(signupPolicyResult.data?.value),
    },
    content: {
      ...content,
      totalPending: Object.values(content).reduce((total, value) => total + value, 0),
    },
    fda: {
      activeApplications: toCount(fdaResult.count),
    },
    governance: {
      recentLogs: adminLogsResult.data ?? [],
    },
    members: {
      active: toCount(activeMembersResult.count),
      blocked: toCount(blockedMembersResult.count),
      pendingApproval: toCount(pendingMembersResult.count),
      total: toCount(totalMembersResult.count),
    },
    notifications: notificationsResult.data ?? [],
    platform: {
      banners: toCount(bannersResult.count),
      featuredContents: toCount(featuredContentsResult.count),
      menus: toCount(menusResult.count),
      publicSettings: toCount(publicSettingsResult.count),
      translations: toCount(translationsResult.count),
    },
    rewards: {
      pending: toCount(rewardsResult.count),
    },
  };
}

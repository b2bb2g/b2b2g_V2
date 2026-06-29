import { requireDashboardRoute, type DashboardRouteContext } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { RoleApplicationStatus } from "@/types/database";

export type DashboardMetric = {
  labelKey: string;
  value: number | string;
};

export type DashboardRecord = {
  href?: string | null;
  meta: string | null;
  status?: string | null;
  title: string;
};

export type DashboardQuickAction = {
  href: string;
  labelKey: string;
  metaKey: string;
};

export type DashboardRolePanel = {
  descriptionKey: string;
  focusKey: string;
  titleKey: string;
};

export type DashboardSupplierOnboardingState = "approved" | "rejected" | "submitted";

export type DashboardSupplierOnboardingData = {
  applicationStatus: RoleApplicationStatus | null;
  descriptionKey: string;
  nextSteps: DashboardQuickAction[];
  status: DashboardSupplierOnboardingState;
  titleKey: string;
};

export type DashboardAgentOnboardingState = "approved" | "rejected" | "submitted";

export type DashboardAgentOnboardingData = {
  applicationStatus: RoleApplicationStatus | null;
  descriptionKey: string;
  nextSteps: DashboardQuickAction[];
  status: DashboardAgentOnboardingState;
  titleKey: string;
};

export type DashboardOverviewData = {
  agentOnboarding: DashboardAgentOnboardingData | null;
  activities: DashboardRecord[];
  context: DashboardRouteContext;
  metrics: DashboardMetric[];
  quickActions: DashboardQuickAction[];
  rolePanel: DashboardRolePanel;
  supplierOnboarding: DashboardSupplierOnboardingData | null;
  workItems: DashboardRecord[];
};

export type DashboardSectionData = {
  context: DashboardRouteContext;
  descriptionKey: string;
  emptyKey: string;
  records: DashboardRecord[];
  titleKey: string;
};

export type DashboardCompanyOption = {
  id: string;
  name: string;
};

export type DashboardCompanyProfile = {
  approvalStatus: string | null;
  companyName: string | null;
  companyTypeId: string | null;
  companyTypeName: string | null;
  countryId: string | null;
  countryName: string | null;
  description: string | null;
  industryId: string | null;
  industryName: string | null;
  isActive: boolean;
  publicHref: string | null;
  scopeLabelKey: string;
  status: string | null;
  title: string;
  updatedAt: string | null;
  verificationStatus: string | null;
  website: string | null;
};

export type DashboardCompanyChecklistItem = {
  done: boolean;
  labelKey: string;
  meta: string | null;
};

export type DashboardCompanyData = {
  context: DashboardRouteContext;
  descriptionKey: string;
  emptyKey: string;
  metrics: DashboardMetric[];
  options: {
    companyTypes: DashboardCompanyOption[];
    countries: DashboardCompanyOption[];
    industries: DashboardCompanyOption[];
  };
  profile: DashboardCompanyProfile | null;
  records: DashboardRecord[];
  titleKey: string;
  verificationChecklist: DashboardCompanyChecklistItem[];
};

export type DashboardReferralCode = {
  code: string;
  isActive: boolean;
  referralUrl: string | null;
  targetMemberType?: "buyer" | "student";
  updatedAt: string | null;
};

export type DashboardReferralTreeNode = {
  badge: string;
  children?: DashboardReferralTreeNode[];
  meta: string | null;
  status: string | null;
  title: string;
};

export type DashboardNetworkContact = {
  badge: string;
  description: string | null;
  email: string | null;
  href: string;
  meta: string | null;
  status: string | null;
  title: string;
};

export type DashboardReferralData = DashboardSectionData & {
  activeCode: DashboardReferralCode | null;
  canGenerateCode: boolean;
  inviteGuide: DashboardRecord[];
  lookupDescriptionKey: string;
  lookupTitleKey: string;
  mentorContact: DashboardNetworkContact | null;
  roleLabelKey: string;
  studentContacts: DashboardNetworkContact[];
  summaryCards: DashboardMetric[];
  tree: DashboardReferralTreeNode[];
};

export type DashboardMessageParticipant = {
  displayName: string;
  isCurrentUser: boolean;
  lastReadAt: string | null;
  memberRole: string;
  memberTypeCode: string | null;
  profileId: string;
};

export type DashboardMessageItem = {
  blockedAt: string | null;
  body: string;
  conversationId: string;
  createdAt: string;
  id: string;
  isMine: boolean;
  senderName: string;
  senderProfileId: string;
};

export type DashboardConversation = {
  conversationType: string;
  id: string;
  isBlocked: boolean;
  lastMessage: DashboardMessageItem | null;
  lastReadAt: string | null;
  memberRole: string;
  messages: DashboardMessageItem[];
  participants: DashboardMessageParticipant[];
  status: string;
  subject: string;
  unreadCount: number;
  updatedAt: string | null;
};

export type DashboardMessagesData = {
  context: DashboardRouteContext;
  conversations: DashboardConversation[];
  descriptionKey: string;
  emptyKey: string;
  metrics: DashboardMetric[];
  selectedConversation: DashboardConversation | null;
  selectedConversationId: string | null;
  titleKey: string;
};

export type DashboardProductRecord = DashboardRecord & {
  description: string | null;
  kind:
    | "buy-request"
    | "commercial"
    | "epc"
    | "industrial"
    | "market-research"
    | "sell-product"
    | "showcase";
  updatedAt: string | null;
};

export type DashboardProductChecklistItem = {
  descriptionKey: string;
  status: string;
  titleKey: string;
};

export type DashboardShowcaseProductOption = {
  id: string;
  status: string | null;
  summary: string | null;
  title: string;
  updatedAt: string | null;
};

export type DashboardStudentShowcaseRecord = {
  description: string | null;
  id: string;
  itemCount: number;
  status: string | null;
  title: string;
  updatedAt: string | null;
};

export type DashboardStudentShowcaseData = {
  availableProducts: DashboardShowcaseProductOption[];
  currentShowcase: DashboardStudentShowcaseRecord | null;
};

export type DashboardProductsData = Omit<DashboardSectionData, "records"> & {
  canCreateProduct: boolean;
  checklist: DashboardProductChecklistItem[];
  metrics: DashboardMetric[];
  quickActions: DashboardQuickAction[];
  records: DashboardProductRecord[];
  studentShowcase: DashboardStudentShowcaseData | null;
};

export type DashboardActivityRecord = {
  activityType: string;
  detail: string | null;
  href: string | null;
  id: string;
  meta: string | null;
  occurredAt: string | null;
  target: string | null;
  title: string;
};

export type DashboardActivityStage = {
  count: number;
  descriptionKey: string;
  labelKey: string;
  status: string;
};

export type DashboardActivitiesData = Omit<DashboardSectionData, "records"> & {
  activityTypes: DashboardMetric[];
  guide: DashboardRecord[];
  metrics: DashboardMetric[];
  records: DashboardActivityRecord[];
  stages: DashboardActivityStage[];
};

export type DashboardAccountData = {
  accountRecords: DashboardRecord[];
  activityRecords: DashboardRecord[];
  approvalStatus: string | null;
  completion: {
    completed: number;
    items: { done: boolean; labelKey: string; meta: string | null }[];
    total: number;
  };
  context: DashboardRouteContext;
  countries: { id: string; name: string }[];
  countryId: string | null;
  countryName: string | null;
  createdAt: string | null;
  languages: { code: string; name: string }[];
  languageName: string | null;
  phone: string | null;
  primaryLanguage: string | null;
  quickActions: DashboardQuickAction[];
  updatedAt: string | null;
};

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function toCount(value: number | null): number {
  return value ?? 0;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isAfter(value: string | null, baseline: string | null): boolean {
  if (!value) {
    return false;
  }

  if (!baseline) {
    return true;
  }

  return new Date(value).getTime() > new Date(baseline).getTime();
}

function getRolePanel(
  memberTypeCode: DashboardRouteContext["memberTypeCode"],
): DashboardRolePanel {
  return {
    agent: {
      descriptionKey: "dashboard.role.agent.description",
      focusKey: "dashboard.role.agent.focus",
      titleKey: "dashboard.role.agent.title",
    },
    buyer: {
      descriptionKey: "dashboard.role.buyer.description",
      focusKey: "dashboard.role.buyer.focus",
      titleKey: "dashboard.role.buyer.title",
    },
    professor: {
      descriptionKey: "dashboard.role.professor.description",
      focusKey: "dashboard.role.professor.focus",
      titleKey: "dashboard.role.professor.title",
    },
    student: {
      descriptionKey: "dashboard.role.student.description",
      focusKey: "dashboard.role.student.focus",
      titleKey: "dashboard.role.student.title",
    },
    supplier: {
      descriptionKey: "dashboard.role.supplier.description",
      focusKey: "dashboard.role.supplier.focus",
      titleKey: "dashboard.role.supplier.title",
    },
  }[memberTypeCode];
}

function getQuickActions(
  memberTypeCode: DashboardRouteContext["memberTypeCode"],
): DashboardQuickAction[] {
  return {
    agent: [
      {
        href: "/dashboard/referrals",
        labelKey: "dashboard.action.network",
        metaKey: "dashboard.action.network.agentMeta",
      },
      {
        href: "/dashboard/messages",
        labelKey: "dashboard.action.messages",
        metaKey: "dashboard.action.messages.agentMeta",
      },
      {
        href: "/dashboard/activities",
        labelKey: "dashboard.action.activity",
        metaKey: "dashboard.action.activity.agentMeta",
      },
    ],
    buyer: [
      {
        href: "/buy-sell/buy-requests",
        labelKey: "dashboard.action.buyRequest",
        metaKey: "dashboard.action.buyRequest.meta",
      },
      {
        href: "/dashboard/referrals",
        labelKey: "dashboard.action.referrals",
        metaKey: "dashboard.action.referrals.buyerMeta",
      },
      {
        href: "/commercial",
        labelKey: "dashboard.action.exploreSuppliers",
        metaKey: "dashboard.action.exploreSuppliers.meta",
      },
      {
        href: "/dashboard/messages",
        labelKey: "dashboard.action.messages",
        metaKey: "dashboard.action.messages.buyerMeta",
      },
    ],
    professor: [
      {
        href: "/dashboard/referrals",
        labelKey: "dashboard.action.mentorNetwork",
        metaKey: "dashboard.action.mentorNetwork.meta",
      },
      {
        href: "/dashboard/activities",
        labelKey: "dashboard.action.activity",
        metaKey: "dashboard.action.activity.professorMeta",
      },
      {
        href: "/dashboard/messages",
        labelKey: "dashboard.action.messages",
        metaKey: "dashboard.action.messages.professorMeta",
      },
    ],
    student: [
      {
        href: "/dashboard/referrals",
        labelKey: "dashboard.action.referrals",
        metaKey: "dashboard.action.referrals.studentMeta",
      },
      {
        href: "/dashboard/products",
        labelKey: "dashboard.action.ambassadorContent",
        metaKey: "dashboard.action.ambassadorContent.meta",
      },
      {
        href: "/dashboard/activities",
        labelKey: "dashboard.action.passport",
        metaKey: "dashboard.action.passport.meta",
      },
      {
        href: "/dashboard/messages",
        labelKey: "dashboard.action.messages",
        metaKey: "dashboard.action.messages.studentMeta",
      },
    ],
    supplier: [
      {
        href: "/dashboard/company",
        labelKey: "dashboard.action.company",
        metaKey: "dashboard.action.company.meta",
      },
      {
        href: "/dashboard/products",
        labelKey: "dashboard.action.catalog",
        metaKey: "dashboard.action.catalog.meta",
      },
      {
        href: "/service",
        labelKey: "dashboard.action.fda",
        metaKey: "dashboard.action.fda.meta",
      },
    ],
  }[memberTypeCode];
}

async function getRoleIds(supabase: Supabase) {
  const [
    supplier,
    buyer,
    student,
    agent,
    professor,
  ] = await Promise.all([
    supabase.rpc("current_supplier_id"),
    supabase.rpc("current_buyer_id"),
    supabase.rpc("current_student_id"),
    supabase.rpc("current_agent_id"),
    supabase.rpc("current_professor_id"),
  ]);

  return {
    agentId: agent.data,
    buyerId: buyer.data,
    professorId: professor.data,
    studentId: student.data,
    supplierId: supplier.data,
  };
}

async function getSupplierCompanyId(supabase: Supabase, supplierId: string | null) {
  if (!supplierId) {
    return null;
  }

  const { data } = await supabase
    .from("suppliers")
    .select("company_id")
    .eq("id", supplierId)
    .maybeSingle();

  return data?.company_id ?? null;
}

async function countRows(
  supabase: Supabase,
  table:
    | "buy_requests"
    | "buy_sell_posts"
    | "epc_posts"
    | "industrial_posts"
    | "matching_requests"
    | "messages"
    | "products"
    | "students"
    | "student_showcases"
    | "market_research_reports"
    | "thailand_fda_applications",
  column: string,
  value: string | null,
): Promise<number> {
  if (!value) {
    return 0;
  }

  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, value);

  return toCount(count);
}

async function getDashboardCompanyOptions(supabase: Supabase) {
  const [companyTypes, countries, industries] = await Promise.all([
    supabase
      .from("company_types")
      .select("id,name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("countries")
      .select("id,name")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("industries")
      .select("id,name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  const normalize = (
    rows: { id: string; name: string }[] | null,
  ): DashboardCompanyOption[] => (rows ?? []).map((row) => ({ id: row.id, name: row.name }));

  return {
    companyTypes: normalize(companyTypes.data),
    countries: normalize(countries.data),
    industries: normalize(industries.data),
  };
}

function findOptionName(options: DashboardCompanyOption[], id: string | null | undefined) {
  if (!id) {
    return null;
  }

  return options.find((option) => option.id === id)?.name ?? null;
}

function getReferralSectionCopy(memberTypeCode: DashboardRouteContext["memberTypeCode"]) {
  return {
    agent: {
      descriptionKey: "dashboard.referrals.agent.description",
      emptyKey: "dashboard.referrals.agent.empty",
      titleKey: "dashboard.referrals.agent.title",
    },
    buyer: {
      descriptionKey: "dashboard.referrals.buyer.description",
      emptyKey: "dashboard.referrals.buyer.empty",
      titleKey: "dashboard.referrals.buyer.title",
    },
    professor: {
      descriptionKey: "dashboard.referrals.professor.description",
      emptyKey: "dashboard.referrals.professor.empty",
      titleKey: "dashboard.referrals.professor.title",
    },
    student: {
      descriptionKey: "dashboard.referrals.student.description",
      emptyKey: "dashboard.referrals.student.empty",
      titleKey: "dashboard.referrals.student.title",
    },
    supplier: {
      descriptionKey: "dashboard.referrals.supplier.description",
      emptyKey: "dashboard.referrals.supplier.empty",
      titleKey: "dashboard.referrals.supplier.title",
    },
  }[memberTypeCode];
}

function formatReferenceId(value: string | null | undefined): string {
  return value ? `${value.slice(0, 8)}...` : "Not assigned";
}

async function getCountryNameMap(supabase: Supabase, countryIds: string[]) {
  if (countryIds.length === 0) {
    return new Map<string, string>();
  }

  const { data } = await supabase
    .from("countries")
    .select("id,name")
    .in("id", countryIds);

  return new Map((data ?? []).map((country) => [country.id, country.name]));
}

async function getProfileNameMap(supabase: Supabase, profileIds: string[]) {
  if (profileIds.length === 0) {
    return new Map<string, string>();
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,display_name")
    .in("id", profileIds);

  return new Map(
    (data ?? []).map((profile) => [
      profile.id,
      profile.display_name ?? formatReferenceId(profile.id),
    ]),
  );
}

type DashboardProfileSummary = {
  displayName: string;
  email: string | null;
};

async function getProfileSummaryMap(supabase: Supabase, profileIds: string[]) {
  if (profileIds.length === 0) {
    return new Map<string, DashboardProfileSummary>();
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,display_name,email")
    .in("id", profileIds);

  return new Map(
    (data ?? []).map((profile) => [
      profile.id,
      {
        displayName: profile.display_name ?? profile.email ?? formatReferenceId(profile.id),
        email: profile.email,
      },
    ]),
  );
}

async function getMemberReferralInviteData(
  supabase: Supabase,
  context: DashboardRouteContext,
  targetMemberType: "buyer" | "student",
  targetLabel: "Buyer" | "Student",
) {
  const records: DashboardRecord[] = [];
  const tree: DashboardReferralTreeNode[] = [];
  let activeCode: DashboardReferralCode | null = null;

  const { data: codes } = await supabase
    .from("member_referral_codes")
    .select("id,code,referral_url,is_active,target_member_type,updated_at")
    .eq("owner_profile_id", context.profileId)
    .eq("target_member_type", targetMemberType)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(3);

  const codeRows = codes ?? [];
  const firstCode = codeRows[0];

  if (firstCode) {
    activeCode = {
      code: firstCode.code,
      isActive: firstCode.is_active,
      referralUrl: firstCode.referral_url,
      targetMemberType: firstCode.target_member_type,
      updatedAt: firstCode.updated_at,
    };
  }

  records.push(
    ...codeRows.map((code) => ({
      meta: code.referral_url ?? formatDate(code.updated_at),
      status: code.is_active ? "active" : "inactive",
      title: `${targetLabel} invitation code ${code.code}`,
    })),
  );

  const codeIds = codeRows.map((code) => code.id);
  const { data: signups } =
    codeIds.length > 0
      ? await supabase
          .from("member_referral_signups")
          .select("id,referral_code_id,referred_profile_id,status,joined_at,updated_at")
          .in("referral_code_id", codeIds)
          .is("deleted_at", null)
          .order("updated_at", { ascending: false })
          .limit(20)
      : { data: [] };

  const signupRows = signups ?? [];
  const profileNameMap = await getProfileNameMap(
    supabase,
    signupRows.map((signup) => signup.referred_profile_id),
  );

  records.push(
    ...signupRows.map((signup) => ({
      meta: formatDate(signup.joined_at ?? signup.updated_at),
      status: signup.status,
      title: `${targetLabel} invitee ${
        profileNameMap.get(signup.referred_profile_id) ?? formatReferenceId(signup.referred_profile_id)
      }`,
    })),
  );

  if (activeCode) {
    tree.push({
      badge: activeCode.code,
      children: signupRows.map((signup) => ({
        badge: signup.status,
        meta: formatDate(signup.joined_at ?? signup.updated_at),
        status: signup.status,
        title: profileNameMap.get(signup.referred_profile_id) ?? formatReferenceId(signup.referred_profile_id),
      })),
      meta: activeCode.referralUrl,
      status: activeCode.isActive ? "active" : "inactive",
      title: `${targetLabel} invitation link`,
    });
  }

  return {
    activeCode,
    records,
    summaryCards: [
      {
        labelKey: "dashboard.referrals.metric.codes",
        value: codeRows.length,
      },
      {
        labelKey: "dashboard.referrals.metric.invited",
        value: signupRows.length,
      },
    ],
    tree,
  };
}

async function getOverviewMetrics(
  supabase: Supabase,
  context: DashboardRouteContext,
): Promise<DashboardMetric[]> {
  const roleIds = await getRoleIds(supabase);

  const [
    products,
    industrial,
    epc,
    sellPosts,
    buyRequests,
    matchingRequests,
    showcases,
    reports,
    events,
    fda,
    conversations,
    rewards,
    badges,
    buyerNetwork,
    studentNetwork,
  ] = await Promise.all([
    roleIds.supplierId
      ? supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("supplier_id", roleIds.supplierId)
      : Promise.resolve({ count: 0 }),
    roleIds.supplierId
      ? supabase
          .from("industrial_posts")
          .select("id", { count: "exact", head: true })
          .eq("supplier_id", roleIds.supplierId)
      : Promise.resolve({ count: 0 }),
    roleIds.supplierId
      ? supabase
          .from("epc_posts")
          .select("id", { count: "exact", head: true })
          .eq("supplier_id", roleIds.supplierId)
      : Promise.resolve({ count: 0 }),
    roleIds.supplierId
      ? supabase
          .from("buy_sell_posts")
          .select("id", { count: "exact", head: true })
          .eq("supplier_id", roleIds.supplierId)
      : Promise.resolve({ count: 0 }),
    roleIds.buyerId
      ? supabase
          .from("buy_requests")
          .select("id", { count: "exact", head: true })
          .eq("buyer_id", roleIds.buyerId)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("matching_requests")
      .select("id", { count: "exact", head: true })
      .or(
        `requester_profile_id.eq.${context.profileId},target_profile_id.eq.${context.profileId}`,
      ),
    roleIds.studentId
      ? supabase
          .from("student_showcases")
          .select("id", { count: "exact", head: true })
          .eq("student_id", roleIds.studentId)
      : Promise.resolve({ count: 0 }),
    roleIds.studentId
      ? supabase
          .from("market_research_reports")
          .select("id", { count: "exact", head: true })
          .eq("student_id", roleIds.studentId)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("event_applications")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", context.profileId),
    roleIds.supplierId
      ? supabase
          .from("thailand_fda_applications")
          .select("id", { count: "exact", head: true })
          .eq("supplier_id", roleIds.supplierId)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("conversation_members")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", context.profileId),
    supabase
      .from("rewards")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", context.profileId),
    supabase
      .from("profile_badges")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", context.profileId)
      .eq("is_active", true)
      .is("revoked_at", null),
    roleIds.agentId
      ? supabase
          .from("country_agents")
          .select("id", { count: "exact", head: true })
          .eq("agent_id", roleIds.agentId)
      : Promise.resolve({ count: 0 }),
    roleIds.professorId
      ? supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .eq("professor_id", roleIds.professorId)
      : Promise.resolve({ count: 0 }),
  ]);

  const supplierContent =
    toCount(products.count) +
    toCount(industrial.count) +
    toCount(epc.count) +
    toCount(sellPosts.count);

  const metricsByRole: Record<DashboardRouteContext["memberTypeCode"], DashboardMetric[]> = {
    agent: [
      { labelKey: "dashboard.metric.managedCountries", value: toCount(buyerNetwork.count) },
      { labelKey: "dashboard.metric.matching", value: toCount(matchingRequests.count) },
      { labelKey: "dashboard.metric.messages", value: toCount(conversations.count) },
    ],
    buyer: [
      { labelKey: "dashboard.metric.buyRequests", value: toCount(buyRequests.count) },
      { labelKey: "dashboard.metric.matching", value: toCount(matchingRequests.count) },
      { labelKey: "dashboard.metric.messages", value: toCount(conversations.count) },
    ],
    professor: [
      { labelKey: "dashboard.metric.students", value: toCount(studentNetwork.count) },
      { labelKey: "dashboard.metric.matching", value: toCount(matchingRequests.count) },
      { labelKey: "dashboard.metric.messages", value: toCount(conversations.count) },
    ],
    student: [
      { labelKey: "dashboard.metric.showcases", value: toCount(showcases.count) },
      { labelKey: "dashboard.metric.marketResearch", value: toCount(reports.count) },
      { labelKey: "dashboard.metric.rewards", value: toCount(rewards.count) },
      { labelKey: "dashboard.metric.badges", value: toCount(badges.count) },
    ],
    supplier: [
      { labelKey: "dashboard.metric.content", value: supplierContent },
      { labelKey: "dashboard.metric.fda", value: toCount(fda.count) },
      { labelKey: "dashboard.metric.messages", value: toCount(conversations.count) },
    ],
  };

  return [
    ...metricsByRole[context.memberTypeCode],
    { labelKey: "dashboard.metric.events", value: toCount(events.count) },
  ];
}

async function getRecentActivities(
  supabase: Supabase,
  profileId: string,
): Promise<DashboardRecord[]> {
  const { data } = await supabase
    .from("activity_logs")
    .select("activity_type,summary,target_table,target_id,occurred_at")
    .eq("profile_id", profileId)
    .order("occurred_at", { ascending: false })
    .limit(6);

  return (data ?? []).map((activity) => ({
    meta: formatDate(activity.occurred_at),
    status: activity.activity_type,
    title: activity.summary ?? activity.target_table ?? activity.activity_type,
  }));
}

async function getWorkItems(
  supabase: Supabase,
  context: DashboardRouteContext,
): Promise<DashboardRecord[]> {
  const roleIds = await getRoleIds(supabase);

  if (context.memberTypeCode === "supplier") {
    const [products, fdaApplications] = await Promise.all([
      roleIds.supplierId
        ? supabase
            .from("products")
            .select("id,title,approval_status,updated_at")
            .eq("supplier_id", roleIds.supplierId)
            .in("approval_status", ["draft", "submitted", "reviewing", "rejected"])
            .order("updated_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] }),
      roleIds.supplierId
        ? supabase
            .from("thailand_fda_applications")
            .select("id,product_name,status,updated_at")
            .eq("supplier_id", roleIds.supplierId)
            .order("updated_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] }),
    ]);

    return [
      ...(products.data ?? []).map((item) => ({
        href: `/commercial/${item.id}`,
        meta: formatDate(item.updated_at),
        status: item.approval_status,
        title: item.title,
      })),
      ...(fdaApplications.data ?? []).map((item) => ({
        href: "/service",
        meta: formatDate(item.updated_at),
        status: item.status,
        title: item.product_name,
      })),
    ].slice(0, 6);
  }

  if (context.memberTypeCode === "buyer") {
    const { data } = roleIds.buyerId
      ? await supabase
          .from("buy_requests")
          .select("id,title,approval_status,updated_at")
          .eq("buyer_id", roleIds.buyerId)
          .in("approval_status", ["draft", "submitted", "reviewing", "rejected"])
          .order("updated_at", { ascending: false })
          .limit(6)
      : { data: [] };

    return (data ?? []).map((item) => ({
      href: `/buy-sell/buy-requests/${item.id}`,
      meta: formatDate(item.updated_at),
      status: item.approval_status,
      title: item.title,
    }));
  }

  if (context.memberTypeCode === "student") {
    const [showcases, reports] = await Promise.all([
      roleIds.studentId
        ? supabase
            .from("student_showcases")
            .select("id,title,approval_status,updated_at")
            .eq("student_id", roleIds.studentId)
            .in("approval_status", ["draft", "submitted", "reviewing", "rejected"])
            .order("updated_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] }),
      roleIds.studentId
        ? supabase
            .from("market_research_reports")
            .select("id,title,approval_status,updated_at")
            .eq("student_id", roleIds.studentId)
            .in("approval_status", ["draft", "submitted", "reviewing", "rejected"])
            .order("updated_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] }),
    ]);

    return [
      ...(showcases.data ?? []).map((item) => ({
        href: "/dashboard/products",
        meta: formatDate(item.updated_at),
        status: item.approval_status,
        title: item.title,
      })),
      ...(reports.data ?? []).map((item) => ({
        href: "/dashboard/products",
        meta: formatDate(item.updated_at),
        status: item.approval_status,
        title: item.title,
      })),
    ].slice(0, 6);
  }

  const { data } = await supabase
    .from("matching_requests")
    .select("id,matching_type,status,updated_at")
    .or(`requester_profile_id.eq.${context.profileId},target_profile_id.eq.${context.profileId}`)
    .order("updated_at", { ascending: false })
    .limit(6);

  return (data ?? []).map((item) => ({
    href: "/dashboard/messages",
    meta: formatDate(item.updated_at),
    status: item.status,
    title: `dashboard.work.matching.${item.matching_type}`,
  }));
}

async function getSupplierOnboardingData(
  supabase: Supabase,
  context: DashboardRouteContext,
): Promise<DashboardSupplierOnboardingData | null> {
  const [roleResult, applicationResult] = await Promise.all([
    supabase
      .from("account_roles")
      .select("id,status")
      .eq("account_id", context.profileId)
      .eq("role_key", "supplier")
      .in("status", ["active", "approved"])
      .is("deleted_at", null)
      .limit(1),
    supabase
      .from("role_applications")
      .select("status,updated_at,created_at")
      .eq("account_id", context.profileId)
      .eq("requested_role_key", "supplier")
      .in("status", ["submitted", "under_review", "approved", "rejected"])
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(1),
  ]);

  const hasSupplierRole =
    context.memberTypeCode === "supplier" || Boolean(roleResult.data?.length);
  const latestApplication = applicationResult.data?.[0] ?? null;
  const nextSteps: DashboardQuickAction[] = [
    {
      href: "#",
      labelKey: "dashboard.supplierOnboarding.step.company",
      metaKey: "dashboard.supplierOnboarding.step.companyMeta",
    },
    {
      href: "#",
      labelKey: "dashboard.supplierOnboarding.step.products",
      metaKey: "dashboard.supplierOnboarding.step.productsMeta",
    },
    {
      href: "#",
      labelKey: "dashboard.supplierOnboarding.step.membership",
      metaKey: "dashboard.supplierOnboarding.step.membershipMeta",
    },
    {
      href: "#",
      labelKey: "dashboard.supplierOnboarding.step.verification",
      metaKey: "dashboard.supplierOnboarding.step.verificationMeta",
    },
  ];

  if (hasSupplierRole) {
    return {
      applicationStatus: latestApplication?.status ?? "approved",
      descriptionKey: "dashboard.supplierOnboarding.approved.description",
      nextSteps,
      status: "approved",
      titleKey: "dashboard.supplierOnboarding.approved.title",
    };
  }

  if (latestApplication?.status === "rejected") {
    return {
      applicationStatus: latestApplication.status,
      descriptionKey: "dashboard.supplierOnboarding.rejected.description",
      nextSteps,
      status: "rejected",
      titleKey: "dashboard.supplierOnboarding.rejected.title",
    };
  }

  if (
    latestApplication?.status === "submitted" ||
    latestApplication?.status === "under_review"
  ) {
    return {
      applicationStatus: latestApplication.status,
      descriptionKey: "dashboard.supplierOnboarding.submitted.description",
      nextSteps,
      status: "submitted",
      titleKey: "dashboard.supplierOnboarding.submitted.title",
    };
  }

  return null;
}

async function getAgentOnboardingData(
  supabase: Supabase,
  context: DashboardRouteContext,
): Promise<DashboardAgentOnboardingData | null> {
  const [roleResult, applicationResult] = await Promise.all([
    supabase
      .from("account_roles")
      .select("id,status")
      .eq("account_id", context.profileId)
      .eq("role_key", "agent")
      .in("status", ["active", "approved"])
      .is("deleted_at", null)
      .limit(1),
    supabase
      .from("role_applications")
      .select("status,updated_at,created_at")
      .eq("account_id", context.profileId)
      .eq("requested_role_key", "agent")
      .in("status", ["submitted", "under_review", "approved", "rejected"])
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(1),
  ]);

  const hasAgentRole = context.memberTypeCode === "agent" || Boolean(roleResult.data?.length);
  const latestApplication = applicationResult.data?.[0] ?? null;
  const nextSteps: DashboardQuickAction[] = [
    {
      href: "#",
      labelKey: "dashboard.agentOnboarding.step.invitationLink",
      metaKey: "dashboard.agentOnboarding.step.invitationLinkMeta",
    },
    {
      href: "#",
      labelKey: "dashboard.agentOnboarding.step.invitationQr",
      metaKey: "dashboard.agentOnboarding.step.invitationQrMeta",
    },
    {
      href: "#",
      labelKey: "dashboard.agentOnboarding.step.assignedBuyers",
      metaKey: "dashboard.agentOnboarding.step.assignedBuyersMeta",
    },
    {
      href: "#",
      labelKey: "dashboard.agentOnboarding.step.marketAssignment",
      metaKey: "dashboard.agentOnboarding.step.marketAssignmentMeta",
    },
  ];

  if (hasAgentRole) {
    return {
      applicationStatus: latestApplication?.status ?? "approved",
      descriptionKey: "dashboard.agentOnboarding.approved.description",
      nextSteps,
      status: "approved",
      titleKey: "dashboard.agentOnboarding.approved.title",
    };
  }

  if (latestApplication?.status === "rejected") {
    return {
      applicationStatus: latestApplication.status,
      descriptionKey: "dashboard.agentOnboarding.rejected.description",
      nextSteps,
      status: "rejected",
      titleKey: "dashboard.agentOnboarding.rejected.title",
    };
  }

  if (
    latestApplication?.status === "submitted" ||
    latestApplication?.status === "under_review"
  ) {
    return {
      applicationStatus: latestApplication.status,
      descriptionKey: "dashboard.agentOnboarding.submitted.description",
      nextSteps,
      status: "submitted",
      titleKey: "dashboard.agentOnboarding.submitted.title",
    };
  }

  return null;
}

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  const context = await requireDashboardRoute();
  const supabase = await createSupabaseServerClient();
  const [metrics, activities, workItems, supplierOnboarding, agentOnboarding] = await Promise.all([
    getOverviewMetrics(supabase, context),
    getRecentActivities(supabase, context.profileId),
    getWorkItems(supabase, context),
    getSupplierOnboardingData(supabase, context),
    getAgentOnboardingData(supabase, context),
  ]);

  return {
    agentOnboarding,
    activities,
    context,
    metrics,
    quickActions: getQuickActions(context.memberTypeCode),
    rolePanel: getRolePanel(context.memberTypeCode),
    supplierOnboarding,
    workItems,
  };
}

export async function getDashboardCompanyData(): Promise<DashboardCompanyData> {
  const context = await requireDashboardRoute();
  const supabase = await createSupabaseServerClient();
  const roleIds = await getRoleIds(supabase);
  const options = await getDashboardCompanyOptions(supabase);
  const records: DashboardRecord[] = [];
  const verificationChecklist: DashboardCompanyChecklistItem[] = [];
  let metrics: DashboardMetric[] = [];
  let profile: DashboardCompanyProfile | null = null;

  if (context.memberTypeCode === "supplier") {
    const companyId = await getSupplierCompanyId(supabase, roleIds.supplierId);
    const [companyResult, verificationResult, productCount, industrialCount, epcCount, fdaCount] =
      await Promise.all([
        companyId
          ? supabase
              .from("companies")
              .select(
                "id,name,slug,company_type_id,country_id,industry_id,website,description,approval_status,verification_status,is_active,updated_at",
              )
              .eq("id", companyId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        companyId
          ? supabase
              .from("company_verifications")
              .select(
                "status,business_registration_checked,website_checked,catalog_checked,certificate_checked,review_note,reviewed_at,updated_at",
              )
              .eq("company_id", companyId)
              .order("updated_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        countRows(supabase, "products", "supplier_id", roleIds.supplierId),
        countRows(supabase, "industrial_posts", "supplier_id", roleIds.supplierId),
        countRows(supabase, "epc_posts", "supplier_id", roleIds.supplierId),
        countRows(supabase, "thailand_fda_applications", "supplier_id", roleIds.supplierId),
      ]);

    const company = companyResult.data;
    const verification = verificationResult.data;

    if (company) {
      profile = {
        approvalStatus: company.approval_status,
        companyName: company.name,
        companyTypeId: company.company_type_id,
        companyTypeName: findOptionName(options.companyTypes, company.company_type_id),
        countryId: company.country_id,
        countryName: findOptionName(options.countries, company.country_id),
        description: company.description,
        industryId: company.industry_id,
        industryName: findOptionName(options.industries, company.industry_id),
        isActive: company.is_active,
        publicHref: company.slug ? `/companies/${company.slug}` : null,
        scopeLabelKey: "dashboard.company.supplierScope",
        status: company.approval_status,
        title: company.name,
        updatedAt: formatDate(company.updated_at),
        verificationStatus: company.verification_status,
        website: company.website,
      };

      records.push({
        href: profile.publicHref,
        meta: profile.updatedAt,
        status: company.verification_status,
        title: company.name,
      });
    }

    metrics = [
      { labelKey: "dashboard.company.metric.products", value: productCount },
      { labelKey: "dashboard.company.metric.industrial", value: industrialCount },
      { labelKey: "dashboard.company.metric.epc", value: epcCount },
      { labelKey: "dashboard.company.metric.fda", value: fdaCount },
    ];

    verificationChecklist.push(
      {
        done: Boolean(verification?.business_registration_checked),
        labelKey: "dashboard.company.check.business",
        meta: verification?.review_note ?? null,
      },
      {
        done: Boolean(verification?.website_checked),
        labelKey: "dashboard.company.check.website",
        meta: profile?.website ?? null,
      },
      {
        done: Boolean(verification?.catalog_checked),
        labelKey: "dashboard.company.check.catalog",
        meta: verification?.status ?? profile?.verificationStatus ?? null,
      },
      {
        done: Boolean(verification?.certificate_checked),
        labelKey: "dashboard.company.check.certificate",
        meta: formatDate(verification?.reviewed_at ?? verification?.updated_at),
      },
    );
  }

  if (context.memberTypeCode === "buyer" && roleIds.buyerId) {
    const [buyerResult, buyRequests, matchingRequests] = await Promise.all([
      supabase
        .from("buyers")
        .select("id,company_name,country_id,approval_status,is_active,updated_at")
        .eq("id", roleIds.buyerId)
        .maybeSingle(),
      countRows(supabase, "buy_requests", "buyer_id", roleIds.buyerId),
      countRows(supabase, "matching_requests", "requester_profile_id", context.profileId),
    ]);

    const buyer = buyerResult.data;

    if (buyer) {
      profile = {
        approvalStatus: buyer.approval_status,
        companyName: buyer.company_name,
        companyTypeId: null,
        companyTypeName: null,
        countryId: buyer.country_id,
        countryName: findOptionName(options.countries, buyer.country_id),
        description: null,
        industryId: null,
        industryName: null,
        isActive: buyer.is_active,
        publicHref: null,
        scopeLabelKey: "dashboard.company.buyerScope",
        status: buyer.approval_status,
        title: buyer.company_name ?? context.displayName ?? context.email,
        updatedAt: formatDate(buyer.updated_at),
        verificationStatus: null,
        website: null,
      };

      records.push({
        href: "/dashboard/products",
        meta: profile.countryName,
        status: buyer.approval_status,
        title: buyer.company_name ?? "dashboard.company.buyerScope",
      });
    }

    metrics = [
      { labelKey: "dashboard.company.metric.buyRequests", value: buyRequests },
      { labelKey: "dashboard.company.metric.matching", value: matchingRequests },
      { labelKey: "dashboard.company.metric.scope", value: profile?.countryName ?? "-" },
    ];
  }

  if (context.memberTypeCode === "agent" && roleIds.agentId) {
    const [agentResult, countryAgents] = await Promise.all([
      supabase
        .from("agents")
        .select("id,approval_status,is_active,updated_at")
        .eq("id", roleIds.agentId)
        .maybeSingle(),
      supabase
        .from("country_agents")
        .select("country_id,status,assigned_at,updated_at")
        .eq("agent_id", roleIds.agentId)
        .order("assigned_at", { ascending: false })
        .limit(12),
    ]);

    const agent = agentResult.data;
    const activeMarkets = (countryAgents.data ?? []).filter((item) => item.status === "active");

    profile = {
      approvalStatus: agent?.approval_status ?? null,
      companyName: context.displayName ?? context.email,
      companyTypeId: null,
      companyTypeName: null,
      countryId: null,
      countryName: activeMarkets
        .map((item) => findOptionName(options.countries, item.country_id))
        .filter(Boolean)
        .join(", "),
      description: null,
      industryId: null,
      industryName: null,
      isActive: agent?.is_active ?? false,
      publicHref: null,
      scopeLabelKey: "dashboard.company.agentScope",
      status: agent?.approval_status ?? null,
      title: context.displayName ?? context.email,
      updatedAt: formatDate(agent?.updated_at),
      verificationStatus: null,
      website: null,
    };

    records.push(
      ...(countryAgents.data ?? []).map((item) => ({
        href: "/dashboard/referrals",
        meta: formatDate(item.assigned_at ?? item.updated_at),
        status: item.status,
        title: findOptionName(options.countries, item.country_id) ?? "dashboard.company.agentScope",
      })),
    );

    metrics = [
      { labelKey: "dashboard.company.metric.assignedMarkets", value: countryAgents.data?.length ?? 0 },
      { labelKey: "dashboard.company.metric.activeMarkets", value: activeMarkets.length },
      { labelKey: "dashboard.company.metric.referralReady", value: activeMarkets.length > 0 ? "Ready" : "Pending" },
    ];
  }

  if (context.memberTypeCode === "professor" && roleIds.professorId) {
    const [professorResult, studentCount, students] = await Promise.all([
      supabase
        .from("professors")
        .select("id,university_name,approval_status,is_active,updated_at")
        .eq("id", roleIds.professorId)
        .maybeSingle(),
      countRows(supabase, "students", "professor_id", roleIds.professorId),
      supabase
        .from("students")
        .select("id,university_name,graduation_status,is_active,updated_at")
        .eq("professor_id", roleIds.professorId)
        .order("updated_at", { ascending: false })
        .limit(6),
    ]);

    const professor = professorResult.data;

    if (professor) {
      profile = {
        approvalStatus: professor.approval_status,
        companyName: professor.university_name,
        companyTypeId: null,
        companyTypeName: null,
        countryId: null,
        countryName: null,
        description: null,
        industryId: null,
        industryName: null,
        isActive: professor.is_active,
        publicHref: null,
        scopeLabelKey: "dashboard.company.professorScope",
        status: professor.approval_status,
        title: professor.university_name ?? context.displayName ?? context.email,
        updatedAt: formatDate(professor.updated_at),
        verificationStatus: null,
        website: null,
      };
    }

    records.push(
      ...(students.data ?? []).map((item) => ({
        href: "/dashboard/referrals",
        meta: formatDate(item.updated_at),
        status: item.is_active ? item.graduation_status : "inactive",
        title: item.university_name ?? "dashboard.company.studentScope",
      })),
    );

    metrics = [
      { labelKey: "dashboard.company.metric.students", value: studentCount },
      { labelKey: "dashboard.company.metric.activeStudents", value: (students.data ?? []).filter((item) => item.is_active).length },
      { labelKey: "dashboard.company.metric.scope", value: professor?.university_name ?? "-" },
    ];
  }

  if (context.memberTypeCode === "student" && roleIds.studentId) {
    const [studentResult, showcaseCount, reportCount] = await Promise.all([
      supabase
        .from("students")
        .select("id,professor_id,university_name,graduation_status,is_active,updated_at")
        .eq("id", roleIds.studentId)
        .maybeSingle(),
      countRows(supabase, "student_showcases", "student_id", roleIds.studentId),
      countRows(supabase, "market_research_reports", "student_id", roleIds.studentId),
    ]);

    const student = studentResult.data;

    if (student) {
      profile = {
        approvalStatus: student.graduation_status,
        companyName: student.university_name,
        companyTypeId: null,
        companyTypeName: null,
        countryId: null,
        countryName: null,
        description: null,
        industryId: null,
        industryName: null,
        isActive: student.is_active,
        publicHref: null,
        scopeLabelKey: "dashboard.company.studentScope",
        status: student.graduation_status,
        title: student.university_name ?? context.displayName ?? context.email,
        updatedAt: formatDate(student.updated_at),
        verificationStatus: student.professor_id ? "mentor_assigned" : "mentor_pending",
        website: null,
      };

      records.push({
        href: "/dashboard/referrals",
        meta: student.professor_id ? "dashboard.company.mentorAssigned" : "dashboard.company.mentorPending",
        status: student.graduation_status,
        title: student.university_name ?? "dashboard.company.studentScope",
      });
    }

    metrics = [
      { labelKey: "dashboard.company.metric.showcases", value: showcaseCount },
      { labelKey: "dashboard.company.metric.reports", value: reportCount },
      { labelKey: "dashboard.company.metric.mentor", value: student?.professor_id ? "Assigned" : "Pending" },
    ];
  }

  const roleSummary =
    {
      agent: "dashboard.company.agentScope",
      buyer: "dashboard.company.buyerScope",
      professor: "dashboard.company.professorScope",
      student: "dashboard.company.studentScope",
      supplier: "dashboard.company.supplierScope",
    }[context.memberTypeCode];

  if (!profile) {
    profile = {
      approvalStatus: null,
      companyName: context.displayName ?? context.email,
      companyTypeId: null,
      companyTypeName: null,
      countryId: null,
      countryName: null,
      description: null,
      industryId: null,
      industryName: null,
      isActive: context.activityStatus === "active",
      publicHref: null,
      scopeLabelKey: roleSummary,
      status: context.memberTypeCode,
      title: context.displayName ?? context.email,
      updatedAt: null,
      verificationStatus: null,
      website: null,
    };
  }

  return {
    context,
    descriptionKey: "dashboard.company.description",
    emptyKey: "dashboard.company.empty",
    metrics,
    options,
    profile,
    records,
    titleKey: "dashboard.company.title",
    verificationChecklist,
  };
}

function countApproved(records: DashboardProductRecord[]): number {
  return records.filter((record) => record.status === "approved").length;
}

function countPending(records: DashboardProductRecord[]): number {
  return records.filter((record) =>
    ["draft", "reviewing", "submitted"].includes(record.status ?? ""),
  ).length;
}

function sortProductRecords(records: DashboardProductRecord[]): DashboardProductRecord[] {
  return records.sort((a, b) => {
    const left = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const right = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;

    return right - left;
  });
}

function getActivityHref(targetTable: string | null, targetId: string | null): string | null {
  if (!targetTable) {
    return null;
  }

  if (targetTable === "companies") {
    return "/dashboard/company";
  }

  if (targetTable === "conversations") {
    return targetId ? `/dashboard/messages?conversation=${targetId}` : "/dashboard/messages";
  }

  if (targetTable === "products" && targetId) {
    return `/commercial/${targetId}`;
  }

  if (targetTable === "industrial_posts" && targetId) {
    return `/industrial/${targetId}`;
  }

  if (targetTable === "epc_posts" && targetId) {
    return `/epc/${targetId}`;
  }

  if (targetTable === "buy_requests" && targetId) {
    return `/buy-sell/buy-requests/${targetId}`;
  }

  if (targetTable === "buy_sell_posts" && targetId) {
    return `/buy-sell/sell-products/${targetId}`;
  }

  if (
    targetTable === "student_showcases" ||
    targetTable === "market_research_reports" ||
    targetTable === "thailand_fda_applications"
  ) {
    return "/dashboard/products";
  }

  return null;
}

function formatTargetTable(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function getActivityGuide(
  memberTypeCode: DashboardRouteContext["memberTypeCode"],
): DashboardRecord[] {
  const roleKey = memberTypeCode ?? "member";
  const guideKey = ["supplier", "buyer", "agent", "professor", "student"].includes(roleKey)
    ? roleKey
    : "member";

  return [
    {
      meta: null,
      status: "active",
      title: `dashboard.activities.guide.${guideKey}.primary`,
    },
    {
      meta: null,
      status: "pending",
      title: `dashboard.activities.guide.${guideKey}.secondary`,
    },
    {
      meta: null,
      status: "approved",
      title: "dashboard.activities.guide.common",
    },
  ];
}

export async function getDashboardProductsData(): Promise<DashboardProductsData> {
  const context = await requireDashboardRoute();
  const supabase = await createSupabaseServerClient();
  const roleIds = await getRoleIds(supabase);
  const records: DashboardProductRecord[] = [];
  let studentShowcase: DashboardStudentShowcaseData | null = null;

  if (roleIds.supplierId) {
    const [products, industrial, epc, sellPosts] = await Promise.all([
      supabase
        .from("products")
        .select("id,title,summary,description,approval_status,updated_at")
        .eq("supplier_id", roleIds.supplierId)
        .order("updated_at", { ascending: false })
        .limit(8),
      supabase
        .from("industrial_posts")
        .select("id,title,summary,description,approval_status,updated_at")
        .eq("supplier_id", roleIds.supplierId)
        .order("updated_at", { ascending: false })
        .limit(8),
      supabase
        .from("epc_posts")
        .select("id,title,summary,description,approval_status,updated_at")
        .eq("supplier_id", roleIds.supplierId)
        .order("updated_at", { ascending: false })
        .limit(8),
      supabase
        .from("buy_sell_posts")
        .select("id,title,description,approval_status,updated_at")
        .eq("supplier_id", roleIds.supplierId)
        .order("updated_at", { ascending: false })
        .limit(8),
    ]);

    records.push(
      ...(products.data ?? []).map((item) => ({
        description: item.summary ?? item.description,
        href: `/commercial/${item.id}`,
        kind: "commercial" as const,
        meta: formatDate(item.updated_at),
        status: item.approval_status,
        title: item.title,
        updatedAt: item.updated_at,
      })),
      ...(industrial.data ?? []).map((item) => ({
        description: item.summary ?? item.description,
        href: `/industrial/${item.id}`,
        kind: "industrial" as const,
        meta: formatDate(item.updated_at),
        status: item.approval_status,
        title: item.title,
        updatedAt: item.updated_at,
      })),
      ...(epc.data ?? []).map((item) => ({
        description: item.summary ?? item.description,
        href: `/epc/${item.id}`,
        kind: "epc" as const,
        meta: formatDate(item.updated_at),
        status: item.approval_status,
        title: item.title,
        updatedAt: item.updated_at,
      })),
      ...(sellPosts.data ?? []).map((item) => ({
        description: item.description,
        href: `/buy-sell/sell-products/${item.id}`,
        kind: "sell-product" as const,
        meta: formatDate(item.updated_at),
        status: item.approval_status,
        title: item.title,
        updatedAt: item.updated_at,
      })),
    );
  }

  if (roleIds.buyerId) {
    const { data } = await supabase
      .from("buy_requests")
      .select("id,title,details,approval_status,updated_at")
      .eq("buyer_id", roleIds.buyerId)
      .order("updated_at", { ascending: false })
      .limit(12);

    records.push(
      ...(data ?? []).map((item) => ({
        description: item.details,
        href: `/buy-sell/buy-requests/${item.id}`,
        kind: "buy-request" as const,
        meta: formatDate(item.updated_at),
        status: item.approval_status,
        title: item.title,
        updatedAt: item.updated_at,
      })),
    );
  }

  if (roleIds.studentId) {
    const [showcases, reports, products] = await Promise.all([
      supabase
        .from("student_showcases")
        .select("id,title,description,approval_status,updated_at")
        .eq("student_id", roleIds.studentId)
        .order("updated_at", { ascending: false })
        .limit(8),
      supabase
        .from("market_research_reports")
        .select("id,title,summary,approval_status,updated_at")
        .eq("student_id", roleIds.studentId)
        .order("updated_at", { ascending: false })
        .limit(8),
      supabase
        .from("products")
        .select("id,title,summary,description,approval_status,updated_at")
        .eq("approval_status", "approved")
        .order("updated_at", { ascending: false })
        .limit(8),
    ]);
    const showcaseRows = showcases.data ?? [];
    const preferredShowcase =
      showcaseRows.find((item) => item.approval_status === "draft") ??
      showcaseRows.find((item) => item.approval_status === "rejected") ??
      showcaseRows.find(
        (item) => item.approval_status === "submitted" || item.approval_status === "reviewing",
      ) ??
      showcaseRows[0] ??
      null;
    let itemCount = 0;

    if (preferredShowcase) {
      const { count } = await supabase
        .from("student_showcase_items")
        .select("id", { count: "exact", head: true })
        .eq("showcase_id", preferredShowcase.id);

      itemCount = count ?? 0;
    }

    studentShowcase = {
      availableProducts: (products.data ?? []).map((item) => ({
        id: item.id,
        status: item.approval_status,
        summary: item.summary ?? item.description,
        title: item.title,
        updatedAt: item.updated_at,
      })),
      currentShowcase: preferredShowcase
        ? {
            description: preferredShowcase.description,
            id: preferredShowcase.id,
            itemCount,
            status: preferredShowcase.approval_status,
            title: preferredShowcase.title,
            updatedAt: preferredShowcase.updated_at,
          }
        : null,
    };

    records.push(
      ...showcaseRows.map((item) => ({
        description: item.description,
        kind: "showcase" as const,
        meta: formatDate(item.updated_at),
        status: item.approval_status,
        title: item.title,
        updatedAt: item.updated_at,
      })),
      ...(reports.data ?? []).map((item) => ({
        description: item.summary,
        kind: "market-research" as const,
        meta: formatDate(item.updated_at),
        status: item.approval_status,
        title: item.title,
        updatedAt: item.updated_at,
      })),
    );
  }

  const sortedRecords = sortProductRecords(records).slice(0, 16);
  const canCreateProduct = Boolean(roleIds.supplierId);
  const canCreateBuyerRequest = Boolean(roleIds.buyerId);
  const isStudent = Boolean(roleIds.studentId);
  const roleCode = context.memberTypeCode ?? "member";
  const quickActions: DashboardQuickAction[] = [
    {
      href: isStudent ? "#student-showcase" : canCreateProduct ? "#product-create" : "/commercial",
      labelKey: canCreateProduct
        ? "dashboard.products.action.createProduct"
        : isStudent
          ? "dashboard.products.action.showcase"
          : "dashboard.products.action.browseProducts",
      metaKey: canCreateProduct
        ? "dashboard.products.action.createProduct.meta"
        : isStudent
          ? "dashboard.products.action.showcase.meta"
          : "dashboard.products.action.browseProducts.meta",
    },
    {
      href: canCreateBuyerRequest ? "/buy-sell/buy-requests" : "/buy-sell",
      labelKey: canCreateBuyerRequest
        ? "dashboard.products.action.buyRequest"
        : "dashboard.products.action.marketplace",
      metaKey: canCreateBuyerRequest
        ? "dashboard.products.action.buyRequest.meta"
        : "dashboard.products.action.marketplace.meta",
    },
  ];

  if (!isStudent) {
    quickActions.push({
      href: "/dashboard/company",
      labelKey: "dashboard.products.action.profile",
      metaKey: "dashboard.products.action.profile.meta",
    });
  }

  return {
    canCreateProduct,
    checklist: [
      {
        descriptionKey: canCreateProduct
          ? "dashboard.products.checklist.supplierCreate.description"
          : canCreateBuyerRequest
            ? "dashboard.products.checklist.buyerCreate.description"
            : isStudent
              ? "dashboard.products.checklist.studentShowcase.description"
              : "dashboard.products.checklist.reviewOnly.description",
        status: canCreateProduct || canCreateBuyerRequest || isStudent ? "active" : "reviewing",
        titleKey: canCreateProduct
          ? "dashboard.products.checklist.supplierCreate.title"
          : canCreateBuyerRequest
            ? "dashboard.products.checklist.buyerCreate.title"
            : isStudent
              ? "dashboard.products.checklist.studentShowcase.title"
              : "dashboard.products.checklist.reviewOnly.title",
      },
      {
        descriptionKey: "dashboard.products.checklist.approval.description",
        status: "submitted",
        titleKey: "dashboard.products.checklist.approval.title",
      },
      {
        descriptionKey: "dashboard.products.checklist.public.description",
        status: "approved",
        titleKey: "dashboard.products.checklist.public.title",
      },
    ],
    context,
    descriptionKey: "dashboard.products.description",
    emptyKey: "dashboard.products.empty",
    metrics: [
      {
        labelKey: "dashboard.products.metric.total",
        value: sortedRecords.length,
      },
      {
        labelKey: "dashboard.products.metric.pending",
        value: countPending(sortedRecords),
      },
      {
        labelKey: "dashboard.products.metric.approved",
        value: countApproved(sortedRecords),
      },
      {
        labelKey: `dashboard.products.metric.${roleCode}`,
        value: roleCode === "agent" || roleCode === "professor" ? "Review" : "Ready",
      },
    ],
    quickActions,
    records: sortedRecords,
    studentShowcase,
    titleKey: "dashboard.products.title",
  };
}

export async function getDashboardReferralsData(): Promise<DashboardReferralData> {
  const context = await requireDashboardRoute();
  const supabase = await createSupabaseServerClient();
  const roleIds = await getRoleIds(supabase);
  const copy = getReferralSectionCopy(context.memberTypeCode);
  const records: DashboardRecord[] = [];
  let activeCode: DashboardReferralCode | null = null;
  let mentorContact: DashboardNetworkContact | null = null;
  const summaryCards: DashboardMetric[] = [];
  const studentContacts: DashboardNetworkContact[] = [];
  const tree: DashboardReferralTreeNode[] = [];

  if (roleIds.buyerId) {
    const [codes, outgoingRelations, incomingRelations] = await Promise.all([
      supabase
        .from("referral_codes")
        .select("id,code,referral_url,is_active,updated_at")
        .eq("buyer_id", roleIds.buyerId)
        .order("updated_at", { ascending: false })
        .limit(3),
      supabase
        .from("referral_relations")
        .select("id,child_buyer_id,referral_code_id,status,reward_status,created_at,updated_at")
        .eq("parent_buyer_id", roleIds.buyerId)
        .order("updated_at", { ascending: false })
        .limit(20),
      supabase
        .from("referral_relations")
        .select("id,parent_buyer_id,referral_code_id,status,reward_status,created_at,updated_at")
        .eq("child_buyer_id", roleIds.buyerId)
        .order("updated_at", { ascending: false })
        .limit(8),
    ]);

    const firstCode = codes.data?.[0];
    if (firstCode) {
      activeCode = {
        code: firstCode.code,
        isActive: firstCode.is_active,
        referralUrl: firstCode.referral_url,
        updatedAt: firstCode.updated_at,
      };
    }

    summaryCards.push(
      {
        labelKey: "dashboard.referrals.metric.codes",
        value: codes.data?.length ?? 0,
      },
      {
        labelKey: "dashboard.referrals.metric.invited",
        value: outgoingRelations.data?.length ?? 0,
      },
      {
        labelKey: "dashboard.referrals.metric.incoming",
        value: incomingRelations.data?.length ?? 0,
      },
    );

    records.push(
      ...(codes.data ?? []).map((code) => ({
        meta: code.referral_url ?? formatDate(code.updated_at),
        status: code.is_active ? "active" : "inactive",
        title: `Referral code ${code.code}`,
      })),
    );

    const childBuyerIds = (outgoingRelations.data ?? []).map((relation) => relation.child_buyer_id);
    const parentBuyerIds = (incomingRelations.data ?? []).map((relation) => relation.parent_buyer_id);
    const buyerIds = [...new Set([...childBuyerIds, ...parentBuyerIds])];
    const { data: relatedBuyers } =
      buyerIds.length > 0
        ? await supabase
            .from("buyers")
            .select("id,company_name,profile_id,approval_status,created_at")
            .in("id", buyerIds)
        : { data: [] };
    const buyerProfileIds = (relatedBuyers ?? []).map((buyer) => buyer.profile_id);
    const profileNameMap = await getProfileNameMap(supabase, buyerProfileIds);
    const buyerNameMap = new Map(
      (relatedBuyers ?? []).map((buyer) => [
        buyer.id,
        buyer.company_name ?? profileNameMap.get(buyer.profile_id) ?? formatReferenceId(buyer.id),
      ]),
    );
    const buyerJoinedMap = new Map(
      (relatedBuyers ?? []).map((buyer) => [buyer.id, formatDate(buyer.created_at)]),
    );
    const buyerStatusMap = new Map(
      (relatedBuyers ?? []).map((buyer) => [buyer.id, buyer.approval_status]),
    );

    records.push(
      ...(outgoingRelations.data ?? []).map((relation) => ({
        meta: `${buyerJoinedMap.get(relation.child_buyer_id) ?? formatDate(relation.created_at)} · Reward ${relation.reward_status}`,
        status: relation.status,
        title: `Referred buyer ${buyerNameMap.get(relation.child_buyer_id) ?? formatReferenceId(relation.child_buyer_id)}`,
      })),
      ...(incomingRelations.data ?? []).map((relation) => ({
        meta: `${buyerJoinedMap.get(relation.parent_buyer_id) ?? formatDate(relation.created_at)} · Reward ${relation.reward_status}`,
        status: relation.status,
        title: `Invited by ${buyerNameMap.get(relation.parent_buyer_id) ?? formatReferenceId(relation.parent_buyer_id)}`,
      })),
    );

    if (activeCode) {
      tree.push({
        badge: activeCode.code,
        children: (outgoingRelations.data ?? []).map((relation) => ({
          badge: buyerStatusMap.get(relation.child_buyer_id) ?? relation.status,
          meta: buyerJoinedMap.get(relation.child_buyer_id) ?? formatDate(relation.created_at),
          status: relation.reward_status,
          title: buyerNameMap.get(relation.child_buyer_id) ?? formatReferenceId(relation.child_buyer_id),
        })),
        meta: activeCode.referralUrl,
        status: activeCode.isActive ? "active" : "inactive",
        title: "Your active referral link",
      });
    }

    if ((incomingRelations.data ?? []).length > 0) {
      tree.push({
        badge: "invited by",
        children: (incomingRelations.data ?? []).map((relation) => ({
          badge: relation.status,
          meta: buyerJoinedMap.get(relation.parent_buyer_id) ?? formatDate(relation.created_at),
          status: relation.reward_status,
          title: buyerNameMap.get(relation.parent_buyer_id) ?? formatReferenceId(relation.parent_buyer_id),
        })),
        meta: "Parent buyer relationship",
        status: "active",
        title: "Referral source",
      });
    }
  }

  if (roleIds.agentId) {
    const inviteData = await getMemberReferralInviteData(supabase, context, "buyer", "Buyer");

    if (!activeCode && inviteData.activeCode) {
      activeCode = inviteData.activeCode;
    }

    records.push(...inviteData.records);
    tree.push(...inviteData.tree);
    summaryCards.push(...inviteData.summaryCards);

    const { data: assignments } = await supabase
      .from("country_agents")
      .select("country_id,status,assigned_at,updated_at")
      .eq("agent_id", roleIds.agentId)
      .order("updated_at", { ascending: false })
      .limit(8);

    const countryNameMap = await getCountryNameMap(
      supabase,
      (assignments ?? []).map((assignment) => assignment.country_id),
    );

    records.push(
      ...(assignments ?? []).map((assignment) => ({
        meta: formatDate(assignment.assigned_at ?? assignment.updated_at),
        status: assignment.status,
        title: `Assigned market ${countryNameMap.get(assignment.country_id) ?? formatReferenceId(assignment.country_id)}`,
      })),
    );
    tree.push({
      badge: "agent",
      children: (assignments ?? []).map((assignment) => ({
        badge: assignment.status,
        meta: formatDate(assignment.assigned_at ?? assignment.updated_at),
        status: assignment.status,
        title: countryNameMap.get(assignment.country_id) ?? formatReferenceId(assignment.country_id),
      })),
      meta: "Admin assigned country lanes",
      status: "active",
      title: "Agent country network",
    });
    summaryCards.push({
      labelKey: "dashboard.referrals.metric.markets",
      value: assignments?.length ?? 0,
    });
  }

  if (roleIds.professorId) {
    const inviteData = await getMemberReferralInviteData(supabase, context, "student", "Student");

    if (!activeCode && inviteData.activeCode) {
      activeCode = inviteData.activeCode;
    }

    records.push(...inviteData.records);
    tree.push(...inviteData.tree);
    summaryCards.push(...inviteData.summaryCards);

    const { data: students } = await supabase
      .from("students")
      .select("id,profile_id,graduation_status,university_name,updated_at")
      .eq("professor_id", roleIds.professorId)
      .order("updated_at", { ascending: false })
      .limit(10);
    const studentProfileIds = (students ?? []).map((student) => student.profile_id);
    const profileSummaryMap = await getProfileSummaryMap(supabase, studentProfileIds);

    records.push(
      ...(students ?? []).map((student) => ({
        meta: student.university_name ?? formatDate(student.updated_at),
        status: student.graduation_status,
        title: `Assigned ambassador ${profileSummaryMap.get(student.profile_id)?.displayName ?? formatReferenceId(student.profile_id)}`,
      })),
    );
    studentContacts.push(
      ...(students ?? []).map((student) => {
        const profile = profileSummaryMap.get(student.profile_id);

        return {
          badge: "Student",
          description:
            student.graduation_status === "graduated"
              ? "Graduated ambassador. Keep final showcase and career follow-up visible."
              : "Assigned student ambassador. Review showcase progress and follow up when needed.",
          email: profile?.email ?? null,
          href: "/dashboard/messages",
          meta: student.university_name ?? formatDate(student.updated_at),
          status: student.graduation_status,
          title: profile?.displayName ?? formatReferenceId(student.profile_id),
        };
      }),
    );
    tree.push({
      badge: "professor",
      children: (students ?? []).map((student) => ({
        badge: student.graduation_status,
        meta: student.university_name ?? formatDate(student.updated_at),
        status: student.graduation_status,
        title: profileSummaryMap.get(student.profile_id)?.displayName ?? formatReferenceId(student.profile_id),
      })),
      meta: "Mentoring relationship",
      status: "active",
      title: "Professor ambassador network",
    });
    summaryCards.push({
      labelKey: "dashboard.referrals.metric.ambassadors",
      value: students?.length ?? 0,
    });
  }

  if (roleIds.studentId) {
    const { data: student } = await supabase
      .from("students")
      .select("professor_id,graduation_status,university_name,updated_at")
      .eq("id", roleIds.studentId)
      .maybeSingle();

    if (student?.professor_id) {
      const { data: professor } = await supabase
        .from("professors")
        .select("id,profile_id,university_name,approval_status,updated_at")
        .eq("id", student.professor_id)
        .maybeSingle();
      const profileSummaryMap = await getProfileSummaryMap(
        supabase,
        professor?.profile_id ? [professor.profile_id] : [],
      );
      const professorProfile = profileSummaryMap.get(professor?.profile_id ?? "");
      const professorName = professorProfile?.displayName ?? formatReferenceId(student.professor_id);

      records.push({
        meta: professor?.university_name ?? student.university_name ?? formatDate(professor?.updated_at),
        status: professor?.approval_status ?? student.graduation_status,
        title: `Mentor professor ${professorName}`,
      });
      mentorContact = {
        badge: "Professor",
        description: "Assigned professor for showcase review, research guidance, and graduation follow-up.",
        email: professorProfile?.email ?? null,
        href: "/dashboard/messages",
        meta: professor?.university_name ?? student.university_name ?? formatDate(professor?.updated_at),
        status: professor?.approval_status ?? student.graduation_status,
        title: professorName,
      };
      tree.push({
        badge: "mentor",
        meta: professor?.university_name ?? student.university_name ?? formatDate(professor?.updated_at),
        status: professor?.approval_status ?? student.graduation_status,
        title: `Mentor professor ${professorName}`,
      });
    } else if (student) {
      records.push({
        meta: student.university_name ?? formatDate(student.updated_at),
        status: student.graduation_status,
        title: "Mentor professor not assigned yet",
      });
      mentorContact = {
        badge: "Pending",
        description: "No professor is connected yet. Ask operations to connect your professor account before showcase review.",
        email: null,
        href: "/dashboard/messages",
        meta: student.university_name ?? formatDate(student.updated_at),
        status: student.graduation_status,
        title: "Mentor professor not assigned yet",
      };
      tree.push({
        badge: "mentor",
        meta: student.university_name ?? formatDate(student.updated_at),
        status: student.graduation_status,
        title: "Mentor professor not assigned yet",
      });
    }
    summaryCards.push({
      labelKey: "dashboard.referrals.metric.mentors",
      value: student?.professor_id ? 1 : 0,
    });
  }

  const canGenerateCode = Boolean(roleIds.buyerId || roleIds.agentId || roleIds.professorId);

  return {
    activeCode,
    canGenerateCode,
    context,
    descriptionKey: copy.descriptionKey,
    emptyKey: copy.emptyKey,
    inviteGuide: [
      {
        meta: activeCode
          ? "dashboard.referrals.guide.ready.meta"
          : "dashboard.referrals.guide.generate.meta",
        status: canGenerateCode ? "active" : "pending",
        title: activeCode
          ? "dashboard.referrals.guide.ready.title"
          : "dashboard.referrals.guide.generate.title",
      },
      {
        meta: "dashboard.referrals.guide.share.meta",
        status: activeCode?.referralUrl ? "active" : "pending",
        title: "dashboard.referrals.guide.share.title",
      },
      {
        meta: "dashboard.referrals.guide.track.meta",
        status: records.length > 0 ? "active" : "pending",
        title: "dashboard.referrals.guide.track.title",
      },
    ],
    lookupDescriptionKey: "dashboard.referrals.lookup.description",
    lookupTitleKey: "dashboard.referrals.lookup.title",
    mentorContact,
    records: records.slice(0, 16),
    roleLabelKey: "dashboard.referrals.roleLabel",
    studentContacts,
    summaryCards,
    titleKey: copy.titleKey,
    tree,
  };
}

export async function getDashboardMessagesData(
  selectedConversationId?: string | null,
): Promise<DashboardMessagesData> {
  const context = await requireDashboardRoute();
  const supabase = await createSupabaseServerClient();

  const { data: currentMemberships } = await supabase
    .from("conversation_members")
    .select("conversation_id,member_role,last_read_at,muted_at,updated_at")
    .eq("profile_id", context.profileId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(30);

  const conversationIds = Array.from(
    new Set((currentMemberships ?? []).map((item) => item.conversation_id)),
  );

  if (conversationIds.length === 0) {
    return {
      context,
      conversations: [],
      descriptionKey: "dashboard.messages.description",
      emptyKey: "dashboard.messages.empty",
      metrics: [
        { labelKey: "dashboard.messages.totalThreads", value: 0 },
        { labelKey: "dashboard.messages.unreadThreads", value: 0 },
        { labelKey: "dashboard.messages.activeThreads", value: 0 },
      ],
      selectedConversation: null,
      selectedConversationId: null,
      titleKey: "dashboard.messages.title",
    };
  }

  const [conversationResult, memberResult, messageResult] = await Promise.all([
    supabase
      .from("conversations")
      .select("id,subject,conversation_type,is_blocked,is_active,updated_at,created_at")
      .in("id", conversationIds)
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("conversation_members")
      .select("conversation_id,profile_id,member_role,last_read_at,is_active")
      .in("conversation_id", conversationIds)
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("messages")
      .select("id,conversation_id,sender_profile_id,body,blocked_at,created_at,updated_at")
      .in("conversation_id", conversationIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(120),
  ]);

  const allMembers = memberResult.data ?? [];
  const rawMessages = messageResult.data ?? [];
  const profileIds = Array.from(
    new Set([
      ...allMembers.map((item) => item.profile_id),
      ...rawMessages.map((item) => item.sender_profile_id),
    ]),
  );

  const { data: profiles } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id,display_name,member_type_id")
        .in("id", profileIds)
    : { data: [] };

  const memberTypeIds = Array.from(
    new Set((profiles ?? []).map((profile) => profile.member_type_id).filter(Boolean)),
  );
  const { data: memberTypes } = memberTypeIds.length
    ? await supabase.from("member_types").select("id,code,name").in("id", memberTypeIds)
    : { data: [] };

  const memberTypeById = new Map(
    (memberTypes ?? []).map((memberType) => [memberType.id, memberType.code]),
  );
  const profileById = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      {
        displayName: profile.display_name ?? formatReferenceId(profile.id),
        memberTypeCode: memberTypeById.get(profile.member_type_id) ?? null,
      },
    ]),
  );
  const currentMembershipByConversation = new Map(
    (currentMemberships ?? []).map((item) => [item.conversation_id, item]),
  );
  const membersByConversation = new Map<string, typeof allMembers>();

  for (const member of allMembers) {
    const list = membersByConversation.get(member.conversation_id) ?? [];
    list.push(member);
    membersByConversation.set(member.conversation_id, list);
  }

  const messagesByConversation = new Map<string, DashboardMessageItem[]>();

  for (const message of rawMessages) {
    const sender = profileById.get(message.sender_profile_id);
    const item: DashboardMessageItem = {
      blockedAt: message.blocked_at,
      body: message.body,
      conversationId: message.conversation_id,
      createdAt: message.created_at,
      id: message.id,
      isMine: message.sender_profile_id === context.profileId,
      senderName: sender?.displayName ?? "Member",
      senderProfileId: message.sender_profile_id,
    };
    const list = messagesByConversation.get(message.conversation_id) ?? [];
    list.push(item);
    messagesByConversation.set(message.conversation_id, list);
  }

  const conversations: DashboardConversation[] = (conversationResult.data ?? [])
    .map((conversation) => {
      const currentMembership = currentMembershipByConversation.get(conversation.id);
      const participants = (membersByConversation.get(conversation.id) ?? []).map(
        (member): DashboardMessageParticipant => {
          const profile = profileById.get(member.profile_id);

          return {
            displayName: profile?.displayName ?? "Member",
            isCurrentUser: member.profile_id === context.profileId,
            lastReadAt: member.last_read_at,
            memberRole: member.member_role,
            memberTypeCode: profile?.memberTypeCode ?? null,
            profileId: member.profile_id,
          };
        },
      );
      const messages = (messagesByConversation.get(conversation.id) ?? []).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      const lastMessage = messages.at(-1) ?? null;
      const participantNames = participants
        .filter((participant) => !participant.isCurrentUser)
        .map((participant) => participant.displayName)
        .slice(0, 3);
      const fallbackSubject =
        participantNames.length > 0 ? participantNames.join(", ") : "Conversation";

      return {
        conversationType: conversation.conversation_type,
        id: conversation.id,
        isBlocked: conversation.is_blocked,
        lastMessage,
        lastReadAt: currentMembership?.last_read_at ?? null,
        memberRole: currentMembership?.member_role ?? "participant",
        messages,
        participants,
        status: conversation.is_blocked ? "blocked" : currentMembership?.muted_at ? "muted" : "active",
        subject: conversation.subject ?? fallbackSubject,
        unreadCount: messages.filter(
          (message) =>
            !message.isMine &&
            !message.blockedAt &&
            isAfter(message.createdAt, currentMembership?.last_read_at ?? null),
        ).length,
        updatedAt: lastMessage?.createdAt ?? conversation.updated_at ?? conversation.created_at,
      };
    })
    .sort((a, b) => {
      const left = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const right = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return right - left;
    });

  const accessibleSelectedId: string | null = conversations.some(
    (conversation) => conversation.id === selectedConversationId,
  )
    ? (selectedConversationId ?? null)
    : conversations[0]?.id ?? null;
  const selectedConversation =
    conversations.find((conversation) => conversation.id === accessibleSelectedId) ?? null;
  const unreadThreads = conversations.filter((conversation) => conversation.unreadCount > 0).length;

  return {
    context,
    conversations,
    descriptionKey: "dashboard.messages.description",
    emptyKey: "dashboard.messages.empty",
    metrics: [
      { labelKey: "dashboard.messages.totalThreads", value: conversations.length },
      { labelKey: "dashboard.messages.unreadThreads", value: unreadThreads },
      {
        labelKey: "dashboard.messages.activeThreads",
        value: conversations.filter((conversation) => !conversation.isBlocked).length,
      },
    ],
    selectedConversation,
    selectedConversationId: accessibleSelectedId,
    titleKey: "dashboard.messages.title",
  };
}

export async function getDashboardActivitiesData(): Promise<DashboardActivitiesData> {
  const context = await requireDashboardRoute();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("id,activity_type,summary,metadata,target_table,target_id,occurred_at")
    .eq("profile_id", context.profileId)
    .eq("is_active", true)
    .order("occurred_at", { ascending: false })
    .limit(30);

  const records: DashboardActivityRecord[] = (data ?? []).map((activity) => {
    const metadata =
      typeof activity.metadata === "object" && activity.metadata && !Array.isArray(activity.metadata)
        ? (activity.metadata as Record<string, unknown>)
        : {};
    const metadataDetail =
      "detail" in metadata && typeof metadata.detail === "string" ? metadata.detail : null;
    const href = getActivityHref(activity.target_table, activity.target_id);

    return {
      activityType: activity.activity_type,
      detail: metadataDetail,
      href,
      id: activity.id,
      meta: formatDateTime(activity.occurred_at),
      occurredAt: activity.occurred_at,
      target: formatTargetTable(activity.target_table),
      title: activity.summary ?? activity.activity_type,
    };
  });

  const recentBaseline = new Date();
  recentBaseline.setDate(recentBaseline.getDate() - 7);
  const linkedCount = records.filter((record) => record.href).length;
  const recentCount = records.filter(
    (record) => record.occurredAt && new Date(record.occurredAt) >= recentBaseline,
  ).length;
  const typeCounts = records.reduce<Record<string, number>>((accumulator, record) => {
    accumulator[record.activityType] = (accumulator[record.activityType] ?? 0) + 1;
    return accumulator;
  }, {});

  const activityTypes = Object.entries(typeCounts)
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .slice(0, 5)
    .map(([activityType, count]) => ({
      labelKey: activityType,
      value: count,
    }));

  return {
    context,
    descriptionKey: "dashboard.activities.description",
    emptyKey: "dashboard.activities.empty",
    activityTypes,
    guide: getActivityGuide(context.memberTypeCode),
    metrics: [
      { labelKey: "dashboard.activities.metric.total", value: records.length },
      { labelKey: "dashboard.activities.metric.recent", value: recentCount },
      { labelKey: "dashboard.activities.metric.linked", value: linkedCount },
      { labelKey: "dashboard.activities.metric.types", value: Object.keys(typeCounts).length },
    ],
    records,
    stages: [
      {
        count: records.length,
        descriptionKey: "dashboard.activities.stage.captured.description",
        labelKey: "dashboard.activities.stage.captured.title",
        status: "active",
      },
      {
        count: linkedCount,
        descriptionKey: "dashboard.activities.stage.linked.description",
        labelKey: "dashboard.activities.stage.linked.title",
        status: "approved",
      },
      {
        count: recentCount,
        descriptionKey: "dashboard.activities.stage.recent.description",
        labelKey: "dashboard.activities.stage.recent.title",
        status: "pending",
      },
    ],
    titleKey: "dashboard.activities.title",
  };
}

export async function getDashboardAccountData(): Promise<DashboardAccountData> {
  const context = await requireDashboardRoute();
  const supabase = await createSupabaseServerClient();

  const [{ data: profile }, { data: countries }, { data: languages }, { data: activityLogs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("approval_status,activity_status,created_at,updated_at,phone,country_id,primary_language")
      .eq("id", context.profileId)
      .maybeSingle(),
    supabase
      .from("countries")
      .select("id,name")
      .eq("status", "active")
      .order("name", { ascending: true }),
    supabase
      .from("languages")
      .select("code,name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("activity_logs")
      .select("id,activity_type,summary,target_table,occurred_at")
      .eq("profile_id", context.profileId)
      .eq("is_active", true)
      .order("occurred_at", { ascending: false })
      .limit(5),
  ]);

  const countryName = countries?.find((country) => country.id === profile?.country_id)?.name ?? null;
  const languageName =
    languages?.find((language) => language.code === profile?.primary_language)?.name ??
    profile?.primary_language ??
    null;

  const completionItems = [
    {
      done: Boolean(context.displayName),
      labelKey: "dashboard.account.check.displayName",
      meta: context.displayName,
    },
    {
      done: Boolean(profile?.phone),
      labelKey: "dashboard.account.check.phone",
      meta: profile?.phone ?? null,
    },
    {
      done: Boolean(profile?.country_id),
      labelKey: "dashboard.account.check.country",
      meta: countryName,
    },
    {
      done: Boolean(profile?.primary_language),
      labelKey: "dashboard.account.check.language",
      meta: languageName,
    },
  ];

  const activityRecords = (activityLogs ?? []).map((activity) => ({
    meta: formatDateTime(activity.occurred_at),
    status: activity.activity_type,
    title: activity.summary ?? activity.activity_type.replaceAll("_", " "),
  }));

  return {
    accountRecords: [
      {
        meta: context.careerRankName,
        status: context.memberTypeCode,
        title: "dashboard.account.memberType",
      },
      {
        meta: formatDate(profile?.created_at),
        status: profile?.approval_status ?? null,
        title: "dashboard.account.approvalStatus",
      },
      {
        meta: formatDate(profile?.updated_at),
        status: profile?.activity_status ?? null,
        title: "dashboard.account.activityStatus",
      },
    ],
    activityRecords,
    approvalStatus: profile?.approval_status ?? null,
    completion: {
      completed: completionItems.filter((item) => item.done).length,
      items: completionItems,
      total: completionItems.length,
    },
    context,
    countries: countries ?? [],
    countryId: profile?.country_id ?? null,
    countryName,
    createdAt: formatDate(profile?.created_at),
    languages: languages ?? [],
    languageName,
    phone: profile?.phone ?? null,
    primaryLanguage: profile?.primary_language ?? null,
    quickActions: getQuickActions(context.memberTypeCode),
    updatedAt: formatDate(profile?.updated_at),
  };
}

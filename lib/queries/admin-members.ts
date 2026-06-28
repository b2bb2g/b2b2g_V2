import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, MemberTypeCode } from "@/types/database";

type Tables = Database["public"]["Tables"];
type ProfileRow = Tables["profiles"]["Row"];

export type MemberApprovalStatus = ProfileRow["approval_status"];
export type MemberActivityStatus = ProfileRow["activity_status"];

export type AdminMemberFilters = {
  activityStatus?: MemberActivityStatus | "all";
  approvalStatus?: MemberApprovalStatus | "all";
  memberType?: MemberTypeCode | "all";
  query?: string;
};

export type AdminMemberSummary = {
  active: number;
  blocked: number;
  pending: number;
  rejected: number;
  suspended: number;
  total: number;
};

export type AdminMemberItem = {
  activityStatus: MemberActivityStatus;
  approvalStatus: MemberApprovalStatus;
  careerRankName: string | null;
  countryId: string | null;
  countryName: string | null;
  createdAt: string;
  displayName: string | null;
  email: string;
  id: string;
  isActive: boolean;
  lastActivityAt: string | null;
  lastNotificationReadAt: string | null;
  lastNotificationSentAt: string | null;
  memberTypeCode: MemberTypeCode;
  memberTypeId: string;
  memberTypeName: string;
  phone: string | null;
  primaryLanguage: string | null;
  referralRewardStatus: string | null;
  referralSourceEmail: string | null;
  referralSourceName: string | null;
  referralStatus: string | null;
  signupIpAddress: string | null;
  totalNotificationsCount: number;
  unreadNotificationsCount: number;
  updatedAt: string;
  roles: AdminRoleOption[];
};

export type AdminCountryOption = {
  id: string;
  name: string;
};

export type AdminMemberTypeOption = {
  code: MemberTypeCode;
  id: string;
  name: string;
};

export type AdminRoleOption = {
  code: string;
  id: string;
  name: string;
};

export type AdminMembersData = {
  countryOptions: AdminCountryOption[];
  filters: Required<AdminMemberFilters>;
  items: AdminMemberItem[];
  memberTypeOptions: AdminMemberTypeOption[];
  roleOptions: AdminRoleOption[];
  summary: AdminMemberSummary;
};

const NON_ADMIN_MEMBER_TYPES: MemberTypeCode[] = [
  "supplier",
  "buyer",
  "agent",
  "professor",
  "student",
];

const ASSIGNABLE_BUSINESS_ROLE_CODES = [
  "supplier",
  "buyer",
  "agent",
  "professor",
] as const;

const APPROVAL_STATUSES: MemberApprovalStatus[] = [
  "pending",
  "approved",
  "rejected",
  "suspended",
];

const ACTIVITY_STATUSES: MemberActivityStatus[] = ["active", "inactive", "blocked"];

function normalizeFilter<T extends string>(
  value: string | undefined,
  validValues: readonly T[],
): T | "all" {
  return validValues.some((item) => item === value) ? (value as T) : "all";
}

function normalizeMemberType(value: string | undefined): MemberTypeCode | "all" {
  return NON_ADMIN_MEMBER_TYPES.some((item) => item === value)
    ? (value as MemberTypeCode)
    : "all";
}

function normalizeQuery(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 80 ? trimmed.slice(0, 80) : trimmed;
}

function createSummary(profiles: ProfileRow[]): AdminMemberSummary {
  return {
    active: profiles.filter(
      (profile) =>
        profile.approval_status === "approved" && profile.activity_status === "active",
    ).length,
    blocked: profiles.filter((profile) => profile.activity_status === "blocked").length,
    pending: profiles.filter((profile) => profile.approval_status === "pending").length,
    rejected: profiles.filter((profile) => profile.approval_status === "rejected").length,
    suspended: profiles.filter((profile) => profile.approval_status === "suspended")
      .length,
    total: profiles.length,
  };
}

export async function getAdminMembers(
  filters: AdminMemberFilters = {},
): Promise<AdminMembersData> {
  const normalizedFilters: Required<AdminMemberFilters> = {
    activityStatus: normalizeFilter(filters.activityStatus, ACTIVITY_STATUSES),
    approvalStatus: normalizeFilter(filters.approvalStatus, APPROVAL_STATUSES),
    memberType: normalizeMemberType(filters.memberType),
    query: normalizeQuery(filters.query),
  };

  const supabase = await createSupabaseServerClient();
  const { data: memberTypeRows, error: memberTypeError } = await supabase
    .from("member_types")
    .select("id,code,name")
    .in("code", NON_ADMIN_MEMBER_TYPES);

  if (memberTypeError) {
    throw new Error(memberTypeError.message);
  }

  const memberTypeIds = (memberTypeRows ?? []).map((memberType) => memberType.id);

  if (memberTypeIds.length === 0) {
    return {
      countryOptions: [],
      filters: normalizedFilters,
      items: [],
      memberTypeOptions: [],
      roleOptions: [],
      summary: createSummary([]),
    };
  }

  const allProfilesResult = await supabase
    .from("profiles")
    .select("*")
    .in("member_type_id", memberTypeIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(500);

  if (allProfilesResult.error) {
    throw new Error(allProfilesResult.error.message);
  }

  const profiles = allProfilesResult.data ?? [];
  const memberTypesById = new Map(
    (memberTypeRows ?? []).map((memberType) => [memberType.id, memberType]),
  );
  const careerRankIds = [
    ...new Set(profiles.map((profile) => profile.career_rank_id).filter(Boolean)),
  ] as string[];
  const countryIds = [
    ...new Set(profiles.map((profile) => profile.country_id).filter(Boolean)),
  ] as string[];
  const profileIds = profiles.map((profile) => profile.id);

  const [careerRanksResult, countriesResult, notificationsResult, activityLogsResult, rolesResult, profileRolesResult, allCountriesResult] =
    await Promise.all([
    careerRankIds.length
      ? supabase.from("career_ranks").select("id,name").in("id", careerRankIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[], error: null }),
    countryIds.length
      ? supabase.from("countries").select("id,name").in("id", countryIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[], error: null }),
    profileIds.length
      ? supabase
          .from("notifications")
          .select("profile_id,read_at,sent_at,created_at")
          .in("profile_id", profileIds)
          .is("deleted_at", null)
      : Promise.resolve({
          data: [] as {
            created_at: string;
            profile_id: string;
            read_at: string | null;
            sent_at: string | null;
          }[],
          error: null,
        }),
    profileIds.length
      ? supabase
          .from("activity_logs")
          .select("profile_id,occurred_at")
          .in("profile_id", profileIds)
          .is("deleted_at", null)
      : Promise.resolve({
          data: [] as { occurred_at: string; profile_id: string }[],
          error: null,
        }),
    supabase
      .from("roles")
      .select("id,code,name")
      .in("code", ASSIGNABLE_BUSINESS_ROLE_CODES)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    profileIds.length
      ? supabase
          .from("profile_roles")
          .select("profile_id,role_id")
          .in("profile_id", profileIds)
      : Promise.resolve({
          data: [] as { profile_id: string; role_id: string }[],
          error: null,
        }),
    supabase
      .from("countries")
      .select("id,name")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (careerRanksResult.error) {
    throw new Error(careerRanksResult.error.message);
  }

  if (countriesResult.error) {
    throw new Error(countriesResult.error.message);
  }

  if (notificationsResult.error) {
    throw new Error(notificationsResult.error.message);
  }

  if (activityLogsResult.error) {
    throw new Error(activityLogsResult.error.message);
  }

  if (rolesResult.error) {
    throw new Error(rolesResult.error.message);
  }

  if (profileRolesResult.error) {
    throw new Error(profileRolesResult.error.message);
  }

  if (allCountriesResult.error) {
    throw new Error(allCountriesResult.error.message);
  }

  const careerRanksById = new Map(
    (careerRanksResult.data ?? []).map((careerRank) => [careerRank.id, careerRank.name]),
  );
  const countriesById = new Map(
    (countriesResult.data ?? []).map((country) => [country.id, country.name]),
  );
  const roleOrder = new Map(
    ASSIGNABLE_BUSINESS_ROLE_CODES.map((code, index) => [code, index]),
  );
  const roleOptions = (rolesResult.data ?? [])
    .map((role) => ({
      code: role.code,
      id: role.id,
      name: role.name,
    }))
    .sort((left, right) => {
      const leftOrder = roleOrder.get(left.code as (typeof ASSIGNABLE_BUSINESS_ROLE_CODES)[number]) ?? 999;
      const rightOrder = roleOrder.get(right.code as (typeof ASSIGNABLE_BUSINESS_ROLE_CODES)[number]) ?? 999;

      return leftOrder - rightOrder || left.name.localeCompare(right.name);
    });
  const rolesById = new Map(roleOptions.map((role) => [role.id, role]));
  const rolesByProfileId = new Map<string, AdminRoleOption[]>();

  for (const profileRole of profileRolesResult.data ?? []) {
    const role = rolesById.get(profileRole.role_id);

    if (!role) {
      continue;
    }

    rolesByProfileId.set(profileRole.profile_id, [
      ...(rolesByProfileId.get(profileRole.profile_id) ?? []),
      role,
    ]);
  }

  const notificationsByProfileId = new Map<
    string,
    {
      lastReadAt: string | null;
      lastSentAt: string | null;
      total: number;
      unread: number;
    }
  >();
  const activityByProfileId = new Map<string, string>();

  for (const notification of notificationsResult.data ?? []) {
    const current = notificationsByProfileId.get(notification.profile_id) ?? {
      lastReadAt: null,
      lastSentAt: null,
      total: 0,
      unread: 0,
    };
    const sentAt = notification.sent_at ?? notification.created_at;

    notificationsByProfileId.set(notification.profile_id, {
      lastReadAt:
        notification.read_at && (!current.lastReadAt || notification.read_at > current.lastReadAt)
          ? notification.read_at
          : current.lastReadAt,
      lastSentAt: !current.lastSentAt || sentAt > current.lastSentAt ? sentAt : current.lastSentAt,
      total: current.total + 1,
      unread: current.unread + (notification.read_at ? 0 : 1),
    });
  }

  for (const activityLog of activityLogsResult.data ?? []) {
    const current = activityByProfileId.get(activityLog.profile_id);

    if (!current || activityLog.occurred_at > current) {
      activityByProfileId.set(activityLog.profile_id, activityLog.occurred_at);
    }
  }

  const buyersResult = profileIds.length
    ? await supabase
        .from("buyers")
        .select("id,profile_id,company_name")
        .in("profile_id", profileIds)
        .is("deleted_at", null)
    : { data: [] as { company_name: string | null; id: string; profile_id: string }[], error: null };

  if (buyersResult.error) {
    throw new Error(buyersResult.error.message);
  }

  const buyerRows = buyersResult.data ?? [];
  const buyerIdByProfileId = new Map(buyerRows.map((buyer) => [buyer.profile_id, buyer.id]));
  const buyerProfileByBuyerId = new Map(
    buyerRows.map((buyer) => [buyer.id, { companyName: buyer.company_name, profileId: buyer.profile_id }]),
  );
  const buyerIds = buyerRows.map((buyer) => buyer.id);
  const referralRelationsResult = buyerIds.length
    ? await supabase
        .from("referral_relations")
        .select("child_buyer_id,parent_buyer_id,status,reward_status")
        .in("child_buyer_id", buyerIds)
        .is("deleted_at", null)
    : {
        data: [] as {
          child_buyer_id: string;
          parent_buyer_id: string;
          reward_status: string;
          status: string;
        }[],
        error: null,
      };

  if (referralRelationsResult.error) {
    throw new Error(referralRelationsResult.error.message);
  }

  const referralByChildBuyerId = new Map(
    (referralRelationsResult.data ?? []).map((relation) => [relation.child_buyer_id, relation]),
  );
  const parentBuyerIds = [
    ...new Set((referralRelationsResult.data ?? []).map((relation) => relation.parent_buyer_id)),
  ];
  const parentBuyerProfilesResult = parentBuyerIds.length
    ? await supabase
        .from("buyers")
        .select("id,profile_id,company_name")
        .in("id", parentBuyerIds)
        .is("deleted_at", null)
    : { data: [] as { company_name: string | null; id: string; profile_id: string }[], error: null };

  if (parentBuyerProfilesResult.error) {
    throw new Error(parentBuyerProfilesResult.error.message);
  }

  for (const buyer of parentBuyerProfilesResult.data ?? []) {
    buyerProfileByBuyerId.set(buyer.id, {
      companyName: buyer.company_name,
      profileId: buyer.profile_id,
    });
  }

  const parentProfileIds = [
    ...new Set((parentBuyerProfilesResult.data ?? []).map((buyer) => buyer.profile_id)),
  ];
  const parentProfilesResult = parentProfileIds.length
    ? await supabase
        .from("profiles")
        .select("id,email,display_name")
        .in("id", parentProfileIds)
        .is("deleted_at", null)
    : { data: [] as { display_name: string | null; email: string; id: string }[], error: null };

  if (parentProfilesResult.error) {
    throw new Error(parentProfilesResult.error.message);
  }

  const parentProfileById = new Map(
    (parentProfilesResult.data ?? []).map((profile) => [profile.id, profile]),
  );

  const items: AdminMemberItem[] = profiles.map((profile) => {
    const memberType = memberTypesById.get(profile.member_type_id);
    const notificationState = notificationsByProfileId.get(profile.id);
    const buyerId = buyerIdByProfileId.get(profile.id);
    const referral = buyerId ? referralByChildBuyerId.get(buyerId) : null;
    const parentBuyerProfile = referral
      ? buyerProfileByBuyerId.get(referral.parent_buyer_id)
      : null;
    const parentProfile = parentBuyerProfile
      ? parentProfileById.get(parentBuyerProfile.profileId)
      : null;

    return {
      activityStatus: profile.activity_status,
      approvalStatus: profile.approval_status,
      careerRankName: profile.career_rank_id
        ? careerRanksById.get(profile.career_rank_id) ?? null
        : null,
      countryId: profile.country_id,
      countryName: profile.country_id ? countriesById.get(profile.country_id) ?? null : null,
      createdAt: profile.created_at,
      displayName: profile.display_name,
      email: profile.email,
      id: profile.id,
      isActive: profile.is_active,
      lastActivityAt: activityByProfileId.get(profile.id) ?? null,
      lastNotificationReadAt: notificationState?.lastReadAt ?? null,
      lastNotificationSentAt: notificationState?.lastSentAt ?? null,
      memberTypeCode: memberType?.code ?? "supplier",
      memberTypeId: profile.member_type_id,
      memberTypeName: memberType?.name ?? profile.member_type_id,
      phone: profile.phone,
      primaryLanguage: profile.primary_language,
      referralRewardStatus: referral?.reward_status ?? null,
      referralSourceEmail: parentProfile?.email ?? null,
      referralSourceName:
        parentProfile?.display_name ?? parentBuyerProfile?.companyName ?? null,
      referralStatus: referral?.status ?? null,
      signupIpAddress: null,
      totalNotificationsCount: notificationState?.total ?? 0,
      unreadNotificationsCount: notificationState?.unread ?? 0,
      updatedAt: profile.updated_at,
      roles: rolesByProfileId.get(profile.id) ?? [],
    };
  });

  return {
    countryOptions: (allCountriesResult.data ?? []).map((country) => ({
      id: country.id,
      name: country.name,
    })),
    filters: normalizedFilters,
    items,
    memberTypeOptions: (memberTypeRows ?? []).map((memberType) => ({
      code: memberType.code,
      id: memberType.id,
      name: memberType.name,
    })),
    roleOptions,
    summary: createSummary(profiles),
  };
}

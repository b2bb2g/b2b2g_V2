import type { AccountRoleStatus, IdentityRoleKey, MemberTypeCode } from "@/types/database";

export type AccountRoleLike = {
  created_at?: string | null;
  deleted_at?: string | null;
  role_key: string;
  status: string;
};

export type DashboardRoleKey = Exclude<MemberTypeCode, "administrator">;

const ACTIVE_ACCOUNT_ROLE_STATUSES = new Set<AccountRoleStatus>(["active", "approved"]);
const ROLE_KEY_PATTERN = /^[a-z][a-z0-9_-]{1,63}$/;
const PRIMARY_ROLE_PRIORITY: MemberTypeCode[] = [
  "administrator",
  "supplier",
  "buyer",
  "agent",
  "professor",
  "student",
];
const DASHBOARD_ROLE_PRIORITY: DashboardRoleKey[] = [
  "supplier",
  "buyer",
  "agent",
  "professor",
  "student",
];
const MEMBER_TYPE_ROLE_KEYS = new Set<MemberTypeCode>(PRIMARY_ROLE_PRIORITY);

export function normalizeRoleKey(value: unknown): IdentityRoleKey | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return ROLE_KEY_PATTERN.test(normalized) ? normalized : null;
}

export function isActiveAccountRoleStatus(status: string): status is AccountRoleStatus {
  return ACTIVE_ACCOUNT_ROLE_STATUSES.has(status as AccountRoleStatus);
}

export function isMemberTypeRoleKey(roleKey: string): roleKey is MemberTypeCode {
  return MEMBER_TYPE_ROLE_KEYS.has(roleKey as MemberTypeCode);
}

function getActiveRoleKeys(accountRoles: readonly AccountRoleLike[]): IdentityRoleKey[] {
  return accountRoles
    .filter((role) => !role.deleted_at && isActiveAccountRoleStatus(role.status))
    .map((role) => normalizeRoleKey(role.role_key))
    .filter((roleKey): roleKey is IdentityRoleKey => Boolean(roleKey));
}

export function getPrimaryRoleFromAccountRoles(
  accountRoles: readonly AccountRoleLike[],
): IdentityRoleKey | null {
  const activeRoleKeys = new Set(getActiveRoleKeys(accountRoles));

  for (const roleKey of PRIMARY_ROLE_PRIORITY) {
    if (activeRoleKeys.has(roleKey)) {
      return roleKey;
    }
  }

  return Array.from(activeRoleKeys)[0] ?? null;
}

export function hasEffectiveRole(
  effectiveRoles: readonly IdentityRoleKey[],
  roleKey: MemberTypeCode,
): boolean {
  return effectiveRoles.includes(roleKey);
}

export function getPrimaryMemberTypeRole(
  effectiveRoles: readonly IdentityRoleKey[],
): MemberTypeCode | null {
  for (const roleKey of PRIMARY_ROLE_PRIORITY) {
    if (effectiveRoles.includes(roleKey)) {
      return roleKey;
    }
  }

  const firstKnownRole = effectiveRoles.find(isMemberTypeRoleKey);

  return firstKnownRole ?? null;
}

export function getPrimaryDashboardRole(
  effectiveRoles: readonly IdentityRoleKey[],
): DashboardRoleKey | null {
  for (const roleKey of DASHBOARD_ROLE_PRIORITY) {
    if (effectiveRoles.includes(roleKey)) {
      return roleKey;
    }
  }

  return null;
}

export function fallbackToLegacyMemberType(
  legacyMemberTypeCode: string | null | undefined,
): IdentityRoleKey[] {
  const roleKey = normalizeRoleKey(legacyMemberTypeCode);

  return roleKey ? [roleKey] : [];
}

export function resolveEffectiveRoles(input: {
  accountRoles: readonly AccountRoleLike[];
  legacyMemberTypeCode?: string | null;
}): IdentityRoleKey[] {
  const activeRoleKeys = getActiveRoleKeys(input.accountRoles);
  const uniqueRoleKeys = Array.from(new Set(activeRoleKeys));

  if (uniqueRoleKeys.length > 0) {
    return uniqueRoleKeys;
  }

  return fallbackToLegacyMemberType(input.legacyMemberTypeCode);
}

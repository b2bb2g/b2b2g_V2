export const MEMBER_APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;
export const MEMBER_ACTIVITY_STATUSES = ["active", "inactive", "blocked"] as const;

export type MemberApprovalStatus = (typeof MEMBER_APPROVAL_STATUSES)[number];
export type MemberActivityStatus = (typeof MEMBER_ACTIVITY_STATUSES)[number];

export type MemberActionInput = {
  profileId: string;
  reason?: string;
};

export type MemberProfileEditInput = MemberActionInput & {
  activityStatus: string;
  approvalStatus: string;
  countryId: string;
  displayName: string;
  isActive: boolean;
  memberTypeId: string;
  phone: string;
  primaryLanguage: string;
};

export type ValidatedMemberActionInput = {
  profileId: string;
  reason: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_REASON_LENGTH = 1000;

function normalizeReason(reason: string | undefined): string | null {
  if (!reason) {
    return null;
  }

  const trimmed = reason.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > MAX_REASON_LENGTH) {
    throw new Error("Reason is too long");
  }

  return trimmed;
}

export function validateMemberActionInput(
  input: MemberActionInput,
): ValidatedMemberActionInput {
  if (!UUID_PATTERN.test(input.profileId)) {
    throw new Error("Invalid profile id");
  }

  return {
    profileId: input.profileId,
    reason: normalizeReason(input.reason),
  };
}

function normalizeNullableText(value: string, maxLength: number): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > maxLength) {
    throw new Error("Input is too long");
  }

  return trimmed;
}

function validateOptionalUuid(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!UUID_PATTERN.test(trimmed)) {
    throw new Error("Invalid id");
  }

  return trimmed;
}

export function validateMemberProfileEditInput(input: MemberProfileEditInput) {
  const base = validateMemberActionInput(input);

  if (!UUID_PATTERN.test(input.memberTypeId)) {
    throw new Error("Invalid member type");
  }

  if (!MEMBER_APPROVAL_STATUSES.some((status) => status === input.approvalStatus)) {
    throw new Error("Invalid approval status");
  }

  if (!MEMBER_ACTIVITY_STATUSES.some((status) => status === input.activityStatus)) {
    throw new Error("Invalid activity status");
  }

  return {
    ...base,
    activityStatus: input.activityStatus as MemberActivityStatus,
    approvalStatus: input.approvalStatus as MemberApprovalStatus,
    countryId: validateOptionalUuid(input.countryId),
    displayName: normalizeNullableText(input.displayName, 100),
    isActive: input.isActive,
    memberTypeId: input.memberTypeId,
    phone: normalizeNullableText(input.phone, 40),
    primaryLanguage: normalizeNullableText(input.primaryLanguage, 20),
  };
}

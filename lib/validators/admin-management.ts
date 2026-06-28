import type { Json } from "@/types/database";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_TEXT_LENGTH = 1000;
const MAX_CODE_LENGTH = 80;
const MAX_PATH_LENGTH = 240;

const MENU_LOCATIONS = ["admin", "dashboard", "footer", "public_main"] as const;
const CATEGORY_DOMAINS = [
  "buy_request",
  "buy_sell",
  "commercial",
  "epc",
  "event",
  "industrial",
  "notice",
  "thailand_fda",
] as const;
const COUNTRY_STATUSES = ["active", "inactive"] as const;
const COUNTRY_AGENT_STATUSES = ["active", "inactive", "suspended"] as const;

export type MenuLocation = (typeof MENU_LOCATIONS)[number];
export type CategoryDomain = (typeof CATEGORY_DOMAINS)[number];
export type CountryStatus = (typeof COUNTRY_STATUSES)[number];
export type CountryAgentStatus = (typeof COUNTRY_AGENT_STATUSES)[number];

export type VerifyCompanyInput = {
  businessRegistrationChecked?: boolean;
  catalogChecked?: boolean;
  certificateChecked?: boolean;
  companyId: string;
  reviewNote?: string;
  websiteChecked?: boolean;
};

export type SuspendCompanyInput = {
  companyId: string;
  reason?: string;
};

export type UpdateMenuInput = {
  href?: string;
  isActive?: boolean;
  isVisible?: boolean;
  labelKey?: string;
  location?: MenuLocation;
  menuId: string;
  parentId?: string | null;
  sortOrder?: number;
};

export type UpdateCategoryInput = {
  categoryId: string;
  code?: string;
  domain?: CategoryDomain;
  isActive?: boolean;
  labelKey?: string | null;
  name?: string;
  parentId?: string | null;
  sortOrder?: number;
};

export type UpdateCountryInput = {
  code?: string;
  countryId: string;
  isActive?: boolean;
  name?: string;
  regionId?: string | null;
  sortOrder?: number;
  status?: CountryStatus;
};

export type AssignCountryAgentInput = {
  agentId: string;
  countryId: string;
  status?: CountryAgentStatus;
};

export type UpdateTranslationInput = {
  namespace?: string;
  translationId: string;
  value: string;
};

export type GrantBadgeInput = {
  badgeId: string;
  profileId: string;
};

export type ApproveRewardInput = {
  adminNote?: string;
  rewardId: string;
};

function assertUuid(value: string, fieldName: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return value;
}

function normalizeOptionalString(
  value: string | null | undefined,
  fieldName: string,
  maxLength = MAX_TEXT_LENGTH,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} is too long`);
  }

  return trimmed;
}

function normalizeRequiredString(
  value: string | undefined,
  fieldName: string,
  maxLength = MAX_TEXT_LENGTH,
): string {
  const normalized = normalizeOptionalString(value, fieldName, maxLength);

  if (!normalized) {
    throw new Error(`${fieldName} is required`);
  }

  return normalized;
}

function assertInteger(value: number | undefined, fieldName: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isInteger(value)) {
    throw new Error(`${fieldName} must be an integer`);
  }

  return value;
}

function assertEnum<T extends readonly string[]>(
  value: string | undefined,
  values: T,
  fieldName: string,
): T[number] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!values.some((item) => item === value)) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return value as T[number];
}

function assertOptionalUuid(
  value: string | null | undefined,
  fieldName: string,
): string | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  return assertUuid(value, fieldName);
}

export function validateVerifyCompanyInput(input: VerifyCompanyInput): VerifyCompanyInput {
  return {
    businessRegistrationChecked: input.businessRegistrationChecked,
    catalogChecked: input.catalogChecked,
    certificateChecked: input.certificateChecked,
    companyId: assertUuid(input.companyId, "companyId"),
    reviewNote: normalizeOptionalString(input.reviewNote, "reviewNote") ?? undefined,
    websiteChecked: input.websiteChecked,
  };
}

export function validateSuspendCompanyInput(input: SuspendCompanyInput): SuspendCompanyInput {
  return {
    companyId: assertUuid(input.companyId, "companyId"),
    reason: normalizeOptionalString(input.reason, "reason") ?? undefined,
  };
}

export function validateUpdateMenuInput(input: UpdateMenuInput): UpdateMenuInput {
  return {
    href: normalizeOptionalString(input.href, "href", MAX_PATH_LENGTH) ?? undefined,
    isActive: input.isActive,
    isVisible: input.isVisible,
    labelKey: normalizeOptionalString(input.labelKey, "labelKey", MAX_CODE_LENGTH) ?? undefined,
    location: assertEnum(input.location, MENU_LOCATIONS, "location"),
    menuId: assertUuid(input.menuId, "menuId"),
    parentId: assertOptionalUuid(input.parentId, "parentId"),
    sortOrder: assertInteger(input.sortOrder, "sortOrder"),
  };
}

export function validateUpdateCategoryInput(
  input: UpdateCategoryInput,
): UpdateCategoryInput {
  return {
    categoryId: assertUuid(input.categoryId, "categoryId"),
    code: normalizeOptionalString(input.code, "code", MAX_CODE_LENGTH) ?? undefined,
    domain: assertEnum(input.domain, CATEGORY_DOMAINS, "domain"),
    isActive: input.isActive,
    labelKey: normalizeOptionalString(input.labelKey, "labelKey", MAX_CODE_LENGTH),
    name: normalizeOptionalString(input.name, "name", MAX_TEXT_LENGTH) ?? undefined,
    parentId: assertOptionalUuid(input.parentId, "parentId"),
    sortOrder: assertInteger(input.sortOrder, "sortOrder"),
  };
}

export function validateUpdateCountryInput(input: UpdateCountryInput): UpdateCountryInput {
  return {
    code: normalizeOptionalString(input.code, "code", MAX_CODE_LENGTH) ?? undefined,
    countryId: assertUuid(input.countryId, "countryId"),
    isActive: input.isActive,
    name: normalizeOptionalString(input.name, "name", MAX_TEXT_LENGTH) ?? undefined,
    regionId: assertOptionalUuid(input.regionId, "regionId"),
    sortOrder: assertInteger(input.sortOrder, "sortOrder"),
    status: assertEnum(input.status, COUNTRY_STATUSES, "status"),
  };
}

export function validateAssignCountryAgentInput(
  input: AssignCountryAgentInput,
): AssignCountryAgentInput {
  return {
    agentId: assertUuid(input.agentId, "agentId"),
    countryId: assertUuid(input.countryId, "countryId"),
    status: assertEnum(input.status, COUNTRY_AGENT_STATUSES, "status") ?? "active",
  };
}

export function validateUpdateTranslationInput(
  input: UpdateTranslationInput,
): UpdateTranslationInput {
  return {
    namespace: normalizeOptionalString(input.namespace, "namespace", MAX_CODE_LENGTH) ?? undefined,
    translationId: assertUuid(input.translationId, "translationId"),
    value: normalizeRequiredString(input.value, "value"),
  };
}

export function validateGrantBadgeInput(input: GrantBadgeInput): GrantBadgeInput {
  return {
    badgeId: assertUuid(input.badgeId, "badgeId"),
    profileId: assertUuid(input.profileId, "profileId"),
  };
}

export function validateApproveRewardInput(input: ApproveRewardInput): ApproveRewardInput {
  return {
    adminNote: normalizeOptionalString(input.adminNote, "adminNote") ?? undefined,
    rewardId: assertUuid(input.rewardId, "rewardId"),
  };
}

export function removeUndefinedValues<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter((entry) => entry[1] !== undefined),
  ) as Partial<T>;
}

export function toEmptyJsonObject(): Json {
  return {};
}

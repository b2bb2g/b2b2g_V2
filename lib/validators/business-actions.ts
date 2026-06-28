import type {
  MatchingType,
  ThailandFdaServiceCategory,
} from "@/types/database";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

const MAX_TITLE_LENGTH = 240;
const MAX_TEXT_LENGTH = 4000;
const MAX_SHORT_TEXT_LENGTH = 1000;

const MATCHING_TYPES = [
  "buyer_agent",
  "professor_supplier",
  "student_buyer",
  "supplier_buyer",
] as const satisfies readonly MatchingType[];

const THAILAND_FDA_SERVICE_CATEGORIES = [
  "cosmetic_registration",
  "food_registration",
  "food_supplement_registration",
  "formula_review",
  "import_license_support",
  "label_compliance",
  "medical_device_registration",
] as const satisfies readonly ThailandFdaServiceCategory[];

type ShowcaseItemInput = {
  displayOrder?: number;
  productId: string;
  studentNote?: string;
};

export type CreateProductInput = {
  categoryId?: string | null;
  description?: string;
  industryId?: string | null;
  mainFileId?: string | null;
  summary?: string;
  title: string;
};

export type CreateIndustrialPostInput = {
  categoryId?: string | null;
  description?: string;
  industryId?: string | null;
  summary?: string;
  title: string;
};

export type CreateEpcPostInput = CreateIndustrialPostInput & {
  projectCountryId?: string | null;
  projectScope?: string;
};

export type CreateBuySellPostInput = {
  categoryId?: string | null;
  description?: string;
  targetCountryId?: string | null;
  title: string;
};

export type CreateBuyRequestInput = {
  categoryId?: string | null;
  destinationCountryId?: string | null;
  details?: string;
  industryId?: string | null;
  quantity?: string;
  targetPrice?: string;
  title: string;
};

export type CreateMatchingRequestInput = {
  matchingType: MatchingType;
  targetProfileId?: string | null;
};

export type CreateStudentShowcaseInput = {
  description?: string;
  items?: ShowcaseItemInput[];
  targetCountryId?: string | null;
  title: string;
};

export type SubmitStudentShowcaseInput = {
  showcaseId: string;
};

export type ApproveMarketResearchReportInput = {
  reportId: string;
};

export type CreateMarketResearchReportInput = {
  content?: string;
  countryId?: string | null;
  industryId?: string | null;
  summary?: string;
  title: string;
};

export type CreateFdaApplicationInput = {
  formulaSummary?: string;
  productName: string;
  serviceCategory: ThailandFdaServiceCategory;
  submit?: boolean;
};

export type ApplyEventInput = {
  eventId: string;
  note?: string;
};

export type SendMessageInput = {
  body: string;
  conversationId: string;
};

function assertUuid(value: string, fieldName: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return value;
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

function normalizeOptionalString(
  value: string | undefined,
  fieldName: string,
  maxLength = MAX_TEXT_LENGTH,
): string | null {
  if (!value) {
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
  value: string,
  fieldName: string,
  maxLength = MAX_TITLE_LENGTH,
): string {
  const trimmed = normalizeOptionalString(value, fieldName, maxLength);

  if (!trimmed) {
    throw new Error(`${fieldName} is required`);
  }

  return trimmed;
}

function assertEnum<T extends readonly string[]>(
  value: string,
  values: T,
  fieldName: string,
): T[number] {
  if (!values.some((item) => item === value)) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return value as T[number];
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

function normalizeShowcaseItems(
  items: ShowcaseItemInput[] | undefined,
): ShowcaseItemInput[] {
  if (!items) {
    return [];
  }

  if (items.length > 24) {
    throw new Error("Too many showcase items");
  }

  return items.map((item, index) => ({
    displayOrder: assertInteger(item.displayOrder ?? index, "displayOrder"),
    productId: assertUuid(item.productId, "productId"),
    studentNote: normalizeOptionalString(
      item.studentNote,
      "studentNote",
      MAX_SHORT_TEXT_LENGTH,
    ) ?? undefined,
  }));
}

export function validateCreateProductInput(
  input: CreateProductInput,
): CreateProductInput {
  return {
    categoryId: assertOptionalUuid(input.categoryId, "categoryId"),
    description: normalizeOptionalString(input.description, "description") ?? undefined,
    industryId: assertOptionalUuid(input.industryId, "industryId"),
    mainFileId: assertOptionalUuid(input.mainFileId, "mainFileId"),
    summary: normalizeOptionalString(input.summary, "summary", MAX_SHORT_TEXT_LENGTH) ?? undefined,
    title: normalizeRequiredString(input.title, "title"),
  };
}

export function validateCreateIndustrialPostInput(
  input: CreateIndustrialPostInput,
): CreateIndustrialPostInput {
  return {
    categoryId: assertOptionalUuid(input.categoryId, "categoryId"),
    description: normalizeOptionalString(input.description, "description") ?? undefined,
    industryId: assertOptionalUuid(input.industryId, "industryId"),
    summary: normalizeOptionalString(input.summary, "summary", MAX_SHORT_TEXT_LENGTH) ?? undefined,
    title: normalizeRequiredString(input.title, "title"),
  };
}

export function validateCreateEpcPostInput(input: CreateEpcPostInput): CreateEpcPostInput {
  return {
    ...validateCreateIndustrialPostInput(input),
    projectCountryId: assertOptionalUuid(input.projectCountryId, "projectCountryId"),
    projectScope:
      normalizeOptionalString(input.projectScope, "projectScope", MAX_SHORT_TEXT_LENGTH) ??
      undefined,
  };
}

export function validateCreateBuySellPostInput(
  input: CreateBuySellPostInput,
): CreateBuySellPostInput {
  return {
    categoryId: assertOptionalUuid(input.categoryId, "categoryId"),
    description: normalizeOptionalString(input.description, "description") ?? undefined,
    targetCountryId: assertOptionalUuid(input.targetCountryId, "targetCountryId"),
    title: normalizeRequiredString(input.title, "title"),
  };
}

export function validateCreateBuyRequestInput(
  input: CreateBuyRequestInput,
): CreateBuyRequestInput {
  return {
    categoryId: assertOptionalUuid(input.categoryId, "categoryId"),
    destinationCountryId: assertOptionalUuid(
      input.destinationCountryId,
      "destinationCountryId",
    ),
    details: normalizeOptionalString(input.details, "details") ?? undefined,
    industryId: assertOptionalUuid(input.industryId, "industryId"),
    quantity:
      normalizeOptionalString(input.quantity, "quantity", MAX_SHORT_TEXT_LENGTH) ?? undefined,
    targetPrice:
      normalizeOptionalString(input.targetPrice, "targetPrice", MAX_SHORT_TEXT_LENGTH) ??
      undefined,
    title: normalizeRequiredString(input.title, "title"),
  };
}

export function validateCreateMatchingRequestInput(
  input: CreateMatchingRequestInput,
): CreateMatchingRequestInput {
  return {
    matchingType: assertEnum(input.matchingType, MATCHING_TYPES, "matchingType"),
    targetProfileId: assertOptionalUuid(input.targetProfileId, "targetProfileId"),
  };
}

export function validateCreateStudentShowcaseInput(
  input: CreateStudentShowcaseInput,
): CreateStudentShowcaseInput {
  return {
    description: normalizeOptionalString(input.description, "description") ?? undefined,
    items: normalizeShowcaseItems(input.items),
    targetCountryId: assertOptionalUuid(input.targetCountryId, "targetCountryId"),
    title: normalizeRequiredString(input.title, "title"),
  };
}

export function validateSubmitStudentShowcaseInput(
  input: SubmitStudentShowcaseInput,
): SubmitStudentShowcaseInput {
  return {
    showcaseId: assertUuid(input.showcaseId, "showcaseId"),
  };
}

export function validateApproveMarketResearchReportInput(
  input: ApproveMarketResearchReportInput,
): ApproveMarketResearchReportInput {
  return {
    reportId: assertUuid(input.reportId, "reportId"),
  };
}

export function validateCreateMarketResearchReportInput(
  input: CreateMarketResearchReportInput,
): CreateMarketResearchReportInput {
  return {
    content: normalizeOptionalString(input.content, "content") ?? undefined,
    countryId: assertOptionalUuid(input.countryId, "countryId"),
    industryId: assertOptionalUuid(input.industryId, "industryId"),
    summary: normalizeOptionalString(input.summary, "summary", MAX_SHORT_TEXT_LENGTH) ?? undefined,
    title: normalizeRequiredString(input.title, "title"),
  };
}

export function validateCreateFdaApplicationInput(
  input: CreateFdaApplicationInput,
): CreateFdaApplicationInput {
  return {
    formulaSummary:
      normalizeOptionalString(input.formulaSummary, "formulaSummary") ?? undefined,
    productName: normalizeRequiredString(input.productName, "productName"),
    serviceCategory: assertEnum(
      input.serviceCategory,
      THAILAND_FDA_SERVICE_CATEGORIES,
      "serviceCategory",
    ),
    submit: input.submit,
  };
}

export function validateApplyEventInput(input: ApplyEventInput): ApplyEventInput {
  return {
    eventId: assertUuid(input.eventId, "eventId"),
    note: normalizeOptionalString(input.note, "note", MAX_SHORT_TEXT_LENGTH) ?? undefined,
  };
}

export function validateSendMessageInput(input: SendMessageInput): SendMessageInput {
  return {
    body: normalizeRequiredString(input.body, "body", MAX_TEXT_LENGTH),
    conversationId: assertUuid(input.conversationId, "conversationId"),
  };
}

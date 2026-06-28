import type { AdminLogAction } from "@/types/database";

export const APPROVAL_TARGET_TABLES = [
  "companies",
  "products",
  "industrial_posts",
  "epc_posts",
  "buy_sell_posts",
  "buy_requests",
  "student_showcases",
  "market_research_reports",
] as const;

export type ApprovalTargetTable = (typeof APPROVAL_TARGET_TABLES)[number];

export type ApprovalActionInput = {
  reason?: string;
  targetId: string;
  targetTable: ApprovalTargetTable;
};

export type ValidatedApprovalActionInput = Omit<ApprovalActionInput, "reason"> & {
  reason: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_REASON_LENGTH = 1000;

function isApprovalTargetTable(value: string): value is ApprovalTargetTable {
  return APPROVAL_TARGET_TABLES.some((table) => table === value);
}

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

export function validateApprovalActionInput(
  input: ApprovalActionInput,
): ValidatedApprovalActionInput {
  if (!isApprovalTargetTable(input.targetTable)) {
    throw new Error("Unsupported approval target");
  }

  if (!UUID_PATTERN.test(input.targetId)) {
    throw new Error("Invalid target id");
  }

  return {
    reason: normalizeReason(input.reason),
    targetId: input.targetId,
    targetTable: input.targetTable,
  };
}

export function getApproveAdminLogAction(
  targetTable: ApprovalTargetTable,
): AdminLogAction {
  switch (targetTable) {
    case "companies":
      return "company_approve";
    case "buy_sell_posts":
      return "buy_sell_approve";
    case "buy_requests":
      return "buy_request_approve";
    case "products":
    case "industrial_posts":
    case "epc_posts":
      return "product_approve";
    case "student_showcases":
    case "market_research_reports":
      return "manual";
  }
}

export function getRejectAdminLogAction(
  targetTable: ApprovalTargetTable,
): AdminLogAction {
  switch (targetTable) {
    case "companies":
      return "manual";
    case "buy_sell_posts":
      return "buy_sell_reject";
    case "buy_requests":
      return "buy_request_reject";
    case "products":
    case "industrial_posts":
    case "epc_posts":
      return "product_reject";
    case "student_showcases":
    case "market_research_reports":
      return "manual";
  }
}

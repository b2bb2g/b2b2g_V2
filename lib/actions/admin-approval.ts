"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAdminLog, writeAuditEvent } from "@/lib/audit/logs";
import { requireCurrentUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getApproveAdminLogAction,
  getRejectAdminLogAction,
  type ApprovalActionInput,
  type ApprovalTargetTable,
  validateApprovalActionInput,
} from "@/lib/validators/admin-actions";
import type { Database } from "@/types/database";

type ActionResult =
  | {
      error: null;
      ok: true;
      recordId: string;
    }
  | {
      error: string;
      ok: false;
    };

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type ApprovalUpdatePayload = {
  approval_status: "approved" | "rejected";
  approved_at: string | null;
  approved_by: string | null;
  updated_by: string;
};

type RecordSnapshot = Record<string, unknown>;

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getApprovalInputFromForm(formData: FormData): ApprovalActionInput {
  return {
    reason: getFormString(formData, "reason"),
    targetId: getFormString(formData, "targetId"),
    targetTable: getFormString(formData, "targetTable") as ApprovalTargetTable,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Action failed";
}

function getTargetLabel(record: RecordSnapshot | null): string | null {
  if (!record) {
    return null;
  }

  const label = record.title ?? record.name ?? record.slug;

  return typeof label === "string" ? label : null;
}

function revalidateApprovalTarget(
  targetTable: ApprovalTargetTable,
  record: RecordSnapshot,
) {
  revalidatePath("/admin");
  revalidatePath("/admin/content");

  switch (targetTable) {
    case "companies":
      if (typeof record.slug === "string") {
        revalidatePath(`/companies/${record.slug}`);
      }
      break;
    case "products":
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath(`/products/${record.id}`);
      revalidatePath("/commercial");
      revalidatePath(`/commercial/${record.id}`);
      break;
    case "industrial_posts":
      revalidatePath("/industrial");
      revalidatePath(`/industrial/${record.id}`);
      break;
    case "epc_posts":
      revalidatePath("/epc");
      revalidatePath(`/epc/${record.id}`);
      break;
    case "buy_sell_posts":
      revalidatePath("/buy-sell");
      revalidatePath("/buy-sell/sell-products");
      revalidatePath(`/buy-sell/sell-products/${record.id}`);
      break;
    case "buy_requests":
      revalidatePath("/buy-sell");
      revalidatePath("/buy-sell/buy-requests");
      revalidatePath(`/buy-sell/buy-requests/${record.id}`);
      break;
    case "student_showcases":
    case "market_research_reports":
      break;
  }
}

async function hasApprovalPermission(supabase: Supabase): Promise<boolean> {
  const [approvePermission, managePermission] = await Promise.all([
    supabase.rpc("has_permission", { permission_code: "content.approve" }),
    supabase.rpc("has_permission", { permission_code: "content.manage" }),
  ]);

  return Boolean(approvePermission.data || managePermission.data);
}

async function getRecordSnapshot(
  supabase: Supabase,
  targetTable: ApprovalTargetTable,
  targetId: string,
): Promise<RecordSnapshot | null> {
  const { data, error } = await supabase
    .from(targetTable)
    .select("*")
    .eq("id", targetId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as RecordSnapshot | null;
}

async function updateApprovalStatus(
  supabase: Supabase,
  targetTable: ApprovalTargetTable,
  targetId: string,
  payload: ApprovalUpdatePayload,
): Promise<RecordSnapshot> {
  const updatePayload = payload as Database["public"]["Tables"][ApprovalTargetTable]["Update"];
  const { data, error } = await supabase
    .from(targetTable)
    .update(updatePayload)
    .eq("id", targetId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Target record not found");
  }

  return data as RecordSnapshot;
}

async function syncProductRegistrationValueApprovalStatus(
  supabase: Supabase,
  input: {
    productId: string;
    status: "approved" | "rejected";
    userId: string;
  },
): Promise<number> {
  const { data, error } = await supabase
    .from("product_registration_values")
    .update({
      approval_status: input.status,
      updated_by: input.userId,
    })
    .eq("product_id", input.productId)
    .in("approval_status", ["submitted", "reviewing"])
    .is("deleted_at", null)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  return data?.length ?? 0;
}

async function runApprovalAction(
  input: ApprovalActionInput,
  nextStatus: "approved" | "rejected",
): Promise<ActionResult> {
  try {
    const validatedInput = validateApprovalActionInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const hasPermission = await hasApprovalPermission(supabase);

    if (!hasPermission) {
      await writeAuditEvent(supabase, {
        actorProfileId: user.id,
        errorCode: "approval_permission_denied",
        eventLevel: "security",
        eventType: "unauthorized_access",
        message: "Approval action denied by permission guard",
        severity: "warning",
        targetId: validatedInput.targetId,
        targetTable: validatedInput.targetTable,
      });

      throw new Error("Permission denied");
    }

    const beforeData = await getRecordSnapshot(
      supabase,
      validatedInput.targetTable,
      validatedInput.targetId,
    );

    if (!beforeData) {
      throw new Error("Target record not found");
    }

    const now = new Date().toISOString();
    const afterData = await updateApprovalStatus(
      supabase,
      validatedInput.targetTable,
      validatedInput.targetId,
      {
        approval_status: nextStatus,
        approved_at: nextStatus === "approved" ? now : null,
        approved_by: nextStatus === "approved" ? user.id : null,
        updated_by: user.id,
      },
    );
    const registrationValuesUpdated =
      validatedInput.targetTable === "products"
        ? await syncProductRegistrationValueApprovalStatus(supabase, {
            productId: validatedInput.targetId,
            status: nextStatus,
            userId: user.id,
          })
        : 0;
    const logAfterData =
      registrationValuesUpdated > 0
        ? {
            ...afterData,
            product_registration_values_updated: registrationValuesUpdated,
          }
        : afterData;

    const logResult = await writeAdminLog(supabase, {
      action:
        nextStatus === "approved"
          ? getApproveAdminLogAction(validatedInput.targetTable)
          : getRejectAdminLogAction(validatedInput.targetTable),
      actorProfileId: user.id,
      afterData: logAfterData,
      beforeData,
      reason: validatedInput.reason,
      targetId: validatedInput.targetId,
      targetLabel: getTargetLabel(afterData),
      targetTable: validatedInput.targetTable,
    });

    if (!logResult.ok) {
      throw new Error(`Approval updated but audit log failed: ${logResult.error}`);
    }

    revalidateApprovalTarget(validatedInput.targetTable, afterData);

    return {
      error: null,
      ok: true,
      recordId: validatedInput.targetId,
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false,
    };
  }
}

export async function approveRecord(
  input: ApprovalActionInput,
): Promise<ActionResult> {
  return runApprovalAction(input, "approved");
}

export async function rejectRecord(
  input: ApprovalActionInput,
): Promise<ActionResult> {
  return runApprovalAction(input, "rejected");
}

export async function approveApprovalItemAction(
  formData: FormData,
): Promise<void> {
  const result = await approveRecord(getApprovalInputFromForm(formData));

  redirect(`/admin/content?result=${result.ok ? "approved" : "error"}`);
}

export async function rejectApprovalItemAction(
  formData: FormData,
): Promise<void> {
  const result = await rejectRecord(getApprovalInputFromForm(formData));

  redirect(`/admin/content?result=${result.ok ? "rejected" : "error"}`);
}

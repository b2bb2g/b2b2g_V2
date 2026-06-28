"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminRoute } from "@/lib/auth/guards";
import { requireCurrentUser } from "@/lib/auth/session";
import { normalizeRoleKey } from "@/lib/auth/account-roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { RoleApplicationStatus } from "@/types/database";

export type IdentityActionResult =
  | {
      error: null;
      ok: true;
      recordId: string;
    }
  | {
      error: string;
      ok: false;
    };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_REASON_LENGTH = 1000;
const ACTIVE_ROLE_STATUSES = ["active", "approved"] as const;
const DUPLICATE_APPLICATION_STATUSES: RoleApplicationStatus[] = [
  "submitted",
  "requested",
  "under_review",
];
const CANCELLABLE_APPLICATION_STATUSES: RoleApplicationStatus[] = [
  "submitted",
  "under_review",
];
const REVIEWABLE_APPLICATION_STATUSES: RoleApplicationStatus[] = [
  "submitted",
  "under_review",
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Action failed";
}

function normalizeReason(reason: string | undefined): string | null {
  if (reason !== undefined && typeof reason !== "string") {
    throw new Error("Invalid reason");
  }

  const trimmed = reason?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > MAX_REASON_LENGTH) {
    throw new Error("Reason is too long");
  }

  return trimmed;
}

function validateApplicationId(applicationId: string): string {
  if (!UUID_PATTERN.test(applicationId)) {
    throw new Error("Invalid role application id");
  }

  return applicationId;
}

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function requestRole(
  roleKey: string,
  reason?: string,
): Promise<IdentityActionResult> {
  try {
    const normalizedRoleKey = normalizeRoleKey(roleKey);

    if (!normalizedRoleKey) {
      throw new Error("Invalid role key");
    }

    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const { data: existingRole, error: roleError } = await supabase
      .from("account_roles")
      .select("id")
      .eq("account_id", user.id)
      .eq("role_key", normalizedRoleKey)
      .in("status", ACTIVE_ROLE_STATUSES)
      .is("deleted_at", null)
      .maybeSingle();

    if (roleError) {
      throw new Error(roleError.message);
    }

    if (existingRole) {
      throw new Error("Role is already active");
    }

    const { data: existingApplication, error: applicationError } = await supabase
      .from("role_applications")
      .select("id,status")
      .eq("account_id", user.id)
      .eq("requested_role_key", normalizedRoleKey)
      .in("status", DUPLICATE_APPLICATION_STATUSES)
      .is("deleted_at", null)
      .limit(1);

    if (applicationError) {
      throw new Error(applicationError.message);
    }

    if (existingApplication?.length) {
      throw new Error("Role application is already submitted");
    }

    const { data, error } = await supabase
      .from("role_applications")
      .insert({
        account_id: user.id,
        reason: normalizeReason(reason),
        requested_role_key: normalizedRoleKey,
        status: "submitted",
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // TODO(Sprint 1): write audit event after role application audit policy is finalized.
    revalidatePath("/dashboard/account");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function cancelRoleApplication(
  applicationId: string,
): Promise<IdentityActionResult> {
  try {
    const validatedApplicationId = validateApplicationId(applicationId);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const { data: application, error: applicationError } = await supabase
      .from("role_applications")
      .select("id,account_id,status")
      .eq("id", validatedApplicationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (applicationError) {
      throw new Error(applicationError.message);
    }

    if (!application || application.account_id !== user.id) {
      throw new Error("Role application not found");
    }

    if (!CANCELLABLE_APPLICATION_STATUSES.includes(application.status)) {
      throw new Error("Role application cannot be cancelled");
    }

    const { data, error } = await supabase
      .from("role_applications")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedApplicationId)
      .eq("account_id", user.id)
      .in("status", CANCELLABLE_APPLICATION_STATUSES)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // TODO(Sprint 1): write audit event after role application audit policy is finalized.
    revalidatePath("/dashboard/account");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function approveRoleApplication(
  applicationId: string,
): Promise<IdentityActionResult> {
  try {
    const validatedApplicationId = validateApplicationId(applicationId);
    const adminUser = await requireAdminRoute();
    const supabase = await createSupabaseServerClient();
    const { data: application, error: applicationError } = await supabase
      .from("role_applications")
      .select("id,account_id,requested_role_key,status")
      .eq("id", validatedApplicationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (applicationError) {
      throw new Error(applicationError.message);
    }

    if (!application) {
      throw new Error("Role application not found");
    }

    if (!REVIEWABLE_APPLICATION_STATUSES.includes(application.status)) {
      throw new Error("Role application cannot be approved");
    }

    const normalizedRoleKey = normalizeRoleKey(application.requested_role_key);

    if (!normalizedRoleKey) {
      throw new Error("Invalid requested role key");
    }

    const reviewedAt = new Date().toISOString();
    const { data: existingRole, error: existingRoleError } = await supabase
      .from("account_roles")
      .select("id")
      .eq("account_id", application.account_id)
      .eq("role_key", normalizedRoleKey)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingRoleError) {
      throw new Error(existingRoleError.message);
    }

    if (existingRole) {
      const { error: roleUpdateError } = await supabase
        .from("account_roles")
        .update({
          approved_at: reviewedAt,
          approved_by: adminUser.id,
          status: "approved",
          updated_at: reviewedAt,
        })
        .eq("id", existingRole.id);

      if (roleUpdateError) {
        throw new Error(roleUpdateError.message);
      }
    } else {
      const { error: roleInsertError } = await supabase.from("account_roles").insert({
        account_id: application.account_id,
        approved_at: reviewedAt,
        approved_by: adminUser.id,
        role_key: normalizedRoleKey,
        status: "approved",
      });

      if (roleInsertError) {
        throw new Error(roleInsertError.message);
      }
    }

    const { data, error } = await supabase
      .from("role_applications")
      .update({
        reviewed_at: reviewedAt,
        reviewed_by: adminUser.id,
        status: "approved",
        updated_at: reviewedAt,
      })
      .eq("id", validatedApplicationId)
      .in("status", REVIEWABLE_APPLICATION_STATUSES)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // TODO(Sprint 1): write audit event after role approval audit contract is finalized.
    revalidatePath("/admin");
    revalidatePath("/admin/members");
    revalidatePath("/admin/role-applications");
    revalidatePath("/dashboard/account");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function rejectRoleApplication(
  applicationId: string,
  reason: string,
): Promise<IdentityActionResult> {
  try {
    const validatedApplicationId = validateApplicationId(applicationId);
    const rejectionReason = normalizeReason(reason);

    if (!rejectionReason) {
      throw new Error("Rejection reason is required");
    }

    const adminUser = await requireAdminRoute();
    const supabase = await createSupabaseServerClient();
    const reviewedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("role_applications")
      .update({
        rejection_reason: rejectionReason,
        reviewed_at: reviewedAt,
        reviewed_by: adminUser.id,
        status: "rejected",
        updated_at: reviewedAt,
      })
      .eq("id", validatedApplicationId)
      .in("status", REVIEWABLE_APPLICATION_STATUSES)
      .is("deleted_at", null)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // TODO(Sprint 1): write audit event after role rejection audit contract is finalized.
    revalidatePath("/admin");
    revalidatePath("/admin/members");
    revalidatePath("/admin/role-applications");
    revalidatePath("/dashboard/account");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function approveRoleApplicationAction(
  formData: FormData,
): Promise<void> {
  const result = await approveRoleApplication(getFormString(formData, "applicationId"));

  redirect(`/admin/role-applications?result=${result.ok ? "approved" : "error"}`);
}

export async function rejectRoleApplicationAction(
  formData: FormData,
): Promise<void> {
  const result = await rejectRoleApplication(
    getFormString(formData, "applicationId"),
    getFormString(formData, "reason"),
  );

  redirect(`/admin/role-applications?result=${result.ok ? "rejected" : "error"}`);
}

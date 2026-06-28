"use server";

import { revalidatePath } from "next/cache";
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
const OPEN_APPLICATION_STATUSES: RoleApplicationStatus[] = [
  "draft",
  "submitted",
  "requested",
  "under_review",
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Action failed";
}

function normalizeReason(reason: string | undefined): string | null {
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
      .select("id")
      .eq("account_id", user.id)
      .eq("requested_role_key", normalizedRoleKey)
      .in("status", OPEN_APPLICATION_STATUSES)
      .is("deleted_at", null)
      .maybeSingle();

    if (applicationError) {
      throw new Error(applicationError.message);
    }

    if (existingApplication) {
      return { error: null, ok: true, recordId: existingApplication.id };
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

    if (!OPEN_APPLICATION_STATUSES.includes(application.status)) {
      throw new Error("Role application cannot be cancelled");
    }

    const { data, error } = await supabase
      .from("role_applications")
      .update({
        status: "withdrawn",
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedApplicationId)
      .eq("account_id", user.id)
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
  // TODO(Sprint 1): implement after admin approval audit contract and admin guard are finalized.
  try {
    validateApplicationId(applicationId);
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }

  return {
    error: "Admin role approval is intentionally deferred",
    ok: false,
  };
}

export async function rejectRoleApplication(
  applicationId: string,
  reason: string,
): Promise<IdentityActionResult> {
  // TODO(Sprint 1): implement after admin rejection audit contract and admin guard are finalized.
  try {
    validateApplicationId(applicationId);

    if (!normalizeReason(reason)) {
      throw new Error("Rejection reason is required");
    }
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }

  return {
    error: "Admin role rejection is intentionally deferred",
    ok: false,
  };
}

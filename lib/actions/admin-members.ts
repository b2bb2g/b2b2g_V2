"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAdminLog, writeAuditEvent } from "@/lib/audit/logs";
import { requireCurrentUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  validateMemberProfileEditInput,
  validateMemberActionInput,
  type MemberActionInput,
} from "@/lib/validators/admin-members";
import type { AccountApprovalStatus, AdminLogAction, Database } from "@/types/database";

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
type RecordSnapshot = Record<string, unknown>;
type ProfileUpdatePayload = Database["public"]["Tables"]["profiles"]["Update"];
type MemberActionResult =
  | "approved"
  | "created"
  | "error"
  | "messaged"
  | "reactivated"
  | "rejected"
  | "rolesUpdated"
  | "suspended"
  | "updated"
  | "withdrawn";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ASSIGNABLE_BUSINESS_ROLE_CODES = [
  "supplier",
  "buyer",
  "agent",
  "professor",
] as const;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Action failed";
}

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getMemberInputFromForm(formData: FormData): MemberActionInput {
  return {
    profileId: getFormString(formData, "profileId"),
    reason: getFormString(formData, "reason"),
  };
}

function redirectToMembers(result: MemberActionResult): never {
  revalidatePath("/admin");
  revalidatePath("/admin/members");
  redirect(`/admin/members?result=${result}`);
}

function getMessageInputFromForm(formData: FormData) {
  return {
    body: getFormString(formData, "body").trim(),
    profileId: getFormString(formData, "profileId"),
    title: getFormString(formData, "title").trim(),
  };
}

function getFormBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function getRoleIdsFromForm(formData: FormData): string[] {
  return formData
    .getAll("roleIds")
    .filter((value): value is string => typeof value === "string")
    .filter((value, index, array) => UUID_PATTERN.test(value) && array.indexOf(value) === index);
}

async function getAssignableBusinessRoleIds(supabase: Supabase): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("roles")
    .select("id")
    .in("code", ASSIGNABLE_BUSINESS_ROLE_CODES)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return new Set((data ?? []).map((role) => role.id));
}

function assertAssignableRoleIds(roleIds: string[], allowedRoleIds: Set<string>): string[] {
  const filteredRoleIds = roleIds.filter((roleId) => allowedRoleIds.has(roleId));

  if (filteredRoleIds.length !== roleIds.length) {
    throw new Error("Invalid member role");
  }

  return filteredRoleIds;
}

function getMemberProfileEditInputFromForm(formData: FormData) {
  return {
    activityStatus: getFormString(formData, "activityStatus"),
    approvalStatus: getFormString(formData, "approvalStatus"),
    countryId: getFormString(formData, "countryId"),
    displayName: getFormString(formData, "displayName"),
    isActive: getFormBoolean(formData, "isActive"),
    memberTypeId: getFormString(formData, "memberTypeId"),
    phone: getFormString(formData, "phone"),
    primaryLanguage: getFormString(formData, "primaryLanguage"),
    profileId: getFormString(formData, "profileId"),
    reason: getFormString(formData, "reason"),
  };
}

function getManualMemberInputFromForm(formData: FormData) {
  return {
    approvalStatus: getFormString(formData, "approvalStatus"),
    countryId: getFormString(formData, "countryId"),
    displayName: getFormString(formData, "displayName").trim(),
    email: getFormString(formData, "email").trim().toLowerCase(),
    memberTypeId: getFormString(formData, "memberTypeId"),
    password: getFormString(formData, "password").trim(),
    phone: getFormString(formData, "phone").trim(),
    primaryLanguage: getFormString(formData, "primaryLanguage").trim(),
    roleIds: getRoleIdsFromForm(formData),
  };
}

async function hasMembersPermission(supabase: Supabase): Promise<boolean> {
  const { data } = await supabase.rpc("has_permission", {
    permission_code: "members.manage",
  });

  return Boolean(data);
}

async function getProfileSnapshot(
  supabase: Supabase,
  profileId: string,
): Promise<RecordSnapshot | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as RecordSnapshot | null;
}

async function updateProfileStatus(
  supabase: Supabase,
  profileId: string,
  payload: ProfileUpdatePayload,
): Promise<RecordSnapshot> {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", profileId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Member not found");
  }

  return data as RecordSnapshot;
}

function getTargetLabel(record: RecordSnapshot): string | null {
  const label = record.display_name ?? record.email;

  return typeof label === "string" ? label : null;
}

async function runMemberAction(
  input: MemberActionInput,
  action: AdminLogAction,
  payload: ProfileUpdatePayload,
): Promise<ActionResult> {
  try {
    const validatedInput = validateMemberActionInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const hasPermission = await hasMembersPermission(supabase);

    if (!hasPermission) {
      await writeAuditEvent(supabase, {
        actorProfileId: user.id,
        errorCode: "member_management_permission_denied",
        eventLevel: "security",
        eventType: "unauthorized_access",
        message: "Member management action denied by permission guard",
        severity: "warning",
        targetId: validatedInput.profileId,
        targetTable: "profiles",
      });

      throw new Error("Permission denied");
    }

    const beforeData = await getProfileSnapshot(supabase, validatedInput.profileId);

    if (!beforeData) {
      throw new Error("Member not found");
    }

    const afterData = await updateProfileStatus(supabase, validatedInput.profileId, {
      ...payload,
      updated_by: user.id,
    });

    const logResult = await writeAdminLog(supabase, {
      action,
      actorProfileId: user.id,
      afterData,
      beforeData,
      reason: validatedInput.reason,
      targetId: validatedInput.profileId,
      targetLabel: getTargetLabel(afterData),
      targetTable: "profiles",
    });

    if (!logResult.ok) {
      throw new Error(`Member updated but audit log failed: ${logResult.error}`);
    }

    return { error: null, ok: true, recordId: validatedInput.profileId };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function approveMember(input: MemberActionInput): Promise<ActionResult> {
  return runMemberAction(input, "member_approve", { approval_status: "approved" });
}

export async function rejectMember(input: MemberActionInput): Promise<ActionResult> {
  return runMemberAction(input, "member_reject", { approval_status: "rejected" });
}

export async function suspendMember(input: MemberActionInput): Promise<ActionResult> {
  return runMemberAction(input, "member_suspend", { activity_status: "blocked" });
}

export async function reactivateMember(input: MemberActionInput): Promise<ActionResult> {
  return runMemberAction(input, "manual", { activity_status: "active" });
}

export async function updateMemberProfileAction(formData: FormData): Promise<void> {
  let result: MemberActionResult = "updated";

  try {
    const input = validateMemberProfileEditInput(getMemberProfileEditInputFromForm(formData));
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const hasPermission = await hasMembersPermission(supabase);

    if (!hasPermission) {
      throw new Error("Permission denied");
    }

    const beforeData = await getProfileSnapshot(supabase, input.profileId);

    if (!beforeData) {
      throw new Error("Member not found");
    }

    const afterData = await updateProfileStatus(supabase, input.profileId, {
      activity_status: input.activityStatus,
      approval_status: input.approvalStatus,
      country_id: input.countryId,
      display_name: input.displayName,
      is_active: input.isActive,
      member_type_id: input.memberTypeId,
      phone: input.phone,
      primary_language: input.primaryLanguage,
      updated_by: user.id,
    });

    const logResult = await writeAdminLog(supabase, {
      action: "manual",
      actorProfileId: user.id,
      afterData,
      beforeData,
      reason: input.reason ?? "Admin member profile update",
      targetId: input.profileId,
      targetLabel: getTargetLabel(afterData),
      targetTable: "profiles",
    });

    if (!logResult.ok) {
      throw new Error(`Member updated but audit log failed: ${logResult.error}`);
    }
  } catch {
    result = "error";
  }

  redirectToMembers(result);
}

export async function updateMemberRolesAction(formData: FormData): Promise<void> {
  let result: MemberActionResult = "rolesUpdated";

  try {
    const input = validateMemberActionInput(getMemberInputFromForm(formData));
    const requestedRoleIds = getRoleIdsFromForm(formData);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const hasPermission = await hasMembersPermission(supabase);

    if (!hasPermission) {
      throw new Error("Permission denied");
    }

    const beforeData = await getProfileSnapshot(supabase, input.profileId);

    if (!beforeData) {
      throw new Error("Member not found");
    }

    const allowedRoleIds = await getAssignableBusinessRoleIds(supabase);
    const roleIds = assertAssignableRoleIds(requestedRoleIds, allowedRoleIds);

    if (allowedRoleIds.size === 0 && roleIds.length > 0) {
      throw new Error("Assignable member roles are not configured");
    }

    const deleteResult =
      allowedRoleIds.size > 0
        ? await supabase
            .from("profile_roles")
            .delete()
            .eq("profile_id", input.profileId)
            .in("role_id", Array.from(allowedRoleIds))
        : { error: null };

    if (deleteResult.error) {
      throw new Error(deleteResult.error.message);
    }

    if (roleIds.length > 0) {
      const insertResult = await supabase.from("profile_roles").insert(
        roleIds.map((roleId) => ({
          profile_id: input.profileId,
          role_id: roleId,
        })),
      );

      if (insertResult.error) {
        throw new Error(insertResult.error.message);
      }
    }

    const afterData = {
      profileId: input.profileId,
      roleIds,
    };
    const logResult = await writeAdminLog(supabase, {
      action: "manual",
      actorProfileId: user.id,
      afterData,
      beforeData,
      reason: input.reason ?? "Admin member role update",
      targetId: input.profileId,
      targetLabel: getTargetLabel(beforeData),
      targetTable: "profile_roles",
    });

    if (!logResult.ok) {
      throw new Error(`Member roles updated but audit log failed: ${logResult.error}`);
    }
  } catch {
    result = "error";
  }

  redirectToMembers(result);
}

export async function forceWithdrawMemberAction(formData: FormData): Promise<void> {
  let result: MemberActionResult = "withdrawn";

  try {
    const input = validateMemberActionInput(getMemberInputFromForm(formData));
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const hasPermission = await hasMembersPermission(supabase);

    if (!hasPermission) {
      throw new Error("Permission denied");
    }

    const beforeData = await getProfileSnapshot(supabase, input.profileId);

    if (!beforeData) {
      throw new Error("Member not found");
    }

    const afterData = await updateProfileStatus(supabase, input.profileId, {
      activity_status: "blocked",
      approval_status: "suspended",
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
      is_active: false,
      updated_by: user.id,
    });

    const logResult = await writeAdminLog(supabase, {
      action: "member_suspend",
      actorProfileId: user.id,
      afterData,
      beforeData,
      reason: input.reason ?? "Admin forced withdrawal",
      targetId: input.profileId,
      targetLabel: getTargetLabel(beforeData),
      targetTable: "profiles",
    });

    if (!logResult.ok) {
      throw new Error(`Member withdrawn but audit log failed: ${logResult.error}`);
    }
  } catch {
    result = "error";
  }

  redirectToMembers(result);
}

export async function createMemberManuallyAction(formData: FormData): Promise<void> {
  let result: MemberActionResult = "created";

  try {
    const input = getManualMemberInputFromForm(formData);

    if (!input.email || input.email.length > 254 || !input.email.includes("@")) {
      throw new Error("Invalid email");
    }

    if (!UUID_PATTERN.test(input.memberTypeId)) {
      throw new Error("Invalid member type");
    }

    if (input.countryId && !UUID_PATTERN.test(input.countryId)) {
      throw new Error("Invalid country");
    }

    const approvalStatus = input.approvalStatus || "pending";

    if (!["pending", "approved", "rejected", "suspended"].includes(approvalStatus)) {
      throw new Error("Invalid approval status");
    }

    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const hasPermission = await hasMembersPermission(supabase);

    if (!hasPermission) {
      throw new Error("Permission denied");
    }

    const adminSupabase = createSupabaseAdminClient();
    const allowedRoleIds = await getAssignableBusinessRoleIds(adminSupabase);
    const roleIds = assertAssignableRoleIds(input.roleIds, allowedRoleIds);
    const password = input.password || crypto.randomUUID().replaceAll("-", "").slice(0, 16);
    const authResult = await adminSupabase.auth.admin.createUser({
      email: input.email,
      email_confirm: true,
      password,
      user_metadata: {
        display_name: input.displayName || input.email,
      },
    });

    if (authResult.error || !authResult.data.user) {
      throw new Error(authResult.error?.message ?? "Auth user was not created");
    }

    const profileId = authResult.data.user.id;
    const profileResult = await adminSupabase
      .from("profiles")
      .upsert({
        activity_status: "active",
        approval_status: approvalStatus as AccountApprovalStatus,
        country_id: input.countryId || null,
        created_by: user.id,
        display_name: input.displayName || null,
        email: input.email,
        id: profileId,
        is_active: true,
        member_type_id: input.memberTypeId,
        phone: input.phone || null,
        primary_language: input.primaryLanguage || "en",
        updated_by: user.id,
      })
      .select("*")
      .maybeSingle();

    if (profileResult.error || !profileResult.data) {
      throw new Error(profileResult.error?.message ?? "Profile was not created");
    }

    if (roleIds.length > 0) {
      const roleResult = await adminSupabase.from("profile_roles").insert(
        roleIds.map((roleId) => ({
          profile_id: profileId,
          role_id: roleId,
        })),
      );

      if (roleResult.error) {
        throw new Error(roleResult.error.message);
      }
    }

    const logResult = await writeAdminLog(supabase, {
      action: "manual",
      actorProfileId: user.id,
      afterData: {
        email: input.email,
        profileId,
        roleIds,
      },
      beforeData: null,
      reason: "Admin manual member creation",
      targetId: profileId,
      targetLabel: input.displayName || input.email,
      targetTable: "profiles",
    });

    if (!logResult.ok) {
      throw new Error(`Member created but audit log failed: ${logResult.error}`);
    }
  } catch {
    result = "error";
  }

  redirectToMembers(result);
}

export async function sendMemberAdminMessageAction(formData: FormData): Promise<void> {
  let result: MemberActionResult = "messaged";

  try {
    const input = getMessageInputFromForm(formData);

    if (!input.profileId || input.profileId.length < 10) {
      throw new Error("Member not found");
    }

    if (input.title.length < 2 || input.title.length > 120) {
      throw new Error("Invalid title");
    }

    if (input.body.length < 2 || input.body.length > 1000) {
      throw new Error("Invalid message");
    }

    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const hasPermission = await hasMembersPermission(supabase);

    if (!hasPermission) {
      await writeAuditEvent(supabase, {
        actorProfileId: user.id,
        errorCode: "member_message_permission_denied",
        eventLevel: "security",
        eventType: "unauthorized_access",
        message: "Member message action denied by permission guard",
        severity: "warning",
        targetId: input.profileId,
        targetTable: "profiles",
      });

      throw new Error("Permission denied");
    }

    const beforeData = await getProfileSnapshot(supabase, input.profileId);

    if (!beforeData) {
      throw new Error("Member not found");
    }

    const announcementResult = await supabase
      .from("announcements")
      .insert({
        body: input.body,
        created_by: user.id,
        priority: "medium",
        published_at: new Date().toISOString(),
        sender_profile_id: user.id,
        target_profile_id: input.profileId,
        target_scope: "profile",
        title: input.title,
      })
      .select("id,title,body")
      .maybeSingle();

    if (announcementResult.error) {
      throw new Error(announcementResult.error.message);
    }

    if (!announcementResult.data) {
      throw new Error("Message was not created");
    }

    const notificationResult = await supabase.from("notifications").insert({
      announcement_id: announcementResult.data.id,
      body: input.body,
      channel: "in_app",
      created_by: user.id,
      notification_type: "admin_direct_message",
      priority: "medium",
      profile_id: input.profileId,
      sent_at: new Date().toISOString(),
      title: input.title,
    });

    if (notificationResult.error) {
      throw new Error(notificationResult.error.message);
    }

    const logResult = await writeAdminLog(supabase, {
      action: "manual",
      actorProfileId: user.id,
      afterData: {
        announcementId: announcementResult.data.id,
        body: input.body,
        title: input.title,
      },
      beforeData,
      reason: "Admin direct member message",
      targetId: input.profileId,
      targetLabel: getTargetLabel(beforeData),
      targetTable: "profiles",
    });

    if (!logResult.ok) {
      throw new Error(`Member message created but audit log failed: ${logResult.error}`);
    }
  } catch {
    result = "error";
  }

  redirectToMembers(result);
}

export async function approveMemberAction(formData: FormData): Promise<void> {
  const result = await approveMember(getMemberInputFromForm(formData));

  redirectToMembers(result.ok ? "approved" : "error");
}

export async function rejectMemberAction(formData: FormData): Promise<void> {
  const result = await rejectMember(getMemberInputFromForm(formData));

  redirectToMembers(result.ok ? "rejected" : "error");
}

export async function suspendMemberAction(formData: FormData): Promise<void> {
  const result = await suspendMember(getMemberInputFromForm(formData));

  redirectToMembers(result.ok ? "suspended" : "error");
}

export async function reactivateMemberAction(formData: FormData): Promise<void> {
  const result = await reactivateMember(getMemberInputFromForm(formData));

  redirectToMembers(result.ok ? "reactivated" : "error");
}

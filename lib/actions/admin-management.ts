"use server";

import { revalidatePath } from "next/cache";
import { writeAdminLog, writeAuditEvent } from "@/lib/audit/logs";
import { requireCurrentUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  removeUndefinedValues,
  toEmptyJsonObject,
  validateApproveRewardInput,
  validateAssignCountryAgentInput,
  validateGrantBadgeInput,
  validateSuspendCompanyInput,
  validateUpdateCategoryInput,
  validateUpdateCountryInput,
  validateUpdateMenuInput,
  validateUpdateTranslationInput,
  validateVerifyCompanyInput,
  type ApproveRewardInput,
  type AssignCountryAgentInput,
  type GrantBadgeInput,
  type SuspendCompanyInput,
  type UpdateCategoryInput,
  type UpdateCountryInput,
  type UpdateMenuInput,
  type UpdateTranslationInput,
  type VerifyCompanyInput,
} from "@/lib/validators/admin-management";
import type { AdminLogAction } from "@/types/database";

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
type SnapshotTable =
  | "categories"
  | "companies"
  | "countries"
  | "menus"
  | "rewards"
  | "translations";
type RecordSnapshot = Record<string, unknown>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Action failed";
}

function getTargetLabel(record: Record<string, unknown> | null): string | null {
  if (!record) {
    return null;
  }

  const label =
    record.name ?? record.title ?? record.code ?? record.translation_key ?? record.id;

  return typeof label === "string" ? label : null;
}

async function requireAdminSession(): Promise<{
  supabase: Supabase;
  userId: string;
}> {
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("is_admin");

  if (error || !data) {
    await writeAuditEvent(supabase, {
      actorProfileId: user.id,
      errorCode: "admin_management_permission_denied",
      eventLevel: "security",
      eventType: "unauthorized_access",
      message: "Admin management action denied by admin guard",
      severity: "warning",
    });

    throw new Error("Permission denied");
  }

  return { supabase, userId: user.id };
}

async function getRequiredRecord(
  supabase: Supabase,
  tableName: SnapshotTable,
  id: string,
): Promise<RecordSnapshot> {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Target record not found");
  }

  return data as unknown as RecordSnapshot;
}

async function writeManagementLog(input: {
  action: AdminLogAction;
  afterData?: unknown;
  beforeData?: unknown;
  reason?: string | null;
  supabase: Supabase;
  targetId: string;
  targetLabel?: string | null;
  targetTable: string;
  userId: string;
}) {
  const logResult = await writeAdminLog(input.supabase, {
    action: input.action,
    actorProfileId: input.userId,
    afterData: input.afterData,
    beforeData: input.beforeData,
    reason: input.reason,
    targetId: input.targetId,
    targetLabel:
      input.targetLabel ??
      getTargetLabel(input.afterData as Record<string, unknown> | null),
    targetTable: input.targetTable,
  });

  if (!logResult.ok) {
    throw new Error(`Mutation completed but admin log failed: ${logResult.error}`);
  }
}

export async function verifyCompany(
  input: VerifyCompanyInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateVerifyCompanyInput(input);
    const { supabase, userId } = await requireAdminSession();
    const now = new Date().toISOString();
    const beforeCompany = await getRequiredRecord(
      supabase,
      "companies",
      validatedInput.companyId,
    );

    const { data: afterCompany, error: companyError } = await supabase
      .from("companies")
      .update({
        updated_by: userId,
        verification_status: "verified",
        verified_at: now,
        verified_by: userId,
      })
      .eq("id", validatedInput.companyId)
      .select("*")
      .maybeSingle();

    if (companyError) {
      throw new Error(companyError.message);
    }

    if (!afterCompany) {
      throw new Error("Company not found");
    }

    const verificationPayload = {
      business_registration_checked:
        validatedInput.businessRegistrationChecked ?? true,
      catalog_checked: validatedInput.catalogChecked ?? true,
      certificate_checked: validatedInput.certificateChecked ?? true,
      company_id: validatedInput.companyId,
      created_by: userId,
      is_active: true,
      review_note: validatedInput.reviewNote ?? null,
      reviewed_at: now,
      reviewed_by: userId,
      status: "verified" as const,
      updated_by: userId,
      website_checked: validatedInput.websiteChecked ?? true,
    };

    const { error: verificationError } = await supabase
      .from("company_verifications")
      .upsert(verificationPayload, { onConflict: "company_id" });

    if (verificationError) {
      throw new Error(verificationError.message);
    }

    await writeManagementLog({
      action: "company_verify",
      afterData: afterCompany,
      beforeData: beforeCompany,
      reason: validatedInput.reviewNote,
      supabase,
      targetId: validatedInput.companyId,
      targetLabel: afterCompany.name,
      targetTable: "companies",
      userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/companies");
    revalidatePath(`/companies/${afterCompany.slug}`);

    return { error: null, ok: true, recordId: validatedInput.companyId };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function suspendCompany(
  input: SuspendCompanyInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateSuspendCompanyInput(input);
    const { supabase, userId } = await requireAdminSession();
    const beforeCompany = await getRequiredRecord(
      supabase,
      "companies",
      validatedInput.companyId,
    );

    const { data: afterCompany, error } = await supabase
      .from("companies")
      .update({
        approval_status: "suspended",
        is_active: false,
        updated_by: userId,
        verification_status: "suspended",
      })
      .eq("id", validatedInput.companyId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!afterCompany) {
      throw new Error("Company not found");
    }

    await writeManagementLog({
      action: "company_suspend",
      afterData: afterCompany,
      beforeData: beforeCompany,
      reason: validatedInput.reason,
      supabase,
      targetId: validatedInput.companyId,
      targetLabel: afterCompany.name,
      targetTable: "companies",
      userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/companies");
    revalidatePath(`/companies/${afterCompany.slug}`);

    return { error: null, ok: true, recordId: validatedInput.companyId };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function updateMenu(input: UpdateMenuInput): Promise<ActionResult> {
  try {
    const validatedInput = validateUpdateMenuInput(input);
    const { supabase, userId } = await requireAdminSession();
    const beforeMenu = await getRequiredRecord(supabase, "menus", validatedInput.menuId);
    const updatePayload = removeUndefinedValues({
      href: validatedInput.href,
      is_active: validatedInput.isActive,
      is_visible: validatedInput.isVisible,
      label_key: validatedInput.labelKey,
      location: validatedInput.location,
      parent_id: validatedInput.parentId,
      sort_order: validatedInput.sortOrder,
      updated_by: userId,
    });

    const { data: afterMenu, error } = await supabase
      .from("menus")
      .update(updatePayload)
      .eq("id", validatedInput.menuId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!afterMenu) {
      throw new Error("Menu not found");
    }

    await writeManagementLog({
      action: "menu_change",
      afterData: afterMenu,
      beforeData: beforeMenu,
      supabase,
      targetId: validatedInput.menuId,
      targetLabel: afterMenu.code,
      targetTable: "menus",
      userId,
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return { error: null, ok: true, recordId: validatedInput.menuId };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function updateCategory(
  input: UpdateCategoryInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateUpdateCategoryInput(input);
    const { supabase, userId } = await requireAdminSession();
    const beforeCategory = await getRequiredRecord(
      supabase,
      "categories",
      validatedInput.categoryId,
    );
    const updatePayload = removeUndefinedValues({
      code: validatedInput.code,
      domain: validatedInput.domain,
      is_active: validatedInput.isActive,
      label_key: validatedInput.labelKey,
      name: validatedInput.name,
      parent_id: validatedInput.parentId,
      sort_order: validatedInput.sortOrder,
      updated_by: userId,
    });

    const { data: afterCategory, error } = await supabase
      .from("categories")
      .update(updatePayload)
      .eq("id", validatedInput.categoryId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!afterCategory) {
      throw new Error("Category not found");
    }

    await writeManagementLog({
      action: "category_change",
      afterData: afterCategory,
      beforeData: beforeCategory,
      supabase,
      targetId: validatedInput.categoryId,
      targetLabel: afterCategory.name,
      targetTable: "categories",
      userId,
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return { error: null, ok: true, recordId: validatedInput.categoryId };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function updateCountry(
  input: UpdateCountryInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateUpdateCountryInput(input);
    const { supabase, userId } = await requireAdminSession();
    const beforeCountry = await getRequiredRecord(
      supabase,
      "countries",
      validatedInput.countryId,
    );
    const updatePayload = removeUndefinedValues({
      code: validatedInput.code,
      is_active: validatedInput.isActive,
      name: validatedInput.name,
      region_id: validatedInput.regionId,
      sort_order: validatedInput.sortOrder,
      status: validatedInput.status,
    });

    const { data: afterCountry, error } = await supabase
      .from("countries")
      .update(updatePayload)
      .eq("id", validatedInput.countryId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!afterCountry) {
      throw new Error("Country not found");
    }

    await writeManagementLog({
      action: "setting_change",
      afterData: { ...afterCountry, updated_by: userId },
      beforeData: beforeCountry,
      supabase,
      targetId: validatedInput.countryId,
      targetLabel: afterCountry.name,
      targetTable: "countries",
      userId,
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return { error: null, ok: true, recordId: validatedInput.countryId };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function assignCountryAgent(
  input: AssignCountryAgentInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateAssignCountryAgentInput(input);
    const { supabase, userId } = await requireAdminSession();
    const { data: beforeAssignment, error: beforeError } = await supabase
      .from("country_agents")
      .select("*")
      .eq("country_id", validatedInput.countryId)
      .eq("agent_id", validatedInput.agentId)
      .maybeSingle();

    if (beforeError) {
      throw new Error(beforeError.message);
    }

    const { data: afterAssignment, error } = await supabase
      .from("country_agents")
      .upsert(
        {
          agent_id: validatedInput.agentId,
          country_id: validatedInput.countryId,
          created_by: userId,
          deleted_at: null,
          deleted_by: null,
          is_active: validatedInput.status === "active",
          status: validatedInput.status,
          updated_by: userId,
        },
        { onConflict: "country_id,agent_id" },
      )
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!afterAssignment) {
      throw new Error("Country agent assignment failed");
    }

    await writeManagementLog({
      action: "setting_change",
      afterData: afterAssignment,
      beforeData: beforeAssignment,
      supabase,
      targetId: afterAssignment.id,
      targetTable: "country_agents",
      userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/agents");

    return { error: null, ok: true, recordId: afterAssignment.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function updateTranslation(
  input: UpdateTranslationInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateUpdateTranslationInput(input);
    const { supabase, userId } = await requireAdminSession();
    const beforeTranslation = await getRequiredRecord(
      supabase,
      "translations",
      validatedInput.translationId,
    );
    const updatePayload = removeUndefinedValues({
      namespace: validatedInput.namespace,
      updated_by: userId,
      value: validatedInput.value,
    });

    const { data: afterTranslation, error } = await supabase
      .from("translations")
      .update(updatePayload)
      .eq("id", validatedInput.translationId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!afterTranslation) {
      throw new Error("Translation not found");
    }

    await writeManagementLog({
      action: "translation_change",
      afterData: afterTranslation,
      beforeData: beforeTranslation,
      supabase,
      targetId: validatedInput.translationId,
      targetLabel: afterTranslation.translation_key,
      targetTable: "translations",
      userId,
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return { error: null, ok: true, recordId: validatedInput.translationId };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function grantBadge(input: GrantBadgeInput): Promise<ActionResult> {
  try {
    const validatedInput = validateGrantBadgeInput(input);
    const { supabase, userId } = await requireAdminSession();
    const { data: beforeBadge, error: beforeError } = await supabase
      .from("profile_badges")
      .select("*")
      .eq("profile_id", validatedInput.profileId)
      .eq("badge_id", validatedInput.badgeId)
      .maybeSingle();

    if (beforeError) {
      throw new Error(beforeError.message);
    }

    const { data: afterBadge, error } = await supabase
      .from("profile_badges")
      .upsert(
        {
          awarded_by: userId,
          badge_id: validatedInput.badgeId,
          created_by: userId,
          deleted_at: null,
          deleted_by: null,
          is_active: true,
          profile_id: validatedInput.profileId,
          revoked_at: null,
          updated_by: userId,
        },
        { onConflict: "profile_id,badge_id" },
      )
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!afterBadge) {
      throw new Error("Badge grant failed");
    }

    await writeManagementLog({
      action: "badge_grant",
      afterData: afterBadge,
      beforeData: beforeBadge,
      supabase,
      targetId: afterBadge.id,
      targetTable: "profile_badges",
      userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/badges");

    return { error: null, ok: true, recordId: afterBadge.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function approveReward(
  input: ApproveRewardInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateApproveRewardInput(input);
    const { supabase, userId } = await requireAdminSession();
    const beforeReward = await getRequiredRecord(
      supabase,
      "rewards",
      validatedInput.rewardId,
    );
    const now = new Date().toISOString();

    const { data: afterReward, error } = await supabase
      .from("rewards")
      .update({
        admin_note: validatedInput.adminNote,
        approved_at: now,
        approved_by: userId,
        status: "approved",
        updated_by: userId,
      })
      .eq("id", validatedInput.rewardId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!afterReward) {
      throw new Error("Reward not found");
    }

    await writeManagementLog({
      action: "reward_approve",
      afterData: { ...afterReward, metadata: toEmptyJsonObject() },
      beforeData: beforeReward,
      reason: validatedInput.adminNote,
      supabase,
      targetId: validatedInput.rewardId,
      targetTable: "rewards",
      userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/rewards");

    return { error: null, ok: true, recordId: validatedInput.rewardId };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

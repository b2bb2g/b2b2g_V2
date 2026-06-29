"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminRoute } from "@/lib/auth/guards";
import { normalizeRoleKey } from "@/lib/auth/account-roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildInvitationTokenInsertPayload,
  generateInvitationToken,
  getInvitationTokenState,
  hashInvitationToken,
} from "./token";
import { getInvitationByTokenHash } from "./queries";
import {
  INVITATION_TYPES,
  type InvitationType,
  type PublicInvitationRpcResult,
  type PublicInvitationValidationResult,
} from "./types";

const ADMIN_CREATABLE_INVITATION_TYPES = [
  "supplier_admin_invite",
  "agent_admin_invite",
  "buyer_agent_invite",
  "professor_admin_invite",
  "student_professor_invite",
] as const satisfies readonly InvitationType[];

export type CreateAdminInvitationInput = {
  agentId?: string | null;
  baseUrl?: string | null;
  companyId?: string | null;
  expiresAt?: Date | string | null;
  invitationType: InvitationType;
  invitedEmail?: string | null;
  maxUses?: number;
  parentAccountId?: string | null;
  parentRoleKey?: string | null;
  professorId?: string | null;
  targetRoleKey: string;
};

export type CreateAdminInvitationResult =
  | {
      error: null;
      invitationId: string;
      invitationUrl: string | null;
      ok: true;
      token: string;
    }
  | {
      error: string;
      ok: false;
    };

export type InvitationActionResult =
  | {
      error: null;
      ok: true;
      recordId: string;
    }
  | {
      error: string;
      ok: false;
    };

export type InvitationTokenValidationResult =
  | {
      error: null;
      invitationId: string;
      invitationType: InvitationType;
      ok: true;
      targetRoleKey: string;
      tokenId: string;
    }
  | {
      error: string;
      ok: false;
    };

export type AcceptInvitationTokenResult =
  | {
      deferred: true;
      error: null;
      invitationId: string;
      ok: true;
      tokenId: string;
    }
  | {
      error: string;
      ok: false;
    };

export type AdminInvitationCreateFormState =
  | {
      created: null;
      error: string | null;
      ok: false;
    }
  | {
      created: {
        invitationId: string;
        invitationUrl: string | null;
        token: string;
      };
      error: null;
      ok: true;
    };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_INVITED_EMAIL_LENGTH = 320;
const MAX_USES_LIMIT = 100;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Invitation action failed";
}

function validateUuid(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`Invalid ${label}`);
  }

  return value;
}

function optionalUuid(value: string | null | undefined, label: string): string | null {
  if (!value) {
    return null;
  }

  return validateUuid(value, label);
}

function optionalFormString(formData: FormData, name: string): string | null {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function requiredFormString(formData: FormData, name: string): string {
  const value = optionalFormString(formData, name);

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

function normalizeInvitedEmail(email: string | null | undefined): string | null {
  const trimmed = email?.trim().toLowerCase() ?? "";

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > MAX_INVITED_EMAIL_LENGTH || !trimmed.includes("@")) {
    throw new Error("Invalid invited email");
  }

  return trimmed;
}

function normalizeMaxUses(maxUses: number | undefined): number {
  if (maxUses === undefined) {
    return 1;
  }

  if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > MAX_USES_LIMIT) {
    throw new Error("Invalid max uses");
  }

  return maxUses;
}

function normalizeFormMaxUses(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  return normalizeMaxUses(Number(value));
}

function normalizeFormExpiresAt(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid expires at");
  }

  return parsed.toISOString();
}

function assertSupportedInvitationType(invitationType: string): InvitationType {
  if (!INVITATION_TYPES.includes(invitationType as InvitationType)) {
    throw new Error("Invalid invitation type");
  }

  return invitationType as InvitationType;
}

function isSupportedInvitationType(value: string | null): value is InvitationType {
  return value !== null && INVITATION_TYPES.includes(value as InvitationType);
}

function toPublicValidationFailure(
  status: PublicInvitationRpcResult["status"] | null | undefined,
  validationAvailable = true,
): PublicInvitationValidationResult {
  if (status === "expired") {
    return {
      error: "expired_token",
      hasToken: true,
      invitedEmailMatchRequired: false,
      invitationType: null,
      ok: false,
      status: "expired",
      targetRoleKey: null,
      validationAvailable,
    };
  }

  if (status === "revoked") {
    return {
      error: "revoked_token",
      hasToken: true,
      invitedEmailMatchRequired: false,
      invitationType: null,
      ok: false,
      status: "revoked",
      targetRoleKey: null,
      validationAvailable,
    };
  }

  return {
    error: "invalid_token",
    hasToken: true,
    invitedEmailMatchRequired: false,
    invitationType: null,
    ok: false,
    status: "invalid",
    targetRoleKey: null,
    validationAvailable,
  };
}

function assertAdminCreatableInvitationType(invitationType: string): InvitationType {
  const supportedInvitationType = assertSupportedInvitationType(invitationType);

  if (!(ADMIN_CREATABLE_INVITATION_TYPES as readonly string[]).includes(supportedInvitationType)) {
    throw new Error("Invitation type is not allowed in the Admin create form");
  }

  return supportedInvitationType;
}

function assertAdminInvitationContext(
  input: CreateAdminInvitationInput,
  invitationType: InvitationType,
  parentRoleKey: string | null,
): void {
  if (invitationType === "buyer_agent_invite") {
    if (parentRoleKey !== "agent") {
      throw new Error("Buyer agent invitation requires parent role agent");
    }

    if (!input.parentAccountId || !input.agentId) {
      throw new Error("Buyer agent invitation requires parent account id and agent id");
    }
  }

  if (invitationType === "student_professor_invite") {
    if (parentRoleKey !== "professor") {
      throw new Error("Student professor invitation requires parent role professor");
    }

    if (!input.parentAccountId || !input.professorId) {
      throw new Error(
        "Student professor invitation requires parent account id and professor id",
      );
    }
  }
}

async function cancelPartialInvitationCreate(
  invitationId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<string | null> {
  const cancelledAt = new Date().toISOString();
  const { error } = await supabase
    .from("invitations")
    .update({
      deleted_at: cancelledAt,
      status: "cancelled",
    })
    .eq("id", invitationId)
    .is("deleted_at", null);

  return error?.message ?? null;
}

function buildInvitationUrl(baseUrl: string | null | undefined, token: string): string | null {
  const trimmedBaseUrl = baseUrl?.trim();

  if (!trimmedBaseUrl) {
    return null;
  }

  if (trimmedBaseUrl.startsWith("/")) {
    const url = new URL(trimmedBaseUrl, "https://b2bb2g.local");
    url.searchParams.set("invitation_token", token);

    return `${url.pathname}${url.search}${url.hash}`;
  }

  const url = new URL(trimmedBaseUrl);
  url.searchParams.set("invitation_token", token);

  return url.toString();
}

function assertUsableInvitation(
  record: NonNullable<Awaited<ReturnType<typeof getInvitationByTokenHash>>>,
): InvitationTokenValidationResult {
  const tokenState = getInvitationTokenState({
    deletedAt: record.token.deletedAt,
    expiresAt: record.token.expiresAt,
    revokedAt: record.token.revokedAt,
    usedAt: record.token.usedAt,
  });

  if (tokenState !== "active") {
    return { error: "Invitation token is invalid or expired", ok: false };
  }

  if (record.invitation.deletedAt || record.invitation.revokedAt) {
    return { error: "Invitation token is invalid or expired", ok: false };
  }

  if (record.invitation.status !== "active") {
    return { error: "Invitation is not active", ok: false };
  }

  if (record.invitation.usedCount >= record.invitation.maxUses) {
    return { error: "Invitation token is invalid or expired", ok: false };
  }

  return {
    error: null,
    invitationId: record.invitation.id,
    invitationType: record.invitation.invitationType,
    ok: true,
    targetRoleKey: record.invitation.targetRoleKey,
    tokenId: record.token.id,
  };
}

export async function createAdminInvitation(
  input: CreateAdminInvitationInput,
): Promise<CreateAdminInvitationResult> {
  try {
    const adminUser = await requireAdminRoute();
    const invitationType = assertAdminCreatableInvitationType(input.invitationType);
    const targetRoleKey = normalizeRoleKey(input.targetRoleKey);
    const parentRoleKey = input.parentRoleKey?.trim().toLowerCase() || null;

    if (!targetRoleKey) {
      throw new Error("Invalid target role key");
    }

    assertAdminInvitationContext(input, invitationType, parentRoleKey);

    const token = generateInvitationToken();
    const tokenInsertPayload = buildInvitationTokenInsertPayload(token, invitationType);
    const expiresAt =
      input.expiresAt instanceof Date
        ? input.expiresAt.toISOString()
        : input.expiresAt?.trim() || tokenInsertPayload.expires_at;
    const supabase = await createSupabaseServerClient();
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .insert({
        agent_id: optionalUuid(input.agentId, "agent id"),
        company_id: optionalUuid(input.companyId, "company id"),
        created_by: adminUser.id,
        expires_at: expiresAt,
        invitation_type: invitationType,
        invited_email: normalizeInvitedEmail(input.invitedEmail),
        inviter_account_id: adminUser.id,
        max_uses: normalizeMaxUses(input.maxUses),
        parent_account_id: optionalUuid(input.parentAccountId, "parent account id"),
        parent_role_key: parentRoleKey,
        professor_id: optionalUuid(input.professorId, "professor id"),
        status: "active",
        target_role_key: targetRoleKey,
      })
      .select("id")
      .single();

    if (invitationError) {
      throw new Error(invitationError.message);
    }

    const { error: tokenError } = await supabase.from("invitation_tokens").insert({
      ...tokenInsertPayload,
      expires_at: expiresAt,
      invitation_id: invitation.id,
    });

    if (tokenError) {
      const cleanupError = await cancelPartialInvitationCreate(invitation.id, supabase);

      if (cleanupError) {
        throw new Error(
          `Invitation token creation failed and partial invitation cleanup failed: ${cleanupError}`,
        );
      }

      throw new Error("Invitation token creation failed; partial invitation was cancelled");
    }

    // TODO(Sprint 2): write audit event after invitation audit contract is finalized.
    return {
      error: null,
      invitationId: invitation.id,
      invitationUrl: buildInvitationUrl(input.baseUrl, token),
      ok: true,
      token,
    };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function revokeInvitation(
  invitationId: string,
): Promise<InvitationActionResult> {
  try {
    await requireAdminRoute();
    const validatedInvitationId = validateUuid(invitationId, "invitation id");
    const revokedAt = new Date().toISOString();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("invitations")
      .update({
        revoked_at: revokedAt,
        status: "revoked",
      })
      .eq("id", validatedInvitationId)
      .is("deleted_at", null)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const { error: tokenError } = await supabase
      .from("invitation_tokens")
      .update({ revoked_at: revokedAt })
      .eq("invitation_id", validatedInvitationId)
      .is("deleted_at", null)
      .is("used_at", null);

    if (tokenError) {
      throw new Error(tokenError.message);
    }

    // TODO(Sprint 2): write audit event after invitation audit contract is finalized.
    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function createAdminInvitationFormAction(
  _previousState: AdminInvitationCreateFormState,
  formData: FormData,
): Promise<AdminInvitationCreateFormState> {
  try {
    const result = await createAdminInvitation({
      agentId: optionalFormString(formData, "agentId"),
      baseUrl: optionalFormString(formData, "baseUrl"),
      companyId: optionalFormString(formData, "companyId"),
      expiresAt: normalizeFormExpiresAt(optionalFormString(formData, "expiresAt")),
      invitationType: assertAdminCreatableInvitationType(
        requiredFormString(formData, "invitationType"),
      ),
      invitedEmail: optionalFormString(formData, "invitedEmail"),
      maxUses: normalizeFormMaxUses(optionalFormString(formData, "maxUses")),
      parentAccountId: optionalFormString(formData, "parentAccountId"),
      parentRoleKey: optionalFormString(formData, "parentRoleKey"),
      professorId: optionalFormString(formData, "professorId"),
      targetRoleKey: requiredFormString(formData, "targetRoleKey"),
    });

    if (!result.ok) {
      return { created: null, error: result.error, ok: false };
    }

    revalidatePath("/admin/invitations");

    return {
      created: {
        invitationId: result.invitationId,
        invitationUrl: result.invitationUrl,
        token: result.token,
      },
      error: null,
      ok: true,
    };
  } catch (error) {
    return { created: null, error: getErrorMessage(error), ok: false };
  }
}

export async function revokeInvitationFormAction(formData: FormData): Promise<void> {
  const invitationId = requiredFormString(formData, "invitationId");
  const result = await revokeInvitation(invitationId);

  revalidatePath("/admin/invitations");
  redirect(`/admin/invitations?result=${result.ok ? "revoked" : "error"}`);
}

export async function validateInvitationToken(
  rawToken: string,
): Promise<InvitationTokenValidationResult> {
  try {
    await requireAdminRoute();
    const tokenHash = hashInvitationToken(rawToken);
    const record = await getInvitationByTokenHash(tokenHash);

    if (!record) {
      return { error: "Invitation token is invalid or expired", ok: false };
    }

    return assertUsableInvitation(record);
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function validateInvitationTokenForPublic(
  rawToken: string | null | undefined,
): Promise<PublicInvitationValidationResult> {
  const token = rawToken?.trim() ?? "";

  if (!token) {
    return {
      error: "missing_token",
      hasToken: false,
      invitedEmailMatchRequired: false,
      invitationType: null,
      ok: false,
      status: "invalid",
      targetRoleKey: null,
      validationAvailable: false,
    };
  }

  try {
    const tokenHash = hashInvitationToken(token);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("validate_invitation_public", {
      token_hash: tokenHash,
    });

    if (error) {
      return {
        error: "validation_unavailable",
        hasToken: true,
        invitedEmailMatchRequired: false,
        invitationType: null,
        ok: false,
        status: "unavailable",
        targetRoleKey: null,
        validationAvailable: false,
      };
    }

    const result = (data?.[0] ?? null) as PublicInvitationRpcResult | null;

    if (
      !result?.is_valid ||
      result.status !== "valid" ||
      !isSupportedInvitationType(result.invitation_type) ||
      !result.target_role_key
    ) {
      return toPublicValidationFailure(result?.status);
    }

    return {
      error: null,
      hasToken: true,
      invitedEmailMatchRequired: result.invited_email_required,
      invitationType: result.invitation_type,
      ok: true,
      status: "valid",
      targetRoleKey: result.target_role_key,
      validationAvailable: true,
    };
  } catch {
    return {
      error: "invalid_token",
      hasToken: true,
      invitedEmailMatchRequired: false,
      invitationType: null,
      ok: false,
      status: "invalid",
      targetRoleKey: null,
      validationAvailable: false,
    };
  }
}

export async function acceptInvitationToken(
  rawToken: string,
): Promise<AcceptInvitationTokenResult> {
  const validation = await validateInvitationToken(rawToken);

  if (!validation.ok) {
    return validation;
  }

  // TODO(Sprint 2): connect signup, role application, redemption, and organization binding.
  // This skeleton intentionally performs no role_application/account_roles writes.
  return {
    deferred: true,
    error: null,
    invitationId: validation.invitationId,
    ok: true,
    tokenId: validation.tokenId,
  };
}

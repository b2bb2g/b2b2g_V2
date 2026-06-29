"use server";

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
import { INVITATION_TYPES, type InvitationType } from "./types";

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

function assertSupportedInvitationType(invitationType: string): InvitationType {
  if (!INVITATION_TYPES.includes(invitationType as InvitationType)) {
    throw new Error("Invalid invitation type");
  }

  return invitationType as InvitationType;
}

function buildInvitationUrl(baseUrl: string | null | undefined, token: string): string | null {
  const trimmedBaseUrl = baseUrl?.trim();

  if (!trimmedBaseUrl) {
    return null;
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
    const invitationType = assertSupportedInvitationType(input.invitationType);
    const targetRoleKey = normalizeRoleKey(input.targetRoleKey);

    if (!targetRoleKey) {
      throw new Error("Invalid target role key");
    }

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
        parent_role_key: input.parentRoleKey?.trim().toLowerCase() || null,
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
      throw new Error(tokenError.message);
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

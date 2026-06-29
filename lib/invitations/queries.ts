import "server-only";

import { requireAdminRoute } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type {
  InvitationAdminRecord,
  InvitationRedemptionAdminRecord,
  InvitationTokenAdminRecord,
  InvitationWithTokenAdminRecord,
} from "./types";

type Tables = Database["public"]["Tables"];
type InvitationRow = Tables["invitations"]["Row"];
type InvitationTokenRow = Tables["invitation_tokens"]["Row"];
type InvitationRedemptionRow = Tables["invitation_redemptions"]["Row"];

const TOKEN_HASH_PATTERN = /^[a-f0-9]{64}$/;
const INVITATION_SELECT =
  "id,invitation_type,invited_email,target_role_key,inviter_account_id,parent_account_id,parent_role_key,company_id,agent_id,professor_id,max_uses,used_count,expires_at,status,created_by,created_at,accepted_at,revoked_at,deleted_at";
const INVITATION_TOKEN_SELECT =
  "id,invitation_id,token_hash,created_at,expires_at,revoked_at,used_at,deleted_at";
const INVITATION_REDEMPTION_SELECT =
  "id,invitation_id,token_id,redeemed_by,redeemed_email,redeemed_role_key,status,created_at,deleted_at";

function assertTokenHash(tokenHash: string): void {
  if (!TOKEN_HASH_PATTERN.test(tokenHash)) {
    throw new Error("Invalid invitation token hash");
  }
}

function mapInvitation(row: InvitationRow): InvitationAdminRecord {
  return {
    acceptedAt: row.accepted_at,
    agentId: row.agent_id,
    companyId: row.company_id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    deletedAt: row.deleted_at,
    expiresAt: row.expires_at,
    id: row.id,
    invitationType: row.invitation_type,
    invitedEmail: row.invited_email,
    inviterAccountId: row.inviter_account_id,
    maxUses: row.max_uses,
    parentAccountId: row.parent_account_id,
    parentRoleKey: row.parent_role_key,
    professorId: row.professor_id,
    revokedAt: row.revoked_at,
    status: row.status,
    targetRoleKey: row.target_role_key,
    usedCount: row.used_count,
  };
}

function mapInvitationToken(row: InvitationTokenRow): InvitationTokenAdminRecord {
  return {
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    expiresAt: row.expires_at,
    id: row.id,
    invitationId: row.invitation_id,
    revokedAt: row.revoked_at,
    tokenHash: row.token_hash,
    usedAt: row.used_at,
  };
}

function mapInvitationRedemption(
  row: InvitationRedemptionRow,
): InvitationRedemptionAdminRecord {
  return {
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    id: row.id,
    invitationId: row.invitation_id,
    redeemedBy: row.redeemed_by,
    redeemedEmail: row.redeemed_email,
    redeemedRoleKey: row.redeemed_role_key,
    status: row.status,
    tokenId: row.token_id,
  };
}

export async function getInvitationByTokenHash(
  tokenHash: string,
): Promise<InvitationWithTokenAdminRecord | null> {
  await requireAdminRoute();
  assertTokenHash(tokenHash);

  const supabase = await createSupabaseServerClient();
  const { data: token, error: tokenError } = await supabase
    .from("invitation_tokens")
    .select(INVITATION_TOKEN_SELECT)
    .eq("token_hash", tokenHash)
    .is("deleted_at", null)
    .maybeSingle();

  if (tokenError) {
    throw new Error(tokenError.message);
  }

  if (!token) {
    return null;
  }

  const { data: invitation, error: invitationError } = await supabase
    .from("invitations")
    .select(INVITATION_SELECT)
    .eq("id", token.invitation_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (invitationError) {
    throw new Error(invitationError.message);
  }

  if (!invitation) {
    return null;
  }

  return {
    invitation: mapInvitation(invitation),
    token: mapInvitationToken(token),
  };
}

export async function getInvitationForAdmin(
  invitationId: string,
): Promise<InvitationAdminRecord | null> {
  await requireAdminRoute();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invitations")
    .select(INVITATION_SELECT)
    .eq("id", invitationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapInvitation(data) : null;
}

export async function listInvitationsForAdmin(): Promise<InvitationAdminRecord[]> {
  await requireAdminRoute();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invitations")
    .select(INVITATION_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return data?.map(mapInvitation) ?? [];
}

export async function getInvitationRedemptionsForAdmin(
  invitationId: string,
): Promise<InvitationRedemptionAdminRecord[]> {
  await requireAdminRoute();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invitation_redemptions")
    .select(INVITATION_REDEMPTION_SELECT)
    .eq("invitation_id", invitationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data?.map(mapInvitationRedemption) ?? [];
}

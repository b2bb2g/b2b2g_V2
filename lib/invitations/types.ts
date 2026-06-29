export const INVITATION_TYPES = [
  "supplier_admin_invite",
  "supplier_public_signup",
  "agent_admin_invite",
  "agent_public_application",
  "buyer_agent_invite",
  "buyer_direct_signup",
  "professor_admin_invite",
  "professor_public_application",
  "student_professor_invite",
] as const;

export type InvitationType = (typeof INVITATION_TYPES)[number];

export const INVITATION_STATUSES = [
  "draft",
  "active",
  "accepted",
  "expired",
  "revoked",
  "cancelled",
] as const;

export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export type InvitationRedemptionStatus =
  | "accepted"
  | "blocked"
  | "expired"
  | "rejected";

export type InvitationTokenPayload = {
  expiresAt: Date;
  invitationType: InvitationType;
  token: string;
  tokenHash: string;
};

export type InvitationTokenIssueResult = InvitationTokenPayload & {
  issuedAt: Date;
};

export type InvitationValidationResult =
  | {
      ok: true;
    }
  | {
      error: "empty_token" | "invalid_token" | "hash_mismatch";
      ok: false;
    };

export type InvitationAdminRecord = {
  acceptedAt: string | null;
  agentId: string | null;
  companyId: string | null;
  createdAt: string;
  createdBy: string | null;
  deletedAt: string | null;
  expiresAt: string;
  id: string;
  invitationType: InvitationType;
  invitedEmail: string | null;
  inviterAccountId: string | null;
  maxUses: number;
  parentAccountId: string | null;
  parentRoleKey: string | null;
  professorId: string | null;
  revokedAt: string | null;
  status: InvitationStatus;
  targetRoleKey: string;
  usedCount: number;
};

export type InvitationTokenAdminRecord = {
  createdAt: string;
  deletedAt: string | null;
  expiresAt: string;
  id: string;
  invitationId: string;
  revokedAt: string | null;
  tokenHash: string;
  usedAt: string | null;
};

export type InvitationRedemptionAdminRecord = {
  createdAt: string;
  deletedAt: string | null;
  id: string;
  invitationId: string;
  redeemedBy: string | null;
  redeemedEmail: string | null;
  redeemedRoleKey: string | null;
  status: InvitationRedemptionStatus;
  tokenId: string | null;
};

export type InvitationWithTokenAdminRecord = {
  invitation: InvitationAdminRecord;
  token: InvitationTokenAdminRecord;
};

export type InvitationAgentParentOption = {
  accountId: string;
  agentId: string;
  approvalStatus: string;
  marketSummary: string | null;
};

export type InvitationProfessorParentOption = {
  accountId: string;
  approvalStatus: string;
  professorId: string;
  universityName: string | null;
};

export type InvitationParentSelectorOptions = {
  agents: InvitationAgentParentOption[];
  professors: InvitationProfessorParentOption[];
};

export type PublicInvitationRpcResult = {
  invited_email_required: boolean;
  invitation_type: InvitationType | null;
  is_valid: boolean;
  status: "expired" | "invalid" | "revoked" | "valid" | string;
  target_role_key: string | null;
};

export type PublicInvitationValidationResult =
  | {
      error:
        | "expired_token"
        | "invalid_token"
        | "missing_token"
        | "revoked_token"
        | "validation_unavailable";
      hasToken: boolean;
      invitedEmailMatchRequired: false;
      invitationType: null;
      ok: false;
      status: "expired" | "invalid" | "revoked" | "unavailable";
      targetRoleKey: null;
      validationAvailable: boolean;
    }
  | {
      error: null;
      hasToken: true;
      invitedEmailMatchRequired: boolean;
      invitationType: InvitationType;
      ok: true;
      status: "valid";
      targetRoleKey: string;
      validationAvailable: true;
    };

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

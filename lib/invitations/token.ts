import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { InvitationType } from "./types";

const TOKEN_BYTE_LENGTH = 32;
const TOKEN_HASH_ALGORITHM = "sha256";
const TOKEN_SEARCH_PARAM = "invitation_token";
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const DEFAULT_EXPIRY_DAYS = 7;
const EXTENDED_ADMIN_EXPIRY_DAYS = 30;
const STUDENT_PROFESSOR_EXPIRY_DAYS = 180;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_IN_MILLISECONDS);
}

function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function generateInvitationToken(): string {
  return randomBytes(TOKEN_BYTE_LENGTH).toString("base64url");
}

export function hashInvitationToken(token: string): string {
  if (!isNonEmptyString(token)) {
    throw new Error("Invitation token is required");
  }

  // Raw invitation tokens must never be stored or logged. Persist only this hash.
  return createHash(TOKEN_HASH_ALGORITHM).update(token, "utf8").digest("hex");
}

export function verifyInvitationToken(token: string, tokenHash: string): boolean {
  if (!isNonEmptyString(token) || !isNonEmptyString(tokenHash)) {
    return false;
  }

  const candidateHash = hashInvitationToken(token);
  const candidateBuffer = Buffer.from(candidateHash, "hex");
  const expectedBuffer = Buffer.from(tokenHash, "hex");

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

export function buildInvitationUrl(baseUrl: string, token: string): string {
  if (!isNonEmptyString(token)) {
    throw new Error("Invitation token is required");
  }

  let url: URL;

  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error("Invitation base URL must be absolute");
  }

  url.searchParams.set(TOKEN_SEARCH_PARAM, token);

  return url.toString();
}

export function getDefaultInvitationExpiry(
  invitationType: InvitationType,
  now = new Date(),
): Date {
  if (
    invitationType === "supplier_admin_invite" ||
    invitationType === "professor_admin_invite"
  ) {
    return addDays(now, EXTENDED_ADMIN_EXPIRY_DAYS);
  }

  if (invitationType === "student_professor_invite") {
    // TODO(Sprint 2): replace this temporary semester-length value with an academic-term policy.
    return addDays(now, STUDENT_PROFESSOR_EXPIRY_DAYS);
  }

  return addDays(now, DEFAULT_EXPIRY_DAYS);
}

export type InvitationTokenInsertPayload = {
  expires_at: string;
  token_hash: string;
};

export type InvitationTokenStateInput = {
  deletedAt?: Date | null | string;
  expiresAt: Date | string;
  revokedAt?: Date | null | string;
  usedAt?: Date | null | string;
};

export type InvitationTokenState =
  | "active"
  | "deleted"
  | "expired"
  | "revoked"
  | "used";

export function buildInvitationTokenInsertPayload(
  token: string,
  invitationType: InvitationType,
  now = new Date(),
): InvitationTokenInsertPayload {
  return {
    expires_at: getDefaultInvitationExpiry(invitationType, now).toISOString(),
    token_hash: hashInvitationToken(token),
  };
}

export function isInvitationExpired(
  expiresAt: Date | string,
  now = new Date(),
): boolean {
  return toDate(expiresAt).getTime() <= now.getTime();
}

export function getInvitationTokenState(
  input: InvitationTokenStateInput,
  now = new Date(),
): InvitationTokenState {
  if (input.deletedAt) {
    return "deleted";
  }

  if (input.revokedAt) {
    return "revoked";
  }

  if (input.usedAt) {
    return "used";
  }

  if (isInvitationExpired(input.expiresAt, now)) {
    return "expired";
  }

  return "active";
}

export function isInvitationTokenUsable(
  input: InvitationTokenStateInput,
  now = new Date(),
): boolean {
  return getInvitationTokenState(input, now) === "active";
}

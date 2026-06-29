import assert from "node:assert/strict";
import test from "node:test";
import type { InvitationType } from "./types";

const {
  buildInvitationUrl,
  generateInvitationToken,
  getDefaultInvitationExpiry,
  hashInvitationToken,
  verifyInvitationToken,
} = (await import(new URL("./token.ts", import.meta.url).href)) as typeof import("./token");

const { INVITATION_TYPES } = (await import(new URL("./types.ts", import.meta.url).href)) as typeof import("./types");

const URL_SAFE_TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;

test("token generated", () => {
  const token = generateInvitationToken();

  assert.equal(typeof token, "string");
  assert.ok(token.length >= 40);
});

test("token is URL-safe", () => {
  const token = generateInvitationToken();

  assert.match(token, URL_SAFE_TOKEN_PATTERN);
});

test("token hash is not equal to raw token", () => {
  const token = generateInvitationToken();
  const tokenHash = hashInvitationToken(token);

  assert.notEqual(tokenHash, token);
  assert.match(tokenHash, /^[a-f0-9]{64}$/);
});

test("verify correct token true", () => {
  const token = generateInvitationToken();
  const tokenHash = hashInvitationToken(token);

  assert.equal(verifyInvitationToken(token, tokenHash), true);
});

test("verify wrong token false", () => {
  const token = generateInvitationToken();
  const tokenHash = hashInvitationToken(token);

  assert.equal(verifyInvitationToken("wrong-token", tokenHash), false);
});

test("buildInvitationUrl includes token", () => {
  const token = generateInvitationToken();
  const invitationUrl = buildInvitationUrl("https://b2bb2g.com/signup", token);
  const parsedUrl = new URL(invitationUrl);

  assert.equal(parsedUrl.origin, "https://b2bb2g.com");
  assert.equal(parsedUrl.pathname, "/signup");
  assert.equal(parsedUrl.searchParams.get("invitation_token"), token);
});

test("default expiry is 7 days", () => {
  const now = new Date("2026-06-29T00:00:00.000Z");
  const expiresAt = getDefaultInvitationExpiry("agent_admin_invite", now);

  assert.equal(expiresAt.toISOString(), "2026-07-06T00:00:00.000Z");
});

test("supplier_admin_invite expiry is 30 days", () => {
  const now = new Date("2026-06-29T00:00:00.000Z");
  const expiresAt = getDefaultInvitationExpiry("supplier_admin_invite", now);

  assert.equal(expiresAt.toISOString(), "2026-07-29T00:00:00.000Z");
});

test("student_professor_invite expiry policy exists", () => {
  const now = new Date("2026-06-29T00:00:00.000Z");
  const expiresAt = getDefaultInvitationExpiry("student_professor_invite", now);

  assert.equal(expiresAt.toISOString(), "2026-12-26T00:00:00.000Z");
});

test("supported invitation types compile", () => {
  const supportedInvitationTypes: InvitationType[] = [...INVITATION_TYPES];

  assert.deepEqual(supportedInvitationTypes, [
    "supplier_admin_invite",
    "supplier_public_signup",
    "agent_admin_invite",
    "agent_public_application",
    "buyer_agent_invite",
    "buyer_direct_signup",
    "professor_admin_invite",
    "professor_public_application",
    "student_professor_invite",
  ]);
});

# Invitation Migration Spec

## 1. Purpose

This document defines the first Invitation Engine migration before SQL authoring.

It is a migration specification only. It does not create SQL, modify Supabase, change code, change UI, or apply RLS policies.

The goal is to define an additive-first `012_invitation_core.sql` plan that replaces legacy invite-like referral behavior with a token-hash based Invitation Engine.

## 2. Migration Scope

This migration scope is limited to the Invitation Engine core.

Migration target tables:

- `invitations`
- `invitation_tokens`
- `invitation_redemptions`

QR decision:

- QR image table is not created in MVP.
- QR images are not stored in Supabase Storage for MVP.
- QR is generated from the invitation URL.
- The invitation URL must contain only the raw token value required for redemption.
- The raw token is never stored in the DB.

Out of scope for this migration:

- `agent_buyers`
- `professor_students`
- `company_members`
- role backfill
- feature flag table creation
- RLS policy SQL
- Supabase production apply
- legacy `member_referral_codes` migration/backfill

## 3. Invitation Table

Target table:

- `invitations`

Purpose:

- Stores invitation lifecycle, role target, parent context, use count, and acceptance/revocation state.
- Does not store raw token.
- Uses `token_hash` for MVP active token lookup while `invitation_tokens` stores token issuance/redemption audit history.

Field design:

| Field | Type Candidate | Required | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | Yes | Primary key, default `gen_random_uuid()`. |
| `invitation_type` | `text` | Yes | One of the approved invitation type keys. |
| `token_hash` | `text` | Yes | Current active token hash for MVP lookup. Raw token storage is forbidden. |
| `invited_email` | `text` | No | Optional invited email boundary; must be normalized lowercase if present. |
| `target_role_key` | `text` | Yes | Role requested or activated by the invitation flow. |
| `inviter_account_id` | `uuid` | No | Account that issued the invitation; required for admin/agent/professor invites. |
| `parent_account_id` | `uuid` | No | Parent Agent or Professor account when a parent link is required. |
| `parent_role_key` | `text` | No | Parent role context, e.g. `agent`, `professor`, `administrator`. |
| `company_id` | `uuid` | No | Optional company context for Supplier/company member flows. |
| `agent_id` | `uuid` | No | Optional Agent profile id for Buyer Agent Invitation. |
| `professor_id` | `uuid` | No | Optional Professor profile id for Student Professor Invitation. |
| `max_uses` | `integer` | Yes | Default `1` unless invitation type explicitly allows multi-use. |
| `used_count` | `integer` | Yes | Default `0`; must not exceed `max_uses`. |
| `expires_at` | `timestamptz` | Yes | Required for all active invitations. |
| `status` | `text` | Yes | `draft`, `active`, `accepted`, `expired`, `revoked`, `cancelled`. |
| `created_at` | `timestamptz` | Yes | Default `now()`. |
| `accepted_at` | `timestamptz` | No | First successful acceptance timestamp. |
| `revoked_at` | `timestamptz` | No | Revocation timestamp. |

Recommended additional audit fields for SQL authoring review:

| Field | Type Candidate | Notes |
| --- | --- | --- |
| `created_by` | `uuid` | References `profiles.id`; actor that created the row. |
| `accepted_by_account_id` | `uuid` | References accepting `profiles.id`. |
| `revoked_by_account_id` | `uuid` | References revoking `profiles.id`. |
| `role_application_id` | `uuid` | Optional link to `role_applications.id`. |
| `relation_candidate_status` | `text` | Optional state for future Agent-Buyer/Professor-Student/company relation creation. |
| `deleted_at` | `timestamptz` | Soft delete marker. |
| `updated_at` | `timestamptz` | Standard update timestamp. |

Table constraints for SQL review:

- `token_hash` unique where invitation is not deleted.
- `used_count >= 0`.
- `max_uses >= 1`.
- `used_count <= max_uses`.
- `expires_at > created_at` for active invitations.
- `student_professor_invite` requires `parent_account_id`, `parent_role_key = 'professor'`, and `professor_id`.
- `buyer_agent_invite` requires `parent_account_id`, `parent_role_key = 'agent'`, and `agent_id`.
- Supplier invite/signup must not include Buyer identifiers or Buyer PII.

Principles:

- Raw token storage is absolutely forbidden.
- Only `token_hash` is persisted.
- Public token lookup must not reveal whether an email exists.

## 4. Invitation Token Policy

Token generation:

- Token entropy: 256-bit random.
- Token representation: URL-safe.
- Recommended encoding: base64url without padding, or equivalent URL-safe encoding.
- Raw token appears only in the invitation URL delivered to the invitee.
- DB stores only a cryptographic hash of the token.

Hashing:

- Hash algorithm must be deterministic for lookup.
- Recommended helper decision before implementation: SHA-256 over a server-side normalized token string.
- If a pepper is used, it must be server-only and never exposed to the client.
- `token_hash` must be compared server-side.

Expiry defaults:

| Invitation Type | Expiry Default |
| --- | --- |
| Standard invitation | 7 days |
| Supplier Admin Invitation | 30 days |
| Professor Student Invitation | Academic term / semester basis, exact days to be set before SQL |
| Public signup/application pseudo-invitation | Short-lived session or application-bound token; exact policy before implementation |

Use policy:

- Default `max_uses = 1`.
- Parent invitation links can become controlled multi-use only after explicit approval.
- Bulk invitation is out of scope for MVP.
- Reuse of an accepted single-use invitation is blocked.
- Revoked, expired, cancelled, overused, or deleted invitations are blocked.

Rate limiting:

- Acceptance endpoint must rate limit invalid token attempts.
- Token validation must return generic invalid/expired responses.
- Email mismatch must not reveal whether `invited_email` exists.

## 5. Invitation Type Mapping

| Invitation Type | Target Role | Creator | Parent Required | Default Uses | Default Expiry | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `supplier_admin_invite` | `supplier` | Administrator | No | 1 | 30 days | Creates Supplier Role Application. |
| `supplier_public_signup` | `supplier` | Public user/system | No | 1 | 7 days or application session | Public self signup path; Admin Approval required. |
| `agent_admin_invite` | `agent` | Administrator | No | 1 | 7 days | Creates Agent Role Application. |
| `agent_public_application` | `agent` | Public user/system | No | 1 | 7 days or application session | Admin Approval required. |
| `buyer_agent_invite` | `buyer` | Approved Agent | Yes, Agent | 1 | 7 days | Creates/queues `agent_buyers` relation candidate. |
| `buyer_direct_signup` | `buyer` | Public user/system | No | 1 | 7 days or application session | Disabled by `buyer_direct_signup_enabled=false` by default. |
| `professor_admin_invite` | `professor` | Administrator | No | 1 | 7 days | Creates Professor Role Application. |
| `professor_public_application` | `professor` | Public user/system | No | 1 | 7 days or application session | Disabled by default. |
| `student_professor_invite` | `student` | Approved Professor | Yes, Professor | 1 or controlled multi-use | Semester basis | Student public self signup remains blocked. |

Status mapping:

- Creation starts as `active` for immediately usable invitations or `draft` for admin-prepared invitations.
- Acceptance changes status to `accepted` when `used_count = max_uses`.
- Multi-use invitations can remain `active` while `used_count < max_uses`.
- Expiry/revocation must block future acceptance even if `used_count < max_uses`.

## 6. Invitation Acceptance

Acceptance common sequence:

1. Receive raw token from invitation URL.
2. Normalize and hash token.
3. Find active invitation by `token_hash`.
4. Validate status, expiry, revocation, max use, parent requirement, and feature flag.
5. Validate `invited_email` if present.
6. Create or link account/profile as needed.
7. Execute role-specific handling.
8. Increment `used_count`.
9. Insert `invitation_redemptions`.
10. Write audit log when audit integration is available.

Supplier:

```text
Supplier invitation/signup
-> role_application 생성
-> Admin Approval
-> company_members 생성 후보
-> Company/Product Approval remains separate
```

Rules:

- Supplier does not receive active public privileges from token acceptance alone.
- Supplier does not receive Buyer PII.
- Free/Premium/Enterprise tier is applied after Admin Approval.

Agent:

```text
Agent invitation/application
-> role_application 생성
-> Admin Approval
-> agent profile
```

Rules:

- Agent cannot invite Buyer until Agent role is approved.
- Public Agent Application requires feature flag confirmation.

Buyer:

```text
Buyer invitation/direct signup
-> Buyer 생성
-> agent_buyers 후보
```

Rules:

- `buyer_agent_invite` must have Agent parent context.
- `buyer_direct_signup` remains disabled by default.
- Agent can see only subordinate Buyer limited information after approved relation exists.

Professor:

```text
Professor invitation/application
-> role_application 생성
-> Admin Approval
```

Rules:

- Professor public application remains OFF by default.
- Approved Professor can create Student invitations in a later task.

Student:

```text
Student Professor invitation
-> Student 생성
-> professor_students 후보
```

Rules:

- Student signup without Professor link is blocked.
- Public self signup is blocked.
- Professor can see subordinate Student PII only after relation is valid.

## 7. Security

Required security controls:

- Token hash only; raw token is never stored.
- 256-bit random token.
- URL-safe token representation.
- Rate limiting for token validation and acceptance.
- Single-use default.
- `max_uses` enforced at DB and action layers.
- `used_count` increment must be transaction-safe.
- Revoked invitations cannot be accepted.
- Expired invitations cannot be accepted.
- Cancelled invitations cannot be accepted.
- `invited_email` match must not leak account existence.
- Audit log required for create, accept, revoke, expire/manual close, and failed suspicious attempts where feasible.
- Supplier invitation/signup cannot grant Buyer PII.
- Feature flags cannot bypass Permission Matrix or RLS.
- Service role fallback is prohibited in application actions.

RLS/security helper candidates for later design:

- `can_create_invitation(user_id, invitation_type)`
- `can_read_invitation(user_id, invitation_id)`
- `can_accept_invitation(user_id, invitation_id)`
- `can_revoke_invitation(user_id, invitation_id)`
- `is_invitation_parent(user_id, invitation_id)`

No RLS SQL is written in this task.

## 8. Feature Flag 영향

| Feature Flag | Migration Impact |
| --- | --- |
| `supplier_public_signup_enabled` | Controls whether `supplier_public_signup` can be created/accepted. |
| `supplier_invitation_enabled` | Controls whether `supplier_admin_invite` can be created/accepted. |
| `buyer_direct_signup_enabled` | Default false; blocks `buyer_direct_signup` acceptance unless enabled. |
| `student_signup_requires_professor_link` | Default true; requires `student_professor_invite` for Student signup. |

Feature flag enforcement location:

- DB schema stores invitation context.
- Server action validates feature flags before creation/acceptance.
- RLS helper/policies later enforce role and ownership boundaries.
- Feature flags never grant Buyer PII or Supplier-Buyer direct contact.

## 9. Migration File

Planned file:

- `supabase/migrations/012_invitation_core.sql`

This file is not written in this task.

Expected SQL authoring scope when approved:

- `CREATE TABLE IF NOT EXISTS public.invitations`
- `CREATE TABLE IF NOT EXISTS public.invitation_tokens`
- `CREATE TABLE IF NOT EXISTS public.invitation_redemptions`
- additive indexes
- check constraints
- comments
- no destructive changes
- no data backfill
- no legacy referral table deletion
- no RLS policies unless separately approved

Expected indexes:

- `invitations(token_hash)` unique active/deleted-safe index
- `invitations(invitation_type)`
- `invitations(status)`
- `invitations(target_role_key)`
- `invitations(inviter_account_id)`
- `invitations(parent_account_id)`
- `invitations(expires_at)`
- `invitation_tokens(invitation_id)`
- `invitation_tokens(token_hash)`
- `invitation_redemptions(invitation_id)`
- `invitation_redemptions(redeemed_by_account_id)`

Compatibility:

- Do not remove `referral_codes`.
- Do not remove `referral_relations`.
- Do not remove `member_referral_codes`.
- Do not remove `member_referral_signups`.
- Legacy invite-like data migration requires separate review.

## 10. Blocking

Blocking items before SQL authoring:

| Blocking Item | Blocks | Required Resolution |
| --- | --- | --- |
| QR generation method | QR helper and production link sharing | MVP uses URL-generated QR, but local vs external renderer must be decided before production. |
| Token hashing helper | SQL validation and app helper implementation | Confirm SHA-256/base64url details and optional server-side pepper. |
| Accepted flow transaction design | Invitation actions | Define transaction/RPC or server action sequence for `used_count` and redemption insert. |
| Audit integration | Invitation actions | Decide whether to use existing `admin_logs` / `audit_events` helpers in first implementation. |
| Semester expiry definition | Student invitation SQL defaults | Define exact days or store explicit `expires_at` per Professor invitation. |
| RLS policy timing | Production apply | Decide whether `012` is table-only or includes RLS enablement without policies. |

## 11. Decision Required

| Decision | Current Spec Position | Required Before |
| --- | --- | --- |
| Token length | 256-bit random fixed; encoded string length still implementation detail. | Token helper implementation. |
| Expiry | 7 days default, Supplier Admin 30 days, Professor Student semester basis. | SQL default/check review. |
| Reuse | Single-use default; controlled multi-use only for explicitly approved parent links. | SQL constraints and action validation. |
| Multi invitation | Multiple active invitations per inviter/role may be allowed; duplicate email/type policy not final. | Admin invite action. |
| Bulk invitation | Out of scope for MVP. | Post-MVP planning. |
| Email verification | `invited_email` match required when present, but Admin override policy is undecided. | Acceptance action. |
| Public signup pseudo-invitation | Use invitation row for `supplier_public_signup` / applications or create role application directly. | Supplier signup implementation. |
| Token storage split | `invitations.token_hash` plus `invitation_tokens` audit history is current spec; de-duplication can be reviewed before SQL. | SQL review. |

## 12. Codex Notes

- Migration 작성 전 반드시 review.
- Do not write `012_invitation_core.sql` until this spec is accepted.
- Do not apply Supabase DB changes from this document.
- Do not change signup code before invitation helper/query/action contracts are designed.
- Do not use `referral_relations` as Agent-Buyer authority.
- Do not use `member_referral_codes` as the final Invitation Engine.
- Do not expose Buyer PII in Supplier invitation or signup paths.
- Next task should be Invitation token helper/types after SQL authoring is separately approved, or SQL authoring for `012_invitation_core.sql` if the owner explicitly requests it.

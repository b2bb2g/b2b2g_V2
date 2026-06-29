# Sprint 2 Invitation Migration Review

## 1. Review Purpose

This document reviews `supabase/migrations/012_invitation_core.sql` before any production Supabase apply.

The review focuses on:

- additive-only safety
- destructive SQL absence
- raw invitation token storage prevention
- RLS / policy / SECURITY DEFINER absence
- compatibility with existing signup, referral, and legacy invitation-like flows
- alignment with the Invitation Engine plan and migration spec
- readiness for Task 07 Queries / Actions

No SQL, code, UI, Supabase production data, or production schema was changed by this review.

## 2. Review Scope

Reviewed files:

| File | Review Purpose |
| --- | --- |
| `supabase/migrations/012_invitation_core.sql` | Primary migration safety review. |
| `docs/09-sprints/13-sprint-2-invitation-migration-spec.md` | Migration design alignment review. |
| `docs/09-sprints/11-sprint-2-invitation-engine-plan.md` | Invitation policy and workflow alignment review. |
| `lib/invitations/types.ts` | Invitation type/status key alignment review. |
| `lib/invitations/token.ts` | Token generation, hashing, URL, and expiry policy alignment review. |

## 3. Additive-Only Review

| Check | Result | Evidence | Risk | Action |
| --- | --- | --- | --- | --- |
| Uses additive table creation | Pass | Uses `CREATE TABLE IF NOT EXISTS` for `invitations`, `invitation_tokens`, and `invitation_redemptions`. | Low | No change required. |
| Uses additive indexes | Pass | Uses `CREATE INDEX IF NOT EXISTS` only. | Low | No change required. |
| Existing tables untouched | Pass | No legacy signup, referral, or member referral table is altered or removed. | Low | No change required. |
| No hidden destructive schema operation | Pass | No executable `DROP`, `DELETE`, `UPDATE`, `INSERT`, or `ALTER TABLE` statements were found. | Low | No change required. |
| Production DB not applied by this task | Pass | Review-only task; no Supabase apply command executed. | Low | Apply remains manual/explicit after conditions. |

## 4. SQL Safety Findings

`012_invitation_core.sql` is additive-only within the reviewed scope.

Confirmed safe properties:

- No `DROP` statements.
- No `DELETE` statements.
- No `UPDATE` statements.
- No `INSERT` statements.
- No `ALTER TABLE` statements.
- No data backfill.
- No existing table rename.
- No existing table or column removal.
- No RLS policy creation or mutation.
- No SECURITY DEFINER helper.

The migration includes `ON DELETE` foreign-key behavior clauses, but those are constraint definitions inside new table creation, not executable `DELETE` statements.

## 5. Token / Privacy Review

| Check | Result | Evidence | Risk | Action |
| --- | --- | --- | --- | --- |
| Raw token storage column absent | Pass | No `token` raw-value column is defined. | Low | Keep raw token in URL/runtime only. |
| `token_hash` stored only in token table | Pass | `token_hash` exists only on `public.invitation_tokens`. | Low | Queries/actions must persist only hashes. |
| Raw token warning comments included | Pass | Table and column comments state raw tokens must never be stored, logged, or exposed. | Low | Keep this rule in Task 07 actions. |
| `invited_email` / `redeemed_email` are PII-adjacent | Conditional | Columns exist for invitation boundary and redemption audit. | Medium | Future RLS/actions must restrict email access to authorized Admin/System workflows. |
| Supplier invitation does not grant Buyer PII | Pass by schema | No Buyer email/phone/contact projection is added. | Low | Task 07 must preserve this. |

Token helper alignment:

- `generateInvitationToken()` creates a 256-bit URL-safe token.
- `hashInvitationToken()` hashes the raw token with SHA-256.
- `verifyInvitationToken()` compares hashes using timing-safe comparison.
- `buildInvitationUrl()` passes the raw token through an invitation URL parameter only.
- `getDefaultInvitationExpiry()` aligns with 7-day default, 30-day admin invite, and temporary 180-day Student Professor invite policy.

## 6. Source of Truth Alignment

The migration aligns with the current Task 05 SQL authoring instruction and the Invitation Engine security policy:

- Supplier / Agent / Buyer / Professor / Student invitation types match `lib/invitations/types.ts`.
- Invitation status values match `lib/invitations/types.ts`.
- QR image storage is excluded.
- Existing `referral_codes`, `referral_relations`, `member_referral_codes`, and `member_referral_signups` are preserved.
- RLS and SECURITY DEFINER helpers are deferred.

Document alignment condition:

- `docs/09-sprints/13-sprint-2-invitation-migration-spec.md` still contains older candidate text that references `invitations.token_hash` and an `invitations(token_hash)` index.
- The actual SQL follows the later Task 05 decision: `token_hash` is stored only in `invitation_tokens`.
- This does not make the SQL unsafe, but the spec should be corrected before the next Source of Truth freeze or before broader team handoff.

## 7. Existing Flow Compatibility

| Existing Flow / Table | Review Result | Notes |
| --- | --- | --- |
| Existing signup/auth flow | Compatible | The migration does not modify existing auth/signup tables or actions. |
| `referral_codes` | Compatible | Explicitly preserved as Buyer-Buyer referral. |
| `referral_relations` | Compatible | Explicitly preserved and not reused as Agent-Buyer authority. |
| `member_referral_codes` | Compatible | Preserved as legacy invite-like structure. |
| `member_referral_signups` | Compatible | Preserved as legacy invite-like structure. |
| QR flow | Compatible | No QR table is created; QR remains URL-based generation. |

## 8. RLS / Policy / SECURITY DEFINER Review

| Check | Result | Evidence | Risk | Action |
| --- | --- | --- | --- | --- |
| No RLS enablement | Pass | No `ENABLE ROW LEVEL SECURITY` statement. | Medium after production apply | Apply as inert schema only until policy migration is reviewed. |
| No policies | Pass | No `CREATE POLICY` statement. | Medium after production apply | Task 07 must not rely on DB-level protection until RLS exists. |
| No SECURITY DEFINER helper | Pass | No function or SECURITY DEFINER statement. | Low | RLS helper scope remains separate. |
| No service-role dependency introduced | Pass | SQL creates schema only. | Low | Application actions must not add fallback later. |

RLS remains a required follow-up before public/authenticated production access to invitation records.

## 9. Comments / Rollback Guide Review

The migration includes sufficient comments for a table-only production apply review:

- purpose and non-goals
- raw token storage prohibition
- RLS deferral
- SECURITY DEFINER deferral
- legacy referral compatibility
- QR URL-only decision
- rollback guidance

Rollback guidance is acceptable for this additive-only stage:

- Prefer disabling application references first.
- Prefer application rollback before destructive database rollback.
- Table removal requires backup, dependency review, and explicit owner approval.

Condition:

- If production apply is approved before RLS is ready, the team must ensure no production code path exposes these tables broadly.

## 10. Production Apply Conditions

Conclusion is conditional, not unconditional.

Before applying `012_invitation_core.sql` to production:

1. Confirm production backup / snapshot discipline.
2. Confirm Supabase migration metadata alignment.
3. Confirm `gen_random_uuid()` dependency is already available in the project or is covered by an earlier migration.
4. Confirm the migration is applied as schema-only and not paired with public UI/signup writes in the same release.
5. Confirm no application code reads or writes invitation rows before Task 07 authorization and validation rules are reviewed.
6. Confirm RLS helper/policy migration remains scheduled before broad user-facing access.
7. Correct or supersede the residual `invitations.token_hash` language in the migration spec before the next Source of Truth freeze.
8. Confirm `invited_email` and `redeemed_email` are treated as restricted operational data in future policies and queries.

## 11. Task 07 Queries / Actions Readiness

Task 07 Queries / Actions can start with conditions.

Allowed Task 07 scope:

- server-only invitation query/action contract design
- token hash lookup using `invitation_tokens.token_hash`
- invitation creation that stores only token hashes
- generic invalid/expired token responses
- feature flag checks
- parent-context validation for Buyer Agent and Student Professor invites
- no service role fallback
- no raw token logging
- no Supplier access to Buyer PII

Blocked in Task 07 unless separately approved:

- production DB apply
- public signup UI wiring
- broad Admin UI redesign
- RLS SQL / policy authoring
- SECURITY DEFINER helpers
- email sending automation
- QR image persistence
- legacy referral migration/backfill

## 12. Review Conclusion

Conclusion: Ready to Apply with Conditions

`012_invitation_core.sql` is safe as an additive-only schema migration candidate, but production apply must remain gated by the conditions above. The main non-SQL issue is Source of Truth cleanup: the migration spec still contains older `invitations.token_hash` candidate text while the actual migration correctly stores `token_hash` only in `invitation_tokens`.

## 13. Codex Notes

- Do not apply this migration to production from this review.
- Do not modify `012_invitation_core.sql` as part of this review.
- Do not start public invitation/signup UI until Task 07 actions define authorization and token handling.
- Do not expose invitation email fields outside authorized Admin/System flows.
- Do not treat invitation tables as user-safe until RLS policy design and migration are reviewed.

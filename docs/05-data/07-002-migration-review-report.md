# 002 Migration Review Report

## 1. Purpose

This report reviews `supabase/migrations/002_role_compatibility.sql` before any production apply.

It checks whether the migration is safe against the current Source of Truth, ERD v1, RLS Design v1, and 002 readiness resolution.

This report does not modify SQL migration files, Supabase DB, application code, or UI.

## 2. Review Scope

| Reviewed File | Purpose | Review Result |
| --- | --- | --- |
| `supabase/migrations/001_snapshot_baseline.sql` | Baseline marker before structural migrations | Valid baseline marker; comment-only/no-op. |
| `supabase/migrations/002_role_compatibility.sql` | Additive role compatibility migration | Safe to apply only after required production conditions are satisfied. |
| `docs/05-data/06-002-readiness-resolution.md` | Preconditions and decisions before 002 authoring/apply | 002 matches authoring scope; production apply remains conditional. |
| `docs/05-data/05-sql-migration-pack-spec-v1.md` | Migration pack rules and file-level intent | 002 follows additive-first and legacy preservation rules. |
| `docs/05-data/01-erd-v1.md` | Target logical ERD | 002 is compatible as a compatibility step, but uses text role keys instead of final role foreign keys. |
| `docs/05-data/02-rls-design-v1.md` | Target RLS design | 002 defers RLS helpers and policies as required. |

## 3. Executive Summary

Conclusion: **Ready to Apply with Conditions**.

`002_role_compatibility.sql` is additive-only and does not contain destructive SQL, data mutation, RLS policy mutation, helper function creation, or `SECURITY DEFINER` changes.

Production apply is still conditional because the readiness document requires backup/snapshot evidence, Supabase migration metadata alignment, and pre-apply validation before any structural migration is run against production.

## 4. Additive-Only Review

| Check | Result | Evidence |
| --- | --- | --- |
| Creates only new target tables | Pass | Creates `public.account_roles` and `public.role_applications` with `create table if not exists`. |
| Adds only indexes for new tables | Pass | Creates indexes on `account_roles` and `role_applications` with `create index if not exists`. |
| Preserves legacy structures | Pass | Does not drop or rename `profiles.member_type_id`, `profile_roles`, or `member_types`. |
| Adds only legacy comments to existing items | Pass | Uses `comment on column public.profiles.member_type_id`, `comment on table public.profile_roles`, and `comment on table public.member_types`. |
| No backfill | Pass | Migration states that no data backfill is performed. |
| No runtime authority switch | Pass | Migration comments state that `account_roles` is not the sole runtime permission authority until later helper/RLS migration. |

Reviewed executable SQL categories:

| Category | Present? | Notes |
| --- | --- | --- |
| `CREATE TABLE IF NOT EXISTS` | Yes | Allowed by 002 scope. |
| `CREATE INDEX IF NOT EXISTS` | Yes | Allowed by 002 scope. |
| `COMMENT ON` | Yes | Allowed for documentation and legacy marking. |
| `BEGIN` / `COMMIT` | Yes | Transaction wrapper only. |
| `ALTER TABLE ADD COLUMN IF NOT EXISTS` | No | Not needed. |
| Destructive DDL | No | None found. |

## 5. Destructive / Data Mutation Review

The migration was checked for forbidden mutation categories.

| Forbidden Category | Found? | Result |
| --- | --- | --- |
| `DROP` | No | Pass |
| `DELETE` | No | Pass |
| `UPDATE` | No | Pass |
| `INSERT` | No | Pass |
| Table rename | No | Pass |
| Column drop | No | Pass |
| Existing table structural alteration | No | Pass |
| Data backfill | No | Pass |

Important note: comments mention rollback and legacy behavior, but there is no executable destructive or data-mutating SQL.

## 6. RLS / Function / Security Definer Review

| Check | Result | Evidence |
| --- | --- | --- |
| No RLS policy creation | Pass | No `create policy` statement. |
| No RLS policy mutation | Pass | No `alter policy` statement. |
| No RLS enable/disable | Pass | No `enable row level security` or `disable row level security`. |
| No helper function creation | Pass | No `create function` or `create or replace function`. |
| No `SECURITY DEFINER` helper | Pass | No executable function body or security definer declaration. |
| RLS deferred to later migration | Pass | Comments defer helpers to `009_rls_helpers.sql` and policies to `010_rls_policies.sql`. |

This is consistent with RLS Design v1, which requires `account_roles`-based helpers before broad policy migration and states that `member_type_id` must not be the final RLS authority.

## 7. Legacy Field Review

| Legacy Item | 002 Action | Review Result |
| --- | --- | --- |
| `profiles.member_type_id` | Adds legacy comment only | Pass |
| `profile_roles` | Adds compatibility comment only | Pass |
| `member_types` | Adds compatibility comment only | Pass |

`profiles.member_type_id` is not deleted, renamed, converted, or used as the new permission authority.

This aligns with the P0 decision that `profiles.member_type_id` remains a legacy compatibility field and that `account_roles` is the new permission model target after later migration steps.

## 8. ERD Compatibility Review

| ERD Target | 002 Implementation | Compatibility |
| --- | --- | --- |
| `account_roles` | Created with `account_id`, `role_key`, status, approval metadata, timestamps, and soft delete | Compatible as an additive compatibility version. |
| `role_applications` | Created with `account_id`, `requested_role_key`, status, review metadata, timestamps, and soft delete | Compatible as an additive compatibility version. |
| `profiles.member_type_id` deprecated | Preserved with legacy comment | Compatible. |
| `profile_roles` replace candidate | Preserved with compatibility comment | Compatible. |
| Final `role_id -> roles.id` relation | Deferred; 002 uses `role_key text` | Acceptable for compatibility, but must be reconciled before final RLS authority switch. |
| Final `role_status` naming | 002 uses `status` | Acceptable for compatibility, but later helper/RLS logic must map expected active states explicitly. |
| Audit requirement for role changes | Not implemented in 002 | Acceptable because 002 has no app writes and no authority switch. Later role write paths must audit. |

The main intentional deviation from ERD v1 is that 002 uses `role_key text` and `requested_role_key text` instead of `role_id` foreign keys. This is acceptable for a compatibility migration because the readiness resolution allowed conservative text keys and deferred enum/final mapping.

## 9. RLS Design Compatibility Review

| RLS Design Requirement | 002 Status | Review |
| --- | --- | --- |
| `account_roles` is target role authority | Structure introduced | Compatible, but not active authority yet. |
| `member_type_id` not final authority | Legacy comment added | Compatible. |
| Owner can read own roles; Admin manages | Not implemented | Correctly deferred to `010_rls_policies.sql`. |
| `has_role` / `has_account_role` helpers | Not implemented | Correctly deferred to `009_rls_helpers.sql`. |
| Pending/revoked/deleted roles must not grant access | Commented as helper requirement | Needs enforcement in `009` and `010`. |
| RLS testing required before policy migration | Not part of 002 | Correctly deferred. |

No conflict with RLS Design v1 was found, provided production operators treat 002 as structure-only and do not refactor application authorization to depend on it before `009` and `010`.

## 10. Production Apply Conditions

Production apply is not allowed until the following conditions are satisfied.

| Condition | Required Before Apply? | Status |
| --- | --- | --- |
| Production backup/snapshot confirmed | Yes | Not evidenced in this report. |
| Supabase migration metadata alignment resolved | Yes | Not evidenced in this report. |
| Project linked to correct Supabase project `ysonocyrvvskdajmpdmu` | Yes | Must be confirmed by operator before apply. |
| Pre-apply schema diff reviewed | Yes | Required before apply. |
| 002 SQL reviewed for destructive changes | Yes | Completed by this report. |
| Rollback path reviewed | Yes | Present but operational backup evidence is still required. |
| No production apply in same authoring task | Yes | Satisfied; 002 was only committed/pushed. |
| RLS helper scope confirmed before helper migration | Not blocking 002 apply | Required before `009`. |

Required apply gate:

```text
Do not apply 002 to production until backup/snapshot evidence and migration metadata alignment evidence are recorded.
```

## 11. Rollback Guide Review

The rollback guide in `002_role_compatibility.sql` is sufficient for the current additive-only scope.

| Rollback Area | Review |
| --- | --- |
| Before production use | Application references can be disabled because no runtime authority switch is included. |
| After production use | App rollback / usage disable is preferred before destructive table removal. |
| Table removal | Correctly requires backup, dependency review, and explicit owner approval. |
| Legacy fallback | Correctly says not to restore `profiles.member_type_id` as new-code permission authority. |

Remaining operational requirement:

- A real production rollback still depends on backup/snapshot evidence.
- If application code later writes to `account_roles` or `role_applications`, rollback must include data preservation/export planning.

## 12. Risk Findings

| Risk ID | Risk | Priority | Status | Required Action |
| --- | --- | --- | --- | --- |
| R-002-001 | Production apply without verified backup/snapshot | P1 High | Open | Confirm backup/snapshot before apply. |
| R-002-002 | Production apply while migration metadata remains unaligned | P1 High | Open | Resolve Supabase migration metadata alignment before apply. |
| R-002-003 | Application authorization switches to `account_roles` before helpers/RLS | P1 High | Open | Do not refactor permission checks until `009`, `010`, and validation are complete. |
| R-002-004 | `status` and `role_key` compatibility shape diverges from final ERD naming | P2 Medium | Accepted | Map or refine during later role authority migration. |
| R-002-005 | No RLS policy on new tables until 010 | P2 Medium | Accepted | Do not expose or use these tables in app flows before policies are applied. |

No P0 Critical issue was found in the 002 SQL itself.

## 13. 003 Brokerage Core Readiness

Decision: `003_brokerage_core.sql` can be authored next, but production apply must remain gated by the same backup and migration metadata conditions.

| Question | Answer |
| --- | --- |
| Can 003 authoring start? | Yes, with additive-only scope. |
| Can 003 be applied to production immediately? | Not until production backup/snapshot and migration metadata alignment are resolved. |
| Does 003 require conversation audit first? | Not strictly for additive table authoring; recommended before apply and required before `004` classification/backfill. |
| Must 003 avoid `brokerage_case_messages`? | Yes. MVP reuses `conversations/messages`. |
| Must 003 include Direct Contact Release case-level model? | Yes, per P0 decision and Communication Brokerage Security Design. |

Recommended next migration authoring scope:

- `brokerage_cases`
- `brokerage_case_participants`
- `contact_release_approvals`
- no message storage split
- no Supplier-Buyer direct communication enablement
- no RLS policy/function creation yet

## 14. Final Decision

Final decision: **Ready to Apply with Conditions**.

The SQL file is safe enough for production apply only after operational conditions are met:

1. Production backup/snapshot evidence exists.
2. Supabase migration metadata alignment is resolved.
3. Pre-apply schema diff is reviewed.
4. Operator confirms target project `ysonocyrvvskdajmpdmu`.
5. No application authorization is switched to `account_roles` before `009` and `010`.

Until those conditions are satisfied, keep 002 committed in GitHub but do not apply it to production.

## 15. Verification Result

| Verification | Result |
| --- | --- |
| `git diff --check` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| Forbidden SQL scan | No forbidden executable `DROP`, `DELETE`, `UPDATE`, `INSERT`, `CREATE POLICY`, `CREATE FUNCTION`, `CREATE VIEW`, `GRANT`, `REVOKE`, or `SECURITY DEFINER` pattern found in `002_role_compatibility.sql`. |

## 16. Next Recommended Action

1. Confirm production backup/snapshot and migration metadata alignment before applying 002.
2. If the user approves production apply later, run a pre-apply schema diff and apply only 002.
3. Start `003_brokerage_core.sql` authoring as additive-only documentation-backed migration work.
4. Do not begin `004_conversation_compatibility.sql` classification/backfill until existing conversation audit is complete.

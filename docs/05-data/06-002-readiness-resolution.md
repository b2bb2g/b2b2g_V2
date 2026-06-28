# 002 Migration Readiness Resolution

## 1. Purpose

This document resolves the remaining readiness conditions before authoring `002_role_compatibility.sql`.

It does not write SQL migration files, modify Supabase DB, update application code, change UI, or repair migration metadata.

## 2. Decision Summary

| Decision Area | Final Decision | Applies To | Status |
| --- | --- | --- | --- |
| Production backup/snapshot | Required before applying any structural migration to production. Authoring `002` can begin after this procedure is documented. | `002` apply and all later applies | Finalized |
| Existing conversation audit | Read-only audit method is finalized. It does not block `002` authoring because `002` is role-only, but it blocks `004` and `010`. | `004`, `010`; not `002` authoring | Finalized |
| Buyer PII projection final view name | Use `buyer_masked_profiles` as the final MVP view name. | `005`, Supplier-facing queries/RLS | Finalized |
| Supabase migration metadata alignment | Separate pre-apply task using Supabase CLI or approved equivalent; do not repair inside `002`. | Before applying `002` to production | Finalized |
| Security definer helper scope | `002` must not introduce `SECURITY DEFINER` helpers. Role RLS helpers are deferred to `009_rls_helpers.sql`. | `002`, `009`, `010` | Finalized |
| `002_role_compatibility.sql` readiness | SQL authoring may start under additive-only constraints. Production apply remains blocked until backup and migration metadata evidence are complete. | `002` authoring/apply | Ready with Conditions |

Overall conclusion: **Ready with Conditions**.

## 3. Production Backup / Snapshot Procedure

### Final Procedure

Before applying `002_role_compatibility.sql` or any later structural migration to production, the project must capture a production baseline snapshot.

Required snapshot items:

| Snapshot Item | Required Evidence |
| --- | --- |
| Project identity | Supabase project ref `ysonocyrvvskdajmpdmu` and project URL recorded. |
| Schema snapshot | Full schema dump or equivalent Supabase CLI/database dump output stored outside the database. |
| Data snapshot | Production data backup, Supabase backup point, or `pg_dump` data backup available for recovery. |
| RLS baseline | Current public table count, RLS-enabled count, policy count, and helper function count recorded. |
| Migration metadata baseline | Current migration metadata state recorded before any repair or apply action. |
| Restore plan | Restore path documented with responsible operator and rollback trigger. |

Recommended command class:

- Supabase CLI backup/dump workflow, or
- direct PostgreSQL `pg_dump` workflow using a secure connection string outside git, or
- Supabase platform backup/restore point if available for the project tier.

Operational rules:

- Do not commit backup files, credentials, or connection strings.
- Do not print Supabase service role keys or database passwords.
- Store backup evidence outside the repository or in a redacted internal operations note.
- If backup cannot be verified, do not apply `002` to production.

### Authoring vs Applying

| Activity | Backup Required First? | Decision |
| --- | --- | --- |
| Author `002_role_compatibility.sql` locally | No | Allowed after this document. |
| Commit/push `002_role_compatibility.sql` | No | Allowed if SQL remains additive and reviewed. |
| Apply `002_role_compatibility.sql` to production | Yes | Blocked until backup evidence exists. |
| Run destructive SQL | Not allowed | Out of scope for `002`. |

## 4. Existing Conversation Audit Method

### Final Method

The existing conversation audit is a read-only audit used to identify whether current `conversations`, `conversation_members`, and `messages` contain patterns that violate the Admin Brokerage policy.

Audit goals:

| Audit Goal | Rule |
| --- | --- |
| Identify Supplier+Buyer-only conversations | Mark as blocked/archive candidates unless valid brokerage/release evidence exists. |
| Identify unknown conversation types | Do not auto-classify. Queue for manual review. |
| Identify direct Supplier-Buyer message history | Preserve history, but block future send unless brokerage/release is valid. |
| Identify Agent-Buyer conversations | Valid only if Agent-Buyer subordinate relationship exists. |
| Identify Professor-Student conversations | Valid only if Professor-Student subordinate relationship exists. |

Audit output should be a read-only report containing:

- conversation id;
- current conversation type/status;
- participant account ids and derived role categories;
- whether Supplier and Buyer are both present;
- whether an Admin participant or Admin ownership exists;
- whether brokerage case evidence exists;
- whether direct contact release evidence exists;
- recommended classification: `agent_buyer`, `professor_student`, `admin_user`, `brokerage_case`, `direct_contact_released`, `system_notice`, `blocked_candidate`, or `manual_review`.

### Blocking Impact

| Migration | Conversation Audit Required Before Authoring? | Required Before Applying? | Decision |
| --- | --- | --- | --- |
| `002_role_compatibility.sql` | No | No | Role compatibility does not modify communication tables. |
| `003_brokerage_core.sql` | No | Recommended | Brokerage core tables can be additive, but audit informs later linkage. |
| `004_conversation_compatibility.sql` | Yes | Yes | Audit is required before backfill/classification. |
| `009_rls_helpers.sql` | Partial | Yes for `can_send_message` validation | Fixtures require audit-informed cases. |
| `010_rls_policies.sql` | Yes | Yes | Enforcing messaging policies without audit risks locking or misclassifying records. |

## 5. Buyer PII Projection Final View Name

### Final Decision

The MVP final view name for Supplier-safe Buyer projection is:

```text
buyer_masked_profiles
```

### View Purpose

`buyer_masked_profiles` is the default Supplier-safe and brokered-safe projection for Buyer summary data.

It must not expose:

- Buyer email;
- Buyer phone;
- Buyer contact person name;
- admin memo;
- internal audit log fields;
- raw inquiry private notes;
- raw analytics payload containing PII.

Allowed field categories:

| Category | Rule |
| --- | --- |
| Buyer id / reference id | Allowed only if needed for case-safe linking and not useful for direct contact. |
| Country / region | Allowed as non-PII sourcing context. |
| Industry / category | Allowed as non-PII sourcing context. |
| Company type / buyer type | Allowed as masked summary. |
| Request summary | Allowed if approved/brokered and stripped of PII. |
| Contact release state | Allowed as masked state only; no raw email/phone/contact person. |

### Full PII Access

Full Buyer PII must remain available only through restricted Admin/Brokerage/Owner paths controlled by `can_view_buyer_pii`.

`buyer_masked_profiles` does not replace full Admin operational access. It is the Supplier-facing safe projection.

### Impact on `002`

This decision does not require SQL in `002_role_compatibility.sql`.

It resolves the naming blocker for `005_buyer_pii_projection.sql`.

## 6. Supabase Migration Metadata Alignment Handling

### Final Decision

Migration metadata alignment is a separate pre-apply task. It must not be repaired inside `002_role_compatibility.sql`.

The prior health audit found:

- local migration files: `27`;
- remote public tables: `62`;
- local public tables declared by migrations: `62`;
- standard `supabase_migrations.schema_migrations`: not found.

### Required Handling

Before applying `002` to production:

1. Install and authenticate Supabase CLI or use an approved equivalent management workflow.
2. Link the local project to Supabase project `ysonocyrvvskdajmpdmu`.
3. Run migration list/status against the target project.
4. Compare local migration files with remote schema state.
5. If metadata is missing, prepare a migration repair plan that marks existing migrations as applied only after schema equivalence is verified.
6. Record the repair/list evidence in an operations note or follow-up readiness document.

### Forbidden Handling

- Do not create or modify `supabase_migrations` metadata inside `002_role_compatibility.sql`.
- Do not apply schema-changing migrations before alignment is resolved.
- Do not use Supabase Dashboard SQL editor for untracked schema changes.
- Do not repair migration history without a verified schema baseline and backup.

## 7. Security Definer Helper Scope

### Final Decision for `002`

`002_role_compatibility.sql` must not create `SECURITY DEFINER` helper functions.

Allowed in `002`:

- additive tables;
- additive indexes;
- additive constraints;
- comments;
- optional compatibility view if it does not bypass RLS or expose PII;
- optional idempotent role backfill only after backup and metadata alignment are complete.

Not allowed in `002`:

- `SECURITY DEFINER` helpers;
- broad authorization helpers;
- RLS policy rewrites;
- changes to existing helper functions;
- service role fallback paths;
- direct Buyer PII access helpers.

### Scope for Later Helpers

The following helper functions remain design candidates for `009_rls_helpers.sql`, not `002`:

| Helper | Security Scope Decision |
| --- | --- |
| `is_admin` | Candidate for `SECURITY DEFINER`; must use active `account_roles`. |
| `has_role` | Candidate for `SECURITY DEFINER`; must ignore pending/revoked/deleted roles. |
| `has_account_role` | Candidate for `SECURITY DEFINER`; may replace or alias `has_role` after naming review. |
| `can_send_message` | Candidate for `SECURITY DEFINER`; requires conversation audit and brokerage/release tables first. |
| `can_view_buyer_pii` | Candidate for `SECURITY DEFINER`; must return false for Supplier by default. |
| `can_view_student_pii` | Candidate for `SECURITY DEFINER`; must enforce Professor-subordinate relation. |

Global helper rules for `009`:

- fixed `search_path`;
- boolean return only for access helpers;
- no returned PII;
- no recursion through policies that call the same helper;
- explicit handling for revoked, expired, inactive, suspended, and soft-deleted relations;
- function grants limited to required execution roles.

## 8. `002_role_compatibility.sql` Authoring Scope

`002_role_compatibility.sql` may be authored with this scope:

| Area | Allowed? | Rule |
| --- | --- | --- |
| Create `account_roles` | Yes | Additive only; do not remove `profile_roles`. |
| Create `role_applications` | Yes | Additive only. |
| Add indexes for new tables | Yes | Non-destructive. |
| Add unique constraints on new tables | Yes | Only on new tables or safe partial constraints. |
| Add comments | Yes | Recommended for legacy compatibility. |
| Mark `profiles.member_type_id` as legacy | Documentation/comment only | Do not alter/drop the column in `002`. |
| Drop `profiles.member_type_id` | No | Forbidden. |
| Drop `profile_roles` | No | Forbidden. |
| Drop `member_types` | No | Forbidden. |
| Rewrite existing RLS policies | No | Deferred to `010`. |
| Create RLS helpers | No | Deferred to `009`. |
| Backfill `account_roles` from `profile_roles` | Conditional | Only after backup and migration metadata alignment evidence. |
| Backfill `account_roles` from `profiles.member_type_id` | Conditional | Only after role mapping review, backup, and metadata alignment evidence. |

### Role Mapping Rules

If `002` includes a backfill section in a later reviewed version, it must follow these rules:

| Source | Target | Rule |
| --- | --- | --- |
| `profile_roles.profile_id` | `account_roles.account_id` | Direct mapping. |
| `profile_roles.role_id` | `account_roles.role_id` | Direct mapping. |
| `profile_roles.created_at` | `account_roles.created_at` or metadata | Preserve if possible. |
| `profiles.member_type_id` | Role matching `member_types.code = roles.code` | Legacy fallback only. |
| `member_types` | Display/legacy source | Not permission authority. |
| Unknown member type | Manual review | Do not auto-grant role. |
| inactive/deleted role/member type | No active grant | Do not create active `account_roles`. |

Target `account_roles` should include enough state for:

- `role_status`;
- `approved_at`;
- `approved_by_account_id`;
- `revoked_at`;
- `deleted_at`;
- active partial uniqueness by `account_id + role_id`.

## 9. Application and RLS Impact Boundary

`002` is a compatibility migration, not an authority switch.

After `002` is authored:

- application code must not be refactored automatically;
- existing RLS policies must not be rewritten automatically;
- `profile_roles` and `member_types` remain available for compatibility;
- `profiles.member_type_id` remains present;
- final permission authority will switch only after `009` helpers, `010` policies, and validation tests.

The first safe milestone after `002` is:

1. new role compatibility structures exist;
2. legacy structures remain intact;
3. no RLS behavior changes yet;
4. no user-facing behavior changes yet;
5. validation confirms old flows still work.

## 10. Readiness Decision

Conclusion: **Ready with Conditions**.

`002_role_compatibility.sql` authoring can start after this document, under the following constraints:

- additive-only SQL;
- no destructive change;
- no RLS policy mutation;
- no `SECURITY DEFINER` helper;
- no Supabase migration metadata repair;
- no application or UI changes;
- no immediate authority switch from `profile_roles` / `member_type_id` to `account_roles`;
- no production apply until backup/snapshot and migration metadata alignment evidence exist.

Production application of `002` is not ready until:

- production backup/snapshot is confirmed;
- Supabase migration metadata alignment is resolved;
- final SQL is reviewed for no hidden destructive change;
- rollback note is included in the migration file;
- validation checklist for role compatibility is prepared.

## 11. Required Evidence Before Applying `002`

| Evidence | Required Before Authoring | Required Before Production Apply |
| --- | --- | --- |
| This readiness resolution committed | Yes | Yes |
| `001_snapshot_baseline.sql` committed | Yes | Yes |
| Backup/snapshot evidence | No | Yes |
| Migration metadata alignment evidence | No | Yes |
| Role mapping review | Yes for backfill SQL; No for table-only SQL | Yes |
| Rollback note in `002` | Yes | Yes |
| `git diff --check` | Yes | Yes |
| `npm run typecheck` | Yes | Yes |
| `npm run lint` | Yes | Yes |
| Supabase schema diff | Recommended | Yes |

## 12. Next Recommended Action

Next action:

1. Author `supabase/migrations/002_role_compatibility.sql`.
2. Keep the first version additive and table/index/comment focused.
3. Do not include production backfill unless backup and metadata alignment are complete.
4. Do not apply to production in the same task unless explicitly approved and evidence is available.
5. After `002` authoring, run:
   - `git diff --check`;
   - `npm run typecheck`;
   - `npm run lint`;
   - schema review / diff check before any remote apply.

Follow-up actions before later migration files:

- Run existing conversation audit before `004`.
- Implement `buyer_masked_profiles` in `005`.
- Review security definer helper scope before `009`.
- Run role-based RLS regression before and after `010`.

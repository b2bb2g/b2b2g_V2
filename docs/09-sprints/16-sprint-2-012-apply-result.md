# Sprint 2 012 Apply Result

## 1. Purpose

This document records the production apply attempt and verification result for:

- `supabase/migrations/012_invitation_core.sql`

Scope constraints followed:

- No code change.
- No UI change.
- No additional DB migration authoring.
- No RLS policy authoring.
- No SECURITY DEFINER authoring.
- No data backfill.
- No migration other than `012_invitation_core.sql` was applied.

## 2. Target Project

| Item | Value |
| --- | --- |
| Supabase project ref | `ysonocyrvvskdajmpdmu` |
| Public project URL | `https://ysonocyrvvskdajmpdmu.supabase.co` |
| Migration file | `supabase/migrations/012_invitation_core.sql` |
| Apply date | 2026-06-29 |

Secrets, database URLs, service role keys, and raw invitation tokens are not recorded in this document.

## 3. Pre-Apply Checks

| Check | Result | Notes |
| --- | --- | --- |
| Git worktree clean before work | Pass | `main...origin/main` before execution. |
| Supabase CLI available | Pass | CLI version `2.108.0`. |
| `psql` available | Not available | Local `psql` command was not installed. |
| DB connection available | Pass | Remote query succeeded through the configured DB URL. |
| Target tables absent | Not absent | `public.invitations`, `public.invitation_tokens`, and `public.invitation_redemptions` already existed before final apply. |
| `gen_random_uuid()` available | Pass | Remote query returned `true`. |
| Migration metadata state | No metadata table found | `supabase_migrations.schema_migrations` did not exist in the production DB. |
| 012 destructive SQL recheck | Pass | No executable `DROP`, `DELETE`, `UPDATE`, `INSERT`, or `ALTER TABLE` statement found. |
| RLS / policy / SECURITY DEFINER recheck | Pass | 012 contains no `CREATE POLICY`, RLS mutation, function, or SECURITY DEFINER statement. |

Important pre-apply finding:

- The target Invitation Engine tables already existed before this task.
- Their columns, constraints, and indexes matched the intended `012_invitation_core.sql` structure.
- The final apply therefore behaved as an idempotent re-run of the 012 migration file.

## 4. Backup / Snapshot Check

Backup/snapshot check result:

| Method | Result | Notes |
| --- | --- | --- |
| `supabase db dump --db-url ... --schema public --file /tmp/...` | Failed | Supabase CLI attempted to use Docker and failed because Docker Desktop is required in this environment. |
| Supabase dashboard/hosted automated backup | Not verified from CLI | This task did not access the Supabase dashboard backup UI. |
| Schema introspection before apply | Completed | Target table, constraint, index, RLS, policy, and referral table state were queried before final apply. |

Risk note:

- No local schema dump file was produced by this task.
- Because the target tables already existed and `012_invitation_core.sql` is additive/idempotent, the final apply was limited to the reviewed 012 SQL file.
- Future non-idempotent or destructive migrations must not proceed without confirmed production backup/snapshot.

## 5. Apply Execution

Execution summary:

| Attempt | Tool | Result | Notes |
| --- | --- | --- | --- |
| 1 | `supabase db query --file supabase/migrations/012_invitation_core.sql` | Failed | Supabase CLI connected but rejected the multi-statement SQL with `cannot insert multiple commands into a prepared statement`. No successful apply was recorded from this attempt. |
| 2 | Node `pg` client using configured production DB URL | Success | Executed the exact `012_invitation_core.sql` file. Result contained 38 statement results and ended with `COMMIT`. |

Final apply result:

```text
apply_status=success
statement_results=38
last_command=COMMIT
```

No `supabase db push` was used, because this repository contains many other migration files and the task explicitly prohibited applying anything beyond `012_invitation_core.sql`.

## 6. Post-Apply Verification

### 6.1 Target Tables

| Table | Exists After Apply |
| --- | --- |
| `public.invitations` | Yes |
| `public.invitation_tokens` | Yes |
| `public.invitation_redemptions` | Yes |

### 6.2 Token Columns

Token-related columns after apply:

| Table | Token-related Column |
| --- | --- |
| `public.invitation_tokens` | `token_hash` |
| `public.invitation_redemptions` | `token_id` |

Raw token column check:

| Check | Result |
| --- | --- |
| `token` column | Not found |
| `raw_token` column | Not found |
| `invitation_token` raw-value column | Not found |
| `token_value` column | Not found |

Result:

- Raw invitation token storage is not present.
- The only persisted token value is `public.invitation_tokens.token_hash`.

### 6.3 Unique Constraint

| Constraint | Table | Result |
| --- | --- | --- |
| `invitation_tokens_token_hash_unique` | `public.invitation_tokens` | Exists, `UNIQUE (token_hash)`. |

### 6.4 RLS / Policy State

| Table | RLS Enabled | Policies Found |
| --- | --- | --- |
| `public.invitations` | Yes | None |
| `public.invitation_tokens` | Yes | None |
| `public.invitation_redemptions` | Yes | None |

Notes:

- `012_invitation_core.sql` did not create RLS policies.
- Production currently has RLS enabled on the three invitation tables, but `pg_policies` returned no policies for them.
- Query/action implementation must not assume these tables are user-accessible until RLS policy design is completed and reviewed.

### 6.5 Existing Referral / Member Referral Tables

The following legacy/referral tables existed after apply:

- `public.referral_codes`
- `public.referral_relations`
- `public.member_referral_codes`
- `public.member_referral_signups`

No change to these tables was performed by `012_invitation_core.sql`.

## 7. Migration Metadata Result

Migration metadata check:

| Check | Result |
| --- | --- |
| `supabase_migrations.schema_migrations` exists | No |

Result:

- The production DB did not expose `supabase_migrations.schema_migrations` during this task.
- Because 012 was applied directly with `pg`, no Supabase migration metadata row was inserted.
- Migration metadata alignment remains a follow-up operational issue.

## 8. Risk / Follow-Up

| Risk | Priority | Required Follow-Up |
| --- | --- | --- |
| Target tables existed before this task | Info | Treat this task as a verified/idempotent 012 apply and record current state. |
| CLI schema dump failed due Docker dependency | P1 | Confirm Supabase dashboard automated backup or install required local tooling before future non-idempotent migrations. |
| Supabase migration metadata table absent | P1 | Decide metadata alignment strategy before using `supabase db push` or automated migration workflows. |
| RLS policies absent | P1 | Do not expose invitation query/action to users until RLS policy design and tests are ready. |
| Invitation email fields are PII-adjacent | P1 | Restrict `invited_email` and `redeemed_email` through server actions and future RLS. |

## 9. Verification Commands

Repository verification commands requested for this task:

```text
npm test
npm run typecheck
npm run lint
git diff --check
```

Verification result:

| Command | Result |
| --- | --- |
| `git diff --check` | Pass |
| `npm test` | Pass, 28 tests passed |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |

## 10. Final Result

`012_invitation_core.sql` was applied to the production DB through a direct `pg` execution path.

Final status:

- Apply status: Success.
- Created/verified tables: `invitations`, `invitation_tokens`, `invitation_redemptions`.
- Raw token storage: Not present.
- Token hash uniqueness: Present.
- RLS policies: None created by 012; none found after apply.
- Existing referral/member referral tables: Still present.
- Other migrations: Not applied.
- Code/UI: Not modified.

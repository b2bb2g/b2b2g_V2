# Role Application Self Submit RLS Apply Result

## 1. Purpose

This document records the production application result for:

`supabase/migrations/015_role_application_self_submit_rls.sql`

The task goal was to apply only the 015 SQL and verify that Supplier role application submit can later be connected without opening public, anon, delete, `account_roles`, `companies`, or `suppliers` write paths.

## 2. Apply Scope

| Item | Result |
| --- | --- |
| Migration file applied | `supabase/migrations/015_role_application_self_submit_rls.sql` |
| Production DB schema changed | Yes, RLS policies on `public.role_applications` were ensured. |
| Other migration files applied | No |
| UI changed | No |
| Supplier form submit connected | No |
| `account_roles` write changed | No |
| `companies` write changed | No |
| `suppliers` write changed | No |
| Service role fallback used | No |

Execution note:

- The SQL was executed directly against the production database connection.
- The file is idempotent through `pg_policies` checks.
- The required policies already existed before this run, and the 015 SQL executed successfully without creating duplicates.

## 3. Pre-Apply Verification

| Check | Result |
| --- | --- |
| `role_applications` RLS enabled | `true` |
| Existing `role_applications` policy state | The four expected policies were already present before execution. |
| Non-existing column references | No `source`, `metadata`, or `invitation_id` references in executable SQL. |
| Delete policy in 015 | None |
| Public/anon policy in 015 | None |
| Protected table policy snapshot | `account_roles`, `companies`, and `suppliers` policy count was 7 before execution. |

Confirmed `role_applications` columns:

- `account_id`
- `created_at`
- `deleted_at`
- `id`
- `reason`
- `rejection_reason`
- `requested_role_key`
- `reviewed_at`
- `reviewed_by`
- `status`
- `updated_at`

Forbidden/non-existing columns were not present:

- `source`
- `metadata`
- `invitation_id`

## 4. Apply Result

Result: **Applied successfully**

Because the policy creation blocks are guarded by `pg_policies` checks, the migration completed safely even though the target policies were already present.

No data backfill, table insert, table update, table delete, table drop, or service-role operation was performed.

## 5. Post-Apply Verification

| Required Policy | Operation | Exists After Apply |
| --- | --- | --- |
| `role_applications_owner_select` | `SELECT` | Yes |
| `role_applications_owner_insert` | `INSERT` | Yes |
| `role_applications_admin_select` | `SELECT` | Yes |
| `role_applications_admin_update` | `UPDATE` | Yes |

Post-apply RLS state:

| Check | Result |
| --- | --- |
| `role_applications` RLS enabled | `true` |
| Public/anon policy count | 0 |
| Delete policy count | 0 |
| Protected table policy count after apply | 7 |
| Protected table policy changed | No |

## 6. Policy Boundary

The effective policy boundary after 015:

- Authenticated users can select only their own non-deleted role applications.
- Authenticated users can insert only their own role applications with `status = submitted`.
- Authenticated users cannot self-review because `reviewed_by`, `reviewed_at`, and `rejection_reason` must be null on insert.
- Admin can select/update role applications through `public.is_admin()`.
- No owner update policy exists in 015.
- No delete policy exists in 015.
- No public/anon access exists in 015.
- `account_roles`, `companies`, and `suppliers` policies were not changed.

## 7. Supplier Submit Readiness Impact

015 removes the RLS blocker for the next minimal Supplier submit action only if the next task writes to `role_applications` as the authenticated owner.

The next submit task must still not write:

- `account_roles`
- `companies`
- `suppliers`
- `company_members`
- `invitation_redemptions`
- Buyer/Supplier communication or brokerage records

## 8. Remaining Blocking Issues

| Issue | Priority | Notes |
| --- | --- | --- |
| Profile creation path | P0 | Non-authenticated Supplier users still need account/profile creation before role application submit. |
| Supplier form data storage | P1 | `role_applications.reason` is the only current field for context; structured metadata requires future design/migration. |
| Invitation source linkage | P1 | `role_applications` has no `source`, `metadata`, or `invitation_id` column. |
| Owner cancellation policy | P2 | 015 does not add owner update policy, so cancel behavior may need a separate RLS task. |
| Audit integration | P2 | Role application submit remains an audit candidate for a later audit task. |

## 9. Verification Commands

Executed after production SQL apply:

```text
npm test
npm run typecheck
npm run lint
git diff --check
```

Result: all passed.

## 10. Next Codex Task

Recommended next task:

**Sprint 2 Invitation Engine Task 22 - Supplier Signup Submit Action Skeleton**

Scope recommendation:

- authenticated-only action
- insert `role_applications` only
- no `account_roles`, `companies`, `suppliers`, `company_members`, or `invitation_redemptions` writes
- hash/validate invitation token if present
- no raw token logging or storage
- no service role fallback
- no Buyer PII queries


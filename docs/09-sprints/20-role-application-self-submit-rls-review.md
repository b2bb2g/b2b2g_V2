# Role Application Self Submit RLS Review

## 1. Purpose

This review validates `supabase/migrations/015_role_application_self_submit_rls.sql` before any production apply.

The migration exists to unblock the next Supplier signup submit step by allowing authenticated users to submit and read their own `role_applications` rows while keeping Admin review authority separate.

This review does not:

- apply the SQL to production
- connect Supplier form submit
- modify UI
- create or update `account_roles`
- create or update `companies`
- create or update `suppliers`
- add service role fallback

## 2. Files Reviewed

| File | Purpose |
| --- | --- |
| `supabase/migrations/002_role_compatibility.sql` | Source of actual `role_applications` columns and status constraints. |
| `types/database.ts` | Confirms generated TypeScript table shape for `role_applications`. |
| `docs/09-sprints/19-supplier-signup-submit-readiness-audit.md` | Defines Supplier submit target as `role_applications` only. |
| `docs/05-data/02-rls-design-v1.md` | Requires owner create/read and Admin review boundaries for `role_applications`. |
| `supabase/migrations/015_role_application_self_submit_rls.sql` | New migration under review. |

## 3. Actual Column Check

`role_applications` actual columns confirmed from `002_role_compatibility.sql` and `types/database.ts`:

| Column | Exists | Notes |
| --- | --- | --- |
| `id` | Yes | UUID primary key. |
| `account_id` | Yes | References `profiles(id)`; used for owner boundary. |
| `requested_role_key` | Yes | Text role key; current code uses `supplier`. |
| `status` | Yes | Check constraint includes `submitted`; owner insert policy allows only `submitted`. |
| `reason` | Yes | Optional applicant context. |
| `reviewed_by` | Yes | Admin review metadata. |
| `reviewed_at` | Yes | Admin review metadata. |
| `rejection_reason` | Yes | Admin rejection metadata. |
| `created_at` | Yes | Default timestamp. |
| `updated_at` | Yes | Default timestamp. |
| `deleted_at` | Yes | Soft delete marker. |
| `source` | No | Not used in 015. |
| `metadata` | No | Not used in 015. |
| `invitation_id` | No | Not used in 015. |

## 4. RLS Policy Contents

| Policy | Operation | Role | Condition | Purpose |
| --- | --- | --- | --- | --- |
| `role_applications_owner_select` | `select` | `authenticated` | `account_id = auth.uid()` and `deleted_at is null` | User can read only own active application rows. |
| `role_applications_owner_insert` | `insert` | `authenticated` | `account_id = auth.uid()`, status = `submitted`, review fields null, `deleted_at is null` | User can submit own application but cannot self-review. |
| `role_applications_admin_select` | `select` | `authenticated` | `public.is_admin()` | Admin can review application queue. |
| `role_applications_admin_update` | `update` | `authenticated` | `public.is_admin()` for using and check | Admin can approve/reject/update review metadata. |

The migration also keeps RLS enabled:

```sql
alter table public.role_applications enable row level security;
```

## 5. Security Review

| Requirement | Result | Notes |
| --- | --- | --- |
| Authenticated user can insert own application | Pass | `account_id = auth.uid()` is required. |
| Authenticated user can select own application | Pass | `account_id = auth.uid()` and non-deleted row required. |
| Other users cannot read applications | Pass | No policy grants cross-account user read. |
| Admin can select/update | Pass | Uses existing `public.is_admin()` helper. |
| Delete policy absent | Pass | 015 does not create delete policy. |
| `account_roles` write not granted | Pass | 015 does not touch `account_roles`. |
| `companies` / `suppliers` write not granted | Pass | 015 does not touch these tables. |
| Public/anon policy absent | Pass | All policies are `to authenticated`. |
| Service role fallback absent | Pass | SQL creates RLS policies only. |
| User self-review blocked | Pass | Insert policy requires review fields to be null; update is Admin-only. |

## 6. Additive / Destructive Check

| Check | Result |
| --- | --- |
| `DROP` absent | Pass |
| `DELETE` absent | Pass |
| `UPDATE` data mutation absent | Pass |
| `INSERT` data mutation absent | Pass |
| `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` only | Pass |
| Policy creation guarded by `pg_policies` existence checks | Pass |
| No function/helper creation | Pass |
| No table/column changes | Pass |

## 7. Known Limitations

| Limitation | Impact | Follow-up |
| --- | --- | --- |
| No owner update policy | Existing `cancelRoleApplication()` owner cancellation may be blocked once 015 is applied. | Add a separate owner-cancel update policy if cancellation must work before Admin review. |
| No structured Supplier application metadata | Supplier form fields still need a storage strategy. | Use safe `reason` summary temporarily or add a dedicated pending Supplier application table later. |
| No invitation source column | Supplier invitation source cannot be stored structurally on `role_applications`. | Future additive column/table if source tracking becomes required. |
| `public.is_admin()` still depends on existing helper behavior | Admin policy correctness depends on helper correctness. | Review helper authority before broader RLS migration. |

## 8. Production Apply Conditions

Before applying 015 to production:

1. Confirm production contains `public.role_applications` with the columns listed above.
2. Confirm `public.is_admin()` exists and returns expected results for current Admin accounts.
3. Confirm no conflicting existing `role_applications_*` policies exist.
4. Confirm Supplier submit action will not write `account_roles`, `companies`, `suppliers`, or `invitation_redemptions`.
5. Confirm owner cancellation behavior is acceptable without an owner update policy, or schedule a separate cancellation policy task.
6. Confirm production backup/snapshot discipline before applying.

## 9. Production Apply Decision

Decision: **Ready to Apply with Conditions**

Rationale:

- The SQL is additive and limited to `role_applications` policies.
- It grants the minimum needed owner insert/select and Admin select/update permissions.
- It does not open public, anon, delete, account role, company, supplier, or service-role paths.
- Production should not apply until the conditions in section 8 are checked.

## 10. Next Codex Task

Recommended next task:

**Sprint 2 Invitation Engine Task 21 - Apply 015 Role Application Self Submit RLS**

Suggested scope:

- verify production `role_applications` columns
- verify `public.is_admin()`
- apply only `015_role_application_self_submit_rls.sql`
- verify policy names and operations
- do not connect Supplier form submit yet

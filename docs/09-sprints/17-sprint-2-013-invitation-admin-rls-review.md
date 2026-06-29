# Sprint 2 013 Invitation Admin RLS Review

## 1. Purpose

This review covers `supabase/migrations/013_invitation_admin_rls.sql` and the `createAdminInvitation` partial-create fix before any Invitation Admin UI, public signup route, or user-facing token acceptance flow is connected.

The immediate problem is that `012_invitation_core.sql` created `invitations`, `invitation_tokens`, and `invitation_redemptions` with RLS enabled but without policies. Server-client Admin query/action calls can therefore be blocked until Admin-only policies are applied.

## 2. Review Scope

- `supabase/migrations/013_invitation_admin_rls.sql`
- `lib/invitations/actions.ts`
- `lib/invitations/queries.ts`
- `docs/09-sprints/16-sprint-2-012-apply-result.md`

Out of scope:

- UI implementation
- Public route connection
- Signup workflow connection
- Supplier/Buyer/Student policies
- New SECURITY DEFINER helper functions
- Service role fallback
- Raw token logging or storage

## 3. Migration Summary

`013_invitation_admin_rls.sql` is an RLS-policy-only migration for the Invitation Engine tables.

It uses the existing `public.is_admin()` helper and does not create a new helper function.

## 4. Policy Matrix

| Table | Operation | Role | Predicate | Public/User-Facing Access |
| --- | --- | --- | --- | --- |
| `public.invitations` | `select` | `authenticated` | `public.is_admin()` | No |
| `public.invitations` | `insert` | `authenticated` | `with check (public.is_admin())` | No |
| `public.invitations` | `update` | `authenticated` | `public.is_admin()` / `with check (public.is_admin())` | No |
| `public.invitation_tokens` | `select` | `authenticated` | `public.is_admin()` | No |
| `public.invitation_tokens` | `insert` | `authenticated` | `with check (public.is_admin())` | No |
| `public.invitation_tokens` | `update` | `authenticated` | `public.is_admin()` / `with check (public.is_admin())` | No |
| `public.invitation_redemptions` | `select` | `authenticated` | `public.is_admin()` | No |
| `public.invitation_redemptions` | `insert` | `authenticated` | `with check (public.is_admin())` | No |
| `public.invitation_redemptions` | `update` | `authenticated` | `public.is_admin()` / `with check (public.is_admin())` | No |

No `delete` policy is created.

## 5. Security Review

| Check | Result |
| --- | --- |
| Public read policy | Not created |
| Public write policy | Not created |
| Anonymous policy | Not created |
| Supplier/Buyer/Student policy | Not created |
| SECURITY DEFINER helper | Not created |
| Service role fallback | Not used |
| Raw token storage | Not introduced |
| Raw token logging | Not introduced |
| Destructive table/column change | Not present |
| Data backfill | Not present |

## 6. Atomic Create Risk Fix

`createAdminInvitation` still creates the invitation row and token row with normal server-client calls, but it now applies app-level compensating cleanup if token insertion fails after invitation insertion.

Compensating cleanup behavior:

- Updates the just-created invitation row.
- Sets `status = 'cancelled'`.
- Sets `deleted_at` to the cleanup timestamp.
- Does not hard delete the row.
- Does not log or store the raw token.
- Does not retry with service role.

If cleanup also fails, the action returns a clear error that the token creation and cleanup failed. This keeps silent partial creation from being hidden.

## 7. Production Apply Status

`013_invitation_admin_rls.sql` was authored and reviewed in this task but was not applied to production in this task.

Reason:

- The requested task explicitly asked to write the migration and report production apply status.
- It did not instruct applying `013` to the production DB.

Until `013` is applied, production still has the `012` state for Invitation tables: RLS enabled and Admin policy gap remaining.

## 8. Conditions Before Production Apply

Before applying `013` to production:

1. Confirm current production backup/snapshot status.
2. Reconfirm existing `public.is_admin()` helper works with authenticated admin sessions.
3. Apply only `supabase/migrations/013_invitation_admin_rls.sql`.
4. Verify policy count and policy names after apply.
5. Confirm no public, anon, Supplier, Buyer, Student, Agent, or Professor policy exists.
6. Confirm Admin query/action calls succeed with a real admin session.

## 9. Admin UI Readiness

Admin UI connection is not recommended until `013` is applied and verified.

After apply, the next safe implementation step is a minimal Admin invitation issue/revoke UI that uses the existing server-only query/action layer. Public signup and public token acceptance remain blocked until separate user-facing RLS design is reviewed.

## 10. Remaining Risks

- User-facing invitation validation/acceptance still has no limited RLS path.
- Redemption counter updates are not yet transactionally tied to acceptance.
- Audit log integration is still TODO.
- Public signup connection is still deferred.
- Supplier/Buyer/Student policy design must not be inferred from Admin-only policies.

## 11. Review Conclusion

Conclusion: Ready to Apply with Conditions

`013_invitation_admin_rls.sql` is limited to Admin-only RLS policies and can be applied after backup confirmation and `public.is_admin()` verification. It should not be treated as public signup readiness.

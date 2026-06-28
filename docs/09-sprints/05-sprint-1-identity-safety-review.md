# Sprint 1 Identity Safety Review

## 1. Review Scope

This review covers Sprint 1 Identity Engine Tasks 01 through 05 before moving to tests or Admin UI wiring.

Reviewed implementation files:

| File | Review Focus | Result |
| --- | --- | --- |
| `types/database.ts` | `account_roles`, `role_applications`, role status typing, legacy `member_type_id` compatibility | Compatible with 002 additive migration. |
| `lib/auth/account-roles.ts` | Role normalization, account-role-first resolver, legacy fallback | Safe helper layer. |
| `lib/auth/guards.ts` | Authenticated/admin/dashboard guards, effective role resolution | Account roles take priority with legacy fallback retained. |
| `lib/auth/session.ts` | Public header/session role context | Account roles take priority with legacy fallback retained. |
| `lib/queries/identity.ts` | Role/application read queries, admin pending list | Server-only, server client, no PII select. |
| `lib/actions/identity.ts` | Role request, cancel, approve, reject actions | Server action boundary, no service role fallback. |
| `TASK_MASTER.md` | Sprint task tracking | Updated by this task. |
| `docs/09-sprints/02-sprint-1-identity-engine.md` | Sprint log | Updated by this task. |

Referenced source-of-truth documents:

| Document | Applied Rule |
| --- | --- |
| `docs/04-permissions/01-permission-matrix.md` | Account is login base, Role is permission base, role changes require audit. |
| `docs/05-data/01-erd-v1.md` | `account_roles` replaces single-role assumptions; `profiles.member_type_id` is deprecated legacy. |
| `docs/05-data/02-rls-design-v1.md` | Owner reads own roles/applications; Admin manages; normal users cannot modify roles. |
| `docs/03-business/01-business-rules.md` | Service role stays server-only; PII remains protected. |
| `docs/09-sprints/03-sprint-1-identity-repository-audit.md` | Legacy role dependency must be phased out, not deleted at once. |
| `docs/09-sprints/04-sprint-1-identity-integration-gap-check.md` | Task 03 integration scope must stay limited to auth/session resolver wiring. |

## 2. Implemented Identity Functions

| Area | Function | Current Behavior | Safety Notes |
| --- | --- | --- | --- |
| Type model | `AccountRoleStatus`, `RoleApplicationStatus`, `IdentityRoleKey` | Adds compatibility types for 002 tables. | Keeps role keys as text; enum/FK migration deferred. |
| Type model | `Database.public.Tables.account_roles` | Adds row/insert/update typing for additive compatibility table. | Does not remove legacy `profiles.member_type_id`. |
| Type model | `Database.public.Tables.role_applications` | Adds row/insert/update typing for role request workflow. | Matches current 002 compatibility shape. |
| Role helper | `normalizeRoleKey` | Normalizes lower-case role keys with strict pattern. | Prevents empty and malformed role keys. |
| Role helper | `resolveEffectiveRoles` | Uses active/approved `account_roles` first, then legacy member type fallback. | Preserves old runtime behavior when no account role exists. |
| Role helper | `getPrimaryDashboardRole` | Selects dashboard role from effective roles. | Administrator redirects to admin instead of dashboard. |
| Auth guard | `requireAdminRoute` | Uses authenticated user, server client, account-role-first resolution. | No admin client or service role fallback. |
| Auth guard | `requireDashboardRoute` | Uses account roles first for dashboard role, legacy fallback if absent. | Keeps existing public API shape. |
| Session | `getPublicHeaderUserContext` | Resolves header href and member type from effective roles. | No new PII beyond existing authenticated profile/header fields. |
| Query | `getAccountRoles` | Reads account roles for self or admin. | Uses server client and RLS; no service fallback. |
| Query | `getMyAccountRoles` | Reads current user's account roles. | Owner path. |
| Query | `hasAccountRole` | Checks active/approved role for self or admin-readable account. | Uses normalized role key. |
| Query | `getRoleApplications` | Reads role applications for self or admin. | No email/phone select. |
| Query | `getMyRoleApplications` | Reads current user's role applications. | Owner path. |
| Query | `getPendingRoleApplicationsForAdmin` | Admin-only pending role application list. | Selects minimal fields only. |
| Query | `hasOpenRoleApplication` | Checks submitted/requested/under_review duplicate application. | Supports duplicate request prevention. |
| Action | `requestRole` | Authenticated user creates own `submitted` role application after duplicate checks. | No role grant occurs. |
| Action | `cancelRoleApplication` | Authenticated user cancels only own submitted/under_review application. | Uses account ownership check and status guard. |
| Action | `approveRoleApplication` | Admin-only approval prepares or restores `account_roles`, then marks application approved. | Audit and transaction/RPC are still pending. |
| Action | `rejectRoleApplication` | Admin-only rejection marks application rejected with reason. | Audit is still pending. |

## 3. Permission Matrix Compliance

| Permission Principle | Compliance Result | Notes |
| --- | --- | --- |
| Account is login base, not permission subject | Compliant | Code reads authenticated user as account identity and derives permissions from roles. |
| Permission is Role based | Compliant | Effective role resolution uses `account_roles` first. |
| One Account can have multiple Roles | Compliant | `resolveEffectiveRoles` returns all active account role keys. |
| User can view own role status | Compliant | `getMyAccountRoles` and `getMyRoleApplications` are owner scoped. |
| Normal user cannot grant own Role | Compliant | `requestRole` inserts application only; it does not write `account_roles`. |
| Admin controls role approval/rejection | Mostly compliant | Approval/rejection call `requireAdminRoute`; audit write is still TODO. |
| All permission changes require Audit Log | Not fully complete | TODO comments exist, but no audit log write is implemented yet. |
| Buyer PII is not exposed to Supplier | Compliant for reviewed Identity code | Identity queries do not select Buyer email/phone/contact data. |
| Service role fallback forbidden | Compliant | Reviewed Identity files use server client only. |

## 4. ERD / RLS Compliance

| Source Rule | Compliance Result | Notes |
| --- | --- | --- |
| `account_roles` replaces single-role assumptions | Partial and intentional | New resolver uses `account_roles` first, but legacy fallback remains until backfill/RLS migration. |
| `profiles.member_type_id` is deprecated legacy | Compliant | Field is only used as fallback/display compatibility, not final authority. |
| `role_applications` is owner read/admin review workflow | Compliant at code boundary | Owner and admin checks are present; final enforcement depends on RLS policies. |
| Normal users cannot modify `account_roles` | Compliant at action boundary | Only `approveRoleApplication` writes `account_roles`, and it requires admin. |
| RLS is final access layer | Pending | Sprint 1 intentionally did not write RLS SQL. Existing/new policies must be verified before broad use. |
| ERD v1 role FK target | Compatibility divergence | ERD v1 describes `role_id`/`requested_role_id`; 002 and current code use text `role_key` compatibility fields. |
| Buyer PII projection requirement | Not impacted | Identity code does not create Supplier-facing Buyer projections. |

## 5. Security Review

| Check | Result | Evidence |
| --- | --- | --- |
| Service role fallback 없음 | Pass | `lib/actions/identity.ts`, `lib/queries/identity.ts`, and `lib/auth/*` use `createSupabaseServerClient`; no `createSupabaseAdminClient` import. |
| Admin client client-side import 없음 | Pass | Search over `app`, `components`, and Identity files found no `createSupabaseAdminClient` import. |
| 일반 user가 approval/rejection 불가 | Pass with one caveat | `approveRoleApplication` and `rejectRoleApplication` call `requireAdminRoute`; action error shape may receive redirect behavior from guard. |
| User는 본인 role application만 cancel 가능 | Pass | `cancelRoleApplication` checks `application.account_id === user.id` and updates with `eq("account_id", user.id)`. |
| PII select 없음 | Pass for Identity scope | Role/application queries select ids, role keys, statuses, timestamps, reason/rejection reason only. |
| 기존 legacy fallback 유지 | Pass | `resolveEffectiveRoles` uses account roles first and falls back to legacy member type only when no active account roles exist. |
| Role request duplicate blocked | Pass | Existing active/approved roles and submitted/requested/under_review applications are checked before insert. |
| Soft-deleted role ignored | Pass | Role reads and checks filter `deleted_at is null`. |
| Audit requirement | Gap | Role request/cancel/approve/reject include TODOs but do not yet write `audit_logs`. |

## 6. Risk Findings

| ID | Risk | Priority | Impact | Recommendation |
| --- | --- | --- | --- | --- |
| ID-SR-001 | Role approval writes `account_roles` and `role_applications` in separate mutations. | P1 | A partial failure can leave role active while application status remains reviewable. | Add transactional RPC or database function after RLS helper and audit contract are finalized. |
| ID-SR-002 | Audit log writes are still TODO for role request/cancel/approve/reject. | P1 | Permission Matrix requires all role changes to be audited. | Define audit helper contract and add audit writes before production admin workflow is exposed. |
| ID-SR-003 | RLS helper/policy migration is not implemented yet. | P1 | Server actions rely on existing RLS behavior; policies may block or over-allow depending on production state. | Complete Identity RLS review and tests before Admin UI activation. |
| ID-SR-004 | ERD v1 target names use `role_id` and `requested_role_id`, while current compatibility tables use `role_key` text. | P2 | Future migration could drift if not explicitly mapped. | Keep `role_key` compatibility until role table mapping/backfill is planned. |
| ID-SR-005 | `requireAdminRoute` redirects on denial, which is route-friendly but less precise for server actions. | P2 | Non-admin action calls may return redirect behavior rather than a stable action error. | Add a non-redirecting `assertAdmin` helper before wiring Admin UI actions. |
| ID-SR-006 | Admin pending list includes free-form `reason`. | P3 | Users may type sensitive data in reason. Admin-only scope is acceptable, but validation/display policy is needed. | Keep max length validation and avoid public/client-wide exposure. |

## 7. Minimal Test Plan

| Scenario | Test Type | Expected Result |
| --- | --- | --- |
| user can read own `account_roles` | Integration/RLS | `getMyAccountRoles()` returns only current user's non-deleted roles. |
| user can request role | Server action integration | `requestRole("supplier")` creates one `submitted` `role_applications` row for current user. |
| duplicate role request blocked | Server action integration | Second request for same role with submitted/under_review application returns clear error. |
| active role duplicate request blocked | Server action integration | Request for already active/approved role returns `Role is already active`. |
| user can cancel own submitted application | Server action integration | Own submitted/under_review application becomes `cancelled`. |
| user cannot cancel another user's application | Security integration | Action returns not found/permission error and target row remains unchanged. |
| non-admin cannot approve application | Security integration | `approveRoleApplication` is denied and no `account_roles` row is created. |
| admin can approve application | Admin integration | Pending application becomes `approved` and corresponding `account_roles` row is active/approved. |
| admin can reject application | Admin integration | Pending application becomes `rejected` with `reviewed_by`, `reviewed_at`, and `rejection_reason`. |
| `account_roles` takes priority over `member_type_id` fallback | Unit test for helper + integration guard | Active `account_roles` determine effective/dashboard role even when legacy member type differs. |
| legacy `member_type_id` fallback works when `account_roles` absent | Unit test for helper + integration guard | Existing member type still resolves route/session role when no active account roles exist. |
| soft-deleted account role ignored | Unit test for helper | Role with `deleted_at` does not grant effective role. |
| revoked/suspended account role ignored | Unit test for helper | Non-active role statuses do not grant effective role. |
| role application reason length enforced | Server action unit/integration | Reason above max length returns validation error and inserts nothing. |

Suggested first test files:

| Target | Purpose |
| --- | --- |
| `lib/auth/account-roles.test.ts` | Pure helper tests for normalization, priority, and fallback behavior. |
| `lib/actions/identity.test.ts` or integration equivalent | Role request/cancel/admin review behavior with mocked Supabase client or test DB. |
| RLS regression SQL/test harness after policy migration | Owner/admin boundaries once RLS helper SQL exists. |

## 8. Task 07 Recommendation

Recommended Task 07:

```text
Sprint 1 Identity Engine Task 07 - Minimal Identity Tests
```

Recommended scope:

1. Add unit tests for `lib/auth/account-roles.ts`.
2. Add server action tests for duplicate role request and owner-only cancellation if the repo test stack is already available.
3. If no test runner is configured, first add the smallest project-aligned test setup without changing runtime behavior.
4. Defer Admin Role Application UI until the non-redirecting admin assertion helper and audit write strategy are resolved.

Alternative Task 07:

```text
Sprint 1 Identity Engine Task 07 - Admin Assertion and Audit Design
```

Use this alternative if the next priority is production safety before UI or automated tests.

## 9. Blocking Issues

| Blocking Issue | Blocks | Required Resolution |
| --- | --- | --- |
| Audit log contract is not implemented for role changes. | Production Admin approval workflow exposure. | Define safe audit helper and write role request/cancel/approve/reject audit events. |
| Role approval is not transactional. | High-confidence admin approval under failure conditions. | Use RPC/database function or explicit transaction boundary in a later approved migration/action step. |
| Identity RLS helper/policies are not finalized. | Treating app-level checks as final authority. | Implement and test `has_role`, account-role owner/admin policies, and related regression tests. |
| `role_key` text compatibility differs from ERD v1 FK target. | Final schema cleanup/backfill. | Plan role table mapping and backfill before replacing compatibility fields. |
| Non-redirecting admin assertion helper is missing. | Stable server action error handling for non-admin attempts. | Add `assertAdminAction` or equivalent server-only helper before connecting Admin UI. |

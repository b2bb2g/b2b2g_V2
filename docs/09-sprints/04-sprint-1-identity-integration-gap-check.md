# Sprint 1 Identity Integration Gap Check

## 1. Purpose

This document reviews how the Task 01 Identity additions can connect to the existing auth, dashboard, and admin member flows.

Task 01 added:

- `account_roles` and `role_applications` types in `types/database.ts`
- server-only Identity queries in `lib/queries/identity.ts`
- user role request/cancel actions in `lib/actions/identity.ts`
- legacy compatibility helpers in `lib/auth/account-roles.ts`

This check does not perform a broad route switch, dashboard rewrite, DB migration, Supabase production mutation, RLS SQL authoring, or UI redesign.

## 2. Files Reviewed

| Area | Files Reviewed | Current Identity Dependency |
| --- | --- | --- |
| Auth guards | `lib/auth/guards.ts` | Uses `profiles.member_type_id` and `member_types.code` for admin/dashboard routing. |
| Public user context | `lib/auth/session.ts` | Uses `profiles.member_type_id` and `member_types.code` for header destination and user context. |
| Signup/member type action | `lib/actions/auth.ts` | Creates `profiles.member_type_id` and role-specific child rows; does not write `account_roles`. |
| Admin member mutation | `lib/actions/admin-members.ts` | Updates `profiles.member_type_id`, writes `profile_roles`, and uses admin client only for manual user creation. |
| Admin member query | `lib/queries/admin-members.ts` | Lists/filter members by `member_types` and `profiles.member_type_id`; reads `profile_roles` for extra role badges. |
| Admin overview query | `lib/queries/admin-overview.ts` | Counts members by `member_types` and `profiles.member_type_id`. |
| Dashboard query | `lib/queries/dashboard.ts` | Uses `requireDashboardRoute()` context and legacy `memberTypeCode` for role-specific sections; messages still resolve participant role labels through `member_type_id`. |
| Dashboard route shell | `app/(dashboard)/layout.tsx` | Calls `requireDashboardRoute()` and passes its legacy context to `SiteShell`. |
| Admin route shell | `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/members/page.tsx` | Calls `requireAdminRoute()` before admin pages. |
| Admin member UI | `components/admin/member-management.tsx` | Displays and edits `memberTypeId`, filters by `memberTypeCode`, posts legacy `roleIds`. |
| Identity Task 01 files | `types/database.ts`, `lib/queries/identity.ts`, `lib/actions/identity.ts`, `lib/auth/account-roles.ts` | New additive Identity layer exists but is not wired into legacy route/dashboard/admin flows. |

## 3. Current Legacy Role Flow

| Flow | Current Source | Current Behavior | Risk |
| --- | --- | --- | --- |
| Admin route guard | `profiles.member_type_id` -> `member_types.code` | `administrator` can enter `/admin`; non-admin redirects to `/`. | Blocks multi-role admin if `account_roles` has administrator but legacy `member_type_id` does not. |
| Dashboard route guard | `profiles.member_type_id` -> `member_types.code` | Approved active non-admin profiles enter `/dashboard`; administrator redirects to `/admin`. | Cannot choose role when one account has multiple active roles. |
| Public header destination | `profiles.member_type_id` -> `member_types.code` | Header links admin accounts to `/admin`, others to `/dashboard`. | Header can disagree with new `account_roles` once roles are backfilled. |
| Signup role selection | selected form `memberType` -> `member_types.id` -> `profiles.member_type_id` | Signup remains single member type onboarding. | Does not create initial `account_roles`; Task 03 should not change this broadly. |
| Admin member edit | `memberTypeId` form field -> `profiles.member_type_id` | Admin can change legacy primary member type. | Dangerous to reinterpret as final role grant; should be held until role approval flow is designed. |
| Admin extra roles | `roleIds` form field -> `profile_roles` | Admin can delete/insert legacy profile role rows. | Different authority model from `account_roles`; should not be silently mapped yet. |
| Dashboard sections | `DashboardRouteContext.memberTypeCode` | Product/referral/company/message/account sections branch on one role. | Broad UI/data dependency; direct multi-role switch would be high blast radius. |
| Dashboard message labels | participant `profiles.member_type_id` -> `member_types.code` | Participant role label is legacy display data only. | Display mismatch risk after `account_roles` backfill; not a final permission risk by itself. |

## 4. New Account Roles Flow

| Task 01 Artifact | Current Capability | Integration Status |
| --- | --- | --- |
| `types/database.ts` | Types exist for `account_roles` and `role_applications`; legacy `profiles.member_type_id` remains. | Ready for read/write code. |
| `lib/auth/account-roles.ts` | Normalizes role keys, resolves active roles, selects a primary role, and falls back to legacy member type. | Ready for guard/session preparation. |
| `lib/queries/identity.ts` | Reads own or admin-visible account roles/applications through server client and RLS/app guard. | Ready for Task 03 helper composition. |
| `lib/actions/identity.ts` | Allows current user to request/cancel role applications. Admin approve/reject is intentionally deferred. | Safe to keep isolated; do not wire admin approval yet. |

Target integration model:

1. Read active `account_roles`.
2. Resolve active roles through `resolveEffectiveRoles()`.
3. If no active `account_roles` exist, fall back to legacy `member_type_id`.
4. Keep `member_type_id` as compatibility and display data until backfill/RLS helpers are complete.
5. Do not grant permissions from pending, revoked, soft-deleted, or rejected account roles.

## 5. Safe Integration Points

| File | Safe Task 03 Change | Why Safe |
| --- | --- | --- |
| `lib/auth/guards.ts` | Add a small server-only effective role resolver and use `account_roles` first with legacy fallback for `requireAdminRoute()` / `requireDashboardRoute()`. | Route guard already centralizes admin/dashboard access; change can be contained and tested. |
| `lib/auth/session.ts` | Use the same effective role resolver for public header `href` and `memberTypeCode`. | Header context is read-only and can keep legacy fallback. |
| `lib/auth/account-roles.ts` | Add helper exports if Task 03 needs `getDashboardPrimaryRole()` or role filtering. | Pure helper, no DB mutation. |
| `lib/queries/admin-members.ts` | Add read-only `accountRoles`/`roleApplications` fields to admin list data without replacing legacy fields. | Admin page can inspect new state later; no write path changes required. |
| `lib/queries/identity.ts` | Add reusable server helper only if necessary, still no admin client fallback. | Already server-only and PII-minimal. |

Minimum safe Task 03 shape:

- create or extend a server-only effective identity read helper;
- route guard and public header use the helper;
- keep returned `memberTypeCode` for existing dashboard compatibility;
- add optional `accountRoleKeys` / `effectiveRoleKeys` fields only if type changes remain localized;
- no admin approval activation.

## 6. Risky Integration Points

| File / Area | Risk | Recommendation |
| --- | --- | --- |
| `lib/actions/auth.ts` | Signup creates profile and child role rows; adding `account_roles` here changes onboarding semantics and may require audit/backfill policy. | Hold until Task 03 proves read-side compatibility and Task 04 defines signup/backfill behavior. |
| `lib/actions/admin-members.ts` | Existing admin actions mutate `member_type_id` and `profile_roles`; mapping these writes to `account_roles` risks double authority and missing audit contract. | Hold broad changes. Only add TODO comments later if needed. |
| `components/admin/member-management.tsx` | UI posts legacy `memberTypeId` and `roleIds`; changing it requires query/action/data-shape redesign. | Hold until admin role approval flow is designed. |
| `lib/queries/dashboard.ts` | Large role-specific dashboard branching uses one `memberTypeCode`; multi-role behavior impacts all dashboard pages. | Hold broad rewrite. Task 03 may only preserve compatibility context. |
| `lib/queries/admin-overview.ts` | Member counts by legacy member type may shift when `account_roles` becomes authority. | Hold until account role backfill and counting rules are decided. |
| `app/(auth)/select-member-type/page.tsx` | Single member type onboarding copy and form semantics conflict with multi-role role applications. | Hold until role request onboarding is planned. |
| Communication/message authorization | Supplier-Buyer blocking depends on separate Communication Brokerage design and RLS. | Do not alter in Identity Task 03. |

## 7. Files To Modify In Task 03

| Priority | File | Intended Change |
| --- | --- | --- |
| P1 | `lib/auth/account-roles.ts` | Add any missing pure helper needed to select an effective dashboard/admin role without losing legacy fallback. |
| P1 | `lib/auth/guards.ts` | Integrate account-role-first role resolution for route guards while keeping legacy fallback and existing redirects. |
| P1 | `lib/auth/session.ts` | Use the same role resolution for header context and route destination. |
| P2 | `lib/queries/admin-members.ts` | Add read-only account role/application summary fields only if it does not change current admin UI behavior. |
| P2 | `types/database.ts` | Add narrow DTO/type aliases only if Task 03 needs them; no enum or schema assumptions. |
| P3 | `docs/09-sprints/02-sprint-1-identity-engine.md` / `TASK_MASTER.md` | Log Task 03 scope and completion. |

Task 03 should not modify `lib/actions/auth.ts`, `lib/actions/admin-members.ts`, or dashboard page components unless typecheck requires a small compatibility fix.

## 8. Files To Hold

| File / Area | Hold Reason |
| --- | --- |
| `lib/actions/auth.ts` | Signup flow and child role creation need a separate onboarding/backfill design. |
| `lib/actions/admin-members.ts` | Admin role write path needs audit contract and final role approval model. |
| `components/admin/member-management.tsx` | UI is coupled to legacy query/action shapes. |
| `lib/queries/dashboard.ts` | Dashboard-wide multi-role branching is too broad for Task 03. |
| `lib/queries/admin-overview.ts` | Counts should wait for account role backfill and reporting rules. |
| `app/(auth)/select-member-type/page.tsx` | Role request onboarding semantics are not ready. |
| `supabase/migrations/*` | DB/RLS migration work is explicitly out of scope. |
| Supplier/Buyer business actions | Communication/Brokerage permissions are handled by later Engine Sprints. |

## 9. Security / PII Check

| Check | Result |
| --- | --- |
| New Identity files import `createSupabaseAdminClient` | No. |
| Client Components import `createSupabaseAdminClient` | No match found in `app` / `components` check. |
| Identity queries select email/phone PII | No; they select role/application fields only. |
| Admin member UI displays email/phone | Existing admin-only behavior; not changed in this task. |
| Supplier-facing Buyer PII | Not affected by this task. |
| Role approval activation | Deferred; `approveRoleApplication()` / `rejectRoleApplication()` remain intentionally inactive. |
| RLS bypass | No new service role fallback or admin client fallback should be introduced in Task 03. |

Task 03 must not use `account_roles` as sole permission authority until RLS helper/policy migration is ready. It may only use `account_roles` as application-level route/display preparation with legacy fallback.

## 10. Recommended Task 03 Scope

Task 03 should be named:

```text
Sprint 1 Identity Engine Task 03 - Effective Role Context Integration
```

Recommended scope:

1. Add a small server-only effective role context helper.
2. Read current user's `account_roles`.
3. Read legacy `profiles.member_type_id` / `member_types.code` only as fallback.
4. Resolve `effectiveRoleKeys` with `resolveEffectiveRoles()`.
5. Select `administrator` as admin route role when present.
6. Select the dashboard primary role from non-admin active roles.
7. Keep `DashboardRouteContext.memberTypeCode` unchanged for compatibility.
8. Keep existing redirects for unapproved/inactive profiles.
9. Do not alter signup, admin member mutation, dashboard section branching, or communication rules.

Task 03 verification must include:

```text
git diff --check
npm run typecheck
npm run lint
rg -n "createSupabaseAdminClient" lib/auth lib/queries/identity.ts lib/actions/identity.ts app components
```

Task 03 commit should remain small and reversible.

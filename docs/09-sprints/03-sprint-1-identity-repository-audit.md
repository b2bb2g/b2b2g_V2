# Sprint 1 Identity Repository Audit

## 1. Audit Purpose

This audit reviews the current repository before Sprint 1 Identity Engine implementation.

The goal is to identify existing dependencies on `role`, `member_type`, `profile_roles`, `member_types`, `profiles.member_type_id`, `account_roles`, and `role_applications`, then classify the existing code as Reuse / Refactor / Replace / Hold / Security Fix Required.

This document does not modify code, write DB migrations, update Supabase DB, or change UI.

## 2. Identity Source of Truth

| Source | Identity Rule |
| --- | --- |
| `PROJECT_MASTER.md` | Current phase is Engine Sprint Implementation; current sprint is Sprint 1 Identity Engine. |
| `TASK_MASTER.md` | Sprint 1 starts with repository audit, then Types, Queries, Server Actions, RLS Review, Admin UI, Tests. |
| `docs/09-sprints/01-engine-sprint-plan.md` | Engine Sprints proceed Scope Review -> DB/Migration Review -> RLS Review -> Types -> Queries -> Server Actions -> UI -> Pages -> Tests -> Review/Freeze. |
| `docs/09-sprints/02-sprint-1-identity-engine.md` | Identity Engine moves toward `account_roles` based multi-role structure without immediate runtime authority switch. |
| `docs/05-data/01-erd-v1.md` | `account_roles` and `role_applications` are the target Identity/Role model; `profiles.member_type_id` is deprecated. |
| `docs/05-data/02-rls-design-v1.md` | `member_type_id` is not valid final RLS authority; `account_roles` helpers are required before broad RLS migration. |
| `docs/04-permissions/01-permission-matrix.md` | Account is login base; permission subject is Role; one Account can have multiple Roles. |
| `docs/07-implementation/00-existing-code-reuse-policy.md` | Existing code must be classified before changing it. |

Identity decisions already reflected in production:

| Migration | Production Status | Identity Impact |
| --- | --- | --- |
| `001_snapshot_baseline.sql` | Applied | Baseline marker only. |
| `002_role_compatibility.sql` | Applied | Created additive `account_roles` and `role_applications`. |

## 3. Files Reviewed

| Area | Files / Patterns Reviewed | Result |
| --- | --- | --- |
| Auth actions | `lib/actions/auth.ts` | Uses `member_types` and `profiles.member_type_id` for member type selection and profile creation. |
| Auth guards/session | `lib/auth/guards.ts`, `lib/auth/session.ts` | Uses `profiles.member_type_id` + `member_types.code` for admin/dashboard routing. |
| Admin member actions | `lib/actions/admin-members.ts` | Uses `profiles.member_type_id` for profile updates and `profile_roles` for extra business roles. |
| Admin member queries | `lib/queries/admin-members.ts` | Uses `member_types`, `profiles.member_type_id`, and `profile_roles` to build Admin member list. |
| Admin overview query | `lib/queries/admin-overview.ts` | Counts members through `member_types` + `profiles.member_type_id`. |
| Dashboard query | `lib/queries/dashboard.ts` | Uses `member_type_id`/`member_types` for message participant labels and role-context views. |
| Business actions | `lib/actions/business.ts` | Uses `member_type_id`/`member_types` for Supplier-Buyer conversation detection guard. |
| Referral flows | `lib/queries/signup-policy.ts`, `lib/actions/referrals.ts` | Uses `target_member_type` and admin client fallback patterns for referral/invite flow. |
| Admin member UI | `components/admin/member-management.tsx` | Displays and edits `memberTypeCode`, `memberTypeId`, and legacy role options. |
| Auth UI | `app/(auth)/select-member-type/page.tsx` | Hardcoded selectable member type options for single member type onboarding. |
| Types | `types/database.ts` | Contains `member_types`, `profiles.member_type_id`, `profile_roles`, and `has_member_type`; does not include `account_roles` or `role_applications`. |
| Migrations | `supabase/migrations/*` | Legacy identity schema and RLS use `member_types`, `profile_roles`, and `has_member_type`; 002 adds `account_roles` and `role_applications`. |

## 4. Role / Member Type Dependency Findings

| File | Current Dependency | Target Model | Status | Risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `types/database.ts` | Generated/manual Database type includes `member_types`, `profiles.member_type_id`, `profile_roles`, and `has_member_type`; missing `account_roles` and `role_applications`. | Include additive `account_roles` and `role_applications` types before implementation uses them. | Refactor | P1 High | First Sprint 1 implementation task should update Identity types or regenerate Supabase types. Do not write queries against untyped tables. |
| `lib/auth/guards.ts` | Admin/dashboard routing uses `profiles.member_type_id` joined to `member_types.code`. | Role resolution should use `account_roles` after helper/RLS readiness; interim helper can wrap legacy + new role source. | Refactor | P1 High | Keep behavior for now, but introduce server-side Identity query/helper before replacing guard logic. |
| `lib/auth/session.ts` | Public header context uses `profiles.member_type_id` and `member_types.code` to set dashboard/admin href. | Multi-role context should expose account roles and selected active role. | Refactor | P1 High | Prepare `CurrentIdentityContext` type and query; do not switch runtime authority until role strategy is tested. |
| `lib/actions/auth.ts` | Signup selection inserts `profiles.member_type_id`; creates role-specific child row; does not create `account_roles` or `role_applications`. | New signup should create/apply Role request or role assignment through `role_applications` / approved `account_roles` path. | Refactor | P1 High | Treat as Sprint 1 high-priority design gap. Implement role application flow after audit and type definitions. |
| `app/(auth)/select-member-type/page.tsx` | Hardcoded single member type option values. | Role application/onboarding flow with one Account, multiple possible Roles. | Refactor | P2 Medium | Keep until query/action flow is ready; later replace copy/behavior with role application language. |
| `lib/actions/admin-members.ts` | `updateMemberProfileAction` writes `profiles.member_type_id`; `updateMemberRolesAction` deletes/inserts `profile_roles`; manual creation writes legacy member type and profile roles. | Admin approval/grant should write `account_roles` and review `role_applications`; legacy fields should be compatibility only. | Refactor | P1 High | Do not modify yet. Next implementation plan must split profile edit from role grant and add audit target for `account_roles`. |
| `lib/queries/admin-members.ts` | Filters/listing use `member_types` and `profiles.member_type_id`; role badges use `profile_roles`. | Admin member list should show legacy member type plus active `account_roles` state during transition. | Refactor | P1 High | Add compatibility query plan: read both legacy and `account_roles` before final switch. |
| `components/admin/member-management.tsx` | UI displays `memberTypeName`, filters by `memberTypeCode`, and posts legacy roleIds. | Admin UI should surface account roles and role applications after server/query refactor. | Hold | P2 Medium | Do not touch before query/action implementation plan. UI depends on legacy data shape. |
| `lib/validators/admin-members.ts` | Validates `memberTypeId` as required UUID in profile edit. | Role changes should not be treated as profile field updates. | Refactor | P2 Medium | Split identity profile edit validation from role grant/application validation. |
| `lib/queries/admin-overview.ts` | Counts member totals by `member_types` + `profiles.member_type_id`. | Counts should eventually use `account_roles` active roles. | Refactor | P2 Medium | Refactor after core Identity query helper exists; not first implementation target. |
| `lib/queries/dashboard.ts` | Uses `member_type_id`/`member_types` for message participant labels and context-specific dashboard sections. | Dashboard identity should use selected/active role context. | Hold | P2 Medium | Do not change in Sprint 1 first pass; audit impact before dashboard-wide refactor. |
| `lib/actions/business.ts` | Supplier-Buyer direct message guard derives role categories from `member_type_id`/`member_types`. | Communication must use typed conversation + brokerage RLS; role checks should use `account_roles` helpers later. | Hold | P1 High | Do not alter in Identity Sprint unless necessary. Communication migration has its own Sprint and RLS dependency. |
| `lib/queries/signup-policy.ts` | Uses admin client fallback and `target_member_type` referral code model. | Referral role targets should align with role application / role grant model. | Hold | P2 Medium | Keep for current referral flow; review admin client usage separately before Identity action work. |
| `lib/actions/referrals.ts` | Uses `context.memberTypeCode` and member referral target types. | Referral permissions should later check active account role. | Hold | P2 Medium | Do not modify before role context helper exists. |
| `supabase/migrations/20260618130000_foundation_identity_master.sql` | Creates `member_types`, `profiles.member_type_id`, `roles`, `profile_roles`. | Legacy foundation retained; `account_roles` is new target authority. | Reuse | P2 Medium | Keep as baseline; no destructive changes. |
| `supabase/migrations/20260618131000_foundation_rls.sql` | Defines `has_member_type`, `is_admin`, `has_permission` using `member_type_id` and `profile_roles`. | Later `009_rls_helpers.sql` should introduce `account_roles` helper scope. | Refactor | P1 High | Do not edit old migration. Create new helper migration later after helper scope review. |
| `supabase/migrations/002_role_compatibility.sql` | Adds `account_roles` and `role_applications` additively, without RLS/policies/backfill. | Current target compatibility schema. | Reuse | P2 Medium | Use as DB availability baseline. Do not rely on it as sole runtime authority yet. |
| `lib/i18n/translation.ts` | Contains legacy member type copy and error keys. | Keep translation keys but adjust wording later for Role application flow. | Hold | P3 Low | Do not touch until UI/action flow is planned. |

No `Security Fix Required` item was found that demands immediate patching before the implementation plan. The main Sprint 1 risk is not an active exploit by itself; it is an architectural drift risk if new Identity code continues to extend `member_type_id` and `profile_roles` instead of introducing a controlled `account_roles` path.

## 5. Legacy Dependency Map

| Legacy / Target Item | Current Repository Usage | Target Direction | Risk |
| --- | --- | --- | --- |
| `profiles.member_type_id` | Core runtime dependency for signup, admin/dashboard routing, public header context, admin member filters, overview counts, dashboard message labels, and business message guard. | Keep as legacy compatibility field; do not use as final permission authority. | P1 High |
| `profile_roles` | Admin member role assignment deletes/inserts rows; admin member list reads extra role badges; RLS helper `has_permission` depends on it. | Keep until `account_roles` backfill and helper/policy switch are designed. | P1 High |
| `member_types` | Master lookup for signup member type selection, admin filters, dashboard/admin routing, and member counts. | Keep as legacy display/compatibility; role authority moves to `account_roles`. | P1 High |
| `member_type_id` based logic | Spread across auth guards, session, auth actions, admin queries, admin actions, business message guard, dashboard query. | Replace through Identity query/helper and selected active role context. | P1 High |
| Hardcoded role names | `supplier`, `buyer`, `agent`, `professor`, `student`, `administrator` appear in signup options, admin role options, route guards, referral role mapping, and UI badge classes. | Keep constants but centralize under Identity types/config after audit. | P2 Medium |
| `account_roles` | Exists only in `002_role_compatibility.sql`; no TypeScript type/query/action usage found. | Introduce as active role assignment source after type/query/action plan. | P1 High |
| `role_applications` | Exists only in `002_role_compatibility.sql`; no TypeScript type/query/action usage found. | Introduce as role request/review workflow. | P1 High |
| `has_member_type` | Exists in RLS types and foundation RLS. | Deprecated for final authority; replace with `has_role` / `has_account_role` helper in later RLS migration. | P1 High |
| `has_permission` | Uses `profile_roles` in existing RLS. | Keep until RLS helper migration; do not bypass with service role. | P1 High |

## 6. Recommended Identity Implementation Order

1. Type definitions
   - Add or regenerate `account_roles` and `role_applications` table types.
   - Define `IdentityRoleKey`, `AccountRoleStatus`, `RoleApplicationStatus`, and current role context DTOs.
   - Preserve legacy type names only where existing code still depends on them.

2. Queries
   - Create server-only Identity queries for current account roles, own role applications, and admin role review list.
   - Build compatibility read model that can show both legacy `member_type_id` and `account_roles`.
   - Do not expose admin-only approval metadata to normal users.

3. Server actions
   - Add role application submit/withdraw action.
   - Add admin approve/reject role application action.
   - Add admin account role grant/revoke action only after audit log design is included.

4. Role application flow
   - Convert "select member type" semantics into role request semantics without breaking current onboarding.
   - Keep current onboarding route until role application queries/actions are ready.

5. Admin approval flow
   - Move role approval from `profiles.member_type_id` and `profile_roles` editing toward `role_applications` review and `account_roles` grant.
   - Record audit logs for approve/reject/grant/revoke.

6. Role switch helper
   - Prepare selected role context for accounts with multiple active roles.
   - Do not implement UI role switch until helper and type contract are stable.

7. Tests
   - `npm run typecheck`
   - `npm run lint`
   - Query/action permission checks
   - Admin/client boundary checks
   - No client import of admin client

## 7. Files Not To Touch Yet

| File / Area | Reason |
| --- | --- |
| `supabase/migrations/20260618130000_foundation_identity_master.sql` | Historical baseline migration; do not edit applied migration. |
| `supabase/migrations/20260618131000_foundation_rls.sql` | Historical baseline RLS; helper replacement must be new migration after review. |
| `supabase/migrations/002_role_compatibility.sql` | Already applied to production; do not modify applied migration. |
| `lib/actions/business.ts` | Communication/Supplier-Buyer message guard belongs to later Trade Brokerage / Communication Sprint. |
| `lib/queries/dashboard.ts` | Broad dashboard query has cross-engine dependencies; refactor only after Identity query contract exists. |
| `components/admin/member-management.tsx` | UI depends on legacy query/action shape; do not change before Identity server contract exists. |
| `app/(auth)/select-member-type/page.tsx` | User-facing onboarding UI should wait until role application action/query design is ready. |
| Existing RLS policies/functions | RLS helper/policy SQL is outside Sprint 1 repository audit and requires separate review. |

## 8. Blocking Issues

| Blocking Issue | Priority | Impact | Required Resolution |
| --- | --- | --- | --- |
| `types/database.ts` does not include `account_roles` / `role_applications`. | P1 High | Cannot safely implement typed queries/actions for new production tables. | Update/regenerate types before query/action implementation. |
| Runtime admin/dashboard routing depends on `member_type_id`. | P1 High | Multi-role account behavior cannot work correctly until role context exists. | Design and implement server-side Identity role context helper. |
| Admin role management writes `profile_roles`, not `account_roles`. | P1 High | New role model will not be used by admin approval flow. | Split legacy profile edit from account role grant/revoke flow. |
| RLS helpers still use `member_type_id` / `profile_roles`. | P1 High | Final permission model cannot rely on `account_roles` until helper/policy migration. | Keep Sprint 1 app changes compatibility-only; plan `009_rls_helpers.sql` later. |
| No role application query/action exists. | P1 High | `role_applications` production table is unused. | Add role application query/action after type definitions. |
| Existing signup flow assumes one selected member type. | P2 Medium | Does not support multi-role account onboarding. | Introduce role application flow carefully without breaking current signup. |
| `role_key` source remains text in 002 compatibility table. | P2 Medium | Could diverge from final `roles` master if not centralized. | Define centralized `IdentityRoleKey` and mapping policy before writes. |
| Report phase completion changed `docs/.pdca-status.json`. | Info | PDCA status should be committed with this documentation work. | Include PDCA status file in commit if changed. |

## 9. Codex Next Step

Next task candidate:

```text
docs/09-sprints/04-sprint-1-identity-implementation-plan.md
```

Recommended content for the next document:

- exact file-by-file implementation sequence;
- type additions for `account_roles` and `role_applications`;
- Identity query function signatures;
- server action boundaries;
- audit log requirements;
- compatibility strategy for `member_type_id` / `profile_roles`;
- test plan before any code edit.

The first implementation task after that plan should be **Identity Engine Types**, not query/action/UI work.

## 10. Verification Result

| Verification | Result |
| --- | --- |
| `git diff --check` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |

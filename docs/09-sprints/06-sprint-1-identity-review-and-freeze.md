# Sprint 1 Identity Engine Review and Freeze

## 1. Review Scope

This document reviews Sprint 1 Identity Engine after Tasks 01 through 08.

Reviewed scope:

| Area | File / Artifact | Review Result |
| --- | --- | --- |
| Migration | `supabase/migrations/002_role_compatibility.sql` | Additive-only role compatibility migration completed and production-applied. |
| Types | `types/database.ts` | Includes `account_roles`, `role_applications`, and compatibility status types. |
| Role helpers | `lib/auth/account-roles.ts` | Provides account-role-first effective role resolution with legacy fallback. |
| Auth guards | `lib/auth/guards.ts` | Uses account roles before legacy `member_type_id` in admin/dashboard route checks. |
| Session context | `lib/auth/session.ts` | Uses account roles before legacy member type for public header account context. |
| Queries | `lib/queries/identity.ts` | Provides server-only account role and role application read paths. |
| Actions | `lib/actions/identity.ts` | Provides role request/cancel and admin approve/reject actions without service role fallback. |
| Tests | `lib/auth/account-roles.test.mts` | Covers pure helper and effective role resolver behavior. |
| Admin route | `app/admin/role-applications/page.tsx` | Adds admin-only pending role application page. |
| Admin component | `components/admin/role-application-list.tsx` | Adds minimal approve/reject list UI with no PII fields. |
| Project tracking | `PROJECT_MASTER.md`, `TASK_MASTER.md`, `docs/09-sprints/02-sprint-1-identity-engine.md` | Updated by this task to record freeze status and next sprint recommendation. |

Out of scope:

- DB migration authoring.
- Supabase production mutation.
- RLS SQL authoring.
- Broad Admin UI redesign.
- Signup flow backfill.
- Legacy table removal.

## 2. Completed Items

| Item | Status | Evidence |
| --- | --- | --- |
| 002 role compatibility migration | Complete | `account_roles` and `role_applications` created additively; production apply recorded as successful. |
| `account_roles` / `role_applications` 타입 | Complete | `types/database.ts` includes table row/insert/update types and status unions. |
| `account_roles` 우선 + legacy fallback | Complete | `resolveEffectiveRoles` uses active/approved account roles first, then `profiles.member_type_id`/`member_types.code` fallback. |
| role application request/cancel | Complete | `requestRole` and `cancelRoleApplication` are implemented in `lib/actions/identity.ts`. |
| admin role application approve/reject | Complete with limitations | `approveRoleApplication` and `rejectRoleApplication` require admin route guard; audit/transaction work remains backlog. |
| minimal admin UI | Complete | `/admin/role-applications` shows pending applications and approve/reject forms. |
| pure helper tests | Complete | `npm test` runs `lib/auth/account-roles.test.mts` with 9 passing tests. |

## 3. Architecture Compliance

| Architecture Rule | Result | Notes |
| --- | --- | --- |
| Engine-first implementation | Compliant | Work stayed inside Identity Engine scope. |
| Module/Plugin separation | Compliant | No cross-engine Supplier/Buyer/Brokerage functionality was added. |
| Existing code reuse before replacement | Compliant | Legacy `member_type_id` path remains as fallback; no legacy table removal. |
| Server actions for data mutation | Compliant | Role writes stay in `lib/actions/identity.ts` server action boundary. |
| UI follows existing Admin surface | Compliant | Minimal Admin route reuses existing admin page frame, badge/status styling, and form action pattern. |
| No broad UI redesign | Compliant | Only one focused Admin route and component were added. |

## 4. Permission Matrix Compliance

| Permission Rule | Result | Notes |
| --- | --- | --- |
| Account is login base, Role is permission base | Compliant | Identity role resolution now derives effective roles from `account_roles` first. |
| One Account can have multiple Roles | Compliant | Effective role helper returns unique active/approved role keys. |
| Normal users can request Role, not grant Role | Compliant | `requestRole` writes `role_applications`, not `account_roles`. |
| Normal users can cancel only own application | Compliant | `cancelRoleApplication` checks `account_id === user.id` and status. |
| Admin controls approval/rejection | Compliant at app boundary | Admin actions call `requireAdminRoute`; final data enforcement still depends on RLS policy work. |
| Permission changes require Audit Log | Known limitation | TODO comments exist; audit writes are not yet implemented. |
| Buyer/Supplier/Student PII not exposed | Compliant in Identity scope | Identity admin list displays `account_id`, `requested_role_key`, `status`, `reason`, and `created_at` only. |

## 5. ERD / RLS Compliance

| ERD / RLS Rule | Result | Notes |
| --- | --- | --- |
| `account_roles` is target multi-role structure | Compliant | Types, helpers, queries, actions, and Admin review UI use `account_roles`. |
| `role_applications` is target role request workflow | Compliant | User request/cancel and Admin review flow use `role_applications`. |
| `profiles.member_type_id` is legacy | Compliant with compatibility | It remains only as fallback/display compatibility until backfill/RLS migration. |
| RLS is final enforcement layer | Pending | Sprint 1 did not write RLS SQL. This is explicitly deferred. |
| SECURITY DEFINER helper scope | Pending | No helper SQL was created in Sprint 1. |
| `role_key` compatibility vs final role authority | Known limitation | Current 002/code use text `role_key`; final ERD alignment with `roles` remains future migration work. |

## 6. Security Review

| Security Check | Result | Notes |
| --- | --- | --- |
| service role fallback 없음 | Pass | Reviewed Identity files use server client patterns; no service role fallback was added. |
| admin client client-side import 없음 | Pass | `rg createSupabaseAdminClient app components lib/auth lib/actions/identity.ts lib/queries/identity.ts` returned no matches. |
| Buyer/Supplier/Student PII select 없음 | Pass | Identity query/admin UI does not select email, phone, contact person, or student PII. |
| 일반 user approval/rejection 불가 | Pass at app boundary | Admin approve/reject actions call `requireAdminRoute`. |
| legacy fallback 유지 | Pass | Existing `member_type_id` fallback is preserved when no active account role exists. |
| RLS SQL 미작성 상태 | Explicitly deferred | Sprint 1 intentionally did not modify RLS helper or policy SQL. |
| Audit log | Limitation | Permission-changing actions still need audit log integration. |
| Transactionality | Limitation | Role approval updates `account_roles` and `role_applications` in separate mutations. |

## 7. Test Result

Verification ran on this freeze task.

| Command | Result | Notes |
| --- | --- | --- |
| `npm test` | Pass | 9 tests passed in `lib/auth/account-roles.test.mts`. |
| `npm run typecheck` | Pass | `tsc --noEmit` completed. |
| `npm run lint` | Pass | `eslint` completed. |
| `git diff --check` | Pass | No whitespace errors. |
| `rg createSupabaseAdminClient app components lib/auth lib/actions/identity.ts lib/queries/identity.ts` | Pass | No matches. |

Current test coverage:

- `normalizeRoleKey`.
- Account role priority over legacy fallback.
- Approved role priority.
- Exclusion of inactive/pending/rejected/deleted roles.
- Legacy fallback when account roles are absent.
- Empty role output when both sources are absent.
- Multi-role account handling.
- Primary role priority.

Not yet covered:

- Server action integration tests.
- Admin approve/reject integration tests.
- RLS regression tests.
- Browser-level Admin UI interaction tests.

## 8. Known Limitations

| Limitation | Priority | Handling |
| --- | --- | --- |
| audit log 실제 연결 보류 | P1 | Move to Admin/Audit Sprint backlog before production-grade role operations. |
| RLS policy SQL 보류 | P1 | Move to RLS Sprint / migration helper scope; do not treat app checks as final DB authority. |
| role switch UI 보류 | P2 | Defer until role context and active role selection policy are finalized. |
| signup flow `account_roles` backfill 보류 | P1 | Signup still depends on legacy flow; backfill needs migration plan and RLS policy readiness. |
| `profile_roles` / `member_types` legacy 제거 보류 | P2 | Keep compatibility until backfill and final role authority migration are validated. |
| server action integration test 보류 | P1 | Add mock or test DB strategy before relying on Admin role actions at scale. |
| Role approval transaction boundary missing | P1 | Replace multi-step approval with RPC/transaction or safe DB function after helper/RLS design. |
| `role_key` text compatibility remains | P2 | Align with final `roles` model in later migration/backfill work. |

## 9. Sprint 1 Freeze Decision

Decision: **Frozen with Known Limitations**

Rationale:

- Sprint 1 successfully established the minimum Identity Engine implementation path.
- The migration, types, server helpers, queries, server actions, admin review surface, and pure helper tests are in place.
- No service role fallback, client-side admin client import, PII expansion, DB migration, Supabase production mutation, or RLS SQL change was introduced during Tasks 01 through 09.
- Remaining issues are known, documented, and belong to later RLS, Admin/Audit, signup/backfill, or integration testing work.

Sprint 1 is frozen for broad feature expansion. Future Identity changes should be limited to backlog items or security fixes unless a new Identity Sprint is explicitly opened.

## 10. Next Sprint Recommendation

Recommended next sprint: **Sprint 2 Organization Engine**

Sprint 2 should start with documentation/repository review, not code-first implementation.

Before Sprint 2 starts:

| Required Handling | Notes |
| --- | --- |
| Move Identity audit TODOs to backlog | Audit integration remains required but should not block Organization scope review. |
| Keep RLS helper work in RLS Sprint | `has_role`, `has_account_role`, and owner/admin policies need RLS migration planning. |
| Keep audit log integration in Admin/Audit Sprint | Role approval audit logging should use one shared audit contract. |
| Do not remove legacy role structures | `profile_roles`, `member_types`, and `member_type_id` remain compatibility structures. |

Suggested first Sprint 2 document:

```text
docs/09-sprints/07-sprint-2-organization-engine-plan.md
```

## 11. Backlog Items

| Backlog ID | Item | Target Sprint / Area | Priority |
| --- | --- | --- | --- |
| ID-BL-001 | Add audit log writes for role request/cancel/approve/reject. | Admin Control / Audit | P1 |
| ID-BL-002 | Add transactional role approval path via RPC or approved DB function. | RLS / DB Migration | P1 |
| ID-BL-003 | Write Identity RLS helpers and policies for `account_roles` / `role_applications`. | RLS Sprint | P1 |
| ID-BL-004 | Add server action integration tests for `requestRole`, `cancelRoleApplication`, `approveRoleApplication`, `rejectRoleApplication`. | Testing | P1 |
| ID-BL-005 | Define signup flow bridge to create role application or approved account role. | Identity / Signup | P1 |
| ID-BL-006 | Plan `profile_roles` / `member_types` / `member_type_id` backfill and deprecation. | Migration | P2 |
| ID-BL-007 | Add role switch UI and active role selection policy. | Identity UI | P2 |
| ID-BL-008 | Align `role_key` compatibility with final `roles` authority model. | Migration / ERD Alignment | P2 |
| ID-BL-009 | Add browser-level Admin role application UI verification. | QA | P2 |

## 12. Codex Notes

- Sprint 1 is frozen as an implementation baseline, not as a final Identity system.
- Do not extend Identity Engine with new feature behavior during Sprint 2 unless it is required for Organization Engine boundaries.
- Treat `account_roles` as the preferred app-level role source, but remember DB-level final authority still requires RLS helper/policy work.
- Keep legacy fallback until explicit migration/backfill review is complete.
- Do not expose Buyer/Supplier/Student PII through role application UI or identity queries.
- Next Codex task should begin Sprint 2 with an Organization Engine scope/repository audit.

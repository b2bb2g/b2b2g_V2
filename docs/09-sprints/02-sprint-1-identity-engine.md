# Sprint 1 Identity Engine

## 1. Sprint Goal

Identity Engine을 `account_roles` 기반 multi-role 구조로 정리한다.

Sprint 1의 목적은 기존 single-role/member type 의존을 즉시 제거하는 것이 아니라, production에 적용된 `account_roles` / `role_applications` 구조를 기준으로 안전한 구현 경로를 만드는 것이다.

## 2. Current DB Status

| Item | Status |
| --- | --- |
| `profiles` | Exists. |
| `account_roles` | Created in production by `002_role_compatibility.sql`. |
| `role_applications` | Created in production by `002_role_compatibility.sql`. |
| `profiles.member_type_id` | Legacy field; must not be used as final permission authority. |
| `profile_roles` | Legacy compatibility structure. |
| `member_types` | Legacy compatibility/display structure. |
| 001 production apply | Complete. Result: Success. No rows returned. |
| 002 production apply | Complete. Result: Success. No rows returned. |

## 3. Scope

### Included

- `account_roles` based role confirmation path.
- `role_applications` based role request path.
- Existing `member_type_id` dependency identification.
- Role switch preparation.
- Admin role approval preparation.
- Server/client Identity type cleanup.
- Existing Identity-related code classification as Reuse / Refactor / Replace / Hold.

### Excluded

- Full dashboard implementation.
- Organization relationship implementation.
- Supplier/Buyer detailed feature implementation.
- RLS policy SQL authoring.
- Role data backfill.
- Production DB mutation.
- UI redesign outside Identity Engine needs.

## 4. Files to Audit

| Area | Paths |
| --- | --- |
| Supabase clients and auth boundary | `lib/supabase/`, `lib/auth/` |
| Queries | `lib/queries/` |
| Server Actions | `lib/actions/` |
| Types | `types/` |
| App routes | `app/` |
| Components | `components/` |
| Existing role/member type code | Any files referencing `member_type`, `member_type_id`, `profile_roles`, `account_roles`, `role_applications`, role approval, or role switch logic |

## 5. Implementation Tasks

| Task | Name | Description | Status |
| --- | --- | --- | --- |
| Task 1 | Existing role/member_type dependency audit | Identify all existing role and member type assumptions. | Not Started |
| Task 2 | Identity related Type definitions | Define safe server/client types for `account_roles`, `role_applications`, and role state. | Not Started |
| Task 3 | `account_roles` query authoring | Add read paths for current account roles without exposing admin-only data. | Not Started |
| Task 4 | `role_applications` query/action authoring | Add request/review workflow query/action boundary. | Not Started |
| Task 5 | Role switch helper design | Prepare role selection/switch helper without final RLS authority switch. | Not Started |
| Task 6 | Admin approval flow preparation | Prepare admin review/approval flow boundaries and audit requirement. | Not Started |
| Task 7 | Existing code classification | Classify touched files as Reuse / Refactor / Replace / Hold. | Not Started |
| Task 8 | Tests / typecheck / lint | Verify typecheck, lint, and role boundary assumptions. | Not Started |

## 6. Security Rules

| Rule | Requirement |
| --- | --- |
| Service role fallback | Forbidden. |
| Client admin client import | Forbidden. |
| Role changes | Admin/System only. |
| User role visibility | User can view own role status only. |
| Role approval | Audit required. |
| `member_type_id` authority | Forbidden for new final permission logic. |
| Pending/revoked roles | Must not grant permissions. |
| Soft-deleted roles | Must not grant permissions. |
| RLS policy change | Not part of Sprint 1 unless separately approved. |

## 7. Decision Required

| Decision | Options / Notes | Blocks |
| --- | --- | --- |
| Existing `profile_roles` deprecation removal timing | Keep until backfill and helper/policy switch are validated. | Final cleanup only. |
| `account_roles` backfill timing | Must wait for role mapping review and backup discipline. | Runtime authority switch. |
| `role_key` source | Keep text for compatibility vs later role FK/enum alignment. | Helper design and type definitions. |
| Role switch UI in MVP | Include minimal role switch vs defer to Admin/User settings. | UI implementation scope. |

## 8. Codex Next Step

Next task is not code modification.

Create the Sprint 1 Identity Engine Repository Audit:

```text
docs/09-sprints/03-sprint-1-identity-repository-audit.md
```

That audit must:

- search all role/member type dependencies;
- identify admin client boundaries;
- classify files as Reuse / Refactor / Replace / Hold;
- identify security risks before implementation;
- confirm no RLS/policy SQL is required for Sprint 1 code prep;
- recommend the first safe implementation task.

## 9. Verification Requirements

Every Sprint 1 implementation task must run:

```text
git diff --check
npm run typecheck
npm run lint
```

If any Identity Engine change touches authorization, PII visibility, or admin approval, it must also include a security review note before commit.

## 10. Sprint Log

| Task | Status | Summary |
| --- | --- | --- |
| Implementation Task 01 | Complete | Added `account_roles` / `role_applications` types, server-client Identity queries, user role application actions, and account-role compatibility helpers while preserving legacy `member_type_id` behavior. |

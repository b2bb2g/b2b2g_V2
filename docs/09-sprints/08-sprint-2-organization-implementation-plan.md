# Sprint 2 Organization Implementation Plan

## 1. Sprint Goal

Sprint 2 Organization Engine의 목표는 Company-Member, Agent-Buyer, Professor-Student 관계를 Source of Truth 기준으로 구현할 수 있도록 실제 코드 작업 범위를 확정하는 것이다.

이번 Sprint의 구현 방향은 기존 기능을 깨지 않는 compatibility-first 방식이다. 현재 DB와 코드에는 `company_members`, `agent_buyers`, `professor_students`가 아직 없으므로, Task 03 이후의 코드 구현은 실제 DB에 존재하는 구조와 future target 구조를 명확히 분리해야 한다.

핵심 원칙:

- `country_agents`는 Agent-Buyer 관계가 아니라 Agent market assignment다.
- `referral_relations`는 Buyer-Buyer referral이다.
- Agent-Buyer 권한 근거는 `agent_buyers`여야 한다.
- Professor-Student 권한 근거는 `professor_students`여야 한다.
- Company-Member 권한 근거는 `company_members`여야 한다.
- Supplier는 Buyer PII에 접근할 수 없다.
- Agent는 하부 Buyer만 제한 조회할 수 있다.
- Professor는 하부 Student PII 전체를 조회할 수 있다.

## 2. Implementation Scope

포함:

- `company_members` 타입/쿼리 준비
- `agent_buyers` 타입/쿼리 준비
- `professor_students` 타입/쿼리 준비
- organization query layer 추가
- organization helper 추가
- 최소 server action 준비
- 순수 helper 테스트

제외:

- 대규모 Admin UI
- full RLS SQL
- Supabase DB 변경
- invitation/QR 구현
- messaging 구현
- Student Growth 구현
- Buyer PII full access 구현

Scope control:

- Task 03은 helper/type boundary 중심으로 시작한다.
- 실제 DB에 없는 table을 런타임 query에서 즉시 호출하지 않는다.
- Migration 전 타입은 future target type과 existing runtime type을 구분한다.
- Dashboard/business flow 전면 교체는 Sprint 2 후반 또는 별도 Sprint로 보류한다.

## 3. Target Tables

| Table | Current DB / Code State | Sprint 2 Treatment |
| --- | --- | --- |
| `companies` | Existing | Reuse/Refactor; company ownership query를 보수적으로 감싼다. |
| `company_members` | Missing in current type/code | Future target; migration 전에는 runtime query 금지. |
| `suppliers` | Existing with `company_id` | Compatibility source for Supplier-owned company. |
| `buyers` | Existing | Reuse/Refactor; Agent-facing projection은 limited fields only. |
| `agents` | Existing | Reuse/Refactor; Agent profile and market assignment context. |
| `agent_buyers` | Missing in current type/code | Future target; Agent-Buyer authority source after migration. |
| `professors` | Existing | Reuse/Refactor; Professor profile context. |
| `professor_students` | Missing in current type/code | Future target; Professor-Student authority source after migration. |
| `students` | Existing with `professor_id` | Compatibility source for Professor-Student relation until migration. |
| `country_agents` | Existing | Agent market assignment only; never Buyer authority source. |

## 4. Type Update Plan

Task 03 type work should be split into two layers.

Existing runtime types:

- Use current `types/database.ts` entries for `companies`, `suppliers`, `buyers`, `agents`, `professors`, `students`, and `country_agents`.
- Do not remove or rename `students.professor_id`.
- Do not remove or reinterpret `suppliers.company_id`.
- Do not make `country_agents` imply Buyer access.

Future target types:

- Prepare local Organization DTO/type aliases for future `company_members`, `agent_buyers`, and `professor_students` without forcing Supabase generated table types before migration.
- If `types/database.ts` is updated before DB migration, target table definitions must be clearly marked as future/additive and must not be used in live queries until tables exist.
- Prefer local domain types in `lib/auth/organization.ts` or `lib/queries/organization.ts` before changing global DB table typings for non-existing tables.

Type decisions:

- `company_role`, `status`, relation role/status values should remain text-compatible until state machine and SQL constraints are finalized.
- Relation status should support at least `active`, `inactive`, `suspended`, and ended/removed semantics at the DTO level.
- Buyer limited summary type must exclude email, phone, contact person, raw inquiry details, contract amount, and admin memo.
- Student full summary type for Professor may include email only when subordinate relationship is confirmed.

## 5. Query Plan

생성 후보:

- `lib/queries/organization.ts`

함수 후보:

- `getMyCompanyMemberships()`
- `getCompanyMembers(companyId)`
- `getAgentBuyers(agentId)`
- `getMyAgentBuyers()`
- `getProfessorStudents(professorId)`
- `getMyProfessorStudents()`
- `isCompanyMember(userId, companyId)`
- `isAgentOfBuyer(agentId, buyerId)`
- `isProfessorOfStudent(professorId, studentId)`

Query implementation rules:

- 일반 사용자 query는 server client + RLS 기준으로만 작성한다.
- admin client fallback 금지.
- service role fallback 금지.
- Agent가 `country_agents` 기준으로 Buyer를 조회하면 안 된다.
- `referral_relations`를 Agent-Buyer 권한 근거로 사용하면 안 된다.
- Supplier-facing query에 Buyer email/phone/contact 추가 금지.
- Professor-facing Student PII query는 subordinate relation 확인 이후에만 허용한다.

Compatibility query plan:

| Function | Before Relation Migration | After Relation Migration |
| --- | --- | --- |
| `getMyCompanyMemberships()` | Return Supplier company compatibility membership from `suppliers.company_id`; clearly mark as compatibility. | Read `company_members` and include Supplier owner relation. |
| `getCompanyMembers(companyId)` | Admin-only placeholder or return empty with clear reason unless safe compatibility exists. | Read `company_members` with Admin/company member scope. |
| `getAgentBuyers(agentId)` | Return empty/blocked until `agent_buyers` exists; do not use `country_agents` as Buyer relation. | Read `agent_buyers` and limited Buyer summary. |
| `getMyAgentBuyers()` | Return empty/blocked until `agent_buyers` exists. | Resolve current Agent and read subordinate Buyer limited summary. |
| `getProfessorStudents(professorId)` | Compatibility read from `students.professor_id`, with PII limited to Professor/Admin route only. | Read `professor_students` and Student full summary for subordinate Professor. |
| `getMyProfessorStudents()` | Resolve current Professor and read `students.professor_id` compatibility list. | Resolve current Professor and read `professor_students`. |
| `isCompanyMember(userId, companyId)` | Check Supplier compatibility only; do not claim full company member semantics. | Check `company_members` active row. |
| `isAgentOfBuyer(agentId, buyerId)` | Return false until `agent_buyers` exists, except explicit future migration/backfill test path. | Check `agent_buyers` active row. |
| `isProfessorOfStudent(professorId, studentId)` | Check `students.professor_id`. | Check `professor_students` active row, with `students.professor_id` fallback only during migration window. |

## 6. Server Action Plan

생성 후보:

- `lib/actions/organization.ts`

함수 후보:

- `assignCompanyMember()`
- `removeCompanyMember()`
- `assignBuyerToAgent()`
- `removeBuyerFromAgent()`
- `assignStudentToProfessor()`
- `removeStudentFromProfessor()`

Server action rules:

- admin 또는 authorized owner만 실행 가능하다.
- 일반 사용자가 arbitrary relation을 만들 수 없다.
- RLS가 막으면 service role fallback을 쓰지 않는다.
- audit log는 TODO 가능하지만, relation change에는 audit 대상임을 함수 주석/문서에 남긴다.
- DB에 target relation table이 없으면 해당 action은 implemented behavior가 아니라 deferred/not implemented 상태로 둔다.
- `country_agents` assignment action은 Agent market assignment로만 유지하고, Buyer assignment action과 분리한다.
- `referral_relations` write path는 Buyer-Buyer referral로만 유지하고 Agent-Buyer assignment와 분리한다.

Initial action stance:

| Action | Task 05 Recommended State | Reason |
| --- | --- | --- |
| `assignCompanyMember()` | Deferred until `company_members` exists | DB table missing. |
| `removeCompanyMember()` | Deferred until `company_members` exists | DB table missing. |
| `assignBuyerToAgent()` | Deferred until `agent_buyers` exists | Avoid using `country_agents` incorrectly. |
| `removeBuyerFromAgent()` | Deferred until `agent_buyers` exists | Avoid destructive relation ambiguity. |
| `assignStudentToProfessor()` | Compatibility update may be possible through `students.professor_id`, but should remain admin-only and minimal. | Existing table supports current assignment but final model needs join table. |
| `removeStudentFromProfessor()` | Compatibility update may be possible, but should be held unless required. | Removing mentor relation has Student PII/workflow impact. |

## 7. Helper Plan

생성 후보:

- `lib/auth/organization.ts`

함수 후보:

- `canManageCompany()`
- `canViewBuyerAsAgent()`
- `canViewStudentAsProfessor()`
- `normalizeOrganizationRole()`

Helper details:

| Helper | Purpose | Must Not Do |
| --- | --- | --- |
| `normalizeOrganizationRole()` | Normalize company/member relation roles for safe comparison. | Must not hardcode permission escalation. |
| `canManageCompany()` | Determine whether account can manage a company using compatibility Supplier owner or future company member relation. | Must not let any Supplier manage any company. |
| `canViewBuyerAsAgent()` | Return true only for explicit Agent-Buyer relation. | Must not use `country_agents` or `referral_relations` as authority. |
| `canViewStudentAsProfessor()` | Return true for explicit Professor-Student relation, with current `students.professor_id` compatibility. | Must not allow unrelated Professor access. |

Helper testing should be pure and not require production data or Supabase service role.

## 8. Test Plan

우선 순수 helper 테스트:

- Agent는 하부 Buyer만 true
- non-subordinate Buyer false
- Professor는 하부 Student true
- 다른 Professor Student false
- Company member role normalize

Additional minimal tests:

- `country_agents` input never grants Buyer relation in helper logic.
- `referral_relations` input never grants Agent-Buyer relation in helper logic.
- Supplier-facing Buyer DTO does not include `email`, `phone`, `contactPerson`, `contact_person_name`.
- Professor-facing Student DTO can include email only when subordinate relation is true.
- Empty/missing relation arrays return false rather than throwing broad access.

Verification commands:

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `git diff --check`

## 9. PII / Security Rules

Required rules:

- Buyer email/phone/contact person은 Supplier/Agent 기본 조회에서 제외한다.
- Agent는 하부 Buyer 제한 정보만 조회한다.
- Professor는 하부 Student PII 전체 조회 가능하다.
- Public은 PII 접근 불가다.
- Admin만 전체 PII 접근 가능하다.

Implementation guardrails:

- Supplier-facing DTO must not include Buyer PII even if query joins `buyers` or `profiles`.
- Agent-facing Buyer summary may include company name, country, approval/activity summary, joined date, and aggregate counts only.
- Agent-facing Buyer summary must not include email, phone, contact person, detailed inquiry content, contract amount, or admin memo.
- Professor-facing Student detail may include email/phone only after `canViewStudentAsProfessor()` or Admin guard is true.
- Public Organization query must only expose approved/published company-safe fields.
- Service role must not be introduced to bypass RLS in Organization user flows.
- Client components must not import admin/server-only clients.

## 10. Implementation Order

| Task | Name | Scope | Output |
| --- | --- | --- | --- |
| Task 03 | Organization types/helper | Add domain types and pure helper functions; no DB migration. | `lib/auth/organization.ts`, tests if small. |
| Task 04 | Organization queries | Add `lib/queries/organization.ts` with compatibility-safe reads. | Query layer with PII-safe DTOs. |
| Task 05 | Organization server actions | Add deferred/minimal admin-only actions where safe. | `lib/actions/organization.ts`, no service role fallback. |
| Task 06 | Organization tests | Add pure helper and DTO-shape tests. | Tests for subordinate relation and PII exclusion. |
| Task 07 | Minimal Admin relation review UI | Add minimal admin review surface only after query/action safety. | Lightweight Admin page/component, no redesign. |
| Task 08 | Sprint 2 review/freeze | Review compliance and known limitations. | Sprint 2 freeze report. |

Recommended Task 03 boundary:

- Create only pure helpers and local types.
- Do not edit dashboard routing.
- Do not call missing DB tables.
- Do not change signup/referral flow.
- Include tests if helpers are small enough.

## 11. Blocking Issues

| Priority | Blocking Issue | Impact | Required Handling |
| --- | --- | --- | --- |
| P0 | `agent_buyers`, `professor_students`, `company_members` actual DB existence is not confirmed as present in runtime types. | Full Organization relation implementation cannot be live. | Treat as future target until migration readiness is written. |
| P0 | Migration 필요 여부 | Missing target tables likely require additive migration. | Do not write SQL in Sprint 2 Task 02; decide in later migration task. |
| P1 | RLS helper 미구현 | DB-level enforcement for new relation model is not ready. | Keep application helper conservative; no broad access. |
| P1 | audit log 통합 보류 | Relation assignment changes must be auditable. | Add TODO in action plan; real integration in Admin/Audit sprint or safe existing helper path. |
| P1 | Existing `students.professor_id` compatibility | Current Professor-Student access depends on legacy FK. | Keep fallback only during migration window and test false cases. |
| P1 | Existing `country_agents` meaning | Country assignment can be confused with Buyer relation. | Explicitly deny use as Agent-Buyer authority. |
| P2 | Invitation/referral relation overlap | Signup/referral backfill may produce incorrect relations if assumed. | Leave invitation/QR outside Sprint 2 implementation. |

## 12. Codex Notes

- This document authorizes only scoped Organization implementation planning.
- It does not authorize DB migration, RLS SQL, Supabase production changes, large Admin UI, messaging, invitation/QR, or Student Growth changes.
- Task 03 should begin with local helper/type work and no live query against missing tables.
- If existing code conflicts with this plan, this plan and the Permission Matrix take precedence for Sprint 2.
- If a function cannot safely implement behavior before migration, return a clear deferred/not implemented result rather than silently falling back to legacy tables.
- `country_agents` remains market assignment.
- `referral_relations` remains Buyer-Buyer referral.
- Agent-Buyer, Professor-Student, and Company-Member authority must move to explicit relation tables before broad feature expansion.

## 13. Task 03 Completion Log

- Completed: local Organization relation types and pure helpers in `lib/auth/organization.ts`.
- Completed: helper tests in `lib/auth/organization.test.mts`.
- Completed: `npm test` now runs all auth helper test files via `lib/auth/*.test.mts`.
- Not changed: database schema, Supabase production DB, RLS SQL, UI, live queries, generated database table types.
- Guardrail retained: `country_agents` and `referral_relations` are not accepted as Agent-Buyer relation authority.

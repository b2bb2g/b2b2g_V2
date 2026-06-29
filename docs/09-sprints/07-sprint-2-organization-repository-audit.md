# Sprint 2 Organization Repository Audit

## 1. Audit Purpose

Sprint 2 Organization Engine 구현 전에 기존 코드와 DB 타입/마이그레이션에서 Organization 관계가 어떻게 표현되어 있는지 감사한다.

이번 감사는 코드 구현, DB migration, Supabase DB 변경, RLS SQL, UI 수정 없이 문서로만 수행한다. 목표는 다음 Sprint 2 구현 계획에서 수정 범위를 안전하게 제한할 수 있도록 기존 의존성을 `Reuse / Refactor / Replace / Hold / Security Fix Required`로 분류하는 것이다.

## 2. Organization Source of Truth

Organization Engine의 기준은 아래 문서다.

- `PROJECT_MASTER.md`
- `TASK_MASTER.md`
- `docs/09-sprints/01-engine-sprint-plan.md`
- `docs/01-architecture/01-platform-engine-module-plugin.md`
- `docs/02-experience/01-user-journey.md`
- `docs/03-business/01-business-rules.md`
- `docs/04-permissions/01-permission-matrix.md`
- `docs/05-data/01-erd-v1.md`
- `docs/05-data/02-rls-design-v1.md`
- `docs/05-data/04-existing-db-erd-mapping-audit.md`
- `docs/07-implementation/00-existing-code-reuse-policy.md`

Source of Truth 기준 핵심 결정:

- Company-Account 관계는 `company_members`가 최종 목표다.
- Agent-Buyer 하부 관계는 `agent_buyers`가 최종 목표다.
- Professor-Student 하부 관계는 `professor_students`가 최종 목표다.
- `suppliers.company_id`, `students.professor_id`, `country_agents`는 현재 구현 호환 경로로 취급한다.
- Agent는 하부 Buyer의 제한 요약만 볼 수 있다.
- Professor는 하부 Student 개인정보 전체를 볼 수 있다.
- Supplier는 Buyer email, phone, contact person을 직접 볼 수 없다.
- Organization 관련 RLS는 `is_company_member`, `is_agent_of_buyer`, `is_professor_of_student`, `can_view_buyer_pii`, `can_view_student_pii` 기준으로 번역되어야 한다.

## 3. Files Reviewed

| Area | Files / Tables Reviewed | Notes |
| --- | --- | --- |
| Auth / Role context | `lib/auth/guards.ts`, `lib/auth/session.ts`, `lib/auth/account-roles.ts` | Sprint 1 Identity context가 Organization query의 role 기반 입력이 된다. |
| Dashboard query | `lib/queries/dashboard.ts` | Supplier/Buyer/Agent/Professor/Student dashboard에서 기존 관계 의존성이 가장 많다. |
| Business actions | `lib/actions/business.ts` | Role별 profile/company/product/showcase update 경로가 존재한다. |
| Admin management | `lib/actions/admin-management.ts` | `country_agents` 관리 경로가 존재한다. |
| Admin query | `lib/queries/admin-members.ts`, `lib/queries/admin-companies.ts`, `lib/queries/admin-overview.ts` | Admin-only PII 조회와 company/supplier 집계 경로가 존재한다. |
| Public query | `lib/queries/public-content.ts`, `lib/queries/companies.ts` | Public company/product 노출 경로는 Organization membership 구현과 분리해야 한다. |
| Signup / referral | `lib/actions/auth.ts`, `lib/actions/referrals.ts`, `lib/queries/signup-policy.ts` | Agent/Professor invitation과 legacy buyer referral relation이 혼재한다. |
| Components | `components/dashboard/referral-tools.tsx`, `components/dashboard/dashboard-pages.tsx`, `components/admin/member-management.tsx` | UI 수정 대상은 아니며, query 결과 구조 의존성만 확인했다. |
| Types | `types/database.ts` | `company_members`, `agent_buyers`, `professor_students` 타입이 아직 없다. |
| Migrations | `supabase/migrations/*`, `supabase/migrations/002_role_compatibility.sql` | 기존 role profile, referral, country assignment, RLS helper 경로 확인. |

## 4. Existing Organization Data Model

현재 코드와 타입에서 확인되는 Organization 구조는 다음과 같다.

| Current Structure | Current Purpose | Target Model | Status | Notes |
| --- | --- | --- | --- | --- |
| `suppliers.company_id` | Supplier가 소유/운영하는 회사 연결 | `company_members` + `suppliers.company_id` compatibility | Refactor | 현재 회사 권한은 Supplier row에 강하게 의존한다. |
| `buyers.profile_id` | Buyer role profile의 Account 연결 | `buyers.account_id/profile_id` alignment | Reuse | Buyer role profile 자체는 유지 가능하나 PII projection 필요. |
| `agents.profile_id` | Agent role profile의 Account 연결 | `agents` + `agent_buyers` | Refactor | Agent 자체는 유지하고 하부 Buyer relation을 추가해야 한다. |
| `professors.profile_id` | Professor role profile의 Account 연결 | `professors` + `professor_students` | Refactor | Professor 자체는 유지 가능하다. |
| `students.professor_id` | Student의 담당 Professor 직접 FK | `professor_students` + compatibility | Refactor | 현재 구현은 이 컬럼에 많이 의존한다. |
| `country_agents` | Agent에게 country lane 할당 | Agent assignment support, not subordinate Buyer authority | Refactor | 하부 Buyer 권한 기준으로 쓰기에는 과도하게 넓다. |
| `referral_relations` | Buyer-Buyer referral relation | Buyer referral/source support, not Agent-Buyer authority | Refactor | Agent-Buyer 관계와 혼동하면 안 된다. |
| `member_referral_codes`, `member_referral_signups` | Agent/Professor invitation 흐름 | Invitation Engine support | Reuse | Organization relation backfill 입력 후보로만 사용한다. |
| `company_members` | 없음 | Company-account membership | New | ERD/RLS 목표에는 있으나 현재 타입/코드에는 없다. |
| `agent_buyers` | 없음 | Agent-subordinate Buyer relation | New | ERD/RLS 목표에는 있으나 현재 타입/코드에는 없다. |
| `professor_students` | 없음 | Professor-subordinate Student relation | New | ERD/RLS 목표에는 있으나 현재 타입/코드에는 없다. |

## 5. Company-Member Findings

현재 Company 관계는 주로 Supplier 중심이다.

- `lib/queries/dashboard.ts`의 `getSupplierCompanyId`는 `suppliers.company_id`를 읽는다.
- Supplier dashboard company/profile 경로는 `companies`와 `suppliers.company_id`를 직접 연결한다.
- `lib/actions/business.ts`는 Supplier가 회사 정보를 수정할 때 `suppliers.company_id`를 기준으로 `companies`를 update한다.
- `lib/queries/admin-companies.ts`는 `companies`, `suppliers`, `products`, `industrial_posts`, `epc_posts`, `company_verifications`를 집계한다.
- `company_members` 기반 다중 회사 멤버/직원/관리자 권한 모델은 아직 코드와 타입에 없다.

판단:

- `companies`, `suppliers`, `company_verifications`는 Reuse/Refactor 대상이다.
- `suppliers.company_id`는 즉시 제거하지 않고 compatibility field로 유지해야 한다.
- `company_members`는 Sprint 2 implementation plan과 후속 migration plan에서 New로 다뤄야 한다.
- Company write 권한은 장기적으로 `is_company_member`와 Supplier owner 관계를 분리해야 한다.

## 6. Agent-Buyer Findings

현재 Agent 관계는 하부 Buyer relation이 아니라 country assignment와 invitation 중심이다.

- `lib/queries/dashboard.ts`는 Agent dashboard에서 `country_agents`를 조회해 managed country/market count를 만든다.
- `lib/actions/admin-management.ts`는 Admin이 `country_agents`를 upsert한다.
- `lib/actions/auth.ts`와 `lib/actions/referrals.ts`는 invitation/referral 관련 경로를 가진다.
- 기존 `referral_relations`는 Buyer-Buyer referral 관계이며, Agent-Buyer 권한의 최종 근거로 사용하면 안 된다.
- ERD/RLS 기준 `agent_buyers`가 존재해야 Agent가 하부 Buyer만 제한 조회할 수 있다.

판단:

- `agents` table은 Reuse/Refactor 대상이다.
- `country_agents`는 Agent market assignment compatibility로 Refactor한다.
- `agent_buyers`는 New 대상이다.
- Agent dashboard가 country assignment를 하부 Buyer 권한처럼 확장하면 PII/권한 위험이 생긴다.
- `is_agent_of_buyer` helper가 정의되기 전에는 Agent-Buyer 상세 query를 확대하지 않는다.

## 7. Professor-Student Findings

현재 Professor-Student 관계는 `students.professor_id` 직접 FK 중심이다.

- `lib/queries/dashboard.ts`는 Professor dashboard에서 `students.professor_id = roleIds.professorId`로 하부 Student count/list를 조회한다.
- `lib/queries/dashboard.ts`는 Professor referral/network 화면에서 `profiles.email`을 포함한 Student contact summary를 만든다.
- `lib/queries/dashboard.ts`는 Student dashboard에서 `students.professor_id`로 assigned Professor 정보를 조회한다.
- `supabase/migrations/*`에는 `public.is_assigned_student(student_id)` helper를 사용하는 RLS 흔적이 있다.
- ERD/RLS 기준 최종 관계는 `professor_students` explicit join table이다.

판단:

- `professors`, `students`는 Reuse/Refactor 대상이다.
- `students.professor_id`는 compatibility field로 유지하고, `professor_students`로 단계적 전환한다.
- Professor가 하부 Student email을 보는 것은 Permission Matrix상 허용되지만, 반드시 하부 관계로 제한되어야 한다.
- 다른 Professor의 Student email/phone 접근을 차단하는 RLS helper와 query boundary가 필요하다.

## 8. Supplier / Buyer / Agent / Professor / Student Findings

| Role Profile | Current Use | Target Direction | Status | Notes |
| --- | --- | --- | --- | --- |
| `suppliers` | Supplier role profile, company/product/FDA owner context | Keep role profile, align with account_roles and company_members | Refactor | Existing Supplier content logic is useful but company authority is too direct. |
| `buyers` | Buyer company/country, buy request owner, referral participant | Keep role profile, protect PII through projection | Refactor | Supplier-facing paths must not select email/phone/contact. |
| `agents` | Agent role profile and country assignment owner | Keep role profile, add `agent_buyers` relation | Refactor | `country_agents` is not enough for subordinate Buyer permission. |
| `professors` | Professor role profile and Student mentor owner | Keep role profile, add `professor_students` relation | Refactor | Current `students.professor_id` dependency must be compatibility only. |
| `students` | Student role profile, showcase/research owner, Professor assignment | Keep role profile, add relation table and PII boundary | Refactor | Professor full PII is allowed only for subordinate Student. |

## 9. Legacy / Conflict Findings

| File | Current Dependency | Target Model | Status | Risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `types/database.ts` | No `company_members`, `agent_buyers`, `professor_students` types | ERD Organization target tables | Refactor | Types cannot yet express Organization SOT | Add Organization types only after migration plan for Sprint 2 is approved. |
| `lib/queries/dashboard.ts` | `suppliers.company_id` company ownership | `company_members` related scope plus Supplier compatibility | Refactor | Multi-member company authority not represented | Keep current query for compatibility; introduce Organization query layer before replacing. |
| `lib/actions/business.ts` | Supplier company update through `suppliers.company_id` | Company member permission check | Refactor | Company write authority tied to Supplier only | Do not broaden now; prepare `is_company_member` read/write boundary. |
| `lib/queries/admin-companies.ts` | Admin aggregates by company/supplier direct relation | Company/Supplier relationship with member support | Reuse | Admin-only scope is acceptable | Reuse counts; refactor only after `company_members` exists. |
| `lib/queries/dashboard.ts` | Agent dashboard uses `country_agents` as network signal | `agent_buyers` subordinate relation | Refactor | Country assignment may overstate Buyer management rights | Treat as market assignment only, not Buyer PII authority. |
| `lib/actions/admin-management.ts` | Admin assigns `country_agents` | Agent assignment support plus future `agent_buyers` | Reuse | Existing Admin audit path is useful | Keep as country lane assignment; do not use as subordinate Buyer relation. |
| `lib/actions/auth.ts` | Signup creates role profile and referral records through legacy paths | account_roles plus Organization relation creation | Refactor | Signup/backfill timing unresolved | Hold broad signup change until Sprint 2 implementation plan. |
| `lib/actions/referrals.ts` | Uses admin client to create referral code records | Invitation Engine support | Hold | May need service role boundary review in invitation sprint | Do not refactor during Organization Task 01. |
| `lib/queries/dashboard.ts` | Professor network reads `students.professor_id` and profile email | `professor_students` + `can_view_student_pii` | Security Fix Required | Full Student email must stay subordinate-only | Keep current behavior only if RLS enforces subordinate scope; add regression test later. |
| `lib/queries/dashboard.ts` | Buyer referral reads related buyer name/company/status | Buyer referral limited summary | Reuse | PII appears excluded in this path | Keep limited select; do not add email/phone/contact. |
| `components/dashboard/referral-tools.tsx` | Displays mentor/student contact email from query DTO | Query-provided subordinate contact DTO | Hold | UI can leak if query scope is wrong | Do not change UI now; fix data boundary first. |
| `components/admin/member-management.tsx` | Admin-only member PII display | Admin Control Engine | Reuse | Admin PII access is expected | Do not fold into Organization Sprint 2 unless required. |
| `supabase/migrations/*` | Legacy RLS helpers such as current role IDs and assigned student checks | RLS v1 helper set | Refactor | Helper semantics may conflict with account_roles | Review during RLS helper sprint, not in this audit. |
| `referral_relations` | Buyer-Buyer referral relation | Buyer source/referral, not Agent-Buyer | Replace | Misusing as Agent-Buyer relation would violate SOT | Keep for referral; create `agent_buyers` separately. |
| `students.professor_id` | Direct professor assignment | `professor_students` relation | Refactor | Single FK cannot capture history/status/ended_at | Backfill into join table later and keep compatibility until validated. |

## 10. PII / Security Findings

| Finding | Current Observation | Risk | Recommendation |
| --- | --- | --- | --- |
| Agent can see non-subordinate Buyer | Existing Agent dashboard primarily uses `country_agents`, not explicit `agent_buyers`. | P1 High if country scope becomes Buyer detail scope. | Do not expose Buyer detail/PII through country assignment. Add `agent_buyers` and `is_agent_of_buyer` before subordinate Buyer detail. |
| Professor can see non-subordinate Student | Current Professor queries use `students.professor_id`; this is acceptable only if RLS and data integrity are correct. | P1 High if `professor_id` is stale or bypassed. | Introduce `professor_students` relation and `is_professor_of_student`; keep direct FK as compatibility. |
| Supplier can see Buyer PII | Current audited Supplier/Buyer paths do not show Supplier-facing Buyer email/phone selects, but Buyer PII is a platform-wide risk. | P1 High if new Organization queries join `profiles` or `buyers` broadly. | Supplier-facing DTOs must exclude Buyer email/phone/contact. Use `buyer_masked_profiles` or limited projection. |
| Student PII public exposure | Public content paths should not expose Student PII. Professor dashboard can display Student email because subordinate Professor access is allowed. | P1 High if query scope is not subordinate-only. | Student PII queries must be routed through Professor/Admin-only boundaries and later `can_view_student_pii`. |
| Admin member PII | Admin UI displays profile email/phone. | Safe if admin route guard remains correct. | Keep Admin-only; do not reuse these DTOs in user dashboards. |
| Referral relation confusion | Buyer referral and Agent/Professor invitation logic can be confused with Organization authority. | P2 Medium | Separate Invitation/Referral source from Organization subordinate relation. |
| RLS helper drift | Existing helper/RPC names predate account_roles and ERD v1. | P1 High before policy SQL | Review helper definitions before Sprint 2 relation query expansion. |

## 11. Recommended Sprint 2 Implementation Order

1. Organization Type update
2. Organization query layer
3. Company member query
4. Agent-Buyer relation query
5. Professor-Student relation query
6. Minimal server actions
7. Tests
8. Admin minimal review UI

Implementation notes:

- Start with read/query helpers before write actions.
- Keep current dashboard/business flows stable until Organization query layer is tested.
- Add relation DTOs that do not include Buyer PII by default.
- Treat Professor-Student full PII as a deliberately scoped exception, not as a generic profile join.
- Do not create UI entry points before server/RLS boundaries are clear.

## 12. Files Not To Touch Yet

| File / Area | Reason |
| --- | --- |
| `supabase/migrations/*` | No DB migration in this task; relation table SQL requires a separate migration plan. |
| RLS helper/policy SQL | RLS v1 helper scope must be reviewed before SQL. |
| `lib/actions/auth.ts` signup flow | Signup/backfill relation creation is high-risk and should follow a dedicated plan. |
| `lib/actions/referrals.ts` | Invitation/referral service-role boundary should be reviewed in Invitation/Organization transition work. |
| `components/admin/member-management.tsx` | Admin member management is broad and not required for repository audit. |
| `components/dashboard/referral-tools.tsx` | UI leak risk should be solved by query boundary first. |
| Supplier/Buyer business flows | Trade Brokerage and Communication rules must remain isolated from Organization Sprint 2. |
| `buyer_masked_profiles` implementation | Buyer PII projection is a data/RLS migration concern, not this audit. |

## 13. Blocking Issues

| Priority | Blocking Issue | Impact | Required Resolution |
| --- | --- | --- | --- |
| P0 | `company_members`, `agent_buyers`, `professor_students` are not present in current DB types/code. | Target Organization model cannot be implemented fully. | Write Sprint 2 implementation plan and migration readiness before SQL. |
| P0 | Agent-Buyer authority is currently not represented as explicit relation. | Agent subordinate Buyer permissions cannot be safely expanded. | Define `agent_buyers` compatibility/backfill strategy. |
| P0 | Professor-Student authority relies on `students.professor_id`. | Historical assignment/status and full PII access boundaries are incomplete. | Define `professor_students` compatibility/backfill strategy. |
| P1 | `country_agents` can be mistaken for Buyer management authority. | Agent may get broader-than-subordinate access if reused incorrectly. | Limit `country_agents` to market assignment only. |
| P1 | Student email is selected for Professor dashboard contact cards. | Safe only under subordinate scope; unsafe if RLS helper drifts. | Add tests and later RLS helper `can_view_student_pii`. |
| P1 | Buyer PII projection is not enforced by Organization-specific query DTOs yet. | Supplier-facing query regression risk. | Organization query layer must default to masked/limited Buyer fields. |
| P2 | Existing referral tables overlap with invitation/source concepts. | Wrong backfill source could create incorrect subordinate relationships. | Audit referral records before relation backfill. |
| P2 | Existing helper/RPC functions predate account_roles. | Future RLS policy may use stale role authority. | Review helper scope before Organization RLS SQL. |

## 14. Codex Next Step

Next task candidate:

- `docs/09-sprints/08-sprint-2-organization-implementation-plan.md`

Recommended scope for the next document:

1. Decide Sprint 2 code implementation boundary before DB migration.
2. Define Organization DTOs and query functions.
3. Specify compatibility behavior for `suppliers.company_id`, `students.professor_id`, and `country_agents`.
4. Decide whether Task 02 should be type/query-only or whether relation migration readiness must come first.
5. Define minimal tests for no Buyer PII leakage and Professor subordinate Student access.

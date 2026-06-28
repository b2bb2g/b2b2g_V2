# Codex Repository Audit

## 1. Current Repository Summary

이 감사는 코딩 구현을 시작하기 전, 현재 저장소의 기존 구현과 새 Source of Truth 문서가 얼마나 일치하는지 확인하기 위한 사전 점검이다.

- Audit date: 2026-06-28
- Repository: `b2bb2g-v2`
- Git branch: `main`
- Scope: `app/`, `components/`, `lib/`, `supabase/migrations/`, `types/`, 핵심 문서
- PDCA feature checked: `b2bb2g-mvp`
- Gap Analysis: `bkit_pdca_analyze` 기준으로 구현 전 분석 필요 상태 확인
- Implementation policy: 기존 코드는 즉시 삭제하지 않고 `Reuse / Refactor / Replace / Hold / Security Fix Required`로 분류

현재 저장소는 단순 문서 저장소가 아니라 Next.js App Router, Supabase, Dashboard, Admin, Public site 구현이 이미 존재한다. 다만 새 플랫폼 원칙은 기존 구현보다 상위 Source of Truth이며, 특히 다음 기준이 기존 코드 판단의 최우선 기준이다.

- B2BB2G는 단순 B2B 쇼핑몰이 아니라 Global Trade Operating System이다.
- Account와 Role은 분리되어야 하며, 하나의 Account는 여러 Role을 가질 수 있어야 한다.
- Supplier-Buyer 직접 연락은 기본 금지되고 모든 Buyer-Supplier 문의는 Admin Brokerage를 거쳐야 한다.
- Buyer 이메일, 전화번호, 담당자명은 플랫폼 핵심 자산이며 Supplier에게 직접 노출하면 안 된다.
- Student는 제품을 직접 등록하지 않는다.
- 모든 공개 콘텐츠는 관리자 승인 후 노출되어야 한다.
- 모든 화면은 UI Design System Engine과 Landing Page Builder Engine 기준으로 정렬되어야 한다.

## 2. Document Source of Truth

이번 감사에서 우선 적용한 문서 우선순위는 다음과 같다.

| Priority | Document | Role |
|---:|---|---|
| 1 | `docs/01-architecture/01-platform-engine-module-plugin.md` | Engine / Module / Plugin 구조의 최상위 기준 |
| 2 | `docs/01-architecture/02-platform-experience-standard.md` | 플랫폼 공통 UX, 액션, 메시지, 업로드, 감사 로그 기준 |
| 3 | `docs/02-experience/01-user-journey.md` | Role별 허용/금지 행동 기준 |
| 4 | `docs/02-experience/02-workflow-standard.md` | 가입, 승인, 문의, 제안, 메시지 흐름 기준 |
| 5 | `docs/02-experience/03-state-machine.md` | 상태값과 전이 기준 |
| 6 | `docs/02-experience/04-sub-page-ui-standard.md` | 상세 페이지, Dashboard, Admin UI 블록 기준 |
| 7 | `docs/07-implementation/00-existing-code-reuse-policy.md` | 기존 코드 재사용/교체 판단 기준 |
| 8 | `AGENTS.md` | 작업 절차, bkit, 코딩 규칙, 일부 레거시 프로젝트 맥락 |
| 9 | `docs/01-plan/features/b2bb2g-mvp.plan.md` | 기존 MVP 계획 문서. 새 아키텍처 문서와 충돌하면 새 문서를 우선 |
| 10 | `docs/02-design/features/b2bb2g-mvp.design.md` | 기존 MVP 설계 문서. 새 아키텍처 문서와 충돌하면 새 문서를 우선 |
| 11 | `docs/02-design/features/ERD.md` | 기존 DB 설계 참고. 새 Account/Role/Engine 구조와 충돌하면 재설계 대상 |
| 12 | `docs/02-design/features/RLS.md` | 기존 RLS 설계 참고. 새 보안 원칙과 충돌하면 재설계 대상 |
| 13 | `DESIGN.md` | 기존 UI 참고 문서. 현재 내용은 새 UI Design System Engine과 충돌 가능성이 큼 |

주의: `AGENTS.md`에는 “현재 저장소는 실제 Next.js 앱 scaffold 전 단계”라는 오래된 설명이 남아 있다. 실제 저장소에는 이미 Next.js 앱 코드가 존재하므로 이 설명은 현재 코드 상태와 충돌한다.

## 3. Existing File Inventory

| Path | Current Purpose | Related Engine | Related Module | Current Status | Recommendation |
|---|---|---|---|---|---|
| `AGENTS.md` | 에이전트 작업 규칙과 레거시 SOT 정리 | Governance | Agent Operating Rules | Refactor | 새 Engine/Module/Plugin 문서 우선순위와 현재 scaffold 상태를 반영하도록 이후 갱신 |
| `README.md` | 기본 Next.js 안내 | Governance | Project Overview | Replace | B2BB2G 플랫폼 소개, 실행법, SOT 링크로 교체 |
| `DESIGN.md` | Apple 스타일 중심 UI 분석 | UI Design System Engine | Visual Reference | Replace | 새 UI Design System Engine 기준 문서로 재작성 필요 |
| `DESIGN-DETAIL.md` | 현재 루트에 없음 | UI Design System Engine | Design Tokens | Hold | UI Engine 설계 확정 후 생성 |
| `docs/01-architecture/01-platform-engine-module-plugin.md` | 플랫폼 구조 최상위 기준 | All Engines | Architecture | Reuse | 현 구현 판단의 최상위 기준으로 유지 |
| `docs/01-architecture/02-platform-experience-standard.md` | 공통 UX/액션 표준 | Experience Engine | Workflow Standard | Reuse | Dashboard/Admin/Public UI 구현 기준으로 유지 |
| `docs/02-experience/01-user-journey.md` | Role별 Journey | Identity / Organization / Brokerage | Role Journey | Reuse | 권한/RLS/화면 접근 기준으로 유지 |
| `docs/02-experience/02-workflow-standard.md` | 업무 흐름 표준 | Approval / Brokerage / Communication | Workflow | Reuse | Server Action, RLS, Admin Queue 설계 기준으로 유지 |
| `docs/02-experience/03-state-machine.md` | 상태값과 전이 | Approval / Marketplace / Brokerage | State Machine | Reuse | DB enum/check constraint와 UI 상태 표시 기준으로 유지 |
| `docs/02-experience/04-sub-page-ui-standard.md` | 하위 화면 UI 기준 | UI Design System Engine | Page Standard | Reuse | 상세 페이지와 Dashboard 재설계 기준으로 유지 |
| `docs/07-implementation/00-existing-code-reuse-policy.md` | 기존 코드 처리 기준 | Governance | Reuse Policy | Reuse | 모든 기존 코드 분류 기준으로 유지 |
| `docs/01-plan/features/b2bb2g-mvp.plan.md` | 기존 MVP 계획 | Governance | Legacy Plan | Hold | 새 문서와 충돌하지 않는 범위에서 참고 |
| `docs/02-design/features/b2bb2g-mvp.design.md` | 기존 MVP 설계 | Governance | Legacy Design | Hold | 새 Engine 기준으로 재매핑 필요 |
| `docs/02-design/features/ERD.md` | 기존 ERD | Identity / Marketplace / Communication | Legacy Data Model | Refactor | Account/Role 분리, Brokerage, 상태 머신 기준으로 재검토 |
| `docs/02-design/features/RLS.md` | 기존 RLS 설계 | Security / Permission | Legacy RLS | Refactor | Buyer PII, Supplier-Buyer 직접 연락 금지, service role 우회 금지 기준으로 재검토 |
| `app/(public)/page.tsx` | Public landing page | Landing Page Builder Engine | Landing Page | Replace | 샘플 데이터와 하드코딩 섹션을 Builder/승인 콘텐츠 기반으로 교체 |
| `app/(public)/commercial/page.tsx` | Commercial listing | Marketplace Engine | Public Listing | Refactor | 승인 콘텐츠 필터는 유지하되 샘플 fallback 제거 및 UI Engine 정렬 |
| `app/(public)/industrial/page.tsx` | Industrial listing | Marketplace Engine | Public Listing | Refactor | 승인 콘텐츠 필터는 유지하되 Engine/Module 기준으로 재정렬 |
| `app/(public)/epc/page.tsx` | EPC listing | Marketplace Engine | Public Listing | Refactor | 승인 콘텐츠 필터와 상태값을 새 state machine 기준으로 조정 |
| `app/(public)/buy-sell/page.tsx` | BUY & SELL listing | Buy Request / Marketplace Engine | Public Listing | Refactor | SELL PRODUCTS와 BUY REQUEST 분리 기준 재검토 |
| `app/(public)/buy-sell/[id]/page.tsx` | 샘플 기반 BUY & SELL detail | Marketplace Engine | Detail Page | Replace | 샘플 detail 라우트 제거 또는 실제 승인 데이터 detail로 재구현 |
| `app/(public)/companies/[slug]/page.tsx` | Company microsite detail | Company Microsite Engine | Public Company Page | Refactor | Admin Brokerage Notice, 승인 상태, Buyer PII 보호 CTA 기준 추가 |
| `app/(auth)/*` | Login, signup, member type selection | Identity Engine | Account / Role Onboarding | Refactor | 단일 member type 선택 흐름을 multi-role account 모델로 전환 |
| `app/(dashboard)/dashboard/page.tsx` | Role dashboard entry | Admin Control / Organization | Dashboard | Refactor | Role Switcher, Role별 Dashboard Shell, multi-role context 필요 |
| `app/admin/*` | Admin dashboard pages | Admin Control Engine | Admin Console | Refactor | Engine별 Admin Queue, Audit Log, Korean Admin UI 기준으로 재구성 |
| `components/public/*` | Public site components | Marketplace / Landing Builder / UI Engine | Public UI | Refactor | UI Design System 컴포넌트와 Translation Key 기반으로 정렬 |
| `components/dashboard/dashboard-pages.tsx` | Role별 dashboard rendering | Organization / Admin Control | Dashboard UI | Refactor | multi-role, dashboard block standard, PII 노출 여부 재검토 |
| `components/dashboard/referral-tools.tsx` | 추천/멘토/학생 연락처 표시 | Organization / Student Growth | Referral UI | Refactor | Professor-Student 허용 범위는 유지 가능하나 이메일 노출은 role gating 명시 필요 |
| `components/admin/*` | Admin management UI | Admin Control / Approval | Admin UI | Refactor | Approval Queue, Brokerage Queue, Audit Action 기준으로 재정렬 |
| `components/shared/*` | Shared UI atoms | UI Design System Engine | Shared Components | Reuse | 토큰/문구/접근성 기준 보강 후 재사용 |
| `lib/supabase/server.ts` | Server Supabase client | Identity / Security | Server Data Access | Reuse | Server-only client로 유지 |
| `lib/supabase/browser.ts` | Browser Supabase client | Identity | Client Auth | Reuse | public anon key만 사용해야 함 |
| `lib/supabase/proxy.ts` | Supabase session proxy | Identity | Session | Reuse | Next.js 버전 기준 유지 |
| `lib/supabase/admin.ts` | Service role admin client | Security / Admin Control | Privileged Access | Security Fix Required | `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` fallback 제거, server-only guard 강화 |
| `lib/auth/guards.ts` | Route guard | Identity / Organization | Account Role Guard | Refactor | `profiles.member_type_id` 단일 Role 의존을 multi-role resolver로 교체 |
| `lib/actions/auth.ts` | Auth/signup actions | Identity / Invitation | Signup | Refactor | Role invitation, multi-role assignment, approval state 기준으로 재검토 |
| `lib/actions/business.ts` | Product/message/business actions | Marketplace / Communication / Brokerage | Domain Actions | Security Fix Required | `sendMessage` service role fallback과 직접 메시지 가능성 제거 |
| `lib/actions/dashboard-products.ts` | Dashboard product actions | Marketplace Engine | Product Management | Refactor | Student 제품 직접 등록 금지와 Supplier/Admin ownership 기준 확인 |
| `lib/actions/referrals.ts` | Referral actions | Invitation / Organization | Referral | Refactor | Agent-Buyer, Professor-Student, Buyer referral 정책으로 분리 |
| `lib/actions/admin-*` | Admin mutations | Admin Control / Approval | Admin Actions | Refactor | Audit Log, Confirmation, State Machine 기준 보강 |
| `lib/queries/public-content.ts` | Public listing/detail query with sample fallback | Marketplace / Landing Builder | Public Content Query | Replace | `mergeWithSamples`와 샘플 fallback 제거, approved/published 데이터만 조회 |
| `lib/queries/sample-public-content.ts` | Public sample data adapter | Landing Builder | Sample Adapter | Replace | 실제 UI에서 제거하고 seed/demo 전용으로 격리 |
| `lib/sample/public-samples.ts` | 샘플 콘텐츠 | Landing Builder | Demo Data | Replace | production UI와 분리 |
| `lib/queries/companies.ts` | Company public query | Company Microsite Engine | Public Company Query | Refactor | 승인/활성 필터는 유지, Brokerage CTA와 노출 필드 재검토 |
| `lib/queries/dashboard.ts` | Dashboard aggregate query | Organization / Communication / Student Growth | Dashboard Data | Security Fix Required | admin fallback, email select, messaging participant PII, hardcoded text 재검토 |
| `lib/queries/admin-*` | Admin aggregate query | Admin Control Engine | Admin Query | Refactor | Engine별 queue와 audit source 정렬 |
| `lib/i18n/translation.ts` | Translation dictionary | UI Design System Engine | i18n | Refactor | 하드코딩 문구를 Translation Key로 흡수하고 DB-backed translation 계획 검토 |
| `lib/audit/logs.ts` | Audit log helper | Admin Control / Approval | Audit | Reuse | 모든 state/action change에 연결 확대 |
| `lib/validators/*` | Server action validators | Security | Validation | Reuse | Engine별 boundary validation으로 확장 |
| `supabase/migrations/*_domain.sql` | Current database schema | All Domain Engines | Data Model | Refactor | Engine/Module 주석, Account/Role, Brokerage, State Machine 기준으로 재작성 필요 |
| `supabase/migrations/*_rls.sql` | Current RLS policies | Security / Permission | RLS | Security Fix Required | Buyer PII, direct messaging, service-role bypass, approved public filter 기준 재검토 |
| `supabase/seed/*` | Seed settings and foundation data | Settings / Identity | Seed | Refactor | 하드코딩 메뉴/카테고리/Role/Rank와 Engine 기준 일치 여부 확인 |
| `types/database.ts` | Generated Supabase types | Data Model | Types | Refactor | 새 migration 적용 후 재생성 필요 |
| `types/i18n.ts` | i18n type definitions | UI Design System Engine | i18n Types | Reuse | Translation Key 강화 시 확장 |

## 4. Security Risk Findings

### P0. Public service role environment fallback

- File: `lib/supabase/admin.ts`
- Finding: `SUPABASE_SERVICE_ROLE_KEY`가 없으면 `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`를 fallback으로 읽는다.
- Risk: `NEXT_PUBLIC_*` 환경변수는 클라이언트 번들 노출 가능성이 있는 이름 규칙이다. Service role key는 절대 public prefix를 사용하면 안 된다.
- Required action: fallback 제거, `SUPABASE_SERVICE_ROLE_KEY`만 허용, server-only guard 추가.

### P0. Message insert service role bypass

- File: `lib/actions/business.ts`
- Finding: `sendMessage`에서 일반 RLS insert 실패 후 admin service client로 재시도하는 경로가 있다.
- Risk: RLS가 최종 접근 제어 계층이어야 한다는 원칙과 충돌한다. RLS 실패를 service role로 우회하면 정책 누락이나 관계 검증 실패가 숨겨진다.
- Required action: service role fallback 제거, Communication Engine + Trade Brokerage Engine 기준 RLS와 server-side authorization 재설계.

### P0. Supplier-Buyer direct communication prevention is not explicit

- File: `lib/actions/business.ts`, `supabase/migrations/20260618146000_conversation_message_notification_domain.sql`, `supabase/migrations/20260618147000_conversation_message_notification_rls.sql`
- Finding: 현재 메시지 전송 흐름은 conversation membership 중심이며, Supplier-Buyer 직접 연락 금지를 Engine 정책으로 명시적으로 차단하는 구조가 확인되지 않았다.
- Risk: Supplier와 Buyer가 같은 conversation member가 되면 Admin Brokerage를 우회할 수 있다.
- Required action: conversation type, participant role, brokerage case, admin mediated channel을 분리한다.

### P1. Buyer and participant email selection in dashboard queries

- File: `lib/queries/dashboard.ts`
- Finding: dashboard query에서 `profiles.email`을 넓게 select하고 participant object에 email을 포함한다.
- Risk: 현재 화면에 표시하지 않더라도 서버 컴포넌트/클라이언트 전달 경계에서 불필요한 PII가 섞일 수 있다. Buyer 이메일/전화번호/담당자명은 플랫폼 핵심 자산이다.
- Required action: Role별 필요한 필드만 select하고, Supplier-facing data contract에서는 Buyer PII를 제거한다.

### P1. Public sample data mixed into production UI

- File: `lib/queries/public-content.ts`, `lib/sample/public-samples.ts`, `app/(public)/page.tsx`, `app/(public)/buy-sell/[id]/page.tsx`
- Finding: `mergeWithSamples`와 sample fallback이 실제 public listing/detail에 섞인다.
- Risk: 관리자 승인 전 콘텐츠만 공개한다는 원칙을 흐린다. 샘플 데이터가 실제 운영 UI에 노출되면 콘텐츠 승인/감사 흐름을 우회한다.
- Required action: production route에서 sample fallback 제거. 샘플은 seed/demo/storybook 전용으로 격리.

### P1. Generic admin Supabase fallback in dashboard data

- File: `lib/queries/dashboard.ts`
- Finding: 일부 dashboard 데이터 조회에서 optional admin client를 사용한다.
- Risk: Professor-Student처럼 허용 관계가 있는 경우에도 RLS가 아니라 admin fallback으로 조회하면 향후 role boundary가 깨질 수 있다.
- Required action: 조직 관계 기반 RLS 또는 제한 view로 대체.

## 5. Source of Truth Conflicts

| Conflict | Current Implementation | New Source of Truth | Severity | Recommendation |
|---|---|---|---|---|
| Account/Role model | `profiles.member_type_id` 단일 member type 중심 guard | Account와 Role 분리, one account multi-role | High | Identity Engine의 Account Role Resolver로 재설계 |
| Supplier-Buyer messaging | conversation membership 기반 메시지 구조 | Supplier-Buyer 직접 연락 금지, Admin Brokerage 필수 | High | Trade Brokerage Engine을 중심으로 inquiry/proposal/message 흐름 분리 |
| Buyer PII | dashboard query에서 email select가 넓음 | Buyer email/phone/contact name은 플랫폼 핵심 자산 | High | Supplier-facing DTO와 RLS에서 Buyer PII 제거 |
| Public content | sample fallback과 landing hardcoded content | 모든 공개 콘텐츠는 관리자 승인 후 노출 | High | sample fallback 제거, approved/published content만 조회 |
| Landing page | `app/(public)/page.tsx`에 하드코딩 섹션 | Landing Page Builder Engine 기준 구성 | Medium | Builder section model과 admin-managed content로 전환 |
| UI design | `DESIGN.md`가 Apple site 분석 중심 | UI Design System Engine 기준 | Medium | B2BB2G 전용 Design System 문서로 교체 |
| State values | 기존 코드/DB는 `approval_status` 중심 | 새 state machine은 product/status/inquiry/proposal별 상태 정의 | Medium | 상태값 migration과 UI label 매핑 재정렬 |
| AGENTS repo status | “scaffold 전 단계”라고 설명 | 실제 Next.js 구현 존재 | Medium | AGENTS.md 현행화 |

## 6. UI Consistency Issues

- Public landing page가 Landing Page Builder Engine이 아니라 파일 내부 하드코딩 배열과 샘플 데이터에 의존한다.
- Public page와 Dashboard page에 UI text가 여러 곳에서 직접 작성되어 Translation Key 정책과 충돌한다.
- `DESIGN.md`는 B2BB2G 전용 UI Design System이 아니라 Apple 스타일 분석에 가깝다.
- Dashboard에는 새 문서가 요구하는 Role Switcher, KPI, Quick Actions, Recent Activity, Notifications, Calendar/Schedule, Message Preview가 Engine 기준으로 분리되어 있지 않다.
- Public detail page는 Admin Brokerage Notice가 Inquiry CTA 근처에 명시되어야 하나, 현재 전체 detail 구조에서 일관되게 확인되지 않는다.
- Admin UI는 한국어 기준이지만, 일부 데이터/상태/메시지 구조가 Translation Key와 state machine에 충분히 연결되어 있지 않다.

## 7. Data / RLS / Permission Issues

- `profiles.member_type_id` 중심 모델은 multi-role account 원칙과 맞지 않는다. 이미 `profile_roles` 관련 migration이 있으나 route guard와 dashboard context는 여전히 단일 member type에 강하게 묶여 있다.
- RLS는 기존 문서와 migration 기준으로 넓게 존재하지만, 새 Engine 기준의 관계 제한이 충분한지 재검증이 필요하다.
- Communication RLS는 conversation membership만으로는 Supplier-Buyer 직접 연락 금지 원칙을 보장하기 어렵다.
- Dashboard query에서 role-specific 최소 필드 원칙이 약하다. Email을 fallback display name 또는 participant data로 넓게 사용한다.
- Public content query는 승인 필터를 적용하는 부분이 있으나, sample fallback이 승인 정책을 약화한다.
- State machine 문서의 상태값과 기존 DB의 `approval_status` 중심 모델을 대조해야 한다.
- Service role은 Admin Control Engine 내부에서도 제한적이고 감사 가능한 작업에만 사용해야 한다. 일반 사용자 action의 fallback으로 사용하면 안 된다.

## 8. Existing Code Reuse Plan

### Reuse

- Supabase server/browser/proxy client 기본 구조
- Shared UI atom 일부
- Audit log helper
- Validator 구조
- 승인 필터가 이미 들어간 public/company query의 일부 패턴
- Admin management page의 기본 page/action separation

### Refactor

- Auth/signup/member type selection을 Account + multi-role 기반으로 재구성
- Dashboard data contract를 Role별 최소 필드로 분리
- Admin pages를 Engine별 queue 중심으로 재구성
- Public listing/detail을 Engine/Module별 route contract로 재정렬
- Translation dictionary와 하드코딩 UI text를 통합
- 기존 migration을 Engine/Module annotation, state machine, RLS relation 기준으로 재작성

### Replace

- Public sample fallback
- `app/(public)/buy-sell/[id]/page.tsx` 샘플 detail 구현
- `README.md` 기본 Next.js 문서
- 현재 `DESIGN.md`의 Apple 분석 중심 UI 문서
- Production UI에 직접 연결된 sample adapter

### Hold

- 기존 plan/design/ERD/RLS 문서: 새 문서와 충돌하지 않는 범위에서 참고
- 기존 migrations: 삭제하지 않고 새 migration 설계 시 비교 기준으로 보관
- `DESIGN-DETAIL.md`: 현재 없음. UI Engine 설계 후 생성

## 9. Recommended Implementation Order

1. Security P0 fix plan 확정
   - `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` fallback 제거
   - `sendMessage` service role fallback 제거
   - Supplier-Buyer direct messaging 차단 설계

2. Identity Engine foundation
   - Account와 Role 분리
   - multi-role resolver
   - Role Switcher contract
   - 기존 `profiles.member_type_id` 의존 제거 계획

3. Communication + Trade Brokerage Engine 설계
   - Inquiry Case
   - Admin Broker Queue
   - Supplier Proposal
   - Buyer Delivery
   - 메시지/첨부/RLS 재설계

4. Public Content exposure cleanup
   - sample fallback 제거
   - approved/published 필터 확정
   - Landing Page Builder Engine section model 설계

5. UI Design System Engine 정리
   - `DESIGN.md` 교체
   - `DESIGN-DETAIL.md` 생성
   - Translation Key와 component token 확정

6. Database/RLS migration redesign
   - Engine/Module 주석
   - state machine 반영
   - PII-safe view 또는 scoped query 설계

7. Existing code refactor execution
   - Reuse 대상부터 묶고 Replace 대상은 새 구조가 준비된 뒤 제거

## 10. Files Not To Touch Yet

아래 파일은 이번 감사 이후에도 즉시 삭제하거나 대규모 수정하지 않는다. 새 설계와 migration 계획이 확정된 뒤 단계적으로 처리한다.

- `supabase/migrations/*`
- `types/database.ts`
- `docs/01-plan/features/b2bb2g-mvp.plan.md`
- `docs/02-design/features/b2bb2g-mvp.design.md`
- `docs/02-design/features/ERD.md`
- `docs/02-design/features/RLS.md`
- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/dashboard-pages.tsx`
- `lib/queries/dashboard.ts`
- `lib/actions/business.ts`

예외: `lib/supabase/admin.ts`의 public service role fallback은 P0 보안 이슈이므로 사용자 승인 후 즉시 수정 후보로 처리할 수 있다.

## 11. Immediate Fix Candidates

| Priority | Candidate | Reason | Suggested Scope |
|---|---|---|---|
| P0 | `lib/supabase/admin.ts` public service role fallback 제거 | secret exposure 위험 | 단일 파일 보안 수정 |
| P0 | `lib/actions/business.ts` message service role retry 제거 | RLS 우회 위험 | Communication action + RLS 흐름 점검 |
| P0 | Supplier-Buyer direct conversation 차단 | 플랫폼 핵심 원칙 위반 가능 | Conversation type과 brokerage case 설계 |
| P1 | `mergeWithSamples` production 연결 제거 | 승인 전 콘텐츠 노출 원칙 위반 | Public query + landing page 정리 |
| P1 | Dashboard email select 최소화 | Buyer PII 보호 | Role별 DTO 분리 |
| P1 | `lib/auth/guards.ts` multi-role 준비 | Account/Role 분리 원칙 충돌 | Role resolver 설계 후 구현 |
| P2 | `README.md` 교체 | 프로젝트 이해/운영 문서 부정확 | 문서 작업 |
| P2 | `DESIGN.md` 교체 | UI Engine 기준 부재 | 디자인 시스템 문서 작업 |

## 12. Codex Next Step Proposal

다음 Codex 작업은 바로 구현을 넓게 시작하지 말고, 아래 순서로 좁게 진행하는 것이 안전하다.

1. `P0 Security Patch Plan` 문서를 짧게 작성한다.
2. 사용자 승인 후 `lib/supabase/admin.ts`의 public service role fallback을 먼저 제거한다.
3. `sendMessage`의 service role retry 제거와 Supplier-Buyer direct messaging 차단 설계를 별도 design patch로 만든다.
4. Identity Engine의 Account/Role resolver 설계를 작성한다.
5. Public sample fallback 제거 범위를 확정한 뒤 Landing Page Builder Engine으로 교체한다.

이번 감사의 결론은 “기존 구현은 폐기 대상이 아니라 기반 재사용 대상이 많지만, 보안 경계와 Account/Role 구조, Admin Brokerage 원칙은 새 Source of Truth 기준으로 우선 재정렬해야 한다”이다.

# Platform Structure Audit: B2BB2G_V2

> 작성일: 2026-06-28
> 대상 경로: `/Users/hello_j/Desktop/b2bb2g-v2`
> 목적: 전체 플랫폼 구조, 현재 구현 상태, 미비 영역, 다음 설계/구현 우선순위 점검

---

## 1. 요약

현재 프로젝트는 더 이상 단순 scaffold 단계가 아니다. Next.js App Router, Supabase SSR, Auth guard, Public/Auth/Dashboard/Admin 라우트, Server Actions, Supabase migration/RLS, i18n helper, SEO/sitemap 구조가 이미 들어와 있다.

기존 `b2bb2g-mvp` PDCA는 archived 상태이며, MVP 리포트는 설계 대비 구현 일치율 99%를 기록하고 있다. 다만 실제 운영 준비 관점에서는 다음 네 영역이 아직 남아 있다.

1. Public 일부 화면의 sample data fallback 제거 및 실데이터 운영 전환
2. Storage bucket policy와 파일 업로드 UI 연결
3. Admin/Member dashboard의 운영 기능 고도화
4. README, AGENTS, Plan 체크박스 등 문서 정합성 정리

---

## 2. 확인한 근거

### 2.1 PDCA 상태

- `bkit_init` 기준 프로젝트 레벨: Dynamic
- `b2bb2g-mvp`: archived
- 주요 active feature:
  - `landing-service-catalog`: act
  - `landing-header-navigation`: act
  - `dashboard-company`: check
  - `dashboard-messages`: check
  - landing 계열 일부: report

### 2.2 검증 명령 결과

| 항목 | 결과 |
|---|---:|
| `npm run lint` | 통과 |
| `npm run typecheck` | 통과 |
| `npm run build` | 통과 |
| App Router page 파일 | 42개 |
| Supabase migration 파일 | 27개 |
| `create table` 선언 | 62개 |
| RLS enabled 선언 | 62개 |
| `lib/actions` 파일 | 10개 |
| `lib/queries` 파일 | 9개 |
| `components/**/*.tsx` 파일 | 25개 |

`npm run test:rls`는 실행하지 않았다. 해당 스크립트는 `.env.local`, DB 접속 정보, 테스트 계정, fixture 생성/삭제를 사용하므로 구조 감사 단계에서 원격 DB를 변경할 수 있다.

---

## 3. 현재 플랫폼 구조

### 3.1 Frontend

- `app/(public)`: 홈, Commercial, Industrial, EPC, BUY & SELL, Event, Networking, Notice, Service, Company detail, policy pages
- `app/(auth)`: login, signup, member type select, pending approval
- `app/(dashboard)`: dashboard, account, company, products, referrals, messages, activities
- `app/admin`: admin home, members, companies, content, generic module route
- `components/public`: landing/public content UI
- `components/dashboard`: member workspace UI
- `components/admin`: admin operation UI
- `components/shared`: site shell, badge, JSON-LD, feedback, brand logo

### 3.2 Backend/Application Boundary

- Supabase server/browser/proxy clients are split under `lib/supabase`.
- Auth and route guards are under `lib/auth`.
- Data writes are concentrated in `lib/actions`.
- Data reads are concentrated in `lib/queries`.
- Validation is separated under `lib/validators`.
- Admin audit helpers are under `lib/audit`.

This matches the design principle that Client Components collect/display UI state while Server Actions and server-side queries handle data boundaries.

### 3.3 Database/RLS

The migration set covers the MVP domain broadly:

- identity/master data
- member/company
- settings/menu/category/translation
- product/industrial/EPC/BUY & SELL/buy request content
- student showcase and market research
- matching/referral/reward/badge
- events and Thailand FDA
- conversations/messages/notifications
- files/storage metadata
- SEO/featured content
- analytics/KPI
- admin/audit/activity logs
- member referral codes

The number of `create table` declarations and RLS enable statements both resolve to 62, so the local migration files are structurally aligned on table count and RLS enablement.

---

## 4. 주요 미비 사항

### P0. Source-of-truth drift

문서 상태가 서로 다르다.

- `docs/04-report/b2bb2g-mvp.report.md` and `docs/03-analysis/b2bb2g-mvp.analysis.md` say MVP implementation reached report/archive quality.
- `README.md` is still the default create-next-app document.
- `AGENTS.md` contains old wording that says the repo is before real Next.js scaffold.
- `docs/01-plan/features/b2bb2g-mvp.plan.md` still has many unchecked checklist items even though later reports mark implementation complete.

Impact: 새 기능 설계 시 어떤 문서를 믿어야 하는지 혼선이 생긴다.

Recommended feature slug: `platform-docs-source-of-truth`

### P0. Public sample data still appears in production routes

Several public routes still directly use sample content:

- home landing sections
- Event list/detail
- Networking list/detail
- Notice list/detail
- Service list/detail
- legacy `/buy-sell/[id]`
- public content query fallback via `mergeWithSamples`

Impact: 운영 데이터가 비어 있을 때도 sample records가 실제 콘텐츠처럼 보일 수 있다. Launch 전에는 demo mode와 production mode를 명확히 분리해야 한다.

Recommended feature slug: `public-content-production-data`

### P1. Storage policy and upload workflow are not complete

Report follow-up already lists Storage bucket policy and file upload UI connection as unfinished. DB metadata table `files` exists, but product/company/FDA/message attachment workflows need actual upload, permission check, and restricted/public bucket behavior to be finished.

Impact: 인증서, 카탈로그, FDA 문서, 메시지 첨부가 운영 기능으로 닫히지 않는다.

Recommended feature slug: `storage-upload-workflow`

### P1. Admin dashboard needs operational depth

Admin pages exist for members, companies, content, and management actions. Remaining depth:

- audit log browsing and filtering
- platform KPI/operations overview
- settings-driven menu/category/translation editor polish
- FDA/event/matching/message operation queues
- admin notification workflows

Impact: DB와 action은 있으나 운영자가 매일 쓰는 console로는 아직 얕다.

Recommended feature slug: `admin-operations-console`

### P1. Member dashboard needs role-specific completion

Dashboard pages exist for overview, company, products, referrals, messages, activities, account. Remaining depth:

- Supplier: product/FDA/company document workflow
- Buyer: buy request creation and matching follow-up UX
- Agent: assigned country buyer pipeline
- Professor: student activity and approval guidance
- Student: showcase/report/passport workflow
- All roles: empty state, shortcuts, notification/action center

Impact: role model은 설계되어 있지만 각 member type의 핵심 업무 완결성이 부족하다.

Recommended feature slug: `member-workspace-completion`

### P1. CI/CD and deployment readiness are not wired

`package.json` has good local scripts, but CI automation is still a follow-up item.

Required gates:

- lint
- typecheck
- build
- migration drift check
- RLS smoke test in a safe staging DB
- Vercel preview/prod environment separation

Recommended feature slug: `deployment-ci-readiness`

### P2. Runtime observability and audit operations need UI

DB has `admin_logs`, `audit_events`, `activity_logs`, and analytics/KPI tables. The missing part is a readable operating surface:

- admin log search
- actor/action/target filters
- security event review
- RLS blocked-event review if logged
- dashboard KPI rollups

Recommended feature slug: `audit-observability-console`

---

## 5. 다음 설계/구현 권장 순서

### Step 1. `platform-docs-source-of-truth`

Goal: README, AGENTS, Plan/Design/Report 상태를 현재 구현 기준으로 정렬한다.

Why first: 문서가 흔들리면 이후 기능별 source of truth가 계속 충돌한다.

Deliverables:

- README replacement
- AGENTS current-state correction
- Plan checklist reconciliation or archive note
- docs index or current status note

### Step 2. `public-content-production-data`

Goal: production public pages에서 sample fallback을 제거하거나 demo mode로 격리한다.

Deliverables:

- `NEXT_PUBLIC_DEMO_CONTENT_ENABLED` 또는 server-only setting 기준 정의
- public content list/detail query behavior 정리
- empty state and 404 behavior
- landing sections real-data query path

### Step 3. `storage-upload-workflow`

Goal: 파일 메타데이터, Supabase Storage bucket policy, UI upload를 연결한다.

Deliverables:

- bucket policy design
- upload Server Action
- file validation
- company certificate/catalog upload
- message attachment upload
- FDA document upload

### Step 4. `admin-operations-console`

Goal: 운영자가 승인, 검증, 설정, 감사, 큐를 실제로 관리할 수 있게 만든다.

Deliverables:

- audit/activity log browser
- settings CRUD UI
- FDA/event/matching/message queues
- operational filters and bulk-safe actions

### Step 5. `member-workspace-completion`

Goal: 역할별 dashboard workflow를 닫는다.

Deliverables:

- Supplier product/FDA/company document flow
- Buyer buy-request/matching flow
- Agent country-buyer flow
- Professor student monitoring flow
- Student showcase/report/passport flow

---

## 6. 바로 구현하지 말아야 할 것

- 새 테이블을 먼저 추가하지 않는다. 이미 62개 테이블과 광범위한 RLS가 있으므로 기존 schema가 요구사항을 충족하는지 먼저 확인한다.
- `b2bb2g-mvp` archived lifecycle을 되살려서 새 작업을 섞지 않는다.
- sample content를 조용히 운영 콘텐츠처럼 유지하지 않는다.
- RLS fixture test를 production DB에서 실행하지 않는다.
- Translation key 정책을 깨고 UI 문자열을 직접 박지 않는다.

---

## 7. 결론

현재 플랫폼은 MVP 골격 구현과 빌드 품질은 통과한 상태다. 다음 작업은 "새 기능을 많이 추가"하기보다, 운영 전환을 막는 미비점을 feature 단위로 나눠 설계하고 닫는 방향이 맞다.

최우선은 `platform-docs-source-of-truth`와 `public-content-production-data`다. 이 두 가지를 먼저 정리해야 이후 Storage, Admin Console, Member Workspace 구현이 source-of-truth 충돌 없이 이어진다.

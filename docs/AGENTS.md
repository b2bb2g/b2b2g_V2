# B2BB2G_V2 Agent Instructions

이 문서는 `/Users/hello_j/Desktop/B2BB2G_V2`에서 작업하는 Codex 에이전트가 따라야 할 프로젝트 맥락과 작업 규칙이다.

## 1. 세션 시작 필수 절차

- 어떤 작업이든 첫 번째 액션은 반드시 `bkit_init`이다.
- 첫 사용자 요청은 `bkit_analyze_prompt`로 의도를 확인한다.
- 작업 전 `bkit_get_status b2bb2g-mvp`로 PDCA 상태를 확인한다.
- 파일을 쓰거나 수정하기 전 `bkit_pre_write_check(filePath)`를 호출한다.
- 의미 있는 변경 후 `bkit_post_write(filePath, linesChanged)`를 호출한다.
- 현재 feature는 `b2bb2g-mvp`, 현재 phase는 `do`다.
- bkit이 gap analysis를 권장하면 사용자에게 다음 단계로 `$pdca analyze b2bb2g-mvp`를 안내한다.

## 2. Source of Truth

기능, DB, RLS, 권한, 라우팅 판단은 아래 문서를 우선한다.

- Plan: `docs/01-plan/features/b2bb2g-mvp.plan.md`
- Design: `docs/02-design/features/b2bb2g-mvp.design.md`
- ERD: `docs/02-design/features/ERD.md`
- RLS: `docs/02-design/features/RLS.md`

`DESIGN.md`는 기능, DB, 권한, RLS 판단의 source of truth가 아니다.
단, UI, Layout, Component, Dashboard Structure, Page Structure, Navigation, UX 판단은 `/DESIGN.md`를 따른다.

## 3. 현재 저장소 상태

- 현재 저장소는 실제 Next.js 앱 scaffold 전 단계다.
- 중심 산출물은 PDCA 문서와 설계 문서다.
- 구현을 시작할 때는 Design의 `16. 구현 순서`, ERD의 `12. 구현 순서`, RLS의 `11. 구현 순서`를 함께 확인한다.
- Git 저장소가 아닐 수 있으므로 `git diff`가 실패하면 `rg`, `sed`, `nl`, `wc`로 검증한다.

현재 핵심 파일:

- `AGENTS.md`
- `DESIGN.md`
- `docs/01-plan/features/b2bb2g-mvp.plan.md`
- `docs/02-design/features/b2bb2g-mvp.design.md`
- `docs/02-design/features/ERD.md`
- `docs/02-design/features/RLS.md`

## 4. 프로젝트 정의

B2BB2G.COM은 한국 기업의 제품, 산업설비, EPC 프로젝트, BUY & SELL 게시글, Thailand FDA Service를 전세계 Buyer와 연결하는 관리자 통제형 글로벌 B2B 네트워크 플랫폼이다.

단순 쇼핑몰이 아니라 Supplier, Buyer, Agent, Professor, Student를 Member Type 기준으로 연결하고, Career Rank를 별도 성장 등급으로 관리하는 조직형 비즈니스 네트워크다.

MVP 핵심 축:

- 권한 구조
- 관리자 승인 시스템
- BUY & SELL 분리
- Buyer Referral
- Agent, Professor, Student 조직 구조
- Supabase RLS와 관리자 감사 로그

## 5. 기술 스택과 구조

목표 기술 스택:

- Frontend: Next.js App Router
- Backend: Supabase
- Database: Supabase PostgreSQL
- Auth: Supabase Auth
- Storage: Supabase Storage
- Deployment: Vercel
- UI: Mobile First, responsive

권장 디렉터리:

```text
app/
  (public)/
  (auth)/
  (dashboard)/
  admin/
components/
  public/
  dashboard/
  admin/
  forms/
  tables/
  shared/
lib/
  actions/
  audit/
  auth/
  queries/
  supabase/
  validators/
types/
supabase/
  migrations/
  seed/
```

Server Actions 또는 Route Handlers에서만 데이터 변경을 수행한다. Client Component는 UI 표시와 입력 수집만 담당한다.

## 6. 언어 정책

- Public Website 기본 언어: English
- Member Dashboard 기본 언어: English
- System Notifications: English
- Admin Dashboard 기본 언어: Korean
- Admin Notifications: Korean
- 모든 UI 텍스트는 Translation Key 기반으로 관리한다.
- 하드코딩된 언어 문자열 사용을 피한다.

라우트 slug는 영어를 유지하고, Admin UI 라벨은 한국어를 기본으로 한다.

## 7. Member Type과 Career Rank

Member Type은 권한과 대시보드 분리 기준이다.

- Administrator
- Supplier
- Buyer
- Agent
- Professor
- Student

Career Rank는 권한이 아니라 성장 등급이며 Member Type과 분리한다.

- Global Trade Ambassador
- Global Trade Associate
- Global Trade Specialist
- Global Trade Partner
- Global Trade Leader

Student 가입 시 `global_trade_ambassador`를 자동 부여한다. 졸업 처리 시 `global_trade_associate`로 전환한다.

## 8. Student 정책

- Student는 제품을 직접 등록하지 않는다.
- 제품 원본 데이터의 생성, 수정, 삭제 권한은 Supplier 또는 Administrator에게만 있다.
- Student는 승인된 Supplier 제품을 선택해 Student Showcase를 구성할 수 있다.
- Student Showcase는 제품 등록이 아니라 제품 소개, Buyer 유치, Matching 지원 활동이다.
- Showcase 공개는 `approval_status = approved` 기준이다.
- Global Trade Passport는 `students.passport_id` 없이 `activity_logs`, `career_ranks`, `badges`, `rewards`, `student_showcases`, `market_research_reports` 기반으로 계산한다.

## 9. 공개 메뉴와 라우팅

공개 메인 메뉴:

- Commercial
- Industrial
- EPC
- Event
- BUY & SELL
- Networking
- Thailand FDA Service
- Notice

Academy는 공개 메뉴에서 제외한다. Professor, Student, Alumni 관련 기능은 로그인 후 대시보드에서만 노출한다.

Public Company Page URL은 `/companies/[slug]`로 통일한다.

## 10. 콘텐츠와 승인 정책

- 관리자 승인 없는 콘텐츠는 외부에 노출하지 않는다.
- 공개 목록은 승인된 콘텐츠만 조회한다.
- Event는 관리자만 등록하고 회원은 참가 신청만 가능하다.
- Company Approval과 Company Verification은 분리한다.
- `approval_status`와 `verification_status`를 혼동하지 않는다.

BUY & SELL:

- `buy_sell_posts`: SELL PRODUCTS 전용
- `buy_requests`: BUY REQUEST 전용
- `buy_requests`의 국가 인덱스/컬럼은 `destination_country_id`를 사용한다.

## 11. 핵심 데이터 모델

최신 상세 컬럼은 ERD와 Design을 따른다.

주요 도메인:

- 인증/권한: `profiles`, `member_types`, `career_ranks`, `roles`, `permissions`, `role_permissions`, `profile_roles`
- 회원: `suppliers`, `buyers`, `agents`, `professors`, `students`
- 회사/검증: `companies`, `company_types`, `company_verifications`
- 국가/산업: `countries`, `regions`, `industries`, `country_agents`
- 콘텐츠: `products`, `industrial_posts`, `epc_posts`, `buy_sell_posts`, `buy_requests`
- Student 활동: `student_showcases`, `student_showcase_items`, `market_research_reports`
- 매칭/추천: `matching_requests`, `referral_codes`, `referral_relations`, `rewards`, `badges`
- Event/FDA: `events`, `event_applications`, `thailand_fda_applications`
- 커뮤니케이션: `conversations`, `conversation_members`, `messages`, `message_attachments`, `announcements`, `notifications`
- 설정/i18n: `menus`, `categories`, `banners`, `site_settings`, `languages`, `translations`
- 파일/SEO: `files`, `seo_metadata`, `featured_contents`
- Analytics: `analytics_events`, `buyer_sources`, `showcase_views`, `showcase_shares`, `showcase_inquiries`, `company_scores`
- 감사/활동: `admin_logs`, `audit_events`, `activity_logs`

선택 추천으로 논의된 `universities`, `event_organizers`, `catalog_downloads`, `lead_requests`는 아직 공식 설계에 반영된 필수 테이블이 아니다. 사용자가 명시적으로 추가 요청할 때만 반영한다.

## 12. RLS와 보안

모든 비즈니스 테이블은 Supabase RLS를 활성화한다. RLS는 최종 데이터 접근 제어 계층이다.

기본 원칙:

- Anonymous는 승인된 공개 콘텐츠만 읽는다.
- Authenticated user는 본인 프로필과 본인 소유 레코드만 접근한다.
- Admin은 운영상 필요한 모든 관리 테이블에 접근한다.
- Agent는 배정 국가와 하부 Buyer 범위에서만 접근한다.
- Professor는 본인 하부 Student 범위에서만 접근한다.
- Parent Buyer는 하부 Buyer의 제한 요약만 볼 수 있다.
- `service role key`는 클라이언트에 절대 노출하지 않는다.

RLS 세부 정책과 테스트 체크리스트는 `docs/02-design/features/RLS.md`를 따른다.

## 13. Referral과 개인정보

모든 Buyer는 기본 추천코드와 추천링크를 가진다.

Unique 정책:

- `referral_codes.buyer_id`
- `referral_codes.code`

상위 Buyer가 볼 수 있는 정보:

- 이름
- 회사명
- 국가
- 가입일
- 승인상태
- 활동상태
- 소싱 요청 수
- 문의 수
- 매칭 수
- 추천 보상 여부

상위 Buyer가 볼 수 없는 정보:

- 이메일 전체
- 전화번호 전체
- 상세 문의내용
- 계약금액
- 관리자 메모

보상은 자동 지급하지 않고 관리자 승인 기반으로 처리한다.

## 14. Communication 정책

- 1:1 메시지, 파일/PDF/이미지 첨부, 읽음 표시, 공지 발송을 지원한다.
- Agent는 하부 Buyer와만 소통한다.
- Professor는 하부 Student와만 소통한다.
- Admin은 전체 메시지를 열람하고 차단할 수 있다.
- 메시지와 첨부 파일은 conversation membership과 조직 관계 기준으로 제한한다.

## 15. Thailand FDA Service

MVP에서는 Thailand FDA Service만 운영한다.

카테고리:

- Cosmetic Registration
- Food Supplement Registration
- Food Registration
- Medical Device Registration
- Import License Support
- Label Compliance
- Formula Review

상태:

- draft
- submitted
- reviewing
- waiting_documents
- quoted
- in_progress
- completed
- rejected

Supplier는 신청하고, Admin은 검토, 견적, 상태 변경, 파일 관리, 완료 보고서를 관리한다.

## 16. Analytics와 Future Ready

현재 설계에는 다음 확장 방향이 반영되어 있다.

- Student Showcase KPI: `showcase_views`, `showcase_shares`, `showcase_inquiries`
- Buyer Acquisition Tracking: `buyer_sources`
- Marketplace Analytics: `analytics_events`
- Company Visibility Score: `company_scores`

Future Ready 항목:

- AI 번역
- AI Buyer/Supplier 추천
- 결제
- 전자계약
- B2G 프로젝트
- 국가별 멀티테넌트
- 공개 API

## 17. 구현 전 체크리스트

구현 전에 반드시 확인한다.

- 현재 PDCA 상태
- Plan, Design, ERD, RLS 문서
- 대상 파일의 `bkit_pre_write_check`
- 승인/권한/RLS 영향
- 공개 노출 여부
- 관리자 감사 로그 필요 여부
- 개인정보 마스킹 필요 여부

## 18. 코드 스타일과 안전 규칙

- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case
- 사용자 입력은 서버 경계에서 검증한다.
- 에러를 조용히 무시하지 않는다.
- `.env`, credentials, secret 파일을 커밋하거나 노출하지 않는다.
- UI 문구에 이모지를 사용하지 않는다.
- 하드코딩된 메뉴, 카테고리, Badge, Reward, Career Rank, 권한, 번역 문자열을 만들지 않는다.

## 19. 다음 권장 작업

현재 PDCA 상태 기준 다음 권장 작업은 gap analysis다.

```text
$pdca analyze b2bb2g-mvp
```

구현을 시작하려면 먼저 Next.js/Supabase scaffold를 만들고, DB migration과 RLS helper/policy SQL을 설계 문서 순서대로 작성한다.


## 20. Source of Truth Priority

기능, DB, 권한, UI, 라우팅 판단은 아래 문서를 우선한다.

1. Plan

   * `docs/01-plan/features/b2bb2g-mvp.plan.md`

2. Design

   * `docs/02-design/features/b2bb2g-mvp.design.md`

3. ERD

   * `docs/02-design/features/ERD.md`

4. RLS

   * `docs/02-design/features/RLS.md`

5. UI Design

   * `/DESIGN.md`

충돌 발생 시 위 우선순위를 따른다.

ERD는 Plan 또는 Design을 뒤집을 수 없다.

RLS는 Plan 또는 Design을 뒤집을 수 없다.

UI, Layout, Component, Dashboard Structure, Page Structure, Navigation, UX 판단은 `/DESIGN.md`를 따른다.

새로운 화면 생성 시 반드시 `/DESIGN.md`를 먼저 확인한다.



## UI Development Rules

새로운 페이지를 생성하기 전에 반드시 확인:

* `/DESIGN.md`
* `docs/01-plan/features/b2bb2g-mvp.plan.md`
* `docs/02-design/features/b2bb2g-mvp.design.md`

UI 구현 시:

* Public Website = English
* Admin Dashboard = Korean
* Translation Key 기반
* No Hardcoded Text
* No Emoji

Homepage 구조는 `/DESIGN.md`를 따른다.

Dashboard 구조는 `/DESIGN.md`를 따른다.

Company Detail Page 구조는 `/DESIGN.md`를 따른다.

Product Detail Page 구조는 `/DESIGN.md`를 따른다.

# b2bb2g-mvp - 설계 문서

> 버전: 2.0.0 | 작성일: 2026-06-18 | 상태: 완료
> 수준: Starter | 기준 Plan: docs/01-plan/features/b2bb2g-mvp.plan.md

---

## 1. 설계 개요

B2BB2G.COM MVP는 한국 기업의 제품, 산업설비, EPC 프로젝트, BUY & SELL 게시글, Thailand FDA Service를 전세계 바이어와 연결하는 관리자 통제형 글로벌 B2B 네트워크 플랫폼이다.

본 문서는 최신 Plan 문서를 기준으로 Next.js, Supabase, Supabase PostgreSQL, Supabase Auth, Supabase Storage, Vercel 기반 구현 설계를 다시 정의한다. 설계의 핵심은 공개 서비스는 English, 관리자 대시보드는 Korean을 기본 언어로 하며, 모든 메뉴와 카테고리, 권한, Badge, Reward, Career Rank, 국가, 산업, 기업 유형, 번역 문자열을 관리자 설정 기반으로 관리하는 것이다.

### 1.1 핵심 설계 목표

- Member Type과 Career Rank를 분리한다.
- Public Website는 English 기준으로 개발한다.
- Admin Dashboard는 Korean 기준으로 개발한다.
- 승인되지 않은 콘텐츠는 외부에 노출하지 않는다.
- Supabase RLS를 모든 핵심 비즈니스 테이블에 적용한다.
- 회사 승인과 회사 검증을 분리한다.
- Public Company Page와 SEO 구조를 MVP 필수 범위에 포함한다.
- BUY & SELL은 SELL PRODUCTS와 BUY REQUEST로 분리한다.
- Referral, Matching, Message, Notification, Audit 구조를 MVP에서 설계한다.

### 1.2 구현 기준 문서

- Plan: `docs/01-plan/features/b2bb2g-mvp.plan.md`
- Design: `docs/02-design/features/b2bb2g-mvp.design.md`
- PDCA Feature: `b2bb2g-mvp`
- Current PDCA Phase: `do`

## 2. 기술 아키텍처

### 2.1 기술 스택

| 계층 | 기술 | 역할 |
|------|------|------|
| Frontend | Next.js App Router | 공개 페이지, 회원 대시보드, 관리자 대시보드 |
| UI | React, Tailwind CSS 또는 CSS Modules | 모바일 우선 반응형 UI |
| Backend | Supabase | Auth, PostgreSQL, Storage, RLS |
| Database | Supabase PostgreSQL | 도메인 데이터, 승인, 검증, 감사 로그 |
| Auth | Supabase Auth | 회원가입, 로그인, 세션 |
| Storage | Supabase Storage | 제품 이미지, 인증서, FDA 문서, 메시지 첨부 |
| Deployment | Vercel | 웹 배포와 환경변수 관리 |

### 2.2 Next.js 디렉터리 구조

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
  constants/
  queries/
  supabase/
  validators/
types/
supabase/
  migrations/
  seed/
```

### 2.3 계층별 책임

| 경로 | 책임 |
|------|------|
| `app/(public)` | 승인된 공개 콘텐츠와 English Public Website |
| `app/(auth)` | 로그인, 회원가입, 역할별 온보딩 |
| `app/(dashboard)` | Member Type별 회원 대시보드 |
| `app/admin` | Korean Admin Dashboard와 운영 관리 |
| `lib/actions` | Server Actions 기반 쓰기 작업 |
| `lib/queries` | RLS와 승인 조건을 전제로 한 읽기 작업 |
| `lib/validators` | 입력값 검증 |
| `lib/audit` | `admin_logs`, `audit_events`, `activity_logs` 기록 |
| `lib/auth` | 세션, Member Type, 권한 가드 |

### 2.4 신뢰 경계

- Client Component는 UI 표시와 입력 수집만 담당한다.
- 데이터 변경은 Server Actions 또는 Route Handlers에서만 수행한다.
- Server Actions는 세션, Member Type, 권한, 소유권, 상태, 입력값을 검증한다.
- Supabase RLS는 최종 데이터 접근 제어 계층이다.
- service role key는 서버 전용이며 클라이언트 번들에 포함하지 않는다.

## 3. 언어 정책과 i18n 설계

### 3.1 플랫폼 언어 기본값

| 영역 | 기본 언어 |
|------|-----------|
| Public Website | English |
| Member Dashboard | English |
| System Notifications | English |
| Admin Dashboard | Korean |
| Admin Notifications | Korean |

Public-facing service language must be English by default.

Admin dashboard language must be Korean by default.

### 3.2 향후 확장 언어

- Korean
- Thai
- Vietnamese
- Chinese
- Japanese
- Arabic
- Spanish

### 3.3 번역 키 설계

모든 UI 텍스트는 Translation Key 기반으로 관리한다. 하드코딩된 언어 문자열은 사용하지 않는다.

#### languages

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `code` | text | `en`, `ko`, `th` 등 언어 코드 |
| `name` | text | 표시명 |
| `is_default_public` | boolean | 공개 서비스 기본 언어 |
| `is_default_admin` | boolean | 관리자 기본 언어 |
| `is_active` | boolean | 활성 여부 |
| `sort_order` | integer | 정렬 |

#### translations

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `language_code` | text | `languages.code` 참조 |
| `translation_key` | text | 고유 번역 키 |
| `translation_value` | text | 번역값 |
| `namespace` | text | public, admin, dashboard, notification |
| `updated_by` | uuid | 관리자 |

## 4. 회원, 권한, 등급 설계

### 4.1 Member Type

Member Type은 권한과 대시보드 분리의 기준이다.

| 코드 | 표시명 | 설명 |
|------|--------|------|
| `administrator` | Administrator | 전체 운영 관리자 |
| `supplier` | Supplier | 한국 기업 회원 |
| `buyer` | Buyer | 해외 바이어 |
| `agent` | Agent | 국가별 Buyer 네트워크 관리 |
| `professor` | Professor | 하부 Student 관리 |
| `student` | Student | 학생 회원 |

### 4.2 Career Rank

Career Rank는 권한이 아니라 성장 등급이다. Member Type과 분리해 관리한다.

| 코드 | 표시명 | 기본 규칙 |
|------|--------|-----------|
| `global_trade_ambassador` | Global Trade Ambassador | Student 가입 시 자동 부여 |
| `global_trade_associate` | Global Trade Associate | 졸업 처리 시 자동 변경 |
| `global_trade_specialist` | Global Trade Specialist | 향후 실적 기반 승급 |
| `global_trade_partner` | Global Trade Partner | 향후 실적 기반 승급 |
| `global_trade_leader` | Global Trade Leader | 향후 실적 기반 승급 |

### 4.3 권한 모델

권한은 `permissions`, `roles`, `role_permissions`, `member_types`를 기준으로 구성한다. 구현 시 `member_types`는 Member Type 마스터, `roles`는 운영 권한 묶음, `permissions`는 세부 action 권한으로 사용한다.

| 권한 | Admin | Supplier | Buyer | Agent | Professor | Student |
|------|-------|----------|-------|-------|-----------|---------|
| `admin.access` | 허용 | 불가 | 불가 | 불가 | 불가 | 불가 |
| `content.approve` | 허용 | 불가 | 불가 | 불가 | 불가 | 불가 |
| `company.manage_own` | 허용 | 허용 | 불가 | 불가 | 불가 | 불가 |
| `product.create` | 허용 | 허용 | 불가 | 제한 | 불가 | 불가 |
| `buy_request.create` | 허용 | 불가 | 허용 | 불가 | 불가 | 제한 |
| `event.manage` | 허용 | 불가 | 불가 | 불가 | 불가 | 불가 |
| `event.apply` | 허용 | 허용 | 허용 | 허용 | 허용 | 허용 |
| `fda.apply` | 허용 | 허용 | 불가 | 불가 | 불가 | 불가 |
| `referral.view_children` | 허용 | 불가 | 허용 | 허용 | 불가 | 불가 |
| `message.send` | 허용 | 허용 | 허용 | 허용 | 허용 | 허용 |
| `passport.view` | 허용 | 불가 | 불가 | 불가 | 허용 | 허용 |

Student는 제품을 직접 등록하지 않는다.

Student는 Supplier가 등록하고 승인받은 제품을 선택하여 Student Showcase를 구성할 수 있다.

Student Showcase는 제품 등록이 아니라 제품 소개, Buyer 유치, Matching 지원을 위한 활동 공간이다.

제품 원본 데이터의 생성, 수정, 삭제 권한은 Supplier 또는 Administrator에게만 있다.

### 4.4 대시보드 접근

| Dashboard | Member Type | 핵심 기능 |
|-----------|-------------|-----------|
| Admin | Administrator | 승인, 검증, 설정, 통계, 감사 |
| Supplier | Supplier | 회사, 제품, 산업설비, EPC, FDA, 문의 |
| Buyer | Buyer | 제품 검색, Buy Request, Referral, 관심 제품 |
| Agent | Agent | 하부 Buyer, 국가 네트워크, 메시지 |
| Professor | Professor | 하부 Student, 성과 리포트, 메시지 |
| Student | Student | Passport, Showcase, My Buyers, Referral Activity, Market Research, Reward, Badge, 활동 이력 |

## 5. 페이지와 라우트 설계

### 5.1 공개 라우트

| 라우트 | 언어 | 설명 | 공개 조건 |
|--------|------|------|-----------|
| `/` | English | 홈 | 설정 기반 메뉴와 배너 |
| `/commercial` | English | 제품 목록 | 승인된 제품 |
| `/commercial/[id]` | English | 제품 상세 | 승인된 제품 |
| `/industrial` | English | 산업설비 목록 | 승인된 게시글 |
| `/industrial/[id]` | English | 산업설비 상세 | 승인된 게시글 |
| `/epc` | English | EPC 목록 | 승인된 게시글 |
| `/epc/[id]` | English | EPC 상세 | 승인된 게시글 |
| `/buy-sell` | English | BUY & SELL 통합 탭 | 승인된 게시글 |
| `/buy-sell/sell-products` | English | SELL PRODUCTS | 승인된 판매글 |
| `/buy-sell/buy-requests` | English | BUY REQUEST | 승인된 구매 요청 |
| `/events` | English | Event 목록 | published Event |
| `/events/[id]` | English | Event 상세 | published Event |
| `/companies/[slug]` | English | Public Company Page | 승인된 회사 |
| `/thailand-fda-service` | English | 태국 FDA 서비스 안내 | 공개 |
| `/notice` | English | 공지 목록 | published |

### 5.2 인증 라우트

| 라우트 | 설명 |
|--------|------|
| `/login` | 로그인 |
| `/signup` | 가입 유형 선택 |
| `/signup/supplier` | Supplier 가입 |
| `/signup/buyer` | Buyer 가입 |
| `/signup/agent` | Agent 가입 |
| `/signup/professor` | Professor 가입 |
| `/signup/student` | Student 가입 |
| `/pending-approval` | 승인 대기 |
| `/auth/callback` | Supabase callback |

### 5.3 관리자 라우트

관리자 라우트는 영어 slug를 유지하고, UI 라벨은 Korean을 기본으로 한다.

| 라우트 | 기능 |
|--------|------|
| `/admin` | 운영 대시보드 |
| `/admin/users` | 회원관리 |
| `/admin/companies` | 회사 승인/검증 |
| `/admin/suppliers` | Supplier 관리 |
| `/admin/buyers` | Buyer 관리 |
| `/admin/agents` | Agent 관리 |
| `/admin/professors` | Professor 관리 |
| `/admin/students` | Student 관리 |
| `/admin/student-showcases` | Student Showcase 관리 |
| `/admin/market-research` | Student 시장조사 관리 |
| `/admin/career-ranks` | Career Rank 관리 |
| `/admin/products` | 제품관리 |
| `/admin/industrial` | Industrial 관리 |
| `/admin/epc` | EPC 관리 |
| `/admin/buy-sell` | BUY & SELL 관리 |
| `/admin/events` | Event 관리 |
| `/admin/fda` | 태국 FDA 신청관리 |
| `/admin/referrals` | Referral 관리 |
| `/admin/rewards` | Reward 관리 |
| `/admin/badges` | Badge 관리 |
| `/admin/messages` | Message 열람/차단 |
| `/admin/notifications` | Notification Center |
| `/admin/menus` | 메뉴 관리 |
| `/admin/categories` | 카테고리 관리 |
| `/admin/countries` | Country 관리 |
| `/admin/industries` | Industry 관리 |
| `/admin/company-types` | Company Type 관리 |
| `/admin/languages` | Language 관리 |
| `/admin/translations` | Translation Key 관리 |
| `/admin/banners` | Banner 관리 |
| `/admin/site-settings` | Site Settings |
| `/admin/audit-logs` | 감사 로그 |

## 6. 데이터 모델 설계

### 6.1 공통 컬럼

주요 도메인 테이블은 다음 공통 컬럼을 사용한다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `created_at` | timestamptz | 생성 시각 |
| `updated_at` | timestamptz | 수정 시각 |
| `created_by` | uuid | 생성자 |
| `updated_by` | uuid | 수정자 |
| `is_active` | boolean | 활성 여부 |
| `deleted_at` | timestamptz | soft delete |
| `deleted_by` | uuid | 삭제자 |

### 6.2 Identity와 권한

#### profiles

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | `auth.users.id`와 동일 |
| `email` | text | 로그인 이메일 |
| `display_name` | text | 표시명 |
| `phone` | text | 마스킹 대상 |
| `country_id` | uuid | 기본 국가 |
| `member_type_id` | uuid | `member_types` FK |
| `career_rank_id` | uuid | `career_ranks` FK, 선택 |
| `approval_status` | text | 계정 승인 상태 |
| `activity_status` | text | active, inactive, blocked |
| `primary_language` | text | 기본 언어 |

#### member_types

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `code` | text | administrator, supplier, buyer, agent, professor, student |
| `name` | text | 표시명 |
| `description` | text | 설명 |
| `is_system` | boolean | 시스템 보호 |

#### career_ranks

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `code` | text | rank code |
| `name` | text | 표시명 |
| `level_order` | integer | 등급 순서 |
| `is_active` | boolean | 활성 여부 |

#### roles, permissions, role_permissions

운영 권한과 세부 권한을 분리한다.

- `roles`: 권한 묶음
- `permissions`: 세부 action
- `role_permissions`: role과 permission 연결

### 6.3 회사와 검증

#### companies

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `name` | text | 회사명 |
| `slug` | text | Public Company Page URL |
| `company_type_id` | uuid | `company_types` FK |
| `country_id` | uuid | 국가 |
| `industry_id` | uuid | 산업 |
| `website` | text | 웹사이트 |
| `description` | text | 회사 소개 |
| `approval_status` | text | draft, submitted, reviewing, approved, rejected, suspended |
| `verification_status` | text | pending, verified, rejected, suspended |
| `approved_by` | uuid | 승인 관리자 |
| `verified_by` | uuid | 검증 관리자 |
| `approved_at` | timestamptz | 승인 시각 |
| `verified_at` | timestamptz | 검증 시각 |

`approved`는 회사 승인 상태이고, `verified`는 회사 검증 상태다. Alibaba 스타일 운영을 위해 승인과 검증은 별도 상태로 관리한다.

#### company_verifications

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `company_id` | uuid | 회사 |
| `status` | text | pending, verified, rejected, suspended |
| `business_registration_checked` | boolean | 사업자등록 확인 |
| `website_checked` | boolean | 웹사이트 확인 |
| `catalog_checked` | boolean | 카탈로그 확인 |
| `certificate_checked` | boolean | 인증서 확인 |
| `review_note` | text | 검토 메모 |
| `reviewed_by` | uuid | 관리자 |
| `reviewed_at` | timestamptz | 검토 시각 |

#### company_types

관리자 설정 기반으로 관리한다.

- Manufacturer
- Brand Owner
- Distributor
- Trading Company
- Service Provider
- University
- Government Agency
- Association
- Research Institute

### 6.4 국가, 지역, 산업

#### countries

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `name` | text | 국가명 |
| `code` | text | ISO code |
| `region_id` | uuid | 지역 |
| `status` | text | active, inactive |
| `sort_order` | integer | 정렬 |

#### regions

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `name` | text | Asia, Southeast Asia 등 |
| `sort_order` | integer | 정렬 |

#### country_agents

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `country_id` | uuid | 담당 국가 |
| `agent_id` | uuid | Agent |
| `status` | text | active, inactive, suspended |
| `assigned_at` | timestamptz | 배정 시각 |

모든 Agent는 최소 하나 이상의 country_agents row를 가져야 한다.

#### industries

산업 분류는 관리자 설정 기반으로 관리한다. 하드코딩하지 않는다.

### 6.5 Member Domain

#### suppliers

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `profile_id` | uuid | 사용자 |
| `company_id` | uuid | 회사 |
| `approval_status` | text | 승인 상태 |

Supplier는 Company Type을 반드시 선택해야 한다.

#### buyers

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `profile_id` | uuid | 사용자 |
| `company_name` | text | 회사명 |
| `country_id` | uuid | 국가 |
| `approval_status` | text | 승인 상태 |

#### agents

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `profile_id` | uuid | 사용자 |
| `approval_status` | text | 승인 상태 |

#### professors

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `profile_id` | uuid | 사용자 |
| `university_name` | text | 대학명 |
| `approval_status` | text | 승인 상태 |

#### students

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `profile_id` | uuid | 사용자 |
| `professor_id` | uuid | 담당 교수 |
| `university_name` | text | 대학명 |
| `graduation_status` | text | enrolled, graduated |

Student 가입 시 `global_trade_ambassador` Career Rank를 자동 부여한다.

Global Trade Passport는 `activity_logs`, `career_ranks`, `badges`, `rewards`, `student_showcases`, `market_research_reports` 기반으로 계산된다.

### 6.6 콘텐츠

#### products

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `supplier_id` | uuid | Supplier |
| `company_id` | uuid | 회사 |
| `category_id` | uuid | 카테고리 |
| `industry_id` | uuid | 산업 |
| `title` | text | 제목 |
| `summary` | text | 요약 |
| `description` | text | 설명 |
| `approval_status` | text | 승인 상태 |
| `main_file_id` | uuid | 대표 이미지 |

#### industrial_posts, epc_posts

제품과 동일한 승인 정책을 적용한다. EPC는 프로젝트 국가와 프로젝트 범위를 별도 컬럼으로 둔다.

#### buy_sell_posts

`buy_sell_posts`는 SELL PRODUCTS 전용 테이블이다. BUY REQUEST는 `buy_requests`에서만 관리한다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `post_type` | text | `sell_product` 고정 |
| `author_profile_id` | uuid | 작성자 |
| `supplier_id` | uuid | 판매글 소유자 |
| `category_id` | uuid | 카테고리 |
| `title` | text | 제목 |
| `description` | text | 내용 |
| `target_country_id` | uuid | 대상 국가 |
| `approval_status` | text | 승인 상태 |

#### buy_requests

`buy_requests`는 BUY REQUEST 전용 테이블이다. Buyer의 구조화된 소싱 요청을 저장하며 공개 노출은 승인 상태를 기준으로 한다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `buyer_id` | uuid | 요청 Buyer |
| `category_id` | uuid | 요청 카테고리 |
| `industry_id` | uuid | 산업 |
| `title` | text | 요청 제목 |
| `quantity` | text | 요청 수량 |
| `target_price` | text | 목표 가격 |
| `destination_country_id` | uuid | 도착 국가 |
| `details` | text | 상세 요청 |
| `approval_status` | text | 승인 상태 |

### 6.7 Matching, Referral, Reward

#### matching_requests

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `requester_profile_id` | uuid | 요청자 |
| `target_profile_id` | uuid | 대상자 |
| `matching_type` | text | supplier_buyer, buyer_agent, professor_supplier, student_buyer |
| `status` | text | requested, reviewing, approved, rejected, closed |
| `admin_note` | text | 관리자 메모 |

#### referral_codes

모든 Buyer는 추천코드와 추천링크를 가진다.

#### referral_relations

상위 Buyer와 하위 Buyer를 연결한다. 상위 Buyer가 볼 수 있는 정보는 이름, 회사명, 국가, 가입일, 승인상태, 활동상태, 소싱 요청 수, 문의 수, 매칭 수, 추천 보상 여부로 제한한다.

#### rewards

보상은 자동 지급하지 않는다. 관리자가 수동 승인한다.

### 6.8 Passport, Badge, Activity

#### badges

Verified Company, Verified Buyer, Verified Agent, Verified Professor, Verified Student, Verified Alumni 등을 관리자 설정 기반으로 관리한다.

#### activity_logs

회원가입, 프로필 수정, 제품 등록, BUY & SELL 등록, 바이어 유치, 매칭 요청, FDA 신청, 이벤트 참가, Badge 획득, Career Rank 변경을 기록한다.

#### Global Trade Passport

Student와 Career Rank 보유자의 활동 이력을 누적 관리한다.

- 가입일
- 소속 대학
- 담당 교수
- 활동 이력
- Badge 획득 이력
- Reward 획득 이력
- 유치 Buyer 수
- 등록 제품 수
- 매칭 수
- 참여 프로젝트
- 졸업 여부
- 현재 Career Rank

### 6.8.1 Student Showcase

#### student_showcases

Student가 승인된 Supplier 제품을 기반으로 구성하는 제품 소개 공간이다.

Student Showcase는 제품 등록이 아니며, 제품 원본 데이터는 Supplier가 소유한다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `student_id` | uuid | Student |
| `title` | text | Showcase 제목 |
| `description` | text | Showcase 설명 |
| `target_country_id` | uuid | 대상 국가 |
| `approval_status` | text | draft, submitted, reviewing, approved, rejected |
| `created_by` | uuid | 생성자 |
| `approved_by` | uuid | 승인 관리자 |
| `approved_at` | timestamptz | 승인 시각 |

#### student_showcase_items

Showcase에 포함된 승인 제품 목록이다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `showcase_id` | uuid | student_showcases.id |
| `product_id` | uuid | products.id |
| `display_order` | integer | 표시 순서 |
| `student_note` | text | 학생 소개 문구 |

#### market_research_reports

Student가 작성하는 국가별 시장조사 보고서다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `student_id` | uuid | Student |
| `country_id` | uuid | 조사 국가 |
| `industry_id` | uuid | 산업 |
| `title` | text | 보고서 제목 |
| `summary` | text | 요약 |
| `content` | text | 본문 |
| `approval_status` | text | 승인 상태 |
| `created_by` | uuid | 작성자 |

### 6.9 Event와 Thailand FDA

#### events

Event는 관리자만 생성한다. 회원은 참가 신청만 가능하다.

#### event_applications

승인된 회원이 Event에 참가 신청한다.

#### thailand_fda_applications

| 상태 |
|------|
| draft |
| submitted |
| reviewing |
| waiting_documents |
| quoted |
| in_progress |
| completed |
| rejected |

Supplier는 신청하고, 관리자는 검토, 견적, 상태 변경, 파일 관리, 완료 보고서를 관리한다.

### 6.10 Messaging, Notification, Files

#### conversations, conversation_members, messages, message_attachments

- 1:1 메시지
- 파일, PDF, 이미지 첨부
- 읽음 표시
- 관리자 열람
- 관리자 차단

Agent는 하부 Buyer와만, Professor는 하부 Student와만 소통한다.

#### notifications

System Notifications는 English, Admin Notifications는 Korean을 기본으로 한다.

#### files

Storage 파일의 bucket, path, mime_type, size, owner, visibility를 관리한다.

### 6.11 Indexes Strategy

공개 조회, 관리자 필터, 소유자 대시보드, 메시지 조회 성능을 위해 다음 인덱스를 우선 설계한다.

| Table | Index Columns | Purpose |
|-------|---------------|---------|
| `products` | `approval_status` | 공개 제품 목록에서 승인 콘텐츠 필터 |
| `products` | `supplier_id`, `approval_status` | Supplier 대시보드와 승인 상태 필터 |
| `companies` | `slug` | Public Company Page URL 조회 |
| `companies` | `country_id` | 국가별 Supplier/Company 검색 |
| `companies` | `approval_status`, `verification_status` | 공개 노출과 Verified Company 필터 |
| `buy_requests` | `destination_country_id` | 국가별 BUY REQUEST 검색 |
| `buy_requests` | `buyer_id`, `approval_status` | Buyer 대시보드와 승인 상태 필터 |
| `buy_sell_posts` | `supplier_id`, `approval_status` | Supplier SELL PRODUCTS 목록 |
| `messages` | `conversation_id` | 대화별 메시지 조회 |
| `conversation_members` | `profile_id`, `conversation_id` | 사용자별 대화 접근 검증 |
| `referral_relations` | `parent_buyer_id`, `child_buyer_id` | Referral 관계 조회 |
| `matching_requests` | `requester_profile_id`, `status` | 요청자별 매칭 상태 조회 |
| `country_agents` | `country_id`, `agent_id` | 국가별 Agent 배정 검증 |

Unique index가 필요한 항목:

- `companies.slug`
- `languages.code`
- `translations.language_code`, `translations.translation_key`
- `referral_codes.code`

## 7. 승인, 검증, 공개 정책

### 7.1 표준 승인 상태

- draft
- submitted
- reviewing
- approved
- rejected
- suspended
- archived

### 7.2 공개 노출 규칙

- 공개 목록은 `approval_status = 'approved'`인 콘텐츠만 조회한다.
- 회사는 `approval_status = 'approved'`여야 Public Company Page가 노출된다.
- 회사 검증 badge는 `verification_status = 'verified'`일 때만 표시한다.
- Event는 `status = 'published'`일 때만 공개한다.
- 승인 전 콘텐츠는 검색과 상세 페이지에서 제외한다.

### 7.3 Company Approval vs Verification

| 개념 | 상태 | 의미 |
|------|------|------|
| Company Approval | approved | 플랫폼 사용과 공개 노출 승인 |
| Company Verification | verified | 사업자, 웹사이트, 인증서, 카탈로그 등 신뢰 검증 |

## 8. RLS 정책 설계

### 8.1 SQL helper functions

```sql
is_admin() returns boolean
has_member_type(member_type_code text) returns boolean
has_permission(permission_code text) returns boolean
is_profile_owner(profile_id uuid) returns boolean
can_access_conversation(conversation_id uuid) returns boolean
can_manage_country(country_id uuid) returns boolean
```

### 8.2 기본 RLS 원칙

- Anonymous는 승인된 공개 콘텐츠만 읽는다.
- Authenticated user는 본인 프로필과 본인 콘텐츠를 읽는다.
- Owner는 draft 또는 pending 콘텐츠를 수정할 수 있다.
- Approved 콘텐츠 수정은 pending으로 되돌린다.
- Admin은 모든 관리 대상 테이블을 관리한다.
- Agent는 배정된 country_agents 범위의 하부 Buyer만 본다.
- Professor는 본인 하부 Student만 본다.
- Parent Buyer는 하위 Buyer의 제한된 요약 정보만 본다.

### 8.3 RLS Matrix Table

| Table | Admin | Supplier | Buyer | Agent | Professor | Student |
|-------|-------|----------|-------|-------|-----------|---------|
| `profiles` | All | Own | Own | Own and assigned child Buyer summary | Own and assigned Student summary | Own |
| `companies` | All | Own | Read Approved | Read Approved | Read Approved | Read Approved |
| `company_verifications` | All | Own company status | No | No | No | No |
| `products` | All | Own | Read Approved | Read Approved | Read Approved | Read Approved |
| `industrial_posts` | All | Own | Read Approved | Read Approved | Read Approved | Read Approved |
| `epc_posts` | All | Own | Read Approved | Read Approved | Read Approved | Read Approved |
| `buy_sell_posts` | All | Own SELL PRODUCTS | Read Approved | Read Approved | Read Approved | Read Approved |
| `buy_requests` | All | Read Approved | Own and Read Approved | Read assigned country approved | Read Approved | Read Approved |
| `matching_requests` | All | Related | Related | Assigned country related | Related students only | Related |
| `student_showcases` | All | Read Approved | Read Approved | Read Approved | Assigned Student | Own |
| `student_showcase_items` | All | Related Approved Product | Read Approved | Read Approved | Assigned Student | Own |
| `market_research_reports` | All | Read Approved | Read Approved | Read Approved | Assigned Student | Own |
| `referral_relations` | All | No | Own parent/child summary | Assigned Buyer summary | No | No |
| `thailand_fda_applications` | All | Own | No | No | No | No |
| `events` | All | Read Published | Read Published | Read Published | Read Published | Read Published |
| `event_applications` | All | Own | Own | Own | Own | Own |
| `conversations` | All | Member only | Member only | Assigned Buyer conversations | Assigned Student conversations | Member only |
| `messages` | All | Conversation member | Conversation member | Assigned Buyer conversations | Assigned Student conversations | Conversation member |
| `notifications` | All | Own | Own | Own | Own | Own |
| `files` | All | Own or related record | Related public/restricted | Related conversations | Related students/conversations | Own or related |
| `admin_logs` | All | No | No | No | No | No |
| `audit_events` | All | No | No | No | No | No |

### 8.4 개인정보 마스킹

상위 Buyer, Agent, Professor가 직접 볼 수 없는 정보:

- 이메일 전체
- 전화번호 전체
- 상세 문의내용
- 계약금액
- 관리자 메모

## 9. Server Actions와 API 설계

### 9.1 Auth Actions

| Action | Guard | 결과 |
|--------|-------|------|
| `signUpWithMemberType` | public validation | profile과 member row 생성 |
| `signIn` | public | session 생성 |
| `signOut` | authenticated | session 종료 |
| `redirectByMemberType` | authenticated | 대시보드 이동 |

### 9.2 Admin Actions

| Action | Guard | 결과 |
|--------|-------|------|
| `approveRecord` | `content.approve` | 승인 처리와 감사 로그 |
| `rejectRecord` | `content.approve` | 반려 처리와 감사 로그 |
| `verifyCompany` | admin | 회사 검증 처리 |
| `suspendCompany` | admin | 회사 정지 |
| `updateMenu` | admin | 메뉴 설정 |
| `updateCategory` | admin | 카테고리 설정 |
| `updateCountry` | admin | 국가 설정 |
| `assignCountryAgent` | admin | country_agents 생성 |
| `updateTranslation` | admin | Translation Key 갱신 |
| `grantBadge` | admin | Badge 부여 |
| `approveReward` | admin | Reward 승인 |

### 9.3 Business Actions

| Action | Guard | 결과 |
|--------|-------|------|
| `createProduct` | Supplier | pending 제품 |
| `createIndustrialPost` | Supplier | pending 산업설비 |
| `createEpcPost` | Supplier | pending EPC |
| `createBuySellPost` | allowed role | pending BUY & SELL |
| `createBuyRequest` | Buyer | pending Buy Request |
| `createMatchingRequest` | authenticated | requested matching |
| `createStudentShowcase` | Student | draft Showcase 생성 |
| `submitStudentShowcase` | Student | Showcase 승인 요청 |
| `approveStudentShowcase` | Admin | Showcase 승인 |
| `createMarketResearchReport` | Student | 시장조사 보고서 작성 |
| `approveMarketResearchReport` | Admin | 시장조사 보고서 승인 |
| `createFdaApplication` | Supplier | FDA 신청 |
| `applyEvent` | approved member | Event 신청 |
| `sendMessage` | conversation member | 메시지 생성 |

## 10. Public Company Page와 SEO 설계

### 10.1 URL

```text
/companies/[slug]
```

### 10.2 페이지 섹션

- Company Overview
- Products
- Industrial Projects
- EPC Projects
- BUY & SELL
- Certificates
- Catalogs
- Export Countries
- Contact Information
- Inquiry Form

### 10.3 SEO 데이터

#### seo_metadata

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `target_table` | text | companies, products 등 |
| `target_id` | uuid | 대상 ID |
| `meta_title` | text | SEO 제목 |
| `meta_description` | text | SEO 설명 |
| `keywords` | text[] | 키워드 |
| `og_image_file_id` | uuid | OG 이미지 |
| `canonical_url` | text | canonical |
| `structured_data` | jsonb | schema.org |

### 10.4 Sitemap

승인된 공개 페이지는 sitemap 대상이다.

- Company Pages
- Product Pages
- Industrial Pages
- EPC Pages
- BUY & SELL Pages
- Event Pages

## 11. UI 설계

### 11.1 공통 원칙

- Public UI는 English 기준으로 개발한다.
- Admin UI는 Korean 기준으로 개발한다.
- 모바일 우선 반응형으로 설계한다.
- UI 문구에 이모지를 사용하지 않는다.
- 운영 화면은 조밀하지만 읽기 쉬운 테이블과 필터 중심으로 구성한다.
- 메뉴, 상태, 카테고리, 국가, 산업, 회사 유형은 관리자 설정 데이터를 사용한다.

### 11.2 레이아웃

| 영역 | 데스크톱 | 모바일 |
|------|----------|--------|
| Public | 상단 navigation | drawer navigation |
| Dashboard | sidebar + content | drawer 또는 bottom navigation |
| Admin | sidebar + data table | responsive table, filter drawer |

### 11.3 핵심 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `PublicHeader` | 공개 메뉴 |
| `AdminShell` | 관리자 레이아웃 |
| `DashboardShell` | 회원 대시보드 |
| `DataTable` | 관리자 목록 |
| `StatusBadge` | 승인/검증/상태 표시 |
| `ApprovalActions` | 승인/반려 |
| `VerificationActions` | 회사 검증 |
| `TranslationText` | Translation Key 렌더링 |
| `CompanyCard` | 공개 회사 카드 |
| `CompanyVerificationBadge` | 검증 배지 |
| `FileUploader` | Storage 업로드 |
| `MessageThread` | 메시지 |
| `NotificationList` | 알림 |
| `PassportPanel` | Global Trade Passport |
| `StudentShowcasePanel` | Student Showcase 관리 |
| `ShowcaseProductSelector` | 승인 제품 선택 |
| `MarketResearchEditor` | 시장조사 보고서 작성 |
| `FdaStatusTimeline` | FDA 상태 |

## 12. Storage 설계

### 12.1 Buckets

| Bucket | 공개 수준 | 용도 |
|--------|-----------|------|
| `public-assets` | public | 공개 배너, 공개 이미지 |
| `company-files` | restricted | 회사 카탈로그, 인증서 |
| `product-files` | restricted/public | 제품 이미지와 파일 |
| `fda-files` | private | FDA 문서 |
| `message-attachments` | private | 메시지 첨부 |
| `reports` | private | 완료 보고서 |

### 12.2 파일 정책

- 파일 크기와 확장자는 관리자 설정으로 제한한다.
- private 파일은 signed URL로만 접근한다.
- 사용되지 않는 파일은 관리자가 식별할 수 있어야 한다.
- 인증서와 FDA 문서는 공개 URL을 직접 노출하지 않는다.

## 13. Audit, Activity, Compliance

### 13.1 admin_logs

관리자 변경 행위를 기록한다.

- 회원 승인/거절
- 회사 승인/검증/정지
- 제품 승인/거절
- BUY & SELL 승인/거절
- FDA 상태 변경
- Badge 부여
- Reward 승인
- 메시지 차단
- 설정 변경

### 13.2 audit_events

보안과 시스템 이벤트를 기록한다.

- 로그인 실패
- 권한 없는 접근
- 파일 접근 실패
- API rate limit
- RLS 차단 이벤트

### 13.3 activity_logs

회원 활동 timeline을 제공한다.

## 14. 운영 확장 설계

### 14.1 Featured Contents

#### featured_contents

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 |
| `target_table` | text | companies, products, buy_sell_posts, events |
| `target_id` | uuid | 대상 ID |
| `featured_level` | text | normal, featured, premium_featured, top_featured |
| `featured_until` | timestamptz | 종료 시각 |
| `featured_by` | uuid | 관리자 |

### 14.2 Revenue Model

MVP 포함:

- Supplier Premium Membership
- Thailand FDA Service Fee
- Featured Product
- Featured Company
- Event Sponsorship

MVP 제외:

- Verified Company Upgrade

Verified Company Upgrade는 향후 추가 가능하지만 MVP에는 포함하지 않는다.

### 14.3 Future Ready

다음 항목은 확장 가능 구조만 고려한다.

- AI 번역
- AI 바이어 추천
- AI 공급사 추천
- 결제
- 전자계약
- B2G 프로젝트
- 국가별 멀티테넌트
- 공개 API
- Marketplace Analytics
- Buyer Acquisition Tracking
- Company Visibility Score

## 15. Seed Data 설계

### 15.1 Public Menus

- Commercial
- Industrial
- EPC
- Event
- BUY & SELL
- Networking
- Thailand FDA Service
- Notice

### 15.2 Member Types

- Administrator
- Supplier
- Buyer
- Agent
- Professor
- Student

### 15.3 Career Ranks

- Global Trade Ambassador
- Global Trade Associate
- Global Trade Specialist
- Global Trade Partner
- Global Trade Leader

### 15.4 FDA Categories

- Cosmetic Registration
- Food Supplement Registration
- Food Registration
- Medical Device Registration
- Import License Support
- Label Compliance
- Formula Review

### 15.5 Languages

- English
- Korean
- Thai
- Vietnamese
- Chinese
- Japanese
- Arabic
- Spanish

## 16. 구현 순서

### 16.1 Foundation

1. Next.js App Router 프로젝트 생성
2. Supabase browser/server client 설정
3. 환경변수 검증
4. Auth middleware 작성
5. base/public/dashboard/admin layout 작성
6. Translation Key 시스템 기반 UI 헬퍼 작성

### 16.2 Database

1. Member Type, Career Rank, Role, Permission 테이블
2. Profile과 member domain 테이블
3. Country, Region, Industry, Company Type 테이블
4. Company approval/verification 테이블
5. Content 테이블
6. Referral, Matching, Reward, Badge 테이블
7. Message, Notification, File 테이블
8. Audit, Activity, SEO, Featured 테이블
9. RLS helper functions
10. RLS policies

### 16.3 Admin Control Plane

1. 관리자 인증과 접근 제한
2. 회원 승인
3. 회사 승인과 검증
4. 메뉴, 카테고리, 국가, 산업, 회사 유형 관리
5. Translation Key 관리
6. 콘텐츠 승인
7. 감사 로그와 통계

### 16.4 Public Website

1. English Public Header
2. 승인 콘텐츠 목록과 상세
3. Public Company Page
4. SEO metadata와 sitemap
5. BUY & SELL 분리 화면
6. Thailand FDA Service 안내

### 16.5 Member Dashboards

1. Supplier Dashboard
2. Buyer Dashboard
3. Agent Dashboard
4. Professor Dashboard
5. Student Dashboard
6. Message와 Notification

Student Dashboard:

- Global Trade Passport
- My Buyers
- My Showcase
- My Referrals
- Market Research
- Events
- Messages
- Activities
- Badge
- Reward

## 17. 테스트 계획

### 17.1 Auth와 권한

- 승인 전 사용자는 dashboard 접근 불가
- Member Type별 dashboard 접근 분리
- Admin route는 Administrator만 접근
- Career Rank는 권한이 아니라 등급으로 동작

### 17.2 승인과 공개 노출

- pending 제품은 공개 목록에 나오지 않음
- approved 제품만 공개
- approved company만 Public Company Page 노출
- verified company만 Verified Company Badge 표시
- Event는 admin만 생성

### 17.3 RLS

- 익명 사용자는 승인된 공개 콘텐츠만 읽음
- 소유자는 본인 pending 콘텐츠 읽기 가능
- Agent는 배정 국가/하부 Buyer만 접근
- Professor는 하부 Student만 접근
- 비참여자는 메시지 접근 불가

### 17.4 언어

- Public Website 기본 UI는 English
- Admin Dashboard 기본 UI는 Korean
- Translation Key 누락 시 fallback 동작
- 하드코딩 문자열 검출

### 17.5 Company와 SEO

- Supplier는 Company Type 없이는 등록 완료 불가
- Company approval과 verification 상태가 분리됨
- Public Company Page가 SEO metadata를 사용
- sitemap에는 승인된 공개 페이지가 포함됨

### 17.6 Business Features

- BUY & SELL이 SELL PRODUCTS와 BUY REQUEST로 분리됨
- Referral relation은 제한된 child Buyer summary만 노출
- Reward는 자동 지급되지 않고 admin approval 필요
- Matching Request 상태 변경이 기록됨
- FDA status timeline이 정상 동작
- Student는 제품을 직접 등록할 수 없다.
- Student는 승인된 Supplier 제품만 Showcase에 추가할 수 있다.
- Student Showcase는 제품 원본 데이터를 수정하지 않는다.
- Student Showcase 승인 전에는 공개되지 않는다.
- Market Research Report는 관리자 승인 후 공개 또는 내부 공유된다.

## 18. Do 단계 오픈 결정

구현 중 기본값은 다음으로 둔다.

- Approved content edit은 pending으로 되돌린다.
- Agent country assignment는 admin 수동 배정이다.
- Professor to Student 연결은 admin 또는 invite 기반 확장 가능 구조로 둔다.
- Verified Company Upgrade는 MVP 수익 기능에 포함하지 않는다.
- Points System은 Phase 2로 미룬다.
- MVP는 Badge와 Reward 중심으로 운영한다.

## 19. 설계 완료 기준

- [x] 최신 Plan의 Member Type과 Career Rank 분리 반영
- [x] Public English, Admin Korean 언어 정책 반영
- [x] Required Data Model 전체 반영
- [x] Company approval과 verification 분리 반영
- [x] Public Company Page와 SEO 구조 반영
- [x] Country Agent 구조 반영
- [x] Translation Key System 반영
- [x] RLS와 Server Action 경계 정의
- [x] 구현 순서와 테스트 계획 재작성

## 20. 참고

- Plan: `docs/01-plan/features/b2bb2g-mvp.plan.md`
- PDCA Skill: `/Users/hello_j/.bkit-codex/.agents/skills/pdca/SKILL.md`

# 21. Enterprise Architecture Addendum

## 21.1 Database Index Strategy

### Purpose

대용량 데이터 환경에서 검색 및 조회 성능 확보

### Required Indexes

profiles

* member_type_id
* career_rank_id
* country_id

companies

* slug (unique)
* approval_status
* verification_status
* country_id
* industry_id
* company_type_id

products

* supplier_id
* company_id
* approval_status
* category_id
* industry_id

buy_requests

* buyer_id
* approval_status
* destination_country_id

buy_sell_posts

* supplier_id
* approval_status
* category_id

messages

* conversation_id
* created_at

notifications

* profile_id
* is_read

matching_requests

* requester_profile_id
* target_profile_id
* status

---

## 21.2 Database Constraints

### Unique Constraints

companies.slug

member_types.code

career_ranks.code

countries.code

languages.code

translation_key + language_code

---

### Foreign Key Policy

모든 FK는 명시적으로 정의

Cascade Delete 금지

Soft Delete 정책 우선

---

## 21.3 Audit Architecture

### Audit Levels

Level 1

Business Audit

회원 승인

기업 승인

제품 승인

FDA 상태 변경

Reward 승인

---

Level 2

Security Audit

로그인 실패

권한 위반

비정상 접근

---

Level 3

System Audit

설정 변경

메뉴 변경

카테고리 변경

Translation 변경

---

## 21.4 Notification Architecture

### Notification Channels

In-App

Email

Future

SMS

WhatsApp

LINE

KakaoTalk

---

### Notification Priority

Low

Medium

High

Critical

---

## 21.5 Search Architecture

### Global Search Targets

Companies

Products

Industrial Posts

EPC Posts

Buy Requests

Events

Suppliers

Buyers

Agents

Professors

Students

---

### Search Filters

Country

Industry

Company Type

Category

Approval Status

Verification Status

Featured Status

---

## 21.6 File Governance

### Storage Naming Rule

bucket/yyyy/mm/entity-id/file-name

---

### Example

product-files/2026/06/product-uuid/image.jpg

---

### Security Rule

Public Bucket 최소화

FDA Files Private

Messages Private

Company Certificates Restricted

Signed URL 사용

---

## 21.7 API Versioning

### Version Rule

/api/v1

---

Future

/api/v2

---

### Policy

Breaking Changes 금지

Deprecated 기간 제공

---

## 21.8 Admin Governance

### Super Admin

전체 권한

---

### Admin

운영 권한

---

### Moderator

콘텐츠 승인 권한

---

### Reviewer

FDA 검토 권한

---

### Translation Manager

언어 관리 권한

---

### Rule

Admin 권한도 Role 기반으로 관리

---

## 21.9 Data Retention Policy

### Audit Logs

5년 보관

---

### Activity Logs

3년 보관

---

### Messages

관리자 정책 기반

---

### Deleted Accounts

Soft Delete

---

## 21.10 Monitoring

### KPI

회원 증가

Buyer 증가

Supplier 증가

Country 성장

매칭 성공률

FDA 신청 건수

Referral 성장률

---

### Technical Metrics

API Response Time

Database Query Time

Storage Usage

Error Rate

Failed Login Count

---

## 21.11 Disaster Recovery

### Backup

Database Daily

Storage Daily

Audit Logs Daily

---

### Recovery Targets

RPO < 24h

RTO < 4h

---

## 21.12 Scalability Rules

### Future Ready

Multi Country

Multi Tenant

Multi Language

Multi Currency

Multi Timezone

---

### Development Rule

새 기능 추가 시

권한 기반

설정 기반

번역 기반

감사 가능

구조를 유지해야 한다.

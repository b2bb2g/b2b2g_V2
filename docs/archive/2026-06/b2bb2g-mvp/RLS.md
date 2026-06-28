# B2BB2G.COM RLS 정책 설계서

문서 버전: V1.0  
대상 Feature: b2bb2g-mvp  
기준 문서:

- `docs/01-plan/features/b2bb2g-mvp.plan.md`
- `docs/02-design/features/b2bb2g-mvp.design.md`
- `docs/02-design/features/ERD.md`

## 1. 목적

이 문서는 B2BB2G.COM MVP의 Supabase PostgreSQL Row Level Security 정책을 정의한다.

RLS는 애플리케이션 코드의 보조 장치가 아니라 최종 데이터 접근 제어 계층이다.

MVP의 핵심 보안 목표는 다음과 같다.

- 관리자 승인 없는 콘텐츠 외부 노출 금지
- Member Type 기반 대시보드 접근 분리
- Supplier, Buyer, Agent, Professor, Student의 소유 데이터 보호
- Referral 하위 Buyer 개인정보 마스킹
- Student 제품 직접 등록 차단
- Student Showcase의 제품 원본 데이터 수정 차단
- 메시지, 파일, FDA 문서, 관리자 메모 보호
- 관리자 변경 행위 감사 로그 저장

## 2. RLS 기본 원칙

모든 비즈니스 테이블은 RLS를 활성화한다.

```sql
alter table {table_name} enable row level security;
```

기본 정책은 deny-by-default로 설계한다.

- Anonymous 사용자는 승인된 공개 콘텐츠만 읽을 수 있다.
- Authenticated 사용자는 본인 프로필과 본인 소유 레코드만 접근한다.
- Admin은 운영상 필요한 모든 관리 테이블에 접근할 수 있다.
- 공개 콘텐츠는 `approval_status = 'approved'` 또는 `status = 'published'` 기준으로만 읽힌다.
- 승인 전 콘텐츠는 외부 공개 쿼리에서 제외한다.
- 제품 원본 데이터의 생성, 수정, 삭제는 Supplier 또는 Administrator에게만 허용한다.
- Student는 승인된 Supplier 제품을 선택해 Showcase를 구성할 수 있지만 제품 원본을 수정할 수 없다.
- Agent는 배정 국가와 하부 Buyer 범위에서만 접근한다.
- Professor는 본인 하부 Student 범위에서만 접근한다.
- Parent Buyer는 하부 Buyer의 제한된 요약 정보만 볼 수 있다.

## 3. 주요 Role과 접근 단위

| 구분 | 기준 테이블 | 접근 단위 |
|------|-------------|-----------|
| Administrator | `profiles`, `profile_roles`, `roles` | 전체 운영 권한 |
| Supplier | `suppliers.profile_id`, `suppliers.company_id` | 본인 회사와 본인 등록 콘텐츠 |
| Buyer | `buyers.profile_id` | 본인 Buy Request, Referral, Matching |
| Agent | `agents.profile_id`, `country_agents` | 배정 국가와 하부 Buyer 요약 |
| Professor | `professors.profile_id`, `students.professor_id` | 하부 Student와 활동 요약 |
| Student | `students.profile_id` | 본인 Showcase, 시장조사, Passport 활동 |

## 4. 권장 SQL Helper Functions

RLS 정책은 중복을 줄이기 위해 helper function을 사용한다.

Helper function은 `security definer`로 작성하되, `search_path`를 고정해야 한다.

```sql
set search_path = public;
```

| 함수 | 목적 |
|------|------|
| `current_profile_id()` | 현재 `auth.uid()`에 연결된 `profiles.id` 반환 |
| `is_admin()` | 현재 사용자가 Administrator 권한인지 확인 |
| `has_member_type(member_type_code text)` | 현재 사용자의 Member Type 확인 |
| `has_permission(permission_code text)` | 현재 사용자의 세부 permission 확인 |
| `is_profile_owner(profile_id uuid)` | 현재 사용자가 해당 profile 소유자인지 확인 |
| `current_supplier_id()` | 현재 사용자의 Supplier id 반환 |
| `current_buyer_id()` | 현재 사용자의 Buyer id 반환 |
| `current_agent_id()` | 현재 사용자의 Agent id 반환 |
| `current_professor_id()` | 현재 사용자의 Professor id 반환 |
| `current_student_id()` | 현재 사용자의 Student id 반환 |
| `can_manage_country(country_id uuid)` | Agent가 해당 국가에 배정되었는지 확인 |
| `can_access_conversation(conversation_id uuid)` | 대화 참여자 또는 관리자 여부 확인 |
| `is_assigned_student(student_id uuid)` | Professor가 해당 Student 담당자인지 확인 |
| `is_approved_product(product_id uuid)` | 제품이 공개 승인 상태인지 확인 |

## 5. 공통 정책 패턴

### 5.1 Admin Full Access

대부분의 운영 테이블은 Admin 전체 접근 정책을 가진다.

```sql
create policy "{table}_admin_all"
on {table}
for all
using (is_admin())
with check (is_admin());
```

### 5.2 Owner Read

소유자는 본인 레코드를 읽을 수 있다.

```sql
create policy "{table}_owner_select"
on {table}
for select
using (owner_profile_id = current_profile_id() or is_admin());
```

### 5.3 Approved Public Read

공개 콘텐츠는 승인 상태만 읽힌다.

```sql
create policy "{table}_approved_public_select"
on {table}
for select
using (approval_status = 'approved');
```

### 5.4 Approved Edit Reset

승인된 콘텐츠를 소유자가 수정하는 경우 애플리케이션 레이어에서 `approval_status`를 `submitted` 또는 `reviewing`으로 되돌린다.

RLS는 승인 상태를 우회해 공개 수정되지 않도록 owner update와 admin approve를 분리한다.

## 6. RLS Matrix

| Table | Admin | Supplier | Buyer | Agent | Professor | Student | Anonymous |
|-------|-------|----------|-------|-------|-----------|---------|-----------|
| `profiles` | All | Own | Own | Own and assigned child Buyer summary | Own and assigned Student summary | Own | No |
| `member_types` | Manage | Read | Read | Read | Read | Read | No |
| `career_ranks` | Manage | Read | Read | Read | Read | Read | No |
| `roles` | Manage | No | No | No | No | No | No |
| `permissions` | Manage | No | No | No | No | No | No |
| `role_permissions` | Manage | No | No | No | No | No | No |
| `profile_roles` | Manage | No | No | No | No | No | No |
| `suppliers` | All | Own | Read Approved | Read Approved | Read Approved | Read Approved | No |
| `buyers` | All | No | Own | Assigned summary | No | Related summary | No |
| `agents` | All | No | No | Own | No | No | No |
| `professors` | All | No | No | No | Own | Assigned professor summary | No |
| `students` | All | No | No | No | Assigned Student | Own | No |
| `companies` | All | Own | Read Approved | Read Approved | Read Approved | Read Approved | Read Approved |
| `company_verifications` | All | Own company status | No | No | No | No | No |
| `countries` | Manage | Read | Read | Read | Read | Read | Read |
| `regions` | Manage | Read | Read | Read | Read | Read | Read |
| `industries` | Manage | Read | Read | Read | Read | Read | Read |
| `company_types` | Manage | Read | Read | Read | Read | Read | Read |
| `country_agents` | All | No | No | Own assignments | No | No | No |
| `products` | All | Own | Read Approved | Read Approved | Read Approved | Read Approved | Read Approved |
| `industrial_posts` | All | Own | Read Approved | Read Approved | Read Approved | Read Approved | Read Approved |
| `epc_posts` | All | Own | Read Approved | Read Approved | Read Approved | Read Approved | Read Approved |
| `buy_sell_posts` | All | Own SELL PRODUCTS | Read Approved | Read Approved | Read Approved | Read Approved | Read Approved |
| `buy_requests` | All | Read Approved | Own and Read Approved | Assigned country approved | Read Approved | Read Approved | Read Approved |
| `student_showcases` | All | Read Approved | Read Approved | Read Approved | Assigned Student | Own | Read Approved |
| `student_showcase_items` | All | Related approved product | Read Approved | Read Approved | Assigned Student | Own | Read Approved |
| `market_research_reports` | All | Read Approved | Read Approved | Read Approved | Assigned Student | Own | Read Approved or internal approved |
| `showcase_views` | All | Related aggregate | No raw | Aggregate | Assigned Student aggregate | Own aggregate | Insert anonymized |
| `showcase_shares` | All | Related aggregate | Own action | Aggregate | Assigned Student aggregate | Own aggregate | Insert anonymized |
| `showcase_inquiries` | All | Related product inquiry | Own inquiry | Assigned country summary | Assigned Student summary | Own showcase inquiry | Insert allowed |
| `matching_requests` | All | Related | Related | Assigned country related | Related students only | Related | No |
| `buyer_sources` | All | No | Own source | Assigned country summary | Assigned Student summary | Related student source | No |
| `analytics_events` | All | Own entity aggregate | No raw | Aggregate | Assigned Student aggregate | Own aggregate | Insert anonymized |
| `company_scores` | All | Own score | Read public badge | Read public badge | Read public badge | Read public badge | Read public badge |
| `referral_codes` | All | No | Own | Assigned Buyer summary | No | No | No |
| `referral_relations` | All | No | Own parent/child summary | Assigned Buyer summary | No | No | No |
| `rewards` | All | Own reward read | Own reward read | Own reward read | Own reward read | Own reward read | No |
| `badges` | Manage | Read | Read | Read | Read | Read | Read |
| `events` | All | Read Published | Read Published | Read Published | Read Published | Read Published | Read Published |
| `event_applications` | All | Own | Own | Own | Own | Own | No |
| `thailand_fda_applications` | All | Own | No | No | No | No | No |
| `conversations` | All | Member only | Member only | Assigned Buyer conversations | Assigned Student conversations | Member only | No |
| `conversation_members` | All | Own membership | Own membership | Assigned Buyer memberships | Assigned Student memberships | Own membership | No |
| `messages` | All | Conversation member | Conversation member | Assigned Buyer conversations | Assigned Student conversations | Conversation member | No |
| `message_attachments` | All | Conversation member | Conversation member | Assigned Buyer conversations | Assigned Student conversations | Conversation member | No |
| `announcements` | All | Read target | Read target | Read target | Read target | Read target | No |
| `notifications` | All | Own | Own | Own | Own | Own | No |
| `files` | All | Own or related record | Related public/restricted | Related conversations | Related students/conversations | Own or related | Public only |
| `menus` | Manage | Read active | Read active | Read active | Read active | Read active | Read active public |
| `categories` | Manage | Read active | Read active | Read active | Read active | Read active | Read active public |
| `banners` | Manage | No | No | No | No | No | Read active public |
| `site_settings` | Manage | Read public | Read public | Read public | Read public | Read public | Read public |
| `languages` | Manage | Read active | Read active | Read active | Read active | Read active | Read active |
| `translations` | Manage | Read active | Read active | Read active | Read active | Read active | Read active |
| `seo_metadata` | Manage | Related own public entity | Read public | Read public | Read public | Read public | Read public |
| `featured_contents` | Manage | Read active public | Read active public | Read active public | Read active public | Read active public | Read active public |
| `admin_logs` | All | No | No | No | No | No | No |
| `audit_events` | All | No | No | No | No | No | No |
| `activity_logs` | All | Own | Own | Assigned Buyer summary | Assigned Student summary | Own | No |

## 7. 테이블별 정책 상세

### 7.1 인증과 권한

#### profiles

- Admin: 전체 select, insert, update, delete
- Owner: 본인 profile select/update
- Agent: 배정 국가 하부 Buyer의 제한 요약 select
- Professor: 담당 Student의 제한 요약 select
- Parent Buyer: 하위 Buyer 제한 요약은 view 또는 RPC로 제공

민감 필드 정책:

- 이메일 전체, 전화번호 전체, 관리자 메모는 본인 또는 Admin만 조회한다.
- 하부 Buyer/Student 조회는 summary view를 별도 생성한다.

#### roles, permissions, role_permissions, profile_roles

- Admin만 관리한다.
- 일반 회원은 직접 조회하지 않는다.
- 권한 판단은 `has_permission()` helper를 통해 수행한다.

### 7.2 회원 도메인

#### suppliers

- Supplier는 본인 `profile_id`와 연결된 supplier만 select/update 가능하다.
- Supplier 승인 상태 변경은 Admin만 가능하다.
- 승인된 Supplier 요약은 공개 콘텐츠와 연결될 때만 읽을 수 있다.

#### buyers

- Buyer는 본인 레코드만 전체 조회 가능하다.
- Agent는 배정 국가에 속한 하부 Buyer 요약만 조회한다.
- Parent Buyer는 추천 관계에 있는 하위 Buyer 요약만 조회한다.
- 상세 연락처, 문의 내용, 계약금액, 관리자 메모는 노출하지 않는다.

#### agents

- Agent는 본인 레코드와 본인 `country_agents` 배정만 조회한다.
- Agent 국가 배정 생성, 변경, 중지는 Admin만 가능하다.

#### professors

- Professor는 본인 레코드와 하부 Student 요약만 조회한다.
- Professor와 Student 연결 변경은 Admin 또는 승인된 invite workflow에서만 가능하다.

#### students

- Student는 본인 레코드만 전체 조회 가능하다.
- Professor는 담당 Student의 활동 요약만 조회한다.
- Student는 제품 등록 권한이 없다.

### 7.3 회사와 검증

#### companies

- Supplier는 본인 supplier와 연결된 company만 insert/update 가능하다.
- Company Type 선택은 필수다.
- 공개 조회는 `approval_status = 'approved'`인 회사만 가능하다.
- `verification_status = 'verified'`는 검증 배지 표시 조건일 뿐, 회사 승인과 분리한다.

#### company_verifications

- Admin은 전체 관리한다.
- Supplier는 본인 company verification 상태만 읽는다.
- 검증 자료, 관리자 메모, 반려 사유는 비공개 필드로 분리하거나 Admin/Supplier 소유자만 조회한다.

### 7.4 마스터 데이터

`countries`, `regions`, `industries`, `company_types`, `member_types`, `career_ranks`, `badges`, `languages`, `translations`는 Admin이 관리한다.

일반 회원과 Anonymous는 active 상태의 공개 마스터 데이터만 읽는다.

삭제 대신 `is_active = false`를 사용한다.

### 7.5 콘텐츠

#### products

- Supplier는 본인 supplier_id의 제품만 insert/update 가능하다.
- Admin은 전체 관리한다.
- Buyer, Agent, Professor, Student, Anonymous는 approved 제품만 읽는다.
- Student는 제품을 insert/update/delete할 수 없다.

#### industrial_posts, epc_posts

- Supplier는 본인 게시글만 작성하고 수정한다.
- 공개 조회는 approved 상태만 허용한다.
- EPC의 국가 필터는 `project_country_id` 기준으로 적용한다.

#### buy_sell_posts

- SELL PRODUCTS 전용 테이블이다.
- Supplier 또는 Admin만 SELL PRODUCTS를 작성한다.
- 공개 조회는 approved 상태만 허용한다.

#### buy_requests

- Buyer는 본인 Buy Request를 생성하고 조회한다.
- 공개 조회는 approved 상태만 허용한다.
- Agent는 배정 국가의 approved Buy Request를 조회할 수 있다.
- 상세 문의 내용은 소유 Buyer, 관련 매칭 당사자, Admin만 조회한다.

### 7.6 Student Showcase와 시장조사

#### student_showcases

- Student는 본인 showcase만 insert/update/select 가능하다.
- Student는 `approval_status`를 `draft` 또는 `submitted`로만 설정할 수 있다.
- Admin만 `reviewing`, `approved`, `rejected`로 상태 변경할 수 있다.
- 공개 조회는 `approval_status = 'approved'`만 허용한다.
- Professor는 담당 Student의 showcase를 조회할 수 있다.

#### student_showcase_items

- Student는 본인 showcase에만 item을 추가할 수 있다.
- 추가 가능한 `product_id`는 반드시 `products.approval_status = 'approved'`여야 한다.
- Student는 product 원본 데이터를 수정할 수 없다.
- `student_showcase_items(showcase_id, product_id)`는 unique로 관리한다.
- 공개 조회는 parent showcase가 approved이고 연결 product도 approved일 때만 허용한다.

#### market_research_reports

- Student는 본인 report만 insert/update/select 가능하다.
- Student는 `approval_status`를 `draft` 또는 `submitted`로만 설정할 수 있다.
- Admin만 승인, 반려, 공개 여부를 관리한다.
- Professor는 담당 Student의 report를 조회할 수 있다.
- 공개 또는 내부 공유는 관리자 승인 후 가능하다.

#### showcase_views, showcase_shares, showcase_inquiries

- Student Showcase KPI는 조회수, 공유 수, 문의 수, Buyer 연결 수를 기준으로 집계한다.
- `showcase_views`는 공개 approved showcase 조회 시 익명 또는 인증 사용자 이벤트를 기록한다.
- `showcase_shares`는 Student 또는 방문자의 Showcase 공유 이벤트를 기록한다.
- `showcase_inquiries`는 Showcase 기반 문의와 Buyer 연결 성과를 기록한다.
- Admin은 raw event와 aggregate를 모두 조회할 수 있다.
- Student는 본인 Showcase의 aggregate KPI만 조회한다.
- Professor는 담당 Student의 aggregate KPI만 조회한다.
- Supplier는 본인 승인 제품이 포함된 Showcase의 aggregate KPI와 관련 문의만 조회한다.
- Anonymous는 raw analytics를 조회할 수 없고, 허용된 insert event만 생성할 수 있다.

예시 KPI:

| 항목 | 예시 값 |
|------|---------|
| Showcase 조회수 | 1,245 |
| Showcase 문의 | 21 |
| Buyer 연결 | 4 |

### 7.7 매칭과 추천

#### matching_requests

- Admin은 전체 관리한다.
- Supplier, Buyer, Student는 본인이 관련된 matching request만 조회한다.
- Agent는 배정 국가 관련 matching request만 조회한다.
- Professor는 담당 Student가 관련된 matching request만 조회한다.

#### referral_codes

- 모든 Buyer는 기본 추천코드 1개를 가진다.
- `referral_codes.buyer_id`는 unique다.
- `referral_codes.code`는 unique다.
- Buyer는 본인 추천코드만 조회한다.
- 추천코드 생성과 중지는 Admin 또는 시스템 workflow가 수행한다.

#### referral_relations

- Parent Buyer는 하위 Buyer의 제한 요약만 조회한다.
- Child Buyer는 본인 추천 관계를 조회할 수 있다.
- Agent는 배정 국가 하위 Buyer 요약만 조회한다.
- 보상 지급 여부는 Admin 승인 결과만 노출한다.

#### buyer_sources

- Buyer 유입 경로를 추적하는 테이블이다.
- source type은 Referral, Student, Agent, Event, Direct, Google을 기본값으로 둔다.
- Admin은 전체 raw source를 조회하고 수정할 수 있다.
- Buyer는 본인 유입 source만 조회할 수 있다.
- Student는 본인이 유치한 Buyer의 제한 요약과 acquisition count만 조회한다.
- Agent는 배정 국가에서 본인이 연결한 Buyer source summary만 조회한다.
- Referral 보상 산정 시 `referral_relations`와 함께 검증하되, 자동 보상 지급은 하지 않는다.

#### analytics_events

- Marketplace Analytics를 위한 범용 이벤트 로그다.
- 기록 대상은 회사 조회, 제품 조회, Showcase 조회, 문의 클릭, 카탈로그 다운로드를 포함한다.
- Admin은 raw event와 aggregate를 모두 조회할 수 있다.
- Supplier는 본인 company/product 관련 aggregate만 조회한다.
- Student는 본인 Showcase 관련 aggregate만 조회한다.
- Agent와 Professor는 담당 범위의 aggregate만 조회한다.
- Anonymous는 허용된 public event insert만 가능하며 raw event select는 불가하다.

#### company_scores

- Company Visibility Score는 회사 노출 품질을 계산하기 위한 aggregate 테이블이다.
- 계산 요소는 프로필 완성도, 제품 수, 인증서 수, 응답속도, 검증상태를 기준으로 한다.
- Admin은 전체 score를 관리한다.
- Supplier는 본인 company score와 개선 힌트만 조회한다.
- 공개 화면은 공개 가능한 score badge 또는 등급만 조회한다.

#### rewards

- Reward 생성, 승인, 반려는 Admin만 가능하다.
- 회원은 본인 Reward 결과만 읽는다.
- 자동 보상 지급은 MVP 범위에서 제외한다.

### 7.8 Event와 FDA

#### events

- Event 생성, 수정, 삭제는 Admin만 가능하다.
- 공개 조회는 `status = 'published'`만 허용한다.

#### event_applications

- 회원은 본인 참가 신청만 생성하고 조회한다.
- Admin은 전체 신청을 관리한다.
- 중복 신청은 unique constraint로 방지한다.

#### thailand_fda_applications

- Supplier는 본인 신청만 생성하고 조회한다.
- Admin은 검토, 견적, 상태 변경, 파일 관리, 완료 보고서를 관리한다.
- Buyer, Agent, Professor, Student, Anonymous는 접근할 수 없다.
- FDA 파일은 private bucket과 RLS 관계 검증을 함께 사용한다.

### 7.9 메시지와 알림

#### conversations, conversation_members, messages

- 대화 참여자만 대화와 메시지를 읽을 수 있다.
- 메시지 작성자는 해당 conversation member여야 한다.
- Admin은 전체 메시지를 열람하고 차단할 수 있다.
- Agent는 하부 Buyer와의 conversation만 접근한다.
- Professor는 하부 Student와의 conversation만 접근한다.
- 차단된 메시지는 일반 회원에게 숨기고 Admin audit 대상에 남긴다.

#### message_attachments

- 첨부 파일은 연결 message 접근 권한이 있는 사용자만 조회한다.
- 업로드 owner와 conversation 접근 권한을 모두 검증한다.

#### announcements

- Admin은 전체 공지를 생성한다.
- Agent는 하부 Buyer 대상 공지만 생성할 수 있다.
- Professor는 하부 Student 대상 공지만 생성할 수 있다.
- 수신자는 본인 대상 공지만 읽는다.

#### notifications

- 회원은 본인 notification만 읽고 읽음 처리한다.
- Admin은 전체 notification 이력 조회가 가능하다.

### 7.10 파일과 Storage

#### files

- 파일 metadata는 owner 또는 관련 레코드 접근 권한이 있을 때만 조회한다.
- public 파일은 `visibility = 'public'`인 경우만 Anonymous가 조회한다.
- FDA, 메시지, 회사 검증 파일은 private 또는 restricted로 관리한다.
- Storage bucket policy와 DB RLS를 동일한 접근 기준으로 맞춘다.

### 7.11 설정, SEO, 추천 노출

#### menus, categories, banners, site_settings

- Admin만 관리한다.
- 공개 UI는 active/public 설정만 조회한다.
- Admin UI 라벨은 Korean, Public UI 라벨은 English 기준으로 translation key를 사용한다.

#### seo_metadata, featured_contents

- Admin이 관리한다.
- 공개 조회는 연결 대상이 approved/published 상태일 때만 허용한다.
- Supplier는 본인 company/product와 연결된 SEO 요청 정보만 제한적으로 조회할 수 있다.

### 7.12 감사와 활동 로그

#### admin_logs

- Admin만 조회한다.
- insert는 server action 또는 DB trigger만 수행한다.
- 일반 클라이언트 insert를 허용하지 않는다.

#### audit_events

- 보안 이벤트, RLS 차단 이벤트, 파일 접근 실패, 메시지 차단 이벤트를 기록한다.
- Admin만 조회한다.

#### activity_logs

- 회원은 본인 activity만 조회한다.
- Professor는 담당 Student 활동 요약을 조회한다.
- Agent는 배정 하위 Buyer 활동 요약을 조회한다.
- Global Trade Passport는 activity_logs, Career Rank, Badge, Reward, Showcase, Buyer 유치, 시장조사 이력을 기반으로 구성한다.

## 8. 개인정보 마스킹 정책

하부 Buyer 또는 하부 Student 조회 화면은 원본 테이블 직접 조회 대신 summary view 또는 RPC를 사용한다.

### 8.1 Parent Buyer가 볼 수 있는 하부 Buyer 정보

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

### 8.2 Parent Buyer가 볼 수 없는 정보

- 이메일 전체
- 전화번호 전체
- 상세 문의내용
- 계약금액
- 관리자 메모

### 8.3 권장 View

| View | 목적 |
|------|------|
| `buyer_referral_summary_view` | Parent Buyer용 하부 Buyer 요약 |
| `agent_buyer_summary_view` | Agent용 배정 국가 Buyer 요약 |
| `professor_student_summary_view` | Professor용 하부 Student 요약 |
| `public_company_view` | 공개 회사 페이지 |
| `public_product_view` | 공개 승인 제품 |
| `public_student_showcase_view` | 공개 승인 Showcase |

## 9. 상태 변경 권한

| 대상 | Draft/Submitted | Reviewing | Approved | Rejected | Suspended |
|------|-----------------|-----------|----------|----------|-----------|
| `products` | Supplier | Admin | Admin | Admin | Admin |
| `buy_sell_posts` | Supplier | Admin | Admin | Admin | Admin |
| `buy_requests` | Buyer | Admin | Admin | Admin | Admin |
| `student_showcases` | Student | Admin | Admin | Admin | Admin |
| `market_research_reports` | Student | Admin | Admin | Admin | Admin |
| `events` | Admin | Admin | Admin | Admin | Admin |
| `thailand_fda_applications` | Supplier | Admin | Admin | Admin | Admin |
| `company_verifications` | Supplier request | Admin | Admin | Admin | Admin |

## 10. Server Action 경계

RLS와 별도로 다음 작업은 반드시 Server Action 또는 관리자 API에서 처리한다.

- 관리자 승인, 반려, 차단, 정지
- Company Verification 상태 변경
- Referral Reward 승인
- Student Showcase 승인
- Market Research Report 승인
- FDA 견적과 완료 보고서 등록
- 메시지 차단
- Admin log 기록
- 파일 signed URL 발급

클라이언트는 service role key를 절대 사용하지 않는다.

## 11. 구현 순서

1. `profiles`, `member_types`, `roles`, `permissions`, `profile_roles` RLS 적용
2. helper functions 생성
3. 회원 도메인 테이블 RLS 적용
4. 회사와 마스터 데이터 RLS 적용
5. 콘텐츠 테이블 RLS 적용
6. Student Showcase와 Market Research RLS 적용
7. Referral, Matching, Reward RLS 적용
8. Buyer Source, Marketplace Analytics, Showcase KPI, Company Score RLS 적용
9. Event, FDA RLS 적용
10. Conversation, Message, File RLS 적용
11. 설정, SEO, Audit RLS 적용
12. summary view와 RPC 생성
13. RLS 테스트와 로그 점검

## 12. RLS 테스트 체크리스트

### 12.1 Anonymous

- [ ] 승인된 public company만 조회 가능
- [ ] 승인된 product만 조회 가능
- [ ] 승인된 Student Showcase만 조회 가능
- [ ] pending/rejected 콘텐츠 조회 불가
- [ ] profile, message, FDA, referral 데이터 조회 불가

### 12.2 Supplier

- [ ] 본인 company와 product만 수정 가능
- [ ] 다른 Supplier product 수정 불가
- [ ] approved public content 조회 가능
- [ ] Student Showcase product 원본 수정 권한이 Student에게 위임되지 않음
- [ ] 본인 FDA application만 조회 가능

### 12.3 Buyer

- [ ] 본인 Buy Request 생성 가능
- [ ] 다른 Buyer의 private Buy Request 상세 조회 불가
- [ ] 본인 referral code 조회 가능
- [ ] 하부 Buyer는 마스킹 요약만 조회 가능

### 12.4 Agent

- [ ] 배정 국가 Buyer 요약만 조회 가능
- [ ] 미배정 국가 Buyer 조회 불가
- [ ] 하부 Buyer conversation만 접근 가능
- [ ] 계약금액, 관리자 메모 조회 불가

### 12.5 Professor

- [ ] 담당 Student 요약 조회 가능
- [ ] 담당하지 않는 Student 조회 불가
- [ ] 담당 Student Showcase와 시장조사 조회 가능
- [ ] 담당 Student conversation만 접근 가능

### 12.6 Student

- [ ] 제품 직접 등록 불가
- [ ] approved product만 Showcase item에 추가 가능
- [ ] pending/rejected product는 Showcase item에 추가 불가
- [ ] product 원본 수정 불가
- [ ] 본인 Showcase만 수정 가능
- [ ] Showcase 승인 전 공개 조회 불가
- [ ] 본인 Market Research Report 작성 가능
- [ ] Market Research Report 승인 전 공개 조회 불가

### 12.7 Admin

- [ ] 전체 운영 테이블 조회 가능
- [ ] 승인, 반려, 정지 상태 변경 가능
- [ ] 메시지 열람과 차단 가능
- [ ] admin_logs와 audit_events 조회 가능
- [ ] 일반 사용자로는 admin_logs 조회 불가

### 12.8 Analytics

- [ ] Anonymous는 허용된 public analytics event만 insert 가능
- [ ] Anonymous는 raw analytics event를 조회할 수 없음
- [ ] Student는 본인 Showcase KPI aggregate만 조회 가능
- [ ] Supplier는 본인 회사와 제품 관련 aggregate만 조회 가능
- [ ] Buyer source raw data는 Admin만 전체 조회 가능
- [ ] Company Visibility Score는 공개 가능한 등급 또는 badge만 공개 노출

## 13. 금지 사항

- 클라이언트에서 service role key 사용 금지
- RLS 비활성 테이블 운영 금지
- 공개 쿼리에서 approval/status 조건 생략 금지
- Student 제품 insert/update/delete 허용 금지
- 하부 Buyer 이메일/전화번호 전체 노출 금지
- 관리자 메모 일반 회원 노출 금지
- FDA private 파일 public bucket 저장 금지
- Admin 승인 상태를 일반 회원이 직접 변경하는 정책 금지

## 14. 개발 완료 기준

- [ ] 모든 비즈니스 테이블 RLS enabled
- [ ] helper functions 생성
- [ ] Admin full access 정책 검증
- [ ] Owner access 정책 검증
- [ ] Approved public read 정책 검증
- [ ] Student Showcase 정책 검증
- [ ] Student Showcase KPI aggregate 정책 검증
- [ ] Buyer Acquisition Tracking 정책 검증
- [ ] Marketplace Analytics event 정책 검증
- [ ] Company Visibility Score 공개 범위 검증
- [ ] Referral 개인정보 마스킹 검증
- [ ] Agent country assignment 정책 검증
- [ ] Professor assigned Student 정책 검증
- [ ] Conversation member 정책 검증
- [ ] File access 정책 검증
- [ ] Admin log와 audit event 기록 검증

## 15. 다음 산출물

RLS.md 이후 구현 단계에서 다음 파일을 작성한다.

- Supabase migration SQL
- RLS helper function SQL
- table policy SQL
- RLS test scenario
- seed role and permission data

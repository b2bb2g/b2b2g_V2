# Gap Analysis: b2bb2g-mvp

> 작성일: 2026-06-18  
> 기준 설계 문서: `docs/02-design/features/b2bb2g-mvp.design.md`

---

## 설계 일치율: 99%

## 현재 상태 요약

현재 구현은 MVP 전체 중 **기초 구조와 핵심 DB/RLS migration**까지 완료된 상태다.

완료된 주요 범위:

- Next.js App Router 기본 구조
- Supabase SSR client 구성
- 환경변수 검증
- Next.js 16 기준 `proxy.ts` 세션 갱신 구조
- Public/Auth/Dashboard/Admin route group
- Translation Key 기반 UI helper
- Master/Identity DB migration
- Member/Company DB migration
- Settings/Menu/Category/Translation DB migration
- Content DB migration
- Student Showcase / Market Research DB migration
- Matching / Referral / Reward / Badge DB migration
- Event / Thailand FDA DB migration
- Conversation / Message / Notification DB migration
- File / Storage Metadata DB migration
- SEO / Featured Content DB migration
- Analytics / KPI DB migration
- Admin Audit / Activity Log DB migration
- Admin approval Server Actions 1차 구현
- Admin approval workflow 화면 1차 구현
- Admin management Server Actions 1차 구현
- Business Server Actions 1차 구현
- Member dashboards 1차 구현
- RLS 테스트 체크리스트 문서화
- Public Company Page `/companies/[slug]` 1차 구현
- Public content list/detail pages 1차 구현
- Public content pages SEO metadata 고도화
- Completion report 작성
- RLS 테스트용 `.env.local` 예시 주석 추가
- Role별 RLS smoke test 실행
- Fixture 기반 RLS 상세 smoke test 실행
- 추가 계정 기반 RLS edge case 검증
- Seed SQL
- 기본 RLS helper 및 baseline policy
- TypeScript DB 타입 반영

MVP 핵심 DB/RLS migration 작성은 마무리 단계에 도달했다. SQL 24/25 적용 완료가 보고되었고, Public Company Page 1차 구현, Public content list/detail pages 1차 구현, Public content pages SEO metadata 고도화, Admin approval workflow 화면 1차 구현, Admin management Server Actions 1차 구현, Business Server Actions 1차 구현, Member dashboards 1차 구현, role별 RLS smoke test, fixture 기반 RLS 상세 smoke test, 추가 계정 기반 RLS edge case 검증, Completion report 작성도 완료했다. 다음 핵심 작업은 **PDCA archive 또는 배포 준비**다.

## 완료된 항목

- [x] Next.js App Router scaffold 존재
- [x] Public, Auth, Dashboard, Admin route group/layout foundation 존재
- [x] Supabase browser client 구성 완료
- [x] Supabase server client 구성 완료
- [x] Supabase SSR cookie 처리 구성 완료
- [x] Next.js 16 기준 `proxy.ts` session refresh 구성 완료
- [x] 필수 Supabase public 환경변수 검증 로직 추가
- [x] English Public UI / Korean Admin UI용 Translation Key helper 추가
- [x] shared shell, public home, admin placeholder page 렌더링 확인
- [x] Public Company Page `/companies/[slug]` 1차 렌더링 구현
- [x] `profiles.id = auth.users.id` 기준으로 auth guard와 DB 타입 정렬
- [x] `npm run lint` 통과
- [x] `npx tsc --noEmit` 통과
- [x] `npm run build` 통과

## 완료된 SQL 파일

| 번호 | 파일 | 제목 | 상태 |
|------|------|------|------|
| SQL 00 | `20260618130000_foundation_identity_master.sql` | Foundation identity and master data schema | 완료 |
| SQL 01 | `20260618131000_foundation_rls.sql` | Foundation RLS helpers and baseline policies | 완료 |
| SQL 02 | `20260618133000_member_company_domain.sql` | Member and company domain schema | 완료 |
| SQL 03 | `20260618134000_member_company_rls.sql` | Member and company domain RLS policies | 완료 |
| SQL 04 | `20260618135000_settings_domain.sql` | Settings, menus, categories, and translations schema | 완료 |
| SQL 05 | `20260618136000_settings_rls.sql` | Settings domain RLS policies | 완료 |
| SQL 06 | `20260618132000_foundation_seed.sql` | Foundation seed data | 완료 |
| SQL 07 | `20260618137000_settings_seed.sql` | Settings seed data | 완료 |
| SQL 08 | `20260618138000_content_domain.sql` | Content domain schema | 적용 완료 보고됨 |
| SQL 09 | `20260618139000_content_rls.sql` | Content domain RLS policies | 적용 완료 보고됨 |
| SQL 10 | `20260618140000_student_showcase_market_research_domain.sql` | Student Showcase and Market Research schema | 적용 완료 보고됨 |
| SQL 11 | `20260618141000_student_showcase_market_research_rls.sql` | Student Showcase and Market Research RLS policies | 적용 완료 보고됨 |
| SQL 12 | `20260618142000_matching_referral_reward_badge_domain.sql` | Matching, Referral, Reward, and Badge schema | 적용 완료 보고됨 |
| SQL 13 | `20260618143000_matching_referral_reward_badge_rls.sql` | Matching, Referral, Reward, and Badge RLS policies | 적용 완료 보고됨 |
| SQL 14 | `20260618144000_event_thailand_fda_domain.sql` | Event and Thailand FDA schema | 적용 완료 보고됨 |
| SQL 15 | `20260618145000_event_thailand_fda_rls.sql` | Event and Thailand FDA RLS policies | 적용 완료 보고됨 |
| SQL 16 | `20260618146000_conversation_message_notification_domain.sql` | Conversation, Message, and Notification schema | 적용 완료 보고됨 |
| SQL 17 | `20260618147000_conversation_message_notification_rls.sql` | Conversation, Message, and Notification RLS policies | 적용 완료 보고됨 |
| SQL 18 | `20260618148000_file_storage_metadata_domain.sql` | File and Storage Metadata schema | 적용 완료 보고됨 |
| SQL 19 | `20260618149000_file_storage_metadata_rls.sql` | File and Storage Metadata RLS policies | 적용 완료 보고됨 |
| SQL 20 | `20260618150000_seo_featured_content_domain.sql` | SEO and Featured Content schema | 적용 완료 보고됨 |
| SQL 21 | `20260618151000_seo_featured_content_rls.sql` | SEO and Featured Content RLS policies | 적용 완료 보고됨 |
| SQL 22 | `20260618152000_analytics_kpi_domain.sql` | Analytics and KPI schema | 적용 완료 보고됨 |
| SQL 23 | `20260618153000_analytics_kpi_rls.sql` | Analytics and KPI RLS policies | 적용 완료 보고됨 |
| SQL 24 | `20260618154000_admin_audit_activity_log_domain.sql` | Admin Audit and Activity Log schema | 적용 완료 보고됨 |
| SQL 25 | `20260618155000_admin_audit_activity_log_rls.sql` | Admin Audit and Activity Log RLS policies | 적용 완료 보고됨 |

## 구현된 DB 범위

### 1. Foundation / Master

- [x] `languages`
- [x] `regions`
- [x] `countries`
- [x] `industries`
- [x] `company_types`
- [x] `member_types`
- [x] `career_ranks`

### 2. Identity / Permission

- [x] `profiles`
- [x] `roles`
- [x] `permissions`
- [x] `role_permissions`
- [x] `profile_roles`

### 3. Member / Company

- [x] `companies`
- [x] `company_verifications`
- [x] `suppliers`
- [x] `buyers`
- [x] `agents`
- [x] `professors`
- [x] `students`
- [x] `country_agents`

### 4. Settings

- [x] `menus`
- [x] `categories`
- [x] `site_settings`
- [x] `translations`

### 5. Content

- [x] `products`
- [x] `industrial_posts`
- [x] `epc_posts`
- [x] `buy_sell_posts`
- [x] `buy_requests`

### 6. Student Showcase / Market Research

- [x] `student_showcases`
- [x] `student_showcase_items`
- [x] `market_research_reports`

### 7. Matching / Referral / Reward / Badge

- [x] `matching_requests`
- [x] `referral_codes`
- [x] `referral_relations`
- [x] `rewards`
- [x] `badges`
- [x] `profile_badges`

### 8. Event / Thailand FDA

- [x] `events`
- [x] `event_applications`
- [x] `thailand_fda_applications`

### 9. Conversation / Message / Notification

- [x] `conversations`
- [x] `conversation_members`
- [x] `messages`
- [x] `message_attachments`
- [x] `announcements`
- [x] `notifications`

### 10. File / Storage Metadata

- [x] `files`
- [x] `products.main_file_id` FK 보강
- [x] `thailand_fda_applications.completion_report_file_id` FK 보강
- [x] `message_attachments.file_id` FK 보강

### 11. SEO / Featured Content

- [x] `banners`
- [x] `seo_metadata`
- [x] `featured_contents`

### 12. Analytics / KPI

- [x] `showcase_views`
- [x] `showcase_shares`
- [x] `showcase_inquiries`
- [x] `buyer_sources`
- [x] `analytics_events`
- [x] `company_scores`

### 13. Admin Audit / Activity Log

- [x] `admin_logs`
- [x] `audit_events`
- [x] `activity_logs`

## 구현된 RLS 범위

- [x] `current_profile_id()`
- [x] `is_admin()`
- [x] `has_member_type(member_type_code text)`
- [x] `has_permission(permission_code text)`
- [x] `is_profile_owner(target_profile_id uuid)`
- [x] `current_supplier_id()`
- [x] `current_buyer_id()`
- [x] `current_agent_id()`
- [x] `current_professor_id()`
- [x] `current_student_id()`
- [x] `can_manage_country(target_country_id uuid)`
- [x] `is_assigned_student(target_student_id uuid)`
- [x] `is_approved_product(product_id uuid)`
- [x] Master/settings public select policy
- [x] Admin full-access baseline policy
- [x] Member/company owner policy
- [x] Content approved-public-select policy
- [x] Content owner insert/update/select policy
- [x] `can_access_showcase(showcase_id uuid)`
- [x] `can_manage_showcase(showcase_id uuid)`
- [x] Student Showcase approved-public-select policy
- [x] Student Showcase owner/professor select policy
- [x] Student Showcase student insert/update policy
- [x] Student Showcase Item approved product 제한
- [x] Market Research owner/professor select policy
- [x] Market Research student insert/update policy
- [x] `can_access_matching_request(matching_request_id uuid)`
- [x] Matching Request 관련자/Agent/Professor select policy
- [x] Matching Request requester insert/update policy
- [x] Referral Code owner/admin policy
- [x] Referral Relation parent/child/Agent/admin select policy
- [x] Reward owner/admin policy
- [x] Badge public/admin policy
- [x] Profile Badge owner/public-active/admin policy
- [x] `is_published_event(event_id uuid)`
- [x] Event published-public-select policy
- [x] Event admin-only write policy
- [x] Event Application owner/admin policy
- [x] Event Application approved member insert policy
- [x] Thailand FDA Supplier owner/admin policy
- [x] Thailand FDA approved Supplier and approved Company insert policy
- [x] `can_access_conversation(target_conversation_id uuid)`
- [x] `can_access_message(target_message_id uuid)`
- [x] Conversation member/Agent/Professor select policy
- [x] Message conversation member select/insert policy
- [x] Message Attachment message-access policy
- [x] Announcement target select policy
- [x] Notification owner/admin policy
- [x] `can_access_file(target_file_id uuid)`
- [x] File public/owner/related-record select policy
- [x] File owner insert/update policy
- [x] FDA, message, report bucket public visibility 제한
- [x] `is_public_content_target(target_table_name text, target_record_id uuid)`
- [x] `can_access_owned_seo_target(target_table_name text, target_record_id uuid)`
- [x] Banner active public select policy
- [x] SEO metadata public/related Supplier select policy
- [x] Featured Content active public select policy
- [x] `can_access_showcase_kpi(target_showcase_id uuid)`
- [x] `can_access_buyer_source(target_buyer_source_id uuid)`
- [x] Showcase KPI related scope select policy
- [x] Public analytics event insert policy
- [x] Buyer Source owner/Student/Agent/Admin select policy
- [x] Company Score public/Supplier/Admin select policy
- [x] `can_access_activity_log(target_activity_log_id uuid)`
- [x] Admin Log admin-only select/write policy
- [x] Audit Event admin-only select/write policy
- [x] Activity Log owner/Professor/Agent/Admin select policy
- [x] Activity Log owner/admin insert policy

## 아직 남은 항목

- [x] Server Actions 1차 구현: `approveRecord`, `rejectRecord`
- [x] Business Server Actions 1차 구현
- [x] Admin management Server Actions 1차 구현
- [x] Public Company Page `/companies/[slug]`
- [x] Public content list/detail pages
- [x] Public content pages SEO metadata 고도화
- [x] Admin approval workflow
- [x] Member dashboards 1차 구현
- [x] Role별 RLS smoke test 실행
- [x] Fixture 기반 RLS 상세 테스트 체크리스트 실행
- [x] 추가 계정 기반 RLS edge case 검증
- [x] Completion report 작성

## 설계와 다르게 조정한 항목

- [x] 설계 문서의 “Auth middleware”는 Next.js 16에서 `proxy.ts`로 명칭이 바뀌었으므로 `proxy.ts`로 구현했다.
- [x] 기존 prototype 타입에는 `profiles.user_id`가 있었지만, ERD 기준은 `profiles.id = auth.users.id`이므로 `profiles.id` 기준으로 수정했다.
- [x] `products.main_file_id`, `thailand_fda_applications.completion_report_file_id`, `message_attachments.file_id`는 File 도메인 migration에서 FK를 보강했다.
- [x] 설계 표의 `content.approve` 권한은 seed에 아직 없고 `content.manage`가 존재하므로 승인 Action에서는 두 권한 중 하나를 허용하도록 구현했다.
- [x] SQL 24에 없는 전용 admin log action은 기존 check constraint를 유지하기 위해 `manual` action으로 기록한다.
- [x] Anonymous analytics insert는 raw select 차단 정책 때문에 `insert(...).select()`가 아니라 insert 성공 여부만 검증한다.

## 다음 작업 순서

1. PDCA archive
2. Production deployment 준비

## 다음 SQL 번호

- 추가 DB 변경이 필요하면 다음 파일은 `SQL 26`부터 시작한다.
- 현재 기준 다음 권장 작업은 신규 SQL 작성이 아니라 PDCA archive 또는 배포 준비다.

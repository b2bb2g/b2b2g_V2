# ERD v1

## 1. ERD Purpose

본 문서는 B2BB2G V2의 ERD Redesign v1이다. 현재 확정된 Architecture, Experience, Business Rules, Feature Flags, Permission Matrix, Communication Brokerage Security Design을 기준으로 후속 DB migration과 RLS 설계의 입력값을 정의한다.

본 문서는 논리 ERD 문서다. SQL migration, RLS SQL, UI, application code를 작성하지 않는다.

## 2. ERD Principles

| Principle ID | Principle |
| --- | --- |
| ERD-P-001 | Account와 Role은 분리한다. |
| ERD-P-002 | 하나의 Account는 여러 Role을 가질 수 있다. |
| ERD-P-003 | Role 기반 권한 설계를 지원한다. |
| ERD-P-004 | Supplier-Buyer 직접 메시지는 DB 구조상 차단 가능해야 한다. |
| ERD-P-005 | Buyer PII는 Supplier에게 직접 노출되지 않도록 구조화한다. |
| ERD-P-006 | 모든 공개 콘텐츠는 `approval_status` 또는 `publish_status` 기준으로 노출된다. |
| ERD-P-007 | 모든 주요 변경은 `audit_logs`에 기록 가능해야 한다. |
| ERD-P-008 | Soft Delete를 기본으로 한다. |
| ERD-P-009 | 모든 enum/status는 `docs/02-experience/03-state-machine.md`와 일치해야 한다. |
| ERD-P-010 | 기존 ERD와 충돌하면 새 Source of Truth를 우선한다. |

공통 컬럼 원칙:

- Primary key: `id uuid`
- Timestamp: `created_at`, `updated_at`
- Soft delete 대상: `deleted_at`
- Actor tracking 후보: `created_by_account_id`, `updated_by_account_id`
- 공개 콘텐츠: `approval_status`, `publish_status`, `published_at`
- Admin 관리 데이터: `admin_note`는 별도 `admin_memos` 또는 restricted column으로 관리한다.

## 3. Schema Group Overview

| # | Group | Core Tables |
| --- | --- | --- |
| 1 | Identity / Role | `profiles`, `roles`, `permissions`, `role_permissions`, `account_roles`, `role_applications` |
| 2 | Organization | `companies`, `company_members`, `agents`, `agent_buyers`, `professors`, `professor_students`, `students`, `buyers`, `suppliers` |
| 3 | Company / Supplier | `companies`, `company_members`, `suppliers`, `company_verifications` |
| 4 | Buyer / Agent | `buyers`, `agents`, `agent_buyers`, `buyer_sources` |
| 5 | Professor / Student | `professors`, `students`, `professor_students`, `graduation_records` |
| 6 | Marketplace | `products`, `product_images`, `product_documents`, `product_videos`, `industrial_posts`, `epc_projects`, `sell_products`, `categories`, `industries`, `countries`, `regions` |
| 7 | Buy Request | `buy_requests`, `buy_request_categories`, `buy_request_attachments`, `buy_request_matches` |
| 8 | Trade Brokerage | `inquiries`, `brokerage_cases`, `brokerage_case_participants`, `proposals`, `proposal_items`, `contact_release_approvals` |
| 9 | Communication | `conversations`, `conversation_members`, `messages`, `message_attachments`, `message_reads` |
| 10 | Approval / Audit | `approval_requests`, `approval_history`, `audit_logs`, `admin_memos` |
| 11 | Trust / Badge / Score | `verifications`, `badges`, `account_badges`, `company_badges`, `product_badges`, `company_scores`, `ranking_snapshots` |
| 12 | Membership | `supplier_memberships`, `membership_plans`, `membership_benefits`, `membership_overrides` |
| 13 | Student Growth | `student_showcases`, `student_showcase_items`, `market_research_reports`, `student_activities`, `global_trade_passports`, `student_rewards`, `graduation_records` |
| 14 | Event | `events`, `event_applications`, `event_attendance`, `event_reports` |
| 15 | Thailand FDA | `fda_applications`, `fda_application_documents`, `fda_quotes`, `fda_status_history`, `fda_completion_reports` |
| 16 | Exposure / Landing Builder | `exposure_slots`, `featured_contents`, `landing_pages`, `landing_sections`, `landing_section_translations`, `landing_section_items`, `landing_banners`, `landing_popups`, `landing_publish_history`, `landing_preview_tokens` |
| 17 | Board / Notification / Calendar | `boards`, `board_posts`, `board_post_attachments`, `notifications`, `notification_reads`, `calendar_events` |
| 18 | Media / File | `files`, `file_versions`, `storage_buckets`, `file_access_logs` |
| 19 | Analytics | `analytics_events`, `buyer_sources`, `showcase_views`, `showcase_shares`, `showcase_inquiries`, `inquiry_events`, `proposal_events` |
| 20 | Settings / Feature Flags / Translation | `site_settings`, `feature_flags`, `languages`, `translations`, `translation_keys`, `ui_themes`, `design_tokens`, `component_settings` |

## 4. Core Tables

Each table row below follows the required table definition format:

- Table Name
- Purpose
- Related Engine
- Key Columns
- Foreign Keys
- Unique Constraints
- Index Candidates
- RLS Notes
- Audit Required
- Soft Delete Required

Common index candidates:

- all foreign keys
- `status`, `approval_status`, `publish_status`
- `created_at desc`
- `deleted_at is null` partial indexes for active-list queries
- slug/code unique indexes

Common RLS notes:

- Public reads only approved/published/active and non-deleted records.
- Authenticated reads require Owner, Related, Subordinate, Assigned, Brokered, Admin, or System scope.
- Admin/System access must be server-side and auditable.

## 5. Identity / Role Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `profiles` | Supabase Auth account profile; Account-level identity only | Identity Engine | `id`, `email`, `display_name`, `phone`, `country_id`, `account_status`, `primary_language`, `deleted_at` | `id -> auth.users.id`, `country_id -> countries.id` | `email` | `account_status`, `country_id`, `deleted_at` | Owner/Admin/System. Supplier-facing views must not expose Buyer PII. | Yes for status/PII changes | Yes |
| `roles` | Role master data | Identity Engine | `id`, `code`, `name`, `description`, `is_system`, `is_active` | none | `code` | `is_active` | Public no; Admin manage; authenticated may read active role labels. | Yes | Yes for non-system |
| `permissions` | Permission/action master data | Identity Engine | `id`, `code`, `name`, `description`, `engine`, `module`, `action` | none | `code` | `engine`, `module`, `action` | Admin manage; app may read for server authorization. | Yes | Yes |
| `role_permissions` | Role-permission join | Identity Engine | `id`, `role_id`, `permission_id` | `role_id -> roles.id`, `permission_id -> permissions.id` | `role_id + permission_id` | `role_id`, `permission_id` | Admin/System only. | Yes | Yes |
| `account_roles` | Multi-role support for one Account | Identity Engine, Approval Engine | `id`, `account_id`, `role_id`, `role_status`, `approved_at`, `approved_by_account_id`, `revoked_at` | `account_id -> profiles.id`, `role_id -> roles.id`, `approved_by_account_id -> profiles.id` | `account_id + role_id` active partial | `account_id`, `role_id`, `role_status` | Owner can read own roles; Admin manages. | Yes | Yes |
| `role_applications` | Supplier/Agent/Professor/etc Role request workflow | Identity Engine, Approval Engine | `id`, `account_id`, `requested_role_id`, `application_status`, `submitted_at`, `reviewed_by_account_id`, `rejection_reason` | `account_id -> profiles.id`, `requested_role_id -> roles.id`, `reviewed_by_account_id -> profiles.id` | one active application per account+role | `application_status`, `account_id`, `requested_role_id` | Owner reads own; Admin reviews. | Yes | Yes |
| Supabase Auth sessions | Authentication/session source | Identity Engine | Supabase managed | Supabase managed | Supabase managed | Supabase managed | Supabase Auth is source; do not duplicate password/session secrets. | Supabase/Auth logs | No local table |

Identity decisions:

- `profiles` is account-level, not role-level.
- `account_roles` replaces single-role assumptions.
- `profiles.member_type_id` single Role structure is deprecated.
- `role_applications` replaces ad hoc Role approval columns for Supplier/Agent/Professor role onboarding.

## 6. Organization Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `companies` | Supplier company profile and microsite root | Organization, Company Microsite Engine | `id`, `name`, `slug`, `country_id`, `industry_id`, `company_status`, `verification_status`, `approval_status`, `publish_status` | `country_id -> countries.id`, `industry_id -> industries.id` | `slug` | `approval_status`, `publish_status`, `country_id`, `industry_id` | Public only approved/published; company members/Admin full. | Yes | Yes |
| `company_members` | Company-account relationship | Organization Engine | `id`, `company_id`, `account_id`, `company_role`, `status` | `company_id -> companies.id`, `account_id -> profiles.id` | `company_id + account_id + company_role` active partial | `company_id`, `account_id`, `status` | Company members related scope; Admin full. | Yes | Yes |
| `suppliers` | Supplier role profile | Supplier Membership Engine | `id`, `account_id`, `company_id`, `supplier_status`, `approved_at`, `membership_id` | `account_id -> profiles.id`, `company_id -> companies.id`, `membership_id -> supplier_memberships.id` | `account_id` active partial | `company_id`, `supplier_status` | Owner/Admin; public only safe supplier profile via company. | Yes | Yes |
| `buyers` | Buyer role profile and protected buyer attributes | Organization Engine | `id`, `account_id`, `company_name`, `country_id`, `buyer_status`, `agent_id`, `contact_person_name` | `account_id -> profiles.id`, `country_id -> countries.id`, `agent_id -> agents.id` | `account_id` active partial | `country_id`, `agent_id`, `buyer_status` | Owner/Admin; Agent limited subordinate; Supplier no PII. | Yes | Yes |
| `agents` | Agent role profile | Organization Engine | `id`, `account_id`, `agent_status`, `approved_at`, `assigned_region_note` | `account_id -> profiles.id` | `account_id` active partial | `agent_status` | Owner/Admin; public none by default. | Yes | Yes |
| `agent_buyers` | Agent-Buyer subordinate relationship | Organization Engine | `id`, `agent_id`, `buyer_id`, `status`, `assigned_at`, `ended_at` | `agent_id -> agents.id`, `buyer_id -> buyers.id` | `agent_id + buyer_id` active partial | `agent_id`, `buyer_id`, `status` | Agent sees subordinate limited summary; Admin full. | Yes | Yes |
| `professors` | Professor role profile | Organization Engine | `id`, `account_id`, `professor_status`, `university_name`, `department_name`, `approved_at` | `account_id -> profiles.id` | `account_id` active partial | `professor_status`, `university_name` | Owner/Admin; assigned Students see safe contact if needed. | Yes | Yes |
| `professor_students` | Professor-Student subordinate relationship | Organization Engine | `id`, `professor_id`, `student_id`, `status`, `assigned_at`, `ended_at` | `professor_id -> professors.id`, `student_id -> students.id` | `professor_id + student_id` active partial | `professor_id`, `student_id`, `status` | Professor sees subordinate Student full PII; Admin full. | Yes | Yes |
| `students` | Student role profile | Organization, Student Growth Engine | `id`, `account_id`, `student_status`, `university_name`, `department_name`, `graduation_status`, `career_rank_code` | `account_id -> profiles.id` | `account_id` active partial | `student_status`, `graduation_status`, `career_rank_code` | Owner/Admin; assigned Professor full; public no PII. | Yes | Yes |

Organization decisions:

- Agent-Buyer and Professor-Student relationships are explicit join tables.
- Student graduation must not destroy historical Professor-Student relationships; use `ended_at` and `graduation_records`.
- Company-User relation is `company_members`, not inferred only from Supplier.

## 7. Marketplace Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `products` | Commercial product root | Marketplace Engine | `id`, `supplier_id`, `company_id`, `category_id`, `industry_id`, `country_id`, `title`, `slug`, `approval_status`, `publish_status` | `supplier_id -> suppliers.id`, `company_id -> companies.id`, `category_id -> categories.id`, `industry_id -> industries.id`, `country_id -> countries.id` | `slug` | `supplier_id`, `approval_status`, `publish_status`, `category_id` | Supplier owner/Admin write; Student cannot create. Public approved/published only. | Yes | Yes |
| `product_images` | Product image gallery | Marketplace Engine | `id`, `product_id`, `file_id`, `sort_order`, `is_primary` | `product_id -> products.id`, `file_id -> files.id` | primary image partial per product | `product_id`, `sort_order` | Follows product visibility. | Yes | Yes |
| `product_documents` | Product PDF/catalog attachments | Marketplace Engine | `id`, `product_id`, `file_id`, `document_type`, `visibility` | `product_id -> products.id`, `file_id -> files.id` | none | `product_id`, `visibility` | Public only safe documents; owner/Admin full. | Yes | Yes |
| `product_videos` | External product video links | Marketplace Engine | `id`, `product_id`, `video_url`, `provider`, `sort_order`, `approval_status` | `product_id -> products.id` | none | `product_id`, `approval_status` | Public only approved product/video. | Yes | Yes |
| `industrial_posts` | Industrial equipment posts | Marketplace Engine | `id`, `supplier_id`, `category_id`, `title`, `slug`, `approval_status`, `publish_status` | `supplier_id -> suppliers.id`, `category_id -> categories.id` | `slug` | `supplier_id`, `approval_status`, `publish_status` | Supplier owner/Admin write; public approved/published. | Yes | Yes |
| `epc_projects` | EPC project posts | Marketplace Engine | `id`, `supplier_id`, `project_country_id`, `category_id`, `title`, `slug`, `approval_status`, `publish_status` | `supplier_id -> suppliers.id`, `project_country_id -> countries.id`, `category_id -> categories.id` | `slug` | `project_country_id`, `approval_status`, `publish_status` | Supplier owner/Admin write; public approved/published. | Yes | Yes |
| `sell_products` | BUY & SELL sell-side products | Marketplace Engine | `id`, `supplier_id`, `target_country_id`, `category_id`, `title`, `slug`, `approval_status`, `publish_status` | `supplier_id -> suppliers.id`, `target_country_id -> countries.id`, `category_id -> categories.id` | `slug` | `supplier_id`, `target_country_id`, `approval_status` | Supplier owner/Admin write; public approved/published. | Yes | Yes |
| `categories` | Shared category tree | Marketplace Engine | `id`, `parent_id`, `code`, `name`, `category_type`, `is_active` | `parent_id -> categories.id` | `code` | `category_type`, `parent_id`, `is_active` | Public active read; Admin manage. | Yes | Yes |
| `industries` | Industry taxonomy | Marketplace Engine | `id`, `code`, `name`, `is_active` | none | `code` | `is_active` | Public active read; Admin manage. | Yes | Yes |
| `countries` | Country master | Marketplace/Organization Engine | `id`, `iso2`, `iso3`, `name`, `region_id`, `is_active` | `region_id -> regions.id` | `iso2`, `iso3` | `region_id`, `is_active` | Public active read; Admin manage. | Yes | Yes |
| `regions` | Region master | Marketplace/Organization Engine | `id`, `code`, `name`, `is_active` | none | `code` | `is_active` | Public active read; Admin manage. | Yes | Yes |

Marketplace decisions:

- Student cannot directly create `products`.
- Product creation is Supplier/Admin only.
- Product public exposure requires `approval_status = approved` and a public `publish_status`.
- `sell_products` is the new name for SELL products; legacy `buy_sell_posts` is replace/deprecated.

## 8. Buy Request Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `buy_requests` | Buyer-created sourcing request | Marketplace Engine, Buy Request Engine | `id`, `buyer_id`, `destination_country_id`, `industry_id`, `title`, `summary`, `approval_status`, `publish_status`, `buyer_contact_visibility` | `buyer_id -> buyers.id`, `destination_country_id -> countries.id`, `industry_id -> industries.id` | none | `buyer_id`, `destination_country_id`, `approval_status`, `publish_status` | Buyer owner/Admin full; Supplier sees approved detail without Buyer PII. | Yes | Yes |
| `buy_request_categories` | Buy Request category join | Buy Request Engine | `id`, `buy_request_id`, `category_id` | `buy_request_id -> buy_requests.id`, `category_id -> categories.id` | `buy_request_id + category_id` | `category_id` | Follows buy request visibility. | Yes | Yes |
| `buy_request_attachments` | Buy Request file attachments | Buy Request Engine | `id`, `buy_request_id`, `file_id`, `visibility_scope` | `buy_request_id -> buy_requests.id`, `file_id -> files.id` | none | `buy_request_id`, `visibility_scope` | Supplier access only if approved and non-PII. | Yes | Yes |
| `buy_request_matches` | Match link between Buy Request and Supplier/Product/Brokerage | Buy Request Engine, Trade Brokerage Engine | `id`, `buy_request_id`, `supplier_id`, `product_id`, `brokerage_case_id`, `match_status` | `buy_request_id -> buy_requests.id`, `supplier_id -> suppliers.id`, `product_id -> products.id`, `brokerage_case_id -> brokerage_cases.id` | optional active unique per request+supplier+case | `buy_request_id`, `supplier_id`, `match_status` | Buyer owner, brokered Supplier, Admin. | Yes | Yes |

Buy Request decisions:

- Buyer creates `buy_requests`.
- Supplier detailed access is logged-in and policy-limited.
- Buyer PII must not be embedded into Supplier-facing rows.
- `destination_country_id` is required for target country semantics.

## 9. Trade Brokerage Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `inquiries` | Buyer inquiry entry before/within brokerage | Trade Brokerage Engine | `id`, `buyer_id`, `target_type`, `target_id`, `inquiry_status`, `brokerage_case_id`, `submitted_at` | `buyer_id -> buyers.id`, `brokerage_case_id -> brokerage_cases.id` | none | `buyer_id`, `target_type + target_id`, `inquiry_status` | Buyer owner/Admin; Supplier only after Admin Forward via case. | Yes | Yes |
| `brokerage_cases` | Admin Brokerage case root | Trade Brokerage Engine | `id`, `case_number`, `buyer_id`, `primary_supplier_id`, `admin_owner_account_id`, `case_status`, `source_inquiry_id` | `buyer_id -> buyers.id`, `primary_supplier_id -> suppliers.id`, `admin_owner_account_id -> profiles.id`, `source_inquiry_id -> inquiries.id` | `case_number` | `buyer_id`, `primary_supplier_id`, `case_status`, `admin_owner_account_id` | Brokered participants only; Admin full. | Yes | Yes |
| `brokerage_case_participants` | Case participants and visibility scopes | Trade Brokerage Engine | `id`, `brokerage_case_id`, `participant_role`, `account_id`, `supplier_id`, `buyer_id`, `visibility_scope`, `status` | `brokerage_case_id -> brokerage_cases.id`, `account_id -> profiles.id`, `supplier_id -> suppliers.id`, `buyer_id -> buyers.id` | active participant unique per case+role+account/supplier/buyer | `brokerage_case_id`, `participant_role`, `status` | Required for brokered access and PII masking. | Yes | Yes |
| `proposals` | Supplier proposal submitted through brokerage | Trade Brokerage Engine | `id`, `brokerage_case_id`, `supplier_id`, `proposal_status`, `submitted_at`, `reviewed_by_account_id`, `delivered_at` | `brokerage_case_id -> brokerage_cases.id`, `supplier_id -> suppliers.id`, `reviewed_by_account_id -> profiles.id` | none | `brokerage_case_id`, `supplier_id`, `proposal_status` | Supplier owner within case; Buyer only after Admin delivery. | Yes | Yes |
| `proposal_items` | Proposal line items/options | Trade Brokerage Engine | `id`, `proposal_id`, `product_id`, `title`, `quantity`, `unit_price_visibility`, `sort_order` | `proposal_id -> proposals.id`, `product_id -> products.id` | none | `proposal_id`, `product_id` | Follows proposal visibility. | Yes | Yes |
| `contact_release_approvals` | Case-level Direct Contact Release | Trade Brokerage Engine, Approval Engine | `id`, `brokerage_case_id`, `buyer_id`, `supplier_id`, `approved_by_admin_id`, `approved_at`, `expires_at`, `release_scope`, `reason`, `revoked_at` | `brokerage_case_id -> brokerage_cases.id`, `buyer_id -> buyers.id`, `supplier_id -> suppliers.id`, `approved_by_admin_id -> profiles.id` | one active release per case+buyer+supplier | `brokerage_case_id`, `buyer_id`, `supplier_id`, `expires_at` | Admin only write; Buyer/Supplier limited read after release. | Yes | Yes |

Trade Brokerage decisions:

- Buyer Inquiry starts a `brokerage_case`; it does not start a direct Supplier conversation.
- Supplier receives only Admin-forwarded and masked Buyer context.
- Proposal is delivered to Buyer only after Admin Review.
- Direct Contact Release is a case-level exception, not a global permission.

## 10. Communication Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `conversations` | Conversation root with typed security model | Communication Engine | `id`, `conversation_type`, `brokerage_case_id`, `created_by_account_id`, `created_by_role`, `admin_required`, `status` | `brokerage_case_id -> brokerage_cases.id`, `created_by_account_id -> profiles.id` | none | `conversation_type`, `brokerage_case_id`, `status` | Type-specific RLS; Supplier-Buyer requires case/release. | Yes | Yes |
| `conversation_members` | Conversation participants | Communication Engine | `id`, `conversation_id`, `account_id`, `participant_role`, `member_status`, `joined_at`, `left_at` | `conversation_id -> conversations.id`, `account_id -> profiles.id` | `conversation_id + account_id` active partial | `conversation_id`, `account_id`, `participant_role` | Must validate participant combination by type. | Yes | Yes |
| `messages` | Conversation messages | Communication Engine | `id`, `conversation_id`, `sender_account_id`, `message_status`, `body`, `message_scope`, `sent_at` | `conversation_id -> conversations.id`, `sender_account_id -> profiles.id` | none | `conversation_id`, `sender_account_id`, `sent_at`, `message_status` | Insert through `can_send_message`; no service-role fallback. | Yes for brokered/admin | Yes |
| `message_attachments` | Message attachments | Communication Engine, Media Engine | `id`, `message_id`, `file_id`, `visibility_scope` | `message_id -> messages.id`, `file_id -> files.id` | none | `message_id`, `visibility_scope` | Follows message visibility and file access. | Yes | Yes |
| `message_reads` | Read receipts | Communication Engine | `id`, `message_id`, `account_id`, `read_at` | `message_id -> messages.id`, `account_id -> profiles.id` | `message_id + account_id` | `account_id`, `read_at` | Participant only. | No | Yes |

Required `conversation_type` values:

- `agent_buyer`
- `professor_student`
- `admin_user`
- `brokerage_case`
- `direct_contact_released`
- `system_notice`

Communication decisions:

- Supplier-Buyer only conversation is forbidden.
- `messages` insert must use `can_send_message`.
- `brokerage_case` or `contact_release_approvals` is required for Supplier-Buyer communication.
- `conversations.conversation_type`, `conversations.brokerage_case_id`, `conversations.created_by_role`, `conversations.admin_required` are required design fields.

## 11. Approval / Audit Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `approval_requests` | Unified approval queue | Approval Engine | `id`, `target_type`, `target_id`, `request_type`, `request_status`, `requested_by_account_id`, `assigned_admin_account_id` | `requested_by_account_id -> profiles.id`, `assigned_admin_account_id -> profiles.id` | active target/request partial | `target_type + target_id`, `request_status`, `assigned_admin_account_id` | Owner sees own request; Admin manages. | Yes | Yes |
| `approval_history` | Approval status history | Approval Engine | `id`, `approval_request_id`, `from_status`, `to_status`, `changed_by_account_id`, `reason` | `approval_request_id -> approval_requests.id`, `changed_by_account_id -> profiles.id` | none | `approval_request_id`, `changed_by_account_id`, `created_at` | Admin; owner may see safe subset. | Yes | No |
| `audit_logs` | Security and business audit trail | Admin Control Engine | `id`, `actor_account_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent` | `actor_account_id -> profiles.id` | none | `actor_account_id`, `entity_type + entity_id`, `created_at` | Admin/System only. | Self | No |
| `admin_memos` | Admin-only notes on target entities | Admin Control Engine | `id`, `target_type`, `target_id`, `memo_body`, `created_by_account_id`, `visibility` | `created_by_account_id -> profiles.id` | none | `target_type + target_id`, `created_by_account_id` | Admin only; never public/Supplier/Buyer. | Yes | Yes |

Approval/Audit decisions:

- Approval workflow is cross-engine and should not be duplicated per domain.
- Audit logs are append-only and not soft-deleted.
- Admin memos are explicitly restricted.

## 12. Trust / Badge / Score Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `verifications` | Verification records for account/company/product/factory/exporter | Trust Engine | `id`, `target_type`, `target_id`, `verification_type`, `verification_status`, `verified_by_account_id`, `verified_at`, `expires_at` | `verified_by_account_id -> profiles.id` | active target+type partial | `target_type + target_id`, `verification_type`, `verification_status` | Public can read approved public verification badge; Admin manages. | Yes | Yes |
| `badges` | Badge master | Trust Engine | `id`, `code`, `name`, `badge_type`, `description`, `is_active` | none | `code` | `badge_type`, `is_active` | Public active read; Admin manage. | Yes | Yes |
| `account_badges` | Badge grants to accounts/roles | Trust Engine | `id`, `account_id`, `badge_id`, `granted_by_account_id`, `granted_at`, `expires_at`, `reason` | `account_id -> profiles.id`, `badge_id -> badges.id`, `granted_by_account_id -> profiles.id` | active account+badge partial | `account_id`, `badge_id`, `expires_at` | Owner read; Admin grant/revoke. | Yes | Yes |
| `company_badges` | Badge grants to companies | Trust Engine | `id`, `company_id`, `badge_id`, `granted_by_account_id`, `granted_at`, `expires_at` | `company_id -> companies.id`, `badge_id -> badges.id`, `granted_by_account_id -> profiles.id` | active company+badge partial | `company_id`, `badge_id` | Public if company public; Admin manage. | Yes | Yes |
| `product_badges` | Badge grants to products | Trust Engine | `id`, `product_id`, `badge_id`, `granted_by_account_id`, `granted_at`, `expires_at` | `product_id -> products.id`, `badge_id -> badges.id`, `granted_by_account_id -> profiles.id` | active product+badge partial | `product_id`, `badge_id` | Public if product public; Admin manage. | Yes | Yes |
| `company_scores` | Company score snapshots/current score | Trust Engine, Analytics Engine | `id`, `company_id`, `score_value`, `score_breakdown`, `score_status`, `calculated_at` | `company_id -> companies.id` | optional current score unique per company | `company_id`, `score_status`, `calculated_at` | Public only if published; Admin/System manage. | Yes | Yes |
| `ranking_snapshots` | Ranking snapshots for exposure/analytics | Trust Engine, Analytics Engine | `id`, `ranking_type`, `target_type`, `target_id`, `rank_position`, `score_value`, `snapshot_at` | none polymorphic | ranking_type+target+snapshot partial | `ranking_type`, `snapshot_at`, `rank_position` | Public only if source public; Admin/System manage. | Yes | Yes |

Trust decisions:

- Badge, Verification, Membership Badge are not the same concept.
- Company Score is separate from Badge.
- Auto badge grant remains Decision Required; Admin grant/revoke is the safe default.

## 13. Membership Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `membership_plans` | Supplier plan master | Supplier Membership Engine | `id`, `code`, `name`, `plan_tier`, `is_active`, `price_policy_note` | none | `code` | `plan_tier`, `is_active` | Public safe read; Admin manage. | Yes | Yes |
| `membership_benefits` | Plan benefit/limit mapping | Supplier Membership Engine | `id`, `plan_id`, `benefit_key`, `benefit_value`, `limit_value` | `plan_id -> membership_plans.id` | `plan_id + benefit_key` | `benefit_key` | Public safe read; Admin manage. | Yes | Yes |
| `supplier_memberships` | Supplier active membership state | Supplier Membership Engine | `id`, `supplier_id`, `plan_id`, `membership_status`, `started_at`, `expires_at` | `supplier_id -> suppliers.id`, `plan_id -> membership_plans.id` | active supplier membership partial | `supplier_id`, `plan_id`, `membership_status` | Supplier owner/Admin; public badge safe subset. | Yes | Yes |
| `membership_overrides` | Admin-granted premium/enterprise exceptions | Supplier Membership Engine, Admin Control Engine | `id`, `supplier_id`, `override_plan_id`, `granted_by_account_id`, `reason`, `expires_at`, `revoked_at` | `supplier_id -> suppliers.id`, `override_plan_id -> membership_plans.id`, `granted_by_account_id -> profiles.id` | active supplier override partial | `supplier_id`, `expires_at` | Admin manage; supplier read safe subset. | Yes | Yes |

Membership decisions:

- MVP may use manual Admin Granted Premium rather than billing automation.
- Free Supplier product limit is Decision Required.
- Premium/Enterprise never bypass Buyer PII restrictions.

## 14. Student Growth Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `student_showcases` | Student-created showcase root | Student Growth Engine | `id`, `student_id`, `title`, `slug`, `approval_status`, `publish_status`, `showcase_status` | `student_id -> students.id` | `slug` | `student_id`, `approval_status`, `publish_status` | Student owner; assigned Professor full; public approved/published only. | Yes | Yes |
| `student_showcase_items` | Showcase selected approved Supplier products | Student Growth Engine | `id`, `showcase_id`, `product_id`, `sort_order`, `caption` | `showcase_id -> student_showcases.id`, `product_id -> products.id` | `showcase_id + product_id` | `showcase_id`, `product_id` | Student owner/Professor/Admin; product must be approved. | Yes | Yes |
| `market_research_reports` | Student market research submissions | Student Growth Engine | `id`, `student_id`, `country_id`, `industry_id`, `report_status`, `title`, `file_id` | `student_id -> students.id`, `country_id -> countries.id`, `industry_id -> industries.id`, `file_id -> files.id` | none | `student_id`, `report_status`, `country_id`, `industry_id` | Student owner; assigned Professor/Admin full. | Yes | Yes |
| `student_activities` | Student activity ledger | Student Growth Engine | `id`, `student_id`, `activity_type`, `activity_status`, `points`, `related_type`, `related_id` | `student_id -> students.id` | none | `student_id`, `activity_type`, `activity_status` | Owner/Professor/Admin; public no PII. | Yes | Yes |
| `global_trade_passports` | Aggregated student passport snapshot | Student Growth Engine | `id`, `student_id`, `passport_status`, `rank_code`, `score_snapshot`, `generated_at` | `student_id -> students.id` | active student passport partial | `student_id`, `rank_code`, `generated_at` | Student/Professor/Admin. | Yes | Yes |
| `student_rewards` | Student reward approval/result | Student Growth Engine, Trust Engine | `id`, `student_id`, `reward_type`, `reward_status`, `approved_by_account_id`, `reason` | `student_id -> students.id`, `approved_by_account_id -> profiles.id` | none | `student_id`, `reward_status`, `reward_type` | Student/Professor/Admin; public range Decision Required. | Yes | Yes |
| `graduation_records` | Graduation and alumni/associate transition | Student Growth Engine, Organization Engine | `id`, `student_id`, `professor_id`, `graduation_status`, `graduated_at`, `approved_by_account_id` | `student_id -> students.id`, `professor_id -> professors.id`, `approved_by_account_id -> profiles.id` | one active graduation per student partial | `student_id`, `professor_id`, `graduation_status` | Student/Professor/Admin. | Yes | Yes |

Student Growth decisions:

- Student Showcase is not product registration.
- Student can select only approved Supplier products.
- Professor can access subordinate Student PII and activity.
- Global Trade Passport is derived from activities, badges, rewards, showcases, and graduation data.

## 15. Event Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `events` | Event root | Event Engine | `id`, `title`, `slug`, `event_status`, `approval_status`, `publish_status`, `starts_at`, `ends_at`, `capacity` | none | `slug` | `event_status`, `approval_status`, `publish_status`, `starts_at` | Public approved/published; Admin manage. | Yes | Yes |
| `event_applications` | Member event application | Event Engine | `id`, `event_id`, `account_id`, `application_status`, `applied_role`, `reviewed_by_account_id` | `event_id -> events.id`, `account_id -> profiles.id`, `reviewed_by_account_id -> profiles.id` | one active application per event+account | `event_id`, `account_id`, `application_status` | Owner/Admin; Professor may see subordinate Student applications. | Yes | Yes |
| `event_attendance` | Attendance records | Event Engine | `id`, `event_id`, `account_id`, `attendance_status`, `checked_in_at`, `checked_by_account_id` | `event_id -> events.id`, `account_id -> profiles.id`, `checked_by_account_id -> profiles.id` | `event_id + account_id` | `event_id`, `attendance_status` | Post-MVP advanced; Owner/Admin/assigned role. | Yes | Yes |
| `event_reports` | Event report/statistics | Event Engine | `id`, `event_id`, `report_status`, `summary`, `created_by_account_id` | `event_id -> events.id`, `created_by_account_id -> profiles.id` | none | `event_id`, `report_status` | Admin; public only if published. | Yes | Yes |

MVP:

- `events`
- `event_applications`

Post-MVP:

- `event_attendance`
- `event_reports` advanced statistics

## 16. Thailand FDA Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `fda_applications` | Thailand FDA application root | Thailand FDA Service Engine | `id`, `supplier_id`, `company_id`, `application_category`, `fda_application_status`, `submitted_at`, `assigned_admin_account_id` | `supplier_id -> suppliers.id`, `company_id -> companies.id`, `assigned_admin_account_id -> profiles.id` | none | `supplier_id`, `fda_application_status`, `application_category` | Supplier owner/Admin. | Yes | Yes |
| `fda_application_documents` | FDA application documents | Thailand FDA Service Engine | `id`, `fda_application_id`, `file_id`, `document_type`, `document_status`, `visibility_scope` | `fda_application_id -> fda_applications.id`, `file_id -> files.id` | none | `fda_application_id`, `document_type`, `document_status` | Supplier owner/Admin; sensitive documents not public. | Yes | Yes |
| `fda_quotes` | FDA quotation records | Thailand FDA Service Engine | `id`, `fda_application_id`, `quote_status`, `amount`, `currency`, `issued_by_account_id`, `issued_at` | `fda_application_id -> fda_applications.id`, `issued_by_account_id -> profiles.id` | none | `fda_application_id`, `quote_status` | Supplier owner/Admin. | Yes | Yes |
| `fda_status_history` | FDA status history | Thailand FDA Service Engine | `id`, `fda_application_id`, `from_status`, `to_status`, `changed_by_account_id`, `reason` | `fda_application_id -> fda_applications.id`, `changed_by_account_id -> profiles.id` | none | `fda_application_id`, `to_status`, `created_at` | Supplier owner safe subset; Admin full. | Yes | No |
| `fda_completion_reports` | Completion report and result file | Thailand FDA Service Engine | `id`, `fda_application_id`, `file_id`, `completed_by_account_id`, `completed_at`, `summary` | `fda_application_id -> fda_applications.id`, `file_id -> files.id`, `completed_by_account_id -> profiles.id` | one active completion report per application | `fda_application_id`, `completed_at` | Supplier owner/Admin. | Yes | Yes |

Thailand FDA decisions:

- MVP vertical service uses Thailand FDA only.
- New table name is `fda_applications`; legacy `thailand_fda_applications` is replace/deprecated candidate.
- Sensitive documents must not be public.

## 17. Exposure / Landing Builder Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `exposure_slots` | Exposure placement candidates and slot definitions | Exposure Engine | `id`, `slot_key`, `slot_type`, `target_engine`, `is_active` | none | `slot_key` | `slot_type`, `is_active` | Public active read; Admin manage. | Yes | Yes |
| `featured_contents` | Manual/automatic featured target selection | Exposure Engine | `id`, `slot_id`, `target_type`, `target_id`, `selection_type`, `priority`, `starts_at`, `ends_at`, `approval_status` | `slot_id -> exposure_slots.id` | active slot+target partial | `slot_id`, `target_type + target_id`, `starts_at`, `ends_at` | Public only if target approved/published. | Yes | Yes |
| `landing_pages` | Landing page root | Landing Page Builder Engine | `id`, `page_key`, `slug`, `landing_page_status`, `publish_status`, `published_version_id` | none | `page_key`, `slug` | `landing_page_status`, `publish_status` | Public published only; Admin manage. | Yes | Yes |
| `landing_sections` | Landing page section config | Landing Page Builder Engine | `id`, `landing_page_id`, `section_key`, `section_type`, `landing_section_status`, `sort_order`, `visibility_rules` | `landing_page_id -> landing_pages.id` | `landing_page_id + section_key` active partial | `landing_page_id`, `section_type`, `sort_order`, `landing_section_status` | Public published only; Admin manage. | Yes | Yes |
| `landing_section_translations` | Section localized text | Landing Page Builder Engine | `id`, `landing_section_id`, `language_code`, `title`, `subtitle`, `body` | `landing_section_id -> landing_sections.id`, `language_code -> languages.code` | `landing_section_id + language_code` | `language_code` | Public only for published section. | Yes | Yes |
| `landing_section_items` | Section target items | Landing Page Builder Engine | `id`, `landing_section_id`, `target_type`, `target_id`, `sort_order`, `visibility_scope` | `landing_section_id -> landing_sections.id` | section+target partial | `landing_section_id`, `target_type + target_id`, `sort_order` | Must check target approved/published. | Yes | Yes |
| `landing_banners` | Landing banner config | Landing Page Builder Engine | `id`, `file_id`, `banner_status`, `target_url`, `starts_at`, `ends_at`, `sort_order` | `file_id -> files.id` | none | `banner_status`, `starts_at`, `ends_at` | Public active only; Admin manage. | Yes | Yes |
| `landing_popups` | Popup config | Landing Page Builder Engine | `id`, `file_id`, `popup_status`, `target_url`, `starts_at`, `ends_at`, `display_rules` | `file_id -> files.id` | none | `popup_status`, `starts_at`, `ends_at` | Public active only; Admin manage. | Yes | Yes |
| `landing_publish_history` | Landing publish/rollback history | Landing Page Builder Engine | `id`, `landing_page_id`, `published_by_account_id`, `version_snapshot`, `published_at`, `rollback_from_id` | `landing_page_id -> landing_pages.id`, `published_by_account_id -> profiles.id`, `rollback_from_id -> landing_publish_history.id` | none | `landing_page_id`, `published_at` | Admin only. | Yes | No |
| `landing_preview_tokens` | Secure preview tokens | Landing Page Builder Engine | `id`, `landing_page_id`, `token_hash`, `expires_at`, `created_by_account_id` | `landing_page_id -> landing_pages.id`, `created_by_account_id -> profiles.id` | `token_hash` | `landing_page_id`, `expires_at` | Admin/preview holder; no public listing. | Yes | Yes |

Exposure decisions:

- Exposure Engine decides what to expose.
- Landing Builder decides where and in what order to render.
- Unapproved content must never be a featured/public section item.

## 18. Board / Notification / Calendar Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `boards` | Board definition | Admin Control Engine | `id`, `board_key`, `board_type`, `is_active`, `requires_approval` | none | `board_key` | `board_type`, `is_active` | Public active read; Admin manage. | Yes | Yes |
| `board_posts` | Board content posts | Admin Control Engine, Communication Engine | `id`, `board_id`, `author_account_id`, `title`, `slug`, `approval_status`, `publish_status`, `published_at` | `board_id -> boards.id`, `author_account_id -> profiles.id` | `board_id + slug` | `board_id`, `approval_status`, `publish_status` | Public approved/published; author/Admin manage. | Yes | Yes |
| `board_post_attachments` | Board post files | Board/File Engine | `id`, `board_post_id`, `file_id`, `sort_order` | `board_post_id -> board_posts.id`, `file_id -> files.id` | none | `board_post_id` | Follows post visibility. | Yes | Yes |
| `notifications` | Inbox notification records | Communication Engine | `id`, `recipient_account_id`, `notification_type`, `source_type`, `source_id`, `notification_status`, `title`, `body` | `recipient_account_id -> profiles.id` | none | `recipient_account_id`, `notification_status`, `created_at` | Recipient/Admin/System. | No for normal, Yes for admin broadcast | Yes |
| `notification_reads` | Notification read state if separated | Communication Engine | `id`, `notification_id`, `account_id`, `read_at` | `notification_id -> notifications.id`, `account_id -> profiles.id` | `notification_id + account_id` | `account_id`, `read_at` | Recipient only. | No | Yes |
| `calendar_events` | Calendar-compatible event aggregation | Event/Organization/Student Growth Engine | `id`, `source_type`, `source_id`, `title`, `starts_at`, `ends_at`, `visibility_scope` | none polymorphic | source_type+source_id partial | `starts_at`, `visibility_scope` | Visibility follows source entity. | Yes | Yes |

Board/Notification decisions:

- Common Board System uses `boards` + `board_posts`.
- Popup/Banner may use Landing Builder tables; do not duplicate content blindly.
- Notifications are per-recipient and must not leak private source data.

## 19. Media / File Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `files` | File metadata wrapper over Supabase Storage | Media/File Engine | `id`, `bucket_key`, `storage_path`, `owner_account_id`, `file_type`, `mime_type`, `size_bytes`, `visibility_scope`, `file_status` | `owner_account_id -> profiles.id` | `bucket_key + storage_path` | `owner_account_id`, `file_type`, `visibility_scope`, `file_status` | Owner/related/Admin; public only if approved source allows. | Yes | Yes |
| `file_versions` | File version history | Media/File Engine | `id`, `file_id`, `version_number`, `storage_path`, `created_by_account_id` | `file_id -> files.id`, `created_by_account_id -> profiles.id` | `file_id + version_number` | `file_id`, `created_at` | Same as file. | Yes | Yes |
| `storage_buckets` | Logical bucket configuration | Media/File Engine | `id`, `bucket_key`, `bucket_policy`, `is_public`, `allowed_mime_types` | none | `bucket_key` | `is_public` | Admin/System; public bucket metadata safe subset only. | Yes | Yes |
| `file_access_logs` | File download/access audit | Media/File Engine | `id`, `file_id`, `account_id`, `access_type`, `accessed_at`, `ip_address` | `file_id -> files.id`, `account_id -> profiles.id` | none | `file_id`, `account_id`, `accessed_at` | Admin/System; owner safe summary if needed. | Self | No |

Media decisions:

- File metadata is in DB; binary object is in Supabase Storage.
- Sensitive FDA/message/proposal files must be private.
- File access for sensitive data must be logged.

## 20. Analytics Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `analytics_events` | Generic analytics event stream | Analytics Engine | `id`, `event_name`, `actor_account_id`, `target_type`, `target_id`, `metadata`, `occurred_at` | `actor_account_id -> profiles.id` nullable | none | `event_name`, `target_type + target_id`, `occurred_at` | Admin/System; public insert requires validation/rate limit. | No normal, Yes for sensitive | No |
| `buyer_sources` | Buyer acquisition source tracking | Analytics Engine | `id`, `buyer_id`, `source_type`, `source_ref`, `agent_id`, `student_id`, `created_at` | `buyer_id -> buyers.id`, `agent_id -> agents.id`, `student_id -> students.id` | none | `buyer_id`, `source_type`, `agent_id`, `student_id` | Buyer owner/Admin; Agent/Student only aggregate if allowed. | Yes | Yes |
| `showcase_views` | Student Showcase view events | Analytics Engine | `id`, `showcase_id`, `viewer_account_id`, `viewer_type`, `occurred_at` | `showcase_id -> student_showcases.id`, `viewer_account_id -> profiles.id` nullable | none | `showcase_id`, `occurred_at` | Public insert with abuse controls; Admin/owner aggregate. | No | No |
| `showcase_shares` | Showcase share events | Analytics Engine | `id`, `showcase_id`, `actor_account_id`, `share_channel`, `occurred_at` | `showcase_id -> student_showcases.id`, `actor_account_id -> profiles.id` nullable | none | `showcase_id`, `share_channel`, `occurred_at` | Owner/Professor/Admin aggregate. | No | No |
| `showcase_inquiries` | Buyer inquiries from showcase | Analytics/Student Growth Engine | `id`, `showcase_id`, `buyer_id`, `brokerage_case_id`, `inquiry_status` | `showcase_id -> student_showcases.id`, `buyer_id -> buyers.id`, `brokerage_case_id -> brokerage_cases.id` | none | `showcase_id`, `buyer_id`, `inquiry_status` | Student sees aggregate, not Buyer PII unless policy allows. | Yes | Yes |
| `inquiry_events` | Inquiry lifecycle analytics | Analytics/Trade Brokerage Engine | `id`, `inquiry_id`, `brokerage_case_id`, `event_type`, `occurred_at` | `inquiry_id -> inquiries.id`, `brokerage_case_id -> brokerage_cases.id` | none | `brokerage_case_id`, `event_type`, `occurred_at` | Admin/System; participants aggregate only. | No | No |
| `proposal_events` | Proposal lifecycle analytics | Analytics/Trade Brokerage Engine | `id`, `proposal_id`, `brokerage_case_id`, `event_type`, `occurred_at` | `proposal_id -> proposals.id`, `brokerage_case_id -> brokerage_cases.id` | none | `proposal_id`, `event_type`, `occurred_at` | Admin/System; participants aggregate only. | No | No |

Analytics decisions:

- Analytics Engine is read/observe oriented and must not affect write authorization.
- Supplier analytics must never include Buyer email/phone/contact.
- Public insert analytics require abuse/rate-limit strategy.

## 21. Settings / Translation Tables

| Table Name | Purpose | Related Engine | Key Columns | Foreign Keys | Unique Constraints | Index Candidates | RLS Notes | Audit Required | Soft Delete Required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `site_settings` | Global site/admin settings | Admin Control Engine | `id`, `setting_key`, `setting_value`, `setting_scope`, `is_public` | none | `setting_key + setting_scope` | `setting_key`, `is_public` | Public only if `is_public`; Admin manage. | Yes | Yes |
| `feature_flags` | Feature flag storage | Admin Control Engine | `id`, `flag_key`, `flag_value`, `admin_editable`, `risk_level`, `updated_by_account_id` | `updated_by_account_id -> profiles.id` | `flag_key` | `admin_editable`, `risk_level` | Public no; server/Admin read; Admin manage restricted flags. | Yes | Yes |
| `languages` | Supported language master | Admin Control Engine | `code`, `name`, `native_name`, `is_active`, `is_default` | none | `code` | `is_active`, `is_default` | Public active read; Admin manage. | Yes | Yes |
| `translation_keys` | Translation key registry | Admin Control Engine | `id`, `key`, `namespace`, `description` | none | `key` | `namespace` | Admin manage; app read. | Yes | Yes |
| `translations` | Translated values | Admin Control Engine | `id`, `translation_key_id`, `language_code`, `value`, `status` | `translation_key_id -> translation_keys.id`, `language_code -> languages.code` | `translation_key_id + language_code` | `language_code`, `status` | Public/app read approved; Admin manage. | Yes | Yes |
| `ui_themes` | Theme configuration | UI Design System Engine | `id`, `theme_key`, `theme_status`, `tokens_snapshot` | none | `theme_key` | `theme_status` | Public active read; Admin manage. | Yes | Yes |
| `design_tokens` | Design token values | UI Design System Engine | `id`, `token_key`, `token_value`, `token_group`, `theme_id` | `theme_id -> ui_themes.id` | `theme_id + token_key` | `token_group`, `theme_id` | Public active read; Admin manage. | Yes | Yes |
| `component_settings` | Component-level admin settings | UI Design System Engine | `id`, `component_key`, `setting_value`, `is_active`, `updated_by_account_id` | `updated_by_account_id -> profiles.id` | `component_key` | `is_active` | Admin manage; app read safe active settings. | Yes | Yes |

Settings decisions:

- UI text must use Translation Key based management.
- Feature flags do not override RLS or Permission Matrix.
- Restricted flags require audit.

## 22. Deprecated / Replace Notes

| Existing / Legacy Structure | Status | Reason | Replacement |
| --- | --- | --- | --- |
| `profiles.member_type_id` single Role structure | Deprecated | Account and Role must be separated; one Account can have multiple Roles. | `account_roles` |
| `profile_roles` naming | Replace candidate | New SOT uses Account-level naming. | `account_roles` |
| `member_types` as permission root | Deprecated | Role and permission matrix now drive access. | `roles`, `permissions`, `role_permissions`, `account_roles` |
| Supplier-Buyer direct conversation structure | Replace | Violates Admin Brokerage and Buyer PII policy. | `brokerage_cases`, typed `conversations`, `contact_release_approvals` |
| generic `direct/group/support` only conversation type | Replace | Cannot enforce Role-specific messaging policy. | `agent_buyer`, `professor_student`, `admin_user`, `brokerage_case`, `direct_contact_released`, `system_notice` |
| sample fallback / `mergeWithSamples` structure | Replace | Can mix unapproved sample data into public UI. | approval/publish gated data queries |
| Buyer PII direct select structure | Replace | Supplier must not receive Buyer email/phone/contact. | masked/restricted views and role-specific DTOs |
| `buy_sell_posts` for SELL | Replace candidate | New SOT separates SELL products. | `sell_products` |
| `thailand_fda_applications` | Replace candidate | New naming standard groups FDA tables under `fda_*`. | `fda_applications` |

## 23. ERD Decision Required

| Decision ID | Topic | Options | Blocks |
| --- | --- | --- | --- |
| DR-ERD-001 | `brokerage_case_messages` 별도 테이블 여부 | separate table / reuse `conversations/messages` with `brokerage_case_id` | Communication migration and RLS complexity |
| DR-ERD-002 | `conversations/messages` 재사용 여부 | reuse existing / create dedicated case messaging | Backward compatibility |
| DR-ERD-003 | Direct Contact Release 만료 기본값 | 7/30/90 days / no default | `contact_release_approvals.expires_at` policy |
| DR-ERD-004 | Free Supplier product limit | numeric limit | `membership_benefits`, product create guard |
| DR-ERD-005 | Company Score 계산 테이블 상세 | snapshot-only / current+history / event-derived | `company_scores`, `ranking_snapshots` |
| DR-ERD-006 | Badge 자동 부여용 event model | use `analytics_events` / separate badge_event table / Admin-only | Trust automation |
| DR-ERD-007 | Membership billing 구조 MVP 포함 여부 | manual only / billing-ready fields / payment engine later | Membership tables and admin UI |
| DR-ERD-008 | Existing tables migration strategy | manual review / automated mapping / hybrid | Migration plan before SQL |

## 24. RLS Preparation Notes

RLS 설계에서 필요한 helper 후보:

- `is_admin`
- `has_role`
- `has_account_role`
- `is_company_member`
- `is_supplier_owner`
- `is_buyer_owner`
- `is_agent_of_buyer`
- `is_professor_of_student`
- `is_brokerage_case_participant`
- `has_contact_release`
- `can_send_message`
- `can_view_buyer_pii`
- `can_view_student_pii`

RLS design must cover:

- Supplier-Buyer direct conversation create denied.
- Supplier-Buyer direct message insert denied.
- Agent-Buyer subordinate message allowed.
- Professor-Student subordinate message allowed.
- Admin brokered case message allowed.
- Supplier sees Buy Request detail without Buyer PII.
- Professor sees subordinate Student full PII.
- Agent sees subordinate Buyer limited summary.
- Public sees only approved/published public content.
- Admin/System access is server-only and audited where sensitive.

## 25. Codex Implementation Notes

- 이 문서 확정 전 migration 작성 금지.
- RLS는 ERD 확정 후 작성.
- 기존 DB와 충돌하는 경우 migration strategy 문서 먼저 작성.
- 모든 enum은 State Machine 문서와 일치.
- 모든 권한은 Permission Matrix 기준.
- Communication/Trade Brokerage 구현은 `docs/04-permissions/02-communication-brokerage-security-design.md`를 우선한다.
- Existing ERD는 참고만 하며, Account/Role, Supplier-Buyer messaging, Buyer PII 원칙과 충돌하면 본 문서를 우선한다.
- Supabase migration tracking 정합성 확인 없이 구조 변경 migration을 적용하지 않는다.

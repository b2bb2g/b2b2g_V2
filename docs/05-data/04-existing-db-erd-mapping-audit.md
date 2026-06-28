# Existing DB to ERD Mapping Audit

## 1. Purpose

This document maps the current Supabase `public` schema tables to the ERD v1 target tables.

The goal is to classify each current table as Reuse, Refactor, Rename, Replace, Deprecated, or New before writing any SQL migration.

This document does not write SQL, change Supabase DB, update RLS policies, modify application code, or change UI.

## 2. Current DB Summary

| Item | Current Status |
| --- | --- |
| Supabase project | `ysonocyrvvskdajmpdmu` |
| Supabase URL | `https://ysonocyrvvskdajmpdmu.supabase.co` |
| Audit basis | `docs/07-implementation/04-supabase-health-audit.md` and local `supabase/migrations` table declarations |
| Public table count | 62 |
| Public tables with RLS enabled | 62 / 62 |
| Public tables with RLS disabled | 0 |
| Public RLS policies | 186 |
| Local migration files | 27 |
| Local public tables declared by migrations | 62 |
| Remote public tables | 62 |
| Missing remote tables vs local declarations | 0 |
| Extra remote tables vs local declarations | 0 |
| Migration metadata status | Standard `supabase_migrations.schema_migrations` not found; migration metadata alignment is P1 blocking issue |

## 3. Mapping Status Definition

| Status | Definition |
| --- | --- |
| Reuse | Existing table name and purpose mostly match ERD v1; keep and only make minor compatibility changes if needed. |
| Refactor | Existing table remains useful but needs column, constraint, RLS, relationship, or behavior changes. |
| Rename | Existing table maps cleanly to a new ERD name; migration should rename or create target then backfill. |
| Replace | Existing table or structure conflicts with new Source of Truth and should be replaced by new target model. |
| Deprecated | Existing table/column can remain temporarily for compatibility but must not be used as the new authority. |
| New | Target ERD table/object does not currently exist and must be added in a future migration. |

## 4. Existing Table Mapping Matrix

| Existing Table | Current Purpose | Target ERD Table | Mapping Status | Risk | Required Action | Migration Phase |
| --- | --- | --- | --- | --- | --- | --- |
| `activity_logs` | General activity log / activity tracking | `student_activities`, `audit_logs`, analytics event tables | Refactor | Activity semantics may mix audit, student growth, and analytics | Split or map by activity type; do not use as one generic authority | Phase 3 |
| `admin_logs` | Admin action log | `audit_logs`, `admin_memos` | Replace | Admin audit data split from new audit model | Backfill admin actions to `audit_logs`; keep notes/memos restricted | Phase 3 |
| `agents` | Agent role profile | `agents` | Refactor | Relationship boundaries need `agent_buyers` and account-role authority | Keep table, align status/account fields and subordinate relation | Phase 1-3 |
| `analytics_events` | Generic analytics event stream | `analytics_events` | Refactor | Public insert abuse and PII payload risk | Keep table; add payload validation/rate-limit strategy and PII exclusion | Phase 5 |
| `announcements` | Admin/system announcements | `notifications`, `board_posts`, `system_notice` conversation type | Refactor | ERD v1 does not keep `announcements` as a core table | Decide whether to keep as notification source or migrate to board/system notice | Phase 6 |
| `audit_events` | Audit event stream | `audit_logs` | Replace | Duplicate audit concepts with `admin_logs` | Consolidate into `audit_logs` after audit taxonomy is finalized | Phase 3 |
| `badges` | Badge master | `badges` | Reuse | Badge automation still P2 | Keep; later align badge types and admin grant/revoke workflow | Phase 2 |
| `banners` | Public banner content | `landing_banners` | Rename | Landing Builder target uses new name and scheduling model | Rename/backfill to `landing_banners` or create target and migrate | Phase 3 |
| `buy_requests` | Buyer sourcing request | `buy_requests` | Refactor | Buyer PII projection and `destination_country_id` semantics need review | Keep; enforce Supplier-safe fields and projection | Phase 5 |
| `buy_sell_posts` | Legacy SELL PRODUCTS table | `sell_products` | Rename | Existing SEO/RLS references use old name | Rename/backfill to `sell_products`; update SEO target references | Phase 3 |
| `buyer_sources` | Buyer acquisition/source tracking | `buyer_sources` | Refactor | Agent/Student aggregate scope and Buyer PII risk | Keep; limit Agent/Student visibility and exclude PII | Phase 5 |
| `buyers` | Buyer role profile | `buyers` | Refactor | Buyer PII exposure risk | Keep; add/align protected fields and projection paths | Phase 5 |
| `career_ranks` | Career rank master | `global_trade_passports`, rank master/support table | Reuse | ERD v1 references rank but does not detail master table | Keep as support table; document as Student Growth support in next ERD sync | Phase 2 |
| `categories` | Shared category taxonomy | `categories` | Reuse | Category domain/type alignment may need cleanup | Keep and align category type semantics | Phase 2 |
| `companies` | Company/microsite root | `companies` | Refactor | Public approval/publish and company member relation need alignment | Keep; align with `company_members`, approval, publish fields | Phase 2-3 |
| `company_scores` | Company score/KPI | `company_scores` | Reuse | Score formula unresolved P2 | Keep; do not enable auto-ranking until formula is approved | Phase 7 |
| `company_types` | Company type master | `companies`, support taxonomy | Reuse | Not detailed in ERD v1 but useful taxonomy | Keep as support taxonomy; document in ERD sync if retained | Phase 2 |
| `company_verifications` | Company verification records | `company_verifications`, `verifications` | Refactor | ERD has both company-specific and general trust direction | Keep temporarily; decide whether to consolidate into `verifications` | Phase 3 |
| `conversation_members` | Conversation participants | `conversation_members` | Refactor | Membership-only model does not block Supplier-Buyer direct conversation | Keep; add conversation type/case checks through RLS helpers | Phase 4-5 |
| `conversations` | Conversation root with `direct/group/support` type | `conversations` | Refactor | Current types cannot enforce Admin Brokerage policy | Add `brokerage_case_id`, `admin_required`, `created_by_role`; update allowed `conversation_type` | Phase 1 |
| `countries` | Country master | `countries` | Reuse | Country-agent mapping may move | Keep | Phase 2 |
| `country_agents` | Country/agent assignment | `agent_buyers`, Agent assignment support | Refactor | New ERD uses subordinate Buyer relation, not just country access | Keep as compatibility if needed; map actual Buyer management to `agent_buyers` | Phase 3 |
| `epc_posts` | EPC post/project content | `epc_projects` | Rename | Name drift between existing DB and ERD v1 | Rename/backfill to `epc_projects`; update routes/SEO references | Phase 3 |
| `event_applications` | Event application records | `event_applications` | Reuse | Professor/subordinate Student event scope needs tests | Keep and align RLS | Phase 5 |
| `events` | Event root | `events` | Reuse | Public approval/publish rules must remain strict | Keep | Phase 2 |
| `featured_contents` | Featured/exposure target selection | `featured_contents` | Refactor | ERD also introduces `exposure_slots` and landing builder | Keep; link to `exposure_slots` when added | Phase 2-3 |
| `files` | File metadata wrapper | `files` | Refactor | Sensitive FDA/message/proposal files need access logging | Keep; add file version/access log structures later | Phase 4-5 |
| `industrial_posts` | Industrial equipment posts | `industrial_posts` | Reuse | Public approval/publish rules must remain strict | Keep | Phase 2 |
| `industries` | Industry taxonomy | `industries` | Reuse | None material | Keep | Phase 2 |
| `languages` | Language master | `languages` | Reuse | Translation key relationship needs refactor | Keep | Phase 2 |
| `market_research_reports` | Student market research reports | `market_research_reports` | Reuse | Professor subordinate access tests needed | Keep | Phase 5 |
| `matching_requests` | Matching request workflow | `buy_request_matches`, `brokerage_cases` | Replace | New Trade Brokerage model separates matching and brokerage case | Backfill to `brokerage_cases`/`buy_request_matches` based on target type | Phase 3 |
| `member_referral_codes` | Member referral/invitation code | Invitation/referral support, `buyer_sources` | Refactor | Not a core ERD v1 table; public active read risk exists | Keep temporarily; constrain public validation path or move to scoped RPC/view | Phase 5 |
| `member_referral_signups` | Signup attribution from member referral | `buyer_sources`, invitation/signup audit | Refactor | Duplicate with `referral_relations`/Buyer source concepts | Map attribution into `buyer_sources` or final invitation model | Phase 3 |
| `member_types` | Legacy member type master | `roles`, `permissions`, `role_permissions`, `account_roles` | Deprecated | Old permission root conflicts with Account/Role separation | Keep as display/compatibility only; remove permission authority | Phase 1-8 |
| `menus` | Public/admin menu configuration | `site_settings`, `component_settings`, navigation config | Refactor | ERD v1 does not define `menus` as target core table | Keep if needed for navigation; do not use as business authority | Phase 6 |
| `message_attachments` | Message file attachments | `message_attachments` | Refactor | Attachment access must follow typed conversation and file policy | Keep; align with `can_send_message`/conversation read rules | Phase 5 |
| `messages` | Conversation messages | `messages` | Refactor | Current insert relies on membership access, not brokerage rules | Keep; enforce `can_send_message` and no service-role fallback | Phase 5 |
| `notifications` | User notifications | `notifications` | Reuse | May need `notification_reads` split | Keep and add read-state table if needed | Phase 2 |
| `permissions` | Permission master | `permissions` | Refactor | Needs Engine/Module/Action alignment | Keep; align codes with Permission Matrix | Phase 2 |
| `products` | Commercial product root | `products` | Refactor | Student must not create; Free Supplier limit 10 needs guard | Keep; add membership limit and approval/publish checks | Phase 5 |
| `professors` | Professor role profile | `professors` | Refactor | Needs `professor_students` relation and public application default OFF | Keep; align relation/status fields | Phase 2-3 |
| `profile_badges` | Badge grants to profiles | `account_badges` | Rename | ERD uses Account terminology | Rename/backfill to `account_badges` | Phase 3 |
| `profile_roles` | Existing profile-role join | `account_roles` | Rename | New authority is Account-based roles | Backfill to `account_roles`; then deprecate old table | Phase 2-3 |
| `profiles` | Supabase Auth profile; includes `member_type_id` | `profiles` + `account_roles` | Refactor | `profiles.member_type_id` must become legacy-only | Keep; exclude `member_type_id` from final permissions | Phase 1 |
| `referral_codes` | Buyer referral code | Invitation/referral support, `buyer_sources` | Refactor | Overlap with `member_referral_codes`; not final ERD target | Consolidate referral code models after invitation design | Phase 3 |
| `referral_relations` | Referral relationship | `buyer_sources`, `agent_buyers`, invitation relation | Refactor | Overlap with agent/subordinate and buyer source concepts | Map to final attribution relation; avoid PII leakage | Phase 3 |
| `regions` | Region master | `regions` | Reuse | None material | Keep | Phase 2 |
| `rewards` | Reward records | `student_rewards` | Rename | ERD uses Student Growth reward naming | Rename/backfill to `student_rewards` or split non-student rewards | Phase 3 |
| `role_permissions` | Role-permission join | `role_permissions` | Refactor | Must align with new `account_roles` authority and permission matrix | Keep; review codes and active/deleted handling | Phase 2 |
| `roles` | Role master | `roles` | Refactor | Role codes must align with Role List and multi-role model | Keep; align role taxonomy | Phase 2 |
| `seo_metadata` | SEO metadata for public targets | SEO metadata target not explicitly in ERD v1 | Refactor | ERD v1 omitted SEO table while app still uses it | Keep temporarily; add to ERD sync or map to landing/public content metadata | Phase 6 |
| `showcase_inquiries` | Buyer inquiries from Student Showcase | `showcase_inquiries`, `brokerage_cases` | Refactor | Buyer PII and brokerage linkage required | Keep; ensure inquiry creates/links brokerage case | Phase 5 |
| `showcase_shares` | Showcase share events | `showcase_shares` | Reuse | Public insert abuse controls needed | Keep; add validation/rate limit strategy | Phase 5 |
| `showcase_views` | Showcase view events | `showcase_views` | Reuse | Public insert abuse controls needed | Keep; add validation/rate limit strategy | Phase 5 |
| `site_settings` | Global settings | `site_settings` | Refactor | Feature flags need separate target table | Keep; split restricted flags to `feature_flags` | Phase 2-3 |
| `student_showcase_items` | Showcase selected products | `student_showcase_items` | Reuse | Must reference approved products only | Keep; validate RLS and constraints | Phase 5 |
| `student_showcases` | Student showcase root | `student_showcases` | Reuse | Public approval/publish and PII rules must hold | Keep | Phase 5 |
| `students` | Student role profile | `students` | Refactor | Professor subordinate PII access and passport model need alignment | Keep; add/align relation and passport support | Phase 2-3 |
| `suppliers` | Supplier role profile | `suppliers` | Refactor | New membership model and product/proposal limits required | Keep; connect to `supplier_memberships` | Phase 2-3 |
| `thailand_fda_applications` | Legacy Thailand FDA application table | `fda_applications`, `fda_application_documents`, `fda_quotes`, `fda_status_history`, `fda_completion_reports` | Replace | Existing single table mixes root/status/quote/document concepts | Backfill into normalized `fda_*` tables; keep sensitive files private | Phase 3 |
| `translations` | Translation values keyed directly by string | `translation_keys`, `translations` | Refactor | ERD expects translation key registry | Keep values; introduce `translation_keys` and backfill relation | Phase 3 |

## 5. New Target Tables Missing in Existing DB

| Target ERD Table / Object | Purpose | Status | Required Action | Suggested Phase |
| --- | --- | --- | --- | --- |
| `account_roles` | Multi-role Account authority | New | Create and backfill from `profile_roles`/legacy member type | Phase 2-3 |
| `role_applications` | Role request/approval workflow | New | Create for future role approvals | Phase 2 |
| `company_members` | Company-account membership | New | Create and backfill Supplier/company ownership | Phase 2-3 |
| `agent_buyers` | Agent-subordinate Buyer relation | New | Create and map current assignment/referral data if valid | Phase 2-3 |
| `professor_students` | Professor-subordinate Student relation | New | Create and backfill existing professor/student assignments if present | Phase 2-3 |
| `product_images` | Product image gallery | New | Add when product media is normalized | Phase 2 |
| `product_documents` | Product catalog/document files | New | Add with file visibility rules | Phase 2 |
| `product_videos` | Product video links | New | Add if product video data exists | Phase 2 |
| `sell_products` | New SELL PRODUCTS table | New | Backfill from `buy_sell_posts` | Phase 3 |
| `buy_request_categories` | Buy Request category join | New | Create if multi-category Buy Requests are needed | Phase 2 |
| `buy_request_attachments` | Buy Request files | New | Create with Buyer PII-safe visibility | Phase 2 |
| `buy_request_matches` | Buy Request match links | New | Create and map matching/brokerage relations | Phase 3 |
| `inquiries` | Buyer inquiry entry | New | Create before brokerage case flow | Phase 2 |
| `brokerage_cases` | Admin Brokerage root | New | Create before Supplier-Buyer messaging refactor | Phase 2 |
| `brokerage_case_participants` | Case access participants | New | Create with visibility scope | Phase 2 |
| `proposals` | Supplier proposal | New | Create after brokerage core | Phase 2 |
| `proposal_items` | Proposal line items | New | Create after proposals | Phase 2 |
| `contact_release_approvals` | Case-level Direct Contact Release | New | Create with 30-day expiry/default scope | Phase 2 |
| `message_reads` | Message read status | New | Add if read-state split is required | Phase 2 |
| `approval_requests` | Approval root | New | Create or decide if existing admin logs cover MVP | Phase 2 |
| `approval_history` | Approval transitions | New | Create for audit-grade approval history | Phase 2 |
| `audit_logs` | Unified audit log | New target exists as concept; current has `admin_logs`/`audit_events` | Create/backfill or rename/consolidate from old logs | Phase 2-3 |
| `admin_memos` | Restricted admin memo | New | Create if memo fields are separated from domain tables | Phase 2 |
| `verifications` | Trust verification root | New | Create if consolidating company verification/badges | Phase 2 |
| `account_badges` | Account badge grants | New | Backfill from `profile_badges` | Phase 3 |
| `company_badges` | Company badge grants | New | Create if company badges are needed | Phase 2 |
| `product_badges` | Product badge grants | New | Create if product badges are needed | Phase 2 |
| `ranking_snapshots` | Ranking snapshots | New | Defer until Company Score formula is approved | Phase 7 |
| `supplier_memberships` | Supplier membership state | New | Create before Free product/proposal guards | Phase 2 |
| `membership_plans` | Supplier plan master | New | Create with Free/Premium/Enterprise | Phase 2 |
| `membership_benefits` | Plan limit/benefit mapping | New | Add Free product limit 10 | Phase 2 |
| `membership_overrides` | Admin membership override | New | Create for manual premium/enterprise exceptions | Phase 2 |
| `student_activities` | Student activity ledger | New | Map relevant `activity_logs` if needed | Phase 3 |
| `global_trade_passports` | Student passport snapshot | New | Create after activity/rank model is stable | Phase 2 |
| `student_rewards` | Student reward result | New | Backfill from `rewards` where student-specific | Phase 3 |
| `graduation_records` | Student graduation records | New | Create for graduation workflow | Phase 2 |
| `event_attendance` | Event attendance | New | Add if MVP event attendance is needed | Phase 2 |
| `event_reports` | Event reports/statistics | New | Add if MVP event reporting is needed | Phase 2 |
| `fda_applications` | FDA application root | New | Backfill from `thailand_fda_applications` | Phase 3 |
| `fda_application_documents` | FDA documents | New | Split from old FDA table/file metadata | Phase 3 |
| `fda_quotes` | FDA quote records | New | Split quote fields from old FDA table if present | Phase 3 |
| `fda_status_history` | FDA status transitions | New | Backfill from current status where possible; unknown history not invented | Phase 3 |
| `fda_completion_reports` | FDA completion report | New | Split completion data/files | Phase 3 |
| `exposure_slots` | Exposure slot definitions | New | Create before final featured content refactor | Phase 2 |
| `landing_pages` | Landing page root | New | Create for Landing Builder | Phase 2 |
| `landing_sections` | Landing page sections | New | Create for Landing Builder | Phase 2 |
| `landing_section_translations` | Localized section text | New | Create after translation key strategy | Phase 2 |
| `landing_section_items` | Landing section target items | New | Create with approved/published target checks | Phase 2 |
| `landing_banners` | Landing banner table | New | Backfill from `banners` | Phase 3 |
| `landing_popups` | Landing popup config | New | Create if popup feature stays enabled | Phase 2 |
| `landing_publish_history` | Publish/rollback history | New | Create for Builder publish audit | Phase 2 |
| `landing_preview_tokens` | Secure preview tokens | New | Create after preview-token RLS method is decided | Phase 2 |
| `boards` | Board definition | New | Create if replacing menu/content board patterns | Phase 2 |
| `board_posts` | Board posts | New | Create for Notice/Success Story/FAQ type content | Phase 2 |
| `board_post_attachments` | Board files | New | Create with file visibility | Phase 2 |
| `notification_reads` | Notification read state | New | Add if read state is separated from notifications | Phase 2 |
| `calendar_events` | Calendar aggregation | New | Create if calendar is in MVP scope | Phase 2 |
| `file_versions` | File version history | New | Create for versioned files | Phase 2 |
| `storage_buckets` | Logical bucket metadata | New | Create if bucket config is DB-managed | Phase 2 |
| `file_access_logs` | File access audit | New | Create for sensitive downloads | Phase 2 |
| `inquiry_events` | Inquiry analytics | New | Create after brokerage core | Phase 2 |
| `proposal_events` | Proposal analytics | New | Create after proposal core | Phase 2 |
| `feature_flags` | Feature flag storage | New | Create before flag-driven runtime settings | Phase 2 |
| `translation_keys` | Translation key registry | New | Create and backfill from direct translation keys | Phase 3 |
| `ui_themes` | UI theme config | New | Create when UI Design System storage is needed | Phase 2 |
| `design_tokens` | Design token values | New | Create when token management is needed | Phase 2 |
| `component_settings` | Component-level settings | New | Create when component admin settings are needed | Phase 2 |
| `buyer_masked_profiles` / `buyer_public_profiles` | Buyer PII-safe projection | New | Create as view/RPC/projection before Supplier-facing refactor | Phase 5 |

## 6. Tables to Keep As-Is

These tables are closest to ERD v1 and can be reused with minor or no structural changes:

- `badges`
- `categories`
- `countries`
- `events`
- `event_applications`
- `industrial_posts`
- `industries`
- `languages`
- `market_research_reports`
- `notifications`
- `regions`
- `roles`
- `student_showcase_items`
- `student_showcases`
- `showcase_views`
- `showcase_shares`

Note: "Keep As-Is" does not mean skip RLS regression tests. It only means the table identity and primary purpose are aligned.

## 7. Tables to Refactor

Key refactor targets:

- `profiles`: keep identity, demote `member_type_id` to legacy.
- `companies`: align with `company_members`, approval, and publish model.
- `products`: add Free Supplier product limit behavior and maintain Student no-create rule.
- `buyers`: protect Buyer PII through projection.
- `suppliers`: connect to `supplier_memberships`.
- `agents`: connect to `agent_buyers`.
- `professors`: connect to `professor_students`.
- `students`: align with Professor subordinate PII and passport model.
- `conversations`, `conversation_members`, `messages`, `message_attachments`: add typed brokerage/release rules.
- `buy_requests`: remove Supplier-facing Buyer PII and align target country semantics.
- `analytics_events`, `buyer_sources`, `showcase_inquiries`: remove PII payload risk and add abuse controls.
- `featured_contents`: connect to `exposure_slots`.
- `translations`: add `translation_keys`.

## 8. Tables to Rename

| Existing Table | Target ERD Table | Notes |
| --- | --- | --- |
| `buy_sell_posts` | `sell_products` | SELL PRODUCTS target table. Existing SEO/RLS references must be updated after compatibility phase. |
| `epc_posts` | `epc_projects` | ERD v1 target name. |
| `profile_badges` | `account_badges` | Account-level terminology. |
| `profile_roles` | `account_roles` | New permission authority. |
| `rewards` | `student_rewards` | Only if existing rewards are Student-specific; otherwise split first. |
| `banners` | `landing_banners` | Landing Builder target. |

## 9. Tables to Replace

| Existing Table | Replacement | Reason |
| --- | --- | --- |
| `admin_logs` | `audit_logs`, `admin_memos` | New audit/memo separation. |
| `audit_events` | `audit_logs` | Consolidate audit streams. |
| `matching_requests` | `brokerage_cases`, `buy_request_matches` | New brokerage and matching model. |
| `thailand_fda_applications` | `fda_applications`, `fda_application_documents`, `fda_quotes`, `fda_status_history`, `fda_completion_reports` | New normalized FDA model. |
| Supplier-Buyer direct conversation structure | Typed `conversations` + `brokerage_cases` + `contact_release_approvals` | Direct conversation violates Admin Brokerage policy. |
| Buyer PII direct select structure | `buyer_masked_profiles` / restricted projection | Supplier must not access Buyer email/phone/contact person. |

## 10. Deprecated Tables / Columns

| Deprecated Item | Replacement | Rule |
| --- | --- | --- |
| `profiles.member_type_id` | `account_roles` | Keep as legacy compatibility field only; never use as final permission source. |
| `member_types` as permission root | `roles`, `permissions`, `role_permissions`, `account_roles` | May remain as display/compatibility data until removal phase. |
| `profile_roles` | `account_roles` | Backfill then stop new writes. |
| `buy_sell_posts` | `sell_products` | Backfill then stop new writes. |
| `thailand_fda_applications` | `fda_*` normalized tables | Backfill then stop new writes. |
| `direct/group/support` only conversation type | Typed conversation model | Replace with role/case-aware types. |
| `mergeWithSamples` / sample fallback paths | Real data + explicit fixtures | Remove from production data paths. |

`fda_documents` and `fda_quotations` are not present in the current 62 table list, but older workflow terminology mentions them. If encountered later, map them to `fda_application_documents` and `fda_quotes`.

## 11. High-Risk Migration Areas

| Area | Risk | Required Guard |
| --- | --- | --- |
| Role system migration | `member_type_id` / `member_types` / `profile_roles` may still drive permissions. | `account_roles` backfill, helper tests, role regression tests. |
| Communication/brokerage migration | Supplier-Buyer direct conversations may remain allowed. | Conversation audit, typed conversation fields, `can_send_message`. |
| Buyer PII projection | Supplier-facing joins can leak email/phone/contact person. | `buyer_masked_profiles` or restricted projection, `can_view_buyer_pii`. |
| FDA table rename/replace | Single legacy FDA table may mix root/status/quote/file concepts. | Non-destructive backfill to normalized `fda_*` tables and file visibility tests. |
| `buy_sell_posts` to `sell_products` | SEO, featured content, routes, RLS policies can still point to old name. | Compatibility view or dual-read period; target table update checklist. |
| Sample fallback removal | Demo data can appear in production UI. | Replace `mergeWithSamples` and sample fallback paths after real empty-state handling. |
| Migration metadata alignment | Standard Supabase CLI metadata missing. | Complete CLI link/list/repair readiness task before structural SQL apply. |

## 12. Recommended Migration Order

1. Confirm migration metadata alignment and snapshot baseline.
2. Add compatibility columns and views without deleting old structures.
3. Create `account_roles` and `role_applications`; backfill from `profile_roles` and `member_type_id`.
4. Create brokerage core tables: `brokerage_cases`, `brokerage_case_participants`, `contact_release_approvals`.
5. Add typed conversation compatibility columns to `conversations`.
6. Audit existing conversations and block/archive invalid Supplier-Buyer direct conversations.
7. Create Buyer PII-safe projection (`buyer_masked_profiles` or restricted RPC/DTO).
8. Add supplier membership tables and Free product limit support.
9. Add `feature_flags`.
10. Add Landing Builder tables and backfill `banners` if needed.
11. Prepare and test RLS helpers.
12. Migrate policies and run role-based RLS regression tests.
13. Refactor application code away from deprecated structures.
14. Validate full behavior.
15. Remove deprecated tables/columns only after validation and owner approval.

## 13. SQL Migration File Plan

SQL files are not written in this task. The following is the planned file sequence only.

| Planned File | Purpose | Notes |
| --- | --- | --- |
| `001_snapshot_baseline.sql` | Baseline schema/metadata capture helper or comments | Must be read-only or metadata-only; no destructive changes. |
| `002_role_compatibility.sql` | Add `account_roles`, `role_applications`, compatibility/backfill helpers | Does not drop `member_type_id` or `profile_roles`. |
| `003_brokerage_core.sql` | Add `brokerage_cases`, `brokerage_case_participants`, `contact_release_approvals` | Includes release expiry/scope fields. |
| `004_conversation_compatibility.sql` | Add typed conversation columns | Adds `conversation_type`, `brokerage_case_id`, `admin_required`, `created_by_role`. |
| `005_buyer_pii_projection.sql` | Add masked/restricted Buyer projection | View/RPC/projection must exclude PII for Supplier by default. |
| `006_supplier_membership.sql` | Add membership tables and Free limit support | Free product limit 10. |
| `007_feature_flags.sql` | Add feature flag storage | Flags cannot bypass RLS. |
| `008_landing_builder.sql` | Add Landing Builder tables | Includes landing pages/sections/items/banners/popups/history/tokens. |
| `009_rls_helpers.sql` | Add RLS helper functions | Includes `can_send_message`, `can_view_buyer_pii`. |
| `010_rls_policies.sql` | Add/update table policies | After helper tests. |
| `011_validation_tests.sql` | SQL validation/test fixture plan | Regression test SQL only; no production data mutation beyond controlled fixtures. |

## 14. Blocking Issues Before SQL

| Blocking Issue | Priority | Why It Blocks SQL |
| --- | --- | --- |
| Supabase migration metadata alignment incomplete | P1 | Future migrations can drift from remote history. |
| Existing table mapping requires owner review | P0 | Backfill/drop strategy must be agreed before migration files. |
| Role helper security definer scope unresolved | P1 | Helper privilege mistakes can bypass RLS. |
| Conversation audit not done | P0 | Supplier-Buyer direct records cannot be safely classified. |
| Buyer PII projection shape not finalized | P0 | Supplier-facing views/queries cannot be safely migrated. |
| FDA field-level mapping not audited | P1 | Legacy FDA table may contain quote/status/file fields that require separate targets. |
| SEO/featured references to `buy_sell_posts` not fully mapped | P1 | Rename to `sell_products` can break public pages. |
| Sample fallback references not inventoried | P1 | Production UI may continue mixing sample data after migration. |
| RLS regression fixtures not finalized | P1 | Cannot prove Supplier-Buyer, Buyer PII, Agent, Professor, and public access boundaries. |

## 15. Codex Implementation Notes

- 이 문서 확정 전 SQL migration 작성 금지.
- 실제 SQL은 다음 단계에서 migration 파일 단위로 작성한다.
- Destructive migration 금지.
- Supabase dashboard 수동 변경 금지.
- 모든 schema 변경은 GitHub migration으로 관리한다.
- Existing DB와 ERD v1이 충돌하면 P0 Decision Resolution과 ERD v1을 우선한다.
- Existing table은 먼저 Reuse / Refactor / Rename / Replace / Deprecated / New 기준으로 분류한 뒤 처리한다.
- Buyer PII direct select를 만들지 않는다.
- Supplier-Buyer direct message 허용 구조를 만들지 않는다.
- `account_roles`가 새 권한 기준이다.
- `profiles.member_type_id`와 `member_types`는 legacy compatibility로만 다룬다.

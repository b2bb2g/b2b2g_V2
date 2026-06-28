# SQL Migration Pack Spec v1

## 1. Purpose

This document defines the SQL migration pack specification for B2BB2G V2 before any real SQL migration file is authored.

It translates the current ERD v1, RLS Design v1, Migration Plan v1, Existing DB to ERD Mapping Audit, P0 Decision Resolution, and Supabase Health Audit into file-by-file migration intent, safety conditions, rollback notes, and validation requirements.

This document is not a SQL migration. It does not modify Supabase DB, application code, UI, RLS policies, or migration files.

## 2. Migration Pack Principles

| Principle ID | Principle |
| --- | --- |
| SMP-P-001 | Additive-first migration is mandatory. |
| SMP-P-002 | Destructive change is forbidden in this pack. |
| SMP-P-003 | Supabase dashboard manual schema changes are forbidden. |
| SMP-P-004 | All schema changes are managed through GitHub-tracked migration files. |
| SMP-P-005 | Every migration file must include rollback notes before it is applied. |
| SMP-P-006 | RLS migration is applied only after helper design and validation tests are prepared. |
| SMP-P-007 | If Buyer PII protection breaks, migration execution stops immediately. |
| SMP-P-008 | `profiles.member_type_id` remains legacy compatibility only and is not a permission source. |
| SMP-P-009 | `account_roles` is the target role authority. |
| SMP-P-010 | `conversations/messages` are reused with typed brokerage enforcement. |
| SMP-P-011 | `brokerage_case_messages` is not created for MVP. |
| SMP-P-012 | Supplier-Buyer direct messaging must be blocked at DB/RLS level, not only in app code. |
| SMP-P-013 | Buyer email, phone, and contact person are excluded from Supplier-facing projections by default. |

## 3. Migration File Overview

| File | Purpose | Risk Level | Depends On | Can Rollback | Requires Data Backup | Validation Required |
| --- | --- | --- | --- | --- | --- | --- |
| `001_snapshot_baseline.sql` | Record current DB baseline and migration metadata state. | P1 High | Supabase CLI/link readiness or equivalent read-only baseline process. | Yes, metadata/comment-only if designed that way. | Yes | Table count, RLS status, migration metadata check. |
| `002_role_compatibility.sql` | Add account-role compatibility structures. | P1 High | Baseline snapshot; role mapping review. | Partially, if no destructive change and no final authority switch. | Yes | Role row counts, uniqueness, legacy field preserved. |
| `003_brokerage_core.sql` | Add Admin Brokerage and contact release core tables. | P1 High | P0 messaging/release decisions; role tables available or compatible. | Yes for new additive tables if no production backfill has committed. | Yes | Case/release constraints, audit fields, no message storage split. |
| `004_conversation_compatibility.sql` | Add typed conversation compatibility columns. | P0 Critical | Existing conversation audit plan; brokerage core target. | Partially, nullable additive columns can be rolled back before app switch. | Yes | Existing messages retained, unknown not auto-classified, Supplier-Buyer direct denied in later tests. |
| `005_buyer_pii_projection.sql` | Add Supplier-safe Buyer projection. | P0 Critical | Buyer PII field mapping; final projection name decision. | Yes if view/RPC-only and no old projection removal. | Yes | Supplier cannot select Buyer email/phone/contact person. |
| `006_supplier_membership.sql` | Add Supplier membership and tier limit structures. | P1 High | Role compatibility; Supplier table mapping. | Yes if additive only. | Yes | Free tier limit data, Premium+ proposal gating metadata. |
| `007_feature_flags.sql` | Add Admin-controlled feature flags. | P2 Medium | Settings governance; default flag review. | Yes if additive table/seed only. | Recommended | Required default flags exist and cannot bypass RLS. |
| `008_landing_builder.sql` | Add Landing Page Builder tables. | P2 Medium | Landing Builder scope; translation strategy review. | Yes if additive only. | Recommended | Admin-only write, public published-only read design readiness. |
| `009_rls_helpers.sql` | Add helper functions used by policies. | P1 High | Helper scope/security definer review; test fixtures. | Partially, functions can be replaced/dropped before policies depend on them. | Yes | Helper unit scenarios, fixed `search_path`, no PII leak. |
| `010_rls_policies.sql` | Apply table RLS policy updates. | P0 Critical | Helper validation; role fixtures; projection ready. | Partially, requires policy rollback file and maintenance window. | Yes | Full RLS regression matrix. |
| `011_validation_tests.sql` | Define/run migration validation scenarios. | P1 High | All prior files as applicable. | Yes, tests should not mutate production except controlled fixtures. | Yes | Required access-control and public-content tests pass. |

Risk levels follow the project security scale:

- P0 Critical: can expose Buyer PII, allow Supplier-Buyer direct messaging, or break core RLS.
- P1 High: can break role authority, migration history, or sensitive workflow integrity.
- P2 Medium: can cause configuration drift or non-core security gaps.
- P3 Low: low-risk operational cleanup.

## 4. 001_snapshot_baseline.sql

### Purpose

- Record the current DB baseline before schema changes.
- Record the current 62 public table baseline.
- Record current RLS status baseline.
- Confirm migration metadata alignment before later files.

### Included Objects

| Candidate | Rule |
| --- | --- |
| Comment-only migration notes | Allowed. |
| Metadata table insert candidate | Allowed only if a project-owned migration audit table already exists or is explicitly approved. |
| Schema snapshot references | Allowed as comments or metadata references. |
| Destructive change | Forbidden. |

### Safety Conditions

- Must not create, drop, rename, or alter business tables.
- Must not disable RLS.
- Must not expose or print Supabase keys.
- Must record that remote public table count was previously audited as 62.
- Must record that all 62 public tables had RLS enabled in the Supabase Health Audit.
- Must record that standard `supabase_migrations.schema_migrations` was not found in the prior audit and requires alignment.

### Rollback Criteria

- If comment-only, rollback is not required.
- If metadata insert is used, rollback is a matching delete by migration id.
- If migration metadata state is unclear, stop before `002_role_compatibility.sql`.

### Validation

| Check | Expected Result |
| --- | --- |
| Public table count | 62 tables before schema-changing migrations. |
| RLS enabled count | 62 / 62 public tables enabled before schema-changing migrations. |
| Migration metadata | State documented; alignment issue not ignored. |
| GitHub migration baseline | Local migration pack and remote baseline are linked by review note. |

## 5. 002_role_compatibility.sql

### Purpose

- Introduce `account_roles` as the new Account/Role authority.
- Introduce `role_applications` for role request and approval workflow.
- Preserve `profiles.member_type_id` as legacy compatibility if present.
- Define compatibility with existing `profile_roles` and `member_types`.

### Included Candidates

| Candidate Object | Purpose |
| --- | --- |
| `account_roles` | Multi-role account authority. |
| `role_applications` | Role request/review workflow. |
| Optional compatibility view | Temporary bridge from legacy `profile_roles` / `member_types`. |
| Indexes | `account_id`, `role_id`, `role_status`, active partial uniqueness. |
| Constraints | One active role assignment per account+role where applicable. |

### Changed Columns

| Existing Item | Action |
| --- | --- |
| `profiles.member_type_id` | Keep; document as legacy field; do not drop. |
| `profile_roles` | Do not drop; prepare mapping/backfill path to `account_roles`. |
| `member_types` | Keep as display/compatibility only; not a permission root. |

### Forbidden Work

- Do not delete `profiles.member_type_id`.
- Do not delete `profile_roles`.
- Do not delete `member_types`.
- Do not convert permission checks to a partially backfilled structure without validation.
- Do not infer multiple roles from ambiguous legacy data without review.

### Safety Conditions

- Additive table creation only.
- Backfill must be idempotent and auditable.
- Revoked, inactive, soft-deleted, or suspended legacy roles must not become active roles.
- Admin role assignments must be explicitly reviewed.

### Rollback Criteria

- Before app/RLS switch, new tables can be disabled by stopping writes and dropping only after backup review.
- If bad backfill is detected, truncate/backfill rollback must be based on the baseline snapshot.
- Legacy structures remain available, so production permission flow must not depend on incomplete migration.

### Validation

| Check | Expected Result |
| --- | --- |
| `account_roles` constraints | No duplicate active account+role assignments. |
| Legacy preservation | `profiles.member_type_id`, `profile_roles`, and `member_types` remain intact if present. |
| Role authority | Final RLS plan points to `account_roles`, not `member_type_id`. |
| Account multi-role | One Account can hold multiple active Roles. |
| Pending/revoked role | Pending/revoked roles do not grant permissions. |

## 6. 003_brokerage_core.sql

### Purpose

- Add Admin Brokerage core structures required before Supplier-Buyer communication migration.
- Add case-level Direct Contact Release support.
- Avoid creating a separate `brokerage_case_messages` table for MVP.

### Included Candidates

| Candidate Object | Purpose |
| --- | --- |
| `brokerage_cases` | Admin Brokerage case root. |
| `brokerage_case_participants` | Case participant and visibility scope. |
| `contact_release_approvals` | Case-level Direct Contact Release. |
| `proposals` review | Confirm whether current proposal structures exist or require later creation. |
| `proposal_items` review | Confirm line-item structure and visibility scope. |

### Required Columns

| Table | Required Column Candidate |
| --- | --- |
| `brokerage_cases` | `buyer_id`, `primary_supplier_id`, `admin_owner_account_id`, `case_status`, `source_inquiry_id`, `created_at`, `updated_at`, `deleted_at` |
| `brokerage_case_participants` | `brokerage_case_id`, `participant_role`, `account_id`, `supplier_id`, `buyer_id`, `visibility_scope`, `status` |
| `contact_release_approvals` | `brokerage_case_id`, `buyer_id`, `supplier_id`, `approved_by_admin_id`, `approved_at`, `expires_at`, `release_scope`, `reason`, `revoked_at` |

### Policy Notes

- `contact_release_approvals` is case-level only.
- Direct Contact Release default expiry is 30 days.
- Masked contact remains default after release.
- Email/phone/contact person exposure requires explicit admin approval in `release_scope`.
- Every release approval, revoke, renew, and scope change must be auditable.

### Forbidden Work

- Do not create `brokerage_case_messages` for MVP.
- Do not allow global Supplier-Buyer direct contact.
- Do not expose Buyer PII from brokerage participant rows.
- Do not use feature flags as RLS bypass.

### Safety Conditions

- Additive tables only.
- All case participant visibility scopes must default to restrictive values.
- Supplier participant access must be case-scoped.
- Buyer participant access must be case-scoped.
- Admin owner/participant model must be explicit enough for RLS.

### Rollback Criteria

- Before backfill/app use, additive brokerage tables can be dropped after backup review.
- After cases are created, rollback requires data export and replay plan.
- Contact releases must be revocable without dropping records.

### Validation

| Check | Expected Result |
| --- | --- |
| `brokerage_cases` | Case can represent Buyer/Admin/Supplier workflow without direct Supplier-Buyer conversation. |
| `brokerage_case_participants` | Participant uniqueness and visibility scope are enforceable. |
| `contact_release_approvals` | Release is scoped to buyer+supplier+case and has expiry. |
| Message storage | No separate `brokerage_case_messages` table created. |
| Audit readiness | Release/status operations have audit targets. |

## 7. 004_conversation_compatibility.sql

### Purpose

- Reuse existing `conversations/messages` by adding typed security columns.
- Prepare DB/RLS enforcement for Supplier-Buyer direct messaging prohibition.
- Preserve existing conversation/message records until audit and classification.

### Included Candidates

| Candidate Change | Purpose |
| --- | --- |
| `conversations.conversation_type` | Required target type gate. |
| `conversations.brokerage_case_id` | Links brokerage/release communication to case. |
| `conversations.created_by_role` | Captures role context at creation. |
| `conversations.admin_required` | Marks conversations that require Admin brokerage/ownership. |
| Indexes | `conversation_type`, `brokerage_case_id`, `status`, participant lookups. |

### Required Conversation Types

| Type | Allowed Participants | RLS Requirement |
| --- | --- | --- |
| `agent_buyer` | Agent and subordinate Buyer | `is_agent_of_buyer` true. |
| `professor_student` | Professor and subordinate Student | `is_professor_of_student` true. |
| `admin_user` | Admin and any allowed user | Admin participant or ownership. |
| `brokerage_case` | Buyer, Supplier, Admin/case participants | Valid brokerage case and participant scope. |
| `direct_contact_released` | Buyer and Supplier with release | Valid, unexpired, unrevoked case-level release. |
| `system_notice` | System/Admin sender and allowed recipients | No direct negotiation. |

### Forbidden Work

- Do not delete existing `conversations`.
- Do not delete existing `messages`.
- Do not auto-classify unknown conversations.
- Do not create or preserve valid Supplier+Buyer-only conversations without brokerage/release evidence.
- Do not create a global `supplier_buyer_direct` type.

### Safety Conditions

- Compatibility columns should be nullable until audit/backfill strategy is approved.
- Existing records require audit before type assignment.
- Supplier+Buyer-only conversations are blocked/archived candidates.
- Future message insert must rely on `can_send_message`.

### Rollback Criteria

- Before backfill, nullable additive columns can be dropped with minimal data risk.
- After type backfill, rollback requires preserving classification evidence.
- If Supplier-Buyer direct messaging becomes possible, stop and rollback policy/app activation.

### Validation

| Check | Expected Result |
| --- | --- |
| Existing records | Not deleted and not guessed into target types. |
| Type values | Restricted to approved conversation types after enforcement phase. |
| Supplier-Buyer direct | Not allowed without `brokerage_case` or `direct_contact_released`. |
| Agent-Buyer | Allowed only for subordinate relation. |
| Professor-Student | Allowed only for subordinate relation. |

## 8. 005_buyer_pii_projection.sql

### Purpose

- Protect Supplier-facing Buyer PII through masked or restricted projection.
- Remove reliance on direct Buyer email/phone/contact person selects in Supplier-facing paths.
- Prepare `can_view_buyer_pii` integration for RLS and application queries.

### Included Candidates

| Candidate Object | Purpose |
| --- | --- |
| `buyer_masked_profiles` view | Brokered/Supplier-safe Buyer profile without direct PII. |
| `buyer_public_profiles` view | Public or Supplier-safe Buyer summary without direct PII. |
| Restricted RPC/DTO candidate | Role-aware server-side projection if view is insufficient. |
| `can_view_buyer_pii` dependency review | Confirm whether helper must exist before final projection. |

### Projection Rules

| Field | Supplier Default |
| --- | --- |
| Buyer email | Excluded |
| Buyer phone | Excluded |
| Buyer contact person | Excluded |
| Buyer company/country/industry summary | Allowed only as safe summary. |
| Buyer inquiry details | Brokered safe subset only. |
| Admin memo | Excluded |
| Internal audit/log data | Excluded |

### Forbidden Work

- Do not expose Buyer email, phone, or contact person to Supplier-facing views.
- Do not include raw Buyer PII in analytics payloads.
- Do not allow membership tier to bypass Buyer PII policy.
- Do not create a broad public Buyer profile with PII.

### Safety Conditions

- Final projection name must be decided before SQL authoring.
- Full Buyer PII access must be limited to Admin/Brokerage operational screens and owner paths.
- Agent access is subordinate limited summary unless explicitly expanded later.
- Professor full PII access applies to subordinate Students, not Buyers.

### Rollback Criteria

- Views can be replaced/dropped before application adoption.
- If PII is found in Supplier-facing projection, stop migration and replace projection immediately.
- Old direct select paths must not be re-enabled as rollback; use masked projection fallback.

### Validation

| Check | Expected Result |
| --- | --- |
| Supplier query | Buyer email/phone/contact person unavailable. |
| Public query | No Buyer PII. |
| Admin/Brokerage query | Full PII only through approved path. |
| Agent query | Subordinate limited summary only. |
| RLS helper plan | `can_view_buyer_pii` required for full PII path. |

## 9. 006_supplier_membership.sql

### Purpose

- Add Free/Premium/Enterprise Supplier membership structure.
- Support Free Supplier product limit and proposal permission policy.
- Preserve Buyer PII protection regardless of membership tier.

### Included Candidates

| Candidate Object | Purpose |
| --- | --- |
| `supplier_memberships` | Supplier current tier/status. |
| `membership_plans` | Free/Premium/Enterprise plan master. |
| `membership_benefits` | Plan benefits and limits. |
| `membership_overrides` | Admin override for specific Supplier. |

### Required Policy Data

| Policy | Default |
| --- | --- |
| Free Supplier product limit | 10 active products. |
| Free Supplier direct proposal | Not allowed by default. |
| Free Supplier limited response | Allowed only when Admin explicitly requests case-by-case response. |
| Premium Supplier proposal | Allowed after Admin Forward and before Admin Review delivery. |
| Enterprise Supplier | Contract/priority exposure possible, but no Buyer PII bypass. |

### Forbidden Work

- Do not grant Buyer PII access through membership.
- Do not allow Free Supplier direct proposal by default.
- Do not enforce destructive product deletion to meet Free limit.
- Do not block existing Supplier records before migration validation.

### Safety Conditions

- Additive tables only.
- Free limit enforcement can be prepared in schema but final behavior requires application/RLS validation.
- Admin override must be auditable.
- Existing Suppliers should receive a safe default tier only after owner-approved mapping.

### Rollback Criteria

- Before application adoption, membership tables can be disabled from runtime use.
- If default tier assignment is wrong, rollback must restore previous Supplier behavior through compatibility path.
- Product records must not be deleted by rollback.

### Validation

| Check | Expected Result |
| --- | --- |
| Plan master | Free, Premium, Enterprise represented. |
| Free limit | Limit 10 represented in benefits or policy metadata. |
| Proposal guard | Free direct proposal denied unless Admin-requested exception exists. |
| Buyer PII | No tier grants Buyer PII directly. |
| Admin override | Override path is auditable and scoped. |

## 10. 007_feature_flags.sql

### Purpose

- Introduce Admin-controlled feature flag storage.
- Make runtime feature availability explicit and auditable.
- Keep feature flags subordinate to Permission Matrix and RLS.

### Included Candidates

| Candidate Object | Purpose |
| --- | --- |
| `feature_flags` | Stores key, enabled state, environment/scope, description, audit metadata. |
| Default flag seed candidates | Establish MVP-safe defaults. |

### Required Defaults

| Feature Flag | Default |
| --- | --- |
| `buyer_direct_signup_enabled` | `false` |
| `supplier_buyer_direct_contact_enabled` | `false` |
| `admin_brokerage_required` | `true` |
| `premium_supplier_enabled` | `true` |
| `landing_builder_enabled` | `true` |
| `ai_recommendation_enabled` | `false` |
| `public_api_enabled` | `false` |
| `multi_tenant_enabled` | `false` |

### Forbidden Work

- Do not allow feature flags to bypass RLS.
- Do not enable Supplier-Buyer direct contact globally.
- Do not expose admin-only flags to public clients except safe read-only public flags.
- Do not store secrets in feature flags.

### Safety Conditions

- Admin-only writes.
- Public/client reads must be limited to non-sensitive flags if exposed.
- Flag changes must be auditable.
- Default flags must match Business Rules and Feature Flags documents.

### Rollback Criteria

- Default seeds can be corrected by update migration if wrong.
- Feature flag table can remain unused if runtime integration is delayed.
- If a flag causes access-control bypass, disable flag and stop related app release.

### Validation

| Check | Expected Result |
| --- | --- |
| Default flags | All required defaults exist. |
| Admin brokerage | `admin_brokerage_required = true`. |
| Direct contact | `supplier_buyer_direct_contact_enabled = false`. |
| RLS bypass | No policy depends solely on feature flag for sensitive access. |
| Audit | Flag updates have audit path. |

## 11. 008_landing_builder.sql

### Purpose

- Add Landing Page Builder base tables.
- Support Admin-managed pages, sections, items, banners, popups, publish history, and preview tokens.
- Preserve public-only published read behavior.

### Included Candidates

| Candidate Object | Purpose |
| --- | --- |
| `landing_pages` | Page root and slug/status. |
| `landing_sections` | Page section layout/config. |
| `landing_section_translations` | Localized section text. |
| `landing_section_items` | Section item targets. |
| `landing_banners` | Banner content, replacing/backfilling `banners` later. |
| `landing_popups` | Popup configuration if enabled. |
| `landing_publish_history` | Publish/rollback audit history. |
| `landing_preview_tokens` | Secure preview access. |

### Policy Notes

- Admin-only write.
- Public-only published read.
- Preview tokens must not grant admin write.
- Featured targets must be approved/published.
- Non-approved content must not be featured publicly.

### Forbidden Work

- Do not migrate or drop `banners` in the first builder migration without backfill review.
- Do not publish draft/hidden/archived sections.
- Do not expose preview token values publicly.
- Do not make landing builder bypass content approval.

### Safety Conditions

- Additive tables only.
- Public read policies must require `publish_status = published` or equivalent.
- Localized text must align with translation strategy.
- Publish history must capture admin actor.

### Rollback Criteria

- Builder tables can remain unused if UI integration is delayed.
- Before public routing depends on them, additive tables can be dropped after backup review.
- Published landing data rollback requires restore from `landing_publish_history` or snapshot.

### Validation

| Check | Expected Result |
| --- | --- |
| Admin write | Admin-only. |
| Public read | Published only. |
| Draft visibility | Draft/hidden/archived not public. |
| Featured target | Linked target must be approved/published. |
| Preview token | Scoped, expiring, non-public token behavior designed. |

## 12. 009_rls_helpers.sql

### Purpose

- Add helper functions that RLS policies will use.
- Prepare final DB-level enforcement for role, subordinate, brokerage, messaging, and PII rules.
- Review security definer scope before applying broad table policies.

### Included Candidates

| Helper | Purpose |
| --- | --- |
| `is_admin` | Check Administrator role. |
| `has_role` | Check active role by key. |
| `has_account_role` | Account-role authority helper. |
| `is_company_member` | Company membership scope. |
| `is_agent_of_buyer` | Agent-subordinate Buyer scope. |
| `is_professor_of_student` | Professor-subordinate Student scope. |
| `is_brokerage_case_participant` | Brokerage participant scope. |
| `has_contact_release` | Case-level valid release check. |
| `can_send_message` | Final message insert authorization. |
| `can_view_buyer_pii` | Full Buyer PII authorization. |
| `can_view_student_pii` | Full Student PII authorization. |

### Security Definer Notes

| Rule | Requirement |
| --- | --- |
| Security definer | Use only when necessary. |
| `search_path` | Must be fixed and explicit. |
| Return shape | Boolean only for access helpers. |
| Recursion | Avoid helper recursion through RLS-protected queries. |
| Sensitive data | Helpers must not return PII or admin memo values. |
| Revoked data | Revoked, expired, inactive, suspended, and soft-deleted relations must not pass. |

### Forbidden Work

- Do not write helpers that leak records or PII.
- Do not let `has_role` count revoked/pending roles as active.
- Do not let `has_contact_release` ignore expiry/revoke/case scope.
- Do not let `can_send_message` allow Supplier-Buyer direct conversation without brokerage/release.
- Do not let `can_view_buyer_pii` return true for Supplier by default.

### Safety Conditions

- Helper body review is required before SQL authoring.
- Existing 25 security definer functions from current DB need body-level review and replacement/compatibility plan.
- Helper tests must be written before table policies depend on helpers.
- Function privileges must be limited to required roles.

### Rollback Criteria

- Before policy dependency, helpers can be replaced or dropped.
- After policy dependency, rollback must replace helpers with safe-deny behavior before policy rollback.
- If helper returns over-broad access, stop migration and replace with deny-by-default.

### Validation

| Check | Expected Result |
| --- | --- |
| `is_admin` | Only active Administrator role passes. |
| `has_account_role` | Active roles pass; pending/revoked/deleted roles fail. |
| `is_agent_of_buyer` | Only assigned active subordinate Buyer passes. |
| `is_professor_of_student` | Only assigned active subordinate Student passes. |
| `has_contact_release` | Correct buyer+supplier+case, unexpired, unrevoked release only. |
| `can_send_message` | Supplier-Buyer direct denied; brokerage/release allowed. |
| `can_view_buyer_pii` | Supplier false by default; Admin/Brokerage true only when allowed. |

## 13. 010_rls_policies.sql

### Purpose

- Apply table-level RLS policies after helper validation.
- Translate Permission Matrix, ERD v1, and RLS Design v1 into enforced database access.
- Close DB-level gaps identified in P0/P1 audits.

### Policy Groups

| Group | Tables / Areas |
| --- | --- |
| Public read | Companies, products, industrial posts, EPC projects, sell products, events, landing pages, board posts. |
| Owner access | Profiles, role applications, Buyer requests, Supplier content, Student own records. |
| Subordinate access | Agent-Buyer, Professor-Student. |
| Brokerage access | Inquiries, brokerage cases, proposals, conversations, files. |
| Admin access | Approvals, audit, admin memos, settings, feature flags. |
| System access | Server-only system tasks, never client-imported service role flow. |

### Mandatory Enforcements

- Supplier-Buyer direct message is blocked.
- Buyer PII direct select is blocked for Supplier.
- Draft/hidden/archived/deleted public content is blocked.
- Student cannot create product.
- Free Supplier proposal direct insert is blocked unless Admin-requested exception exists.
- Public reads only approved/published/active content.
- Audit logs and admin memos are Admin/System only.

### Forbidden Work

- Do not disable RLS to pass tests.
- Do not add service role fallback for normal user flow.
- Do not allow Supplier-facing policies to join raw Buyer PII.
- Do not let feature flags override sensitive RLS boundaries.
- Do not replace helper tests with app-only checks.

### Safety Conditions

- Apply after `009_rls_helpers.sql` passes.
- Run policies in a reviewed order by table group.
- Keep rollback policy statements ready.
- Confirm test fixtures exist for Guest, Account, Supplier Free, Supplier Premium, Buyer, Agent, Professor, Student, Administrator, and System.

### Rollback Criteria

- Policy rollback must restore previous safe behavior or deny-by-default behavior.
- If RLS regression fails on PII or messaging, stop rollout and rollback affected policy group.
- If public content leaks drafts/hidden records, rollback public read policies immediately.

### Validation

| Check | Expected Result |
| --- | --- |
| Supplier Buyer PII | Denied or masked. |
| Supplier-Buyer direct message | Denied. |
| Brokerage message | Allowed only for valid case participant/release. |
| Agent subordinate Buyer | Allowed only for subordinate. |
| Professor subordinate Student PII | Allowed only for subordinate. |
| Student product create | Denied. |
| Public content | Approved/published only. |
| Admin memo/audit | Admin/System only. |

## 14. 011_validation_tests.sql

### Purpose

- Define migration validation SQL and scenario tests.
- Prove migration did not regress P0/P1 security boundaries.
- Provide acceptance gate before application refactor or destructive cleanup.

### Required Test Scenarios

| Test | Expected Result |
| --- | --- |
| Supplier cannot view Buyer PII | Supplier receives no Buyer email/phone/contact person. |
| Supplier-Buyer direct message blocked | Insert/create attempt denied. |
| Brokerage case message allowed | Valid case participant message allowed. |
| Direct contact release message allowed | Allowed only for valid, unexpired, unrevoked case-level release. |
| Agent subordinate Buyer allowed | Agent can view limited subordinate Buyer summary. |
| Agent non-subordinate Buyer denied | Access denied. |
| Professor subordinate Student PII allowed | Assigned Professor can view subordinate Student PII. |
| Professor non-subordinate Student denied | Access denied. |
| Student cannot create product | Product insert denied. |
| Public only sees approved/published content | Draft/hidden/archived/deleted records denied. |
| Free Supplier direct proposal denied | Denied unless Admin-requested exception exists. |
| Admin override audited | Override/release/approval writes audit target. |

### Test Data Rules

- Prefer transaction-wrapped fixtures that roll back.
- Do not mutate production business data without explicit owner-approved test records.
- Do not print keys, raw PII, or service role secrets.
- Test fixtures must represent all required roles.

### Rollback Criteria

- Validation scripts should be safe to rerun.
- Any fixture writes must be cleaned up or transaction-rolled back.
- If validation fails on P0 criteria, block subsequent migrations and application refactor.

### Validation

| Check | Expected Result |
| --- | --- |
| SQL syntax | Pass in target Supabase/Postgres version. |
| Test isolation | Fixtures do not pollute production data. |
| P0 security | All P0 tests pass. |
| P1 security | All high-priority tests pass or are documented as blockers. |
| Evidence | Results are captured in migration report. |

## 15. Execution Order

The migration pack must be executed incrementally. Do not apply all files from `001` to `011` in one batch.

| Step | File | Gate Before Next Step |
| --- | --- | --- |
| 1 | `001_snapshot_baseline.sql` | Baseline, backup, and migration metadata alignment reviewed. |
| 2 | `002_role_compatibility.sql` | Role compatibility tables exist and legacy structures preserved. |
| 3 | `003_brokerage_core.sql` | Brokerage/release tables exist with restrictive defaults. |
| 4 | `004_conversation_compatibility.sql` | Conversation fields added; existing conversation audit plan approved. |
| 5 | `005_buyer_pii_projection.sql` | Supplier-safe projection verified. |
| 6 | `006_supplier_membership.sql` | Membership plan defaults and Free limit metadata verified. |
| 7 | `007_feature_flags.sql` | Required safe defaults verified. |
| 8 | `008_landing_builder.sql` | Admin-only write and published-only public read design verified. |
| 9 | `009_rls_helpers.sql` | Helper tests pass and security definer scope reviewed. |
| 10 | `010_rls_policies.sql` | Full RLS regression passes. |
| 11 | `011_validation_tests.sql` | Migration acceptance evidence captured. |

Additional execution rules:

- Run schema diff before each structural file.
- Run role/security validation after each sensitive file.
- Stop on any Buyer PII leak.
- Stop on any Supplier-Buyer direct messaging bypass.
- Stop if Supabase migration metadata is not aligned before structural changes.
- Record result after each file before continuing.

## 16. Rollback Strategy

| Rollback Area | Strategy |
| --- | --- |
| Baseline | Keep schema/data snapshot before migration execution. |
| Additive tables | Drop or stop using only before production writes; after writes, export/backfill rollback is required. |
| Additive columns | Drop only before backfill/app dependency; otherwise keep as compatibility fields. |
| Views/projections | Replace with safe-deny or masked version first; do not restore unsafe PII projection. |
| Helper functions | Replace with safe-deny behavior before dropping if policies depend on them. |
| RLS policies | Roll back by policy group with pre-reviewed rollback statements. |
| Backfill data | Use idempotent backfills and snapshot-based recovery. |
| Feature flags | Disable unsafe features first; schema removal is not urgent. |
| Landing builder | Leave unused if UI rollout is delayed; published content restore uses publish history/snapshot. |
| Destructive changes | Not part of this pack; require separate approval after validation. |

Rollback stop criteria:

- Buyer PII is exposed to Supplier/Public.
- Supplier-Buyer direct conversation or message is possible without brokerage/release.
- Admin audit or memo data is exposed to non-admin.
- Public reads expose draft, hidden, archived, or deleted content.
- Role helper grants permission from pending/revoked/deleted roles.
- Migration metadata drift prevents reliable rollback.

## 17. Blocking Issues Before SQL Authoring

| Blocking Issue | Priority | Blocks | Required Resolution |
| --- | --- | --- | --- |
| Supabase migration metadata alignment | P1 High | Any structural migration | Link/list/repair or otherwise reconcile migration metadata for project `ysonocyrvvskdajmpdmu`. |
| Existing data backup | P0 Critical | Any production migration | Capture schema and data snapshot before SQL execution. |
| Existing conversation audit | P0 Critical | `004_conversation_compatibility.sql`, `010_rls_policies.sql` | Identify Supplier+Buyer-only and unknown conversations before classification/enforcement. |
| Security definer helper scope | P1 High | `009_rls_helpers.sql`, `010_rls_policies.sql` | Decide definer/invoker, fixed `search_path`, function privileges, and body review. |
| Buyer PII projection final view name | P0 Critical | `005_buyer_pii_projection.sql` | Choose `buyer_masked_profiles`, `buyer_public_profiles`, or restricted RPC/DTO pattern. |
| Old code dependency review | P1 High | Application refactor and policy switch | Inventory dependencies on `member_type_id`, `profile_roles`, `buy_sell_posts`, `thailand_fda_applications`, and direct Buyer PII selects. |
| Role data mapping review | P1 High | `002_role_compatibility.sql` | Confirm mapping from legacy roles/member types to `account_roles`. |
| Brokerage participant model detail | P1 High | `003_brokerage_core.sql`, `010_rls_policies.sql` | Confirm whether Admin must be a participant row or case owner is enough for RLS. |
| Release scope enumeration | P1 High | `003_brokerage_core.sql`, `009_rls_helpers.sql` | Define allowed `release_scope` values for masked/email/phone/contact person exposure. |
| RLS regression fixtures | P1 High | `009_rls_helpers.sql`, `010_rls_policies.sql`, `011_validation_tests.sql` | Prepare role fixtures and expected allow/deny outcomes. |
| FDA field-level mapping | P2 Medium | Later FDA migration files | Map `thailand_fda_applications` into normalized `fda_*` targets before SQL. |
| SELL table compatibility | P2 Medium | Later `buy_sell_posts` to `sell_products` migration | Map SEO, featured content, routes, policies, and slugs. |
| Sample fallback inventory | P2 Medium | Application refactor | Inventory `mergeWithSamples` and production sample fallback paths. |

## 18. Codex Implementation Notes

- 이 문서 완료 후에만 실제 SQL migration 작성 가능.
- SQL 작성 시 파일별로 하나씩 작성하고 검증한다.
- 한 번에 `001`~`011` 전체 적용 금지.
- 각 migration은 additive-first로 작성한다.
- Destructive change는 별도 approval 필요.
- Supabase DB 수정은 GitHub migration 파일 기준으로만 진행한다.
- Supabase Dashboard 수동 schema 변경은 금지한다.
- `brokerage_case_messages`는 MVP에서 만들지 않는다.
- `conversations/messages` 재사용은 typed conversation enforcement와 함께만 허용한다.
- `account_roles`가 새 권한 기준이다.
- `profiles.member_type_id`는 legacy compatibility로만 취급한다.
- Buyer PII direct select를 만들면 안 된다.
- Supplier-Buyer 직접 메시지 허용 구조를 만들면 안 된다.
- RLS helper는 table policy보다 먼저 작성하고 검증한다.
- `can_send_message`와 `can_view_buyer_pii`는 P0 security validation 대상이다.
- Migration 결과는 각 파일 적용 후 validation evidence와 함께 기록한다.

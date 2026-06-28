# Migration Plan v1

## 1. Purpose

This document defines the pre-SQL migration plan for B2BB2G V2.

It translates the finalized P0 decisions, ERD v1, RLS Design v1, Permission Matrix, Communication Brokerage Security Design, Supabase Health Audit, and Existing Code Reuse Policy into a safe phased migration plan.

This is not a SQL migration. This document does not change Supabase DB, RLS policies, application code, or UI.

## 2. Migration Principles

| Principle ID | Principle |
| --- | --- |
| MP-P-001 | 기존 테이블은 즉시 삭제하지 않는다. |
| MP-P-002 | Deprecated -> compatibility -> migration -> validation -> removal 순서로 진행한다. |
| MP-P-003 | `profiles.member_type_id`는 legacy field로 유지하되 권한 기준에서 제외한다. |
| MP-P-004 | `account_roles`를 새 권한 기준으로 사용한다. |
| MP-P-005 | `conversations/messages`는 재사용한다. |
| MP-P-006 | `brokerage_case_messages`는 MVP에서 만들지 않는다. |
| MP-P-007 | Buyer PII direct select는 제거하고 masked/restricted projection으로 대체한다. |
| MP-P-008 | Migration은 반드시 RLS test plan과 함께 진행한다. |
| MP-P-009 | Destructive migration은 validation 이후 마지막 removal phase에서만 검토한다. |
| MP-P-010 | Supabase Dashboard 수동 변경은 금지하고 GitHub-tracked migration으로 관리한다. |
| MP-P-011 | Service role fallback으로 migration/RLS 문제를 우회하지 않는다. |
| MP-P-012 | Existing code changes follow Reuse / Refactor / Replace / Hold classification. |

## 3. Migration Phases

| Phase | Name | Goal | Allowed Work | Exit Criteria |
| --- | --- | --- | --- | --- |
| Phase 0 | Snapshot / Backup / Baseline | Capture current remote/local schema and data baseline. | Read-only inspection, backup, schema diff, migration metadata check. | Baseline snapshot exists; current tables/columns/policies inventoried. |
| Phase 1 | Compatibility Columns | Add additive compatibility fields required by new SOT. | Add nullable columns, indexes, safe defaults, compatibility views. | No existing feature breaks; old code can still run. |
| Phase 2 | New Core Tables | Add new SOT tables without deleting old tables. | Create `account_roles`, `role_applications`, brokerage/release/membership/flag tables if absent. | New tables exist with basic constraints and no destructive changes. |
| Phase 3 | Data Backfill | Copy/map old data into new structures. | Backfill roles, classify conversations, map SELL/FDA records, prepare PII projections. | Backfill report reviewed; unknown records are flagged, not guessed. |
| Phase 4 | RLS Helper Preparation | Prepare helper functions before table policies. | Add helper functions and helper tests. | Helpers pass isolated tests and definer/invoker scope review. |
| Phase 5 | Policy Migration | Migrate RLS policies to new helper-based rules. | Add/update policies, keep old compatibility where needed. | Role-based RLS regression suite passes. |
| Phase 6 | Application Refactor | Move application reads/writes to new SOT structures. | Replace deprecated queries/actions, remove sample fallback paths from runtime. | Typecheck/lint pass; deprecated references are reduced or isolated. |
| Phase 7 | Validation | Validate behavior, security, and data integrity. | RLS tests, schema diff, smoke tests, role fixtures, rollback drill. | Validation checklist passes and owner approves removal candidates. |
| Phase 8 | Deprecated Removal | Remove legacy structures only after validation. | Drop unused columns/tables, remove compatibility views, delete fallback code. | No live dependency remains; rollback/remediation plan is documented. |

## 4. Existing Table Strategy

| Existing Item | Current Use | New Target | Strategy | Risk | Validation |
| --- | --- | --- | --- | --- | --- |
| `profiles.member_type_id` | Legacy single-role indicator if present. | `account_roles` + `roles` + `role_permissions`. | Keep as legacy compatibility field; exclude from final permission checks. | Old code may keep using member type for auth decisions. | Search code/SQL for `member_type_id`; RLS tests prove `account_roles` is authority. |
| `profile_roles` | Older role join naming candidate. | `account_roles`. | Deprecated/replace; map records to `account_roles` if present. | Duplicate or conflicting role assignments. | Compare count by account/role/status; validate active partial uniqueness. |
| `member_types` | Legacy member type master or display source. | `roles`, `permissions`, `role_permissions`, `account_roles`. | Hold as compatibility/display only if present; not permission authority. | Role/permission drift between old and new structures. | Role permission tests ignore `member_types`; UI labels verified separately. |
| `buy_sell_posts` | Legacy SELL PRODUCTS table candidate. | `sell_products`. | Deprecated/replace; backfill sell-side records into `sell_products`. | SEO/slug/content links may break. | Record count, slug uniqueness, public list/detail smoke checks. |
| `thailand_fda_applications` | Legacy FDA application root candidate. | `fda_applications`. | Deprecated/replace; map root application rows into `fda_applications`. | Sensitive documents/status history could lose linkage. | FK mapping and owner/admin access tests. |
| `fda_documents` | Legacy FDA document candidate. | `fda_application_documents`. | Deprecated/replace; map documents to new application document table. | Private FDA files could become public or orphaned. | Storage/file metadata and visibility scope checks. |
| `fda_quotations` | Legacy FDA quote candidate. | `fda_quotes`. | Deprecated/replace; map quote status/amount/currency fields. | Supplier quote visibility may break. | Supplier owner/Admin quote read tests. |
| Existing `conversations/messages` | Current message storage. | Reused typed `conversations/messages`. | Add type/case/admin fields; audit before classification. | Supplier-Buyer direct conversations could remain active. | Conversation audit report; Supplier-Buyer direct create/send denied. |
| Sample fallback data/code | Demo data mixed into UI paths. | Real data or explicit demo-only fixtures. | Replace gradually; remove `mergeWithSamples` from production paths. | Real UI can show fake/sample records or leak wrong assumptions. | Runtime search and UI smoke checks with empty real data. |

## 5. New / Updated Table Plan

| Table / Object | Type | Purpose | Migration Notes |
| --- | --- | --- | --- |
| `account_roles` | New / authority table | Multi-role support for one Account. | Must become permission authority; active partial uniqueness needed. |
| `role_applications` | New / workflow table | Role application/approval workflow. | Replaces `role_requests` / `role_approvals` candidates. |
| `brokerage_cases` | New core table | Admin Brokerage case root. | Required before Supplier-Buyer communication migration. |
| `brokerage_case_participants` | New join table | Case participant and role scope. | Needed for participant read/send policies. |
| `contact_release_approvals` | New approval table | Case-level Direct Contact Release. | Requires `buyer_id`, `supplier_id`, `brokerage_case_id`, `release_scope`, `expires_at`; default expiry is 30 days. |
| `conversations` updated columns | Updated table | Typed communication storage. | Add `conversation_type`, `brokerage_case_id`, `admin_required`, `created_by_role`. |
| `buyer_masked_profiles` or `buyer_public_profiles` | View / restricted projection | Supplier-safe Buyer summary. | Must exclude Buyer email/phone/contact person by default. |
| `supplier_memberships` | New / updated table | Supplier tier state. | Free product limit 10; Premium/Enterprise never bypass Buyer PII. |
| `feature_flags` | New / settings table | Flag storage for controlled features. | Flags cannot bypass RLS/Admin Brokerage. |

## 6. Conversation Migration Plan

### Required Columns

| Column | Required | Purpose |
| --- | --- | --- |
| `conversations.conversation_type` | Yes | Identifies `agent_buyer`, `professor_student`, `admin_user`, `brokerage_case`, `direct_contact_released`, or `system_notice`. |
| `conversations.brokerage_case_id` | Yes for brokerage/release types | Links Supplier-Buyer communication to Admin Brokerage case. |
| `conversations.admin_required` | Yes | Marks conversations that require Admin brokerage/ownership. |
| `conversations.created_by_role` | Yes | Captures role context at conversation creation. |

### Audit and Classification Rules

- Existing conversations must be audited before classification.
- Supplier + Buyer only conversations are blocked/archived candidates.
- Unknown type is not auto-classified.
- No migration script may infer Supplier-Buyer legitimacy without case/release evidence.
- Existing `messages` are retained with original timestamps and senders, but future sends must pass `can_send_message`.
- `brokerage_case_messages` is not created for MVP.

### Allowed Target Classification

| Target Type | Migration Requirement |
| --- | --- |
| `agent_buyer` | Valid Agent-subordinate Buyer relation. |
| `professor_student` | Valid Professor-subordinate Student relation. |
| `admin_user` | Admin participant or admin ownership. |
| `brokerage_case` | Valid brokerage case and participants. |
| `direct_contact_released` | Valid, unexpired release for same buyer/supplier/case. |
| `system_notice` | System/Admin notice only; no direct negotiation. |

## 7. Buyer PII Migration Plan

### PII Removal Rule

Buyer email, phone, and contact person are removed from Supplier-facing query/view/RPC/DTO paths by default.

### Projection Candidates

| Candidate | Purpose | Default Supplier Fields |
| --- | --- | --- |
| `buyer_public_profiles` | Public or Supplier-safe Buyer summary. | Country, industry, company type, approved summary fields only. |
| `buyer_masked_profiles` | Brokered Supplier view. | Masked contact status, non-PII request summary, case-safe metadata. |
| Restricted RPC/DTO | Server-side role-aware projection. | Uses `can_view_buyer_pii`; defaults to no PII for Supplier. |

### Access Rules

- Admin/Brokerage screens can access full PII for operational purposes.
- Supplier cannot directly select Buyer email/phone/contact person.
- Agent can view subordinate Buyer limited summary only.
- Professor full PII applies to subordinate Students, not Buyers.
- `can_view_buyer_pii(user_id, buyer_id)` is mandatory for full Buyer PII access.
- Analytics metadata must not store raw Buyer PII.

## 8. Role Migration Plan

| Step | Plan |
| --- | --- |
| Legacy mark | Treat `profiles.member_type_id` as legacy if present. |
| Authority table | Create/activate `account_roles` as role authority. |
| Application workflow | Introduce `role_applications` for role request/approval history. |
| Naming cleanup | Replace `profile_roles`, `role_requests`, `role_approvals` references with current SOT names. |
| Permission review | Review `permissions` and `role_permissions` relation before broad RLS policy migration. |
| Backfill | Map existing member type/role data into `account_roles` with status and approval metadata where possible. |
| Validation | Test Account with multiple Roles, revoked Role, pending Role, and Admin-managed Role changes. |

## 9. RLS Migration Plan

### Order

1. Write RLS helpers first.
2. Review security definer/invoker scope and fixed `search_path`.
3. Add isolated helper tests.
4. Add table policies after helpers pass.
5. Run role-based RLS regression tests.
6. Refactor application queries after policies are stable.

### Required Helpers

| Helper | Required Test |
| --- | --- |
| `has_account_role` / `has_role` | Revoked/pending/deleted roles do not count. |
| `is_agent_of_buyer` | Agent can access only subordinate Buyer. |
| `is_professor_of_student` | Professor can access only subordinate Student. |
| `is_brokerage_case_participant` | Case participant access is case-scoped. |
| `has_contact_release` | Release is buyer/supplier/case-scoped, unexpired, and not revoked. |
| `can_send_message` | Supplier-Buyer direct message denied; brokerage/release allowed. |
| `can_view_buyer_pii` | Supplier false by default; Admin/Brokerage true only when allowed. |

### RLS Rules

- Service role fallback is forbidden in normal application flow.
- `can_send_message` test is mandatory.
- `can_view_buyer_pii` test is mandatory.
- Table policies are written after helper implementation and helper scope review.
- Every public read policy must require approved/published/deleted filters where applicable.

## 10. Rollback Plan

| Rollback Area | Plan |
| --- | --- |
| Snapshot | Take migration pre-snapshot and schema dump before SQL. |
| Additive migration | Prefer additive tables/columns/views first. |
| Destructive migration | Forbidden until Phase 8. |
| Removal | Removal occurs only after validation confirms no live dependency. |
| Backfill rollback | Backfill scripts must be idempotent or reversible by snapshot/backup. |
| RLS rollback | Keep policy version notes and ability to disable new policy changes in rollback migration. |
| Application rollback | Application refactor is deployed after DB compatibility phase, so old reads remain possible during rollback window. |
| Stop criteria | Any P0 security regression, data loss, failed RLS regression, or unresolved schema diff stops the migration. |

## 11. Validation Checklist

| Check | Required Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| Supabase schema diff | Reviewed and approved before apply |
| RLS regression test | Pass |
| Supplier cannot view Buyer PII | Pass: denied or masked |
| Supplier-Buyer direct message blocked | Pass |
| Brokerage case message allowed | Pass |
| Direct contact release message allowed only when valid/unexpired | Pass |
| Agent subordinate Buyer allowed | Pass |
| Agent non-subordinate Buyer denied | Pass |
| Professor subordinate Student PII allowed | Pass |
| Other Professor Student PII denied | Pass |
| Public only sees approved/published content | Pass |
| Admin memo hidden from non-admin | Pass |
| Audit logs hidden from non-admin | Pass |
| Sample fallback not mixed into production UI | Pass |

## 12. Migration Blocking Issues

| Blocking Issue | Priority | Blocks | Required Resolution |
| --- | --- | --- | --- |
| Existing table mapping incomplete | P0 | SQL migration | Complete legacy-to-SOT mapping and data audit. |
| RLS helper implementation scope | P1 | RLS SQL | Classify helper functions as definer/invoker and define `search_path`. |
| Migration metadata alignment | P1 | Safe remote migration | Confirm/link/repair Supabase CLI migration metadata before schema changes. |
| Security definer function review | P1 | Helper deployment | Review function body, search path, and privilege exposure. |
| Old code dependency on `member_type_id` | P1 | Role migration | Find and replace permission decisions with `account_roles`. |
| Old code dependency on `buy_sell_posts` | P1 | SELL migration | Map reads/writes to `sell_products`. |
| Old code dependency on `thailand_fda_applications` | P1 | FDA migration | Map reads/writes to `fda_applications`. |
| Existing Supplier-Buyer direct conversations | P0 | Communication migration | Audit and classify; block/archive invalid direct conversations. |
| Buyer PII projection design incomplete | P0 | Supplier-facing queries | Create masked/restricted projection before query refactor. |
| RLS regression fixtures incomplete | P1 | Policy migration | Define Supplier, Buyer, Agent, Professor, Student, Admin test fixtures. |

## 13. Codex Implementation Notes

- 이 문서 확정 전 SQL migration 작성 금지.
- 실제 SQL은 다음 단계에서 migration 파일 단위로 작성한다.
- Destructive migration 금지.
- Supabase dashboard 수동 변경 금지.
- 모든 schema 변경은 GitHub migration으로 관리한다.
- Migration은 RLS test plan과 함께 진행한다.
- Buyer PII direct select를 만들지 않는다.
- Supplier-Buyer direct messaging을 허용하는 구조를 만들지 않는다.
- `brokerage_case_messages`는 MVP에서 만들지 않는다.
- `conversations/messages` 재사용은 typed conversation enforcement와 함께만 허용한다.
- `account_roles`가 새 권한 기준이다.

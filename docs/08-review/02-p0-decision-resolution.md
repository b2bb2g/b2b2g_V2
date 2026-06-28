# P0 Decision Resolution

## 1. Purpose

This document resolves the six P0 blocking decisions identified in `docs/08-review/01-source-of-truth-gap-analysis.md`.

This is a source-of-truth reinforcement document for implementation preparation. It does not modify code, DB schema, migrations, RLS SQL, UI, or existing source-of-truth documents.

After this document, migration planning may begin, but DB migration and RLS SQL are still blocked until the decisions below are reflected into the migration plan, ERD update notes, and RLS implementation plan.

## 2. Decision Summary Table

| Decision ID | Topic | Final Decision | Related Documents | Implementation Impact | Status |
| --- | --- | --- | --- | --- | --- |
| D-P0-001 | Existing Tables Migration Strategy | Keep existing tables/columns during review; deprecate conflicting legacy structures; migrate in phases; `account_roles` is the new permission source. | Gap Analysis, ERD v1, RLS Design v1, Existing Code Reuse Policy | Blocks all destructive migration and role conversion work. | Finalized |
| D-P0-002 | Supplier-Buyer Messaging Storage Strategy | Reuse `conversations/messages`; do not create `brokerage_case_messages`; require typed conversations and case/release linkage. | Communication Security Design, ERD v1, RLS Design v1, Permission Matrix | Defines Communication migration target and `can_send_message` basis. | Finalized |
| D-P0-003 | Direct Contact Release Policy | Case-level exception only; default expiry 30 days; masked contact remains default; email/phone require explicit admin approval. | Business Rules, Permission Matrix, Communication Security Design, RLS Design v1 | Defines release scope, RLS helper conditions, and audit requirement. | Finalized |
| D-P0-004 | Buyer PII Projection Policy | Supplier-facing paths exclude Buyer email/phone/contact person by default; use masked/limited view candidate; full PII only Admin/Brokerage. | Permission Matrix, ERD v1, RLS Design v1, Supabase Health Audit | Blocks Supplier-facing query/view/RPC implementation until projection is designed. | Finalized |
| D-P0-005 | Free Supplier Product / Proposal Policy | Free Supplier may register up to 10 products; Free cannot directly submit proposals except admin-requested limited response; Premium+ can submit proposals. | Business Rules, Feature Flags, Permission Matrix, ERD v1 | Defines membership benefit limits and proposal permission gating. | Finalized |
| D-P0-006 | Implementation Blocking Rule | No DB migration/RLS SQL before these decisions are reflected in ERD/RLS/migration plan; non-security code changes wait until migration plan. | Gap Analysis, ERD v1, RLS Design v1, Existing Code Reuse Policy | Sets implementation gate and prevents premature migration/code drift. | Finalized |

## 3. D-P0-001 Existing Tables Migration Strategy

### Final Decision

Existing tables and columns are not deleted immediately. The project uses phased migration from existing implementation structures to the new source-of-truth model.

### Rules

| Rule | Decision |
| --- | --- |
| Existing tables | Keep during review; do not drop without migration review. |
| Conflicting legacy tables | Mark as deprecated/replace candidates and migrate in phases. |
| `profiles.member_type_id` | Keep temporarily as a legacy field if present; do not use as final permission authority. |
| `account_roles` | Use as the new role and permission basis. |
| Old role structures | `profile_roles`, `role_requests`, `role_approvals`, and single-role assumptions are replace candidates. |
| Legacy SELL table | `buy_sell_posts` is deprecated in favor of `sell_products`. |
| Legacy FDA table | `thailand_fda_applications` is deprecated in favor of `fda_applications`. |
| Old columns/tables removal | Only after migration review, data mapping, backup/rollback plan, and owner approval. |
| Sample fallback | `mergeWithSamples` or sample data mixed into real UI is Replace and must be phased out. |

### Implementation Impact

- Migration plan must include a legacy-to-SOT mapping table.
- No destructive SQL is allowed in the first migration pass.
- Existing code must be classified using Reuse / Refactor / Replace / Hold before modification.
- RLS must treat `account_roles` as authority and ignore legacy role columns for final access decisions.
- Queries may read legacy fields only for migration compatibility, not for permission checks.

### Follow-up Required

1. Write an Existing Tables Migration Strategy document before DB migration.
2. Identify every legacy role/table reference in code and SQL.
3. Define phased migration order: add new structures, backfill, dual-read if needed, switch authority, then remove legacy after review.

## 4. D-P0-002 Supplier-Buyer Messaging Storage Strategy

### Final Decision

Supplier-Buyer communication reuses the existing `conversations/messages` model with typed conversation enforcement. A separate `brokerage_case_messages` table will not be created for MVP.

### Required Conversation Fields

Future migration planning must assume the following additions or equivalent fields:

| Field | Purpose |
| --- | --- |
| `conversations.conversation_type` | Required type gate for all conversations. |
| `conversations.brokerage_case_id` | Links brokerage/direct release communication to a case. |
| `conversations.admin_required` | Marks conversations requiring Admin brokerage/ownership. |
| `conversations.created_by_role` | Records role context used at creation. |

### Allowed Supplier-Buyer Conversation Types

| Conversation Type | Supplier-Buyer Allowed | Requirement |
| --- | --- | --- |
| `brokerage_case` | Yes | Valid brokerage case and participant authorization. |
| `direct_contact_released` | Yes | Valid, unexpired, unreleased contact approval for the same buyer/supplier/case. |
| `agent_buyer` | No for Supplier-Buyer | Agent-subordinate Buyer only. |
| `professor_student` | No for Supplier-Buyer | Professor-subordinate Student only. |
| `admin_user` | Yes through Admin | Admin participant/owner required. |
| `system_notice` | No direct negotiation | System/Admin notification only. |

### Denied Structures

- Supplier + Buyer only conversation without Admin brokerage context.
- Supplier-Buyer message without `brokerage_case_id` or approved `contact_release_approvals`.
- `supplier_buyer_direct` as a global or free-form conversation type.
- App-only blocking without DB/RLS enforcement.

### Implementation Impact

- `can_send_message(user_id, conversation_id)` must enforce conversation type, participant, case, and release rules.
- Conversation creation must require `conversation_type`.
- Buyer Inquiry must create or connect to a Brokerage Case, not a direct Supplier conversation.
- Existing conversations must be audited before type migration.

## 5. D-P0-003 Direct Contact Release Policy

### Final Decision

Direct Contact Release is a case-level exception. It is not a global permission and cannot be granted by a feature flag alone.

### Release Key

Every release must be scoped to:

| Field | Requirement |
| --- | --- |
| `buyer_id` | Required |
| `supplier_id` | Required |
| `brokerage_case_id` | Required |
| `approved_by_admin_id` | Required |
| `approved_at` | Required |
| `expires_at` | Required; default 30 days from approval |
| `reason` | Required |
| `release_scope` | Required |
| `revoked_at` | Nullable; if present release is invalid |

### Default Policy

| Policy Area | Final Decision |
| --- | --- |
| Scope | Case-level only. |
| Default expiry | 30 days. |
| Default contact exposure | Masked contact remains default. |
| Email exposure | Requires explicit admin approval in `release_scope`. |
| Phone exposure | Requires explicit admin approval in `release_scope`. |
| Contact person exposure | Requires explicit admin approval in `release_scope`. |
| Message permission | Allowed only if release is valid, unexpired, not revoked, and tied to the same case. |
| Audit | Every approve, revoke, renew, and scope change must write `audit_logs`. |

### Feature Flag Interpretation

`supplier_buyer_direct_contact_enabled` does not enable global direct contact. If ON in the future, it only allows Admin-approved, case-level release flows to operate.

### Implementation Impact

- `has_contact_release(buyer_id, supplier_id, case_id)` must check expiry, revoke, case, and scope.
- UI contact buttons must follow release state but cannot be the final enforcement layer.
- Admin release action must capture reason and scope.

## 6. D-P0-004 Buyer PII Projection Policy

### Final Decision

Supplier-facing query/view/RPC/DTO paths exclude Buyer email, phone, and contact person by default.

### Field Policy

| Field | Supplier Default | Admin/Brokerage | Agent | Public |
| --- | --- | --- | --- | --- |
| Buyer email | Excluded | Full when operationally required | Limited only for subordinate Buyer if explicitly allowed by policy | No |
| Buyer phone | Excluded | Full when operationally required | Limited only for subordinate Buyer if explicitly allowed by policy | No |
| Buyer contact person | Excluded | Full when operationally required | Limited summary only | No |
| Buyer company/country/industry summary | Allowed if approved/brokered | Full | Subordinate limited summary | Approved public summary only |
| Buyer inquiry details | Brokered safe subset | Full | Subordinate limited summary | No or approved summary only |

### Projection Model

Use one of the following in migration planning:

| Candidate | Purpose |
| --- | --- |
| `buyer_public_profiles` | Public or Supplier-safe Buyer summary without PII. |
| `buyer_masked_profiles` | Masked Buyer profile for brokered Supplier view. |
| Restricted RPC/DTO | Server-side projection that excludes PII by default. |

### Access Rules

- Admin/Brokerage screens can access full Buyer PII for operational purpose.
- Supplier dashboards cannot directly select Buyer PII.
- Agent can view only subordinate Buyer limited summaries.
- Professor full PII access applies to subordinate Students, not Buyers.
- `can_view_buyer_pii(user_id, buyer_id)` is required for any full Buyer PII path.

### Implementation Impact

- Supplier-facing joins from `profiles`, `buyers`, `buy_requests`, `inquiries`, and `brokerage_cases` must not include Buyer PII.
- Buyer PII must not appear in analytics event metadata.
- Role-based RLS regression tests must include Supplier denied/masked Buyer PII cases.

## 7. D-P0-005 Free Supplier Product / Proposal Policy

### Final Decision

Free Supplier membership has a concrete MVP product limit and restricted proposal permission.

### Product Policy

| Supplier Tier | Product Registration Limit | Notes |
| --- | --- | --- |
| Free | 10 active products | Admin may override through membership/admin policy. |
| Premium | Expanded or unlimited, final numeric plan detail can be P1/P2 | Buyer PII remains denied. |
| Enterprise | Contract-based | Priority matching/expanded exposure can be enabled manually. |

### Proposal Policy

| Supplier Tier | Proposal Permission | Notes |
| --- | --- | --- |
| Free | No direct proposal submission by default | Can submit a limited response only when Admin explicitly requests it case-by-case. |
| Premium | Proposal submission allowed after Admin Forward | Still requires Admin Review before Buyer delivery. |
| Enterprise | Proposal submission allowed, with priority matching/expanded exposure possible | Still cannot bypass Buyer PII and Admin Brokerage. |

### Implementation Impact

- Product create guard must count active Free Supplier products and enforce limit 10.
- Free Supplier proposal insert is denied unless the case has an Admin-requested limited response marker.
- Premium/Enterprise proposal still flows through Admin Review before Buyer receives it.
- Membership tier never grants Buyer email/phone/contact access.

## 8. D-P0-006 Implementation Blocking Rule

### Final Decision

The five decisions above are blocking implementation inputs.

### Blocking Rules

| Blocked Work | Rule |
| --- | --- |
| DB migration | Forbidden until these decisions are reflected in a migration plan. |
| RLS SQL | Forbidden until ERD/RLS update notes and role-based tests are prepared. |
| Communication implementation | Forbidden until typed conversation migration plan exists. |
| Buyer PII queries | Forbidden until projection model is designed. |
| Non-security code changes | Wait until migration plan, except narrow security patches. |
| Existing code cleanup | Follow Existing Code Reuse Policy after migration plan. |

### Allowed Before Migration Plan

- Documentation.
- Security audits.
- Narrow security patches.
- Migration planning.
- RLS test planning.
- Source-of-truth consistency updates.

## 9. Required Updates After This Decision

| Target | Required Update |
| --- | --- |
| ERD v1 | Add decision note that `brokerage_case_messages` is not used for MVP; `conversations/messages` are reused with `conversation_type`, `brokerage_case_id`, `admin_required`, `created_by_role`. |
| ERD v1 | Mark `profiles.member_type_id` as legacy-only if present; `account_roles` is permission authority. |
| ERD v1 | Add Free Supplier active product limit 10 to membership/product guard notes. |
| ERD v1 | Add Direct Contact Release default expiry 30 days and explicit `release_scope` policy. |
| RLS Design v1 | Update `can_send_message` assumptions for reused typed conversations. |
| RLS Design v1 | Update `has_contact_release` to use 30-day default expiry and explicit scope checks. |
| RLS Design v1 | Require `can_view_buyer_pii` for full PII and default false for Supplier-facing paths. |
| Migration Plan | Include non-destructive phased migration, legacy mapping, backfill, audit, rollback, and manual review for existing Supplier-Buyer conversations. |
| Existing Code Reuse Policy | Apply Replace to `mergeWithSamples`, sample fallback mixed into real UI, direct Buyer PII selects, and direct Supplier-Buyer conversation code. |
| TASK_MASTER / PROJECT_MASTER | Update after acceptance: Permission Matrix, Communication Security Design, ERD v1, RLS Design v1, Gap Analysis, and this P0 Decision document should no longer be marked pending. |

## 10. Remaining P1/P2 Decisions

| Priority | Decision | Current Handling |
| --- | --- | --- |
| P1 | Premium Supplier analytics 범위 | Define aggregate-only metrics before analytics dashboard/RLS implementation. |
| P1 | Membership billing MVP 포함 여부 | Decide manual-only admin-granted premium vs billing-ready metadata before membership UI. |
| P1 | Supabase migration metadata alignment | Run separate approved CLI link/list/repair task before structural DB migration. |
| P1 | security definer helper 구현 범위 | Classify helpers as security definer/invoker before RLS SQL. |
| P2 | Company Score 계산식 | Keep manual/admin exposure for MVP until formula is approved. |
| P2 | Badge 자동 부여 조건 | Start with Admin grant/revoke; full auto grant remains deferred. |
| P2 | Student Reward 공개 범위 | Define owner/professor/admin/public visibility before Student reward UI. |
| P2 | Landing preview token RLS 방식 | Decide token/RPC/signed route during Landing Builder implementation planning. |

## 11. Codex Implementation Notes

- This document is a migration-precondition blocking decision.
- Migration plan writing must reference this document.
- Do not create a structure that allows Supplier-Buyer direct messages outside `brokerage_case` or `direct_contact_released` rules.
- Do not create Buyer PII direct select paths for Supplier-facing queries, views, RPCs, DTOs, analytics, or sample data.
- `account_roles` is the new permission authority.
- `profiles.member_type_id` is legacy-only if it exists.
- `brokerage_case_messages` is not part of MVP.
- `conversations/messages` reuse requires typed conversation enforcement.
- Feature Flags cannot bypass RLS or Admin Brokerage.
- Security patches may continue, but feature implementation waits for migration plan.

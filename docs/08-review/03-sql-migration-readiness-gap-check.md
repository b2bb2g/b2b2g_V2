# SQL Migration Readiness Gap Check

## 1. Review Scope

This document performs the final readiness gap check before authoring real SQL migration files for B2BB2G V2.

Reviewed source documents:

| Document | Review Purpose |
| --- | --- |
| `docs/05-data/03-migration-plan-v1.md` | Phased migration principles, existing table strategy, RLS migration order, blocking issues. |
| `docs/05-data/04-existing-db-erd-mapping-audit.md` | Current 62-table mapping to ERD v1 and SQL file plan. |
| `docs/05-data/05-sql-migration-pack-spec-v1.md` | File-by-file `001`-`011` migration intent, rollback, and validation conditions. |
| `docs/05-data/01-erd-v1.md` | Target ERD and table/security principles. |
| `docs/05-data/02-rls-design-v1.md` | Helper, RLS, and permission translation design. |
| `docs/08-review/02-p0-decision-resolution.md` | Final P0 decisions for migration blocking topics. |
| `docs/07-implementation/04-supabase-health-audit.md` | Current Supabase baseline, RLS state, migration metadata risk, and security findings. |

This is a documentation-only readiness check. It does not write SQL migration files, modify Supabase DB, change RLS policies, update application code, or change UI.

## 2. Migration Pack Readiness Summary

| Area | Readiness | Finding | Action |
| --- | --- | --- | --- |
| Migration order | Ready with Conditions | The `001`-`011` order is directionally safe and matches the migration plan. | Keep `001` strictly baseline/comment/read-only; do not apply structural files until metadata and backup conditions are closed. |
| Additive-first | Ready with Conditions | All planned structural files are described as additive-first. | SQL authoring must preserve nullable/compatibility-first behavior and avoid drops/renames in early files. |
| Destructive change | Ready with Conditions | No explicit destructive migration is planned in `001`-`011`. | Watch for hidden destructive behavior such as table rename without compatibility view, strict NOT NULL on existing rows, or unsafe backfill. |
| Buyer PII | Not Ready for structural SQL | PII policy is consistent, but final projection name and field shape remain open. | Resolve `buyer_masked_profiles` vs `buyer_public_profiles` vs restricted RPC/DTO before `005`. |
| Supplier-Buyer messaging | Not Ready for enforcement SQL | Policy is consistent, but existing conversation audit is not complete. | Complete audit before `004` backfill or `010` policy enforcement. |
| Role migration | Ready with Conditions | `account_roles` authority is consistent across docs. | Define legacy role mapping and active/revoked/pending rules before `002` backfill. |
| Existing 62-table mapping | Ready with Conditions | Existing table matrix covers current 62 public tables and key rename/replace targets. | Owner review is still needed before non-baseline structural SQL. |
| Migration metadata | Not Ready for structural SQL | Standard `supabase_migrations.schema_migrations` was not found in the health audit. | Reconcile Supabase CLI migration metadata before applying schema-changing migrations. |
| RLS helpers | Not Ready for RLS SQL | Helper list is stable, but security definer/invoker scope is not finalized. | Complete helper body/scope review before `009` and `010`. |
| `001_snapshot_baseline.sql` | Ready with Conditions | `001` can start if it is comment-only/read-only/metadata-only and performs no schema change. | Treat `001` as a baseline gate, not a structural migration. |

Overall decision: **Ready with Conditions**.

The project can start authoring `001_snapshot_baseline.sql` only under strict baseline conditions. It is not ready for `002` or later schema-changing migration files.

## 3. P0 Blocking Issues

| ID | Blocking Issue | Blocks | Evidence | Required Resolution |
| --- | --- | --- | --- | --- |
| P0-RG-001 | Existing conversation audit is not complete. | `004_conversation_compatibility.sql`, `010_rls_policies.sql` | Migration Plan and Pack Spec both require audit before classification; Supabase Health Audit says DB/RLS does not yet encode Admin Brokerage. | Audit current `conversations`, `conversation_members`, and `messages` for Supplier+Buyer-only and unknown conversation patterns. |
| P0-RG-002 | Buyer PII projection final shape is not decided. | `005_buyer_pii_projection.sql`, Supplier-facing query/RLS work | P0 Decision Resolution allows masked view or restricted projection candidates but does not choose the exact object. | Choose final projection strategy and field list before SQL authoring for `005`. |
| P0-RG-003 | Existing data backup/snapshot procedure is not documented as completed. | Any production migration execution | Migration Plan requires snapshot/backup/baseline before migration. | Capture schema/data backup or approved equivalent before applying any migration to production. |

P0 interpretation:

- These P0 issues do not block authoring a comment-only/read-only `001_snapshot_baseline.sql`.
- They do block schema-changing SQL execution and any policy enforcement that could affect production access.

## 4. P1 Before SQL Issues

| ID | Issue | Blocks | Risk | Required Resolution |
| --- | --- | --- | --- | --- |
| P1-RG-001 | Supabase migration metadata alignment is incomplete. | Any structural migration after `001`. | Future migrations can drift from remote history. | Install/link Supabase CLI or perform approved migration repair/list workflow for project `ysonocyrvvskdajmpdmu`. |
| P1-RG-002 | Security definer helper scope is not finalized. | `009_rls_helpers.sql`, `010_rls_policies.sql`. | Helper privilege mistakes can bypass RLS. | Decide definer/invoker per helper, fixed `search_path`, privilege grants, and body review. |
| P1-RG-003 | Role data mapping is not finalized. | `002_role_compatibility.sql` backfill and role policies. | Legacy roles could become incorrect active `account_roles`. | Define mapping from `profiles.member_type_id`, `member_types`, `profile_roles`, and active/revoked states. |
| P1-RG-004 | RLS regression fixtures are not finalized. | `009`, `010`, `011`. | Cannot prove Supplier-Buyer, Buyer PII, Agent, Professor, Student, Admin boundaries. | Prepare fixtures and expected allow/deny matrix before policy SQL. |
| P1-RG-005 | Old code dependency review is incomplete. | Application refactor and final authority switch. | App may keep using deprecated `member_type_id`, `buy_sell_posts`, or raw Buyer PII. | Inventory dependencies before switching app queries or removing compatibility. |
| P1-RG-006 | FDA field-level mapping is unresolved. | Later FDA rename/replace SQL. | Sensitive FDA files/status/quotes can lose linkage or visibility controls. | Audit `thailand_fda_applications` fields before normalized `fda_*` migrations. |
| P1-RG-007 | SELL table compatibility references are not fully mapped. | Future `buy_sell_posts` to `sell_products` migration. | SEO, featured content, routes, and RLS policies could break. | Define compatibility view or dual-read period before rename/replace. |

## 5. Migration File Dependency Check

| File | Dependency Status | Gap / Conflict | Readiness |
| --- | --- | --- | --- |
| `001_snapshot_baseline.sql` | Depends on baseline approach only. | Must not become structural. Needs metadata alignment note and backup checklist. | Ready with Conditions |
| `002_role_compatibility.sql` | Depends on `001`, role mapping, legacy preservation. | Mapping from legacy role structures to `account_roles` needs final owner review. | Not Ready |
| `003_brokerage_core.sql` | Depends on `001`, P0 decisions, role compatibility assumptions. | Admin participant vs admin owner model is not fully decided for RLS. | Not Ready |
| `004_conversation_compatibility.sql` | Depends on `003` and existing conversation audit. | Audit not complete; unknown conversations must not be auto-classified. | Not Ready |
| `005_buyer_pii_projection.sql` | Depends on PII projection decision and field list. | Final view/RPC/DTO strategy not selected. | Not Ready |
| `006_supplier_membership.sql` | Depends on Supplier mapping and role compatibility. | Safe default tier assignment needs owner-approved mapping. | Not Ready |
| `007_feature_flags.sql` | Depends on settings governance and defaults. | Defaults are clear; lower risk if additive/Admin-only. | Ready with Conditions |
| `008_landing_builder.sql` | Depends on landing scope and translation strategy. | Additive tables are safe, but public read policy waits for RLS. | Ready with Conditions |
| `009_rls_helpers.sql` | Depends on helper scope review and fixtures. | Security definer scope unresolved. | Not Ready |
| `010_rls_policies.sql` | Depends on `009`, projection, fixtures, conversation audit. | Multiple P0/P1 prerequisites unresolved. | Not Ready |
| `011_validation_tests.sql` | Depends on all prior expected structures and test fixtures. | Test fixture design is incomplete. | Not Ready |

Dependency conclusion:

- The sequence is safe as a plan.
- `001` can be authored first as a baseline gate.
- `002` and later should not be authored as executable structural SQL until the blocking items above are closed or explicitly scoped out.

## 6. Additive Safety Check

| Check | Status | Notes |
| --- | --- | --- |
| Existing tables are not dropped | Pass in design | All reviewed docs forbid immediate deletion. |
| `profiles.member_type_id` preserved | Pass in design | Treated as legacy compatibility only. |
| `profile_roles` preserved during transition | Pass in design | Backfill to `account_roles`; no early drop. |
| `member_types` preserved during transition | Pass in design | Display/compatibility only, not permission authority. |
| `conversations/messages` reused | Pass in design | No separate `brokerage_case_messages` for MVP. |
| Existing conversations not auto-classified | Pass in design | Audit required before classification. |
| Buyer PII direct select removed by projection | Partial | Principle is clear; exact projection object unresolved. |
| Hidden destructive rename risk | Needs Guard | Rename targets like `buy_sell_posts -> sell_products`, `epc_posts -> epc_projects`, `profile_roles -> account_roles`, and `banners -> landing_banners` must use compatibility/backfill, not direct destructive rename. |
| Unsafe NOT NULL/default risk | Needs Guard | New columns on existing tables should start nullable or with safe defaults until backfill validation. |
| Policy replacement risk | Needs Guard | RLS policy changes must be group-by-group with rollback SQL, not one broad replacement. |

Additive safety conclusion:

- The written plan is additive-first.
- SQL authoring must explicitly avoid hidden destructive changes through direct renames, immediate NOT NULL constraints, broad policy replacement, or data-changing backfills without review.

## 7. Privacy / Security Check

| Security Area | Status | Gap | Required Guard |
| --- | --- | --- | --- |
| Buyer PII | Not Ready for SQL | Projection name and exact fields unresolved. | Finalize `buyer_masked_profiles` / `buyer_public_profiles` / restricted RPC decision and field list. |
| Supplier-Buyer direct messaging | Not Ready for enforcement | Current DB/RLS remains membership-centered; conversation audit incomplete. | Complete audit and enforce through `brokerage_cases`, typed `conversations`, `can_send_message`. |
| Direct Contact Release | Ready with Conditions | Case-level/30-day/explicit scope policy is settled. | Define `release_scope` enum/allowed values before SQL. |
| Account/Role authority | Ready with Conditions | `account_roles` is settled as target authority. | Finalize legacy mapping and active/revoked/pending interpretation before backfill. |
| Security definer helpers | Not Ready | 25 existing functions require body-level review; new helper scope not finalized. | Classify helper definer/invoker and ensure fixed `search_path`. |
| Public content exposure | Ready with Conditions | Policies must preserve approved/published/deleted gates. | Validate public read policies for every content table after `010`. |
| Service role bypass | Ready with Conditions | Prior patches removed app-level fallbacks; DB policies still include service-role exceptions for audit/activity inserts. | Keep service role server-only; inventory system-task-only exceptions. |
| Feature flags | Ready with Conditions | Defaults are safe. | Confirm flags cannot override RLS or brokerage requirements. |

Security conclusion:

- No new contradiction was found across the three migration planning documents.
- The biggest remaining risks are unresolved implementation details, not policy disagreement.

## 8. Existing Table Mapping Check

| Mapping Area | Status | Finding |
| --- | --- | --- |
| Current public table count | Covered | Existing DB Mapping Audit and Health Audit both record 62 public tables. |
| RLS enabled count | Covered | Health Audit records 62 / 62 public tables with RLS enabled. |
| Reuse tables | Covered | Keep-as-is list exists, but RLS regression is still required. |
| Refactor tables | Covered | Key refactors include `profiles`, `companies`, `products`, `buyers`, `suppliers`, `conversations`, `messages`, `buy_requests`, `translations`. |
| Rename targets | Covered with risk | `buy_sell_posts`, `epc_posts`, `profile_badges`, `profile_roles`, `rewards`, `banners` require compatibility/backfill strategy. |
| Replace targets | Covered with risk | `admin_logs`, `audit_events`, `matching_requests`, `thailand_fda_applications`, Supplier-Buyer direct structure, Buyer PII direct select structure. |
| Missing ERD target tables | Covered | Mapping Audit lists missing target tables including `account_roles`, `brokerage_cases`, `feature_flags`, landing builder tables, and PII projection. |
| Mapping omissions | None found at current review depth | No obvious missing current table from the 62-table matrix was found in reviewed docs. |

Existing table conclusion:

- The mapping audit is sufficient to begin `001_snapshot_baseline.sql`.
- It is not sufficient to begin destructive rename/replace or backfill migrations without owner review and field-level audits.

## 9. Helper / RLS Readiness Check

| Helper / Policy Area | Status | Notes |
| --- | --- | --- |
| `is_admin` | Needs SQL scope review | Must use active Administrator role through `account_roles`. |
| `has_role` / `has_account_role` | Needs SQL scope review | Must ignore pending/revoked/deleted roles and avoid divergence between aliases. |
| `is_agent_of_buyer` | Needs fixture | Must prove non-subordinate Buyer denied. |
| `is_professor_of_student` | Needs fixture | Must prove unrelated Student PII denied. |
| `is_brokerage_case_participant` | Needs SQL scope review | Must not leak Buyer PII to Supplier participant. |
| `has_contact_release` | Needs release scope decision | Must check buyer+supplier+case, expiry, revoke, and explicit scope. |
| `can_send_message` | Not Ready | Depends on typed conversations, case/release tables, conversation audit, and fixtures. |
| `can_view_buyer_pii` | Not Ready | Depends on final projection strategy and field-level PII access rules. |
| `can_view_student_pii` | Needs fixture | Professor subordinate rule is clear; tests still required. |
| Public read policies | Ready with Conditions | Must keep approved/published/active/deleted gates. |
| Brokerage policies | Not Ready | Depends on `003`, `004`, `009`, conversation audit, and PII projection. |

RLS readiness conclusion:

- Helper names and purposes are stable enough for planning.
- They are not ready for SQL body authoring until security definer scope, function privileges, fixtures, and PII/release details are finalized.

## 10. Decision: Can Start 001_snapshot_baseline.sql?

**Ready with Conditions**

`001_snapshot_baseline.sql` can start only if it is strictly limited to one of the following:

- comment-only baseline migration;
- metadata-only baseline note using an already-approved project metadata mechanism;
- read-only baseline companion documentation that records current table count, RLS state, policy count, function count, and migration metadata state.

`001_snapshot_baseline.sql` must not:

- create, alter, rename, or drop business tables;
- disable or replace RLS policies;
- backfill production data;
- classify conversations;
- create `account_roles`, brokerage tables, projections, helpers, or policies;
- attempt migration metadata repair as a side effect;
- print or store Supabase keys.

## 11. Required Conditions Before 001

| Condition | Required Before 001? | Required Before Structural SQL? | Notes |
| --- | --- | --- | --- |
| Confirm target project ref `ysonocyrvvskdajmpdmu` | Yes | Yes | Baseline must identify the exact project. |
| Confirm no secret/key output | Yes | Yes | Keys must never be written to migration or docs. |
| Confirm `001` is non-structural | Yes | Yes | `001` is a gate, not schema change. |
| Record public table count baseline | Yes | Yes | Current documented baseline: 62 public tables. |
| Record RLS baseline | Yes | Yes | Current documented baseline: 62 / 62 RLS enabled. |
| Record migration metadata state | Yes | Yes | `supabase_migrations.schema_migrations` was not found in prior audit. |
| Backup/snapshot procedure | Recommended for authoring; required for apply | Yes | Before applying any production migration, backup is mandatory. |
| Supabase migration metadata alignment | Document in `001`; resolve before `002` apply | Yes | Not required for comment-only authoring, required before structural changes. |
| Existing conversation audit | No | Yes before `004`/`010` | Blocks conversation classification and message policy enforcement. |
| Buyer PII projection decision | No | Yes before `005`/`010` | Blocks Supplier-facing projection/policies. |
| Security definer helper scope | No | Yes before `009`/`010` | Blocks helper and policy SQL. |

## 12. Next Action

Recommended next action:

1. Author `001_snapshot_baseline.sql` as a **non-structural baseline migration spec/file** only.
2. In the same task, create or update a short baseline evidence note with:
   - project ref `ysonocyrvvskdajmpdmu`;
   - public table count `62`;
   - RLS enabled count `62 / 62`;
   - public policy count `186`;
   - public security definer function count `25`;
   - local migration file count `27`;
   - migration metadata issue: `supabase_migrations.schema_migrations` not found in prior audit.
3. Before `002_role_compatibility.sql`, run a separate Supabase migration metadata alignment task.
4. Before `003`-`010`, close the P0/P1 blockers:
   - existing conversation audit;
   - Buyer PII projection final view/RPC decision;
   - role data mapping;
   - security definer helper scope;
   - RLS regression fixtures.

Implementation gate:

- `001_snapshot_baseline.sql`: **can start now under conditions**.
- `002`-`011` executable structural SQL: **not ready**.
- Any destructive migration: **not allowed**.

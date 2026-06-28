# B2BB2G V2 — Task Master

| Task ID | Task Name | Owner | Status | Related Files | Dependency | Next Action |
| --- | --- | --- | --- | --- | --- | --- |
| T-001 | Architecture document | Codex | DONE | `docs/01-architecture/01-platform-engine-module-plugin.md` | None | Keep frozen unless source-of-truth correction is required. |
| T-002 | Platform Experience Standard | Codex | DONE | `docs/01-architecture/02-platform-experience-standard.md` | T-001 | Keep frozen unless contradiction is found. |
| T-003 | User Journey | Codex | DONE | `docs/02-experience/01-user-journey.md` | T-001, T-002 | Use as role journey source. |
| T-004 | Workflow Standard | Codex | DONE | `docs/02-experience/02-workflow-standard.md` | T-003 | Use as process source. |
| T-005 | State Machine | Codex | DONE | `docs/02-experience/03-state-machine.md` | T-004 | Use state names exactly. |
| T-006 | Sub Page UI Standard | Codex | DONE | `docs/02-experience/04-sub-page-ui-standard.md` | T-003 | Use before UI implementation. |
| T-007 | Existing Code Reuse Policy | Codex | DONE | `docs/07-implementation/00-existing-code-reuse-policy.md` | T-001 | Use Reuse/Refactor/Replace/Hold classification. |
| T-008 | Repository Audit | Codex | DONE | `docs/07-implementation/01-codex-repository-audit.md` | T-001, T-007 | Keep as implementation baseline. |
| T-009 | P0 Security Patch | Codex | DONE | `docs/07-implementation/02-p0-security-patch-plan.md`, `lib/supabase/admin.ts`, `lib/actions/business.ts` | T-008 | Maintain service-role server-only boundary. |
| T-010 | P1 Security Audit | Codex | DONE | `docs/07-implementation/03-p1-security-audit.md`, `lib/queries/dashboard.ts`, `lib/actions/business.ts` | T-009 | Follow remaining risk list. |
| T-011 | Supabase Health Audit | Codex | DONE | `docs/07-implementation/04-supabase-health-audit.md` | T-010 | Re-run native Advisor after CLI/API access if needed. |
| T-012 | Business Rules | Codex | DONE | `docs/03-business/01-business-rules.md` | T-001 to T-011 | Keep frozen unless source-of-truth correction is required. |
| T-013 | Feature Flags | Codex | DONE | `docs/03-business/02-feature-flags.md` | T-012 | Use defaults before Admin Setting design. |
| T-014 | Project Master | Codex | DONE | `PROJECT_MASTER.md` | T-001 to T-013 | Keep updated after major documentation, migration, or implementation tasks. |
| T-015 | Task Master | Codex | DONE | `TASK_MASTER.md` | T-014 | Keep updated after task completion. |
| T-016 | Permission Matrix | Codex | DONE | `docs/04-permissions/01-permission-matrix.md` | T-012, T-013 | Use as permission source for every Engine Sprint. |
| T-017 | Communication / Trade Brokerage Security Design Patch | Codex | DONE | `docs/04-permissions/02-communication-brokerage-security-design.md` | T-016 | Use before brokerage/communication migration. |
| T-018 | ERD redesign v1 | Codex | DONE | `docs/05-data/01-erd-v1.md` | T-016, T-017 | Use as target schema source. |
| T-019 | RLS Design v1 | Codex | DONE | `docs/05-data/02-rls-design-v1.md` | T-016, T-018 | Use before helper/policy SQL. |
| T-020 | Source of Truth Gap Analysis | Codex | DONE | `docs/08-review/01-source-of-truth-gap-analysis.md` | T-001 to T-019 | Keep as review record. |
| T-021 | P0 Decision Resolution | Codex | DONE | `docs/08-review/02-p0-decision-resolution.md` | T-020 | Use before migration and implementation decisions. |
| T-022 | Migration Plan v1 | Codex | DONE | `docs/05-data/03-migration-plan-v1.md` | T-021 | Use for migration sequencing. |
| T-023 | Existing DB to ERD Mapping Audit | Codex | DONE | `docs/05-data/04-existing-db-erd-mapping-audit.md` | T-022 | Use for table reuse/refactor/replace decisions. |
| T-024 | SQL Migration Pack Spec v1 | Codex | DONE | `docs/05-data/05-sql-migration-pack-spec-v1.md` | T-022, T-023 | Use for 001+ migration authoring. |
| T-025 | SQL Migration Readiness Gap Check | Codex | DONE | `docs/08-review/03-sql-migration-readiness-gap-check.md` | T-024 | 001 baseline was allowed after this review. |
| T-026 | 001 Snapshot Baseline Migration | Codex | DONE | `supabase/migrations/001_snapshot_baseline.sql` | T-025 | Applied to production. Result: Success. No rows returned. |
| T-027 | 002 Migration Readiness Resolution | Codex | DONE | `docs/05-data/06-002-readiness-resolution.md` | T-026 | Keep as 002 pre-apply decision record. |
| T-028 | 002 Role Compatibility Migration | Codex | DONE | `supabase/migrations/002_role_compatibility.sql` | T-027 | Applied to production. Result: Success. No rows returned. |
| T-029 | 002 Migration Review Report | Codex | DONE | `docs/05-data/07-002-migration-review-report.md` | T-028 | Conditions closed by production apply confirmation for 002. |
| T-030 | Engine Sprint Transition Plan | Codex | DONE | `PROJECT_MASTER.md`, `TASK_MASTER.md`, `docs/09-sprints/01-engine-sprint-plan.md`, `docs/09-sprints/02-sprint-1-identity-engine.md` | T-029 | Start Sprint 1 Identity Engine Repository Audit. |
| T-031 | Sprint 1 Identity Engine Plan | Codex | DONE | `docs/09-sprints/02-sprint-1-identity-engine.md` | T-030 | Use as Sprint 1 scope gate. |
| T-032 | Sprint 1 Identity Engine Repository Audit | Codex | DONE | `docs/09-sprints/03-sprint-1-identity-repository-audit.md` | T-031 | Use audit findings before implementation. |
| T-033 | Sprint 1 Identity Implementation Plan | Codex | TODO | `docs/09-sprints/04-sprint-1-identity-implementation-plan.md` | T-032 | Write exact implementation sequence before code edits. |
| T-034 | Identity Engine Types | Codex | TODO | `types/`, Identity-related types | T-033 | Define server/client-safe Identity types after implementation plan. |
| T-035 | Identity Engine Queries | Codex | TODO | `lib/queries/`, Identity query files | T-034 | Add account_roles and role_applications reads with RLS boundaries. |
| T-036 | Identity Engine Server Actions | Codex | TODO | `lib/actions/`, Identity action files | T-035 | Prepare role application and admin approval actions. |
| T-037 | Identity Engine RLS Review | Codex | TODO | RLS docs and query/action review | T-035, T-036 | Confirm no runtime authority switch before helper/policy SQL. |
| T-038 | Identity Engine Admin UI | Codex | TODO | `app/`, `components/` | T-036, T-037 | Prepare admin approval UI only after audit and actions. |
| T-039 | Identity Engine Tests | Codex | TODO | tests/typecheck/lint | T-034 to T-038 | Verify role visibility, admin boundaries, typecheck, and lint. |
| T-040 | Sprint 1 Identity Engine Implementation Task 01 | Codex | DONE | `types/database.ts`, `lib/auth/account-roles.ts`, `lib/queries/identity.ts`, `lib/actions/identity.ts` | T-032 | Added account role types, identity queries/actions, and legacy compatibility helper. |
| T-041 | Sprint 1 Identity Engine Task 02 - Integration Gap Check | Codex | DONE | `docs/09-sprints/04-sprint-1-identity-integration-gap-check.md` | T-040 | Use this gap check to keep Task 03 focused on effective role context integration. |

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
| T-011 | Supabase Health Audit | Codex | DONE | `docs/07-implementation/04-supabase-health-audit.md` | T-010 | Re-run native Advisor after CLI/API access. |
| T-012 | Business Rules | Codex | DONE | `docs/03-business/01-business-rules.md` | T-001 to T-011 | Review Decision Required items. |
| T-013 | Feature Flags | Codex | DONE | `docs/03-business/02-feature-flags.md` | T-012 | Use defaults before Admin Setting design. |
| T-014 | Project Master | Codex | DONE | `PROJECT_MASTER.md` | T-001 to T-013 | Keep updated after major documentation or implementation tasks. |
| T-015 | Task Master | Codex | DONE | `TASK_MASTER.md` | T-014 | Keep updated after task completion. |
| T-016 | Permission Matrix | Codex | WAITING | TBD | T-012, T-013 | Create Role x Engine x Module x Action matrix next. |
| T-017 | ERD redesign | Codex | WAITING | TBD | T-016 | Do not start before Permission Matrix. |
| T-018 | RLS redesign | Codex | WAITING | TBD | T-016, T-017 | Include Supplier-Buyer brokerage enforcement and PII tests. |
| T-019 | UI System alignment | Codex | WAITING | TBD | T-012, T-013, `DESIGN.md` | Prepare UI Design System implementation plan. |
| T-020 | Codex Implementation Plan | Codex | WAITING | TBD | T-016, T-017, T-018 | Sequence implementation after docs are stable. |
| T-021 | Communication / Trade Brokerage RLS Design Patch | Codex | WAITING | TBD | T-012, T-016 | Define Admin Brokerage conversation model before DB migration. |
| T-022 | Supabase CLI migration alignment | Codex | WAITING | TBD | T-011 | Install/link/list/repair only after explicit approval. |
| T-023 | Role-based RLS regression tests | Codex | WAITING | TBD | T-018 | Add tests for Buyer PII, Student privacy, Agent-Buyer, Professor-Student, Supplier-Buyer denial. |

# B2BB2G V2 — Project Master

## Project Name

B2BB2G V2

## Project Definition

B2BB2G V2는 한국 기업의 제품, 산업설비, EPC 프로젝트, BUY & SELL 게시글, Thailand FDA Service를 전세계 Buyer와 연결하는 관리자 통제형 Global Trade Operating System이다.

핵심 구조는 `Platform -> Experience -> Engine -> Module -> Plugin`이며, 단순 B2B 쇼핑몰이 아니라 Supplier, Buyer, Agent, Professor, Student, Administrator Role을 기반으로 운영되는 글로벌 무역 네트워크 플랫폼이다.

## Current Phase

- Current Phase: Engine Sprint Implementation
- PDCA primary feature: `b2bb2g-mvp`
- Current PDCA phase: `act`
- Current Sprint: Sprint 2 Invitation Engine Policy Gate / Organization Engine
- Previous Sprint: Sprint 1 Identity Engine — Frozen with Known Limitations
- Current implementation mode: Engine-by-Engine sprint execution

## Current GitHub Branch

- Branch: `main`
- Remote: `origin`
- Repository: `b2bb2g/b2b2g_V2`

## Current Supabase Project

- Project ref: `ysonocyrvvskdajmpdmu`
- Project URL: `https://ysonocyrvvskdajmpdmu.supabase.co`
- Current known status: remote DB reachable, public 62 tables all RLS-enabled, standard Supabase CLI migration tracking previously not confirmed

## Completed Migration

| Migration | Status | Result | Notes |
| --- | --- | --- | --- |
| `001_snapshot_baseline.sql` | Applied to production | Success. No rows returned | Baseline marker; no schema/data/RLS mutation. |
| `002_role_compatibility.sql` | Applied to production | Success. No rows returned | Additive migration for `account_roles` and `role_applications`. |

## Frozen Documents

These documents are treated as high-priority Source of Truth and should not be casually rewritten.

| Area | Frozen Document |
| --- | --- |
| Architecture v1.0 | `docs/01-architecture/01-platform-engine-module-plugin.md` |
| Platform Experience v1.0 | `docs/01-architecture/02-platform-experience-standard.md` |
| User Journey v1.0 | `docs/02-experience/01-user-journey.md` |
| Workflow Standard v1.0 | `docs/02-experience/02-workflow-standard.md` |
| State Machine v1.0 | `docs/02-experience/03-state-machine.md` |
| Sub Page UI Standard v1.0 | `docs/02-experience/04-sub-page-ui-standard.md` |
| Business Rules v1.0 | `docs/03-business/01-business-rules.md` |
| Feature Flags v1.0 | `docs/03-business/02-feature-flags.md` |
| Permission Matrix v1.0 | `docs/04-permissions/01-permission-matrix.md` |
| Communication Brokerage Security Design v1.0 | `docs/04-permissions/02-communication-brokerage-security-design.md` |
| ERD v1.0 | `docs/05-data/01-erd-v1.md` |
| RLS Design v1.0 | `docs/05-data/02-rls-design-v1.md` |
| Migration Plan v1.0 | `docs/05-data/03-migration-plan-v1.md` |
| SQL Migration Pack Spec v1.0 | `docs/05-data/05-sql-migration-pack-spec-v1.md` |
| Existing Code Reuse Policy v1.0 | `docs/07-implementation/00-existing-code-reuse-policy.md` |

## Active Documents

- `PROJECT_MASTER.md`
- `TASK_MASTER.md`
- `docs/09-sprints/01-engine-sprint-plan.md`
- `docs/09-sprints/02-sprint-1-identity-engine.md`
- `docs/09-sprints/06-sprint-1-identity-review-and-freeze.md`
- `docs/09-sprints/07-sprint-2-organization-repository-audit.md`
- `docs/09-sprints/08-sprint-2-organization-implementation-plan.md`
- `docs/09-sprints/09-sprint-2-invitation-priority-adjustment.md`
- `docs/09-sprints/11-sprint-2-invitation-engine-plan.md`
- `docs/09-sprints/12-sprint-2-invitation-repository-audit.md`
- `docs/09-sprints/13-sprint-2-invitation-migration-spec.md`
- `docs/05-data/07-002-migration-review-report.md`

## Pending Documents

- 003 Brokerage Core Migration readiness/review documents
- Existing conversation audit before communication migration
- RLS helper scope review before policy SQL
- Role-based RLS regression checklist update

## Current Risks

| Priority | Risk | Current Handling |
| --- | --- | --- |
| P1 High | 003+ migration production apply requires backup/snapshot discipline. | Require pre-apply backup evidence and migration metadata review before each structural production migration. |
| P1 High | Conversation audit is still required before communication migration. | Required before `004_conversation_compatibility.sql` classification/backfill and before full Communication RLS enforcement. |
| P1 High | Buyer PII projection must remain protected. | `buyer_masked_profiles` remains the target Supplier-safe projection; Supplier-facing queries must not expose Buyer email/phone/contact person. |
| P1 High | RLS helper scope must be reviewed before policy SQL. | `009_rls_helpers.sql` and `010_rls_policies.sql` remain blocked until helper scope, fixed `search_path`, and tests are reviewed. |
| P2 Medium | 002 uses compatibility `role_key` text while ERD final model expects role authority alignment. | Sprint 1 froze this as a known limitation; final role authority alignment remains migration/backfill backlog. |

## Current Priority

1. Review/approve `012_invitation_core.sql` authoring scope or start Invitation token helper/types after explicit approval
2. Invitation query/action contract before signup route work
3. Supplier public signup connection after token/action contract
4. Organization query layer with PII-safe DTOs after invitation relation inputs are clear
5. Identity backlog tracking for audit, RLS, signup backfill, and integration tests

## Engine Sprint Rule

Implementation proceeds by Engine, not by page-first or component-first work.

Every Engine Sprint must follow:

1. Scope Review
2. DB / Migration Review
3. RLS Review
4. Types
5. Queries
6. Server Actions
7. UI Components
8. Pages
9. Tests
10. Review / Freeze

## Claude Code Role

Claude Code is expected to assist with broader implementation execution, refactoring, and large code navigation when explicitly used by the project owner.

## Codex Role

Codex is responsible for repository-aware implementation, security hardening, documentation updates, verification, commits, and GitHub push when the user does not explicitly forbid push.

## ChatGPT Review Role

ChatGPT Review is expected to challenge assumptions, review source-of-truth consistency, and provide architecture/product/security review before high-risk implementation.

## Last Sprint Summary

- Sprint 1 Identity Engine is frozen with known limitations.
- Implemented baseline: 002 role compatibility migration, `account_roles` / `role_applications` types, account-role-first legacy fallback, role application request/cancel, admin approve/reject, minimal admin UI, and pure helper tests.
- Sprint 2 Organization Engine has started with repository audit only. Existing Organization relations currently depend on `suppliers.company_id`, `country_agents`, and `students.professor_id`; target relation tables remain `company_members`, `agent_buyers`, and `professor_students`.
- Sprint 2 implementation plan is complete. Task 03 should start with local Organization types/helpers and must not query missing relation tables before migration readiness.
- Sprint 2 priority changed: Invitation Engine policy alignment must happen before Organization query/action expansion. Supplier supports both Admin Invitation and Public Self Signup, but always requires Admin Approval and never receives Buyer PII.
- Sprint 2 Invitation Engine plan is complete. Supplier, Agent, Buyer, Professor, and Student signup paths are now organized into invitation types, feature flag impacts, security rules, and MVP task order.
- Sprint 2 Invitation repository audit is complete. Existing global signup, Buyer referral, and member referral flows are classified; `member_referral_codes` is legacy invite-like infrastructure, while final Agent-Buyer/Professor-Student authority must move to Invitation plus relation candidate design.
- Sprint 2 Invitation migration spec is complete. `012_invitation_core.sql` is planned for `invitations`, `invitation_tokens`, and `invitation_redemptions`, with no QR table and token-hash-only storage.
- Remaining Identity backlog: audit logging, RLS helper/policies, role switch UI, signup backfill, legacy role cleanup, and server action integration tests.

## Next Required Action

Review and explicitly approve either `012_invitation_core.sql` authoring or Invitation token helper/types before writing signup routes or Organization query expansion.

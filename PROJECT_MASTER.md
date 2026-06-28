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
- Current Sprint: Sprint 1 Identity Engine
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
- `docs/05-data/07-002-migration-review-report.md`

## Pending Documents

- `docs/09-sprints/03-sprint-1-identity-repository-audit.md`
- Sprint 1 Identity Engine implementation notes
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
| P2 Medium | 002 uses compatibility `role_key` text while ERD final model expects role authority alignment. | Sprint 1 Identity Engine must audit role source, helper design, and eventual backfill timing before runtime switch. |

## Current Priority

1. Sprint 1 Identity Implementation Plan
2. Identity Engine Types
3. Identity Engine Queries
4. Identity Engine Server Actions
5. Identity Engine RLS Review
6. Identity Engine Admin UI
7. Identity Engine Tests

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

## Last Commit Summary

- Last known migration transition before this document: `002_role_compatibility.sql` production apply completed.
- Result: Success. No rows returned.
- Effect: `account_roles` and `role_applications` additive structures are now available in production.

## Next Required Action

Create `docs/09-sprints/04-sprint-1-identity-implementation-plan.md` before modifying Identity Engine code.

# B2BB2G V2 — Project Master

## Project Name

B2BB2G V2

## Project Definition

B2BB2G V2는 한국 기업의 제품, 산업설비, EPC 프로젝트, BUY & SELL 게시글, Thailand FDA Service를 전세계 Buyer와 연결하는 관리자 통제형 Global Trade Operating System이다.

핵심 구조는 `Platform → Experience → Engine → Module → Plugin`이며, 단순 B2B 쇼핑몰이 아니라 Supplier, Buyer, Agent, Professor, Student, Administrator Role을 기반으로 운영되는 글로벌 무역 네트워크 플랫폼이다.

## Current Phase

- PDCA primary feature: `b2bb2g-mvp`
- Current phase: `completed`
- Current documentation stream: implementation preparation and source-of-truth hardening
- Current task focus: Business Rules and Feature Flags

## Current GitHub Branch

- Branch: `main`
- Remote: `origin`
- Repository: `b2bb2g/b2b2g_V2`

## Current Supabase Project

- Project ref: `ysonocyrvvskdajmpdmu`
- Project URL: `https://ysonocyrvvskdajmpdmu.supabase.co`
- Current known status: remote DB reachable, public 62 tables all RLS-enabled, standard Supabase CLI migration tracking not confirmed

## Frozen Documents

These documents are treated as high-priority source of truth and should not be casually rewritten:

- `docs/01-architecture/01-platform-engine-module-plugin.md`
- `docs/01-architecture/02-platform-experience-standard.md`
- `docs/02-experience/01-user-journey.md`
- `docs/02-experience/02-workflow-standard.md`
- `docs/02-experience/03-state-machine.md`
- `docs/02-experience/04-sub-page-ui-standard.md`
- `docs/07-implementation/00-existing-code-reuse-policy.md`

## Active Documents

- `docs/03-business/01-business-rules.md`
- `docs/03-business/02-feature-flags.md`
- `docs/07-implementation/01-codex-repository-audit.md`
- `docs/07-implementation/02-p0-security-patch-plan.md`
- `docs/07-implementation/03-p1-security-audit.md`
- `docs/07-implementation/04-supabase-health-audit.md`
- `PROJECT_MASTER.md`
- `TASK_MASTER.md`

## Pending Documents

- Permission Matrix
- ERD redesign
- RLS redesign
- UI System implementation alignment
- Codex Implementation Plan
- Communication / Trade Brokerage RLS Design Patch
- Role-based RLS regression checklist update

## Current Risks

| Priority | Risk | Current Handling |
| --- | --- | --- |
| P1 High | Supplier-Buyer direct conversation prevention is still not fully enforced at DB/RLS level. | Documented in P1 Security Audit and Supabase Health Audit. |
| P1 High | Migration history tracking is not aligned with standard Supabase CLI metadata. | Supabase Health Audit recommends CLI link/list/repair as a separate approved task. |
| P1 High | Buyer PII protection needs explicit role-based regression tests. | P0/P1 code hardening applied; RLS tests still pending. |
| P2 Medium | Security definer helper functions need body-level review. | Listed in Supabase Health Audit. |
| P2 Medium | Membership limits, Direct Contact Release, Badge automation, Company Score are not finalized. | Tracked as Business Rule Decision Required. |

## Current Priority

1. Business Rules and Feature Flags documentation
2. Permission Matrix
3. Communication / Trade Brokerage RLS Design Patch
4. ERD redesign
5. RLS redesign and role-based tests
6. Implementation plan

## Claude Code Role

Claude Code is expected to assist with broader implementation execution, refactoring, and large code navigation when explicitly used by the project owner.

## Codex Role

Codex is responsible for repository-aware implementation, security hardening, documentation updates, verification, commits, and GitHub push when the user does not explicitly forbid push.

## ChatGPT Review Role

ChatGPT Review is expected to challenge assumptions, review source-of-truth consistency, and provide architecture/product/security review before high-risk implementation.

## Last Commit Summary

- Last known commit before this documentation task: `7d5591d Add Supabase health audit`
- Summary: added `docs/07-implementation/04-supabase-health-audit.md`

## Next Required Action

After Business Rules and Feature Flags are accepted, create the Permission Matrix. Do not start ERD/RLS until Business Rules and Permission Matrix are stable.

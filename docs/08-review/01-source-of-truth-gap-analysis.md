# Source of Truth Gap Analysis

## 1. Review Scope

This report reviews the current B2BB2G V2 source-of-truth document set for conflicts, missing decisions, terminology drift, and implementation blockers.

No code, DB migration, RLS SQL, UI file, or existing source-of-truth document was changed as part of this review.

Reviewed documents:

| Area | File | Review Focus |
| --- | --- | --- |
| Project control | `PROJECT_MASTER.md` | Current phase, active/pending docs, current risks |
| Task control | `TASK_MASTER.md` | Task dependency and stale task status |
| Architecture | `docs/01-architecture/01-platform-engine-module-plugin.md` | Engine/Module/Plugin ownership |
| Experience | `docs/01-architecture/02-platform-experience-standard.md` | Cross-engine UX and operating standards |
| User journey | `docs/02-experience/01-user-journey.md` | Role journey and approval boundaries |
| Workflow | `docs/02-experience/02-workflow-standard.md` | Process flow, table candidates, handoffs |
| State machine | `docs/02-experience/03-state-machine.md` | Status names, transitions, audit/notification requirements |
| UI standard | `docs/02-experience/04-sub-page-ui-standard.md` | Page inventory and UI pattern consistency |
| Business rules | `docs/03-business/01-business-rules.md` | Policy and Decision Required items |
| Feature flags | `docs/03-business/02-feature-flags.md` | MVP default flags and RLS impact |
| Permissions | `docs/04-permissions/01-permission-matrix.md` | Role x Engine, Role x Data, PII, communication |
| Communication security | `docs/04-permissions/02-communication-brokerage-security-design.md` | Supplier-Buyer brokerage security model |
| Data model | `docs/05-data/01-erd-v1.md` | ERD v1 table names, deprecated names, blockers |
| RLS design | `docs/05-data/02-rls-design-v1.md` | RLS helpers, policies, test matrix, blockers |
| Reuse policy | `docs/07-implementation/00-existing-code-reuse-policy.md` | Reuse/Refactor/Replace/Hold rules |
| Supabase health | `docs/07-implementation/04-supabase-health-audit.md` | Remaining Supabase security and migration risks |

## 2. Document Dependency Map

| Layer | Source Document | Depends On | Feeds Into | Current Condition |
| --- | --- | --- | --- | --- |
| Project control | `PROJECT_MASTER.md` | All completed source docs | Implementation planning | Stale. It still says current task focus is Business Rules / Feature Flags and lists Permission/ERD/RLS docs as pending. |
| Task control | `TASK_MASTER.md` | Completed task stream | Execution sequencing | Stale. T-016 to T-021 still show WAITING although Permission Matrix, Communication Security Design, ERD v1, and RLS Design v1 now exist. |
| Architecture | Engine/Module/Plugin Architecture | Project definition | Experience, Business, Permission, ERD | Stable primary taxonomy, but some downstream documents abbreviate engine names. |
| Experience | Platform Experience Standard | Architecture | Workflow, UI, RLS public/interaction rules | Mostly aligned. Some board/calendar/file ownership remains intentionally deferred. |
| Journey | User Journey | Architecture, Experience | Workflow, Permission | Aligned at role level; direct contact exception needs final conditions. |
| Workflow | Workflow Standard | Journey, Architecture | State Machine, ERD | Contains older table candidates such as `profile_roles`, `fda_documents`, `fda_quotations`. |
| State | State Machine | Workflow | ERD/RLS status fields | Mostly aligned. Some states are defined but not yet mapped to exact ERD columns or helper checks. |
| Business | Business Rules | Architecture, Workflow | Feature Flags, Permission, ERD | Strong policy source. Decision Required list is not yet fully resolved. |
| Flags | Feature Flags | Business Rules | Permission/RLS/Admin settings | Defaults are useful, but flag inventory and RLS impact list are not perfectly aligned. |
| Permission | Permission Matrix | Business Rules, Flags | ERD/RLS | Strong source. Some permissions remain Decision Required. |
| Communication | Communication Brokerage Security Design | Permission, Business, Workflow | ERD/RLS | Strong security source. Messaging storage strategy is unresolved. |
| ERD | ERD v1 | Architecture, Business, Permission, Communication | RLS, migration plan | Strong current data SOT. Migration strategy and some table choices remain unresolved. |
| RLS | RLS Design v1 | ERD v1, Permission | RLS SQL, tests | Strong current RLS SOT. Helper function implementation strategy remains unresolved. |
| Implementation audit | Supabase Health Audit | Existing Supabase state | Migration plan, tests | Confirms all public tables RLS-enabled, but migration metadata and role-based regression tests remain open. |

## 3. Terminology Conflicts

| Conflict | Older / Alternate Term | Current Preferred Term | Found In | Risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Company engine naming | Company Engine | Company Microsite Engine | User-facing examples and possible shorthand | P2 Medium | Use `Company Microsite Engine` for public company pages and microsite modules; use `Organization Engine` for company membership/ownership. |
| FDA engine naming | Thailand FDA Engine | Thailand FDA Service Engine | Informal shorthand | P2 Medium | Use `Thailand FDA Service Engine` consistently. |
| FDA schema group label | Thailand FDA | Thailand FDA Service Engine | ERD schema group uses short label | P3 Low | Accept short schema group label, but table docs should reference full engine name. |
| Role join table | `profile_roles` | `account_roles` | Workflow table candidates vs ERD/RLS | P1 High | Replace workflow candidate references during next doc sync. RLS must use `account_roles`. |
| Role application tables | `role_requests`, `role_approvals` | `role_applications`, `account_roles` | Workflow Standard vs ERD v1 | P1 High | Finalize role approval table naming before migration. |
| SELL table | `buy_sell_posts` | `sell_products` | Legacy notes vs ERD v1 | P1 High | Treat `buy_sell_posts` as deprecated/replace. New migration should use `sell_products`. |
| FDA application root | `thailand_fda_applications` | `fda_applications` | Legacy notes vs ERD v1 | P1 High | Treat `thailand_fda_applications` as deprecated/replace. New migration should use `fda_applications`. |
| FDA document table | `fda_documents` | `fda_application_documents` | Workflow Standard vs ERD v1 | P1 High | Update workflow candidate naming before SQL. |
| FDA quote table | `fda_quotations` | `fda_quotes` | Workflow Standard vs ERD v1 | P1 High | Update workflow candidate naming before SQL. |
| Message storage | `brokerage_case_messages` | Decision Required: separate table or reuse `conversations/messages` | Communication, ERD, RLS | P0 Critical | Decide before any Communication migration. |
| Account vs Profile | Profile as identity subject | Account as login identity; Role as permission subject | Architecture/Business/Permission/ERD | P1 High | Keep `profiles` as Supabase Auth profile table, but use Account language in policy docs. |
| Admin logs | `admin_logs`, `audit_events`, `audit_logs` | `audit_logs` plus domain logs if needed | Older design/audit references vs ERD/RLS | P2 Medium | Normalize audit table naming before Admin migration. |

## 4. Role / Permission Gaps

| Gap ID | Gap | Priority | Impact | Recommendation |
| --- | --- | --- | --- | --- |
| RPG-001 | `PROJECT_MASTER.md` and `TASK_MASTER.md` still show Permission Matrix, Communication patch, ERD, and RLS as pending. | P2 Medium | Team could follow stale task order and repeat completed docs. | Update master/task metadata after this report is accepted. |
| RPG-002 | Free Supplier product limit is intentionally unresolved. | P0 Critical | Product insert guards, membership benefits, UI limits, and RLS tests cannot be final. | Decide numeric free limit before product creation policy/migration. |
| RPG-003 | Free Supplier Proposal eligibility is unresolved. | P0 Critical | Trade Brokerage permissions and proposal insert policies cannot be final. | Decide whether Free can submit proposals after Admin Forward, and any quota. |
| RPG-004 | Premium Supplier analytics scope is unresolved. | P1 High | Analytics dashboards could accidentally expose Buyer PII or raw funnel events. | Define allowed aggregates and explicitly deny raw Buyer PII. |
| RPG-005 | Direct Contact Release conditions are unresolved. | P0 Critical | Supplier-Buyer communication exception cannot be safely enforced. | Define required case status, admin approval role, audit fields, and allowed release scope. |
| RPG-006 | Professor public application is OFF by default but not reconciled with final onboarding/admin route design. | P2 Medium | Signup and invitation implementation could diverge. | Keep admin invitation as MVP default; document public application as post-MVP or explicit flag-gated route. |
| RPG-007 | Buyer Direct Signup default is OFF, but implementation route behavior is not yet mapped to concrete guards. | P1 High | Buyer acquisition attribution and Agent hierarchy could be bypassed. | Define route-level and server-action guard before auth implementation. |
| RPG-008 | Student Reward public visibility remains unresolved. | P2 Medium | Student achievement UI could expose personal data or unfairly publicize rewards. | Decide public range, owner view, professor view, and admin view. |

## 5. ERD / RLS Gaps

| Gap ID | Gap | Priority | Impact | Recommendation |
| --- | --- | --- | --- | --- |
| ERG-001 | `brokerage_case_messages` separate table vs `conversations/messages` reuse is unresolved. | P0 Critical | Direct message blocking, migration path, and RLS helper complexity depend on this. | Choose storage strategy before Communication migration. |
| ERG-002 | Existing conversation migration strategy is unresolved. | P0 Critical | Existing Supplier-Buyer direct conversations could survive new policies or be misclassified. | Require manual/hybrid audit strategy before applying typed conversation migration. |
| ERG-003 | Buyer PII masked view or restricted projection is not designed. | P0 Critical | Supplier-facing Buy Request/Brokerage queries could leak Buyer email/phone/contact. | Design masked view/RPC/DTO projection before query/RLS work. |
| ERG-004 | Security definer helper scope is unresolved. | P1 High | Over-broad helpers can bypass RLS; under-scoped helpers can break legitimate role relations. | Classify helpers as definer/invoker and define fixed search_path rules. |
| ERG-005 | `account_roles` migration from any existing single-role/profile-role model is not planned. | P1 High | Multi-role Account rules cannot be enforced consistently. | Write migration mapping plan before role table migration. |
| ERG-006 | Supabase migration tracking is not aligned with standard CLI metadata. | P1 High | Local migrations may not reflect remote DB state. | Run a separate approved Supabase CLI link/list/repair task before DB migration. |
| ERG-007 | Public insert policies for analytics/showcase/activity tables need abuse controls. | P1 High | Spam, oversized payloads, or PII payloads could be inserted. | Define rate limit, payload validation, and PII exclusion strategy before analytics policies. |
| ERG-008 | Landing preview token RLS method is unresolved. | P2 Medium | Draft landing pages could be exposed or impossible to preview safely. | Choose token table policy, RPC, or signed route approach. |
| ERG-009 | Company Score model has tables but not calculation formula. | P2 Medium | Ranking/exposure automation cannot be trusted. | Keep manual/admin exposure for MVP until formula is approved. |

## 6. Workflow / State Machine Gaps

| Gap ID | Gap | Priority | Impact | Recommendation |
| --- | --- | --- | --- | --- |
| WFG-001 | Workflow Standard still lists old table candidates for role and FDA workflows. | P1 High | Migration author could implement deprecated names. | Add a follow-up doc sync task after this report. |
| WFG-002 | Direct Contact Release state is modeled as approval/action but not a dedicated state machine. | P0 Critical | Expiry, revoke, and release scope transitions may be inconsistent. | Add `contact_release_status` or equivalent state lifecycle before SQL. |
| WFG-003 | Supplier-Buyer brokerage states exist, but exact mapping to `brokerage_cases`, `proposals`, and `conversations` is not final. | P1 High | Server actions could update the wrong entity or skip Admin Review. | Create a state-to-table transition map before implementation. |
| WFG-004 | Feature flag behavior does not yet define workflow fallback when flags change. | P2 Medium | Turning flags on/off could strand records mid-workflow. | Define transition behavior for each restricted flag. |
| WFG-005 | Admin audit requirements are broad, but audit event taxonomy is not finalized. | P1 High | Approval/reject/publish/contact-release actions may not be consistently logged. | Define audit action names using `<Engine>.<Module>.<Action>`. |
| WFG-006 | Student Buyer acquisition activity is allowed, but Student-to-Buyer direct message is denied by default. | P2 Medium | Product and UI teams may confuse acquisition with messaging. | Keep acquisition as tracked activity/brokerage lead, not direct messaging, until explicitly approved. |

## 7. Business Rule Decision Required

| Decision ID | Decision | Current Direction | Blocks | Priority | Recommended Next Step |
| --- | --- | --- | --- | --- | --- |
| DR-SOT-001 | Free Supplier product limit | Limit required; number not set | Product create, Membership Benefit, RLS tests, Admin settings | P0 | Pick MVP number and where override is stored. |
| DR-SOT-002 | Free Supplier Proposal 가능 여부 | Premium allowed; Free limited/unclear | Proposal insert policy, Trade Brokerage UI, membership rules | P0 | Decide allow/deny/quota for Free after Admin Forward. |
| DR-SOT-003 | Premium Supplier analytics 범위 | Some analytics allowed; Buyer PII denied | Analytics RLS, dashboard queries | P1 | Define allowed aggregate fields and raw-data denial. |
| DR-SOT-004 | Direct Contact Release 조건 | Admin approval required; conditions unset | Communication RLS, Brokerage workflow | P0 | Define eligible case states, approver role, reason, audit, buyer consent if any. |
| DR-SOT-005 | Direct Contact Release expiry | 7/30/90/no default unresolved | `contact_release_approvals.expires_at`, can_send_message | P0 | Choose default expiry and renewal/revoke policy. |
| DR-SOT-006 | Buyer PII 공개 범위 | Minimal release; exact fields unresolved | Masked view, release scope, UI payloads | P0 | Define field-level scopes: message only, email, phone, contact person. |
| DR-SOT-007 | `brokerage_case_messages` 별도 테이블 여부 | Separate vs reuse unresolved | Communication ERD/RLS/migration | P0 | Decide storage pattern with RLS simplicity as key criterion. |
| DR-SOT-008 | `conversations/messages` 재사용 여부 | Reuse possible for MVP | Backward compatibility, can_send_message | P0 | Pair with DR-SOT-007; document final migration path. |
| DR-SOT-009 | Company Score 계산식 | Score separate from Badge; formula unset | Ranking, Exposure, Analytics | P2 | Keep manual exposure for MVP, define formula later. |
| DR-SOT-010 | Badge 자동 부여 조건 | Admin final approval; auto recommendation possible | Trust automation, audit | P2 | Start Admin-only grant/revoke, defer full auto grant. |
| DR-SOT-011 | Membership billing MVP 포함 여부 | Manual admin-granted premium possible | Membership table fields, payment integration | P1 | Decide manual-only MVP vs billing-ready metadata. |
| DR-SOT-012 | Existing tables migration strategy | Manual/auto/hybrid unresolved | All DB migration and RLS rollout | P0 | Require migration strategy doc before SQL. |
| DR-SOT-013 | Buyer Direct Signup default | Feature flag default false | Identity routes, Agent attribution | P1 | Keep OFF for MVP unless business changes. |
| DR-SOT-014 | Professor public application | Feature flag default false | Signup routes, Student privacy | P2 | Keep Admin invitation-first for MVP. |
| DR-SOT-015 | Student Reward public range | Admin approved reward, public scope unset | Student Growth UI, RLS | P2 | Define owner/professor/admin/public visibility. |
| DR-SOT-016 | Preview token RLS method | Token/RPC/signed route unresolved | Landing Builder preview | P2 | Decide during Landing Builder implementation plan. |

## 8. Security / Privacy Gaps

| Gap ID | Gap | Priority | Why It Matters | Required Fix Before Implementation |
| --- | --- | --- | --- | --- |
| SPG-001 | Supplier-Buyer direct messaging DB/RLS block is designed but not implemented. | P0 Critical | App-level checks are bypassable without DB/RLS enforcement. | Implement typed conversations and `can_send_message` only after storage decision. |
| SPG-002 | Buyer PII masked view/restricted projection is not finalized. | P0 Critical | Buyer email, phone, and contact person are platform assets and must not leak to Supplier. | Finalize field-level PII projection before Supplier-facing queries. |
| SPG-003 | Security definer helper boundary is unresolved. | P1 High | Helper functions can become hidden privilege escalation points. | Define helper ownership, search_path, input validation, boolean-only outputs. |
| SPG-004 | service role usage was hardened in code, but remaining usage needs regression monitoring. | P1 High | Future server actions could reintroduce fallback or client imports. | Keep search checks in quality checklist. |
| SPG-005 | Existing conversation migration is unresolved. | P0 Critical | Old direct Supplier-Buyer conversations may remain accessible. | Manual review or hybrid classification before migration. |
| SPG-006 | Role-based RLS regression tests are not written. | P1 High | Supplier/Buyer/Agent/Professor/Student/Admin access assumptions are unverified. | Add tests after RLS SQL design and before production migration. |
| SPG-007 | Public analytics insert abuse controls are not specified. | P1 High | Public insert endpoints can be abused and can carry PII payloads. | Define validation, size limits, rate limits, and metadata schema. |
| SPG-008 | Admin memo and audit log access are policy-defined but not test-mapped. | P1 High | Operational secrets could leak through joins or admin dashboards. | Include Admin memo/audit log denial tests for non-admin roles. |

## 9. UI / UX Gaps

| Gap ID | Gap | Priority | Impact | Recommendation |
| --- | --- | --- | --- | --- |
| UXG-001 | UI Design System alignment is pending after Source of Truth docs. | P2 Medium | Implementation may create inconsistent dashboard/admin patterns. | Write UI System implementation alignment before major UI work. |
| UXG-002 | Direct Contact Release UI states are not defined. | P1 High | Users may see contact/message buttons before DB allows them. | Define UI states: hidden, requestable, pending, released, expired, revoked. |
| UXG-003 | Supplier-facing Buyer PII masking display is not specified. | P1 High | UI could reveal empty fields inconsistently or imply hidden data exists. | Define masked labels and payload shape after PII policy. |
| UXG-004 | Premium analytics dashboard fields are not final. | P2 Medium | Dashboard scope may overpromise or expose too much. | Define aggregate-only MVP analytics sections. |
| UXG-005 | Badge display has rules but not full visual taxonomy for all badge types. | P3 Low | Trust UI may be inconsistent across Company/Product/Profile pages. | Defer until Trust/Badge implementation design. |
| UXG-006 | Master docs do not reflect current completed docs, which can confuse UI sequence. | P2 Medium | UI work may start from stale task dependencies. | Sync Project/Task Master after decisions are accepted. |

## 10. Implementation Blocking Issues

| Blocker ID | Blocking Issue | Blocks | Priority | Owner Decision Needed |
| --- | --- | --- | --- | --- |
| IB-001 | Existing tables migration strategy | Any DB migration | P0 | Manual/automated/hybrid mapping strategy |
| IB-002 | Supplier-Buyer messaging storage strategy | Communication migration, RLS SQL, server actions | P0 | Separate `brokerage_case_messages` vs reuse typed `conversations/messages` |
| IB-003 | Direct Contact Release conditions and expiry | Communication RLS, UI contact release, audit | P0 | Eligible states, release scope, default expiry |
| IB-004 | Buyer PII masked/restricted projection | Buy Request, Brokerage, Analytics, Dashboard | P0 | View/RPC/DTO and field-level scope |
| IB-005 | Free Supplier product/proposal limits | Product create, Proposal create, Membership UI | P0 | Numeric limit and Free proposal rule |
| IB-006 | `account_roles` migration and old role candidate cleanup | Identity/Role RLS | P1 | Final role table mapping and cleanup plan |
| IB-007 | Security definer helper policy | RLS SQL | P1 | Helper list and definer/invoker classification |
| IB-008 | Supabase migration metadata alignment | Safe migration rollout | P1 | CLI link/list/repair task approval |
| IB-009 | Role-based RLS regression test matrix | Production confidence | P1 | Test harness and role fixtures |

## 11. Recommended Fix Order

### P0: 구현 전 반드시 확정

1. Existing tables migration strategy.
2. Supplier-Buyer messaging storage strategy.
3. Direct Contact Release conditions, release scope, and expiry.
4. Buyer PII masked/restricted projection model.
5. Free Supplier product limit.
6. Free Supplier proposal eligibility.

### P1: ERD/RLS migration 전 확정

1. `account_roles` migration and role naming cleanup.
2. Security definer helper scope and `search_path` rule.
3. Supabase migration metadata alignment.
4. Role-based RLS regression test plan.
5. Admin audit event taxonomy.
6. Premium Supplier analytics allowed aggregate scope.
7. Membership billing MVP boundary.

### P2: MVP 구현 중 확정 가능

1. Company Score calculation formula.
2. Badge auto recommendation vs auto grant boundary.
3. Student Reward public visibility.
4. Buyer Direct Signup route default confirmation.
5. Professor public application default confirmation.
6. Landing preview token implementation method.
7. Feature flag behavior when toggled mid-workflow.

### P3: Post-MVP

1. Advanced Trust badge visual taxonomy.
2. Auto-ranking exposure.
3. Enterprise Supplier billing and contract automation.
4. Public API and multi-tenant expansion.
5. Advanced calendar/personal schedule model.

## 12. Next Action Proposal

Recommended next source-of-truth actions:

1. Create `docs/08-review/02-p0-decision-resolution.md` to resolve the six P0 decisions in one place.
2. After P0 decisions, update `PROJECT_MASTER.md` and `TASK_MASTER.md` so completed Permission/Communication/ERD/RLS docs are no longer marked pending.
3. Create an Existing Tables Migration Strategy document before any SQL migration.
4. Create a Buyer PII Projection Design document before writing Supplier-facing queries or RLS SQL.
5. Create a Communication RLS Migration Plan that finalizes typed conversations, `can_send_message`, and old conversation audit handling.
6. Create a Role-based RLS Regression Checklist before DB/RLS migration.

Codex implementation note:

- Do not write DB migration or RLS SQL until P0 decisions are resolved.
- Do not treat Feature Flags as permission bypasses.
- Do not expose Buyer PII through joins, DTOs, analytics payloads, or public insert metadata.
- Do not implement Supplier-Buyer direct messaging as a UI-only block; DB/RLS must enforce it.

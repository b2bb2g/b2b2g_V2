# Engine Sprint Plan

## 1. Sprint Method

B2BB2G V2 implementation proceeds by Engine.

The project is now moving from document-centered Source of Truth preparation into Engine Sprint Implementation.

Each Engine Sprint follows this order:

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

No Sprint should start from UI or page implementation before Scope, DB, RLS, and type boundaries are reviewed.

## 2. Sprint List

| Sprint | Engine | Primary Goal |
| --- | --- | --- |
| Sprint 1 | Identity Engine | Establish `account_roles` based multi-role implementation path. |
| Sprint 2A | Invitation Engine Policy Gate | Confirm Role signup/invitation policy for Supplier, Agent, Buyer, Professor, and Student before Organization query/action expansion. |
| Sprint 2B | Organization Engine | Define organization membership and relationship boundaries. |
| Sprint 3 | Company / Supplier Engine | Stabilize company, supplier profile, and supplier-owned content paths. |
| Sprint 4 | Marketplace Engine | Implement approved product and marketplace listing flows. |
| Sprint 5 | Buy Request Engine | Implement Buyer request flow without exposing Buyer PII. |
| Sprint 6 | Trade Brokerage Engine | Implement Admin Brokerage case and proposal workflow. |
| Sprint 7 | Communication Engine | Implement typed conversation/message rules with Supplier-Buyer direct denial. |
| Sprint 8 | Trust / Badge Engine | Implement badge, score, and trust signal workflow. |
| Sprint 9 | Supplier Membership Engine | Implement Free/Premium/Enterprise membership constraints. |
| Sprint 10 | Student Growth Engine | Implement Student showcase, reports, rewards, and growth tracking. |
| Sprint 11 | Event Engine | Implement event publishing and application workflow. |
| Sprint 12 | Thailand FDA Engine | Implement Thailand FDA application and admin review workflow. |
| Sprint 13 | Exposure / Landing Builder Engine | Implement landing builder, featured exposure, and publish controls. |
| Sprint 14 | Admin Control Engine | Implement central admin settings, approvals, audit, and overrides. |
| Sprint 15 | Analytics Engine | Implement analytics events, dashboards, and privacy-safe reporting. |

## 3. Sprint Definition of Done

Each Sprint is complete only when all applicable criteria are satisfied:

| DoD Item | Required |
| --- | --- |
| No conflict with Source of Truth documents | Yes |
| Existing code classified as Reuse / Refactor / Replace / Hold | Yes |
| `npm run typecheck` passes | Yes |
| `npm run lint` passes | Yes |
| RLS impact reviewed | Yes |
| PII exposure reviewed | Yes |
| Buyer PII not exposed to Supplier | Yes |
| Admin Audit requirement reviewed | Yes |
| GitHub push completed | Yes |
| Sprint output documented and frozen | Yes |

## 4. Sprint Blocking Rules

Implementation is blocked if any rule below is violated:

| Blocking Rule | Required Handling |
| --- | --- |
| Permission Matrix conflict | Stop implementation and write gap/decision report first. |
| ERD/RLS conflict | Stop implementation and resolve Source of Truth conflict first. |
| Buyer PII exposure possibility | Stop implementation until masked/restricted projection is confirmed. |
| Supplier-Buyer direct message structure | Forbidden unless Admin Brokerage or approved case-level release applies. |
| `service role` fallback | Forbidden. Use server-only admin boundary only where explicitly approved. |
| Client Component imports admin client | Forbidden. |
| UI Design System bypass | Forbidden. Follow UI Design System Engine and frozen UI standards. |
| Feature Flag weakens RLS | Forbidden. Feature Flags cannot override RLS. |
| Migration without backup discipline | Forbidden for production structural changes. |

## 5. Current Migration Status

| Migration | Production Status | Result | Implementation Impact |
| --- | --- | --- | --- |
| `001_snapshot_baseline.sql` | Applied | Success. No rows returned | Baseline marker is complete. |
| `002_role_compatibility.sql` | Applied | Success. No rows returned | `account_roles` and `role_applications` are available as additive structures. |

## 6. Current Sprint

Current Sprint: **Sprint 2 Invitation Engine Policy Gate / Organization Engine**.

Sprint 2 now prioritizes Invitation Engine policy alignment before Organization query/action expansion.

Next document:

```text
docs/09-sprints/11-sprint-2-invitation-engine-plan.md
```

## 7. Sprint Operating Notes

- Engine work must preserve the existing code unless it is classified for Refactor or Replace.
- Production DB migration state must be documented after every production apply.
- RLS policy SQL is not written inside feature implementation tasks unless the task explicitly scopes an RLS migration.
- Each Sprint must keep `PROJECT_MASTER.md` and `TASK_MASTER.md` current when phase, status, or major risk changes.

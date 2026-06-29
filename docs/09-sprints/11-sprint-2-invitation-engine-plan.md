# Sprint 2 Invitation Engine Plan

## 1. Purpose

This document defines the implementation plan for the Invitation Engine before any code, SQL migration, RLS policy, Supabase production change, or UI work begins.

The Invitation Engine must unify controlled signup paths for Supplier, Agent, Buyer, Professor, and Student while preserving the existing Source of Truth rules:

- Role access is based on `account_roles` and `role_applications`.
- Supplier-Buyer direct contact remains blocked by default.
- Buyer PII is never exposed to Supplier through invitation, public signup, approval, or membership tier.
- Student signup must be anchored to Professor invitation.
- Buyer signup is Agent invitation based by default.

## 2. Invitation Engine Scope

Included in this plan:

- Role signup policy for Supplier, Agent, Buyer, Professor, and Student.
- Invitation type taxonomy.
- Invitation data model candidates.
- Invitation token and QR URL security rules.
- Organization relation impact for Agent-Buyer, Professor-Student, and Company-Member relationships.
- Feature Flag impact.
- MVP task sequence before implementation.

Excluded from this plan:

- SQL migration authoring.
- Supabase production DB changes.
- RLS SQL authoring.
- UI implementation.
- Email delivery automation.
- QR image storage.
- Bulk invitation.
- Advanced campaign analytics.

## 3. Role Signup Policy Matrix

| Role | Admin Invitation | Public Self Signup | Public Application | Requires Approval | Requires Parent Link | Auto Organization Relation | Feature Flag |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Supplier | Yes | Yes | No | Yes, Admin Approval required | No | `company_members` candidate after signup/company setup; Company/Product publish approval remains separate | `supplier_invitation_enabled`, `supplier_public_signup_enabled`, `supplier_requires_admin_approval` |
| Agent | Yes | No | Yes | Yes, Admin Approval required | No | No immediate Buyer relation; approved Agent can issue Buyer invitation link/QR later | `agent_public_application_enabled` |
| Buyer | No by default; Admin-mediated exception can be decided later | Controlled by flag, default OFF | No | Policy configurable later | Agent link required by default | `agent_buyers` candidate when Agent invitation is accepted | `buyer_direct_signup_enabled` |
| Professor | Yes | No | Controlled by flag, default OFF | Yes, Admin Approval required | No | Professor profile candidate after approval | `professor_public_application_enabled` |
| Student | No by default | No | No | Professor link required; Admin review policy can be added later | Professor invitation link/QR required | `professor_students` candidate when Professor invitation is accepted | `student_signup_requires_professor_link` |

Policy notes:

- Supplier Admin Invitation and Supplier Public Self Signup both create a Supplier Role Application path.
- Supplier activation does not publish Company or Product records. Company/Product approval is separate.
- Supplier Free/Premium/Enterprise tier is assigned after Admin Approval and does not grant Buyer PII.
- Buyer Direct Signup is disabled by default. If enabled, Buyer role creation and approval policy must be explicitly defined before implementation.
- Student Public Self Signup is blocked.

## 4. Invitation Types

| Invitation Type | Created By | Accepted By | Target Role | Approval Behavior | Organization Relation Impact |
| --- | --- | --- | --- | --- | --- |
| `supplier_admin_invite` | Administrator | Supplier account | Supplier | Creates or links Supplier Role Application; Admin Approval required | `company_members` candidate after company setup/approval |
| `supplier_public_signup` | Public user | Supplier account | Supplier | Creates Supplier Role Application; Admin Approval required | `company_members` candidate after company setup/approval |
| `agent_admin_invite` | Administrator | Agent account | Agent | Creates or links Agent Role Application; Admin Approval required | None immediately |
| `agent_public_application` | Public user | Agent account | Agent | Creates Agent Role Application; Admin Approval required | None immediately |
| `buyer_agent_invite` | Approved Agent | Buyer account | Buyer | Buyer role policy configurable; Agent link is required by default | `agent_buyers` candidate |
| `buyer_direct_signup` | Public user | Buyer account | Buyer | Disabled by default; role creation policy must be decided when flag is enabled | No Agent relation unless assigned later |
| `professor_admin_invite` | Administrator | Professor account | Professor | Creates or links Professor Role Application; Admin Approval required | Professor profile candidate |
| `professor_public_application` | Public user | Professor account | Professor | Disabled by default; Admin Approval required if enabled | Professor profile candidate |
| `student_professor_invite` | Approved Professor | Student account | Student | Professor link required; Admin review can be added later | `professor_students` candidate |

## 5. Invitation Data Model Candidate

Candidate tables:

- `invitations`
- `invitation_tokens`
- `invitation_redemptions`
- `invitation_qr_codes` only if QR assets are stored; otherwise QR is generated from token URL at runtime

Candidate fields:

| Field | Purpose |
| --- | --- |
| `id` | Primary identifier. |
| `invitation_type` | One of the invitation type keys in this document. |
| `token_hash` | Hash of the invitation token; raw token must not be stored. |
| `invited_email` | Optional invited email boundary; if present, accepted account email should match. |
| `target_role_key` | Role that the invite/application targets. |
| `parent_account_id` | Parent Agent or Professor account when required. |
| `parent_role_key` | Parent role context such as `agent` or `professor`. |
| `target_company_id` | Optional company context for Supplier or Company-Member flows. |
| `target_agent_id` | Optional Agent profile/relation target. |
| `target_professor_id` | Optional Professor profile/relation target. |
| `status` | Invitation lifecycle status. |
| `expires_at` | Expiration timestamp. |
| `max_uses` | Maximum allowed redemptions. |
| `used_count` | Current redemption count. |
| `created_by` | Account that created the invitation. |
| `created_at` | Creation timestamp. |
| `accepted_at` | First accepted timestamp. |
| `revoked_at` | Revocation timestamp. |
| `role_application_id` | Optional link to generated `role_applications`. |
| `relation_candidate_status` | Optional status for deferred organization relation creation. |

Data model guardrails:

- Do not store raw invitation tokens.
- Do not grant active roles directly from token redemption unless the final policy explicitly allows it for that role.
- Do not create Buyer PII projections for Supplier invitation flows.
- Do not treat QR as a separate authority. QR only carries a token URL.

## 6. Invitation Status

| Status | Meaning |
| --- | --- |
| `draft` | Created but not usable yet. |
| `active` | Usable before expiry/revocation and within use limit. |
| `accepted` | Accepted by an account; relation/role approval may still be pending. |
| `expired` | Expired by time. |
| `revoked` | Manually revoked by authorized creator/admin. |
| `cancelled` | Cancelled before activation or by workflow decision. |

## 7. Signup Flow

### Supplier Admin Invite Flow

1. Administrator creates `supplier_admin_invite`.
2. System stores token hash and sends or exposes invitation URL.
3. Supplier accepts invitation and creates/signs into account.
4. Supplier Role Application is created or linked.
5. Admin Approval is required before Supplier privileges.
6. Company and Product public exposure require separate approvals.
7. Supplier still cannot access Buyer email, phone, or contact person.

### Supplier Public Signup Flow

1. Public user starts Supplier signup when `supplier_public_signup_enabled = true`.
2. Supplier account is created or linked.
3. Supplier Role Application is created with pending/submitted status.
4. Admin Approval is required before Supplier activation.
5. Free/Premium/Enterprise tier is assigned after Admin Approval.
6. Company and Product public exposure require separate approvals.
7. Buyer PII remains blocked.

### Agent Admin Invite Flow

1. Administrator creates `agent_admin_invite`.
2. Agent accepts invitation and creates/signs into account.
3. Agent Role Application is created or linked.
4. Admin Approval is required.
5. Approved Agent can issue Buyer invitation link/QR in a later task.

### Agent Public Application Flow

1. Public user applies when `agent_public_application_enabled = true`.
2. Agent Role Application is created.
3. Admin Approval is required.
4. No Buyer relation is created from public application alone.

### Buyer Agent Invite Flow

1. Approved Agent creates `buyer_agent_invite`.
2. Buyer accepts invitation and creates/signs into account.
3. Buyer role creation policy follows the Buyer approval decision.
4. `agent_buyers` relation candidate is created or queued after acceptance.
5. Agent can access only subordinate Buyer limited information.

### Buyer Direct Signup Flow

1. Public user can start Buyer signup only when `buyer_direct_signup_enabled = true`.
2. Buyer role creation and approval policy must be defined before enabling.
3. No Agent relation exists unless assigned later.
4. Public or Supplier access to Buyer PII remains blocked.

### Professor Admin Invite Flow

1. Administrator creates `professor_admin_invite`.
2. Professor accepts invitation and creates/signs into account.
3. Professor Role Application is created or linked.
4. Admin Approval is required.
5. Approved Professor can issue Student invitation link/QR in a later task.

### Student Professor Invite Flow

1. Approved Professor creates `student_professor_invite`.
2. Student accepts invitation and creates/signs into account.
3. Student role is created according to the final role application decision.
4. `professor_students` relation candidate is created or queued after acceptance.
5. Public self signup remains blocked.

## 8. Organization Relation Impact

| Flow | Relation Candidate | Timing Rule |
| --- | --- | --- |
| `buyer_agent_invite` accepted | `agent_buyers` | Candidate should be created or queued after token acceptance; final creation timing is a Decision Required item. |
| `student_professor_invite` accepted | `professor_students` | Candidate should be created or queued after token acceptance; final creation timing is a Decision Required item. |
| `supplier_admin_invite` accepted | `company_members` | Candidate depends on company setup and approval. |
| `supplier_public_signup` submitted | `company_members` | Candidate depends on company setup and approval. |
| `professor_admin_invite` accepted | Professor profile candidate | Admin Approval required before Professor capabilities. |
| `agent_admin_invite` or `agent_public_application` accepted/submitted | Agent profile candidate | Admin Approval required before Agent capabilities. |

Relation guardrails:

- `country_agents` is Agent market assignment, not Agent-Buyer authority.
- `referral_relations` is Buyer-Buyer referral, not Agent-Buyer authority.
- Agent-Buyer authority must come from `agent_buyers`.
- Professor-Student authority must come from `professor_students`.
- Company-Member authority must come from `company_members`.

## 9. Security Rules

- Token raw value must never be stored.
- Store `token_hash` only.
- Expired, revoked, cancelled, or overused tokens must not be accepted.
- Token lookup must resist enumeration by returning generic invalid/expired responses.
- If `invited_email` exists, accepted account email match validation is required or must be explicitly waived by Admin.
- `student_professor_invite` requires a Professor parent.
- `buyer_agent_invite` requires an Agent parent.
- Supplier invite/signup never grants Buyer PII access.
- Supplier invite/signup never bypasses Admin Brokerage rules.
- Service role fallback is prohibited.
- Client Components must not import admin/service-role clients.
- Invitation create, accept, revoke, and approval transitions require audit log coverage when audit integration is available.

## 10. Feature Flag Impact

| Feature Flag | Default | Impact |
| --- | --- | --- |
| `supplier_public_signup_enabled` | `true` | Enables Supplier Public Self Signup entry point. |
| `supplier_invitation_enabled` | `true` | Enables Admin-created Supplier invitation links. |
| `supplier_requires_admin_approval` | `true` | Forces Supplier Role Application Admin Approval. |
| `buyer_direct_signup_enabled` | `false` | Keeps Buyer direct signup disabled by default. |
| `agent_public_application_enabled` | `true` candidate | Enables Agent public application if confirmed by Feature Flags. |
| `professor_public_application_enabled` | `false` | Keeps Professor public application disabled by default. |
| `student_signup_requires_professor_link` | `true` | Blocks Student signup without Professor link/QR. |

Feature flags cannot override Permission Matrix, RLS, Buyer PII masking, Admin Approval, Company/Product approval, or Admin Brokerage.

## 11. MVP Implementation Order

| Task | Scope |
| --- | --- |
| Task 02 | Invitation repository audit. |
| Task 03 | Invitation migration spec. |
| Task 04 | Invitation types/helpers. |
| Task 05 | Invitation queries/actions. |
| Task 06 | Supplier public signup flow. |
| Task 07 | Admin invite flow. |
| Task 08 | Buyer/Student parent invite flow. |
| Task 09 | QR URL generation. |
| Task 10 | Tests. |
| Task 11 | Review/Freeze. |

## 12. Out of Scope

- Email delivery automation.
- QR image storage.
- Advanced campaign tracking.
- Public invite marketplace.
- Bulk invitation.
- Advanced analytics.
- Full Admin UI redesign.
- DB migration or RLS SQL from this document alone.

## 13. Decision Required

| Decision | Required Before | Notes |
| --- | --- | --- |
| Invitation token expiry default | Migration spec | Candidate defaults should differ for public application vs parent invitation if needed. |
| `max_uses` default | Migration spec | Parent links may be single-use or controlled multi-use; QR links need explicit max-use policy. |
| Whether `invited_email` is required | Queries/actions | Admin direct invite may require email; public signup/application cannot require pre-invited email. |
| QR image storage vs URL-only generation | QR URL generation task | MVP recommendation is URL-only generated QR unless storage is explicitly required. |
| Whether invitation acceptance auto-creates `role_applications` | Queries/actions | Supplier and Agent flows likely need role application creation; final rule must be fixed before implementation. |
| Whether relation is created immediately or after approval | Organization relation implementation | Buyer-Agent and Professor-Student candidate timing must be finalized before relation writes. |
| Buyer Direct Signup role policy when flag is ON | Buyer direct signup task | Default remains OFF until policy is written. |
| Supplier tier assignment timing | Supplier signup task | Free/Premium/Enterprise should be Admin-controlled after approval. |

## 14. Codex Notes

- This document is a plan gate, not implementation approval.
- Do not create SQL migration from this document alone.
- Do not create invitation tables before the migration spec is written.
- Do not implement signup routes before repository audit confirms current auth/signup dependencies.
- Do not expose Buyer PII in any Supplier invitation or signup path.
- Do not use `country_agents` or `referral_relations` as Agent-Buyer authority.
- The next Codex task should be Sprint 2 Invitation Engine Task 02 - Repository Audit.

## 15. Implementation Log

| Task | Status | Notes |
| --- | --- | --- |
| Task 04 - Token Helper and Types | Complete | Added pure Invitation type definitions, 256-bit URL-safe token generation, SHA-256 token hashing, timing-safe verification, invitation URL builder, expiry defaults, and token helper tests. No DB, RLS, migration, Supabase client, or UI code was added. |

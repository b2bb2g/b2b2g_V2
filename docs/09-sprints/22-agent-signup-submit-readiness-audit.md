# Agent Signup Submit Readiness Audit

## 1. Current Agent Signup UI State

The current Agent signup route is a public preparation screen only.

| Area | Current State | Submit Readiness |
| --- | --- | --- |
| Route | `/signup/agent` exists and renders the Agent signup start page. | Ready as a UI entry point only. |
| Form UI | `components/public/agent-signup-form.tsx` collects contact email, contact name, country/market, organization name, experience summary, target buyer market, website/profile URL, optional hidden invitation token, and terms agreement. | Not wired to a server action. |
| Submit button | Disabled. | Must remain disabled until the write flow is implemented. |
| Invitation token | Carried as query value and hidden input when present. | Raw token must never be displayed, logged, or stored. |
| DB writes | None. | Correct for the current Task 25 boundary. |
| Public copy | States Public Application or Admin Invitation support, Admin approval required, Buyer invitation links/QR after approval, subordinate Buyer scope only, and Buyer PII protection. | Aligned with Invitation Engine policy. |

Current UI intentionally does not:

- create Supabase Auth accounts
- create `profiles`
- create `role_applications`
- create `account_roles`
- create `agents`
- create `country_agents`
- create `agent_buyers`
- create Buyer invitations
- write `invitation_redemptions`
- write audit logs

## 2. Existing Agent Data Model

Current repository evidence shows that `agents` and `country_agents` exist in generated runtime types and migrations, while `agent_buyers` is still a future target relation.

| Table | Current Purpose | Current Evidence | Submit Relevance |
| --- | --- | --- | --- |
| `profiles` | Auth-linked account profile. Contains legacy `member_type_id`, email, phone, approval/activity status. | `types/database.ts` contains `profiles`. | Required before owner-bound `role_applications` insert. |
| `account_roles` | Approved/active account role authority. | Added by `002_role_compatibility.sql`; typed in `types/database.ts`. | Must not be written by Agent public submit. Admin approval only. |
| `role_applications` | Role request/review workflow. | Added by `002_role_compatibility.sql`; RLS owner insert/select added by 015; typed in `types/database.ts`. | Safest MVP write target. |
| `agents` | Agent profile row linked to `profiles.id` by `profile_id`, with `approval_status`. | `20260618133000_member_company_domain.sql`; `types/database.ts`. | Should be created after Admin approval or in a controlled Agent setup step, not during initial application submit. |
| `country_agents` | Agent market/country assignment, with `agent_id`, `country_id`, `status`. | `20260618133000_member_company_domain.sql`; `types/database.ts`; Admin selector uses it as market context. | Market assignment only. Must not grant Buyer access. |
| `agent_buyers` | Target Agent-Buyer subordinate relationship. | ERD/RLS/Organization plan mention it; not present in current `types/database.ts` generated tables. | Future target. Cannot be used as a live query/write table before migration. |
| `invitations` / `invitation_tokens` | Invitation Engine token and metadata. | Added by 012; Admin RLS by 013; public validation RPC by 014. | Can validate Agent invitation token safely, but submit must not write redemption yet. |

Key conclusion:

- `country_agents` is Agent market assignment.
- `country_agents` is not Agent-Buyer authority.
- `agent_buyers` must be the Agent-Buyer permission source, but it is not currently available as a live runtime table.

## 3. Existing Role Application Flow

Identity actions already provide a reusable owner-submit workflow.

| Function / Area | Current Behavior | Reuse Decision |
| --- | --- | --- |
| `requestRole(roleKey, reason?)` | Authenticated user creates a `submitted` `role_applications` row after checking active roles and open duplicate applications. | Reuse for Agent with Agent-specific validation and reason builder. |
| `getMyRoleApplications()` | Authenticated user reads own applications through server client and RLS. | Reuse. |
| `getPendingRoleApplicationsForAdmin()` | Admin reads pending role applications with minimal fields. | Reuse; Admin review UI may need Agent summary rendering later. |
| `approveRoleApplication(applicationId)` | Admin inserts/updates `account_roles` and marks application approved. | Reuse for role grant only; do not create `agents` / `country_agents` automatically until setup flow is designed. |
| `rejectRoleApplication(applicationId, reason)` | Admin marks application rejected. | Reuse. |
| `submitSupplierRoleApplication()` | Supplier-specific action builds a safe text reason and calls `requestRole("supplier", reason)`. | Strong reuse pattern for Agent submit. |

The 015 apply result confirms current `role_applications` columns:

- `account_id`
- `created_at`
- `deleted_at`
- `id`
- `reason`
- `rejection_reason`
- `requested_role_key`
- `reviewed_at`
- `reviewed_by`
- `status`
- `updated_at`

There is no structured `source`, `metadata`, or `invitation_id` column. Agent submit can only store safe application context in `reason` until a future metadata/pending application table is approved.

## 4. Agent Market Assignment vs Buyer Relation

This distinction is a P0 implementation guardrail.

| Concept | Correct Source | Explicit Non-Source | Permission Meaning |
| --- | --- | --- | --- |
| Agent market assignment | `country_agents` | `agent_buyers` | Agent is assigned to a country/market lane. |
| Agent-Buyer subordinate relation | future `agent_buyers` | `country_agents`, `referral_relations` | Agent can manage a specific Buyer within permitted limited scope. |
| Buyer invitation authority | approved `account_roles.role_key = agent` plus invitation policy | pending `role_applications`, `country_agents` alone | Approved Agent can create Buyer invitation links/QR in a later task. |
| Buyer PII visibility | future limited Agent-facing Buyer projection + `agent_buyers` relation | Buyer table direct select, market assignment, referral link | Agent can see only subordinate Buyer limited summary, not email/phone/contact by default. |

Required confirmations:

1. Agent public application can write only `role_applications`.
2. Admin Invitation based Agent application can use the same `role_applications` flow.
3. `agents` profile row creation should be deferred until Admin approval or controlled Agent setup.
4. `country_agents` must remain market assignment only.
5. `agent_buyers` is future target and cannot be used before migration.

## 5. Recommended Write Flow

Recommended MVP flow:

```text
Public /signup/agent
-> If unauthenticated: show sign-in / create-account guidance
-> After authentication: ensure profile exists
-> Validate Agent form input
-> Check agent_public_application_enabled or valid agent_admin_invite context
-> If invitation token exists: hash and validate through the public-safe validation RPC/server path
-> Create role_applications row only
   - account_id = auth.uid()
   - requested_role_key = agent
   - status = submitted
   - reason = safe Agent application summary
-> Do not create account_roles
-> Do not create agents
-> Do not create country_agents
-> Do not create agent_buyers
-> Do not create Buyer invitations
-> Do not write invitation_redemptions
-> Show pending Admin review state
-> Admin reviews and approves/rejects role_application
-> Approved role creates/updates account_roles
-> Agent profile / market assignment / Buyer invitation setup happen in later controlled flows
```

Safe `reason` shape for the next implementation:

```text
Agent application
Market: ...
Organization: ...
Experience summary: ...
Target buyer market: ...
Website/Profile: ...
Invitation: provided / none
```

Do not store:

- raw invitation token
- token hash
- invitation id
- token id
- invited email
- Buyer email
- Buyer phone
- Buyer contact person

## 6. RLS / Permission Risk

| Area | Current Finding | Risk | Recommendation |
| --- | --- | --- | --- |
| `role_applications` owner insert | 015 added authenticated owner insert/select policy and Admin select/update policy. | Usable for Agent submit if `account_id = auth.uid()` and `status = submitted`. | Reuse `requestRole("agent", reason)`. |
| `account_roles` write | Role grant is Admin-only through approval flow. | Self-grant would break Permission Matrix. | Agent submit must never write `account_roles`. |
| `agents` insert/update | Existing `agents` RLS includes owner/admin policies from member company RLS, but initial row creation timing is not finalized. | Creating Agent row before approval can grant profile surface too early or create partial state. | Defer `agents` row until approval/setup flow. |
| `country_agents` write | Existing table is country assignment. | If created during application submit, it could be mistaken as permission grant. | Defer market assignment to Admin setup after approval. |
| `agent_buyers` live query/write | Not present in current generated runtime types. | Any live write/query will fail or force incorrect fallback to `country_agents`. | Treat as future target until migration exists. |
| Invitation validation | 014 RPC accepts token hash and returns limited fields. | Submit action must not pass raw token to SQL or store it. | Hash first; only record `Invitation: provided/none` in `reason` unless future source metadata exists. |
| Buyer invitation generation | Business rules allow approved Agent to issue Buyer links/QR. | Pending Agent could invite Buyers if action checks only `role_applications`. | Gate future Buyer invite creation on approved `account_roles` and optional `agents.approval_status`. |

## 7. Buyer PII / Security Risk

| Risk | Status | Required Guard |
| --- | --- | --- |
| Buyer PII in Agent application | Current Agent form has no Buyer query or Buyer fields. | Keep submit action free of Buyer table joins/selects. |
| Agent viewing non-subordinate Buyers | `agent_buyers` is not live yet. | Until `agent_buyers` exists, Agent-facing Buyer list should remain blocked/empty. |
| `country_agents` overreach | `country_agents` can be confused with Buyer authority. | Never use it to grant Buyer detail access. |
| Pending Agent creates Buyer invitations | Business rule forbids Agent functions before Admin approval. | Buyer invite action must require approved Agent role. |
| Raw token exposure | Agent UI carries token hidden only. | Do not log, render, store, or return raw token. |
| Service role fallback | Forbidden by P0/P1 policy. | Use server client + RLS only; fail clearly if RLS blocks. |
| Admin review data exposure | Agent reason can contain business context. | Keep full reason Admin-only and owner-only. |

Buyer PII risk is low for the recommended MVP submit because it writes only `role_applications` and performs no Buyer reads. Risk becomes high if the next task attempts to create Buyer invitations, inspect Buyer records, or treat `country_agents` as a Buyer access relation.

## 8. Implementation Options

| Option | Description | Pros | Cons | Verdict |
| --- | --- | --- | --- | --- |
| A. Authenticated Agent role application only | Logged-in user submits Agent application via `role_applications`; no Agent/profile/market/Buyer writes. | Lowest risk, reuses Supplier submit and 015 RLS, preserves approval gate. | Agent form context stored as text until structured metadata exists. | Recommended MVP. |
| B. One-step public Agent signup creates account and application | Public form creates auth account and role application in one action. | Smooth UX. | Larger auth/profile/RLS coupling, partial failure risk, no current password/account fields in Agent form. | Hold. |
| C. Create `agents` row before approval | Submit creates pending Agent profile row immediately. | Allows admin to review Agent profile separately. | Approval boundary unclear; may require RLS and lifecycle changes. | Hold. |
| D. Create `country_agents` during submit | Treat selected market as a pending assignment. | Captures market intent. | Confuses market assignment with approval and permission; needs Admin workflow. | Reject for MVP submit. |
| E. Generate Buyer invitation capability after submit | Pending Agent gets Buyer invitation link/QR. | Fast network growth. | Directly violates BR-AGENT-003. | Reject. |
| F. Queue `agent_buyers` relation during Agent submit | Create future Buyer relation candidate before buyer exists. | None for current flow. | `agent_buyers` is not live; no Buyer context. | Reject. |

## 9. Recommended MVP Option

Use Option A.

MVP submit rules:

1. Unauthenticated users see sign-in/create-account guidance.
2. Authenticated users can submit Agent application only.
3. Submit action writes only to `role_applications`.
4. Use `requestRole("agent", reason)` or a small `submitAgentRoleApplication()` wrapper mirroring Supplier submit.
5. Duplicate prevention relies on `requestRole` active role/open application checks.
6. Admin Invitation and Public Application both become Agent `role_applications` with safe source text only.
7. `agents`, `country_agents`, and `agent_buyers` remain untouched.
8. Buyer invitation generation remains disabled until approved Agent role exists.
9. Buyer PII is never selected or stored.

Recommended next action implementation shape:

| File | Action |
| --- | --- |
| `lib/actions/agent-signup.ts` | Add form validation and `submitAgentRoleApplication()` wrapper around `requestRole("agent", reason)`. |
| `components/public/agent-signup-form.tsx` | Add authenticated submit UX, mirroring Supplier form patterns. |
| `app/(public)/signup/agent/page.tsx` | Pass current user/auth state if needed, without service role. |
| `lib/i18n/translation.ts` | Add submit/auth/success/error keys. |
| `TASK_MASTER.md` | Record Task 27 completion after implementation. |

## 10. Blocking Issues

| Issue | Priority | Blocking Scope | Recommendation |
| --- | --- | --- | --- |
| Profile existence path | P0 | Owner insert requires `role_applications.account_id = auth.uid()` and profile FK. | Reuse the same assumption as Supplier submit; if user lacks profile, return sign-in/profile setup guidance rather than service-role fallback. |
| Agent source metadata | P1 | `role_applications` has only `reason`. | Store safe text temporarily or design `role_application_sources` / metadata column later. |
| Agent profile creation timing | P1 | `agents` row lifecycle after approval is not finalized. | Defer to Agent post-approval setup task. |
| Market assignment timing | P1 | `country_agents` should be Admin-controlled assignment, not application submit write. | Defer to Admin Agent setup. |
| `agent_buyers` missing | P0 for Buyer relation features | Cannot implement subordinate Buyer access or Buyer invitation relation writes. | Write migration/spec before Agent-Buyer relation implementation. |
| Buyer invitation gating | P0 for future invite task | Pending Agent must not issue Buyer invitations. | Check approved `account_roles` and future Agent status before create invitation. |
| Invitation redemption | P2 | Agent submit should not write `invitation_redemptions` yet. | Keep deferred until atomic acceptance/redemption workflow exists. |
| Audit integration | P2 | Role application submit should be auditable. | Add audit in later Admin/Audit sprint. |

## 11. Next Codex Task

Recommended next task:

**Sprint 2 Invitation Engine Task 27 - Agent Role Application Submit**

Scope recommendation:

- implement `submitAgentRoleApplication()` as authenticated-only
- insert `role_applications` only through `requestRole("agent", reason)`
- unauthenticated users see sign-in/create-account guidance
- no `account_roles`, `agents`, `country_agents`, `agent_buyers`, Buyer invitation, or `invitation_redemptions` writes
- no Buyer PII select
- no service role fallback
- raw invitation token is never logged, displayed, or stored

Validation required for Task 27:

```text
npm test
npm run typecheck
npm run lint
git diff --check
createSupabaseAdminClient app/components import check
```

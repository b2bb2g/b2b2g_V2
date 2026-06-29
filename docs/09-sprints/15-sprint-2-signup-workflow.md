# Sprint 2 Signup Workflow

## 1. Purpose

This document connects the Invitation Engine to the actual signup workflows before query/action implementation.

It defines the required workflow contract for Supplier, Agent, Buyer, Professor, and Student onboarding.

This document does not:

- implement UI
- add SQL migration
- modify Supabase production DB
- write RLS SQL
- implement query/action code
- change existing signup/referral code

## 2. Workflow Principles

| Principle | Rule |
| --- | --- |
| Role-based access | Signup creates or links an Account, then creates Role Application or role relation state. It does not grant broad privileges directly. |
| Invitation token safety | Raw invitation tokens are validated from URL/runtime only and must never be stored. DB stores token hash only. |
| Supplier approval separation | Supplier Role Approval, Company Approval, Product Approval, and Membership assignment are separate gates. |
| Buyer PII protection | Supplier signup, invitation, approval, or membership never grants Buyer email, phone, or contact person access. |
| Parent binding | Buyer Agent Invitation creates an Agent Binding candidate. Student Professor Invitation creates a Professor Binding candidate. |
| Feature flag enforcement | Feature flags open or close entry points, but do not bypass Permission Matrix, RLS, approval, or audit requirements. |
| Audit first | Invitation create, accept, revoke, role application, approval, rejection, relation binding, membership assignment, and dashboard activation are audit candidates. |

## 3. Shared Signup State Contract

The workflows below use these common states.

| State | Meaning |
| --- | --- |
| `account_created` | Supabase Auth account/profile exists or was linked. |
| `invitation_validated` | Invitation token/hash/status/expiry/use limit passed validation. |
| `role_application_submitted` | `role_applications` row exists and awaits review. |
| `role_approved` | Admin approved role application and `account_roles` can become active/approved. |
| `organization_binding_pending` | Company/Agent/Professor relation candidate exists but may need approval or final binding. |
| `organization_binding_active` | Company/Agent/Professor relation is valid for authorization. |
| `membership_pending` | Supplier tier/plan not assigned or not active. |
| `membership_active` | Supplier Free/Premium/Enterprise membership is assigned by Admin policy. |
| `dashboard_pending` | Account can access pending dashboard state only. |
| `dashboard_active` | Account can access role dashboard within Permission Matrix limits. |

## 4. Supplier Signup Workflow

Public Supplier signup is allowed by default, but it does not activate Supplier privileges immediately.

Detailed Supplier path:

```text
Supplier Public Signup
-> Account / Profile
-> Supplier Role Application
-> Admin Approval
-> Company Setup
-> Company Approval
-> Membership Assignment
-> Supplier Dashboard
```

| Step | Workflow Rule |
| --- | --- |
| Trigger | Public user starts Supplier signup from a public signup entry point. |
| Validation | Validate account identity, normalized email, required Supplier onboarding fields, duplicate pending Supplier role application, existing active Supplier role, spam/rate limit, and terms acceptance. |
| Feature Flag | `supplier_public_signup_enabled = true` is required. `supplier_requires_admin_approval = true` must remain enforced. |
| Invitation Validation | No admin-issued token is required. The workflow may create a `supplier_public_signup` invitation/application context for tracking, but raw token is not required for the public form. |
| Role Application | Create or reuse a submitted Supplier `role_applications` row. Do not create active Supplier role directly. |
| Organization Binding | Create a company setup candidate only after account/profile exists. `company_members` binding remains pending until company ownership and company approval are reviewed. |
| Approval | Admin must approve Supplier Role Application before Supplier features activate. Company Approval and Product Approval are separate approvals after role approval. |
| Membership | Admin assigns Free/Premium/Enterprise after Supplier approval. Default can be Free, but final tier is Admin-controlled. Membership does not grant Buyer PII. |
| Dashboard Redirect | Before approval: pending Supplier onboarding dashboard. After role approval but before company approval: company setup/review dashboard. After company approval and membership assignment: Supplier dashboard with permission-limited access. |
| Failure Case | Block if flag is OFF, duplicate submitted application exists, active Supplier role exists, validation fails, rate limit triggers, or admin rejects. Failure response must not reveal unrelated account existence. |
| Audit | Log signup attempt, role application create, duplicate block, approval/rejection, company approval transition, membership assignment, and suspicious/rate-limited attempts. |

Supplier activation gates:

1. Supplier Role Application approved.
2. `account_roles` contains active/approved Supplier role.
3. Supplier profile exists or is queued.
4. Company membership is created or confirmed.
5. Company record is approved before public company page exposure.
6. Product records require separate approval before public product exposure.
7. Membership tier is assigned by Admin or controlled system policy.

Supplier explicit denies:

- No Buyer email/phone/contact person access.
- No Supplier-Buyer direct conversation creation.
- No public Company/Product exposure before approval.
- No automatic Premium/Enterprise tier from public signup.
- No Admin Brokerage bypass.

## 5. Supplier Invitation Workflow

Supplier invitation is Admin-created and converges into the same approval pipeline as public signup.

| Step | Workflow Rule |
| --- | --- |
| Trigger | Administrator creates `supplier_admin_invite` invitation link for a Supplier. |
| Validation | Validate Administrator permission, optional invited email normalization, target role `supplier`, invitation expiry, max use, and no duplicate active invitation abuse. |
| Feature Flag | `supplier_invitation_enabled = true` is required. `supplier_requires_admin_approval = true` remains required. |
| Invitation Validation | User accepts URL token. Hash raw token, find active `invitation_tokens.token_hash`, validate invitation type, expiry, revocation, deleted state, use count, and invited email match if present. |
| Role Application | Create or link Supplier Role Application with source `supplier_admin_invite`. Do not grant active Supplier role at redemption time. |
| Organization Binding | Optional company context may be attached if `company_id` exists. Otherwise Supplier proceeds to company setup after account creation. `company_members` remains pending until verified. |
| Approval | Admin Approval is still required even if Admin created the invite. Invitation is not approval. |
| Membership | Membership tier is assigned after role approval. Admin may preselect intended tier, but actual membership activation happens after approval. |
| Dashboard Redirect | After token acceptance: pending Supplier onboarding dashboard. After approval/company/membership gates: Supplier dashboard. |
| Failure Case | Block if token invalid, expired, revoked, overused, wrong invitation type, email mismatch, flag OFF, role already active, or application rejected. |
| Audit | Log invitation create, token issue, token accept, invalid token attempt if suspicious, role application link/create, approval/rejection, and membership assignment. |

## 6. Supplier Approval Workflow

Supplier approval is the gate that turns a pending Supplier applicant into an approved Supplier role. It still does not publish Company/Product records by itself.

| Step | Workflow Rule |
| --- | --- |
| Trigger | Administrator opens submitted Supplier Role Application from approval queue. |
| Validation | Validate admin role, application status `submitted` or `under_review`, account/profile existence, duplicate active role, company setup status if available, compliance notes, and membership intended tier. |
| Feature Flag | `supplier_requires_admin_approval = true` is mandatory. Membership-related flags such as `premium_supplier_enabled` and `enterprise_supplier_enabled` determine tier options only. |
| Invitation Validation | If the application came from invitation, verify linked invitation/redemption was valid and not revoked. Public signup applications use signup context instead. |
| Role Application | Update Role Application to `approved` or `rejected`. On approval, insert or restore active/approved Supplier `account_roles`. |
| Organization Binding | Confirm or create pending company ownership/member binding. Company public status remains separate until Company Approval. |
| Approval | Supplier Role Approval grants Supplier dashboard capability within limits. Company Approval and Product Approval remain separate public exposure gates. |
| Membership | Assign Free/Premium/Enterprise after approval. Free is the conservative default if no tier decision exists. Premium/Enterprise require explicit Admin decision or billing/contract policy. |
| Dashboard Redirect | Approved Supplier lands on Supplier dashboard. If company is not approved, redirect to company setup/review tasks instead of public exposure tools. |
| Failure Case | Reject if application is stale, duplicate role exists with conflict, account suspended, company verification fails, admin permission fails, or required documents are missing. |
| Audit | Log review start, approval, rejection reason, account role grant, membership assignment, company binding decision, and any Admin override. |

Approval sequence:

```text
Role Application Review
-> Supplier Role Approval
-> account_roles active/approved
-> Supplier Profile / Company Member Binding
-> Company Approval
-> Membership Assignment
-> Dashboard Active
```

## 7. Agent Application Workflow

Agent public application is allowed by feature flag and requires Admin Approval before any Buyer invitation capability.

| Step | Workflow Rule |
| --- | --- |
| Trigger | Public user or authenticated Account submits Agent application. |
| Validation | Validate identity, normalized email, duplicate pending Agent application, existing Agent role, market/country intent if collected, and rate limit. |
| Feature Flag | `agent_public_application_enabled = true` is required. |
| Invitation Validation | No admin token is required for public application. If a pseudo-invitation context is used, it must be type `agent_public_application`. |
| Role Application | Create or reuse submitted Agent Role Application. Do not activate Agent role directly. |
| Organization Binding | No Buyer relation is created from public application. Agent market assignment such as `country_agents` is separate and does not equal Agent-Buyer binding. |
| Approval | Admin Approval is required before Agent features, Buyer invitation link creation, or Agent-Buyer management. |
| Membership | Not applicable. Agent has no Supplier membership. |
| Dashboard Redirect | Before approval: pending Agent application dashboard. After approval: Agent dashboard with no Buyer list until Buyer bindings exist. |
| Failure Case | Block if flag OFF, duplicate pending application, active Agent role exists, validation fails, or Admin rejects. |
| Audit | Log application submit, duplicate block, review, approval/rejection, and later Agent market assignment if used. |

## 8. Agent Invitation Workflow

Admin can invite an Agent. The invite still produces an application and requires approval.

| Step | Workflow Rule |
| --- | --- |
| Trigger | Administrator creates `agent_admin_invite`. |
| Validation | Validate Administrator permission, target role `agent`, optional invited email, expiry, max use, and no conflicting active role. |
| Feature Flag | Agent invitation is Admin-controlled. If a future `agent_invitation_enabled` flag is introduced, it must be checked here. |
| Invitation Validation | Accepting user validates token hash, invitation type `agent_admin_invite`, expiry, revocation, use count, and invited email if present. |
| Role Application | Create or link Agent Role Application. Do not activate Agent role from invitation redemption alone. |
| Organization Binding | Agent profile candidate can be created after account link. No Buyer binding is created here. |
| Approval | Admin Approval required before Agent dashboard capabilities and Buyer invitation link generation. |
| Membership | Not applicable. |
| Dashboard Redirect | Token accepted: pending Agent onboarding. Approved: Agent dashboard. |
| Failure Case | Block invalid/expired/revoked/overused token, wrong email, duplicate role, suspended account, or rejected application. |
| Audit | Log admin invite create, token issue, token accept/fail, role application create/link, approval/rejection. |

## 9. Buyer Invitation Workflow

Buyer signup is Agent invitation based by default and must create Agent Binding context.

| Step | Workflow Rule |
| --- | --- |
| Trigger | Approved Agent creates `buyer_agent_invite`, and Buyer accepts the invitation URL or QR URL. |
| Validation | Validate inviting Agent has active/approved Agent role, invitation type `buyer_agent_invite`, Agent parent context, optional invited email, expiry, revocation, use count, and account identity. |
| Feature Flag | Agent invite is the default Buyer path. `buyer_direct_signup_enabled` is not required for Agent invitation. |
| Invitation Validation | Hash raw token, find `invitation_tokens.token_hash`, validate invitation row has `parent_role_key = 'agent'`, `agent_id`, and `parent_account_id`. |
| Role Application | Buyer role may be created or application submitted according to final Buyer approval policy. Until that policy is finalized, create Buyer onboarding state without exposing Buyer PII outside Owner/Admin/authorized Agent limits. |
| Organization Binding | Create or queue `agent_buyers` binding candidate. Agent Binding becomes active only after relation validation/approval policy passes. |
| Approval | Buyer approval policy is configurable later. Agent-Buyer binding may require Admin review depending on final Organization Engine policy. |
| Membership | Not applicable. |
| Dashboard Redirect | Buyer lands on Buyer onboarding/dashboard. If Agent Binding is pending, show pending relation state. If active, Buyer dashboard recognizes assigned Agent. |
| Failure Case | Block if inviter is not approved Agent, token invalid/expired/revoked/overused, parent context missing, wrong invitation type, or email mismatch. |
| Audit | Log invite create, token accept/fail, Buyer account link, Buyer role creation/application, Agent Binding candidate creation, binding approval/activation. |

Agent Binding rules:

- Agent-Buyer authority must come from `agent_buyers`.
- `country_agents` is market assignment only.
- `referral_relations` is Buyer-Buyer referral only.
- Agent can view only subordinate Buyer limited information after binding is valid.

## 10. Buyer Direct Signup Workflow

Buyer direct signup is disabled by default and must remain controlled by feature flag.

| Step | Workflow Rule |
| --- | --- |
| Trigger | Public user starts Buyer direct signup without Agent invitation. |
| Validation | Validate feature flag, account identity, duplicate Buyer role/application, anti-spam/rate limit, and Buyer profile requirements. |
| Feature Flag | `buyer_direct_signup_enabled = true` is required. Default is `false`. |
| Invitation Validation | No Agent invitation token is present. The workflow may create `buyer_direct_signup` tracking context, but it must not imply Agent Binding. |
| Role Application | Buyer role creation/application policy is Decision Required before enabling the flag. Conservative default is submitted/pending role application or limited Buyer onboarding. |
| Organization Binding | No Agent Binding is created. Buyer may be assigned later by Admin or a separate approved flow. |
| Approval | Admin Approval policy is configurable and must be fixed before enabling production direct signup. |
| Membership | Not applicable. |
| Dashboard Redirect | If enabled and accepted: Buyer onboarding/dashboard without Agent relation. If approval pending: pending dashboard. |
| Failure Case | Block when flag OFF, duplicate active Buyer role exists, validation fails, or approval policy is not configured. |
| Audit | Log direct signup attempt, flag-blocked attempts, role application/create, approval/rejection, and later Agent assignment if any. |

## 11. Professor Invitation Workflow

Professor onboarding is Admin Invitation centered. Public Professor application is OFF by default.

| Step | Workflow Rule |
| --- | --- |
| Trigger | Administrator creates `professor_admin_invite`. |
| Validation | Validate Administrator permission, target role `professor`, optional invited email, expiry, max use, and duplicate active Professor role/application. |
| Feature Flag | Admin invitation is allowed. `professor_public_application_enabled = false` keeps public application closed by default. |
| Invitation Validation | Accepting user validates token hash, invitation type `professor_admin_invite`, expiry, revocation, use count, and invited email if present. |
| Role Application | Create or link Professor Role Application. Do not activate Professor role from token redemption alone. |
| Organization Binding | Professor profile candidate can be created after account link. No Student binding is created from Professor invite. |
| Approval | Admin Approval is required before Professor dashboard and Student invitation link/QR capabilities. |
| Membership | Not applicable. |
| Dashboard Redirect | Token accepted: pending Professor onboarding. Approved: Professor dashboard with ability to create Student invitation only after approval. |
| Failure Case | Block invalid/expired/revoked/overused token, wrong email, duplicate role, suspended account, or rejected application. |
| Audit | Log invite create, token issue, token accept/fail, role application create/link, approval/rejection. |

## 12. Student Invitation Workflow

Student signup requires Professor Invitation Link or QR and creates Professor Binding context.

| Step | Workflow Rule |
| --- | --- |
| Trigger | Approved Professor creates `student_professor_invite`, and Student accepts the invitation URL or QR URL. |
| Validation | Validate Professor has active/approved Professor role, invitation type `student_professor_invite`, Professor parent context, expiry, revocation, use count, optional invited email, and Student profile requirements. |
| Feature Flag | `student_signup_requires_professor_link = true` is required. Student public self signup is not allowed. |
| Invitation Validation | Hash raw token, find `invitation_tokens.token_hash`, validate invitation row has `parent_role_key = 'professor'`, `professor_id`, and `parent_account_id`. |
| Role Application | Student role can be created or queued according to final Student approval policy, but must remain bound to Professor invitation context. |
| Organization Binding | Create or queue `professor_students` binding candidate. Professor Binding becomes active only after relation validation/approval policy passes. |
| Approval | Admin review may be added later. Professor-Student relationship must be valid before Professor can view Student PII. |
| Membership | Not applicable. Student has no Supplier membership. |
| Dashboard Redirect | Student lands on Student onboarding/dashboard. If Professor Binding is pending, show pending relationship state. If active, Student dashboard recognizes assigned Professor. |
| Failure Case | Block if no Professor token, token invalid/expired/revoked/overused, Professor not approved, parent context missing, wrong invitation type, or email mismatch. |
| Audit | Log invite create, token accept/fail, Student account link, Student role create/application, Professor Binding candidate creation, binding approval/activation. |

Professor Binding rules:

- Professor-Student authority must come from `professor_students`.
- Student public self signup remains blocked.
- Professor can view full subordinate Student PII only after valid binding.
- Other Professors cannot view the Student.

## 13. Workflow Failure Response Rules

| Failure Type | Response Rule |
| --- | --- |
| Invalid token | Return generic invalid/expired response. Do not reveal whether token, email, or account exists. |
| Expired token | Return generic invalid/expired response and audit if repeated. |
| Revoked token | Return generic invalid/expired response. |
| Overused token | Return generic invalid/expired response. |
| Feature flag OFF | Return unavailable workflow response. Do not create role/application. |
| Duplicate pending application | Return pending application state to owner only. Do not reveal to other users. |
| Existing active role | Redirect authenticated owner to role/dashboard context. Do not create duplicates. |
| Parent binding missing | Block Buyer/Student invitation acceptance. |
| Approval rejected | Redirect owner to rejected/pending support state with allowed resubmission rules. |

## 14. Audit Event Candidates

| Event | Required Data |
| --- | --- |
| invitation_created | actor, invitation_type, target_role_key, parent context, expiry, max_uses |
| invitation_token_issued | actor, invitation_id, token_id, expires_at; never raw token |
| invitation_accept_attempt | token hash lookup result category, invitation_type if known, requester account if known |
| invitation_accepted | invitation_id, token_id, redeemed_by, redeemed_role_key |
| role_application_created | account_id, requested_role_key, source invitation/application context |
| role_application_reviewed | reviewer, status, reason/rejection_reason |
| account_role_granted | account_id, role_key, approved_by |
| organization_binding_candidate_created | binding type, parent id, child id, source invitation |
| organization_binding_activated | binding type, approved_by or system policy |
| supplier_membership_assigned | supplier/account, tier, assigned_by, reason |
| company_approval_changed | company_id, previous status, new status, reviewer |
| failed_security_attempt | generic reason category, hashed token if available, IP/rate limit metadata where allowed |

## 15. Implementation Notes for Task 07

Task 07 Queries/Actions should use this document as the workflow contract.

Allowed next implementation work:

- invitation validation function contracts
- role application creation/linking actions
- Supplier signup action contract
- Supplier invitation acceptance action contract
- Agent/Professor invitation acceptance action contract
- Buyer Agent Binding candidate contract
- Student Professor Binding candidate contract
- audit TODO hooks

Still blocked:

- UI implementation
- additional DB migration
- Supabase production mutation
- RLS SQL
- service role fallback
- Buyer PII exposure to Supplier
- direct Supplier-Buyer messaging

## 16. Decision Required

| Decision | Blocks |
| --- | --- |
| Whether public signup flows create `invitations` rows or only role applications with source metadata | Supplier/Agent/Buyer direct signup action design |
| Buyer direct signup approval policy when `buyer_direct_signup_enabled` is ON | Buyer Direct Signup implementation |
| Whether Buyer role is auto-created after Agent invitation or submitted for approval | Buyer Invitation action |
| Whether Student role is auto-created after Professor invitation or submitted for approval | Student Invitation action |
| Whether Agent-Buyer binding activates immediately or after Admin review | Buyer Invitation action and RLS |
| Whether Professor-Student binding activates immediately or after Admin review | Student Invitation action and RLS |
| Supplier default membership tier after approval | Supplier Approval action |
| Company approval required fields | Supplier company onboarding |

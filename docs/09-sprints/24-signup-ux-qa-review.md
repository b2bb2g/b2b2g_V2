# Signup UX QA Review

## 1. Executive Summary

This review covers the current Invitation Engine signup UX across public invitation acceptance, role-specific signup start pages, Admin invitation management, Admin role application review, and dashboard onboarding placeholders.

Scope is document-only. No code, UI, database, RLS, or Supabase production changes were made.

Overall finding: the current signup UX is safe for the current implementation stage because Buyer/Student public flows remain non-writing skeletons, Supplier/Agent/Professor submit paths write only `role_applications`, and public invitation validation returns limited information through the validation RPC. No P0 issue was found in the current disabled/skeleton state.

Main gaps before enabling the next signup steps are P1:

- Buyer and Student signup start pages do not validate invitation type before showing an invitation-ready state.
- Invitation Accept can route valid but policy-disabled invitation types such as `buyer_direct_signup` and `professor_public_application` to start pages if such tokens exist.
- Admin Role Applications has rich Supplier review UX, but Agent and Professor applications still depend mostly on raw reason text.
- Dashboard onboarding placeholders exist for Supplier, Agent, and Professor, but not yet for Buyer or Student.
- Token handling is safe from DB storage and visible rendering, but raw token remains in the URL query and hidden form fields until the redemption flow is designed.

## 2. Route Coverage

| Route | Current UX State | Write Enabled | Policy Match | QA Notes |
| --- | --- | --- | --- | --- |
| `/signup/invitation` | Public Accept Page with validation RPC, role-specific copy, process/security sections, and sign-in link | No signup/redemption write | Mostly matches | Uses `validateInvitationTokenForPublic`; no PII or internal IDs displayed. |
| `/signup/supplier` | Signup start plus Supplier form | Yes, `role_applications` only when authenticated | Matches | Public self signup is supported. Company/product creation remains deferred. |
| `/signup/agent` | Signup start plus Agent form | Yes, `role_applications` only when authenticated | Matches | Public application and Admin invitation both converge into role application. |
| `/signup/buyer` | Signup start plus Buyer form skeleton | No | Matches default OFF state | Shows direct signup OFF and keeps submit disabled. Needs invite validation before submit is enabled. |
| `/signup/professor` | Signup start plus Professor form | Yes, `role_applications` only with valid Admin Invitation | Matches | Public application is blocked. Validates token type before submit. |
| `/signup/student` | Signup start plus Student form skeleton | No | Matches public signup blocked state | Shows Professor invitation requirement. Needs invite validation before submit is enabled. |
| `/admin/invitations` | Admin list/create/revoke, parent selector for Buyer/Student parent invitations | Yes, Admin invitation create/revoke | Matches | Public signup/application types are hidden from Admin create form. |
| `/admin/role-applications` | Admin approval/rejection list | Yes, approval/rejection | Partial UX match | Supplier application review is structured; Agent/Professor remain generic. |
| `/dashboard` | Role dashboard plus onboarding placeholders | No new signup writes | Partial | Supplier/Agent/Professor onboarding placeholders exist; Buyer/Student onboarding placeholders are missing. |

## 3. Role Policy Match

| Role | Source Policy | Current UX | Result |
| --- | --- | --- | --- |
| Supplier | Admin Invitation and Public Self Signup allowed. Admin Approval required. Buyer PII blocked. | `/signup/supplier` supports public entry and hidden invitation token. Authenticated submit creates Supplier role application only. | Pass |
| Agent | Admin Invitation and Public Application allowed. Admin Approval required. Buyer invitation tools only after approval. | `/signup/agent` supports authenticated Agent role application submit. Dashboard placeholder states Buyer invitation tools are coming later. | Pass |
| Buyer | Agent Invitation based by default. Direct signup OFF. Supplier direct contact blocked. | `/signup/buyer` shows Agent Invitation basis, direct signup OFF, disabled submit, and brokerage/PII protection copy. | Pass for skeleton; P1 before submit |
| Professor | Admin Invitation centered. Public Application default OFF. Admin Approval required. | `/signup/professor` requires valid `professor_admin_invite` before submit. | Pass |
| Student | Professor Invitation required. Public self signup blocked. | `/signup/student` is a no-write skeleton with public signup unavailable notice. | Pass for skeleton; P1 before submit |

## 4. Invitation Token Safety

| Area | Current Behavior | Risk | Recommendation |
| --- | --- | --- | --- |
| Public validation | Raw token is accepted by server action, hashed in application code, then `validate_invitation_public(token_hash)` RPC is called. | Low | Keep this pattern. Do not pass raw token to SQL. |
| Public UI rendering | Accept Page shows role, status, email-match requirement only. It does not show invitation ID, token ID, token hash, invited email, parent account, company, Agent ID, or Professor ID. | Low | Keep the limited DTO. |
| Signup start pages | Token is forwarded through `invitation_token` query and stored only in hidden fields. | P1 operational | Before redemption, replace long-lived raw URL token handling with short-lived validation/session handoff if feasible. |
| Admin invitation create | Raw token/URL is shown once after create. | Expected Admin-only risk | Keep one-time warning. Do not log token. |
| DB persistence | Token hash only; no raw token storage in migration/action design. | Low | Keep regression tests around payload construction. |

## 5. CTA / Flow Review

| Flow | CTA State | Review |
| --- | --- | --- |
| Invitation Accept valid token | Active CTA to `/signup/{role}?invitation_token=...` | Good for start-page handoff. Needs feature-flag gating before accepting policy-disabled token types. |
| Invitation Accept invalid/expired/revoked/unavailable | Disabled primary CTA plus sign-in link | Good. |
| Supplier form | Submit enabled only for authenticated users and writes role application only | Good. |
| Agent form | Submit enabled only for authenticated users and writes role application only | Good. |
| Buyer form | Submit disabled | Good for direct signup OFF skeleton. |
| Professor form | Submit enabled only for authenticated users with valid Professor Admin Invitation | Good. |
| Student form | Submit disabled | Good for public signup blocked skeleton. |
| SignupStartCard shared CTA | Always disabled "Account creation next" even when child form has enabled submit | P2 UX clarity | For Supplier/Agent/Professor, the shared card can look contradictory because page-level form submit is enabled below. Consider changing shared CTA copy to "Role application form below" when child submit is active. |

## 6. Admin UX Review

Admin Invitation Management:

- Admin-only page uses `requireAdminRoute`.
- Admin create form supports `supplier_admin_invite`, `agent_admin_invite`, `buyer_agent_invite`, `professor_admin_invite`, and `student_professor_invite`.
- Public signup/application invitation types are not Admin-creatable.
- Buyer Agent Invite requires Agent parent fields.
- Student Professor Invite requires Professor parent fields.
- Agent/Professor parent selector avoids showing email/phone and uses IDs, market/university summary, and approval status.
- Invitation list shows type, target role, invited email, status, use count, expiry, created date, and invitation ID.

Admin Role Applications:

- Admin-only page uses `requireAdminRoute`.
- Supplier application reason is parsed into structured fields.
- Agent and Professor application summaries are not yet parsed into structured review cards.
- Approval/rejection actions exist, but audit log integration remains deferred.
- Approval action does not create company, supplier, agent, professor, relation, invitation, or profile setup records automatically.

## 7. Dashboard UX Review

| Role | Current Dashboard Signup Placeholder | Result |
| --- | --- | --- |
| Supplier | Shows submitted/approved/rejected application state, no auto company/product creation, disabled next-step cards, Buyer data protection notice | Pass |
| Agent | Shows submitted/approved/rejected application state, disabled Buyer invitation/QR/assigned Buyer/market cards, Buyer data protection notice | Pass |
| Professor | Shows submitted/approved/rejected application state, disabled Student invitation/QR/Student management/program cards, Student data protection notice | Pass |
| Buyer | No dedicated post-invitation/post-approval placeholder found in current onboarding block | P1 gap |
| Student | No dedicated post-invitation/post-approval placeholder found in current onboarding block | P1 gap |

Dashboard placeholder connection is currently strongest for roles with implemented role application submit: Supplier, Agent, Professor. Buyer and Student remain skeleton-only and should get placeholders when their submit/accept flow is connected.

## 8. PII / Security Review

Pass:

- Supplier signup states Buyer PII remains blocked.
- Buyer signup states Supplier direct contact is not allowed by default and Admin/Agent brokerage protects contact information.
- Agent signup states Agent can manage only assigned/subordinate Buyers and cannot access Buyer PII outside permitted scope.
- Professor signup states Student information is only available after the proper approval/connection boundary.
- Student signup does not expose Professor or Student PII beyond user-entered local form fields.
- Invitation Accept does not expose internal IDs or email values.
- Admin Invitation selector avoids email/phone display for Agent/Professor candidates.
- No service role fallback is used in the reviewed signup UI/action paths.

Watch:

- `invited_email` is visible in Admin Invitation list. This is Admin-only and currently acceptable, but should stay out of public pages and non-admin dashboards.
- Student/Professor dashboard relation sections elsewhere in dashboard code may show mentor/Student contact information after actual relation data exists. That is outside signup skeleton scope, but should be re-reviewed before Professor-Student relation activation.

## 9. Mobile UX Review

Likely good:

- Public signup pages use responsive `lg:grid-cols` layouts that collapse to a single column.
- Form controls use stable minimum heights and full-width inputs.
- Admin pages use grids that collapse below desktop widths.

Potential issues:

- Admin Invitation create/list pages contain long UUIDs, invitation IDs, and raw one-time token/URL values. Existing `break-all`/`break-words` helps, but the creation success area should be manually checked on mobile before operations.
- SignupStartCard plus a full form can create a long mobile page. This is acceptable for skeleton, but should add a sticky or repeated context hint only if abandonment becomes an issue.
- Disabled CTA plus editable fields on Buyer/Student may feel confusing on mobile because the reason for disabled submit can be far below the hero. Keep the warning card above fields.

## 10. Translation Review

Pass:

- Public signup surfaces are English by default.
- Admin Invitation and Role Application labels are Korean by default.
- Supplier, Agent, Buyer, Professor, Student signup forms use translation keys.
- Invitation Accept role-specific CTA/copy uses translation keys.
- Dashboard onboarding placeholders use translation keys.

Gaps:

- Admin Role Applications structured review currently has Supplier-specific translation keys only. Agent and Professor review cards need role-specific keys before operations rely on them.
- Some Admin lists display raw `invitation_type`, `target_role_key`, and UUID labels. This is acceptable for internal MVP but should be mapped to friendlier Korean labels later.
- SignupStartCard has generic disabled CTA copy that does not reflect role-specific submit availability for Supplier/Agent/Professor.

## 11. P0 Issues

No P0 issue found in the current no-write or role-application-only state.

P0 would be triggered if any of the following appeared before the next implementation:

- Raw invitation token stored in DB or logged.
- Public page exposing invitation ID, token ID, token hash, invited email, parent account, Agent ID, Professor ID, or company ID.
- Buyer signup creating Buyer data without Agent invitation or feature-flag-approved direct signup policy.
- Student signup creating Student data without Professor invitation.
- Supplier/Agent/Professor approval creating unrelated organization records without explicit migration/RLS plan.
- Supplier-facing route exposing Buyer email, phone, or contact person.

## 12. P1 Issues

| ID | Issue | Impact | Recommended Fix |
| --- | --- | --- | --- |
| P1-UX-001 | Buyer signup page treats any non-empty `invitation_token` query as invitation-ready without validating token type. | User can see a ready state for invalid or wrong-type token, even though submit remains disabled. | Validate public token on Buyer page before enabling any future submit. Show invalid/wrong-type state. |
| P1-UX-002 | Student signup page treats any non-empty `invitation_token` query as invitation-ready without validating token type. | Same mismatch as Buyer; high risk before Student submit is enabled. | Validate public token on Student page and require `student_professor_invite`. |
| P1-UX-003 | Invitation Accept maps `buyer_direct_signup` and `professor_public_application` to start pages if valid tokens exist, while feature flags default OFF. | Policy-disabled invitation types could still show active CTA if generated outside Admin create flow. | Add feature-flag/policy gate to public validation or Accept Page CTA before enabling broader token sources. |
| P1-UX-004 | Admin Role Applications parses Supplier reason only. Agent/Professor submissions show raw reason rather than role-specific summary cards. | Admin review quality and speed degrade as applications grow. | Add Agent and Professor structured reason parser/review cards. |
| P1-UX-005 | Dashboard placeholders are missing for Buyer and Student onboarding states. | Buyer/Student users may land on a generic dashboard after future submit/approval. | Add Buyer and Student onboarding placeholder components before enabling their submit flows. |
| P1-UX-006 | Raw token remains in URL query and hidden input across start pages. | Operational exposure through browser history/screen sharing remains possible. | Before redemption, consider short-lived handoff or clear token lifecycle after validation. |

## 13. Post-MVP Items

- Replace Admin UUID manual inputs with searchable Agent/Professor/Company selectors everywhere.
- Add pagination and filters to Admin Invitation list.
- Add role-specific Admin review cards for Buyer and Student once their submit flows exist.
- Add QR image generation only from invitation URL, not stored token authority.
- Add email sending and delivery status after audit/logging contract is ready.
- Add acceptance/redemption timeline in Admin Invitation detail.
- Add automated mobile screenshot regression for `/signup/*`, `/admin/invitations`, and `/dashboard`.
- Add accessibility pass for disabled CTA announcements and form error summaries.
- Add feature flag runtime source instead of hardcoded UX copy.
- Add audit log writes for invitation create/revoke and role application approve/reject.

## 14. Recommended Next Task

Recommended next task:

Sprint 2 Invitation Engine Task 36 - Buyer / Student Invitation Validation Guard

Scope:

- Document and then implement public-token validation state for `/signup/buyer` and `/signup/student`.
- Do not enable DB writes yet.
- Require `buyer_agent_invite` for Buyer page.
- Require `student_professor_invite` for Student page.
- Keep raw token hidden and never logged.
- Keep submit disabled until the corresponding readiness audits and RLS policies are complete.

Alternative immediate task:

Sprint 2 Invitation Engine Task 36A - Admin Role Application Review Cards for Agent and Professor

Scope:

- Parse Agent and Professor `reason` text into structured Admin-only summaries.
- Keep approval/rejection behavior unchanged.
- Do not create `agents`, `professors`, `country_agents`, `professor_students`, or invitation records.

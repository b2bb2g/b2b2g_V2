# Sprint 2 Invitation Repository Audit

## 1. Audit Purpose

This audit reviews the existing signup, referral, QR/link, role application, and admin/member flows before implementing the Invitation Engine.

The audit is documentation-only. It does not authorize code changes, SQL migration, Supabase DB changes, RLS SQL, or UI changes.

## 2. Invitation Source of Truth

Primary Source of Truth:

- `docs/09-sprints/11-sprint-2-invitation-engine-plan.md`
- `docs/09-sprints/09-sprint-2-invitation-priority-adjustment.md`
- `docs/03-business/01-business-rules.md`
- `docs/03-business/02-feature-flags.md`
- `docs/04-permissions/01-permission-matrix.md`
- `docs/05-data/01-erd-v1.md`
- `docs/05-data/02-rls-design-v1.md`
- `docs/07-implementation/00-existing-code-reuse-policy.md`

Core rules used in this audit:

- Supplier can use Admin Invitation and Public Self Signup.
- Supplier Role Application and Admin Approval are required.
- Supplier Company/Product public exposure is separate approval.
- Supplier never receives Buyer PII.
- Agent can use Admin Invitation or Public Application and can later issue Buyer Invitation Link/QR.
- Buyer default signup path is Agent Invitation Link/QR; direct signup is feature-flag controlled and default OFF.
- Professor signup is Admin Invitation centered; public application default OFF.
- Student signup requires Professor Invitation Link/QR and cannot use public self signup.
- `referral_codes` and `referral_relations` are Buyer-Buyer referral, not Agent-Buyer invitation authority.
- Agent-Buyer authority must come from `agent_buyers`.
- Professor-Student authority must come from `professor_students`.

## 3. Files Reviewed

| Area | Files / Objects Reviewed |
| --- | --- |
| Auth signup | `lib/actions/auth.ts`, `app/(auth)/signup/page.tsx`, `app/(auth)/select-member-type/page.tsx`, `app/(auth)/pending-approval/page.tsx` |
| Role application | `lib/actions/identity.ts`, `lib/queries/identity.ts`, `components/admin/role-application-list.tsx`, `app/admin/role-applications/page.tsx` |
| Referral actions | `lib/actions/referrals.ts`, `app/(dashboard)/dashboard/referrals/page.tsx`, `components/dashboard/referral-tools.tsx` |
| Referral/sign-up policy query | `lib/queries/signup-policy.ts`, `lib/queries/dashboard.ts`, `lib/queries/admin-overview.ts` |
| Admin settings/member UI | `lib/actions/admin-settings.ts`, `components/admin/admin-home.tsx`, `components/admin/member-management.tsx`, `app/admin/*` |
| Types | `types/database.ts` |
| Migrations | `supabase/migrations/002_role_compatibility.sql`, `supabase/migrations/20260618142000_matching_referral_reward_badge_domain.sql`, `supabase/migrations/20260618143000_matching_referral_reward_badge_rls.sql`, `supabase/migrations/20260621165000_auth_signup_policy_setting.sql`, `supabase/migrations/20260621193000_member_referral_codes.sql` |
| Tables | `profiles`, `account_roles`, `role_applications`, `referral_codes`, `referral_relations`, `member_referral_codes`, `member_referral_signups`, `buyers`, `agents`, `professors`, `students`, `suppliers` |

## 4. Existing Signup Flow Findings

Existing flow:

1. `app/(auth)/signup/page.tsx` accepts `referralCode`, `referral`, `ref`, `invite`, or `code` query params and posts to `signUp`.
2. `lib/actions/auth.ts` checks global `auth.signup_policy`.
3. If public signup is closed, a valid referral/invite-like code is required.
4. Supabase Auth signup stores referral metadata in `user_metadata`.
5. `app/(auth)/select-member-type/page.tsx` lets the user choose a member type.
6. `selectMemberType` creates `profiles`, writes legacy `profiles.member_type_id`, and creates child role rows in `buyers`, `agents`, `professors`, or `students`.
7. It redirects to pending approval.

Findings:

- Reusable: basic email/password signup form, signup policy read path, pending approval routing, translation-key usage.
- Refactor required: signup currently allows all member type choices when no referral invite is present, including Student and Buyer when direct signup policy should restrict them.
- Replace required: signup writes `profiles.member_type_id` and role child rows directly before the new Invitation/Role Application policy is applied.
- Security gap: Student can currently be selected without Professor link when public signup is open.
- Security gap: Supplier public signup does not yet create Supplier Role Application through the new invitation policy path.
- Policy gap: Buyer direct signup is governed by a global open/referral-only policy, not `buyer_direct_signup_enabled`.

## 5. Existing Referral Flow Findings

Buyer-Buyer referral:

- `referral_codes` has `buyer_id`, `code`, `referral_url`, and active/deleted metadata.
- `referral_relations` links `parent_buyer_id` to `child_buyer_id` and tracks reward status.
- `generateBuyerReferralCode` creates or reactivates a Buyer referral code.
- `selectMemberType` creates `referral_relations` only when a Buyer referral code is used and the selected member type is Buyer.

Agent/Professor member referral:

- `member_referral_codes` supports owner types `agent` and `professor`.
- Target types are `buyer` and `student`.
- Constraints enforce Agent -> Buyer and Professor -> Student.
- `member_referral_signups` tracks accepted signups but does not create `agent_buyers` or `professor_students`.
- Dashboard referral page can display and generate these links.

Critical distinction:

- `referral_codes` / `referral_relations` are Buyer-Buyer referral.
- They must not become Agent-Buyer invitation authority.
- They must not become Professor-Student invitation authority.
- `member_referral_codes` is an invitation-like legacy feature, but it stores raw codes and lacks expiry/revoke/max-use semantics required by the new Invitation Engine.

## 6. Existing Role Application Findings

Implemented reusable pieces:

- `account_roles` and `role_applications` types exist in `types/database.ts`.
- `lib/queries/identity.ts` supports role application read paths without email/phone select.
- `lib/actions/identity.ts` supports `requestRole`, `cancelRoleApplication`, `approveRoleApplication`, and `rejectRoleApplication`.
- Admin role application page exists at `app/admin/role-applications/page.tsx`.

Findings:

- Reuse: role application request/review core is the right target for Supplier/Agent/Professor application paths.
- Refactor: invitation acceptance should call or share a role application helper instead of duplicating role application insert logic.
- Hold: audit log integration is still TODO in Identity actions.
- Hold: RLS policy SQL for `account_roles` and `role_applications` remains deferred.
- Conflict: existing signup child-role creation bypasses `role_applications` for Supplier/Agent/Buyer/Professor/Student initial role setup.

## 7. Existing QR / Link Findings

Existing link behavior:

- `buildReferralUrl(code)` creates `/signup?ref={code}`.
- `buildMemberReferralUrl(code, targetMemberType)` creates `/signup?invite={code}&type={targetMemberType}`.
- `ReferralQrCard` uses `https://api.qrserver.com/v1/create-qr-code/` to display QR for referral URL.

Findings:

- Reuse: URL-only QR rendering concept matches the MVP recommendation to avoid storing QR image assets.
- Refactor: QR generation should be moved behind an Invitation URL helper.
- Security gap: existing QR sends the full raw code in the URL.
- Replace: Invitation Engine requires token hash storage and raw token only in generated URL; current `member_referral_codes.code` is stored raw.
- Hold: external QR image service should be reviewed before production use for invitation URLs because it receives the invitation URL as a query parameter.

## 8. Existing Admin Invite Findings

Existing admin capabilities:

- Admin can toggle global signup policy in `components/admin/admin-home.tsx` through `updateSignupPolicyAction`.
- Admin can approve/reject role applications.
- Admin member management supports profile approval/activity and role assignment.

Missing:

- No dedicated Admin Invitation issue/revoke/list page.
- No `invitations`, `invitation_tokens`, or `invitation_redemptions` tables.
- No Admin Supplier Invitation link flow.
- No invite expiry/max-use/revocation model.
- No invited email matching model.
- No Admin audit coverage for invitation lifecycle.

## 9. Conflict Findings

| File | Current Flow | Target Invitation Model | Status | Risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `lib/actions/auth.ts` | Public signup and member type selection create profile and role child rows directly. | Invitation/Role Application first; relation candidate creation after token acceptance/approval. | Refactor | P1 High | Split signup into account creation, invitation acceptance, role application, and relation candidate stages. |
| `app/(auth)/select-member-type/page.tsx` | Shows all member types unless legacy referral invite locks target type. | Role choices must follow invitation type and feature flags. | Refactor | P1 High | Gate visible roles by Invitation policy and feature flags; Student requires Professor link. |
| `lib/queries/signup-policy.ts` | Global open/referral-only policy and referral code validation. | Feature-flag-specific signup policy by role and invitation type. | Refactor | P2 Medium | Keep parser pattern but replace global-only policy with Invitation feature flag reader. |
| `supabase/migrations/20260621165000_auth_signup_policy_setting.sql` | Defaults public signup to open. | Buyer direct signup default OFF, Supplier public signup ON, Student public signup blocked. | Replace | P1 High | Use Feature Flags and role-specific signup policy; do not rely on one global signup switch. |
| `referral_codes` / `referral_relations` | Buyer-Buyer referral and reward tracking. | Not Invitation authority except Buyer-Buyer referral. | Reuse | P2 Medium | Keep for Buyer referral only; explicitly exclude from Agent-Buyer/Professor-Student authority. |
| `member_referral_codes` | Agent/Professor can generate raw code links for Buyer/Student. | Invitation token model with hash, expiry, revocation, max use, parent role context. | Replace | P1 High | Treat as legacy invite-like table; migrate concept into `invitations` and token tables. |
| `member_referral_signups` | Tracks member referral acceptance. | Invitation redemptions and relation candidates. | Refactor | P2 Medium | Map accepted legacy signups during migration review; do not use as final relation authority. |
| `lib/actions/referrals.ts` | Generates Buyer referral and member referral links with admin client. | Invitation actions should be role-aware and token-hash based. | Refactor | P1 High | Keep Buyer referral action; replace Agent/Professor member referral generation with Invitation actions. |
| `components/dashboard/referral-tools.tsx` | QR uses external QR service with raw URL. | URL-only QR helper, token URL, privacy-reviewed QR rendering. | Refactor | P2 Medium | Reuse UI pattern after token URL helper; review external QR service before production. |
| `lib/actions/identity.ts` | Role application request/review exists. | Invitation acceptance should create/link role applications. | Reuse | P2 Medium | Reuse functions or extract shared role application creation logic. |
| `app/admin/role-applications/page.tsx` | Admin can review role applications. | Admin Invitation issue/revoke is separate; approvals can reuse role application UI. | Reuse | P3 Low | Keep role review UI; add separate invitation admin page later. |
| `types/database.ts` | Has referral/member_referral/account_roles/role_applications types. | Needs invitation-specific types after migration spec. | Refactor | P2 Medium | Do not add invitation DB types until migration spec and SQL exist. |
| `lib/queries/dashboard.ts` | Professor dashboard selects student profile email; Student dashboard selects professor email. | Professor-Student direct PII is allowed, but must remain scoped to subordinate relation. | Reuse | P2 Medium | Keep scoped behavior; migrate from `students.professor_id` to `professor_students` later. |
| `components/admin/member-management.tsx` | Admin sees email/phone/referral source. | Admin PII access is allowed. | Reuse | P3 Low | Keep for Admin only; do not expose these fields to Supplier/Agent dashboards. |

## 10. Role Signup Path Coverage

| Signup Path | Current Support | Current Mechanism | Gap |
| --- | --- | --- | --- |
| Supplier Admin Invitation | Not supported | Admin can create member manually, but no invitation link. | Need `supplier_admin_invite`. |
| Supplier Public Signup | Partially supported | Public signup + member type selection can create Supplier profile path, but not role application based. | Must create Supplier Role Application and block activation/public exposure until Admin Approval. |
| Agent Admin Invitation | Not supported | Admin member creation exists; no invite token. | Need `agent_admin_invite`. |
| Agent Public Application | Partially supported | Public signup + member type selection can create Agent row. | Must use Role Application and Admin Approval. |
| Buyer Agent Invitation | Partially supported | `member_referral_codes` can create Agent -> Buyer invite-like link. | Must replace with Invitation token and `agent_buyers` relation candidate. |
| Buyer Direct Signup | Currently open when global signup is open. | Global `auth.signup_policy` defaults open. | Must be controlled by `buyer_direct_signup_enabled=false`. |
| Professor Admin Invitation | Not supported | Admin member creation exists; no invite token. | Need `professor_admin_invite`. |
| Professor Public Application | Partially possible through open signup. | No role-specific flag gate. | Must default OFF through `professor_public_application_enabled=false`. |
| Student Professor Invitation | Partially supported | `member_referral_codes` can lock target member type to student and set `students.professor_id`. | Must require Professor invitation token/QR and create `professor_students` relation candidate. |

## 11. Security / PII Findings

| Finding | Risk | Current Evidence | Recommendation |
| --- | --- | --- | --- |
| Raw referral/invite-like codes are stored in DB. | P1 High | `referral_codes.code`, `member_referral_codes.code`. | Invitation Engine must store `token_hash`; raw token only appears once in URL. |
| No expiry/max-use/revoke on referral codes. | P1 High | `member_referral_codes` has `is_active` but no `expires_at`, `max_uses`, `used_count`, `revoked_at`. | Add lifecycle fields in migration spec. |
| Global public signup can allow Buyer/Student/Professor paths outside role-specific flags. | P1 High | `auth.signup_policy` default open; select page lists all member types without invite. | Replace with role-specific feature flag gating. |
| Student signup can occur without Professor link. | P1 High | `selectMemberType` inserts `students` with nullable `professor_id` if no referral invite. | Block Student signup unless valid Professor invitation exists. |
| Referral link could be misunderstood as Agent-Buyer authority. | P1 High | Existing `member_referral_codes` name and dashboard copy say invitation, but final authority table is not `agent_buyers`. | Document and enforce `agent_buyers` relation candidate in Invitation Engine. |
| Supplier public signup does not yet route through Supplier Role Application. | P1 High | Existing signup can choose Supplier but no Supplier-specific role application creation. | Supplier signup must create Supplier Role Application. |
| Supplier Buyer PII exposure through invitation path not found. | Safe currently | Reviewed signup/referral flows do not select Buyer email/phone/contact for Supplier. | Maintain no Buyer PII select in Supplier paths. |
| Professor/Student email display exists. | P2 Medium | Professor dashboard can show subordinate student email; Student dashboard can show professor email. | Allowed by Permission Matrix if subordinate relation is enforced; migrate relation authority to `professor_students`. |
| External QR service receives invite/referral URL. | P2 Medium | `ReferralQrCard` builds `api.qrserver.com` URL with encoded signup URL. | Review before production; prefer local QR generation for sensitive tokens if feasible. |
| Admin client is used in signup/referral support flows. | P2 Medium | `auth.ts`, `signup-policy.ts`, `referrals.ts`. | Avoid service-role fallback in new Invitation Engine; keep final enforcement in DB/RLS. |

## 12. Recommended Invitation Implementation Order

1. Migration spec.
2. Token helper.
3. Invitation types.
4. Invitation query.
5. Invitation actions.
6. Supplier public signup connection.
7. Admin invite connection.
8. Buyer/Student parent invite connection.
9. QR URL helper.
10. Tests.

Task-specific notes:

- Start with migration spec before changing code because current DB has no final invitation tables.
- Keep `referral_codes` as Buyer-Buyer referral.
- Do not convert `member_referral_codes` in place without migration review.
- Do not connect signup routes until token hash, expiry, revocation, role application creation, and relation candidate timing are decided.

## 13. Files Not To Touch Yet

- `lib/actions/auth.ts` until migration spec and invitation action contract are written.
- `app/(auth)/signup/page.tsx` until feature flag and invitation URL parsing are designed.
- `app/(auth)/select-member-type/page.tsx` until role-specific signup gating is designed.
- `lib/actions/referrals.ts` until Buyer referral vs Invitation boundary is finalized.
- `components/dashboard/referral-tools.tsx` until QR URL helper design is complete.
- `supabase/migrations/*` until Task 03 migration spec is approved.
- `components/admin/member-management.tsx` until Admin Invitation UI scope is separated.

## 14. Blocking Issues

| Blocking Issue | Priority | Blocks |
| --- | --- | --- |
| Invitation table design not written. | P0 | SQL migration, queries, actions. |
| Token expiry/max-use/email-match rules undecided. | P0 | Token helper and migration spec. |
| Role application auto-create/link rule undecided. | P0 | Supplier/Agent/Professor signup flows. |
| Relation candidate creation timing undecided. | P0 | Buyer-Agent and Professor-Student invite flows. |
| Global signup policy conflicts with role-specific flags. | P1 | Signup route integration. |
| Legacy `member_referral_codes` migration strategy missing. | P1 | Parent invite migration/refactor. |
| External QR provider privacy review missing. | P2 | QR URL generation production use. |
| RLS helper/policy for invitation tables not designed. | P1 | Production-grade invitation writes/reads. |

## 15. Codex Next Step

Next task:

- Sprint 2 Invitation Engine Task 03 - Invitation Migration Spec.

Expected output:

- `docs/09-sprints/13-sprint-2-invitation-migration-spec.md`

The migration spec should define:

- `invitations`
- `invitation_tokens`
- `invitation_redemptions`
- optional QR storage decision
- status model
- token hashing rules
- expiry/max-use/revocation fields
- role application link fields
- relation candidate fields
- RLS helper candidates
- rollback and validation rules

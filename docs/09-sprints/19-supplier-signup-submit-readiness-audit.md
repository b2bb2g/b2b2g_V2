# Supplier Signup Submit Readiness Audit

## 1. Current Supplier Signup UI State

The current Supplier signup route is a public preparation screen only.

| Area | Current State | Submit Readiness |
| --- | --- | --- |
| Route | `/signup/supplier` exists as a public signup start page. | Ready as entry point only. |
| Form UI | `components/public/supplier-signup-form.tsx` collects contact email, contact name, company name, country, product category, product summary, website/catalog URL, optional hidden invitation token, and terms agreement. | Not wired to a server action. |
| Submit button | Disabled. | Must remain disabled until write flow is finalized. |
| Invitation token | Carried only as query and hidden field when present. | Raw token must never be rendered, logged, or stored. |
| DB writes | None. | Correct for current Task 18 boundary. |
| Public copy | States public signup or Admin invitation, Admin approval required, Company/Product approval separate, Buyer PII never exposed. | Aligned with Invitation Engine policy. |

Current UI intentionally does not:

- create Supabase Auth accounts
- create `profiles`
- create `role_applications`
- create `account_roles`
- create `companies`
- create `suppliers`
- write `invitation_redemptions`
- upload files
- write audit logs

## 2. Existing Auth Signup Flow

Existing signup is handled by `lib/actions/auth.ts` and `app/(auth)/signup/page.tsx`.

| Flow | Current Behavior | Risk / Conflict |
| --- | --- | --- |
| `signUp(formData)` | Uses `supabase.auth.signUp()` with email/password and optional referral metadata. | It is generic account signup, not Supplier application submission. |
| `selectMemberType(formData)` | After login, creates `profiles` with legacy `member_type_id`, then inserts child role rows such as `buyers`, `agents`, `professors`, `students`; Supplier has no child creation branch in the current code path. | Conflicts with new Account/Role source of truth if reused as Supplier submit path. |
| Referral handling | Uses legacy referral codes and some admin-client tracking for referral/member referral relations. | Invitation Engine token flow is separate and must not reuse Buyer-Buyer referral authority. |
| Profile insert | `profiles_admin_insert` RLS policy in foundation RLS is Admin-only. | Existing `selectMemberType` server-client insert depends on current DB policy behavior and should not be copied into the new Supplier submit flow without RLS review. |
| Member type authority | `profiles.member_type_id` is still written by legacy flow. | New Supplier submit should use `role_applications` and keep `member_type_id` as legacy compatibility only. |

Answer to required question 1:

Supplier public signup should not directly combine Supplier form submission with Supabase Auth signup in one public server action. The safer MVP split is:

1. Public Supplier form collects preparation data and routes user to account creation/sign-in.
2. Supabase Auth account is created through existing auth signup or a dedicated auth step.
3. After login and profile existence are confirmed, the authenticated user submits Supplier `role_applications`.

This avoids raw public writes into business tables and keeps account creation separate from approval workflow.

## 3. Existing Role Application Flow

Identity actions and queries are already present:

| Function / Area | Current Behavior | Reuse Decision |
| --- | --- | --- |
| `requestRole(roleKey, reason?)` | Authenticated user creates a submitted `role_applications` row after duplicate active role and duplicate open application checks. | Reuse with Refactor for Supplier metadata. |
| `cancelRoleApplication(applicationId)` | Authenticated owner can cancel own submitted/under_review application. | Reuse. |
| `approveRoleApplication(applicationId)` | Admin approves submitted/under_review application and inserts or updates `account_roles`. | Reuse with later Supplier-specific post-approval orchestration. |
| `rejectRoleApplication(applicationId, reason)` | Admin rejects submitted/under_review application. | Reuse. |
| `getMyRoleApplications()` | Authenticated owner reads own role applications without PII joins. | Reuse. |
| `getPendingRoleApplicationsForAdmin()` | Admin lists pending role applications with minimal fields. | Reuse with later Supplier metadata review surface. |

Answer to required question 2:

Yes. A logged-in user can submit a Supplier role application using the existing Identity flow if RLS permits `role_applications` owner insert. The current `requestRole("supplier", reason)` shape is close, but Supplier form fields do not fit the current single `reason` field cleanly.

Answer to required question 3:

A non-logged-in user should create an account first, then submit Supplier role application after authentication. Direct unauthenticated `role_applications` insert is not acceptable because `role_applications.account_id` must point to `profiles.id` and the row must be owner-bound.

## 4. Existing Company/Supplier Data Model

Relevant tables and constraints:

| Table | Current Purpose | Insert Constraints / Risk |
| --- | --- | --- |
| `profiles` | Auth-linked account profile; currently includes legacy `member_type_id`, email, phone, approval/activity statuses. | Current RLS has owner select/update and Admin insert. New signup must decide how profile creation happens before role application. |
| `role_applications` | Account role request workflow introduced by 002. | No source metadata columns beyond `reason`; RLS policy state must be verified before relying on user insert. |
| `account_roles` | Approved/active account role authority introduced by 002. | Normal users must never insert/update this table. Admin approval only. |
| `companies` | Supplier company profile and public microsite root. Requires `company_type_id`, `country_id`, `industry_id`, `name`, `slug`. | Current RLS has public approved select, supplier-owner select/update, Admin all. No general public/authenticated insert policy. |
| `suppliers` | Supplier role profile linked to `profiles` and `companies`; `company_id` is required. | Current RLS has owner select/update and Admin all. No general public/authenticated insert policy. |
| `company_members` | Target ERD relation for company-account membership. | Target relation exists in ERD, but live implementation must verify table availability and policies before using it. |

Important current mismatch:

- `suppliers.company_id` is required.
- `companies` requires several normalized IDs not collected by the current Supplier form.
- Current Supplier form has free-text `country` and `product_category`, not validated IDs.
- Therefore, creating `companies` and `suppliers` during initial Supplier submit would either require incomplete placeholder data or extra lookup/validation UI that does not exist yet.

Answer to required question 5:

For MVP, do not create `companies` or `suppliers` before Admin role approval. Store Supplier application context first, then create company/supplier records during a later approved company setup step or Admin-reviewed onboarding step.

## 5. Recommended Write Flow

Recommended MVP option:

```text
Public /signup/supplier
-> If unauthenticated: route to existing account signup/sign-in
-> After authentication: ensure profile exists
-> Validate Supplier form input
-> Validate supplier_public_signup_enabled or supplier_invitation_enabled
-> If invitation token exists: hash and validate through public-safe RPC/server validation
-> Create Supplier role_applications row with status submitted
-> Do not create account_roles
-> Do not create companies
-> Do not create suppliers
-> Redirect to pending Supplier onboarding state
-> Admin reviews role application
-> Admin approval creates/updates account_roles
-> Company setup/approval and supplier profile creation happen in later flow
```

Recommended table write order for Task 20:

| Order | Table / System | Write | Actor | Notes |
| --- | --- | --- | --- | --- |
| 1 | Supabase Auth | create account if user is not logged in | user through auth flow | Prefer existing auth signup step, not Supplier form action. |
| 2 | `profiles` | ensure account profile exists | authenticated user or reviewed auth/profile flow | Current RLS/profile creation needs review before new implementation. |
| 3 | `role_applications` | insert `requested_role_key = supplier`, `status = submitted` | authenticated owner | Include Supplier form context in `reason` only as temporary MVP option, or use a pending table after migration. |
| 4 | `invitation_tokens` / RPC | validate token hash only | server action | Raw token must be hashed before validation. |
| 5 | `invitation_redemptions` | deferred | none in next submit task | Do not write redemption until atomic acceptance flow is defined. |
| 6 | `account_roles` | after Admin approval only | Admin | Existing approval action can insert/update this. |
| 7 | `companies` | after Supplier role approval or during separate company setup | Supplier owner/Admin after policy review | Requires normalized company fields and approval status. |
| 8 | `suppliers` | after company record exists and Supplier approval is confirmed | Admin or controlled onboarding action | Requires `company_id`. |

Answer to required question 4:

If invitation token exists, the Supplier application source should be preserved without storing the raw token. Current schema has no explicit `role_applications.source`, `invitation_id`, or metadata column. The temporary MVP options are:

1. Store safe text in `role_applications.reason`, such as `source=supplier_admin_invite; invitation_validated=true`, without token, hash, email, or internal IDs.
2. Prefer a small additive migration later to add `source_type`, `source_invitation_id`, or a separate `supplier_application_profiles` / `pending_supplier_applications` table.

Recommended for Task 20: do not store invitation id/token-derived internals in `reason`; document the source in user-readable safe text only if absolutely needed. A proper source column/table is cleaner before production submit.

## 6. RLS / Permission Risk

| Area | Current Finding | Risk | Recommendation |
| --- | --- | --- | --- |
| `role_applications` RLS | 002 migration explicitly deferred RLS enablement/policies for `account_roles` and `role_applications`. | If RLS is disabled, writes may be too broad; if RLS is enabled in production without owner insert policy, writes fail. | Verify production RLS state before implementing submit. Add owner insert/select policy before relying on user submit. |
| `account_roles` RLS | Normal users must not write. Current app approval action uses server client and admin guard. | Incorrect policy could let users self-grant Supplier. | Keep Admin-only insert/update; never write from Supplier submit. |
| `profiles` insert | Existing RLS policy is Admin insert only. | New account/profile creation can fail or require unsafe service role bypass if not designed. | Decide profile creation path separately; do not solve with service role fallback. |
| `companies` insert | Current policy does not expose general owner insert; Supplier owner update/select depends on existing supplier relation. | Initial company insert before supplier relation may fail. | Defer company creation until company setup flow and RLS are designed. |
| `suppliers` insert | Current policy is owner select/update and Admin all; `company_id` required. | Initial supplier insert before company record may fail and create partial state. | Defer supplier row creation until Admin approval/company flow. |
| Invitation validation | Public validation RPC returns limited fields only. | Accept/submit action needs a server-side validation path that does not expose token internals. | Reuse hash-first validation; do not log token or pass raw token to SQL. |

Answer to required question 8:

RLS insert readiness is not fully confirmed for Supplier submit. `role_applications` is the only plausible early write target, but production RLS state and owner insert/select policies must be verified or implemented before enabling the submit button.

## 7. PII / Security Risk

| Risk | Status | Required Guard |
| --- | --- | --- |
| Buyer PII exposure | No Supplier form query reads Buyer data today. | Keep Supplier submit action free of Buyer joins/selects. |
| Supplier-Buyer direct contact | No contact release or conversation write is part of Supplier submit. | Keep Supplier submit isolated from Communication/Trade Brokerage. |
| Raw invitation token exposure | Current UI hides token; public validation hashes token before RPC. | Submit action must not log token, store token, or return token. |
| Service role fallback | P0/P1 policy forbids fallback. | Do not use `createSupabaseAdminClient` in Supplier submit. |
| Account enumeration | Existing auth signup may reveal generic signup failure only. | Supplier submit should return generic errors for duplicate/unknown account state. |
| Supplier form free-text PII | Contact email/name are Supplier-side PII. | Store only in authenticated owner application context; avoid public logs. |
| Admin review data | Application reason may contain business context. | Admin-only review; do not expose to public or Supplier-facing lists beyond owner/admin. |

Answer to required question 6:

Buyer PII exposure risk is low if the submit action writes only to `role_applications` and performs no Buyer, Buy Request, Brokerage, conversation, or message queries. It becomes high if Supplier submit tries to create brokerage, direct contact, or Supplier-facing Buy Request access.

Answer to required question 7:

No service role fallback should be used. Existing `auth.ts` legacy referral tracking uses admin client in limited paths, but the new Supplier submit flow must not copy that pattern.

## 8. Implementation Options

| Option | Description | Pros | Cons | Verdict |
| --- | --- | --- | --- | --- |
| A. Existing auth signup first, then authenticated Supplier role application | Keep `/signup/supplier` as preparation/CTA, send unauthenticated users through auth signup/login, then submit `role_applications` as logged-in owner. | Lowest DB surface, aligns Account/Role split, avoids public business writes. | Requires a second step and profile creation path review. | Recommended MVP. |
| B. One-step public Supplier signup creates auth account and role application | Supplier form action creates auth account then application. | Smooth UX. | Harder to secure, profile/RLS coupling, partial failure risk, no password fields in current Supplier form. | Hold. |
| C. Create company/supplier rows before Admin approval | Submit creates draft company and supplier records immediately. | Captures structured company data early. | Current form lacks required normalized IDs, RLS may block, public exposure mistakes possible. | Reject for MVP submit. |
| D. Store Supplier form data in `role_applications.reason` | Serialize safe summary into reason. | No migration required. | Poor structure, length limits, harder admin review/search, source metadata ambiguity. | Temporary only. |
| E. Add pending Supplier application table | Create `pending_supplier_applications` or extend `role_applications` metadata in a later additive migration. | Clean review data, source, invitation context, structured fields. | Requires migration/RLS design. | Preferred before production-grade submit. |

Answer to required question 9:

Existing signup flow conflicts with the new Supplier submit direction if reused directly because it relies on legacy `member_type_id`, profile/child row creation, and referral code semantics. The new flow should connect to existing auth only for account creation/sign-in, then use Identity Engine role application logic.

## 9. Recommended MVP Option

Recommended MVP direction:

1. Keep `/signup/supplier` public and English.
2. If user is not authenticated, route to existing `/signup` or `/login` with a return target to `/signup/supplier`.
3. After authentication, submit Supplier form as authenticated owner.
4. Write only one early business row: `role_applications` with `requested_role_key = supplier`, `status = submitted`.
5. Use `requestRole("supplier", reason)` logic as base but add a Supplier-specific action wrapper for validation and safe context formatting.
6. Keep `account_roles` creation in Admin approval only.
7. Defer `companies`, `suppliers`, `company_members`, products, membership, redemption, and audit writes until their specific flows are finalized.
8. Validate feature flags:
   - public entry: `supplier_public_signup_enabled = true`
   - invitation entry: `supplier_invitation_enabled = true`
   - always enforce `supplier_requires_admin_approval = true`
9. If invitation token is present, validate hash-first and never store raw token.
10. Return/redirect to pending Supplier onboarding after successful role application submission.

Recommended first implementation target:

- `lib/actions/supplier-signup.ts` or `lib/actions/invitation-signup.ts`
- Authenticated-only `submitSupplierRoleApplication(formData)`
- No company/supplier writes
- No invitation redemption writes
- No service role
- No Buyer queries

## 10. Blocking Issues

| Blocking Issue | Priority | Why It Blocks Submit | Required Decision / Fix |
| --- | --- | --- | --- |
| `role_applications` RLS production state unknown | P0 | Submit may fail or be over-permissive. | Verify and/or write owner insert/select RLS policy before enabling submit. |
| Profile creation path is still legacy/admin-insert constrained | P0 | Non-logged-in signup cannot submit role application until profile exists. | Decide whether existing auth signup/profile flow remains or needs a safe profile creation action/RLS. |
| Supplier form data has no structured storage target | P1 | Current `role_applications.reason` is not enough for durable company/product review data. | Decide temporary `reason` summary vs additive pending Supplier application table. |
| Invitation source linkage missing on `role_applications` | P1 | Cannot cleanly track `supplier_admin_invite` vs public signup source. | Add safe source field/table later or accept short-term human-readable reason text. |
| Company/supplier creation timing | P1 | `suppliers.company_id` required and company requires normalized IDs. | Keep company/supplier creation after approval/setup; do not create during submit. |
| Feature flag runtime storage/read path | P1 | Flags exist in docs; runtime enforcement path must be identified. | Reuse site settings/feature flag table when ready or keep hardcoded conservative defaults in server action with TODO. |
| Audit log integration | P2 | Application submit and approval are audit candidates. | Add audit event after audit contract is finalized; do not block skeleton if write is otherwise safe. |

## 11. Next Codex Task

Recommended next task:

**Sprint 2 Invitation Engine Task 20 - Supplier Signup Submit Action Design**

Scope:

- no UI redesign
- no DB migration unless explicitly approved
- write exact server action contract before implementation
- decide whether Task 20 can use `role_applications.reason` temporarily
- verify production RLS for `role_applications`
- define authenticated-only submit behavior
- define unauthenticated redirect behavior
- keep `companies`, `suppliers`, `company_members`, `account_roles`, `invitation_redemptions`, and Buyer-facing data untouched

Proposed Task 20 implementation order after this audit:

1. Confirm or author RLS policy for owner insert/select on `role_applications`.
2. Add Supplier-specific input validator.
3. Add authenticated-only Supplier submit action using server client.
4. Block duplicate active/open Supplier applications.
5. Validate optional invitation token hash-first.
6. Insert `role_applications` only.
7. Redirect to pending onboarding.
8. Add tests for validation, duplicate block, and no raw token persistence.

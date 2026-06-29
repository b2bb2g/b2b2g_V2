# Professor Signup Submit Readiness Audit

## 1. Current Professor Signup UI State

The current Professor signup route is a public preparation screen only.

| Area | Current State | Submit Readiness |
| --- | --- | --- |
| Route | `/signup/professor` exists and renders the Professor signup preparation page. | Ready as an invitation landing point only. |
| Form UI | `components/public/professor-signup-form.tsx` collects contact email, professor name, university, department, position/title, program/course summary, expected student count, optional hidden invitation token, and terms agreement. | Not wired to a server action. |
| Submit button | Disabled. | Must remain disabled until the write flow is implemented. |
| Invitation token | Carried from query string and hidden input when present. | Raw token must never be displayed, logged, or stored. |
| Public application copy | States Professor onboarding is invitation-based and public application is currently unavailable. | Aligned with `professor_public_application_enabled = false`. |
| DB writes | None. | Correct for the current Task 29 boundary. |

Current UI intentionally does not:

- create Supabase Auth accounts
- create `profiles`
- create `role_applications`
- create `account_roles`
- create `professors`
- create `students`
- create `professor_students`
- create Student invitation links or QR codes
- write `invitation_redemptions`
- write audit logs

## 2. Existing Professor / Student Data Model

Current repository evidence shows that `professors` and `students` exist in generated runtime types, while `professor_students` is a target relation in ERD/RLS docs but is not present in current generated types or migration files.

| Table | Current Purpose | Current Evidence | Submit Relevance |
| --- | --- | --- | --- |
| `profiles` | Auth-linked account profile with legacy `member_type_id` and account contact fields. | `types/database.ts` contains `profiles`. | Required before owner-bound `role_applications` insert. |
| `account_roles` | Approved/active role authority. | Added by `002_role_compatibility.sql`; typed in `types/database.ts`. | Must not be written by Professor public/invitation submit. Admin approval only. |
| `role_applications` | Role request/review workflow. | Added by `002_role_compatibility.sql`; owner insert/select and admin review RLS added by 015; typed in `types/database.ts`. | Safest MVP write target. |
| `professors` | Professor profile row linked to `profiles.id` by `profile_id`, with `university_name` and `approval_status`. | `types/database.ts` contains `professors`. | Should be created after Admin approval or in a controlled Professor setup step, not during initial application submit. |
| `students` | Student profile row linked to `profiles.id`, with legacy `professor_id`, `university_name`, and `graduation_status`. | `types/database.ts` contains `students`. | Must not be read or written during Professor application submit. |
| `professor_students` | Target Professor-Student subordinate relation. | ERD/RLS/Permission docs mention it; no generated runtime table was found in `types/database.ts` or `supabase/migrations`. | Future target. Cannot be used as a live query/write table before migration. |
| `invitations` / `invitation_tokens` | Invitation Engine metadata and hashed token storage. | Added by 012; Admin RLS by 013; public validation RPC by 014. | Can validate Professor invitation token safely, but submit must not write redemption yet. |

Key conclusion:

- `students.professor_id` exists as legacy/current relation hint.
- New Source of Truth expects `professor_students` as the relation authority.
- Professor submit must not create Student relations or unlock Student PII until the target relation and RLS helper are implemented.

## 3. Existing Role Application Flow

Identity actions already provide a reusable owner-submit workflow.

| Function / Area | Current Behavior | Reuse Decision |
| --- | --- | --- |
| `requestRole(roleKey, reason?)` | Authenticated user creates a `submitted` `role_applications` row after checking active roles and open duplicate applications. | Reuse for Professor with invitation/public-off validation wrapper. |
| `getMyRoleApplications()` | Authenticated user reads own applications through server client and RLS. | Reuse. |
| `getPendingRoleApplicationsForAdmin()` | Admin reads pending role applications with minimal fields. | Reuse; Admin review UI may need Professor summary rendering later. |
| `approveRoleApplication(applicationId)` | Admin inserts/updates `account_roles` and marks application approved. | Reuse for role grant only; do not create `professors` automatically until setup flow is designed. |
| `rejectRoleApplication(applicationId, reason)` | Admin marks application rejected. | Reuse. |
| Supplier / Agent submit wrappers | Build safe text reasons and call `requestRole("supplier" / "agent", reason)`. | Reuse the same pattern for Professor, with stricter invitation gating. |

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

There is no structured `source`, `metadata`, or `invitation_id` column. Professor submit can only store safe application context in `reason` until a future metadata/pending application table is approved.

## 4. Professor Invitation Policy

Professor onboarding is not the same as Agent public application.

| Policy | Final MVP Direction | Reason |
| --- | --- | --- |
| Admin Invitation | Required/default path. | Business Rules state Professor is Admin Invitation centered. |
| Public Application | OFF by default. | `professor_public_application_enabled = false` and P1 risk if unverified Professors attempt Student network access. |
| Admin Approval | Required. | Professor role grants future Student invitation and Student PII scope. |
| Student invitation tools | Approved Professor only. | BR-PROF-003 allows Student Referral Link/QR only for approved Professor. |
| Student public signup | Not allowed. | `student_signup_requires_professor_link = true`. |

Recommended submit gate:

```text
Professor submit is allowed only when:
- user is authenticated
- target role is professor
- no active/approved professor role exists
- no submitted/under_review professor application exists
- valid professor_admin_invite token context exists
- professor_public_application_enabled remains false unless a future SOT changes it
```

If no valid invitation token is present, the next implementation should show a clear "Admin invitation required" state rather than inserting a public Professor application.

## 5. Student PII Permission Boundary

Professor has broader Student PII rights than most roles, but only inside the subordinate relationship boundary.

| Data / Scope | Professor Access | Required Guard |
| --- | --- | --- |
| Own Professor application | Owner read/write through `role_applications`. | Owner RLS from 015. |
| Own Professor profile | Own after profile/setup exists. | Owner/Admin RLS. |
| Subordinate Student email | Full access allowed. | `professor_students` or approved legacy relation plus `can_view_student_pii`. |
| Subordinate Student phone | Full access allowed. | Same subordinate guard. |
| Subordinate Student activity | Full/management access allowed where designed. | Same subordinate guard and table-specific policies. |
| Unrelated Student PII | Denied. | `is_professor_of_student` must return false. |
| Public Student PII | Denied. | No public profile/PII projection. |

Current risk boundary:

- `professor_students` is not live in generated database types.
- `can_view_student_pii` and `is_professor_of_student` are RLS design helpers, not confirmed app-facing runtime helpers for this submit task.
- Therefore, Professor application submit must not select from `students`, `profiles` joined to Student accounts, or any Student activity table.
- Student invitation and Student relation creation must wait until the approved Professor role exists and the relation workflow is explicitly designed.

## 6. Recommended Write Flow

Recommended MVP flow:

```text
Public /signup/professor
-> If unauthenticated: show sign-in / create-account guidance
-> After authentication: ensure profile exists
-> Validate Professor form input
-> Require valid professor_admin_invite token context
-> Keep professor_public_application_enabled as OFF
-> Create role_applications row only
   - account_id = auth.uid()
   - requested_role_key = professor
   - status = submitted
   - reason = safe Professor application summary
-> Do not create account_roles
-> Do not create professors
-> Do not create students
-> Do not create professor_students
-> Do not create Student invitations
-> Do not write invitation_redemptions
-> Show pending Admin review state
-> Admin reviews and approves/rejects role_application
-> Approved role creates/updates account_roles
-> Professor profile setup / Student invitation tools happen in later controlled flows
```

Safe `reason` shape for the next implementation:

```text
Professor application
University: ...
Department: ...
Position / Title: ...
Program or course summary: ...
Expected student count: ...
Invitation: provided / validated
```

Do not store:

- raw invitation token
- token hash
- invitation id
- token id
- invited email
- Student email
- Student phone
- Student identity records

## 7. RLS / Permission Risk

| Area | Current Finding | Risk | Recommendation |
| --- | --- | --- | --- |
| `role_applications` owner insert | 015 added authenticated owner insert/select policy and Admin select/update policy. | Usable for Professor submit if `account_id = auth.uid()` and `status = submitted`. | Reuse `requestRole("professor", reason)` behind a Professor-specific wrapper. |
| `account_roles` write | Role grant is Admin-only through approval flow. | Self-grant would break Permission Matrix. | Professor submit must never write `account_roles`. |
| `professors` insert/update | Existing table is typed and has `approval_status`, but profile creation timing is not finalized. | Creating Professor row before approval can create partial authority state and future Student access confusion. | Defer `professors` row until approval/setup flow. |
| `students` read/write | Student rows include PII-adjacent account linkage through `profiles`. | Any submit-time Student query risks exposing or coupling unrelated Student data. | No Student selects/writes in Professor submit. |
| `professor_students` live query/write | Not present in current generated runtime types or migrations. | Any live write/query will fail or force incorrect fallback to legacy fields. | Treat as future target until migration exists. |
| Invitation validation | 014 RPC accepts token hash and returns limited fields. | Submit action must not pass raw token to SQL or store it. | Hash first; only record safe source text if needed. |
| Student invitation generation | Business rules allow only approved Professor to issue Student links/QR. | Pending Professor could invite Students if action checks only form state. | Gate future Student invite creation on approved `account_roles` and Professor setup status. |

## 8. Implementation Options

| Option | Description | Pros | Cons | Verdict |
| --- | --- | --- | --- | --- |
| A. Authenticated invitation-only Professor role application | Logged-in user with valid Professor Admin Invitation submits `role_applications`; no Professor/profile/Student writes. | Lowest risk, reuses 015 RLS and existing role application flow, preserves public application OFF. | Requires invitation validation in submit action. | Recommended MVP. |
| B. Public Professor application without invitation | Logged-in user submits Professor application from public route. | Simple UX. | Contradicts MVP default OFF and increases Student network access risk. | Reject unless SOT changes. |
| C. Create `professors` row before approval | Submit creates pending Professor profile row immediately. | Gives Admin structured profile to review. | Needs lifecycle/RLS/audit decisions and may imply premature Professor surface. | Hold. |
| D. Generate Student invitation tools immediately after submit | Pending Professor receives Student link/QR. | Fast onboarding. | Violates approval-first policy and Student PII boundary. | Reject. |
| E. Create `professor_students` relation candidate during Professor submit | Creates subordinate relation before any Student exists. | None for current flow. | Target table is not live and no Student context exists. | Reject. |
| F. Store structured Professor application metadata | Add metadata/source table or columns. | Better Admin review structure. | Requires migration and RLS design. | Future decision. |

## 9. Recommended MVP Option

Use Option A.

MVP submit rules:

1. Unauthenticated users see sign-in/create-account guidance.
2. Authenticated users can submit Professor application only with valid Admin Invitation context.
3. Public Professor application remains OFF.
4. Submit action writes only to `role_applications`.
5. Use `requestRole("professor", reason)` or a small `submitProfessorRoleApplication()` wrapper.
6. Duplicate prevention relies on `requestRole` active role/open application checks.
7. `account_roles`, `professors`, `students`, `professor_students`, Student invitations, and `invitation_redemptions` remain untouched.
8. Student PII is never selected or stored.

Recommended next implementation shape:

| File | Action |
| --- | --- |
| `lib/actions/professor-signup.ts` | Add form validation, require invitation context, and call `requestRole("professor", reason)`. |
| `components/public/professor-signup-form.tsx` | Add authenticated submit UX, mirroring Supplier/Agent patterns but invitation-gated. |
| `app/(public)/signup/professor/page.tsx` | Pass current auth state and invitation token without service role. |
| `lib/i18n/translation.ts` | Add submit/auth/success/error keys. |
| `TASK_MASTER.md` | Record Task 31 completion after implementation. |

## 10. Blocking Issues

| Issue | Priority | Blocking Scope | Recommendation |
| --- | --- | --- | --- |
| Invitation-required submit gate | P0 | Professor public application is OFF; submit must not become public self-application by accident. | Require valid `professor_admin_invite` context before inserting. |
| Profile existence path | P0 | Owner insert requires `role_applications.account_id = auth.uid()` and profile FK. | Reuse Supplier/Agent submit assumption; if user lacks profile, return sign-in/profile setup guidance without service-role fallback. |
| Professor application metadata | P1 | `role_applications` has only `reason`. | Store safe text temporarily or design metadata/source table later. |
| Professor profile creation timing | P1 | `professors` row lifecycle after approval is not finalized. | Defer to Professor post-approval setup task. |
| `professor_students` missing | P0 for Student relation features | Cannot implement target subordinate relation writes or RLS helper tests yet. | Write migration/spec before Professor-Student relation implementation. |
| Student PII helper/policy | P0 for Student data features | `is_professor_of_student` / `can_view_student_pii` remain design requirements. | Do not add Student selects until helper/policy is implemented and tested. |
| Student invitation gating | P0 for future invite task | Pending Professor must not issue Student invitations. | Check approved `account_roles` and future Professor status before create invitation. |
| Invitation redemption | P2 | Professor submit should not write `invitation_redemptions` yet. | Keep deferred until atomic acceptance/redemption workflow exists. |
| Audit integration | P2 | Role application submit should be auditable. | Add audit in later Admin/Audit sprint. |

## 11. Next Codex Task

Recommended next task:

**Sprint 2 Invitation Engine Task 31 - Professor Role Application Submit**

Scope recommendation:

- implement `submitProfessorRoleApplication()` as authenticated-only
- require valid Professor Admin Invitation context while public application remains OFF
- insert `role_applications` only through `requestRole("professor", reason)`
- unauthenticated users see sign-in/create-account guidance
- no `account_roles`, `professors`, `students`, `professor_students`, Student invitation, or `invitation_redemptions` writes
- no Student PII select
- no service role fallback
- raw invitation token is never logged, displayed, or stored

Validation required for Task 31:

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `git diff --check`
- confirm no `createSupabaseAdminClient` import in app/components scope

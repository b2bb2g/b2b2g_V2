-- 002 Role Compatibility Migration
--
-- Purpose:
-- - Introduce additive-only role compatibility tables for the Account/Role model.
-- - Do not switch runtime permission authority in this migration.
-- - Do not apply this migration to production until backup/snapshot and
--   Supabase migration metadata alignment are confirmed.
--
-- Dependency note:
-- - This file is intended for the current B2BB2G V2 baseline documented in
--   docs/07-implementation/04-supabase-health-audit.md.
-- - It expects public.profiles to already exist from the foundation schema.
-- - It intentionally does not repair Supabase migration metadata.
--
-- Explicit non-goals:
-- - No destructive change.
-- - No profiles.member_type_id deletion.
-- - No profile_roles deletion or rename.
-- - No member_types deletion or rename.
-- - No SECURITY DEFINER helper.
-- - No RLS policy creation or mutation.
-- - No data backfill.
-- - No production apply in this task.

begin;

create table if not exists public.account_roles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.profiles(id),
  role_key text not null,
  status text not null default 'active',
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint account_roles_role_key_not_blank check (length(trim(role_key)) > 0),
  constraint account_roles_status_check check (
    status in (
      'requested',
      'under_review',
      'active',
      'approved',
      'rejected',
      'revoked',
      'suspended',
      'inactive'
    )
  )
);

comment on table public.account_roles is
'Additive compatibility table for Account-based multi-role assignments. This is the target role authority after later helper/RLS migration, but this migration does not switch runtime authorization.';

comment on column public.account_roles.account_id is
'Account profile id. Maps to profiles.id and replaces profile_roles.profile_id after later migration review.';

comment on column public.account_roles.role_key is
'Role code/key stored as text for compatibility. Enum creation is intentionally deferred.';

comment on column public.account_roles.status is
'Compatibility role status. Later RLS helpers must treat only approved/active states as permission-granting and ignore revoked, suspended, inactive, rejected, deleted rows.';

comment on column public.account_roles.approved_by is
'Admin account that approved or granted the role when known. Nullable for compatibility and future backfill review.';

comment on column public.account_roles.deleted_at is
'Soft delete marker. Active uniqueness is enforced only where deleted_at is null.';

create unique index if not exists account_roles_account_role_active_unique
on public.account_roles (account_id, role_key)
where deleted_at is null;

create index if not exists account_roles_account_id_idx
on public.account_roles (account_id);

create index if not exists account_roles_role_key_idx
on public.account_roles (role_key);

create index if not exists account_roles_status_idx
on public.account_roles (status);

create index if not exists account_roles_deleted_at_idx
on public.account_roles (deleted_at);

create table if not exists public.role_applications (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.profiles(id),
  requested_role_key text not null,
  status text not null default 'submitted',
  reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint role_applications_requested_role_key_not_blank check (
    length(trim(requested_role_key)) > 0
  ),
  constraint role_applications_status_check check (
    status in (
      'draft',
      'submitted',
      'requested',
      'under_review',
      'approved',
      'rejected',
      'withdrawn',
      'cancelled'
    )
  )
);

comment on table public.role_applications is
'Additive compatibility table for role request/review workflow. It does not grant permissions by itself.';

comment on column public.role_applications.account_id is
'Applicant account profile id.';

comment on column public.role_applications.requested_role_key is
'Requested role code/key stored as text for compatibility. Enum creation is intentionally deferred.';

comment on column public.role_applications.status is
'Role application workflow status. Permission is not granted from this table without later Admin approval and account_roles migration.';

comment on column public.role_applications.reason is
'Applicant-provided reason or context for requesting the role.';

comment on column public.role_applications.reviewed_by is
'Admin account that reviewed the application when known.';

comment on column public.role_applications.rejection_reason is
'Admin-provided rejection reason. Must not contain sensitive unrelated PII.';

create index if not exists role_applications_account_id_idx
on public.role_applications (account_id);

create index if not exists role_applications_requested_role_key_idx
on public.role_applications (requested_role_key);

create index if not exists role_applications_status_idx
on public.role_applications (status);

create index if not exists role_applications_deleted_at_idx
on public.role_applications (deleted_at);

create index if not exists role_applications_reviewed_by_idx
on public.role_applications (reviewed_by);

create index if not exists role_applications_open_request_idx
on public.role_applications (account_id, requested_role_key, status)
where deleted_at is null
  and status in ('draft', 'submitted', 'requested', 'under_review');

comment on column public.profiles.member_type_id is
'Legacy single-role member type field. Kept for compatibility only. Do not use as final permission authority; use account_roles after helper/RLS migration.';

comment on table public.profile_roles is
'Legacy profile-role join table. Kept for compatibility. Do not drop or rename in 002; account_roles is introduced additively and becomes authority only after later helper/RLS migration.';

comment on table public.member_types is
'Legacy member type master. Kept as display/compatibility data. Do not use as final permission authority after account_roles migration.';

-- Compatibility view decision:
-- - No compatibility view is created in 002.
-- - A view that merges profile_roles, member_types, and account_roles could
--   accidentally imply a permission authority switch before RLS helpers exist.
-- - If a compatibility view is needed later, define it after role mapping,
--   backup/snapshot, and migration metadata alignment are confirmed.

-- RLS decision:
-- - RLS enablement and policies for account_roles and role_applications are
--   intentionally deferred to 010_rls_policies.sql.
-- - SECURITY DEFINER helpers are intentionally deferred to
--   009_rls_helpers.sql.
-- - Until those migrations are reviewed, application code must not depend on
--   account_roles as the sole runtime permission authority.

-- Backfill decision:
-- - No data backfill is performed in this migration.
-- - profile_roles and profiles.member_type_id migration/backfill requires
--   production backup/snapshot, migration metadata alignment, and role mapping
--   review before execution.

-- Rollback guide:
-- - Before production use: this additive migration can be rolled back by
--   disabling application references to account_roles and role_applications.
-- - After production use: prefer usage disable / application rollback first.
-- - Do not drop account_roles or role_applications in production without
--   backup, dependency review, and explicit owner approval.
-- - Never rollback by restoring profiles.member_type_id as the permission
--   authority for new code paths.

commit;

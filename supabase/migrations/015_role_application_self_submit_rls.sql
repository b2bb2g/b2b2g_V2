-- 015 Role Application Self Submit RLS
--
-- Purpose:
-- - Allow authenticated users to submit and read their own role_applications.
-- - Allow Administrators to review role_applications through select/update.
-- - Keep account_roles, companies, and suppliers untouched.
--
-- Actual role_applications columns from 002_role_compatibility.sql:
-- - id
-- - account_id
-- - requested_role_key
-- - status
-- - reason
-- - reviewed_by
-- - reviewed_at
-- - rejection_reason
-- - created_at
-- - updated_at
-- - deleted_at
--
-- Explicit non-goals:
-- - No production apply in this task.
-- - No account_roles policy or data mutation.
-- - No companies/suppliers policy or data mutation.
-- - No delete policy.
-- - No public/anon policy.
-- - No SECURITY DEFINER helper creation.
-- - No service role dependency.
-- - No data backfill.

begin;

alter table public.role_applications enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'role_applications'
      and policyname = 'role_applications_owner_select'
  ) then
    execute $policy$
      create policy role_applications_owner_select
      on public.role_applications
      for select
      to authenticated
      using (
        account_id = auth.uid()
        and deleted_at is null
      )
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'role_applications'
      and policyname = 'role_applications_owner_insert'
  ) then
    execute $policy$
      create policy role_applications_owner_insert
      on public.role_applications
      for insert
      to authenticated
      with check (
        account_id = auth.uid()
        and status = 'submitted'
        and reviewed_by is null
        and reviewed_at is null
        and rejection_reason is null
        and deleted_at is null
      )
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'role_applications'
      and policyname = 'role_applications_admin_select'
  ) then
    execute $policy$
      create policy role_applications_admin_select
      on public.role_applications
      for select
      to authenticated
      using (public.is_admin())
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'role_applications'
      and policyname = 'role_applications_admin_update'
  ) then
    execute $policy$
      create policy role_applications_admin_update
      on public.role_applications
      for update
      to authenticated
      using (public.is_admin())
      with check (public.is_admin())
    $policy$;
  end if;
end
$$;

comment on table public.role_applications is
'Role request/review workflow. RLS in 015 allows authenticated owner self-submit/read and Admin review update. It does not grant permissions by itself; account_roles remains Admin-controlled.';

-- Policy boundary:
-- - Owner can insert only submitted rows where account_id = auth.uid().
-- - Owner can select only own non-deleted applications.
-- - Admin can select/update for review.
-- - No owner update policy is created in this migration.
-- - No delete policy is created.
-- - No account_roles insert/update policy is created.
-- - No companies/suppliers insert/update policy is created.
--
-- Rollback guide:
-- - Before production apply, remove this file from the deployment set.
-- - After production apply, prefer disabling the Supplier submit UI/action first.
-- - If policy rollback is required, drop only the policies added here after
--   explicit owner approval.
-- - Do not disable RLS on role_applications as rollback.

commit;

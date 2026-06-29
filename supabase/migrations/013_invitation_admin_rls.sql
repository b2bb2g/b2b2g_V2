-- 013 Invitation Admin RLS
--
-- Purpose:
-- - Allow only authenticated Administrators to manage Invitation Engine
--   records through the server client after 012 enabled RLS without policies.
-- - Use the existing public.is_admin() helper.
--
-- Explicit non-goals:
-- - No public read/write policy.
-- - No anon policy.
-- - No Supplier, Buyer, Agent, Professor, or Student policy.
-- - No SECURITY DEFINER helper creation.
-- - No service role dependency.
-- - No data mutation or backfill.
-- - No destructive change.

begin;

alter table public.invitations enable row level security;
alter table public.invitation_tokens enable row level security;
alter table public.invitation_redemptions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitations'
      and policyname = 'invitations_admin_select'
  ) then
    execute 'create policy invitations_admin_select on public.invitations for select to authenticated using (public.is_admin())';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitations'
      and policyname = 'invitations_admin_insert'
  ) then
    execute 'create policy invitations_admin_insert on public.invitations for insert to authenticated with check (public.is_admin())';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitations'
      and policyname = 'invitations_admin_update'
  ) then
    execute 'create policy invitations_admin_update on public.invitations for update to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitation_tokens'
      and policyname = 'invitation_tokens_admin_select'
  ) then
    execute 'create policy invitation_tokens_admin_select on public.invitation_tokens for select to authenticated using (public.is_admin())';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitation_tokens'
      and policyname = 'invitation_tokens_admin_insert'
  ) then
    execute 'create policy invitation_tokens_admin_insert on public.invitation_tokens for insert to authenticated with check (public.is_admin())';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitation_tokens'
      and policyname = 'invitation_tokens_admin_update'
  ) then
    execute 'create policy invitation_tokens_admin_update on public.invitation_tokens for update to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitation_redemptions'
      and policyname = 'invitation_redemptions_admin_select'
  ) then
    execute 'create policy invitation_redemptions_admin_select on public.invitation_redemptions for select to authenticated using (public.is_admin())';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitation_redemptions'
      and policyname = 'invitation_redemptions_admin_insert'
  ) then
    execute 'create policy invitation_redemptions_admin_insert on public.invitation_redemptions for insert to authenticated with check (public.is_admin())';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitation_redemptions'
      and policyname = 'invitation_redemptions_admin_update'
  ) then
    execute 'create policy invitation_redemptions_admin_update on public.invitation_redemptions for update to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
end
$$;

comment on table public.invitations is
'Invitation Engine lifecycle table. Admin-only RLS policies are defined in 013; no public/user-facing policy is present. Raw invitation tokens must never be stored.';

comment on table public.invitation_tokens is
'Invitation token hash table. Admin-only RLS policies are defined in 013; raw tokens must never be stored, logged, or exposed.';

comment on table public.invitation_redemptions is
'Invitation redemption audit table. Admin-only RLS policies are defined in 013; public/user-facing redemption is deferred.';

-- Policy boundary:
-- - No delete policy is created.
-- - No public, anon, Supplier, Buyer, Agent, Professor, or Student policy is
--   created in this migration.
-- - User-facing token acceptance remains blocked until a separately reviewed
--   RLS design creates a limited acceptance path.
--
-- Rollback guide:
-- - Before production use, prefer disabling application references.
-- - If policy rollback is required, drop only the policies added in this file
--   after explicit owner approval.
-- - Do not drop invitation tables as rollback.

commit;

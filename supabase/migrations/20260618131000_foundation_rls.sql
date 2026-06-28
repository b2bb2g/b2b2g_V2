-- SQL 01
-- Title: Foundation RLS helpers and baseline policies
-- Depends on: SQL 00 foundation identity and master data schema

begin;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select profiles.id
  from public.profiles
  where profiles.id = auth.uid()
    and profiles.deleted_at is null
  limit 1
$$;

create or replace function public.has_member_type(member_type_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    join public.member_types on member_types.id = profiles.member_type_id
    where profiles.id = auth.uid()
      and profiles.deleted_at is null
      and profiles.activity_status = 'active'
      and member_types.code = member_type_code
      and member_types.is_active = true
      and member_types.deleted_at is null
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_member_type('administrator')
    or exists (
      select 1
      from public.profile_roles
      join public.roles on roles.id = profile_roles.role_id
      where profile_roles.profile_id = auth.uid()
        and roles.code in ('administrator', 'super_admin')
        and roles.is_active = true
        and roles.deleted_at is null
    )
$$;

create or replace function public.has_permission(permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.profile_roles
      join public.role_permissions on role_permissions.role_id = profile_roles.role_id
      join public.permissions on permissions.id = role_permissions.permission_id
      join public.roles on roles.id = profile_roles.role_id
      where profile_roles.profile_id = auth.uid()
        and permissions.code = permission_code
        and permissions.is_active = true
        and permissions.deleted_at is null
        and roles.is_active = true
        and roles.deleted_at is null
    )
$$;

create or replace function public.is_profile_owner(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = target_profile_id
$$;

alter table public.languages enable row level security;
alter table public.regions enable row level security;
alter table public.countries enable row level security;
alter table public.industries enable row level security;
alter table public.company_types enable row level security;
alter table public.member_types enable row level security;
alter table public.career_ranks enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profile_roles enable row level security;

create policy languages_public_select
on public.languages
for select
using (is_active = true and deleted_at is null);

create policy languages_admin_all
on public.languages
for all
using (public.is_admin())
with check (public.is_admin());

create policy regions_public_select
on public.regions
for select
using (is_active = true and deleted_at is null);

create policy regions_admin_all
on public.regions
for all
using (public.is_admin())
with check (public.is_admin());

create policy countries_public_select
on public.countries
for select
using (status = 'active' and is_active = true and deleted_at is null);

create policy countries_admin_all
on public.countries
for all
using (public.is_admin())
with check (public.is_admin());

create policy industries_public_select
on public.industries
for select
using (is_active = true and deleted_at is null);

create policy industries_admin_all
on public.industries
for all
using (public.is_admin())
with check (public.is_admin());

create policy company_types_public_select
on public.company_types
for select
using (is_active = true and deleted_at is null);

create policy company_types_admin_all
on public.company_types
for all
using (public.is_admin())
with check (public.is_admin());

create policy member_types_authenticated_select
on public.member_types
for select
to authenticated
using (is_active = true and deleted_at is null);

create policy member_types_admin_all
on public.member_types
for all
using (public.is_admin())
with check (public.is_admin());

create policy career_ranks_public_select
on public.career_ranks
for select
using (is_active = true and deleted_at is null);

create policy career_ranks_admin_all
on public.career_ranks
for all
using (public.is_admin())
with check (public.is_admin());

create policy profiles_owner_select
on public.profiles
for select
using (public.is_profile_owner(id) or public.is_admin());

create policy profiles_owner_update
on public.profiles
for update
using (public.is_profile_owner(id) or public.is_admin())
with check (public.is_profile_owner(id) or public.is_admin());

create policy profiles_admin_insert
on public.profiles
for insert
with check (public.is_admin());

create policy profiles_admin_delete
on public.profiles
for delete
using (public.is_admin());

create policy roles_admin_all
on public.roles
for all
using (public.is_admin())
with check (public.is_admin());

create policy permissions_admin_all
on public.permissions
for all
using (public.is_admin())
with check (public.is_admin());

create policy role_permissions_admin_all
on public.role_permissions
for all
using (public.is_admin())
with check (public.is_admin());

create policy profile_roles_self_select
on public.profile_roles
for select
using (profile_id = auth.uid() or public.is_admin());

create policy profile_roles_admin_all
on public.profile_roles
for all
using (public.is_admin())
with check (public.is_admin());

commit;

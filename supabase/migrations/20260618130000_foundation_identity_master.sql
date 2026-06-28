-- SQL 00
-- Title: Foundation identity and master data schema
-- Applies before: SQL 01 foundation RLS

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.languages (
  code text primary key,
  name text not null,
  native_name text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint languages_code_format check (code ~ '^[a-z]{2}(-[A-Z]{2})?$')
);

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  region_id uuid references public.regions(id) on delete set null,
  code text not null unique,
  name text not null,
  status text not null default 'active',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint countries_code_format check (code ~ '^[A-Z]{2}$'),
  constraint countries_status_check check (status in ('active', 'inactive'))
);

create table if not exists public.industries (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.industries(id) on delete set null,
  code text not null unique,
  name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.company_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.member_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_system boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint member_types_code_check check (
    code in (
      'administrator',
      'supplier',
      'buyer',
      'agent',
      'professor',
      'student'
    )
  )
);

create table if not exists public.career_ranks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  level_order integer not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  phone text,
  country_id uuid references public.countries(id) on delete set null,
  member_type_id uuid not null references public.member_types(id),
  career_rank_id uuid references public.career_ranks(id) on delete set null,
  approval_status text not null default 'pending',
  activity_status text not null default 'active',
  primary_language text references public.languages(code) on delete set null,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) deferrable initially deferred,
  updated_by uuid references public.profiles(id) deferrable initially deferred,
  deleted_by uuid references public.profiles(id) deferrable initially deferred,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint profiles_approval_status_check check (
    approval_status in ('pending', 'approved', 'rejected', 'suspended')
  ),
  constraint profiles_activity_status_check check (
    activity_status in ('active', 'inactive', 'blocked')
  )
);

create unique index if not exists profiles_email_lower_unique
on public.profiles (lower(email))
where deleted_at is null;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_system boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_system boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, role_id)
);

create index if not exists regions_sort_order_idx on public.regions(sort_order);
create index if not exists countries_region_id_idx on public.countries(region_id);
create index if not exists countries_status_idx on public.countries(status);
create index if not exists countries_sort_order_idx on public.countries(sort_order);
create index if not exists industries_parent_id_idx on public.industries(parent_id);
create index if not exists industries_sort_order_idx on public.industries(sort_order);
create index if not exists company_types_sort_order_idx on public.company_types(sort_order);
create index if not exists profiles_country_id_idx on public.profiles(country_id);
create index if not exists profiles_member_type_id_idx on public.profiles(member_type_id);
create index if not exists profiles_career_rank_id_idx on public.profiles(career_rank_id);
create index if not exists profiles_approval_status_idx on public.profiles(approval_status);
create index if not exists profiles_activity_status_idx on public.profiles(activity_status);
create index if not exists career_ranks_level_order_idx on public.career_ranks(level_order);

drop trigger if exists languages_set_updated_at on public.languages;
create trigger languages_set_updated_at
before update on public.languages
for each row execute function public.set_updated_at();

drop trigger if exists regions_set_updated_at on public.regions;
create trigger regions_set_updated_at
before update on public.regions
for each row execute function public.set_updated_at();

drop trigger if exists countries_set_updated_at on public.countries;
create trigger countries_set_updated_at
before update on public.countries
for each row execute function public.set_updated_at();

drop trigger if exists industries_set_updated_at on public.industries;
create trigger industries_set_updated_at
before update on public.industries
for each row execute function public.set_updated_at();

drop trigger if exists company_types_set_updated_at on public.company_types;
create trigger company_types_set_updated_at
before update on public.company_types
for each row execute function public.set_updated_at();

drop trigger if exists member_types_set_updated_at on public.member_types;
create trigger member_types_set_updated_at
before update on public.member_types
for each row execute function public.set_updated_at();

drop trigger if exists career_ranks_set_updated_at on public.career_ranks;
create trigger career_ranks_set_updated_at
before update on public.career_ranks
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists roles_set_updated_at on public.roles;
create trigger roles_set_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

drop trigger if exists permissions_set_updated_at on public.permissions;
create trigger permissions_set_updated_at
before update on public.permissions
for each row execute function public.set_updated_at();

commit;

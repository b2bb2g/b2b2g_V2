-- SQL 28
-- Title: Member referral codes for Agent and Professor invitations
-- Depends on: SQL 02 member and company domain schema, SQL 13 matching/referral/reward/badge RLS policies

begin;

create table if not exists public.member_referral_codes (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  owner_member_type text not null,
  target_member_type text not null,
  code text not null unique,
  referral_url text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint member_referral_codes_code_format check (code ~ '^[A-Z0-9_-]{4,40}$'),
  constraint member_referral_codes_owner_type_check check (
    owner_member_type in ('agent', 'professor')
  ),
  constraint member_referral_codes_target_type_check check (
    target_member_type in ('buyer', 'student')
  ),
  constraint member_referral_codes_role_target_check check (
    (owner_member_type = 'agent' and target_member_type = 'buyer')
    or (owner_member_type = 'professor' and target_member_type = 'student')
  )
);

create unique index if not exists member_referral_codes_owner_target_uidx
on public.member_referral_codes(owner_profile_id, target_member_type)
where deleted_at is null;

create index if not exists member_referral_codes_owner_profile_id_idx
on public.member_referral_codes(owner_profile_id);

create index if not exists member_referral_codes_target_member_type_idx
on public.member_referral_codes(target_member_type);

create table if not exists public.member_referral_signups (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid not null references public.member_referral_codes(id) on delete restrict,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  referred_profile_id uuid not null unique references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  joined_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint member_referral_signups_owner_referred_check check (
    owner_profile_id <> referred_profile_id
  ),
  constraint member_referral_signups_status_check check (
    status in ('pending', 'active', 'rejected')
  )
);

create index if not exists member_referral_signups_code_id_idx
on public.member_referral_signups(referral_code_id);

create index if not exists member_referral_signups_owner_profile_id_idx
on public.member_referral_signups(owner_profile_id);

drop trigger if exists member_referral_codes_set_updated_at on public.member_referral_codes;
create trigger member_referral_codes_set_updated_at
before update on public.member_referral_codes
for each row execute function public.set_updated_at();

drop trigger if exists member_referral_signups_set_updated_at on public.member_referral_signups;
create trigger member_referral_signups_set_updated_at
before update on public.member_referral_signups
for each row execute function public.set_updated_at();

alter table public.member_referral_codes enable row level security;
alter table public.member_referral_signups enable row level security;

create policy member_referral_codes_owner_select
on public.member_referral_codes
for select
using (
  public.is_admin()
  or owner_profile_id = auth.uid()
);

create policy member_referral_codes_public_active_select
on public.member_referral_codes
for select
using (
  is_active = true
  and deleted_at is null
);

create policy member_referral_codes_admin_all
on public.member_referral_codes
for all
using (public.is_admin())
with check (public.is_admin());

create policy member_referral_signups_related_select
on public.member_referral_signups
for select
using (
  public.is_admin()
  or owner_profile_id = auth.uid()
  or referred_profile_id = auth.uid()
);

create policy member_referral_signups_admin_all
on public.member_referral_signups
for all
using (public.is_admin())
with check (public.is_admin());

commit;

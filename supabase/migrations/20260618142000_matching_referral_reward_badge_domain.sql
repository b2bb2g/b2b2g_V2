-- SQL 12
-- Title: Matching, Referral, Reward, and Badge schema
-- Depends on: SQL 02 member and company domain schema

begin;

create table if not exists public.matching_requests (
  id uuid primary key default gen_random_uuid(),
  requester_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_profile_id uuid references public.profiles(id) on delete set null,
  matching_type text not null,
  status text not null default 'requested',
  admin_note text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint matching_requests_type_check check (
    matching_type in (
      'supplier_buyer',
      'buyer_agent',
      'professor_supplier',
      'student_buyer'
    )
  ),
  constraint matching_requests_status_check check (
    status in ('requested', 'reviewing', 'approved', 'rejected', 'closed')
  )
);

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null unique references public.buyers(id) on delete cascade,
  code text not null unique,
  referral_url text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint referral_codes_code_format check (code ~ '^[A-Z0-9_-]{4,40}$')
);

create table if not exists public.referral_relations (
  id uuid primary key default gen_random_uuid(),
  parent_buyer_id uuid not null references public.buyers(id) on delete cascade,
  child_buyer_id uuid not null unique references public.buyers(id) on delete cascade,
  referral_code_id uuid not null references public.referral_codes(id) on delete restrict,
  status text not null default 'active',
  reward_status text not null default 'pending',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint referral_relations_parent_child_check check (parent_buyer_id <> child_buyer_id),
  constraint referral_relations_status_check check (
    status in ('active', 'inactive', 'blocked')
  ),
  constraint referral_relations_reward_status_check check (
    reward_status in ('pending', 'eligible', 'approved', 'rejected', 'paid')
  )
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reward_type text not null,
  status text not null default 'pending',
  amount numeric(12, 2),
  currency text,
  source_table text,
  source_id uuid,
  admin_note text,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint rewards_status_check check (
    status in ('pending', 'approved', 'rejected', 'paid', 'cancelled')
  ),
  constraint rewards_type_check check (
    reward_type in ('referral', 'student_acquisition', 'agent_performance', 'manual')
  )
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  criteria jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.profile_badges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_by uuid references public.profiles(id) on delete set null,
  awarded_at timestamptz not null default now(),
  revoked_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint profile_badges_unique unique (profile_id, badge_id)
);

create index if not exists matching_requests_requester_profile_id_idx on public.matching_requests(requester_profile_id);
create index if not exists matching_requests_target_profile_id_idx on public.matching_requests(target_profile_id);
create index if not exists matching_requests_type_idx on public.matching_requests(matching_type);
create index if not exists matching_requests_status_idx on public.matching_requests(status);

create index if not exists referral_codes_buyer_id_idx on public.referral_codes(buyer_id);
create index if not exists referral_relations_parent_buyer_id_idx on public.referral_relations(parent_buyer_id);
create index if not exists referral_relations_child_buyer_id_idx on public.referral_relations(child_buyer_id);
create index if not exists referral_relations_referral_code_id_idx on public.referral_relations(referral_code_id);
create index if not exists referral_relations_status_idx on public.referral_relations(status);
create index if not exists referral_relations_reward_status_idx on public.referral_relations(reward_status);

create index if not exists rewards_profile_id_idx on public.rewards(profile_id);
create index if not exists rewards_type_idx on public.rewards(reward_type);
create index if not exists rewards_status_idx on public.rewards(status);
create index if not exists rewards_source_idx on public.rewards(source_table, source_id);

create index if not exists badges_active_idx on public.badges(is_active);
create index if not exists profile_badges_profile_id_idx on public.profile_badges(profile_id);
create index if not exists profile_badges_badge_id_idx on public.profile_badges(badge_id);

drop trigger if exists matching_requests_set_updated_at on public.matching_requests;
create trigger matching_requests_set_updated_at
before update on public.matching_requests
for each row execute function public.set_updated_at();

drop trigger if exists referral_codes_set_updated_at on public.referral_codes;
create trigger referral_codes_set_updated_at
before update on public.referral_codes
for each row execute function public.set_updated_at();

drop trigger if exists referral_relations_set_updated_at on public.referral_relations;
create trigger referral_relations_set_updated_at
before update on public.referral_relations
for each row execute function public.set_updated_at();

drop trigger if exists rewards_set_updated_at on public.rewards;
create trigger rewards_set_updated_at
before update on public.rewards
for each row execute function public.set_updated_at();

drop trigger if exists badges_set_updated_at on public.badges;
create trigger badges_set_updated_at
before update on public.badges
for each row execute function public.set_updated_at();

drop trigger if exists profile_badges_set_updated_at on public.profile_badges;
create trigger profile_badges_set_updated_at
before update on public.profile_badges
for each row execute function public.set_updated_at();

commit;

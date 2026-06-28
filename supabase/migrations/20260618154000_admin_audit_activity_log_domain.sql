-- SQL 24
-- Title: Admin Audit and Activity Log schema
-- Depends on: SQL 00 foundation identity/master schema, SQL 02 member/company schema

begin;

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  target_label text,
  before_data jsonb,
  after_data jsonb,
  reason text,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint admin_logs_action_check check (
    action in (
      'member_approve',
      'member_reject',
      'member_suspend',
      'company_approve',
      'company_verify',
      'company_suspend',
      'product_approve',
      'product_reject',
      'buy_sell_approve',
      'buy_sell_reject',
      'buy_request_approve',
      'buy_request_reject',
      'fda_status_change',
      'badge_grant',
      'reward_approve',
      'message_block',
      'setting_change',
      'menu_change',
      'category_change',
      'translation_change',
      'manual'
    )
  )
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  event_level text not null,
  event_type text not null,
  severity text not null default 'info',
  actor_profile_id uuid references public.profiles(id) on delete set null,
  target_table text,
  target_id uuid,
  request_id text,
  ip_address inet,
  user_agent text,
  error_code text,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint audit_events_level_check check (
    event_level in ('business', 'security', 'system')
  ),
  constraint audit_events_type_check check (
    event_type in (
      'login_failed',
      'unauthorized_access',
      'file_access_failed',
      'api_rate_limited',
      'rls_blocked',
      'message_blocked',
      'admin_action',
      'system_change',
      'manual'
    )
  ),
  constraint audit_events_severity_check check (
    severity in ('info', 'warning', 'error', 'critical')
  )
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  activity_type text not null,
  target_table text,
  target_id uuid,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint activity_logs_type_check check (
    activity_type in (
      'profile_updated',
      'company_submitted',
      'company_approved',
      'product_submitted',
      'product_approved',
      'showcase_created',
      'showcase_shared',
      'showcase_inquiry_received',
      'market_research_submitted',
      'buyer_referred',
      'matching_requested',
      'matching_approved',
      'event_applied',
      'event_attended',
      'fda_application_submitted',
      'badge_received',
      'reward_approved',
      'career_rank_changed',
      'manual'
    )
  )
);

create index if not exists admin_logs_actor_profile_id_idx on public.admin_logs(actor_profile_id);
create index if not exists admin_logs_action_idx on public.admin_logs(action);
create index if not exists admin_logs_target_idx on public.admin_logs(target_table, target_id);
create index if not exists admin_logs_occurred_at_idx on public.admin_logs(occurred_at);

create index if not exists audit_events_level_idx on public.audit_events(event_level);
create index if not exists audit_events_type_idx on public.audit_events(event_type);
create index if not exists audit_events_severity_idx on public.audit_events(severity);
create index if not exists audit_events_actor_profile_id_idx on public.audit_events(actor_profile_id);
create index if not exists audit_events_target_idx on public.audit_events(target_table, target_id);
create index if not exists audit_events_occurred_at_idx on public.audit_events(occurred_at);

create index if not exists activity_logs_profile_id_idx on public.activity_logs(profile_id);
create index if not exists activity_logs_actor_profile_id_idx on public.activity_logs(actor_profile_id);
create index if not exists activity_logs_type_idx on public.activity_logs(activity_type);
create index if not exists activity_logs_target_idx on public.activity_logs(target_table, target_id);
create index if not exists activity_logs_occurred_at_idx on public.activity_logs(occurred_at);

drop trigger if exists admin_logs_set_updated_at on public.admin_logs;
create trigger admin_logs_set_updated_at before update on public.admin_logs
for each row execute function public.set_updated_at();

drop trigger if exists audit_events_set_updated_at on public.audit_events;
create trigger audit_events_set_updated_at before update on public.audit_events
for each row execute function public.set_updated_at();

drop trigger if exists activity_logs_set_updated_at on public.activity_logs;
create trigger activity_logs_set_updated_at before update on public.activity_logs
for each row execute function public.set_updated_at();

commit;

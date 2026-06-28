-- SQL 22
-- Title: Analytics and KPI schema
-- Depends on: SQL 02 member/company schema, SQL 10 Student Showcase schema, SQL 12 matching/referral/reward/badge schema, SQL 14 event/FDA schema

begin;

create table if not exists public.showcase_views (
  id uuid primary key default gen_random_uuid(),
  showcase_id uuid not null references public.student_showcases(id) on delete cascade,
  viewer_profile_id uuid references public.profiles(id) on delete set null,
  session_id text,
  country_id uuid references public.countries(id) on delete set null,
  user_agent text,
  referrer text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.showcase_shares (
  id uuid primary key default gen_random_uuid(),
  showcase_id uuid not null references public.student_showcases(id) on delete cascade,
  sharer_profile_id uuid references public.profiles(id) on delete set null,
  channel text not null default 'direct',
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint showcase_shares_channel_check check (
    channel in ('direct', 'email', 'linkedin', 'facebook', 'x', 'kakaotalk', 'line', 'whatsapp')
  )
);

create table if not exists public.showcase_inquiries (
  id uuid primary key default gen_random_uuid(),
  showcase_id uuid not null references public.student_showcases(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  buyer_id uuid references public.buyers(id) on delete set null,
  inquirer_profile_id uuid references public.profiles(id) on delete set null,
  inquiry_type text not null default 'buyer_connection',
  status text not null default 'new',
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
  constraint showcase_inquiries_type_check check (
    inquiry_type in ('buyer_connection', 'product_inquiry', 'matching_request')
  ),
  constraint showcase_inquiries_status_check check (
    status in ('new', 'reviewing', 'connected', 'closed', 'rejected')
  )
);

create table if not exists public.buyer_sources (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null unique references public.buyers(id) on delete cascade,
  source_type text not null,
  source_profile_id uuid references public.profiles(id) on delete set null,
  source_student_id uuid references public.students(id) on delete set null,
  source_agent_id uuid references public.agents(id) on delete set null,
  source_event_id uuid references public.events(id) on delete set null,
  referral_relation_id uuid references public.referral_relations(id) on delete set null,
  landing_path text,
  campaign text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint buyer_sources_type_check check (
    source_type in ('referral', 'student', 'agent', 'event', 'direct', 'google')
  )
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  target_table text,
  target_id uuid,
  profile_id uuid references public.profiles(id) on delete set null,
  session_id text,
  country_id uuid references public.countries(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  is_anonymous boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint analytics_events_type_check check (
    event_type in (
      'company_view',
      'product_view',
      'showcase_view',
      'inquiry_click',
      'catalog_download',
      'buy_request_view',
      'event_view'
    )
  ),
  constraint analytics_events_target_table_check check (
    target_table is null
    or target_table in (
      'companies',
      'products',
      'student_showcases',
      'buy_sell_posts',
      'buy_requests',
      'events'
    )
  )
);

create table if not exists public.company_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  score numeric(6, 2) not null default 0,
  profile_completion_score numeric(6, 2) not null default 0,
  product_score numeric(6, 2) not null default 0,
  verification_score numeric(6, 2) not null default 0,
  response_score numeric(6, 2) not null default 0,
  score_factors jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  is_public boolean not null default true,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint company_scores_score_check check (score >= 0 and score <= 100),
  constraint company_scores_factor_checks check (
    profile_completion_score >= 0
    and profile_completion_score <= 100
    and product_score >= 0
    and product_score <= 100
    and verification_score >= 0
    and verification_score <= 100
    and response_score >= 0
    and response_score <= 100
  )
);

create index if not exists showcase_views_showcase_id_idx on public.showcase_views(showcase_id);
create index if not exists showcase_views_viewer_profile_id_idx on public.showcase_views(viewer_profile_id);
create index if not exists showcase_views_occurred_at_idx on public.showcase_views(occurred_at);

create index if not exists showcase_shares_showcase_id_idx on public.showcase_shares(showcase_id);
create index if not exists showcase_shares_sharer_profile_id_idx on public.showcase_shares(sharer_profile_id);
create index if not exists showcase_shares_occurred_at_idx on public.showcase_shares(occurred_at);

create index if not exists showcase_inquiries_showcase_id_idx on public.showcase_inquiries(showcase_id);
create index if not exists showcase_inquiries_product_id_idx on public.showcase_inquiries(product_id);
create index if not exists showcase_inquiries_buyer_id_idx on public.showcase_inquiries(buyer_id);
create index if not exists showcase_inquiries_status_idx on public.showcase_inquiries(status);

create index if not exists buyer_sources_buyer_id_idx on public.buyer_sources(buyer_id);
create index if not exists buyer_sources_type_idx on public.buyer_sources(source_type);
create index if not exists buyer_sources_student_id_idx on public.buyer_sources(source_student_id);
create index if not exists buyer_sources_agent_id_idx on public.buyer_sources(source_agent_id);

create index if not exists analytics_events_type_idx on public.analytics_events(event_type);
create index if not exists analytics_events_target_idx on public.analytics_events(target_table, target_id);
create index if not exists analytics_events_profile_id_idx on public.analytics_events(profile_id);
create index if not exists analytics_events_occurred_at_idx on public.analytics_events(occurred_at);

create index if not exists company_scores_company_id_idx on public.company_scores(company_id);
create index if not exists company_scores_score_idx on public.company_scores(score);
create index if not exists company_scores_public_idx on public.company_scores(is_public, is_active);

drop trigger if exists showcase_views_set_updated_at on public.showcase_views;
create trigger showcase_views_set_updated_at before update on public.showcase_views
for each row execute function public.set_updated_at();

drop trigger if exists showcase_shares_set_updated_at on public.showcase_shares;
create trigger showcase_shares_set_updated_at before update on public.showcase_shares
for each row execute function public.set_updated_at();

drop trigger if exists showcase_inquiries_set_updated_at on public.showcase_inquiries;
create trigger showcase_inquiries_set_updated_at before update on public.showcase_inquiries
for each row execute function public.set_updated_at();

drop trigger if exists buyer_sources_set_updated_at on public.buyer_sources;
create trigger buyer_sources_set_updated_at before update on public.buyer_sources
for each row execute function public.set_updated_at();

drop trigger if exists analytics_events_set_updated_at on public.analytics_events;
create trigger analytics_events_set_updated_at before update on public.analytics_events
for each row execute function public.set_updated_at();

drop trigger if exists company_scores_set_updated_at on public.company_scores;
create trigger company_scores_set_updated_at before update on public.company_scores
for each row execute function public.set_updated_at();

commit;

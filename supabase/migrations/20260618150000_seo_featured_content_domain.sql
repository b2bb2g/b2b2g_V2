-- SQL 20
-- Title: SEO and Featured Content schema
-- Depends on: SQL 08 content domain schema, SQL 14 event/FDA schema, SQL 18 file/storage metadata schema

begin;

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  file_id uuid references public.files(id) on delete set null,
  placement text not null default 'public_home',
  title text,
  subtitle text,
  link_url text,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_visible boolean not null default true,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint banners_placement_check check (
    placement in (
      'public_home',
      'public_section',
      'dashboard',
      'admin',
      'footer'
    )
  ),
  constraint banners_date_order_check check (
    starts_at is null
    or ends_at is null
    or starts_at <= ends_at
  )
);

create table if not exists public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  target_table text not null,
  target_id uuid not null,
  meta_title text,
  meta_description text,
  keywords text[] not null default '{}'::text[],
  og_image_file_id uuid references public.files(id) on delete set null,
  canonical_url text,
  structured_data jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint seo_metadata_target_unique unique (target_table, target_id),
  constraint seo_metadata_target_table_check check (
    target_table in (
      'companies',
      'products',
      'industrial_posts',
      'epc_posts',
      'buy_sell_posts',
      'events'
    )
  )
);

create table if not exists public.featured_contents (
  id uuid primary key default gen_random_uuid(),
  target_table text not null,
  target_id uuid not null,
  featured_level text not null default 'normal',
  featured_until timestamptz,
  featured_by uuid references public.profiles(id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint featured_contents_target_unique unique (target_table, target_id),
  constraint featured_contents_target_table_check check (
    target_table in ('companies', 'products', 'buy_sell_posts', 'events')
  ),
  constraint featured_contents_level_check check (
    featured_level in ('normal', 'featured', 'premium_featured', 'top_featured')
  )
);

create index if not exists banners_file_id_idx on public.banners(file_id);
create index if not exists banners_placement_idx on public.banners(placement);
create index if not exists banners_sort_order_idx on public.banners(sort_order);
create index if not exists banners_visible_idx on public.banners(is_visible, is_active);

create index if not exists seo_metadata_target_idx on public.seo_metadata(target_table, target_id);
create index if not exists seo_metadata_og_image_file_id_idx on public.seo_metadata(og_image_file_id);
create index if not exists seo_metadata_active_idx on public.seo_metadata(is_active);

create index if not exists featured_contents_target_idx on public.featured_contents(target_table, target_id);
create index if not exists featured_contents_level_idx on public.featured_contents(featured_level);
create index if not exists featured_contents_until_idx on public.featured_contents(featured_until);
create index if not exists featured_contents_sort_order_idx on public.featured_contents(sort_order);
create index if not exists featured_contents_active_idx on public.featured_contents(is_active);

drop trigger if exists banners_set_updated_at on public.banners;
create trigger banners_set_updated_at
before update on public.banners
for each row execute function public.set_updated_at();

drop trigger if exists seo_metadata_set_updated_at on public.seo_metadata;
create trigger seo_metadata_set_updated_at
before update on public.seo_metadata
for each row execute function public.set_updated_at();

drop trigger if exists featured_contents_set_updated_at on public.featured_contents;
create trigger featured_contents_set_updated_at
before update on public.featured_contents
for each row execute function public.set_updated_at();

commit;

-- SQL 04
-- Title: Settings, menus, categories, and translations schema
-- Depends on: SQL 00 foundation identity and master data schema

begin;

create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.menus(id) on delete cascade,
  code text not null unique,
  label_key text not null,
  href text not null,
  location text not null default 'public_main',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint menus_location_check check (
    location in ('public_main', 'dashboard', 'admin', 'footer')
  )
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  code text not null unique,
  name text not null,
  label_key text,
  domain text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint categories_domain_check check (
    domain in (
      'commercial',
      'industrial',
      'epc',
      'buy_sell',
      'buy_request',
      'event',
      'thailand_fda',
      'notice'
    )
  )
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  description text,
  is_public boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  language_code text not null references public.languages(code) on delete cascade,
  translation_key text not null,
  namespace text not null default 'common',
  value text not null,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint translations_unique_key unique (language_code, translation_key)
);

create index if not exists menus_parent_id_idx on public.menus(parent_id);
create index if not exists menus_location_sort_order_idx on public.menus(location, sort_order);
create index if not exists menus_visible_idx on public.menus(is_visible);
create index if not exists categories_parent_id_idx on public.categories(parent_id);
create index if not exists categories_domain_sort_order_idx on public.categories(domain, sort_order);
create index if not exists site_settings_public_idx on public.site_settings(is_public);
create index if not exists translations_language_namespace_idx on public.translations(language_code, namespace);
create index if not exists translations_key_idx on public.translations(translation_key);

drop trigger if exists menus_set_updated_at on public.menus;
create trigger menus_set_updated_at
before update on public.menus
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists translations_set_updated_at on public.translations;
create trigger translations_set_updated_at
before update on public.translations
for each row execute function public.set_updated_at();

commit;

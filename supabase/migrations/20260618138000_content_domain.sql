-- SQL 08
-- Title: Content domain schema
-- Depends on: SQL 02 member and company domain schema, SQL 04 settings domain schema

begin;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  industry_id uuid references public.industries(id) on delete set null,
  title text not null,
  summary text,
  description text,
  approval_status text not null default 'draft',
  main_file_id uuid,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint products_approval_status_check check (
    approval_status in ('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'suspended')
  )
);

create table if not exists public.industrial_posts (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  industry_id uuid references public.industries(id) on delete set null,
  title text not null,
  summary text,
  description text,
  approval_status text not null default 'draft',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint industrial_posts_approval_status_check check (
    approval_status in ('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'suspended')
  )
);

create table if not exists public.epc_posts (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  industry_id uuid references public.industries(id) on delete set null,
  project_country_id uuid references public.countries(id) on delete set null,
  project_scope text,
  title text not null,
  summary text,
  description text,
  approval_status text not null default 'draft',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint epc_posts_approval_status_check check (
    approval_status in ('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'suspended')
  )
);

create table if not exists public.buy_sell_posts (
  id uuid primary key default gen_random_uuid(),
  post_type text not null default 'sell_product',
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text,
  target_country_id uuid references public.countries(id) on delete set null,
  approval_status text not null default 'draft',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint buy_sell_posts_type_check check (post_type = 'sell_product'),
  constraint buy_sell_posts_approval_status_check check (
    approval_status in ('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'suspended')
  )
);

create table if not exists public.buy_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyers(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  industry_id uuid references public.industries(id) on delete set null,
  title text not null,
  quantity text,
  target_price text,
  destination_country_id uuid references public.countries(id) on delete set null,
  details text,
  approval_status text not null default 'draft',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint buy_requests_approval_status_check check (
    approval_status in ('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'suspended')
  )
);

create index if not exists products_supplier_id_idx on public.products(supplier_id);
create index if not exists products_company_id_idx on public.products(company_id);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_industry_id_idx on public.products(industry_id);
create index if not exists products_title_idx on public.products(title);
create index if not exists products_approval_status_idx on public.products(approval_status);

create index if not exists industrial_posts_supplier_id_idx on public.industrial_posts(supplier_id);
create index if not exists industrial_posts_company_id_idx on public.industrial_posts(company_id);
create index if not exists industrial_posts_category_id_idx on public.industrial_posts(category_id);
create index if not exists industrial_posts_approval_status_idx on public.industrial_posts(approval_status);

create index if not exists epc_posts_supplier_id_idx on public.epc_posts(supplier_id);
create index if not exists epc_posts_company_id_idx on public.epc_posts(company_id);
create index if not exists epc_posts_category_id_idx on public.epc_posts(category_id);
create index if not exists epc_posts_project_country_id_idx on public.epc_posts(project_country_id);
create index if not exists epc_posts_approval_status_idx on public.epc_posts(approval_status);

create index if not exists buy_sell_posts_author_profile_id_idx on public.buy_sell_posts(author_profile_id);
create index if not exists buy_sell_posts_supplier_id_idx on public.buy_sell_posts(supplier_id);
create index if not exists buy_sell_posts_category_id_idx on public.buy_sell_posts(category_id);
create index if not exists buy_sell_posts_target_country_id_idx on public.buy_sell_posts(target_country_id);
create index if not exists buy_sell_posts_approval_status_idx on public.buy_sell_posts(approval_status);

create index if not exists buy_requests_buyer_id_idx on public.buy_requests(buyer_id);
create index if not exists buy_requests_category_id_idx on public.buy_requests(category_id);
create index if not exists buy_requests_industry_id_idx on public.buy_requests(industry_id);
create index if not exists buy_requests_destination_country_id_idx on public.buy_requests(destination_country_id);
create index if not exists buy_requests_approval_status_idx on public.buy_requests(approval_status);
create index if not exists buy_requests_title_idx on public.buy_requests(title);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists industrial_posts_set_updated_at on public.industrial_posts;
create trigger industrial_posts_set_updated_at
before update on public.industrial_posts
for each row execute function public.set_updated_at();

drop trigger if exists epc_posts_set_updated_at on public.epc_posts;
create trigger epc_posts_set_updated_at
before update on public.epc_posts
for each row execute function public.set_updated_at();

drop trigger if exists buy_sell_posts_set_updated_at on public.buy_sell_posts;
create trigger buy_sell_posts_set_updated_at
before update on public.buy_sell_posts
for each row execute function public.set_updated_at();

drop trigger if exists buy_requests_set_updated_at on public.buy_requests;
create trigger buy_requests_set_updated_at
before update on public.buy_requests
for each row execute function public.set_updated_at();

commit;

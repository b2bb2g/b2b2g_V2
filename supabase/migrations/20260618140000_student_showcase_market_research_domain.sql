-- SQL 10
-- Title: Student Showcase and Market Research schema
-- Depends on: SQL 02 member and company domain schema, SQL 08 content domain schema

begin;

create table if not exists public.student_showcases (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  description text,
  target_country_id uuid references public.countries(id) on delete set null,
  approval_status text not null default 'draft',
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint student_showcases_approval_status_check check (
    approval_status in ('draft', 'submitted', 'reviewing', 'approved', 'rejected')
  )
);

create table if not exists public.student_showcase_items (
  id uuid primary key default gen_random_uuid(),
  showcase_id uuid not null references public.student_showcases(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  display_order integer not null default 0,
  student_note text,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint student_showcase_items_unique unique (showcase_id, product_id)
);

create table if not exists public.market_research_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  country_id uuid references public.countries(id) on delete set null,
  industry_id uuid references public.industries(id) on delete set null,
  title text not null,
  summary text,
  content text,
  approval_status text not null default 'draft',
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint market_research_reports_approval_status_check check (
    approval_status in ('draft', 'submitted', 'reviewing', 'approved', 'rejected')
  )
);

create index if not exists student_showcases_student_id_idx on public.student_showcases(student_id);
create index if not exists student_showcases_title_idx on public.student_showcases(title);
create index if not exists student_showcases_target_country_id_idx on public.student_showcases(target_country_id);
create index if not exists student_showcases_approval_status_idx on public.student_showcases(approval_status);
create index if not exists student_showcases_created_by_idx on public.student_showcases(created_by);

create index if not exists student_showcase_items_showcase_id_idx on public.student_showcase_items(showcase_id);
create index if not exists student_showcase_items_product_id_idx on public.student_showcase_items(product_id);
create index if not exists student_showcase_items_display_order_idx on public.student_showcase_items(display_order);

create index if not exists market_research_reports_student_id_idx on public.market_research_reports(student_id);
create index if not exists market_research_reports_country_id_idx on public.market_research_reports(country_id);
create index if not exists market_research_reports_industry_id_idx on public.market_research_reports(industry_id);
create index if not exists market_research_reports_title_idx on public.market_research_reports(title);
create index if not exists market_research_reports_approval_status_idx on public.market_research_reports(approval_status);
create index if not exists market_research_reports_created_by_idx on public.market_research_reports(created_by);

drop trigger if exists student_showcases_set_updated_at on public.student_showcases;
create trigger student_showcases_set_updated_at
before update on public.student_showcases
for each row execute function public.set_updated_at();

drop trigger if exists student_showcase_items_set_updated_at on public.student_showcase_items;
create trigger student_showcase_items_set_updated_at
before update on public.student_showcase_items
for each row execute function public.set_updated_at();

drop trigger if exists market_research_reports_set_updated_at on public.market_research_reports;
create trigger market_research_reports_set_updated_at
before update on public.market_research_reports
for each row execute function public.set_updated_at();

commit;

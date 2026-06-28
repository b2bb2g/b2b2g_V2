-- SQL 14
-- Title: Event and Thailand FDA schema
-- Depends on: SQL 02 member and company domain schema, SQL 04 settings domain schema

begin;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  summary text,
  description text,
  location text,
  event_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer,
  status text not null default 'draft',
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  published_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint events_capacity_check check (capacity is null or capacity >= 0),
  constraint events_date_order_check check (
    starts_at is null
    or ends_at is null
    or starts_at <= ends_at
  ),
  constraint events_status_check check (
    status in ('draft', 'published', 'cancelled', 'archived')
  )
);

create table if not exists public.event_applications (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'submitted',
  note text,
  admin_note text,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint event_applications_unique unique (event_id, profile_id),
  constraint event_applications_status_check check (
    status in ('submitted', 'approved', 'rejected', 'cancelled', 'attended')
  )
);

create table if not exists public.thailand_fda_applications (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  service_category text not null,
  product_name text not null,
  formula_summary text,
  status text not null default 'draft',
  quoted_amount numeric(12, 2),
  quoted_currency text,
  admin_note text,
  completion_report_file_id uuid,
  submitted_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  completed_at timestamptz,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint thailand_fda_applications_amount_check check (
    quoted_amount is null or quoted_amount >= 0
  ),
  constraint thailand_fda_applications_service_category_check check (
    service_category in (
      'cosmetic_registration',
      'food_supplement_registration',
      'food_registration',
      'medical_device_registration',
      'import_license_support',
      'label_compliance',
      'formula_review'
    )
  ),
  constraint thailand_fda_applications_status_check check (
    status in (
      'draft',
      'submitted',
      'reviewing',
      'waiting_documents',
      'quoted',
      'in_progress',
      'completed',
      'rejected'
    )
  )
);

create index if not exists events_category_id_idx on public.events(category_id);
create index if not exists events_status_idx on public.events(status);
create index if not exists events_starts_at_idx on public.events(starts_at);
create index if not exists events_title_idx on public.events(title);
create index if not exists events_created_by_idx on public.events(created_by);

create index if not exists event_applications_event_id_idx on public.event_applications(event_id);
create index if not exists event_applications_profile_id_idx on public.event_applications(profile_id);
create index if not exists event_applications_status_idx on public.event_applications(status);

create index if not exists thailand_fda_applications_supplier_id_idx on public.thailand_fda_applications(supplier_id);
create index if not exists thailand_fda_applications_service_category_idx on public.thailand_fda_applications(service_category);
create index if not exists thailand_fda_applications_status_idx on public.thailand_fda_applications(status);
create index if not exists thailand_fda_applications_product_name_idx on public.thailand_fda_applications(product_name);
create index if not exists thailand_fda_applications_created_by_idx on public.thailand_fda_applications(created_by);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists event_applications_set_updated_at on public.event_applications;
create trigger event_applications_set_updated_at
before update on public.event_applications
for each row execute function public.set_updated_at();

drop trigger if exists thailand_fda_applications_set_updated_at on public.thailand_fda_applications;
create trigger thailand_fda_applications_set_updated_at
before update on public.thailand_fda_applications
for each row execute function public.set_updated_at();

commit;

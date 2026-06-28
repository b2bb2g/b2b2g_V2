-- SQL 02
-- Title: Member and company domain schema
-- Depends on: SQL 00 foundation identity and master data schema

begin;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  company_type_id uuid not null references public.company_types(id),
  country_id uuid not null references public.countries(id),
  industry_id uuid not null references public.industries(id),
  website text,
  description text,
  approval_status text not null default 'draft',
  verification_status text not null default 'pending',
  approved_by uuid references public.profiles(id) on delete set null,
  verified_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  verified_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint companies_approval_status_check check (
    approval_status in (
      'draft',
      'submitted',
      'reviewing',
      'approved',
      'rejected',
      'suspended'
    )
  ),
  constraint companies_verification_status_check check (
    verification_status in ('pending', 'verified', 'rejected', 'suspended')
  )
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  approval_status text not null default 'pending',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint suppliers_approval_status_check check (
    approval_status in ('pending', 'approved', 'rejected', 'suspended')
  )
);

create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  company_name text,
  country_id uuid references public.countries(id) on delete set null,
  approval_status text not null default 'pending',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint buyers_approval_status_check check (
    approval_status in ('pending', 'approved', 'rejected', 'suspended')
  )
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  approval_status text not null default 'pending',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint agents_approval_status_check check (
    approval_status in ('pending', 'approved', 'rejected', 'suspended')
  )
);

create table if not exists public.professors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  university_name text,
  approval_status text not null default 'pending',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint professors_approval_status_check check (
    approval_status in ('pending', 'approved', 'rejected', 'suspended')
  )
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  professor_id uuid references public.professors(id) on delete set null,
  university_name text,
  graduation_status text not null default 'enrolled',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint students_graduation_status_check check (
    graduation_status in ('enrolled', 'graduated')
  )
);

create table if not exists public.country_agents (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  status text not null default 'active',
  assigned_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint country_agents_unique unique (country_id, agent_id),
  constraint country_agents_status_check check (
    status in ('active', 'inactive', 'suspended')
  )
);

create table if not exists public.company_verifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  status text not null default 'pending',
  business_registration_checked boolean not null default false,
  website_checked boolean not null default false,
  catalog_checked boolean not null default false,
  certificate_checked boolean not null default false,
  review_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint company_verifications_status_check check (
    status in ('pending', 'verified', 'rejected', 'suspended')
  )
);

create index if not exists companies_name_idx on public.companies(name);
create index if not exists companies_company_type_id_idx on public.companies(company_type_id);
create index if not exists companies_country_id_idx on public.companies(country_id);
create index if not exists companies_industry_id_idx on public.companies(industry_id);
create index if not exists companies_approval_status_idx on public.companies(approval_status);
create index if not exists companies_verification_status_idx on public.companies(verification_status);
create index if not exists suppliers_company_id_idx on public.suppliers(company_id);
create index if not exists suppliers_approval_status_idx on public.suppliers(approval_status);
create index if not exists buyers_country_id_idx on public.buyers(country_id);
create index if not exists buyers_approval_status_idx on public.buyers(approval_status);
create index if not exists agents_approval_status_idx on public.agents(approval_status);
create index if not exists professors_university_name_idx on public.professors(university_name);
create index if not exists professors_approval_status_idx on public.professors(approval_status);
create index if not exists students_professor_id_idx on public.students(professor_id);
create index if not exists students_university_name_idx on public.students(university_name);
create index if not exists students_graduation_status_idx on public.students(graduation_status);
create index if not exists country_agents_country_id_idx on public.country_agents(country_id);
create index if not exists country_agents_agent_id_idx on public.country_agents(agent_id);
create index if not exists country_agents_status_idx on public.country_agents(status);
create index if not exists company_verifications_company_id_idx on public.company_verifications(company_id);
create index if not exists company_verifications_status_idx on public.company_verifications(status);

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists suppliers_set_updated_at on public.suppliers;
create trigger suppliers_set_updated_at
before update on public.suppliers
for each row execute function public.set_updated_at();

drop trigger if exists buyers_set_updated_at on public.buyers;
create trigger buyers_set_updated_at
before update on public.buyers
for each row execute function public.set_updated_at();

drop trigger if exists agents_set_updated_at on public.agents;
create trigger agents_set_updated_at
before update on public.agents
for each row execute function public.set_updated_at();

drop trigger if exists professors_set_updated_at on public.professors;
create trigger professors_set_updated_at
before update on public.professors
for each row execute function public.set_updated_at();

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists country_agents_set_updated_at on public.country_agents;
create trigger country_agents_set_updated_at
before update on public.country_agents
for each row execute function public.set_updated_at();

drop trigger if exists company_verifications_set_updated_at on public.company_verifications;
create trigger company_verifications_set_updated_at
before update on public.company_verifications
for each row execute function public.set_updated_at();

commit;

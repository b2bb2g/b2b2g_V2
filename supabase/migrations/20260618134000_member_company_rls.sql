-- SQL 03
-- Title: Member and company domain RLS policies
-- Depends on: SQL 01 foundation RLS, SQL 02 member and company domain schema

begin;

create or replace function public.current_supplier_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select suppliers.id
  from public.suppliers
  where suppliers.profile_id = auth.uid()
    and suppliers.deleted_at is null
  limit 1
$$;

create or replace function public.current_buyer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select buyers.id
  from public.buyers
  where buyers.profile_id = auth.uid()
    and buyers.deleted_at is null
  limit 1
$$;

create or replace function public.current_agent_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select agents.id
  from public.agents
  where agents.profile_id = auth.uid()
    and agents.deleted_at is null
  limit 1
$$;

create or replace function public.current_professor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select professors.id
  from public.professors
  where professors.profile_id = auth.uid()
    and professors.deleted_at is null
  limit 1
$$;

create or replace function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select students.id
  from public.students
  where students.profile_id = auth.uid()
    and students.deleted_at is null
  limit 1
$$;

create or replace function public.can_manage_country(target_country_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.country_agents
      where country_agents.country_id = target_country_id
        and country_agents.agent_id = public.current_agent_id()
        and country_agents.status = 'active'
        and country_agents.deleted_at is null
    )
$$;

create or replace function public.is_assigned_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.students
      where students.id = target_student_id
        and students.professor_id = public.current_professor_id()
        and students.deleted_at is null
    )
$$;

alter table public.companies enable row level security;
alter table public.suppliers enable row level security;
alter table public.buyers enable row level security;
alter table public.agents enable row level security;
alter table public.professors enable row level security;
alter table public.students enable row level security;
alter table public.country_agents enable row level security;
alter table public.company_verifications enable row level security;

create policy companies_approved_public_select
on public.companies
for select
using (
  approval_status = 'approved'
  and is_active = true
  and deleted_at is null
);

create policy companies_supplier_owner_select
on public.companies
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.suppliers
    where suppliers.company_id = companies.id
      and suppliers.profile_id = auth.uid()
      and suppliers.deleted_at is null
  )
);

create policy companies_supplier_owner_update
on public.companies
for update
using (
  public.is_admin()
  or exists (
    select 1
    from public.suppliers
    where suppliers.company_id = companies.id
      and suppliers.profile_id = auth.uid()
      and suppliers.deleted_at is null
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.suppliers
    where suppliers.company_id = companies.id
      and suppliers.profile_id = auth.uid()
      and suppliers.deleted_at is null
  )
);

create policy companies_admin_all
on public.companies
for all
using (public.is_admin())
with check (public.is_admin());

create policy suppliers_owner_select
on public.suppliers
for select
using (profile_id = auth.uid() or public.is_admin());

create policy suppliers_owner_update
on public.suppliers
for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy suppliers_admin_all
on public.suppliers
for all
using (public.is_admin())
with check (public.is_admin());

create policy buyers_owner_select
on public.buyers
for select
using (
  profile_id = auth.uid()
  or public.is_admin()
  or public.can_manage_country(country_id)
);

create policy buyers_owner_update
on public.buyers
for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy buyers_admin_all
on public.buyers
for all
using (public.is_admin())
with check (public.is_admin());

create policy agents_owner_select
on public.agents
for select
using (profile_id = auth.uid() or public.is_admin());

create policy agents_owner_update
on public.agents
for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy agents_admin_all
on public.agents
for all
using (public.is_admin())
with check (public.is_admin());

create policy professors_owner_select
on public.professors
for select
using (profile_id = auth.uid() or public.is_admin());

create policy professors_owner_update
on public.professors
for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy professors_admin_all
on public.professors
for all
using (public.is_admin())
with check (public.is_admin());

create policy students_owner_select
on public.students
for select
using (
  profile_id = auth.uid()
  or public.is_assigned_student(id)
  or public.is_admin()
);

create policy students_owner_update
on public.students
for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy students_admin_all
on public.students
for all
using (public.is_admin())
with check (public.is_admin());

create policy country_agents_agent_select
on public.country_agents
for select
using (
  public.is_admin()
  or agent_id = public.current_agent_id()
);

create policy country_agents_admin_all
on public.country_agents
for all
using (public.is_admin())
with check (public.is_admin());

create policy company_verifications_supplier_select
on public.company_verifications
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.suppliers
    where suppliers.company_id = company_verifications.company_id
      and suppliers.profile_id = auth.uid()
      and suppliers.deleted_at is null
  )
);

create policy company_verifications_admin_all
on public.company_verifications
for all
using (public.is_admin())
with check (public.is_admin());

commit;

-- SQL 15
-- Title: Event and Thailand FDA RLS policies
-- Depends on: SQL 01 foundation RLS, SQL 03 member/company RLS, SQL 14 event/FDA schema

begin;

create or replace function public.is_published_event(event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events
    where events.id = event_id
      and events.status = 'published'
      and events.is_active = true
      and events.deleted_at is null
  )
$$;

alter table public.events enable row level security;
alter table public.event_applications enable row level security;
alter table public.thailand_fda_applications enable row level security;

create policy events_published_public_select
on public.events
for select
using (
  status = 'published'
  and is_active = true
  and deleted_at is null
);

create policy events_admin_all
on public.events
for all
using (public.is_admin())
with check (public.is_admin());

create policy event_applications_owner_select
on public.event_applications
for select
using (
  public.is_admin()
  or profile_id = auth.uid()
);

create policy event_applications_member_insert
on public.event_applications
for insert
with check (
  profile_id = auth.uid()
  and created_by = auth.uid()
  and status = 'submitted'
  and public.is_published_event(event_id)
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
      and profiles.activity_status = 'active'
      and profiles.deleted_at is null
  )
);

create policy event_applications_owner_cancel_update
on public.event_applications
for update
using (
  public.is_admin()
  or profile_id = auth.uid()
)
with check (
  public.is_admin()
  or (
    profile_id = auth.uid()
    and status = 'cancelled'
  )
);

create policy event_applications_admin_all
on public.event_applications
for all
using (public.is_admin())
with check (public.is_admin());

create policy thailand_fda_applications_supplier_owner_select
on public.thailand_fda_applications
for select
using (
  public.is_admin()
  or supplier_id = public.current_supplier_id()
);

create policy thailand_fda_applications_supplier_insert
on public.thailand_fda_applications
for insert
with check (
  supplier_id = public.current_supplier_id()
  and created_by = auth.uid()
  and status in ('draft', 'submitted')
  and exists (
    select 1
    from public.suppliers
    join public.companies
      on companies.id = suppliers.company_id
    where suppliers.id = public.current_supplier_id()
      and suppliers.approval_status = 'approved'
      and suppliers.deleted_at is null
      and companies.approval_status = 'approved'
      and companies.deleted_at is null
  )
);

create policy thailand_fda_applications_supplier_update
on public.thailand_fda_applications
for update
using (
  public.is_admin()
  or supplier_id = public.current_supplier_id()
)
with check (
  public.is_admin()
  or (
    supplier_id = public.current_supplier_id()
    and status in ('draft', 'submitted', 'waiting_documents')
  )
);

create policy thailand_fda_applications_admin_all
on public.thailand_fda_applications
for all
using (public.is_admin())
with check (public.is_admin());

commit;

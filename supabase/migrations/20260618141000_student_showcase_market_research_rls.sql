-- SQL 11
-- Title: Student Showcase and Market Research RLS policies
-- Depends on: SQL 01 foundation RLS, SQL 03 member/company RLS, SQL 09 content RLS, SQL 10 Student Showcase schema

begin;

create or replace function public.can_access_showcase(showcase_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.student_showcases
      where student_showcases.id = showcase_id
        and student_showcases.approval_status = 'approved'
        and student_showcases.is_active = true
        and student_showcases.deleted_at is null
    )
    or exists (
      select 1
      from public.student_showcases
      where student_showcases.id = showcase_id
        and student_showcases.student_id = public.current_student_id()
        and student_showcases.deleted_at is null
    )
    or exists (
      select 1
      from public.student_showcases
      where student_showcases.id = showcase_id
        and public.is_assigned_student(student_showcases.student_id)
        and student_showcases.deleted_at is null
    )
$$;

create or replace function public.can_manage_showcase(showcase_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.student_showcases
      where student_showcases.id = showcase_id
        and student_showcases.student_id = public.current_student_id()
        and student_showcases.deleted_at is null
    )
$$;

alter table public.student_showcases enable row level security;
alter table public.student_showcase_items enable row level security;
alter table public.market_research_reports enable row level security;

create policy student_showcases_approved_public_select
on public.student_showcases
for select
using (
  approval_status = 'approved'
  and is_active = true
  and deleted_at is null
);

create policy student_showcases_owner_professor_select
on public.student_showcases
for select
using (
  public.is_admin()
  or student_id = public.current_student_id()
  or public.is_assigned_student(student_id)
);

create policy student_showcases_student_insert
on public.student_showcases
for insert
with check (
  student_id = public.current_student_id()
  and created_by = auth.uid()
  and approval_status in ('draft', 'submitted')
);

create policy student_showcases_student_update
on public.student_showcases
for update
using (
  public.is_admin()
  or student_id = public.current_student_id()
)
with check (
  public.is_admin()
  or (
    student_id = public.current_student_id()
    and approval_status in ('draft', 'submitted')
  )
);

create policy student_showcases_admin_all
on public.student_showcases
for all
using (public.is_admin())
with check (public.is_admin());

create policy student_showcase_items_public_select
on public.student_showcase_items
for select
using (
  is_active = true
  and deleted_at is null
  and public.can_access_showcase(showcase_id)
  and public.is_approved_product(product_id)
);

create policy student_showcase_items_student_insert
on public.student_showcase_items
for insert
with check (
  public.can_manage_showcase(showcase_id)
  and created_by = auth.uid()
  and public.is_approved_product(product_id)
);

create policy student_showcase_items_student_update
on public.student_showcase_items
for update
using (public.can_manage_showcase(showcase_id))
with check (
  public.can_manage_showcase(showcase_id)
  and public.is_approved_product(product_id)
);

create policy student_showcase_items_admin_all
on public.student_showcase_items
for all
using (public.is_admin())
with check (public.is_admin());

create policy market_research_reports_approved_public_select
on public.market_research_reports
for select
using (
  approval_status = 'approved'
  and is_active = true
  and deleted_at is null
);

create policy market_research_reports_owner_professor_select
on public.market_research_reports
for select
using (
  public.is_admin()
  or student_id = public.current_student_id()
  or public.is_assigned_student(student_id)
);

create policy market_research_reports_student_insert
on public.market_research_reports
for insert
with check (
  student_id = public.current_student_id()
  and created_by = auth.uid()
  and approval_status in ('draft', 'submitted')
);

create policy market_research_reports_student_update
on public.market_research_reports
for update
using (
  public.is_admin()
  or student_id = public.current_student_id()
)
with check (
  public.is_admin()
  or (
    student_id = public.current_student_id()
    and approval_status in ('draft', 'submitted')
  )
);

create policy market_research_reports_admin_all
on public.market_research_reports
for all
using (public.is_admin())
with check (public.is_admin());

commit;

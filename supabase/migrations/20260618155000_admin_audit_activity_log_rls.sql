-- SQL 25
-- Title: Admin Audit and Activity Log RLS policies
-- Depends on: SQL 03 member/company RLS, SQL 24 admin audit/activity log schema

begin;

create or replace function public.can_access_activity_log(target_activity_log_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.activity_logs
      where activity_logs.id = target_activity_log_id
        and activity_logs.profile_id = auth.uid()
        and activity_logs.deleted_at is null
    )
    or exists (
      select 1
      from public.activity_logs
      join public.students
        on students.profile_id = activity_logs.profile_id
      where activity_logs.id = target_activity_log_id
        and public.is_assigned_student(students.id)
        and activity_logs.deleted_at is null
        and students.deleted_at is null
    )
    or exists (
      select 1
      from public.activity_logs
      join public.buyers
        on buyers.profile_id = activity_logs.profile_id
      where activity_logs.id = target_activity_log_id
        and public.can_manage_country(buyers.country_id)
        and activity_logs.deleted_at is null
        and buyers.deleted_at is null
    )
$$;

alter table public.admin_logs enable row level security;
alter table public.audit_events enable row level security;
alter table public.activity_logs enable row level security;

create policy admin_logs_admin_select
on public.admin_logs
for select
using (public.is_admin());

create policy admin_logs_admin_insert
on public.admin_logs
for insert
with check (
  public.is_admin()
  and (
    actor_profile_id is null
    or actor_profile_id = auth.uid()
  )
);

create policy admin_logs_admin_update
on public.admin_logs
for update
using (public.is_admin())
with check (public.is_admin());

create policy admin_logs_admin_delete
on public.admin_logs
for delete
using (public.is_admin());

create policy audit_events_admin_select
on public.audit_events
for select
using (public.is_admin());

create policy audit_events_admin_insert
on public.audit_events
for insert
with check (
  public.is_admin()
  or auth.role() = 'service_role'
);

create policy audit_events_admin_update
on public.audit_events
for update
using (public.is_admin())
with check (public.is_admin());

create policy audit_events_admin_delete
on public.audit_events
for delete
using (public.is_admin());

create policy activity_logs_related_select
on public.activity_logs
for select
using (public.can_access_activity_log(id));

create policy activity_logs_owner_insert
on public.activity_logs
for insert
with check (
  profile_id = auth.uid()
  and (
    actor_profile_id is null
    or actor_profile_id = auth.uid()
  )
);

create policy activity_logs_admin_insert
on public.activity_logs
for insert
with check (
  public.is_admin()
  or auth.role() = 'service_role'
);

create policy activity_logs_admin_update
on public.activity_logs
for update
using (public.is_admin())
with check (public.is_admin());

create policy activity_logs_admin_delete
on public.activity_logs
for delete
using (public.is_admin());

commit;

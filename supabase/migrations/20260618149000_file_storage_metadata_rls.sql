-- SQL 19
-- Title: File and Storage Metadata RLS policies
-- Depends on: SQL 09 content RLS, SQL 15 event/FDA RLS, SQL 17 conversation/message/notification RLS, SQL 18 file/storage metadata schema

begin;

create or replace function public.can_access_file(target_file_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.files
      where files.id = target_file_id
        and files.visibility = 'public'
        and files.is_active = true
        and files.deleted_at is null
    )
    or exists (
      select 1
      from public.files
      where files.id = target_file_id
        and files.owner_profile_id = auth.uid()
        and files.deleted_at is null
    )
    or exists (
      select 1
      from public.products
      where products.main_file_id = target_file_id
        and (
          public.is_approved_product(products.id)
          or products.supplier_id = public.current_supplier_id()
        )
        and products.deleted_at is null
    )
    or exists (
      select 1
      from public.thailand_fda_applications
      where thailand_fda_applications.completion_report_file_id = target_file_id
        and (
          public.is_admin()
          or thailand_fda_applications.supplier_id = public.current_supplier_id()
        )
        and thailand_fda_applications.deleted_at is null
    )
    or exists (
      select 1
      from public.message_attachments
      where message_attachments.file_id = target_file_id
        and public.can_access_message(message_attachments.message_id)
        and message_attachments.deleted_at is null
    )
$$;

alter table public.files enable row level security;

create policy files_access_select
on public.files
for select
using (public.can_access_file(id));

create policy files_owner_insert
on public.files
for insert
with check (
  owner_profile_id = auth.uid()
  and created_by = auth.uid()
  and (
    bucket not in ('fda-files', 'message-attachments', 'reports')
    or visibility in ('private', 'restricted')
  )
);

create policy files_owner_update
on public.files
for update
using (
  public.is_admin()
  or owner_profile_id = auth.uid()
)
with check (
  public.is_admin()
  or (
    owner_profile_id = auth.uid()
    and (
      bucket not in ('fda-files', 'message-attachments', 'reports')
      or visibility in ('private', 'restricted')
    )
  )
);

create policy files_admin_all
on public.files
for all
using (public.is_admin())
with check (public.is_admin());

commit;

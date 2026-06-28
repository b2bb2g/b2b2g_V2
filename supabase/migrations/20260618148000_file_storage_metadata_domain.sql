-- SQL 18
-- Title: File and Storage Metadata schema
-- Depends on: SQL 02 member and company domain schema, SQL 08 content domain schema, SQL 14 event/FDA schema, SQL 16 conversation/message/notification schema

begin;

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  original_name text,
  mime_type text,
  size_bytes bigint,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  visibility text not null default 'private',
  checksum text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint files_bucket_path_unique unique (bucket, path),
  constraint files_size_bytes_check check (size_bytes is null or size_bytes >= 0),
  constraint files_bucket_check check (
    bucket in (
      'public-assets',
      'company-files',
      'product-files',
      'fda-files',
      'message-attachments',
      'reports'
    )
  ),
  constraint files_visibility_check check (
    visibility in ('public', 'private', 'restricted')
  ),
  constraint files_private_bucket_visibility_check check (
    bucket not in ('fda-files', 'message-attachments', 'reports')
    or visibility in ('private', 'restricted')
  )
);

create index if not exists files_bucket_idx on public.files(bucket);
create index if not exists files_path_idx on public.files(path);
create index if not exists files_owner_profile_id_idx on public.files(owner_profile_id);
create index if not exists files_visibility_idx on public.files(visibility);
create index if not exists files_mime_type_idx on public.files(mime_type);
create index if not exists files_created_at_idx on public.files(created_at);

drop trigger if exists files_set_updated_at on public.files;
create trigger files_set_updated_at
before update on public.files
for each row execute function public.set_updated_at();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_main_file_id_fkey'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_main_file_id_fkey
      foreign key (main_file_id)
      references public.files(id)
      on delete set null
      not valid;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'thailand_fda_applications_completion_report_file_id_fkey'
      and conrelid = 'public.thailand_fda_applications'::regclass
  ) then
    alter table public.thailand_fda_applications
      add constraint thailand_fda_applications_completion_report_file_id_fkey
      foreign key (completion_report_file_id)
      references public.files(id)
      on delete set null
      not valid;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'message_attachments_file_id_fkey'
      and conrelid = 'public.message_attachments'::regclass
  ) then
    alter table public.message_attachments
      add constraint message_attachments_file_id_fkey
      foreign key (file_id)
      references public.files(id)
      on delete restrict
      not valid;
  end if;
end $$;

commit;

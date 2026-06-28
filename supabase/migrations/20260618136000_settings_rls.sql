-- SQL 05
-- Title: Settings domain RLS policies
-- Depends on: SQL 01 foundation RLS, SQL 04 settings domain schema

begin;

alter table public.menus enable row level security;
alter table public.categories enable row level security;
alter table public.site_settings enable row level security;
alter table public.translations enable row level security;

create policy menus_public_select
on public.menus
for select
using (
  is_visible = true
  and is_active = true
  and deleted_at is null
);

create policy menus_admin_all
on public.menus
for all
using (public.is_admin())
with check (public.is_admin());

create policy categories_public_select
on public.categories
for select
using (
  is_active = true
  and deleted_at is null
);

create policy categories_admin_all
on public.categories
for all
using (public.is_admin())
with check (public.is_admin());

create policy site_settings_public_select
on public.site_settings
for select
using (
  is_public = true
  and is_active = true
  and deleted_at is null
);

create policy site_settings_admin_all
on public.site_settings
for all
using (public.is_admin())
with check (public.is_admin());

create policy translations_public_select
on public.translations
for select
using (
  is_active = true
  and deleted_at is null
);

create policy translations_admin_all
on public.translations
for all
using (public.is_admin())
with check (public.is_admin());

commit;

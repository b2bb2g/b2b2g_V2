-- SQL 21
-- Title: SEO and Featured Content RLS policies
-- Depends on: SQL 03 member/company RLS, SQL 09 content RLS, SQL 15 event/FDA RLS, SQL 20 SEO/featured content schema

begin;

create or replace function public.is_public_content_target(target_table_name text, target_record_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case target_table_name
    when 'companies' then exists (
      select 1
      from public.companies
      where companies.id = target_record_id
        and companies.approval_status = 'approved'
        and companies.is_active = true
        and companies.deleted_at is null
    )
    when 'products' then public.is_approved_product(target_record_id)
    when 'industrial_posts' then exists (
      select 1
      from public.industrial_posts
      where industrial_posts.id = target_record_id
        and industrial_posts.approval_status = 'approved'
        and industrial_posts.is_active = true
        and industrial_posts.deleted_at is null
    )
    when 'epc_posts' then exists (
      select 1
      from public.epc_posts
      where epc_posts.id = target_record_id
        and epc_posts.approval_status = 'approved'
        and epc_posts.is_active = true
        and epc_posts.deleted_at is null
    )
    when 'buy_sell_posts' then exists (
      select 1
      from public.buy_sell_posts
      where buy_sell_posts.id = target_record_id
        and buy_sell_posts.approval_status = 'approved'
        and buy_sell_posts.is_active = true
        and buy_sell_posts.deleted_at is null
    )
    when 'events' then public.is_published_event(target_record_id)
    else false
  end
$$;

create or replace function public.can_access_owned_seo_target(target_table_name text, target_record_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or (
      target_table_name = 'companies'
      and exists (
        select 1
        from public.suppliers
        where suppliers.company_id = target_record_id
          and suppliers.id = public.current_supplier_id()
          and suppliers.deleted_at is null
      )
    )
    or (
      target_table_name = 'products'
      and exists (
        select 1
        from public.products
        where products.id = target_record_id
          and products.supplier_id = public.current_supplier_id()
          and products.deleted_at is null
      )
    )
$$;

alter table public.banners enable row level security;
alter table public.seo_metadata enable row level security;
alter table public.featured_contents enable row level security;

create policy banners_public_select
on public.banners
for select
using (
  is_visible = true
  and is_active = true
  and deleted_at is null
  and (
    starts_at is null
    or starts_at <= now()
  )
  and (
    ends_at is null
    or ends_at > now()
  )
  and (
    file_id is null
    or public.can_access_file(file_id)
  )
);

create policy banners_admin_all
on public.banners
for all
using (public.is_admin())
with check (public.is_admin());

create policy seo_metadata_public_select
on public.seo_metadata
for select
using (
  is_active = true
  and deleted_at is null
  and public.is_public_content_target(target_table, target_id)
  and (
    og_image_file_id is null
    or public.can_access_file(og_image_file_id)
  )
);

create policy seo_metadata_supplier_related_select
on public.seo_metadata
for select
using (
  public.can_access_owned_seo_target(target_table, target_id)
);

create policy seo_metadata_admin_all
on public.seo_metadata
for all
using (public.is_admin())
with check (public.is_admin());

create policy featured_contents_public_select
on public.featured_contents
for select
using (
  is_active = true
  and deleted_at is null
  and (
    featured_until is null
    or featured_until > now()
  )
  and public.is_public_content_target(target_table, target_id)
);

create policy featured_contents_admin_all
on public.featured_contents
for all
using (public.is_admin())
with check (public.is_admin());

commit;

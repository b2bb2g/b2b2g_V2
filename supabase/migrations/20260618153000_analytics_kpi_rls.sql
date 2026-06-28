-- SQL 23
-- Title: Analytics and KPI RLS policies
-- Depends on: SQL 03 member/company RLS, SQL 11 Student Showcase RLS, SQL 21 SEO/featured content RLS, SQL 22 analytics/KPI schema

begin;

create or replace function public.can_access_showcase_kpi(target_showcase_id uuid)
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
      where student_showcases.id = target_showcase_id
        and (
          student_showcases.student_id = public.current_student_id()
          or public.is_assigned_student(student_showcases.student_id)
          or public.can_manage_country(student_showcases.target_country_id)
        )
        and student_showcases.deleted_at is null
    )
    or exists (
      select 1
      from public.student_showcase_items
      join public.products
        on products.id = student_showcase_items.product_id
      where student_showcase_items.showcase_id = target_showcase_id
        and products.supplier_id = public.current_supplier_id()
        and student_showcase_items.deleted_at is null
        and products.deleted_at is null
    )
$$;

create or replace function public.can_access_buyer_source(target_buyer_source_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.buyer_sources
      where buyer_sources.id = target_buyer_source_id
        and buyer_sources.buyer_id = public.current_buyer_id()
        and buyer_sources.deleted_at is null
    )
    or exists (
      select 1
      from public.buyer_sources
      where buyer_sources.id = target_buyer_source_id
        and buyer_sources.source_student_id = public.current_student_id()
        and buyer_sources.deleted_at is null
    )
    or exists (
      select 1
      from public.buyer_sources
      join public.buyers
        on buyers.id = buyer_sources.buyer_id
      where buyer_sources.id = target_buyer_source_id
        and public.can_manage_country(buyers.country_id)
        and buyer_sources.deleted_at is null
        and buyers.deleted_at is null
    )
$$;

alter table public.showcase_views enable row level security;
alter table public.showcase_shares enable row level security;
alter table public.showcase_inquiries enable row level security;
alter table public.buyer_sources enable row level security;
alter table public.analytics_events enable row level security;
alter table public.company_scores enable row level security;

create policy showcase_views_related_select
on public.showcase_views
for select
using (public.can_access_showcase_kpi(showcase_id));

create policy showcase_views_public_insert
on public.showcase_views
for insert
with check (
  public.can_access_showcase(showcase_id)
  and (
    viewer_profile_id is null
    or viewer_profile_id = auth.uid()
  )
);

create policy showcase_views_admin_all
on public.showcase_views
for all
using (public.is_admin())
with check (public.is_admin());

create policy showcase_shares_related_select
on public.showcase_shares
for select
using (
  public.can_access_showcase_kpi(showcase_id)
  or sharer_profile_id = auth.uid()
);

create policy showcase_shares_public_insert
on public.showcase_shares
for insert
with check (
  public.can_access_showcase(showcase_id)
  and (
    sharer_profile_id is null
    or sharer_profile_id = auth.uid()
  )
);

create policy showcase_shares_admin_all
on public.showcase_shares
for all
using (public.is_admin())
with check (public.is_admin());

create policy showcase_inquiries_related_select
on public.showcase_inquiries
for select
using (
  public.can_access_showcase_kpi(showcase_id)
  or buyer_id = public.current_buyer_id()
  or inquirer_profile_id = auth.uid()
);

create policy showcase_inquiries_public_insert
on public.showcase_inquiries
for insert
with check (
  public.can_access_showcase(showcase_id)
  and (
    buyer_id is null
    or buyer_id = public.current_buyer_id()
  )
  and (
    inquirer_profile_id is null
    or inquirer_profile_id = auth.uid()
  )
);

create policy showcase_inquiries_related_update
on public.showcase_inquiries
for update
using (
  public.is_admin()
  or public.can_access_showcase_kpi(showcase_id)
)
with check (
  public.is_admin()
  or public.can_access_showcase_kpi(showcase_id)
);

create policy showcase_inquiries_admin_all
on public.showcase_inquiries
for all
using (public.is_admin())
with check (public.is_admin());

create policy buyer_sources_related_select
on public.buyer_sources
for select
using (public.can_access_buyer_source(id));

create policy buyer_sources_admin_all
on public.buyer_sources
for all
using (public.is_admin())
with check (public.is_admin());

create policy analytics_events_admin_select
on public.analytics_events
for select
using (public.is_admin());

create policy analytics_events_public_insert
on public.analytics_events
for insert
with check (
  event_type in (
    'company_view',
    'product_view',
    'showcase_view',
    'inquiry_click',
    'catalog_download',
    'buy_request_view',
    'event_view'
  )
  and (
    profile_id is null
    or profile_id = auth.uid()
  )
  and (
    target_table is null
    or target_id is null
    or public.is_public_content_target(target_table, target_id)
    or (
      target_table = 'student_showcases'
      and public.can_access_showcase(target_id)
    )
    or (
      target_table = 'buy_requests'
      and exists (
        select 1
        from public.buy_requests
        where buy_requests.id = analytics_events.target_id
          and buy_requests.approval_status = 'approved'
          and buy_requests.is_active = true
          and buy_requests.deleted_at is null
      )
    )
  )
);

create policy analytics_events_admin_all
on public.analytics_events
for all
using (public.is_admin())
with check (public.is_admin());

create policy company_scores_public_select
on public.company_scores
for select
using (
  is_public = true
  and is_active = true
  and deleted_at is null
  and exists (
    select 1
    from public.companies
    where companies.id = company_scores.company_id
      and companies.approval_status = 'approved'
      and companies.deleted_at is null
  )
);

create policy company_scores_supplier_select
on public.company_scores
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.suppliers
    where suppliers.company_id = company_scores.company_id
      and suppliers.id = public.current_supplier_id()
      and suppliers.deleted_at is null
  )
);

create policy company_scores_admin_all
on public.company_scores
for all
using (public.is_admin())
with check (public.is_admin());

commit;

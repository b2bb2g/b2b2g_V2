-- SQL 09
-- Title: Content domain RLS policies
-- Depends on: SQL 01 foundation RLS, SQL 03 member/company RLS, SQL 08 content domain schema

begin;

create or replace function public.is_approved_product(product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.products
    where products.id = product_id
      and products.approval_status = 'approved'
      and products.is_active = true
      and products.deleted_at is null
  )
$$;

alter table public.products enable row level security;
alter table public.industrial_posts enable row level security;
alter table public.epc_posts enable row level security;
alter table public.buy_sell_posts enable row level security;
alter table public.buy_requests enable row level security;

create policy products_approved_public_select
on public.products
for select
using (
  approval_status = 'approved'
  and is_active = true
  and deleted_at is null
);

create policy products_supplier_owner_select
on public.products
for select
using (
  public.is_admin()
  or supplier_id = public.current_supplier_id()
);

create policy products_supplier_owner_insert
on public.products
for insert
with check (
  supplier_id = public.current_supplier_id()
  and company_id in (
    select suppliers.company_id
    from public.suppliers
    where suppliers.id = public.current_supplier_id()
      and suppliers.deleted_at is null
  )
);

create policy products_supplier_owner_update
on public.products
for update
using (public.is_admin() or supplier_id = public.current_supplier_id())
with check (public.is_admin() or supplier_id = public.current_supplier_id());

create policy products_admin_all
on public.products
for all
using (public.is_admin())
with check (public.is_admin());

create policy industrial_posts_approved_public_select
on public.industrial_posts
for select
using (
  approval_status = 'approved'
  and is_active = true
  and deleted_at is null
);

create policy industrial_posts_supplier_owner_select
on public.industrial_posts
for select
using (public.is_admin() or supplier_id = public.current_supplier_id());

create policy industrial_posts_supplier_owner_insert
on public.industrial_posts
for insert
with check (
  supplier_id = public.current_supplier_id()
  and company_id in (
    select suppliers.company_id
    from public.suppliers
    where suppliers.id = public.current_supplier_id()
      and suppliers.deleted_at is null
  )
);

create policy industrial_posts_supplier_owner_update
on public.industrial_posts
for update
using (public.is_admin() or supplier_id = public.current_supplier_id())
with check (public.is_admin() or supplier_id = public.current_supplier_id());

create policy industrial_posts_admin_all
on public.industrial_posts
for all
using (public.is_admin())
with check (public.is_admin());

create policy epc_posts_approved_public_select
on public.epc_posts
for select
using (
  approval_status = 'approved'
  and is_active = true
  and deleted_at is null
);

create policy epc_posts_supplier_owner_select
on public.epc_posts
for select
using (public.is_admin() or supplier_id = public.current_supplier_id());

create policy epc_posts_supplier_owner_insert
on public.epc_posts
for insert
with check (
  supplier_id = public.current_supplier_id()
  and company_id in (
    select suppliers.company_id
    from public.suppliers
    where suppliers.id = public.current_supplier_id()
      and suppliers.deleted_at is null
  )
);

create policy epc_posts_supplier_owner_update
on public.epc_posts
for update
using (public.is_admin() or supplier_id = public.current_supplier_id())
with check (public.is_admin() or supplier_id = public.current_supplier_id());

create policy epc_posts_admin_all
on public.epc_posts
for all
using (public.is_admin())
with check (public.is_admin());

create policy buy_sell_posts_approved_public_select
on public.buy_sell_posts
for select
using (
  post_type = 'sell_product'
  and approval_status = 'approved'
  and is_active = true
  and deleted_at is null
);

create policy buy_sell_posts_supplier_owner_select
on public.buy_sell_posts
for select
using (
  public.is_admin()
  or (
    supplier_id = public.current_supplier_id()
    and author_profile_id = auth.uid()
  )
);

create policy buy_sell_posts_supplier_owner_insert
on public.buy_sell_posts
for insert
with check (
  post_type = 'sell_product'
  and author_profile_id = auth.uid()
  and supplier_id = public.current_supplier_id()
);

create policy buy_sell_posts_supplier_owner_update
on public.buy_sell_posts
for update
using (public.is_admin() or supplier_id = public.current_supplier_id())
with check (public.is_admin() or supplier_id = public.current_supplier_id());

create policy buy_sell_posts_admin_all
on public.buy_sell_posts
for all
using (public.is_admin())
with check (public.is_admin());

create policy buy_requests_approved_public_select
on public.buy_requests
for select
using (
  approval_status = 'approved'
  and is_active = true
  and deleted_at is null
);

create policy buy_requests_buyer_owner_select
on public.buy_requests
for select
using (
  public.is_admin()
  or buyer_id = public.current_buyer_id()
  or public.can_manage_country(destination_country_id)
);

create policy buy_requests_buyer_owner_insert
on public.buy_requests
for insert
with check (buyer_id = public.current_buyer_id());

create policy buy_requests_buyer_owner_update
on public.buy_requests
for update
using (public.is_admin() or buyer_id = public.current_buyer_id())
with check (public.is_admin() or buyer_id = public.current_buyer_id());

create policy buy_requests_admin_all
on public.buy_requests
for all
using (public.is_admin())
with check (public.is_admin());

commit;

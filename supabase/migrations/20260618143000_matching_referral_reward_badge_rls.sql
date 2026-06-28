-- SQL 13
-- Title: Matching, Referral, Reward, and Badge RLS policies
-- Depends on: SQL 01 foundation RLS, SQL 03 member/company RLS, SQL 12 matching/referral/reward/badge schema

begin;

create or replace function public.can_access_matching_request(matching_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.matching_requests
      where matching_requests.id = matching_request_id
        and (
          matching_requests.requester_profile_id = auth.uid()
          or matching_requests.target_profile_id = auth.uid()
        )
        and matching_requests.deleted_at is null
    )
    or exists (
      select 1
      from public.matching_requests
      join public.buyers managed_buyer
        on managed_buyer.profile_id in (
          matching_requests.requester_profile_id,
          matching_requests.target_profile_id
        )
      where matching_requests.id = matching_request_id
        and public.can_manage_country(managed_buyer.country_id)
        and matching_requests.deleted_at is null
    )
    or exists (
      select 1
      from public.matching_requests
      join public.students managed_student
        on managed_student.profile_id in (
          matching_requests.requester_profile_id,
          matching_requests.target_profile_id
        )
      where matching_requests.id = matching_request_id
        and public.is_assigned_student(managed_student.id)
        and matching_requests.deleted_at is null
    )
$$;

alter table public.matching_requests enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_relations enable row level security;
alter table public.rewards enable row level security;
alter table public.badges enable row level security;
alter table public.profile_badges enable row level security;

create policy matching_requests_related_select
on public.matching_requests
for select
using (public.can_access_matching_request(id));

create policy matching_requests_requester_insert
on public.matching_requests
for insert
with check (
  requester_profile_id = auth.uid()
  and status = 'requested'
);

create policy matching_requests_related_update
on public.matching_requests
for update
using (
  public.is_admin()
  or requester_profile_id = auth.uid()
)
with check (
  public.is_admin()
  or (
    requester_profile_id = auth.uid()
    and status in ('requested', 'closed')
  )
);

create policy matching_requests_admin_all
on public.matching_requests
for all
using (public.is_admin())
with check (public.is_admin());

create policy referral_codes_owner_select
on public.referral_codes
for select
using (
  public.is_admin()
  or buyer_id = public.current_buyer_id()
);

create policy referral_codes_admin_all
on public.referral_codes
for all
using (public.is_admin())
with check (public.is_admin());

create policy referral_relations_related_select
on public.referral_relations
for select
using (
  public.is_admin()
  or parent_buyer_id = public.current_buyer_id()
  or child_buyer_id = public.current_buyer_id()
  or exists (
    select 1
    from public.buyers child_buyer
    where child_buyer.id = referral_relations.child_buyer_id
      and public.can_manage_country(child_buyer.country_id)
  )
);

create policy referral_relations_admin_all
on public.referral_relations
for all
using (public.is_admin())
with check (public.is_admin());

create policy rewards_owner_select
on public.rewards
for select
using (
  public.is_admin()
  or profile_id = auth.uid()
);

create policy rewards_admin_all
on public.rewards
for all
using (public.is_admin())
with check (public.is_admin());

create policy badges_public_select
on public.badges
for select
using (
  is_active = true
  and deleted_at is null
);

create policy badges_admin_all
on public.badges
for all
using (public.is_admin())
with check (public.is_admin());

create policy profile_badges_related_select
on public.profile_badges
for select
using (
  public.is_admin()
  or profile_id = auth.uid()
  or (
    is_active = true
    and revoked_at is null
    and deleted_at is null
  )
);

create policy profile_badges_admin_all
on public.profile_badges
for all
using (public.is_admin())
with check (public.is_admin());

commit;

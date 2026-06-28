-- SQL 26
-- Title: Auth signup policy setting
-- Depends on: SQL 04 settings domain schema

begin;

insert into public.site_settings (key, value, description, is_public, is_active)
values (
  'auth.signup_policy',
  '{"allowPublicSignup": true, "mode": "open"}'::jsonb,
  'Controls whether public signup is open or limited to users with referral links.',
  true,
  true
)
on conflict (key) do update
set
  value = coalesce(public.site_settings.value, excluded.value),
  description = excluded.description,
  is_public = true,
  is_active = true,
  updated_at = now();

commit;

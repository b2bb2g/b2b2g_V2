-- SQL 06
-- Title: Foundation seed data
-- Depends on: SQL 00 foundation identity and master data schema

begin;

insert into public.languages (code, name, native_name, sort_order)
values
  ('en', 'English', 'English', 10),
  ('ko', 'Korean', '한국어', 20),
  ('th', 'Thai', 'ไทย', 30),
  ('vi', 'Vietnamese', 'Tiếng Việt', 40),
  ('zh', 'Chinese', '中文', 50),
  ('ja', 'Japanese', '日本語', 60),
  ('ar', 'Arabic', 'العربية', 70),
  ('es', 'Spanish', 'Español', 80)
on conflict (code) do update
set
  name = excluded.name,
  native_name = excluded.native_name,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

insert into public.regions (name, sort_order)
values
  ('Global', 10),
  ('Asia', 20),
  ('Southeast Asia', 30),
  ('Middle East', 40),
  ('Europe', 50),
  ('North America', 60),
  ('Latin America', 70),
  ('Africa', 80)
on conflict do nothing;

insert into public.countries (code, name, region_id, sort_order)
select country.code, country.name, region.id, country.sort_order
from (
  values
    ('KR', 'South Korea', 'Asia', 10),
    ('TH', 'Thailand', 'Southeast Asia', 20),
    ('VN', 'Vietnam', 'Southeast Asia', 30),
    ('CN', 'China', 'Asia', 40),
    ('JP', 'Japan', 'Asia', 50),
    ('US', 'United States', 'North America', 60),
    ('AE', 'United Arab Emirates', 'Middle East', 70),
    ('ES', 'Spain', 'Europe', 80)
) as country(code, name, region_name, sort_order)
join public.regions region on region.name = country.region_name
on conflict (code) do update
set
  name = excluded.name,
  region_id = excluded.region_id,
  sort_order = excluded.sort_order,
  status = 'active',
  is_active = true,
  updated_at = now();

insert into public.industries (code, name, sort_order)
values
  ('commercial', 'Commercial', 10),
  ('industrial', 'Industrial', 20),
  ('epc', 'EPC', 30),
  ('cosmetics', 'Cosmetics', 40),
  ('food-supplement', 'Food Supplement', 50),
  ('medical-device', 'Medical Device', 60),
  ('machinery', 'Machinery', 70),
  ('materials', 'Materials', 80)
on conflict (code) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

insert into public.company_types (code, name, sort_order)
values
  ('manufacturer', 'Manufacturer', 10),
  ('brand-owner', 'Brand Owner', 20),
  ('distributor', 'Distributor', 30),
  ('trading-company', 'Trading Company', 40),
  ('service-provider', 'Service Provider', 50),
  ('university', 'University', 60),
  ('government-agency', 'Government Agency', 70),
  ('association', 'Association', 80),
  ('research-institute', 'Research Institute', 90)
on conflict (code) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

insert into public.member_types (code, name, description, is_system)
values
  ('administrator', 'Administrator', 'Platform operator with administrative access.', true),
  ('supplier', 'Supplier', 'Company-side member that can manage approved company and product data.', true),
  ('buyer', 'Buyer', 'Buyer-side member that can create buy requests and referrals.', true),
  ('agent', 'Agent', 'Country-assigned business development member.', true),
  ('professor', 'Professor', 'Professor member managing assigned students.', true),
  ('student', 'Student', 'Student member participating in showcase and trade activity.', true)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system,
  is_active = true,
  updated_at = now();

insert into public.career_ranks (code, name, level_order)
values
  ('global_trade_ambassador', 'Global Trade Ambassador', 10),
  ('global_trade_associate', 'Global Trade Associate', 20),
  ('global_trade_specialist', 'Global Trade Specialist', 30),
  ('global_trade_partner', 'Global Trade Partner', 40),
  ('global_trade_leader', 'Global Trade Leader', 50)
on conflict (code) do update
set
  name = excluded.name,
  level_order = excluded.level_order,
  is_active = true,
  updated_at = now();

insert into public.roles (code, name, description, is_system)
values
  ('super_admin', 'Super Admin', 'Full platform administration.', true),
  ('administrator', 'Administrator', 'General platform administration.', true),
  ('moderator', 'Moderator', 'Content and member review operations.', true),
  ('reviewer', 'Reviewer', 'Approval and verification review operations.', true),
  ('translation_manager', 'Translation Manager', 'Translation key management.', true),
  ('supplier', 'Supplier', 'Additional supplier business role for member management.', true),
  ('buyer', 'Buyer', 'Additional buyer business role for member management.', true),
  ('agent', 'Agent', 'Additional agent business role for member management.', true),
  ('professor', 'Professor', 'Additional professor business role for member management.', true)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system,
  is_active = true,
  updated_at = now();

insert into public.permissions (code, name, description, is_system)
values
  ('members.manage', 'Manage Members', 'Review and manage member accounts.', true),
  ('companies.manage', 'Manage Companies', 'Review company approval and verification.', true),
  ('content.manage', 'Manage Content', 'Review public content approval.', true),
  ('master_data.manage', 'Manage Master Data', 'Manage menus, countries, industries, and company types.', true),
  ('translations.manage', 'Manage Translations', 'Manage translation keys and language data.', true),
  ('audit.read', 'Read Audit Logs', 'Read admin and audit logs.', true)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system,
  is_active = true,
  updated_at = now();

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
cross join public.permissions
where roles.code in ('super_admin', 'administrator')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.code in (
  'members.manage',
  'companies.manage',
  'content.manage'
)
where roles.code in ('moderator', 'reviewer')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.code = 'translations.manage'
where roles.code = 'translation_manager'
on conflict do nothing;

commit;

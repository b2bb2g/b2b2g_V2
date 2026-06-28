-- SQL 07
-- Title: Settings seed data
-- Depends on: SQL 04 settings domain schema, SQL 06 foundation seed data

begin;

insert into public.menus (code, label_key, href, location, sort_order)
values
  ('commercial', 'nav.commercial', '/commercial', 'public_main', 10),
  ('industrial', 'nav.industrial', '/industrial', 'public_main', 20),
  ('epc', 'nav.epc', '/epc', 'public_main', 30),
  ('events', 'nav.events', '/events', 'public_main', 40),
  ('buy-sell', 'nav.buySell', '/buy-sell', 'public_main', 50),
  ('networking', 'nav.networking', '/networking', 'public_main', 60),
  ('thailand-fda-service', 'nav.thailandFda', '/thailand-fda-service', 'public_main', 70),
  ('notice', 'nav.notice', '/notice', 'public_main', 80)
on conflict (code) do update
set
  label_key = excluded.label_key,
  href = excluded.href,
  location = excluded.location,
  sort_order = excluded.sort_order,
  is_visible = true,
  is_active = true,
  updated_at = now();

insert into public.categories (code, name, label_key, domain, sort_order)
values
  ('commercial-products', 'Commercial Products', 'category.commercialProducts', 'commercial', 10),
  ('industrial-facilities', 'Industrial Facilities', 'category.industrialFacilities', 'industrial', 10),
  ('epc-projects', 'EPC Projects', 'category.epcProjects', 'epc', 10),
  ('sell-products', 'SELL PRODUCTS', 'category.sellProducts', 'buy_sell', 10),
  ('buy-requests', 'BUY REQUEST', 'category.buyRequests', 'buy_request', 10),
  ('thailand-fda-cosmetic', 'Cosmetic Registration', 'category.thailandFdaCosmetic', 'thailand_fda', 10),
  ('thailand-fda-food-supplement', 'Food Supplement Registration', 'category.thailandFdaFoodSupplement', 'thailand_fda', 20),
  ('thailand-fda-food', 'Food Registration', 'category.thailandFdaFood', 'thailand_fda', 30),
  ('thailand-fda-medical-device', 'Medical Device Registration', 'category.thailandFdaMedicalDevice', 'thailand_fda', 40),
  ('thailand-fda-import-license', 'Import License Support', 'category.thailandFdaImportLicense', 'thailand_fda', 50),
  ('thailand-fda-label-compliance', 'Label Compliance', 'category.thailandFdaLabelCompliance', 'thailand_fda', 60),
  ('thailand-fda-formula-review', 'Formula Review', 'category.thailandFdaFormulaReview', 'thailand_fda', 70)
on conflict (code) do update
set
  name = excluded.name,
  label_key = excluded.label_key,
  domain = excluded.domain,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

insert into public.site_settings (key, value, description, is_public)
values
  (
    'public.default_language',
    '{"code": "en"}'::jsonb,
    'Default language for public website and member dashboard.',
    true
  ),
  (
    'admin.default_language',
    '{"code": "ko"}'::jsonb,
    'Default language for admin dashboard.',
    false
  ),
  (
    'content.require_admin_approval',
    '{"enabled": true}'::jsonb,
    'Approved content only is exposed publicly.',
    false
  )
on conflict (key) do update
set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public,
  is_active = true,
  updated_at = now();

insert into public.translations (language_code, translation_key, namespace, value)
values
  ('en', 'nav.commercial', 'navigation', 'Commercial'),
  ('en', 'nav.industrial', 'navigation', 'Industrial'),
  ('en', 'nav.epc', 'navigation', 'EPC'),
  ('en', 'nav.events', 'navigation', 'Event'),
  ('en', 'nav.buySell', 'navigation', 'BUY & SELL'),
  ('en', 'nav.networking', 'navigation', 'Networking'),
  ('en', 'nav.thailandFda', 'navigation', 'Thailand FDA Service'),
  ('en', 'nav.notice', 'navigation', 'Notice'),
  ('ko', 'admin.nav.members', 'admin', '회원 관리'),
  ('ko', 'admin.nav.companies', 'admin', '회사 관리'),
  ('ko', 'admin.nav.content', 'admin', '콘텐츠 승인'),
  ('ko', 'admin.nav.masterData', 'admin', '마스터 데이터'),
  ('ko', 'admin.nav.translations', 'admin', '번역 키'),
  ('ko', 'admin.nav.audit', 'admin', '감사 로그')
on conflict (language_code, translation_key) do update
set
  namespace = excluded.namespace,
  value = excluded.value,
  is_active = true,
  updated_at = now();

commit;

import fs from 'node:fs';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Client } = pg;
const FIXTURE = 'rls-fixture-smoke-test';
const CHILD_BUYER_EMAIL = 'rls-child-buyer@badaon.com';
const UNMANAGED_BUYER_EMAIL = 'rls-unmanaged-buyer@badaon.com';
const UNASSIGNED_STUDENT_EMAIL = 'rls-unassigned-student@badaon.com';

function loadEnv() {
  if (!fs.existsSync('.env.local')) return;

  for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;

    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
    process.env[match[1]] = value;
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

function createSupabase(accessToken) {
  const global = accessToken
    ? { headers: { Authorization: `Bearer ${accessToken}` } }
    : undefined;

  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false }, global },
  );
}

async function login(emailEnv, passwordEnv) {
  const client = createSupabase();
  const email = requireEnv(emailEnv);
  const password = requireEnv(passwordEnv);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`Login failed for ${emailEnv}: ${error?.message ?? 'missing session'}`);
  }

  return {
    email,
    userId: data.user.id,
    client: createSupabase(data.session.access_token),
  };
}

async function one(client, sql, params = []) {
  const result = await client.query(sql, params);
  if (!result.rows[0]) throw new Error(`Expected one row: ${sql}`);
  return result.rows[0];
}

async function maybeOne(client, sql, params = []) {
  const result = await client.query(sql, params);
  return result.rows[0] ?? null;
}

async function exec(client, sql, params = []) {
  await client.query(sql, params);
}

function skip(name, detail = '') {
  console.log(`SKIP ${name}${detail ? ` - ${detail}` : ''}`);
}

function pass(name, detail = '') {
  console.log(`PASS ${name}${detail ? ` - ${detail}` : ''}`);
}

function fail(name, detail = '') {
  console.log(`FAIL ${name}${detail ? ` - ${detail}` : ''}`);
  process.exitCode = 1;
}

async function expectCount(name, query, expected) {
  const { data, error } = await query;
  if (error) return fail(name, error.message);
  const count = data?.length ?? 0;
  if (count === expected) return pass(name, `count=${count}`);
  return fail(name, `count=${count}, expected=${expected}`);
}

async function expectAtLeast(name, query, minimum) {
  const { data, error } = await query;
  if (error) return fail(name, error.message);
  const count = data?.length ?? 0;
  if (count >= minimum) return pass(name, `count=${count}`);
  return fail(name, `count=${count}, expected>=${minimum}`);
}

async function expectBlocked(name, query) {
  const { data, error } = await query;
  const rows = Array.isArray(data) ? data.length : data ? 1 : 0;
  if (error || rows === 0) return pass(name, error?.message ?? 'no rows affected');
  return fail(name, `unexpectedly allowed rows=${rows}`);
}

async function expectAllowed(name, query) {
  const { data, error } = await query;
  if (error) return fail(name, error.message);
  const rows = Array.isArray(data) ? data.length : data ? 1 : 0;
  if (rows > 0) return pass(name, `rows=${rows}`);
  return fail(name, 'no rows returned');
}

async function expectNoError(name, query) {
  const { error } = await query;
  if (error) return fail(name, error.message);
  return pass(name);
}

async function resetFixtures(client) {
  const sql = [
    "delete from public.admin_logs where metadata->>'fixture' = $1",
    "delete from public.audit_events where metadata->>'fixture' = $1",
    "delete from public.activity_logs where metadata->>'fixture' = $1",
    "delete from public.analytics_events where metadata->>'fixture' = $1",
    "delete from public.showcase_inquiries where metadata->>'fixture' = $1",
    "delete from public.showcase_shares where metadata->>'fixture' = $1",
    "delete from public.showcase_views where metadata->>'fixture' = $1",
    "delete from public.message_attachments where file_name like 'RLS Test%'",
    "delete from public.messages where body like 'RLS Test%'",
    "delete from public.conversation_members where conversation_id in (select id from public.conversations where subject like 'RLS Test%')",
    "delete from public.conversations where subject like 'RLS Test%'",
    "delete from public.thailand_fda_applications where product_name like 'RLS Test%'",
    "delete from public.market_research_reports where title like 'RLS Test%'",
    "delete from public.student_showcase_items where showcase_id in (select id from public.student_showcases where title like 'RLS Test%')",
    "delete from public.student_showcase_items where product_id in (select id from public.products where title like 'RLS Test%')",
    "delete from public.student_showcases where title like 'RLS Test%'",
    "delete from public.buy_requests where title like 'RLS Test%'",
    "delete from public.buy_sell_posts where title like 'RLS Test%'",
    "delete from public.products where title like 'RLS Test%'",
    "delete from public.company_scores where score_factors->>'fixture' = $1",
    "delete from public.referral_relations where referral_code_id in (select id from public.referral_codes where code = 'RLSBUYER')",
    "delete from public.referral_codes where code = 'RLSBUYER'",
  ];

  for (const statement of sql) {
    await exec(client, statement, statement.includes('$1') ? [FIXTURE] : []);
  }
}

async function ensureTestProfile(client, { email, displayName, countryId, memberTypeId }) {
  const existingAuth = await maybeOne(
    client,
    'select id from auth.users where email = $1',
    [email],
  );

  const authUser = existingAuth ?? await one(
    client,
    `insert into auth.users (
      id, aud, role, email, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      is_sso_user, is_anonymous
    ) values (
      gen_random_uuid(), 'authenticated', 'authenticated', $1, now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
      false, false
    )
    returning id`,
    [email],
  );

  await exec(
    client,
    `insert into public.profiles (
      id, email, display_name, country_id, member_type_id,
      approval_status, activity_status, primary_language, is_active
    ) values ($1, $2, $3, $4, $5, 'approved', 'active', 'en', true)
    on conflict (id) do update set
      display_name = excluded.display_name,
      country_id = excluded.country_id,
      member_type_id = excluded.member_type_id,
      approval_status = excluded.approval_status,
      activity_status = excluded.activity_status,
      deleted_at = null`,
    [authUser.id, email, displayName, countryId, memberTypeId],
  );

  return authUser;
}

async function ensureBuyer(client, { email, displayName, companyName, countryId, memberTypeId }) {
  const authUser = await ensureTestProfile(client, {
    email,
    displayName,
    countryId,
    memberTypeId,
  });

  const buyer = await one(
    client,
    `insert into public.buyers (
      profile_id, company_name, country_id, approval_status, is_active, created_by
    ) values ($1, $2, $3, 'approved', true, $1)
    on conflict (profile_id) do update set
      company_name = excluded.company_name,
      country_id = excluded.country_id,
      approval_status = excluded.approval_status,
      deleted_at = null
    returning id, profile_id, country_id`,
    [authUser.id, companyName, countryId],
  );

  return buyer;
}

async function ensureChildBuyer(client, ids) {
  return ensureBuyer(client, {
    email: CHILD_BUYER_EMAIL,
    displayName: 'RLS Child Buyer',
    companyName: 'RLS Child Buyer Company',
    countryId: ids.krCountryId,
    memberTypeId: ids.buyerMemberTypeId,
  });
}

async function ensureUnmanagedBuyer(client, ids) {
  if (!ids.unmanagedCountryId) return null;

  return ensureBuyer(client, {
    email: UNMANAGED_BUYER_EMAIL,
    displayName: 'RLS Unmanaged Buyer',
    companyName: 'RLS Unmanaged Buyer Company',
    countryId: ids.unmanagedCountryId,
    memberTypeId: ids.buyerMemberTypeId,
  });
}

async function ensureUnassignedStudent(client, ids) {
  const authUser = await ensureTestProfile(client, {
    email: UNASSIGNED_STUDENT_EMAIL,
    displayName: 'RLS Unassigned Student',
    countryId: ids.krCountryId,
    memberTypeId: ids.studentMemberTypeId,
  });

  return one(
    client,
    `insert into public.students (
      profile_id, professor_id, university_name, graduation_status, is_active, created_by
    ) values ($1, null, 'RLS Test University', 'enrolled', true, $1)
    on conflict (profile_id) do update set
      professor_id = null,
      graduation_status = excluded.graduation_status,
      deleted_at = null
    returning id, profile_id`,
    [authUser.id],
  );
}

async function seedFixtures(client, actors) {
  const agent = await one(client, 'select id from public.agents where profile_id = $1', [actors.agent.userId]);
  const unmanagedCountry = await maybeOne(
    client,
    `select countries.id
     from public.countries
     where countries.status = 'active'
       and countries.deleted_at is null
       and not exists (
         select 1
         from public.country_agents
         where country_agents.country_id = countries.id
           and country_agents.agent_id = $1
           and country_agents.status = 'active'
           and country_agents.deleted_at is null
       )
     order by countries.code
     limit 1`,
    [agent.id],
  );

  const ids = {
    krCountryId: (await one(client, "select id from public.countries where code = 'KR'")).id,
    commercialIndustryId: (await one(client, "select id from public.industries where code = 'commercial'")).id,
    buyerMemberTypeId: (await one(client, "select id from public.member_types where code = 'buyer'")).id,
    studentMemberTypeId: (await one(client, "select id from public.member_types where code = 'student'")).id,
    unmanagedCountryId: unmanagedCountry?.id ?? null,
  };

  const supplier = await one(client, 'select id, company_id from public.suppliers where profile_id = $1', [actors.supplier.userId]);
  const buyer = await one(client, 'select id, country_id from public.buyers where profile_id = $1', [actors.buyer.userId]);
  const student = await one(client, 'select id from public.students where profile_id = $1', [actors.student.userId]);
  const childBuyer = await ensureChildBuyer(client, ids);
  const unmanagedBuyer = await ensureUnmanagedBuyer(client, ids);
  const unassignedStudent = await ensureUnassignedStudent(client, ids);

  await resetFixtures(client);

  const approvedProduct = await one(
    client,
    `insert into public.products (
      supplier_id, company_id, industry_id, title, summary, description,
      approval_status, is_active, created_by, approved_by, approved_at
    ) values ($1, $2, $3, 'RLS Test Approved Product', 'approved fixture', $4, 'approved', true, $5, $6, now())
    returning id`,
    [supplier.id, supplier.company_id, ids.commercialIndustryId, FIXTURE, actors.supplier.userId, actors.admin.userId],
  );

  const pendingProduct = await one(
    client,
    `insert into public.products (
      supplier_id, company_id, industry_id, title, summary, description,
      approval_status, is_active, created_by
    ) values ($1, $2, $3, 'RLS Test Pending Product', 'pending fixture', $4, 'submitted', true, $5)
    returning id`,
    [supplier.id, supplier.company_id, ids.commercialIndustryId, FIXTURE, actors.supplier.userId],
  );

  const approvedShowcase = await one(
    client,
    `insert into public.student_showcases (
      student_id, title, description, target_country_id, approval_status,
      is_active, created_by, approved_by, approved_at
    ) values ($1, 'RLS Test Approved Showcase', $2, $3, 'approved', true, $4, $5, now())
    returning id`,
    [student.id, FIXTURE, ids.krCountryId, actors.student.userId, actors.admin.userId],
  );

  const draftShowcase = await one(
    client,
    `insert into public.student_showcases (
      student_id, title, description, target_country_id, approval_status, is_active, created_by
    ) values ($1, 'RLS Test Draft Showcase', $2, $3, 'draft', true, $4)
    returning id`,
    [student.id, FIXTURE, ids.krCountryId, actors.student.userId],
  );

  await exec(
    client,
    `insert into public.student_showcase_items (
      showcase_id, product_id, student_note, created_by
    ) values ($1, $2, $3, $4)`,
    [approvedShowcase.id, approvedProduct.id, FIXTURE, actors.student.userId],
  );

  const approvedReport = await one(
    client,
    `insert into public.market_research_reports (
      student_id, country_id, industry_id, title, summary, content,
      approval_status, is_active, created_by, approved_by, approved_at
    ) values ($1, $2, $3, 'RLS Test Approved Report', $4, $4, 'approved', true, $5, $6, now())
    returning id`,
    [student.id, ids.krCountryId, ids.commercialIndustryId, FIXTURE, actors.student.userId, actors.admin.userId],
  );

  const pendingReport = await one(
    client,
    `insert into public.market_research_reports (
      student_id, country_id, industry_id, title, summary, content,
      approval_status, is_active, created_by
    ) values ($1, $2, $3, 'RLS Test Pending Report', $4, $4, 'submitted', true, $5)
    returning id`,
    [student.id, ids.krCountryId, ids.commercialIndustryId, FIXTURE, actors.student.userId],
  );

  const approvedBuyRequest = await one(
    client,
    `insert into public.buy_requests (
      buyer_id, industry_id, destination_country_id, title, details,
      approval_status, is_active, created_by, approved_by, approved_at
    ) values ($1, $2, $3, 'RLS Test Approved Buy Request', $4, 'approved', true, $5, $6, now())
    returning id`,
    [buyer.id, ids.commercialIndustryId, ids.krCountryId, FIXTURE, actors.buyer.userId, actors.admin.userId],
  );

  const privateBuyRequest = await one(
    client,
    `insert into public.buy_requests (
      buyer_id, industry_id, destination_country_id, title, details,
      approval_status, is_active, created_by
    ) values ($1, $2, $3, 'RLS Test Private Buy Request', $4, 'submitted', true, $5)
    returning id`,
    [buyer.id, ids.commercialIndustryId, ids.krCountryId, FIXTURE, actors.buyer.userId],
  );

  const unmanagedBuyRequest = unmanagedBuyer
    ? await one(
      client,
      `insert into public.buy_requests (
        buyer_id, industry_id, destination_country_id, title, details,
        approval_status, is_active, created_by
      ) values ($1, $2, $3, 'RLS Test Unmanaged Country Buy Request', $4, 'submitted', true, $5)
      returning id`,
      [unmanagedBuyer.id, ids.commercialIndustryId, unmanagedBuyer.country_id, FIXTURE, unmanagedBuyer.profile_id],
    )
    : null;

  const referralCode = await one(
    client,
    `insert into public.referral_codes (
      buyer_id, code, referral_url, is_active, created_by
    ) values ($1, 'RLSBUYER', 'https://b2bb2g.com/ref/RLSBUYER', true, $2)
    returning id`,
    [buyer.id, actors.buyer.userId],
  );

  const referralRelation = await one(
    client,
    `insert into public.referral_relations (
      parent_buyer_id, child_buyer_id, referral_code_id, status, reward_status, is_active, created_by
    ) values ($1, $2, $3, 'active', 'pending', true, $4)
    returning id`,
    [buyer.id, childBuyer.id, referralCode.id, actors.buyer.userId],
  );

  const conversation = await one(
    client,
    `insert into public.conversations (
      conversation_type, subject, is_blocked, is_active, created_by
    ) values ('direct', 'RLS Test Buyer Student Conversation', false, true, $1)
    returning id`,
    [actors.buyer.userId],
  );

  await exec(
    client,
    `insert into public.conversation_members (
      conversation_id, profile_id, member_role, created_by
    ) values
      ($1, $2, 'owner', $2),
      ($1, $3, 'member', $2)`,
    [conversation.id, actors.buyer.userId, actors.student.userId],
  );

  const message = await one(
    client,
    `insert into public.messages (
      conversation_id, sender_profile_id, body, created_by
    ) values ($1, $2, 'RLS Test Seed Message', $2)
    returning id`,
    [conversation.id, actors.buyer.userId],
  );

  const fdaApplication = await one(
    client,
    `insert into public.thailand_fda_applications (
      supplier_id, service_category, product_name, formula_summary, status,
      is_active, created_by
    ) values ($1, 'cosmetic_registration', 'RLS Test FDA Product', $2, 'submitted', true, $3)
    returning id`,
    [supplier.id, FIXTURE, actors.supplier.userId],
  );

  await exec(
    client,
    `insert into public.company_scores (
      company_id, score, profile_completion_score, product_score, verification_score,
      response_score, score_factors, is_public, is_active, created_by
    ) values ($1, 80, 80, 80, 80, 80, $2::jsonb, true, true, $3)`,
    [supplier.company_id, JSON.stringify({ fixture: FIXTURE }), actors.admin.userId],
  );

  const adminLog = await one(
    client,
    `insert into public.admin_logs (
      actor_profile_id, action, target_table, target_id, target_label,
      metadata, created_by
    ) values ($1, 'manual', 'products', $2, 'RLS Test Admin Log', $3::jsonb, $1)
    returning id`,
    [actors.admin.userId, approvedProduct.id, JSON.stringify({ fixture: FIXTURE })],
  );

  const auditEvent = await one(
    client,
    `insert into public.audit_events (
      event_level, event_type, severity, actor_profile_id, target_table,
      target_id, message, metadata, created_by
    ) values (
      'security', 'rls_blocked', 'warning', $1, 'products',
      $2, 'RLS Test Audit Event', $3::jsonb, $4
    )
    returning id`,
    [actors.supplier.userId, pendingProduct.id, JSON.stringify({ fixture: FIXTURE }), actors.admin.userId],
  );

  const studentActivityLog = await one(
    client,
    `insert into public.activity_logs (
      profile_id, actor_profile_id, activity_type, target_table, target_id,
      summary, metadata, created_by
    ) values ($1, $1, 'showcase_created', 'student_showcases', $2, $3, $4::jsonb, $1)
    returning id`,
    [actors.student.userId, draftShowcase.id, 'RLS Test Student Activity', JSON.stringify({ fixture: FIXTURE })],
  );

  return {
    approvedProduct,
    pendingProduct,
    approvedShowcase,
    draftShowcase,
    approvedReport,
    pendingReport,
    approvedBuyRequest,
    privateBuyRequest,
    referralCode,
    referralRelation,
    conversation,
    message,
    fdaApplication,
    unmanagedBuyer,
    unmanagedBuyRequest,
    unassignedStudent,
    adminLog,
    auditEvent,
    studentActivityLog,
  };
}

async function runChecks(actors, fixtures) {
  const anon = createSupabase();

  await expectCount(
    'Anonymous sees approved product',
    anon.from('products').select('id').eq('title', 'RLS Test Approved Product'),
    1,
  );
  await expectCount(
    'Anonymous cannot see pending product',
    anon.from('products').select('id').eq('title', 'RLS Test Pending Product'),
    0,
  );
  await expectCount(
    'Anonymous sees approved showcase',
    anon.from('student_showcases').select('id').eq('title', 'RLS Test Approved Showcase'),
    1,
  );
  await expectCount(
    'Anonymous cannot see draft showcase',
    anon.from('student_showcases').select('id').eq('title', 'RLS Test Draft Showcase'),
    0,
  );
  await expectCount(
    'Anonymous sees approved report',
    anon.from('market_research_reports').select('id').eq('title', 'RLS Test Approved Report'),
    1,
  );
  await expectCount(
    'Anonymous cannot see pending report',
    anon.from('market_research_reports').select('id').eq('title', 'RLS Test Pending Report'),
    0,
  );
  await expectCount(
    'Anonymous sees approved buy request',
    anon.from('buy_requests').select('id').eq('title', 'RLS Test Approved Buy Request'),
    1,
  );
  await expectCount(
    'Anonymous cannot see private buy request',
    anon.from('buy_requests').select('id').eq('title', 'RLS Test Private Buy Request'),
    0,
  );
  await expectNoError(
    'Anonymous can insert public analytics event',
    anon.from('analytics_events').insert({
      event_type: 'product_view',
      target_table: 'products',
      target_id: fixtures.approvedProduct.id,
      session_id: `anon-${Date.now()}`,
      is_anonymous: true,
      metadata: { fixture: FIXTURE },
    }),
  );
  await expectCount(
    'Anonymous cannot read raw analytics events',
    anon.from('analytics_events').select('id').eq('metadata->>fixture', FIXTURE),
    0,
  );
  await expectAtLeast(
    'Anonymous sees public company score',
    anon.from('company_scores').select('id').eq('score_factors->>fixture', FIXTURE),
    1,
  );

  await expectAllowed(
    'Supplier updates own product',
    actors.supplier.client
      .from('products')
      .update({ summary: 'updated by supplier fixture' })
      .eq('id', fixtures.approvedProduct.id)
      .select('id'),
  );
  await expectBlocked(
    'Student cannot update product origin',
    actors.student.client
      .from('products')
      .update({ summary: 'blocked student product update' })
      .eq('id', fixtures.approvedProduct.id)
      .select('id'),
  );
  await expectAllowed(
    'Student inserts showcase item with approved product',
    actors.student.client
      .from('student_showcase_items')
      .insert({
        showcase_id: fixtures.draftShowcase.id,
        product_id: fixtures.approvedProduct.id,
        student_note: FIXTURE,
        created_by: actors.student.userId,
      })
      .select('id'),
  );
  await expectBlocked(
    'Student cannot add pending product to showcase',
    actors.student.client
      .from('student_showcase_items')
      .insert({
        showcase_id: fixtures.draftShowcase.id,
        product_id: fixtures.pendingProduct.id,
        student_note: FIXTURE,
        created_by: actors.student.userId,
      })
      .select('id'),
  );
  await expectAllowed(
    'Student inserts market research report draft',
    actors.student.client
      .from('market_research_reports')
      .insert({
        student_id: (await actors.student.client.from('students').select('id').single()).data.id,
        title: 'RLS Test Student Inserted Report',
        summary: FIXTURE,
        content: FIXTURE,
        approval_status: 'draft',
        created_by: actors.student.userId,
      })
      .select('id'),
  );
  await expectAllowed(
    'Buyer inserts own buy request',
    actors.buyer.client
      .from('buy_requests')
      .insert({
        buyer_id: (await actors.buyer.client.from('buyers').select('id').single()).data.id,
        title: 'RLS Test Buyer Inserted Buy Request',
        details: FIXTURE,
        approval_status: 'draft',
        created_by: actors.buyer.userId,
      })
      .select('id'),
  );
  await expectCount(
    'Supplier cannot see buyer private buy request',
    actors.supplier.client.from('buy_requests').select('id').eq('id', fixtures.privateBuyRequest.id),
    0,
  );
  await expectAtLeast(
    'Buyer sees own referral code',
    actors.buyer.client.from('referral_codes').select('id').eq('code', 'RLSBUYER'),
    1,
  );
  await expectAtLeast(
    'Buyer sees referral relation',
    actors.buyer.client.from('referral_relations').select('id').eq('id', fixtures.referralRelation.id),
    1,
  );
  await expectAtLeast(
    'Agent sees managed-country referral relation',
    actors.agent.client.from('referral_relations').select('id').eq('id', fixtures.referralRelation.id),
    1,
  );
  await expectCount(
    'Supplier cannot see referral relation',
    actors.supplier.client.from('referral_relations').select('id').eq('id', fixtures.referralRelation.id),
    0,
  );
  if (fixtures.unmanagedBuyer && fixtures.unmanagedBuyRequest) {
    await expectCount(
      'Agent cannot see unassigned-country buyer',
      actors.agent.client.from('buyers').select('id').eq('id', fixtures.unmanagedBuyer.id),
      0,
    );
    await expectCount(
      'Agent cannot see unassigned-country buy request',
      actors.agent.client.from('buy_requests').select('id').eq('id', fixtures.unmanagedBuyRequest.id),
      0,
    );
    await expectAtLeast(
      'Admin can see unassigned-country buyer',
      actors.admin.client.from('buyers').select('id').eq('id', fixtures.unmanagedBuyer.id),
      1,
    );
  } else {
    skip('Agent unassigned-country edge checks', 'no unmanaged country fixture available');
  }
  await expectCount(
    'Professor cannot see unassigned student',
    actors.professor.client.from('students').select('id').eq('id', fixtures.unassignedStudent.id),
    0,
  );
  await expectCount(
    'Student cannot see unrelated student profile',
    actors.student.client.from('students').select('id').eq('id', fixtures.unassignedStudent.id),
    0,
  );
  await expectAtLeast(
    'Buyer accesses conversation membership',
    actors.buyer.client.from('conversations').select('id').eq('id', fixtures.conversation.id),
    1,
  );
  await expectAtLeast(
    'Agent accesses managed buyer conversation',
    actors.agent.client.from('conversations').select('id').eq('id', fixtures.conversation.id),
    1,
  );
  await expectAtLeast(
    'Professor accesses assigned student conversation',
    actors.professor.client.from('conversations').select('id').eq('id', fixtures.conversation.id),
    1,
  );
  await expectCount(
    'Supplier cannot access unrelated conversation',
    actors.supplier.client.from('conversations').select('id').eq('id', fixtures.conversation.id),
    0,
  );
  await expectAllowed(
    'Buyer inserts message in accessible conversation',
    actors.buyer.client
      .from('messages')
      .insert({
        conversation_id: fixtures.conversation.id,
        sender_profile_id: actors.buyer.userId,
        body: 'RLS Test Buyer Message',
        created_by: actors.buyer.userId,
      })
      .select('id'),
  );
  await expectAllowed(
    'Supplier inserts own FDA application',
    actors.supplier.client
      .from('thailand_fda_applications')
      .insert({
        supplier_id: (await actors.supplier.client.from('suppliers').select('id').single()).data.id,
        service_category: 'label_compliance',
        product_name: 'RLS Test Supplier Inserted FDA Product',
        formula_summary: FIXTURE,
        status: 'submitted',
        created_by: actors.supplier.userId,
      })
      .select('id'),
  );
  await expectCount(
    'Buyer cannot see supplier FDA application',
    actors.buyer.client.from('thailand_fda_applications').select('id').eq('id', fixtures.fdaApplication.id),
    0,
  );
  await expectAllowed(
    'Admin can reject pending product',
    actors.admin.client
      .from('products')
      .update({ approval_status: 'rejected', approved_by: actors.admin.userId })
      .eq('id', fixtures.pendingProduct.id)
      .select('id'),
  );
  await expectAtLeast(
    'Admin can read analytics events',
    actors.admin.client.from('analytics_events').select('id').eq('metadata->>fixture', FIXTURE),
    1,
  );
  await expectAtLeast(
    'Admin can read admin logs',
    actors.admin.client.from('admin_logs').select('id').eq('id', fixtures.adminLog.id),
    1,
  );
  await expectCount(
    'Buyer cannot read admin logs',
    actors.buyer.client.from('admin_logs').select('id').eq('id', fixtures.adminLog.id),
    0,
  );
  await expectBlocked(
    'Supplier cannot insert admin log',
    actors.supplier.client
      .from('admin_logs')
      .insert({
        actor_profile_id: actors.supplier.userId,
        action: 'manual',
        target_table: 'products',
        target_id: fixtures.approvedProduct.id,
        target_label: 'RLS Test Supplier Admin Log Attempt',
        metadata: { fixture: FIXTURE },
        created_by: actors.supplier.userId,
      })
      .select('id'),
  );
  await expectAtLeast(
    'Admin can read audit events',
    actors.admin.client.from('audit_events').select('id').eq('id', fixtures.auditEvent.id),
    1,
  );
  await expectCount(
    'Student cannot read audit events',
    actors.student.client.from('audit_events').select('id').eq('id', fixtures.auditEvent.id),
    0,
  );
  await expectBlocked(
    'Buyer cannot insert audit event',
    actors.buyer.client
      .from('audit_events')
      .insert({
        event_level: 'security',
        event_type: 'manual',
        severity: 'warning',
        actor_profile_id: actors.buyer.userId,
        target_table: 'products',
        target_id: fixtures.approvedProduct.id,
        message: 'RLS Test Buyer Audit Attempt',
        metadata: { fixture: FIXTURE },
        created_by: actors.buyer.userId,
      })
      .select('id'),
  );
  await expectAtLeast(
    'Student reads own activity log',
    actors.student.client.from('activity_logs').select('id').eq('id', fixtures.studentActivityLog.id),
    1,
  );
  await expectAtLeast(
    'Professor reads assigned student activity log',
    actors.professor.client.from('activity_logs').select('id').eq('id', fixtures.studentActivityLog.id),
    1,
  );
  await expectCount(
    'Supplier cannot read student activity log',
    actors.supplier.client.from('activity_logs').select('id').eq('id', fixtures.studentActivityLog.id),
    0,
  );
  await expectBlocked(
    'Buyer cannot insert activity log for another profile',
    actors.buyer.client
      .from('activity_logs')
      .insert({
        profile_id: actors.student.userId,
        actor_profile_id: actors.buyer.userId,
        activity_type: 'manual',
        target_table: 'students',
        target_id: fixtures.unassignedStudent.id,
        summary: 'RLS Test Cross Profile Activity Attempt',
        metadata: { fixture: FIXTURE },
        created_by: actors.buyer.userId,
      })
      .select('id'),
  );
}

async function main() {
  loadEnv();

  const actors = {
    admin: await login('RLS_TEST_ADMIN_EMAIL', 'RLS_TEST_ADMIN_PASSWORD'),
    supplier: await login('RLS_TEST_SUPPLIER_EMAIL', 'RLS_TEST_SUPPLIER_PASSWORD'),
    buyer: await login('RLS_TEST_BUYER_EMAIL', 'RLS_TEST_BUYER_PASSWORD'),
    agent: await login('RLS_TEST_AGENT_EMAIL', 'RLS_TEST_AGENT_PASSWORD'),
    professor: await login('RLS_TEST_PROFESSOR_EMAIL', 'RLS_TEST_PROFESSOR_PASSWORD'),
    student: await login('RLS_TEST_STUDENT_EMAIL', 'RLS_TEST_STUDENT_PASSWORD'),
  };

  const pgClient = new Client({
    connectionString: requireEnv('DATABASE_URL'),
    ssl: requireEnv('DATABASE_URL').includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  });

  await pgClient.connect();
  try {
    const fixtures = await seedFixtures(pgClient, actors);
    await runChecks(actors, fixtures);
  } finally {
    await pgClient.end();
  }

  if (process.exitCode) {
    throw new Error('RLS fixture smoke test failed');
  }
}

main().catch((error) => {
  console.error(`ERROR ${error.message}`);
  process.exit(1);
});

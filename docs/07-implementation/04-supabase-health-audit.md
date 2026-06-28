# Supabase Health Audit

## 1. Project Summary

감사 대상:

- Supabase project ref: `ysonocyrvvskdajmpdmu`
- Supabase URL: `https://ysonocyrvvskdajmpdmu.supabase.co`
- Audit mode: read-only
- Checked at: 2026-06-28

접속 및 환경 확인:

| Item | Result |
|---|---|
| Remote DB connection | Reachable through configured DB URL |
| PostgreSQL version | 17.6 |
| Public tables | 62 |
| Public tables with RLS enabled | 62 |
| Public tables with RLS disabled | 0 |
| Public RLS policies | 186 |
| Public security definer functions | 25 |
| Local migration files | 27 |
| Local seed files | 2 |
| Local `supabase/functions` directory | Not present |
| Supabase CLI | Not installed in current shell |
| Native Supabase Management API access | Not available in current environment |

Important limitation:

- Supabase Dashboard의 native Security Advisor / Performance Advisor 원문은 Supabase CLI 또는 Management API access token 없이 직접 조회하지 못했다.
- 따라서 이번 감사의 Advisor 항목은 DB catalog, RLS metadata, policy metadata, index statistics, local migration files, REST read checks 기반의 read-only equivalent audit이다.
- Supabase key 값은 확인하지 않았고 문서에 기록하지 않았다.

## 2. Security Advisor Findings

| Priority | Finding | Evidence | Recommendation |
|---|---|---|---|
| Info | 모든 public table에 RLS가 활성화되어 있다 | 62 / 62 public tables have RLS enabled | 유지 |
| Info | public table 전체에 policy가 존재한다 | 186 policies across 62 tables | 유지, 정책 품질 검토는 계속 필요 |
| P1 High | Supplier-Buyer direct conversation 금지 규칙이 DB/RLS 레벨에서 완성되지 않았다 | `conversations` type은 `direct/group/support`, `messages_member_insert`는 `can_access_conversation` 기반 | Admin Brokerage conversation model을 schema/RLS에 반영 |
| P1 High | `conversations_creator_insert`, `conversation_members_self_insert`, `messages_member_insert` 조합은 직접 대화 생성을 구조적으로 막지 않는다 | RLS는 membership 중심이고 role combination 검증이 없음 | P1 app-level 차단을 DB/RLS policy로 보완 |
| P2 Medium | `security definer` 함수가 25개 있다 | all have `search_path=public`, but broad access helper surface exists | 함수별 role boundary와 SQL body review 필요 |
| P2 Medium | `auth.role() = 'service_role'` 예외가 audit/activity insert 정책에 존재한다 | `activity_logs`, `audit_events` insert policy | audit/system task 용도는 가능하나 사용처와 logging policy를 제한 |
| P2 Medium | public insert 정책이 analytics/showcase/activity성 테이블에 존재한다 | `analytics_events_public_insert`, `showcase_views_public_insert`, `showcase_shares_public_insert`, `showcase_inquiries_public_insert` | rate limit, abuse control, payload validation 필요 |
| P2 Medium | active referral code read가 public policy로 열려 있다 | `member_referral_codes_public_active_select` | invite validation 전용 RPC 또는 제한 view 검토 |

No P0 Critical Supabase-level issue was found in this read-only audit.

## 3. Performance Advisor Findings

Native Performance Advisor 원문은 조회하지 못했다. DB statistics 기반으로 아래를 확인했다.

| Priority | Finding | Evidence | Recommendation |
|---|---|---|---|
| Info | duplicate index 후보 없음 | duplicate index query returned 0 rows | 유지 |
| P3 Low | zero-scan index가 많다 | 291 total indexes, 177 zero-scan indexes | 현재 row 수가 작아 판단 보류. 운영 트래픽 후 재측정 |
| P3 Low | 일부 테이블에 인덱스가 많이 잡혀 있으나 사용량이 아직 낮다 | zero-scan top: `files`, `featured_contents`, `banners`, `buyer_sources`, `events` | early-stage 데이터에서는 정상일 수 있음. 실제 workload 기반으로 조정 |
| Info | public table row count가 작다 | largest estimated table: `admin_logs` 약 42 rows | 성능 결론은 아직 제한적 |

성능 감사 결론:

- 지금은 데이터량과 트래픽이 작아 unused index를 제거할 근거가 부족하다.
- 인덱스 삭제는 금지한다. 운영 로그/쿼리 패턴이 쌓인 후 Performance Advisor와 `pg_stat_statements` 기반으로 재평가한다.

## 4. RLS / Policy Risk Summary

| Area | Status | Risk | Notes |
|---|---|---|---|
| RLS activation | Good | Info | public 62 tables all RLS enabled |
| Approved public content | Mostly aligned | P2 Medium | products/content/company public select policies use approved/active/deleted checks |
| Buyer PII | Needs deeper tests | P1 High | `profiles.email/phone` is protected by owner/admin policy, but joined views/DTO/RPC tests are still needed |
| Student privacy | Needs deeper tests | P2 Medium | `students_owner_select` allows owner, assigned professor, admin |
| Supplier-Buyer messages | Not fully aligned | P1 High | DB/RLS does not encode Admin Brokerage requirement yet |
| Admin audit logs | Mostly restricted | P2 Medium | admin policies plus service role insert exceptions exist |
| Security definer helpers | Needs review | P2 Medium | all checked functions set `search_path=public`, but logic must be reviewed before ERD/RLS rewrite |

Security definer functions observed:

- Access helpers: `can_access_activity_log`, `can_access_buyer_source`, `can_access_conversation`, `can_access_file`, `can_access_matching_request`, `can_access_message`, `can_access_owned_seo_target`, `can_access_showcase`, `can_access_showcase_kpi`
- Role helpers: `current_agent_id`, `current_buyer_id`, `current_professor_id`, `current_profile_id`, `current_student_id`, `current_supplier_id`
- Permission helpers: `has_member_type`, `has_permission`, `is_admin`, `is_profile_owner`, `is_assigned_student`, `can_manage_country`, `can_manage_showcase`
- Public gate helpers: `is_approved_product`, `is_public_content_target`, `is_published_event`

## 5. Edge Functions

| Item | Result |
|---|---|
| Local `supabase/functions` directory | Not present |
| Remote Edge Function list | Not available through DB connection |
| JWT verification status | Not verifiable without Management API / CLI access |

Conclusion:

- No local Edge Function source exists in this repository.
- Remote Edge Functions require Supabase Management API or CLI auth to list and inspect.
- Before deploying Edge Functions, require explicit JWT verification and secret access rules in the function manifest/review checklist.

## 6. Branches / Environment

| Item | Result |
|---|---|
| Project URL | Confirmed |
| DB connection | Confirmed |
| Branch metadata | Not available through DB connection |
| Supabase CLI project link state | No local `supabase/config.toml`; CLI not installed |
| Local env keys | `.env.local` contains Supabase URL, public keys, service role key, DB URLs, and RLS test accounts |

Conclusion:

- Application can connect to the target project.
- Branch/environment management is not configured locally through Supabase CLI.
- For future direct migration work, install/link Supabase CLI or use Management API with a token stored outside git.

## 7. Publishable Key Status

Keys were checked without printing values.

| Key Name | Configured | Active REST Read Check |
|---|---:|---:|
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Passed |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Passed |

Summary:

- Configured public key count: 2
- Active public key count by `countries` read check: 2
- Key values were not printed or written.

Risk:

- P2 Medium: both `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured. This is not immediately unsafe, but the project should standardize on one public key path to reduce configuration drift.

## 8. GitHub Migration Alignment

| Item | Result |
|---|---|
| Local migration files | 27 |
| Local public tables declared by migrations | 62 |
| Remote public tables | 62 |
| Missing remote tables vs local migration declarations | 0 |
| Extra remote public tables vs local migration declarations | 0 |
| Remote `supabase_migrations.schema_migrations` | Not present |
| Existing migration metadata tables | `auth.schema_migrations`, `realtime.schema_migrations`, `storage.migrations` |

Conclusion:

- Table-level alignment is good: local migration-declared public tables match remote public tables exactly.
- Migration tracking alignment is incomplete: the standard `supabase_migrations.schema_migrations` table was not found.
- This suggests the remote DB may have been initialized manually, through SQL editor, or through a migration path that did not leave Supabase CLI migration metadata.

Risk:

- P1 High: future migration application can drift if local migration history is not reconciled with remote migration tracking.

Recommended before write migrations:

1. Install/link Supabase CLI for project `ysonocyrvvskdajmpdmu`.
2. Run migration list/repair workflow in a separate, approved migration-readiness task.
3. Do not apply destructive or structural migrations until migration history is reconciled.

## 9. Risks by Priority

### P0 Critical

- None found in this read-only Supabase audit.

### P1 High

- Supplier-Buyer direct conversation prevention is still app-level, not DB/RLS-level.
- Migration history tracking is not aligned with standard Supabase CLI metadata.
- Buyer PII protection needs explicit RLS regression tests across Supplier, Buyer, Agent, Professor, Student, Admin roles.

### P2 Medium

- 25 public security definer helper functions require body-level review before ERD/RLS redesign.
- Public insert policies for analytics/showcase/inquiry style tables need abuse/rate-limit strategy.
- Public active referral code read should be replaced or constrained by scoped RPC/view.
- Both publishable and legacy anon public key env names are configured.
- service role exceptions in audit/activity policies need explicit server-only usage inventory.

### P3 Low

- 177 zero-scan indexes observed, but current data volume is too small for removal decisions.
- No local Edge Function source exists, so Edge Function JWT posture is not yet proven.

### Info

- Remote DB is reachable.
- All 62 public tables have RLS enabled.
- No duplicate indexes were detected.
- Local table declarations and remote public tables match by table name.

## 10. Next Recommended Actions

1. Create a `Communication / Trade Brokerage RLS Design Patch`.
   - Add DB-level concept for Admin Brokerage conversations.
   - Prevent Supplier-Buyer direct conversation creation at RLS level.
   - Keep Agent-Buyer and Professor-Student direct conversations allowed.

2. Run role-based RLS smoke tests.
   - Buyer PII as Supplier: denied/masked.
   - Student data as unrelated Professor: denied.
   - Conversation insert/message insert by Supplier-Buyer direct pair: denied.
   - Admin mediated conversation: allowed.

3. Reconcile migration tracking before applying future DB migrations.
   - Supabase CLI link/list/repair should be done as a separate approved task.
   - Confirm migration metadata before any schema-changing work.

4. Review security definer functions.
   - Verify all helpers use least privilege.
   - Verify no function leaks Buyer email/phone, admin notes, audit details, or unrelated Student data.

5. Standardize public key usage.
   - Keep one public client key convention in code and docs.
   - Continue to keep service role key server-only.

6. Re-run native Advisor checks once Supabase CLI or Management API access is available.
   - Security Advisor
   - Performance Advisor
   - Edge Function JWT verification
   - Branch/environment metadata

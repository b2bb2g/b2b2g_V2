# RLS Test Checklist: b2bb2g-mvp

> 작성일: 2026-06-19  
> 기준 문서: `docs/02-design/features/RLS.md`

## 현재 테스트 환경

- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL` 존재
- `.env.local`에 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 존재
- `.env.local`에 `DATABASE_URL`, `DIRECT_URL` 존재
- `.env.local`에 6개 role 테스트 계정 이메일/비밀번호 존재
- Supabase Auth 테스트 계정 6개 로그인 확인 완료
- `profiles`, member domain row, admin role, supplier test company, professor-student 관계, agent-country 관계 seed 완료
- service role key는 클라이언트/앱 코드에 사용하지 않는다.

## 이번 자동 확인 범위

- [x] SQL 24, 25 적용 완료 보고 반영
- [x] 모든 migration/seed 파일 `begin/commit` 균형 확인
- [x] Next.js build에서 타입 검증
- [x] Public Supabase key만 사용하는 익명 접근 smoke test 실행
- [x] 실제 DB role별 RLS smoke test 실행
- [x] Fixture 기반 RLS 상세 smoke test 실행

## 2026-06-19 익명 smoke test 결과

Public Supabase key로 아래 select를 실행했다. 현재 데이터가 없거나 RLS가 행을 숨기는 경우 모두 `ok:0`으로 나타날 수 있으므로, 이 결과는 연결과 기본 정책 동작만 확인한다.

| 항목 | 결과 |
|------|------|
| `admin_logs` select | `ok:0` |
| `audit_events` select | `ok:0` |
| `profiles` select | `ok:0` |
| `analytics_events` select | `ok:0` |
| `companies` public select | `ok:0` |

## 2026-06-19 role별 smoke test 결과

테스트 계정 6개를 Supabase Auth로 로그인하고, `profiles.member_type_id` 연결과 핵심 RLS 동작을 확인했다.

| Role | 로그인 | Profile / Member Type | 핵심 확인 |
|------|--------|-----------------------|-----------|
| Admin | 성공 | `administrator` / approved / active | `profiles` 6건 조회, `admin_logs` insert/select 성공, `audit_events` insert/select 성공 |
| Supplier | 성공 | `supplier` / approved / active | 본인 `suppliers` row 조회, `admin_logs`/`audit_events` 조회 0건, `admin_logs` insert 차단 |
| Buyer | 성공 | `buyer` / approved / active | 본인 `buyers` row 조회 |
| Agent | 성공 | `agent` / approved / active | 배정 국가 Buyer 조회 |
| Professor | 성공 | `professor` / approved / active | 담당 Student 조회 |
| Student | 성공 | `student` / approved / active | `products` 직접 insert 차단 |
| Anonymous | 해당 없음 | 해당 없음 | `profiles` 0건, approved public company 1건 조회 |

## 2026-06-19 fixture 기반 상세 RLS smoke test 결과

`scripts/rls-fixture-smoke-test.mjs`로 테스트 전용 fixture를 생성하고 Supabase public key, role별 Auth session, `DATABASE_URL` 기반 seed를 조합해 검증했다. Anonymous analytics는 설계상 insert만 허용하고 select는 금지하므로 `insert(...).select()`가 아니라 insert 성공 여부만 검증했다.

| 영역 | 결과 |
|------|------|
| Public product/showcase/report/buy request | approved row 조회 성공, pending/draft/private row 비노출 |
| Analytics | Anonymous public event insert 성공, raw analytics select 차단, Admin raw select 성공 |
| Supplier | 본인 product update 성공, 본인 Thailand FDA application insert 성공 |
| Buyer | 본인 Buy Request insert 성공, referral code/relation 조회 성공 |
| Agent | 배정 국가 child buyer referral relation과 buyer conversation 접근 성공 |
| Professor | 담당 Student conversation 접근 성공 |
| Student | approved product showcase item insert 성공, pending product showcase item insert 차단, product 원본 update 차단, market research draft insert 성공 |
| Admin | pending product reject update 성공 |

## 실제 DB에서 확인할 항목

### Anonymous

- [x] 승인된 public company만 조회 가능
- [x] 승인된 product만 조회 가능
- [x] 승인된 Student Showcase만 조회 가능
- [x] pending/rejected 콘텐츠 조회 불가
- [x] profile 데이터 조회 불가

### Supplier

- [x] 본인 company와 product만 수정 가능
- [ ] 다른 Supplier product 수정 불가
- [ ] approved public content 조회 가능
- [x] Student가 product 원본을 수정할 수 없음
- [x] 본인 FDA application만 조회 가능

### Buyer

- [x] 본인 Buy Request 생성 가능
- [ ] 다른 Buyer의 private Buy Request 상세 조회 불가
- [x] 본인 referral code 조회 가능
- [ ] 하부 Buyer는 마스킹 요약만 조회 가능

### Agent

- [x] 배정 국가 Buyer 요약만 조회 가능
- [ ] 미배정 국가 Buyer 조회 불가
- [x] 하부 Buyer conversation만 접근 가능
- [ ] 계약금액, 관리자 메모 조회 불가

### Professor

- [x] 담당 Student 요약 조회 가능
- [ ] 담당하지 않는 Student 조회 불가
- [x] 담당 Student Showcase와 시장조사 조회 가능
- [x] 담당 Student conversation만 접근 가능

### Student

- [x] 제품 직접 등록 불가
- [x] approved product만 Showcase item에 추가 가능
- [x] pending/rejected product는 Showcase item에 추가 불가
- [x] product 원본 수정 불가
- [ ] 본인 Showcase만 수정 가능
- [x] Showcase 승인 전 공개 조회 불가
- [x] 본인 Market Research Report 작성 가능
- [x] Market Research Report 승인 전 공개 조회 불가

### Admin

- [x] 전체 운영 테이블 조회 가능
- [x] 승인, 반려, 정지 상태 변경 가능
- [ ] 메시지 열람과 차단 가능
- [x] `admin_logs`와 `audit_events` 조회 가능
- [x] 일반 사용자로는 `admin_logs` 조회 불가

### Analytics and Audit

- [x] Anonymous는 허용된 public analytics event만 insert 가능
- [x] Anonymous는 raw analytics event를 조회할 수 없음
- [ ] Student는 본인 Showcase KPI aggregate만 조회 가능
- [ ] Supplier는 본인 회사와 제품 관련 aggregate만 조회 가능
- [ ] Buyer source raw data는 Admin만 전체 조회 가능
- [x] Company Visibility Score는 공개 가능한 등급 또는 badge만 공개 노출
- [x] Admin log와 audit event 기록 검증

## 다음에 필요한 환경

나머지 체크리스트를 완전히 자동화하려면 추가 fixture 데이터가 필요하다.

- 두 번째 Supplier 로그인 계정과 다른 Supplier product
- 미배정 국가 Buyer와 담당하지 않는 Student
- 개인정보 마스킹 projection 또는 summary view
- message block, file attachment, KPI aggregate, buyer source raw-data fixture

service role key는 앱 런타임 또는 브라우저 코드에 넣지 않는다.

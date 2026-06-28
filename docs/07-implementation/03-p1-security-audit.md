# P1 Security Audit

## 1. Audit Scope

이번 감사는 P0 패치 이후 남은 P1 보안 위험을 확인하고, 명확한 위험에 대해서만 최소 패치를 적용하기 위한 작업이다.

범위:

- `lib/queries/dashboard.ts`의 admin client fallback, email select, 개인정보 전달 범위
- `createSupabaseAdminClient` 사용처
- `messages`, `conversations`, `conversation_members` 관련 action/query
- Supplier-Buyer 직접 메시지 가능성
- Buyer/Student/Professor 개인정보 노출 가능성

범위 제외:

- Account/Role multi-role 전환
- UI 수정
- DB migration 수정
- 신규 기능 추가
- 기존 코드 대규모 삭제 또는 구조 이동

## 2. Files Reviewed

총 15개 코드/스키마 파일과 6개 Source of Truth 문서를 확인했다.

| File | Purpose | Result |
|---|---|---|
| `lib/queries/dashboard.ts` | Dashboard data query | P1 패치 적용 |
| `lib/actions/business.ts` | Business server actions and message send | P1 패치 적용 |
| `lib/supabase/admin.ts` | Server-only admin client | P0 패치 유지 확인 |
| `lib/queries/signup-policy.ts` | Signup/referral policy lookup | 문서화, 수정 없음 |
| `lib/actions/auth.ts` | Signup role/referral tracking | 문서화, 수정 없음 |
| `lib/actions/referrals.ts` | Referral code generation | 문서화, 수정 없음 |
| `lib/actions/admin-members.ts` | Admin member creation/message | 문서화, 수정 없음 |
| `lib/queries/admin-members.ts` | Admin member data | 문서화, 수정 없음 |
| `lib/actions/admin-management.ts` | Admin management writes | 민감 note 사용 확인, 수정 없음 |
| `lib/queries/admin-companies.ts` | Admin company verification | admin review note 확인, 수정 없음 |
| `lib/auth/session.ts` | Current user/session helper | 인증 경계 확인 |
| `supabase/migrations/20260618146000_conversation_message_notification_domain.sql` | Conversation schema | 구조 리스크 문서화, 수정 없음 |
| `supabase/migrations/20260618147000_conversation_message_notification_rls.sql` | Conversation/message RLS | RLS 리스크 문서화, 수정 없음 |
| `supabase/migrations/*_domain.sql` 일부 | 민감 컬럼 후보 확인 | 수정 없음 |
| `types/database.ts` | Generated DB type reference | 수정 없음 |

참조 문서:

- `docs/07-implementation/01-codex-repository-audit.md`
- `docs/07-implementation/02-p0-security-patch-plan.md`
- `docs/07-implementation/00-existing-code-reuse-policy.md`
- `docs/01-architecture/01-platform-engine-module-plugin.md`
- `docs/02-experience/02-workflow-standard.md`
- `docs/02-experience/03-state-machine.md`

## 3. Admin Client Usage

| File | Function | Purpose | Risk Level | Recommendation | Action Taken |
|---|---|---|---|---|---|
| `lib/supabase/admin.ts` | `createSupabaseAdminClient` | Server-only service role client 생성 | Safe | `server-only` 유지, `SUPABASE_SERVICE_ROLE_KEY`만 사용 | P0 상태 유지 확인 |
| `lib/queries/dashboard.ts` | 이전 `getOptionalAdminSupabase` | Professor/Student dashboard에서 profile 읽기 fallback | P1 High | 일반 dashboard query는 server client + RLS만 사용 | admin fallback 제거 |
| `lib/actions/auth.ts` | `completeMemberTypeSelection` | referral signup 관계 기록, professor 연결 조회 | P2 Medium | signup system task로 허용 가능하나 추후 scoped RPC 검토 | 수정 없음 |
| `lib/actions/referrals.ts` | `generateBuyerReferralCode`, `generateReferralCode` | referral code 생성/활성화 | P2 Medium | 사용자 action이지만 코드 소유권 확인 후 admin write 수행. RLS/RPC 대체 검토 | 수정 없음 |
| `lib/queries/signup-policy.ts` | `getReferralInviteByCode` | public signup invite code 검증 | P2 Medium | PII 반환은 없지만 public request에서 service role read 사용. 제한 RPC 권장 | 수정 없음 |
| `lib/actions/admin-members.ts` | `createMemberAction` | Admin 회원 생성 및 role 배정 | Safe | 관리자 기능으로 service role 사용 허용 | 수정 없음 |

## 4. Sensitive Data Exposure Review

| File | Data Field | Exposed To | Risk | Recommendation | Action Taken |
|---|---|---|---|---|---|
| `lib/queries/dashboard.ts` | `profiles.email` in message participants | Dashboard messages participants | P1 High | 메시지 participant DTO에서 email 제거 | email select/DTO 제거 |
| `lib/queries/dashboard.ts` | `profiles.email` as display fallback | Dashboard record titles/names | P2 Medium | display name 없으면 reference id 사용 | `getProfileNameMap` fallback 변경 |
| `lib/queries/dashboard.ts` | `profiles.email` for Professor-Student contacts | Professor 하부 Student, Student의 Professor | Safe | 허용된 직접 관계. 단 RLS 기반으로만 조회 | admin fallback 제거, server client 사용 |
| `lib/queries/dashboard.ts` | `profiles.phone` for account page | Current account owner | Safe | 본인 계정 화면에서만 유지 | 수정 없음 |
| `lib/queries/admin-members.ts` | `profiles.email`, `profiles.phone`, parent buyer email | Admin member console | Safe | Admin 전용 화면. 감사 로그/권한 유지 필요 | 수정 없음 |
| `lib/queries/admin-companies.ts` | `review_note` | Admin company verification | Safe | Admin 검증 메모로 유지 | 수정 없음 |
| `lib/actions/admin-management.ts` | `admin_note` | Admin actions | Safe | Admin action 내부 데이터로 유지 | 수정 없음 |

## 5. Supplier-Buyer Direct Message Review

현재 코드에서 conversation 생성 action은 발견되지 않았다. 일반 사용자가 직접 사용하는 메시지 전송 경로는 `lib/actions/business.ts`의 `sendMessage`이며, 기존 로직은 active conversation membership과 RLS에 의존했다.

확인 사항:

- `sendMessage`는 P0 패치 후 service role fallback 없이 server client + RLS로 insert한다.
- 기존 RLS는 conversation member이면 메시지를 insert할 수 있는 구조다.
- DB schema의 `conversation_type`은 `direct`, `group`, `support`만 있어 Admin Brokerage 여부를 명확히 표현하지 못한다.
- Supplier와 Buyer가 administrator 없이 같은 conversation에 들어간 경우 직접 대화로 볼 수 있다.

적용한 최소 패치:

- `sendMessage` 전송 전 active conversation members의 member type을 확인한다.
- active member에 `supplier`와 `buyer`가 모두 있고 `administrator`가 없으면 `blocked`로 거부한다.
- `agent-buyer`, `professor-student`, `admin 포함 supplier-buyer` 대화는 이번 패치에서 차단하지 않는다.

남은 구조 리스크:

- DB/RLS 레벨에서 Supplier-Buyer 직접 conversation 생성 자체를 막는 정책은 아직 없다.
- Admin Brokerage 전용 `conversation_type` 또는 brokerage case relation이 없다.
- 이번 패치는 server action 경계의 최소 차단이며, 장기적으로 RLS와 schema에 같은 규칙을 반영해야 한다.

## 6. RLS Bypass Risk

| Area | Risk Level | Finding | Action Taken |
|---|---|---|---|
| Dashboard profile reads | P1 High | `getOptionalAdminSupabase`가 RLS 실패를 admin client로 우회할 수 있었다 | 제거 |
| Message insert | P0 Critical fixed previously | P0에서 service role retry가 제거됨 | 유지 확인 |
| Signup invite lookup | P2 Medium | public signup path에서 admin client로 referral code를 읽음 | PII 반환 없음. 추후 scoped RPC 권장 |
| Referral code writes | P2 Medium | user-triggered action에서 admin client로 referral code 생성 | 소유자 검증 후 제한 write. 추후 RPC/RLS 검토 |
| Admin member creation | Safe | Admin 권한 확인 후 auth admin API 사용 | 유지 |
| Conversation RLS | P1 High | member 기반 접근은 있으나 Supplier-Buyer 직접 관계 금지 규칙은 schema/RLS에 없음 | server action 최소 차단 적용, RLS 설계는 남은 위험 |

## 7. Fixes Applied

| File | Fix |
|---|---|
| `lib/queries/dashboard.ts` | `createSupabaseAdminClient` import 제거 |
| `lib/queries/dashboard.ts` | dashboard admin fallback helper 제거 |
| `lib/queries/dashboard.ts` | message participant profile query에서 `email` 제거 |
| `lib/queries/dashboard.ts` | `DashboardMessageParticipant.email` 제거 |
| `lib/queries/dashboard.ts` | display name fallback에서 email 대신 reference id 사용 |
| `lib/actions/business.ts` | Supplier+Buyer conversation에 administrator가 없으면 `sendMessage`를 `blocked`로 거부 |

## 8. Remaining Risks

- Supplier-Buyer direct conversation 생성 방지는 아직 DB/RLS에 없다.
- Admin Brokerage를 표현하는 schema가 아직 없다.
- `lib/queries/signup-policy.ts`는 public signup invite code 검증에 admin client를 사용한다. 반환 데이터는 제한되어 있으나 scoped RPC가 더 안전하다.
- `lib/actions/referrals.ts`는 referral code 생성에 admin client를 사용한다. 소유자 검증은 있으나 장기적으로 RLS/RPC 기반으로 축소하는 것이 좋다.
- Professor-Student 연락처 email은 허용 관계로 유지했다. 다만 Professor 하부 Student 외 데이터가 노출되지 않는지는 RLS 테스트가 필요하다.
- `supabase/migrations/*_rls.sql`는 이번 범위에서 수정하지 않았다.

## 9. Verification Result

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `createSupabaseAdminClient` import 위치 확인 | Client Component import 없음 |
| `email/phone/contact` select 확인 | message participant email 제거, account/admin/authorized referral contact는 유지 |
| `messages/conversations` action/query 확인 | user-facing send path에 Supplier-Buyer direct block 추가 |
| `git diff --check` | Passed |
| DB migration change | None |
| UI change | None |

## 10. Next Recommended Action

다음 단계는 커밋 전 사용자 확인 후, 별도 작업으로 `Communication / Trade Brokerage Security Design Patch`를 진행하는 것이다.

권장 순서:

1. Admin Brokerage conversation model을 문서화한다.
2. Supplier-Buyer conversation 생성 정책을 DB/RLS에 반영할 설계를 작성한다.
3. `signup-policy`와 `referrals`의 admin client 사용을 scoped RPC 또는 좁은 RLS policy로 전환할지 결정한다.
4. Professor-Student, Agent-Buyer, Admin-Supplier-Buyer 대화별 RLS 테스트 케이스를 만든다.
5. Buyer PII masking DTO를 Supplier-facing query에 적용한다.

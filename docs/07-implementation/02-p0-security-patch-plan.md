# P0 Security Patch Plan

## 1. Security Issue Summary

이번 패치는 `docs/07-implementation/01-codex-repository-audit.md`에서 P0로 분류한 service role 관련 위험을 최소 범위로 제거하기 위한 작업이다.

수정 범위는 보안 위험 제거에 한정했다.

- Account/Role multi-role 전환은 하지 않았다.
- UI는 수정하지 않았다.
- DB 구조와 migration은 수정하지 않았다.
- 신규 기능은 추가하지 않았다.

핵심 보안 원칙:

- `NEXT_PUBLIC_` 환경변수는 브라우저 노출 가능성이 있으므로 service role key에 절대 사용하지 않는다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 코드에서만 사용한다.
- 일반 사용자 메시지 전송 실패를 service role client로 재시도하지 않는다.
- RLS 실패는 우회하지 않고 실패로 처리한다.

## 2. Files Reviewed

| File / Scope | Review Result |
|---|---|
| `lib/supabase/admin.ts` | `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` fallback 확인 |
| `lib/actions/business.ts` | `sendMessage`에서 RLS insert 실패 후 service role client로 재시도하는 fallback 확인 |
| `lib/env.ts` | public env helper에는 service role key 사용 없음 |
| `.env.local` | 서버 전용 `SUPABASE_SERVICE_ROLE_KEY`만 확인. 파일은 수정하지 않음 |
| `app/`, `components/`, `lib/` | `createSupabaseAdminClient` import 경계 확인 |
| `docs/07-implementation/01-codex-repository-audit.md` | P0 감사 항목 확인 |

## 3. Files Changed

| File | Change |
|---|---|
| `lib/supabase/admin.ts` | `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` fallback 제거, `server-only` import 추가 |
| `lib/actions/business.ts` | `sendMessage`의 service role retry path 제거, RLS insert 실패 시 감사 기록 후 `send_failed` 반환 |
| `docs/07-implementation/02-p0-security-patch-plan.md` | P0 보안 패치 내용과 검증 결과 문서화 |

## 4. Removed Risk

### Public service role fallback 제거

`lib/supabase/admin.ts`는 이제 `process.env.SUPABASE_SERVICE_ROLE_KEY`만 읽는다.

제거된 위험:

- public prefix 환경변수를 service role fallback으로 사용하는 위험
- 실수로 `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`를 설정했을 때 service role key가 브라우저 노출 규칙에 들어갈 위험

### Admin client server boundary 강화

`lib/supabase/admin.ts`에 `server-only`를 추가했다.

제거된 위험:

- Client Component 또는 browser bundle 쪽에서 admin client 모듈을 import하는 실수
- service role client 생성 코드가 클라이언트 경계로 넘어가는 위험

### Message service role fallback 제거

`sendMessage`는 이제 일반 Supabase server client로 `messages` insert를 시도하고, 실패하면 service role로 재시도하지 않는다.

제거된 위험:

- RLS 실패를 service role insert로 우회하는 위험
- conversation membership 또는 message policy 오류가 숨겨지는 위험
- 일반 사용자 액션이 privileged write path로 전환되는 위험

## 5. Remaining Risk

이번 패치는 P0 service role fallback 제거에 한정했다. 다음 위험은 남아 있으며 별도 설계/패치가 필요하다.

- Supplier-Buyer 직접 메시지 금지 정책은 아직 schema/RLS/action level에서 명시적으로 완성되지 않았다.
- `lib/queries/dashboard.ts`에는 admin client fallback과 넓은 email select가 남아 있다.
- `createSupabaseAdminClient`는 여전히 일부 server action/query에서 사용된다. 현재 클라이언트 import는 감지되지 않았지만, 사용처별 권한 범위 검토가 필요하다.
- `supabase/migrations/*_rls.sql`에는 `auth.role() = 'service_role'` 예외가 존재한다. 이는 DB 운영 정책으로 별도 검토가 필요하다.
- Public sample fallback, Buyer PII 최소화, Account/Role multi-role 전환은 이번 범위에서 제외했다.

## 6. Verification Result

| Check | Result |
|---|---|
| `rg NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY app components lib types supabase` | 코드와 env helper에서 사용 없음 |
| Client Component admin import scan | 감지된 파일 없음 |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| DB migration change | None |
| UI change | None |

감사 보고서에는 기존 발견사항을 기록하기 위해 `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` 문구가 남아 있다. 이는 과거 위험 기록이며 실행 코드가 아니다.

## 7. Next Recommended Action

다음 작업은 P0 범위 안에서 바로 이어지는 `Communication / Trade Brokerage Security Design Patch`가 적절하다.

권장 순서:

1. Supplier-Buyer direct conversation 금지 규칙을 문서화한다.
2. `conversations`와 `conversation_members`의 type/role/owner policy를 점검한다.
3. `sendMessage` authorization을 Admin Brokerage 기준으로 확장한다.
4. RLS 정책이 server action 검증과 같은 결론을 내도록 테스트한다.
5. 그 다음 `lib/queries/dashboard.ts`의 PII 최소화와 admin fallback 제거를 별도 패치로 진행한다.

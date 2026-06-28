# B2BB2G V2 — Existing Code Reuse Policy

> 문서 상태: Draft v1 (작성일 2026-06-28)
> 문서 유형: Implementation Source of Truth
> 구조 기준: Platform → Experience → Engine → Module → Plugin

## 0. 문서 목적과 위치

목적: 기존 구현 코드와 새 아키텍처 문서(Engine/Experience 문서)가 중복되거나 충돌할 때 어떻게 처리할지 기준을 정한다.

- 기존 코드는 **무조건 삭제하지 않는다.** 먼저 1장의 4개 분류(Reuse / Refactor / Replace / Hold) 중 하나로 판정한다.
- 기존 코드와 새 문서가 충돌하면 새 문서가 우선한다(`01-platform-engine-module-plugin.md` 0장 우선순위 선언). 단, 우선한다는 것이 "즉시 삭제"를 의미하지는 않는다 — 본 문서의 절차를 따른다.
- 현재 저장소 상태는 `docs/03-analysis/platform-structure-audit-2026-06-28.md`를 참고 자료로 사용한다 (62개 테이블, 27개 migration, App Router 42개 페이지, `lib/{actions,audit,auth,queries,supabase,validators}` 구조가 이미 존재).

### 0.1 관련 문서

| 문서 | 관계 |
|---|---|
| [01-platform-engine-module-plugin.md](../01-architecture/01-platform-engine-module-plugin.md) | 기존 코드를 어떤 Engine/Module로 재배치할지 판단하는 1차 기준 |
| [02-platform-experience-standard.md](../01-architecture/02-platform-experience-standard.md) | 기존 UI가 공통 UX 규약을 충족하는지 판단하는 기준 |
| [01-user-journey.md](../02-experience/01-user-journey.md) | 기존 화면이 어느 Role Journey에 대응하는지 판단 |
| [02-workflow-standard.md](../02-experience/02-workflow-standard.md) | 기존 절차가 새 Workflow와 일치하는지 판단 |
| [03-state-machine.md](../02-experience/03-state-machine.md) | 기존 status 컬럼/enum이 새 상태값과 일치하는지 판단 |
| [04-sub-page-ui-standard.md](../02-experience/04-sub-page-ui-standard.md) | 기존 페이지 구조가 새 UI 패턴과 일치하는지 판단 |
| `docs/03-analysis/platform-structure-audit-2026-06-28.md` | 현재 코드 상태 스냅샷 (참고 자료, Source of Truth 아님) |

---

## 1. 기본 원칙

기존 코드는 무조건 삭제하지 않는다. 먼저 아래 4개 중 하나로 분류한다.

| 분류 | 의미 |
|---|---|
| **Reuse** | 그대로 사용한다 |
| **Refactor** | 구조/네이밍/분리를 정리한 뒤 사용한다 |
| **Replace** | 새로 작성하여 교체한다 |
| **Hold** | 지금은 판단하지 않고 보류한다 |

분류는 파일 단위가 아니라 **기능 단위**(하나의 Module이 책임지는 범위)로 한다. 한 파일이 여러 기능을 섞고 있다면, 그 자체가 Refactor 또는 Replace의 근거가 된다.

---

## 2. Reuse 기준

아래 조건을 **모두** 만족하면 재사용한다.

- 새 Engine/Module 구조와 일치한다 (어느 Engine/Module에 속하는지 명확히 말할 수 있다).
- 보안 위험이 없다 (9장 보안 즉시 제거 대상에 해당하지 않는다).
- 하드코딩 텍스트가 없다.
- RLS/권한 구조와 충돌이 없다.
- UI Design System 기준(공통 컴포넌트 사용)에 맞는다.
- 테스트 가능하다 (Server Action/Query 경계가 분리되어 있어 단위 검증이 가능하다).

**예시:** `lib/supabase/{server,browser}.ts`처럼 클라이언트를 명확히 분리한 구조는 Identity Engine/전체 Engine이 공통으로 사용하는 기반 코드이며 위 6개 조건을 만족하므로 Reuse 대상이다.

---

## 3. Refactor 기준

아래 조건 중 하나라도 해당하면 리팩터링한다.

- 기능 방향은 맞지만 Engine 경계가 불명확하다 (어느 Module 책임인지 코드만 보고 알 수 없다).
- UI는 쓸 수 있지만 UI Design System Engine의 Component Library를 따르지 않는다.
- 하드코딩 텍스트가 존재한다.
- Server Action/Query 분리가 부족하다 (한 파일에서 조회와 변경을 함께 처리한다).
- 파일 위치가 새 구조(`01-platform-engine-module-plugin.md` 9.2 디렉터리 매핑 가이드)와 맞지 않는다.

**예시:** `docs/03-analysis/platform-structure-audit-2026-06-28.md`에 기록된 `lib/actions`, `lib/queries`의 기존 파일들은 기능 방향 자체는 Engine 문서와 크게 다르지 않을 가능성이 높지만, Engine/Module 단위 네이밍(`lib/actions/<engine-slug>/<module-slug>.ts`)을 따르지 않을 수 있다. 이 경우 전체를 한 번에 이동시키지 않고, 해당 기능을 다음에 수정할 때 점진적으로 새 디렉터리 컨벤션으로 옮긴다(Big-bang 리네이밍 금지).

---

## 4. Replace 기준

아래 조건 중 하나라도 해당하면 교체한다.

- 새 Source of Truth(Engine/Experience 문서)와 충돌한다.
- Buyer 개인정보 노출 가능성이 있다.
- Supplier-Buyer 직접 연결 구조다 (Trade Brokerage Engine의 중개 원칙 위반).
- Role/Permission 구조가 기존 `member_type` 단일 컬럼 구조에 묶여 있다 (Identity Engine의 Account/Role 분리, 다중 Role 원칙과 충돌).
- 보안 위험이 있다.
- service role key 노출 가능성이 있다.
- 유지보수가 어려운 임시 코드다.

**예시:** `docs/03-analysis/platform-structure-audit-2026-06-28.md`의 P0 항목으로 지적된 `mergeWithSamples` 패턴(홈 랜딩, Event/Networking/Notice/Service 목록, 레거시 `/buy-sell/[id]`)은 비승인/샘플 콘텐츠를 실제 콘텐츠처럼 노출할 수 있는 구조다. 이는 `01-platform-engine-module-plugin.md` 2.3 공통 규칙 10번("모든 외부 공개 콘텐츠는 관리자 승인 후 노출한다")과 직접 충돌하므로 Replace 대상이다.

---

## 5. Hold 기준

아래 조건 중 하나라도 해당하면 지금은 판단하지 않고 보류한다.

- Post-MVP 기능이다 (`01-platform-engine-module-plugin.md` 7장 Future Scope 대상).
- 아직 ERD/RLS가 미확정이다.
- UI만 있고 데이터 구조가 없다.
- 데이터 구조는 있지만 UX가 미확정이다 (Journey/Workflow/State Machine 문서에 아직 반영되지 않음).

Hold 대상은 삭제하지 않고 그대로 둔다. 단, 새 기능이 Hold 대상과 같은 영역을 다시 구현해야 하는 경우, 먼저 Hold 해제 여부를 판단한 뒤 진행한다.

---

## 6. Codex 구현 시 규칙

Codex는 기존 파일을 수정하기 전에 반드시 아래를 판단한다.

- [ ] 이 파일은 어떤 Engine에 속하는가?
- [ ] 어떤 Module에 속하는가?
- [ ] 어떤 Plugin과 관련 있는가?
- [ ] Reuse / Refactor / Replace / Hold 중 무엇인가?
- [ ] 기존 코드가 새 문서(Engine/Experience/Journey/Workflow/State Machine/Sub Page UI Standard)와 충돌하는가?
- [ ] 개인정보 보호 정책과 충돌하는가? (Buyer 이메일/전화번호/상세 문의 비공개 원칙)
- [ ] UI Design System Engine과 충돌하는가?

Codex는 삭제보다 이동/리팩터링을 우선한다. 단, 9장의 보안 위험 코드는 즉시 제거한다.

---

## 7. 중복 기능 처리

동일 기능이 여러 위치에 있으면 아래 순서로 통합한다.

1. Source of Truth 문서 기준 확인 (`01-platform-engine-module-plugin.md` → `02-platform-experience-standard.md` → Experience 문서 순서로 충돌 여부 확인)
2. Engine 소유권 결정
3. Module 소유권 결정
4. 공통 Component / Server Action / Query로 통합
5. 기존 중복 파일은 8장의 Deprecated 표시
6. 테스트 후 제거

새 통합 지점이 기존 어느 위치와도 맞지 않으면, 임의로 새 위치를 만들지 않고 `01-platform-engine-module-plugin.md` 9.2 디렉터리 매핑 가이드를 따른다.

---

## 8. Deprecated 처리

바로 삭제하지 않고 아래 주석을 남긴다.

```text
// Deprecated:
// - Reason: <왜 더 이상 사용하지 않는지>
// - Replacement: <대체하는 Engine/Module/파일 경로>
// - Remove After: <제거 예정 시점 또는 조건>
```

Deprecated 표시 후에는:

- 신규 코드에서 Deprecated 대상을 더 이상 참조하지 않는다.
- `Remove After` 조건이 충족되고 테스트가 통과하면 제거한다.
- 제거 시점은 별도 커밋으로 분리한다 (기능 변경 커밋과 삭제 커밋을 섞지 않는다).

---

## 9. 보안 즉시 제거 대상

아래는 Reuse/Refactor/Replace/Hold 분류 절차를 거치지 않고 **즉시 제거**한다.

- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` 또는 그 동등물이 클라이언트에 노출되는 코드
- 클라이언트 컴포넌트/브라우저 번들에서 service role을 사용하는 코드
- Buyer 이메일/전화번호가 Supplier에게 노출되는 코드 경로
- 관리자 권한을 우회할 수 있는 코드
- RLS 없이 민감 데이터를 조회하는 코드
- 승인 전(`approval_status != approved`) 콘텐츠를 공개 노출하는 코드

위 항목을 발견하면 발견 즉시 Admin에게 보고하고, 다른 작업보다 우선하여 제거한다. 제거 후에는 Audit Log에 보안 조치 사실을 기록한다.

---

*본 문서는 코드를 포함하지 않는다. 실제 분류/이동/제거 작업은 Codex가 본 문서의 절차에 따라 구현 단계에서 수행한다.*

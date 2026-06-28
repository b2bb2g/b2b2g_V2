# Communication Brokerage Security Design

## 1. Purpose

본 문서는 B2BB2G V2의 Communication Engine과 Trade Brokerage Engine 사이에서 Supplier-Buyer 직접 메시지 및 직접 conversation 생성을 차단하기 위한 보안 설계를 확정한다.

목표:

- Supplier-Buyer 직접 conversation 생성을 DB/RLS/Workflow 수준에서 차단한다.
- Admin Brokerage Case를 기준으로만 Supplier-Buyer 커뮤니케이션을 허용한다.
- Agent-Buyer, Professor-Student, Admin-All 메시지 허용 관계와 Supplier-Buyer 금지 관계를 명확히 분리한다.
- ERD/RLS 작성 전 필요한 모델, 제약, helper, migration impact를 문서로 고정한다.

본 문서는 설계 문서다. 코딩, DB migration, RLS SQL, UI 수정, ERD 전체 작성은 포함하지 않는다.

## 2. Security Problem

현재 P1 위험은 Supplier와 Buyer가 administrator 없이 같은 conversation에 들어갈 수 있는 구조다.

문제 요약:

- 기존 conversation/member/message 모델이 단순 membership 기반이면 Supplier와 Buyer가 같은 conversation member가 되는 순간 직접 대화가 가능해질 수 있다.
- 애플리케이션 코드에서 일부 차단해도 DB/RLS에서 강제하지 않으면 우회 가능하다.
- `conversations_creator_insert`, `conversation_members_self_insert`, `messages_member_insert` 조합은 role combination 자체를 충분히 검증하지 못할 수 있다.
- Supplier-Buyer 직접 메시지는 플랫폼 정책상 기본 금지다.
- Buyer email, phone, contact person은 플랫폼 핵심 자산이며 Supplier에게 직접 노출되면 안 된다.
- Admin Brokerage 없이 Supplier가 Buyer에게 proposal, 연락처 요청, 직접 메시지를 보내는 구조는 Business Rules와 Permission Matrix에 위배된다.

보안 분류:

| Risk | Priority | Required Design Response |
| --- | --- | --- |
| Supplier-Buyer direct conversation 생성 | P1 High | DB/RLS에서 type + participant 조합 검증 |
| Supplier-Buyer direct message insert | P1 High | `can_send_message` 기준 RLS 설계 |
| Buyer PII 노출 | P1 High | masked view 또는 restricted select |
| App-only authorization | P1 High | Server Action + DB/RLS 이중 차단 |
| Unknown legacy conversation type | P2 Medium | migration 전 audit 및 임의 분류 금지 |

## 3. Final Policy

| Relationship | Final Policy | Required Scope |
| --- | --- | --- |
| Agent ↔ 하부 Buyer | 직접 대화 허용 | Subordinate |
| Professor ↔ 하부 Student | 직접 대화 허용 | Subordinate |
| Admin ↔ All | 직접 대화 허용 | Admin |
| Supplier ↔ Buyer | 직접 대화 기본 금지 | None by default |
| Supplier ↔ Buyer via Admin Brokerage | Admin Brokerage Case 기준으로만 제한 허용 | Brokered |
| Supplier ↔ Buyer after Direct Contact Release | Admin 승인 후 case 단위 예외 | Brokered/Approved |

정책 원칙:

- Supplier-Buyer communication은 `admin_brokerage_required = true`를 기본 전제로 한다.
- `supplier_buyer_direct_contact_enabled = false`가 MVP 기본값이다.
- Direct Contact Release는 global permission이 아니며 특정 case 단위 예외다.
- Premium/Enterprise Supplier라도 Buyer PII 직접 접근은 허용되지 않는다.
- UI 버튼을 숨기는 것은 보조 조치이며 최종 차단은 DB/RLS가 담당해야 한다.

## 4. Conversation Type Model

향후 ERD/RLS에서 `conversation_type`은 필수값이어야 한다. 단순 `direct`, `group`, `support`만으로는 B2BB2G의 Role 관계와 Admin Brokerage 정책을 표현하기 어렵다.

| conversation_type | Allowed Participants | Required Admin Participant | Created By | Message Permission | RLS Requirement |
| --- | --- | --- | --- | --- | --- |
| `agent_buyer` | one Agent + one or more subordinate Buyers | No | Agent, assigned Buyer, Admin | Agent and subordinate Buyer participants | `is_agent_of_buyer` must be true for every Buyer participant |
| `professor_student` | one Professor + one or more subordinate Students | No | Professor, assigned Student, Admin | Professor and subordinate Student participants | `is_professor_of_student` must be true for every Student participant |
| `admin_user` | Admin + one or more users | Yes | Admin | Admin and listed participants | Admin participant or admin ownership required |
| `brokerage_case` | Admin broker + Supplier participant(s) + Buyer participant or masked Buyer proxy | Yes, or admin broker ownership required | Admin/System after brokerage case creation | Participants allowed by case state; PII masked | valid `brokerage_case_id` and `is_brokerage_case_participant` |
| `direct_contact_released` | Supplier + Buyer + optional Admin observer | Recommended, not always required after release | Admin only | Supplier and Buyer allowed only after release | valid `contact_release_approval` not expired |
| `system_notice` | System/Admin sender + targeted users | No direct human reply by default | System/Admin | read-only or restricted reply | system-created and target membership required |

Conversation type rules:

- `conversation_type` must be immutable after creation except by Administrator migration/review workflow.
- Supplier-Buyer pairs must not be allowed in `agent_buyer`, `professor_student`, or generic direct types.
- `brokerage_case` must be linked to a valid brokerage case before any Supplier-Buyer message is allowed.
- `direct_contact_released` must be created only after approved contact release for the same buyer, supplier, and brokerage case.

## 5. Brokerage Case Model

후속 ERD에서 필요한 후보 테이블:

| Candidate Table | Purpose | Notes |
| --- | --- | --- |
| `brokerage_cases` | Buyer Inquiry부터 Supplier Proposal, Buyer Response, Match/Close까지의 중개 case root | Trade Brokerage Engine의 중심 entity |
| `brokerage_case_participants` | case별 Buyer, Supplier, Admin broker, optional observer 관계 | participant role과 visibility scope 필요 |
| `brokerage_case_messages` | case 전용 message를 별도 저장할 때 후보 | conversations/messages 재사용 여부는 Decision Required |
| `contact_release_approvals` | Direct Contact Release 승인 기록 | buyer_id, supplier_id, case_id, admin_id, reason, expires_at 필요 |

상태 모델은 State Machine의 `inquiry_status` 흐름을 따른다.

| Status | Meaning | Communication Permission |
| --- | --- | --- |
| `submitted` | Buyer Inquiry 접수 | Buyer/Admin만 접근 |
| `admin_reviewing` | Admin Broker Queue 검토 중 | Buyer/Admin만 접근 |
| `forwarded_to_supplier` | Admin이 Supplier에게 전달 | Supplier 제한 조회 가능, Buyer PII 마스킹 |
| `supplier_proposal_submitted` | Supplier가 proposal 제출 | Supplier/Admin 접근, Buyer 직접 수신 금지 |
| `proposal_under_admin_review` | Admin이 proposal 검토 | Admin 중심, Supplier 수정 가능 |
| `proposal_delivered_to_buyer` | Admin이 Buyer에게 전달 | Buyer 수신 가능, Supplier 직접 전달 아님 |
| `buyer_responded` | Buyer가 응답 | Admin 중계 후 Supplier에게 필요한 범위 전달 |
| `matched` | 매칭 성사 | terminal or post-match follow-up |
| `closed` | 종료 | terminal |
| `rejected` | 반려/불성립 | terminal |

Brokerage Case 규칙:

- Buyer Inquiry는 conversation 생성이 아니라 brokerage case 생성으로 시작한다.
- Supplier에게 전달되는 Inquiry는 Admin Review 이후에만 가능하다.
- Supplier Proposal은 Buyer에게 직접 전달되지 않고 Admin Review 후 전달된다.
- Brokerage Case의 모든 상태 전환은 Audit Log 대상이다.

## 6. Direct Contact Release Model

Direct Contact Release는 예외 권한이며 전역 권한이 아니다.

규칙:

- `contact_release`는 global permission이 아니다.
- 특정 `buyer_id`, `supplier_id`, `brokerage_case_id` 기준으로만 허용한다.
- 승인자 `admin_id`, `approved_at`, `reason`, `expires_at`가 필요하다.
- release된 경우에도 공개 범위는 제한 가능하다.
- 모든 release는 Audit Log 필수다.
- release가 만료되면 Supplier-Buyer 직접 메시지와 연락처 표시 권한은 자동으로 차단되어야 한다.
- release 후에도 historical message/read access와 new message send permission은 분리해 설계할 수 있다.

후보 필드:

| Field | Required | Purpose |
| --- | --- | --- |
| `id` | Yes | approval id |
| `brokerage_case_id` | Yes | case 단위 예외 연결 |
| `buyer_id` | Yes | 대상 Buyer |
| `supplier_id` | Yes | 대상 Supplier |
| `approved_by_admin_id` | Yes | 승인 Admin |
| `approved_at` | Yes | 승인 시각 |
| `reason` | Yes | 승인 근거 |
| `expires_at` | Decision Required | 만료 시각 |
| `release_scope` | Decision Required | email/phone/contact/person/message 등 공개 범위 |
| `revoked_at` | Optional | 회수 시각 |
| `revoked_by_admin_id` | Optional | 회수 Admin |

## 7. DB Constraint Design Notes

ERD/RLS 단계에서 반영할 제약:

- `conversations.conversation_type`은 필수다.
- `conversations.brokerage_case_id`는 `brokerage_case`와 `direct_contact_released` type에서 필요하다.
- Supplier-Buyer 조합은 brokerage case 또는 direct contact release 없이는 생성 불가해야 한다.
- `conversation_members` 조합 검증이 필요하다.
- Supplier와 Buyer만 있는 conversation은 금지한다.
- `brokerage_case` type은 admin participant 또는 admin broker ownership이 필요하다.
- `direct_contact_released` type은 승인된 `contact_release_approvals` row가 필요하다.
- message insert 시 participant 여부만 보지 말고 conversation type, case state, contact release 상태를 함께 검증해야 한다.
- `created_by_role` 또는 equivalent role snapshot이 필요하다.
- `admin_required`는 brokered conversation에서 true로 관리하는 후보다.

Constraint 후보:

| Constraint Area | Design Requirement |
| --- | --- |
| Conversation create | type-specific creation rule |
| Member insert | type-specific participant composition rule |
| Supplier-Buyer pair | require `brokerage_case_id` or valid release |
| Admin broker | require Admin participant or admin owner on brokered case |
| Message insert | require `can_send_message(user_id, conversation_id)` |
| PII fields | never join full Buyer PII into Supplier-facing conversation payload |

## 8. RLS Design Notes

RLS 단계에서 필요한 helper 함수 후보:

| Helper | Purpose |
| --- | --- |
| `is_admin(user_id)` | Administrator Role 확인 |
| `has_role(user_id, role)` | Role 보유 확인 |
| `is_agent_of_buyer(agent_id, buyer_id)` | Agent-Buyer 하부 관계 확인 |
| `is_professor_of_student(professor_id, student_id)` | Professor-Student 하부 관계 확인 |
| `is_brokerage_case_participant(user_id, case_id)` | Brokerage Case 참여자 확인 |
| `has_contact_release(buyer_id, supplier_id, case_id)` | Direct Contact Release 승인/만료 확인 |
| `can_send_message(user_id, conversation_id)` | message insert 최종 판단 |

RLS 원칙:

- `messages` insert는 `can_send_message` 기준이어야 한다.
- `conversations` read는 participant 기준이어야 한다.
- Supplier-Buyer conversation read/send는 `brokerage_case` 또는 approved release 기준이어야 한다.
- Agent-Buyer conversation read/send는 하부 관계 기준이어야 한다.
- Professor-Student conversation read/send는 하부 관계 기준이어야 한다.
- Admin은 전체 read/manage 가능하되 민감 action은 Audit Log 대상이다.
- Buyer PII는 별도 masked view 또는 restricted select 기준으로 분리한다.
- Service role은 서버 전용 system task에만 사용하고 client import를 금지한다.

`can_send_message`의 설계 방향:

```text
if admin(user): allow
if conversation_type = agent_buyer: allow only agent-buyer subordinate relation
if conversation_type = professor_student: allow only professor-student subordinate relation
if conversation_type = admin_user: allow listed participant, admin participant required
if conversation_type = brokerage_case: allow only valid case participant and case state permits
if conversation_type = direct_contact_released: allow only valid, unexpired release
if conversation_type = system_notice: deny human reply by default
else deny
```

## 9. Application Action Rules

Server Action / Route Handler 규칙:

- `createConversation`은 `conversation_type`을 필수로 받아야 한다.
- `supplier_buyer` direct type 생성은 금지한다.
- Buyer Inquiry는 `createConversation`이 아니라 `createBrokerageCase`로 시작한다.
- `sendMessage`는 DB/RLS의 `can_send_message` 결과를 따라야 한다.
- Server Action은 DB/RLS 실패를 service role fallback으로 우회하지 않는다.
- UI 버튼도 권한 없으면 숨김 처리하지만 최종 차단은 DB/RLS가 담당한다.
- Supplier-facing payload에는 Buyer email, phone, contact person을 포함하지 않는다.
- Admin Brokerage 화면은 case state, participant, message visibility를 명확히 분리해야 한다.

Action mapping:

| Action | Allowed Entry Point | Denied Pattern |
| --- | --- | --- |
| Buyer Inquiry | `createBrokerageCase` | direct Supplier conversation |
| Supplier Proposal | `submitBrokerageProposal` after Admin Forward | direct Buyer message |
| Buyer Response | `respondToBrokerageProposal` | direct Supplier contact without release |
| Direct Contact Release | Admin-only `approveContactRelease` | user self-release |
| Message Send | `sendMessage` + DB/RLS `can_send_message` | service role retry |

## 10. Migration Impact

향후 ERD에서 필요한 변경 후보:

- `conversations.conversation_type`
- `conversations.brokerage_case_id`
- `conversations.created_by_role`
- `conversations.admin_required`
- `brokerage_cases`
- `brokerage_case_participants`
- `contact_release_approvals`
- `message_visibility` 또는 `message_scope`

Migration design notes:

- 이 문서는 migration을 작성하지 않는다.
- migration 전에 기존 conversation/message data audit가 필요하다.
- Supabase migration tracking 정합성 확인 후 구조 변경을 진행해야 한다.
- RLS helper 함수 body review와 security definer 안전성 검토가 필요하다.

## 11. Backward Compatibility

기존 `messages` / `conversations`가 있다면:

- 기존 conversation은 migration 전 audit 필요.
- supplier+buyer only conversation은 `blocked` 또는 `archived` 처리 후보.
- unknown type은 migration 시 임의 분류 금지.
- 반드시 migration review 필요.
- 기존 valid Agent-Buyer, Professor-Student, Admin-User 대화는 새 type으로 명확히 분류해야 한다.
- 기존 support/direct/group type은 participant role 조합과 실제 업무 맥락을 확인하기 전까지 그대로 신뢰하지 않는다.

Legacy classification 후보:

| Legacy Finding | Candidate Treatment |
| --- | --- |
| Agent + subordinate Buyer only | `agent_buyer` 후보 |
| Professor + subordinate Student only | `professor_student` 후보 |
| Admin + user(s) | `admin_user` 후보 |
| Supplier + Buyer + Admin + valid inquiry/proposal | `brokerage_case` 후보 |
| Supplier + Buyer only | block/archive review 후보 |
| Unknown participants | manual review 후보 |

## 12. Decision Required

| Decision ID | Topic | Options | Recommendation |
| --- | --- | --- | --- |
| DR-COMM-001 | `brokerage_case_messages`를 별도 테이블로 둘지, `conversations/messages`를 재사용할지 | separate table / reuse with `brokerage_case_id` | MVP는 reuse 가능하나 RLS 단순성을 비교 후 결정 |
| DR-COMM-002 | `brokerage_case`에 admin participant를 반드시 넣을지, admin owner만 둘지 | required participant / owner only | required participant가 audit/read 모델이 명확함 |
| DR-COMM-003 | Direct Contact Release 만료 기본값 | 7/30/90 days / no default | 기본 만료값 필요 |
| DR-COMM-004 | release 후 Buyer PII 공개 범위 | message only / email / phone / contact person / all | 최소 공개 원칙 적용 |
| DR-COMM-005 | 기존 conversation migration 전략 | automatic / manual review / hybrid | Supplier-Buyer 포함 conversation은 manual review 필수 |

## 13. Codex Implementation Notes

- 이 문서 확정 전 메시지/대화 관련 DB migration은 금지한다.
- ERD 작성 시 이 문서를 Communication / Trade Brokerage 핵심 기준으로 사용한다.
- RLS 작성 시 `can_send_message` helper를 필수 설계한다.
- App action 차단만으로 끝내지 말고 DB/RLS 차단까지 구현해야 한다.
- P0/P1 보안 패치에서 제거한 service role fallback을 message flow에 다시 추가하지 않는다.
- Supplier-Buyer direct contact 허용은 feature flag 전역 ON이 아니라 case-level approval로만 해석한다.
- Buyer PII는 Supplier-facing select, DTO, view, RPC에서 기본 제외한다.
- Role-based RLS smoke test에는 최소한 다음 케이스를 포함한다:
  - Supplier가 Buyer email/phone 조회 시 denied 또는 masked.
  - Supplier-Buyer direct conversation create denied.
  - Supplier-Buyer direct message insert denied.
  - Agent-Buyer subordinate conversation allowed.
  - Professor-Student subordinate conversation allowed.
  - Admin brokered case message allowed.

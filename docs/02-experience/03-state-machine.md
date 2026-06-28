# B2BB2G V2 — State Machine

> 문서 상태: Draft v1 (작성일 2026-06-28)
> 문서 유형: Architecture Source of Truth (Experience Layer)
> 구조 기준: Platform → Experience → Engine → Module → Plugin

## 0. 문서 목적과 위치

본 문서는 `02-workflow-standard.md`의 **Status Flow** 열에 등장하는 모든 상태값을 전환 단위로 정의하는 1차 기준이다.

- Workflow 문서가 "어떤 순서로 진행되는가"를 다룬다면, 본 문서는 "각 상태에서 다음 상태로 전환될 때 누가, 무엇을, 어떻게 바꿀 수 있는가"를 다룬다.
- 본 문서의 모든 상태값(enum)은 후속 ERD 작성 시 각 테이블의 `status` 컬럼 제약조건(CHECK 또는 enum 타입)으로 그대로 옮겨진다.
- 새로운 상태값이 필요하면 Workflow 문서나 코드에서 임의로 추가하지 않고 본 문서를 먼저 갱신한다.

### 0.1 관련 문서

| 문서 | 관계 |
|---|---|
| [01-platform-engine-module-plugin.md](../01-architecture/01-platform-engine-module-plugin.md) | Engine/Module 정의 (각 상태의 소유 Module 표기 기준) |
| [02-platform-experience-standard.md](../01-architecture/02-platform-experience-standard.md) | 5장 Dialog Standard, 11장 Audit Standard (Notification Required/Audit Required 판단 기준) |
| [01-user-journey.md](01-user-journey.md) | 상태 전환이 발생하는 상위 Journey |
| [02-workflow-standard.md](02-workflow-standard.md) | 본 문서의 상태값을 사용하는 절차 |
| [04-sub-page-ui-standard.md](04-sub-page-ui-standard.md) | UI Badge Color가 실제로 적용되는 화면 구조 |
| [00-existing-code-reuse-policy.md](../07-implementation/00-existing-code-reuse-policy.md) | 기존 코드의 상태값과 본 문서가 충돌할 때 처리 기준 |

### 0.2 공통 작성 구조

각 상태 도메인은 아래 7개 항목으로 각 상태값을 정의한다.

| 항목 | 의미 |
|---|---|
| Status | 상태값 이름 (snake_case) |
| Description | 의미 |
| Who Can Change | 이 상태로 전환할 수 있는 주체 |
| Next Allowed Status | 이 상태에서 전환 가능한 다음 상태 (terminal이면 종결 상태로 표기) |
| Notification Required | 전환 시 Notification 발생 필요 여부 (`02-platform-experience-standard.md` 1장 기준) |
| Audit Required | 전환 시 Audit Log 기록 필요 여부 (`02-platform-experience-standard.md` 11장 기준) |
| UI Badge Color | 화면에 표시할 배지 색상 |

### 0.3 UI Badge Color 범례

모든 상태 도메인은 아래 7색 팔레트를 공통으로 사용한다 (UI Design System Engine의 Icon & Badge UI Module 기준).

| Color | 의미 |
|---|---|
| Gray | Draft / Not Started — 아직 시작되지 않음 |
| Blue | In Review / In Progress — 진행 중 |
| Amber | Waiting / Action Needed / Restricted — 대기 또는 제한 |
| Green | Active / Approved — 정상/승인 |
| Red | Rejected / Suspended / Blocked — 거부/정지/차단 |
| Purple | Completed / Matched — 긍정적 종결 |
| Slate | Archived / Closed — 중립적 종결 |

---

## 1. account_status

소유 Module: Identity Engine — Account Module
Status 순서: `pending_verification → active → suspended → deactivated`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| pending_verification | 가입 직후 이메일 인증 대기 | System(자동) | active | Required | 불필요 | Gray |
| active | 인증 완료, 정상 이용 가능 | System(인증 완료 시 자동), Admin(복구 시) | suspended, deactivated | 불필요 | 불필요 | Green |
| suspended | Admin에 의한 일시 정지 | Admin | active, deactivated | Required | Required | Red |
| deactivated | 비활성화/탈퇴 (terminal) | Admin, Account 본인(탈퇴 신청) | – | Required | Required | Slate |

---

## 2. role_status

소유 Module: Approval Engine — Role Approval Module
Status 순서: `requested → under_review → approved | rejected → revoked`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| requested | Role 신청 또는 초대 수락 직후 | Account | under_review | 불필요 | Required | Gray |
| under_review | Admin 검토 중 | Admin | approved, rejected | 불필요 | Required | Blue |
| approved | 승인 완료, Role 부여됨 | Admin | revoked | Required | Required | Green |
| rejected | 반려 (재신청 시 requested로 복귀) | Admin | requested | Required | Required | Red |
| revoked | 승인된 Role 회수 (terminal) | Admin | – | Required | Required | Red |

---

## 3. supplier_status

소유 Module: Supplier Membership Engine — Supplier Plan Module
Status 순서: `pending_approval → active → suspended → closed`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| pending_approval | Supplier Role 승인 대기 | System | active | 불필요 | 불필요 | Gray |
| active | 정상 운영 중 | Admin | suspended, closed | Required(최초 전환 시) | Required | Green |
| suspended | 운영 일시 정지 | Admin | active, closed | Required | Required | Amber |
| closed | 운영 종료 (terminal) | Admin, Supplier 본인(해지 요청) | – | Required | Required | Slate |

---

## 4. buyer_status

소유 Module: Organization Engine — Buyer Network Module
Status 순서: `pending_approval → active → restricted → suspended → closed`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| pending_approval | 가입 승인 대기 (Admin 승인 정책 적용 시에만 발생) | System | active | 불필요 | 불필요 | Gray |
| active | 정상 이용 | System(자동), Admin | restricted, suspended, closed | 불필요 | 불필요 | Green |
| restricted | 어뷰징 의심 등으로 기능 제한 | Admin | active, suspended | Required | Required | Amber |
| suspended | 이용 정지 | Admin | active, closed | Required | Required | Red |
| closed | 이용 종료 (terminal) | Admin | – | Required | Required | Slate |

---

## 5. agent_status

소유 Module: Organization Engine — Agent Network Module
Status 순서: `pending_approval → active → suspended → terminated`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| pending_approval | Agent Role 승인 대기 | System | active | 불필요 | 불필요 | Gray |
| active | 정상 활동 (Buyer 유치 가능) | Admin | suspended, terminated | Required(최초 전환 시) | Required | Green |
| suspended | 활동 일시 정지 (신규 Buyer 유치 제한) | Admin | active, terminated | Required | Required | Amber |
| terminated | Agent 자격 종료 (terminal) | Admin | – | Required | Required | Red |

---

## 6. professor_status

소유 Module: Organization Engine — Professor Network Module
Status 순서: `pending_approval → active → suspended → terminated`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| pending_approval | Professor Role 승인 대기 | System | active | 불필요 | 불필요 | Gray |
| active | 정상 활동 (Student 초대 가능) | Admin | suspended, terminated | Required(최초 전환 시) | Required | Green |
| suspended | 활동 일시 정지 (신규 Student 초대 제한) | Admin | active, terminated | Required | Required | Amber |
| terminated | Professor 자격 종료 (terminal) | Admin | – | Required | Required | Red |

---

## 7. student_status

소유 Module: Organization Engine — Student Network Module
Status 순서: `pending_approval → active → suspended → withdrawn`

> 졸업으로 인한 신분 전환은 본 상태가 아니라 24장 `graduation_status`에서 별도로 관리한다.

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| pending_approval | Student 가입 승인 대기 (예외적 케이스) | System | active | 불필요 | 불필요 | Gray |
| active | 정상 활동 중 | System(자동), Admin | suspended, withdrawn | 불필요 | 불필요 | Green |
| suspended | 활동 일시 정지 | Professor(추천), Admin(확정) | active, withdrawn | Required | Required | Amber |
| withdrawn | 중도 탈퇴/제외 (terminal) | Admin | – | Required | Required | Slate |

---

## 8. company_status

소유 Module: Approval Engine — Company Approval Module
Status 순서: `draft → submitted → approved | rejected → suspended`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| draft | Supplier 작성 중 | Supplier | submitted | 불필요 | 불필요 | Gray |
| submitted | Admin 검토 대기 | Supplier | approved, rejected | 불필요 | Required | Blue |
| approved | 공개됨 (`/companies/[slug]`) | Admin | suspended | Required | Required | Green |
| rejected | 반려 | Admin | draft | Required | Required | Red |
| suspended | 공개 중단 | Admin | approved | Required | Required | Amber |

---

## 9. company_verification_status

소유 Module: Trust Engine — Verification Module

> `company_status`(등록 승인)와 별개 트랙이다. AGENTS.md 정책상 Company Approval과 Company Verification은 혼동하지 않는다.

Status 순서: `not_verified → verification_requested → verified → verification_expired | verification_rejected`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| not_verified | 검증 미신청 (기본값) | System | verification_requested | 불필요 | 불필요 | Gray |
| verification_requested | 검증 신청, Admin 검토 대기 | Supplier | verified, verification_rejected | 불필요 | Required | Blue |
| verified | 검증 완료 (Verified Company Plugin 표시) | Admin | verification_expired | Required | Required | Green |
| verification_expired | 검증 유효기간 만료 | System(자동) | verification_requested | Required | Required | Amber |
| verification_rejected | 검증 반려 | Admin | verification_requested | Required | Required | Red |

---

## 10. product_status

소유 Module: Marketplace Engine (Commercial/Industrial/EPC/Sell Product Module) — 승인은 Approval Engine의 Product Approval Module
Status 순서: `draft → submitted → reviewing → approved → published → hidden | archived` (반려 시 `rejected`)

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| draft | Supplier 작성 중 | Supplier | submitted | 불필요 | 불필요 | Gray |
| submitted | 제출됨, 검토 대기 | Supplier | reviewing | 불필요 | Required | Gray |
| reviewing | Admin 검토 중 | Admin | approved, rejected | 불필요 | Required | Blue |
| approved | 승인됨, 공개 대기 | Admin | published | Required | Required | Green |
| published | 공개됨 | Admin, System(예약 발행) | hidden, archived | Required | Required | Green |
| hidden | 일시 비공개 | Admin, Supplier(자체 비공개 요청) | published, archived | 불필요 | Required | Amber |
| rejected | 반려 | Admin | draft | Required | Required | Red |
| archived | 보관(노출 종료, terminal) | Admin, Supplier | – | 불필요 | Required | Slate |

---

## 11. buy_request_status

소유 Module: Marketplace Engine(Buy Request Module, 콘텐츠) + Buy Request Engine(열람/응답 정책) — 승인은 Approval Engine의 Buy Request Approval Module
Status 순서: `draft → submitted → reviewing → approved → published → fulfilled | closed` (반려 시 `rejected`, 만료 시 `archived`)

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| draft | Buyer 작성 중 | Buyer | submitted | 불필요 | 불필요 | Gray |
| submitted | 제출됨 | Buyer | reviewing | 불필요 | Required | Gray |
| reviewing | Admin Screening Module 검토 중 | Admin | approved, rejected | 불필요 | Required | Blue |
| approved | 승인됨 | Admin | published | Required | Required | Green |
| published | 공개됨, Supplier 응답 가능 | Admin, System | fulfilled, closed | Required | Required | Green |
| fulfilled | 매칭 완료(Inquiry Brokerage 결과 반영) | Admin | archived | Required | Required | Purple |
| closed | Buyer 직접 마감 | Buyer, Admin | archived | 불필요 | Required | Slate |
| rejected | 반려 | Admin | draft | Required | Required | Red |
| archived | 보관(terminal) | Admin, System | – | 불필요 | Required | Slate |

---

## 12. inquiry_status

소유 Module: Trade Brokerage Engine — Inquiry Module / Admin Broker Queue Module
Status 순서: `submitted → admin_reviewing → (need_more_info) → forwarded_to_supplier → supplier_proposal_submitted → proposal_under_admin_review → proposal_delivered_to_buyer → buyer_responded → matched | closed | rejected | spam`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| submitted | Buyer가 Inquiry 제출 | Buyer | admin_reviewing | 불필요 | Required | Gray |
| admin_reviewing | Admin Broker Queue에서 검토 중 | Admin | need_more_info, forwarded_to_supplier, rejected, spam | 불필요 | Required | Blue |
| need_more_info | Buyer에게 추가 정보 요청 | Admin | admin_reviewing | Required(Buyer) | Required | Amber |
| forwarded_to_supplier | Supplier에게 전달됨 | Admin | supplier_proposal_submitted | Required(Supplier) | Required | Blue |
| supplier_proposal_submitted | Supplier가 Proposal 제출 | Supplier | proposal_under_admin_review | 불필요 | Required | Blue |
| proposal_under_admin_review | Admin이 Proposal 검토 중 | Admin | proposal_delivered_to_buyer | 불필요 | Required | Blue |
| proposal_delivered_to_buyer | Buyer에게 Proposal 전달됨 | Admin | buyer_responded | Required(Buyer) | Required | Blue |
| buyer_responded | Buyer가 응답함 | Buyer | matched, closed, rejected | 불필요 | Required | Blue |
| matched | 매칭 성사 (terminal) | Admin | closed | Required(양측) | Required | Purple |
| closed | 종료(정상, terminal) | Admin | – | Required | Required | Slate |
| rejected | 반려/불성립 (terminal) | Admin | – | Required | Required | Red |
| spam | 스팸/어뷰징 판정 (terminal) | Admin | – | 불필요 | Required | Red |

---

## 13. proposal_status

소유 Module: Trade Brokerage Engine — Proposal Module
Status 순서: `draft → submitted → admin_reviewing → (revision_requested) → approved_for_delivery → delivered_to_buyer → accepted | declined | expired`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| draft | Supplier 작성 중 | Supplier | submitted | 불필요 | 불필요 | Gray |
| submitted | 제출됨 | Supplier | admin_reviewing | 불필요 | Required | Gray |
| admin_reviewing | Admin 검토 중 | Admin | revision_requested, approved_for_delivery | 불필요 | Required | Blue |
| revision_requested | Supplier에게 보완 요청 | Admin | submitted | Required(Supplier) | Required | Amber |
| approved_for_delivery | Buyer 전달 승인됨 | Admin | delivered_to_buyer | 불필요 | Required | Green |
| delivered_to_buyer | Buyer에게 전달됨 | Admin | accepted, declined, expired | Required(Buyer) | Required | Blue |
| accepted | Buyer 수락 (terminal) | Buyer | – | Required(Supplier) | Required | Purple |
| declined | Buyer 거절 (terminal) | Buyer | – | Required(Supplier) | Required | Red |
| expired | 응답 기한 만료 (terminal) | System(자동) | – | Required(양측) | Required | Slate |

---

## 14. message_status

소유 Module: Communication Engine — Message Module
Status 순서: `sent → read → deleted` (Admin 개입 시 `blocked`)

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| sent | 전송됨 | System(발신 시 자동) | read, deleted | Required(수신자) | 불필요 | Gray |
| read | 수신자가 읽음 | System(열람 시 자동) | deleted | 불필요 | 불필요 | Green |
| deleted | 삭제(Soft Delete, terminal) | Account(본인) | – | 불필요 | 불필요 | Slate |
| blocked | Admin이 차단 (terminal) | Admin | – | Required | Required | Red |

---

## 15. notification_status

소유 Module: Communication Engine — Notification Module
Status 순서: `unread → read → archived → deleted`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| unread | 미열람 | System(생성 시 자동) | read, deleted | 해당없음 | 불필요 | Blue |
| read | 열람됨 | Account(본인) | archived, deleted | 해당없음 | 불필요 | Gray |
| archived | 보관 | Account(본인) | deleted | 해당없음 | 불필요 | Slate |
| deleted | 삭제(Soft Delete, terminal) | Account(본인) | – | 해당없음 | 불필요 | Slate |

---

## 16. badge_status

소유 Module: Trust Engine — Badge Module / Approval Engine — Badge Approval Module
Status 순서: `requested → under_review → granted → revoked | expired`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| requested | 신청 또는 자동 추천 등록 | Account(신청), System(자동 추천) | under_review | 불필요 | Required | Gray |
| under_review | Admin 검토 중 | Admin | granted | 불필요 | Required | Blue |
| granted | 부여 완료(발급일/근거 기록) | Admin | revoked, expired | Required | Required | Green |
| revoked | 회수됨 (terminal) | Admin | – | Required | Required | Red |
| expired | 기간제 Badge 만료 (재신청 시 requested로 복귀) | System(자동) | requested | Required | Required | Slate |

---

## 17. membership_status

소유 Module: Supplier Membership Engine — Subscription Status Module
Status 순서: `free → premium_active → premium_expired | premium_cancelled`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| free | 무료 플랜 (기본값) | System(기본값) | premium_active | 불필요 | 불필요 | Gray |
| premium_active | 유료 플랜 활성 (결제 또는 Admin Granted Premium Plugin 경유) | Admin | premium_expired, premium_cancelled | Required | Required | Green |
| premium_expired | 유효기간 만료 | System(자동) | free, premium_active(재연장) | Required | Required | Amber |
| premium_cancelled | Admin 또는 Supplier에 의한 해지 | Admin, Supplier(요청) | free | Required | Required | Red |

---

## 18. landing_page_status

소유 Module: Landing Page Builder Engine — Page Template Module / Publish Workflow Module
Status 순서: `draft → scheduled → published → hidden | archived`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| draft | Admin 작성 중 | Admin | scheduled, published | 불필요 | Required | Gray |
| scheduled | 예약 발행 대기 | Admin | published, draft(취소) | 불필요 | Required | Blue |
| published | 공개됨 | Admin, System(예약 자동 발행) | hidden, archived | 불필요 | Required | Green |
| hidden | 일시 비공개 | Admin | published, archived | 불필요 | Required | Amber |
| archived | 보관 (terminal) | Admin | – | 불필요 | Required | Slate |

---

## 19. landing_section_status

소유 Module: Landing Page Builder Engine — Section Visibility Module / Section Scheduling Module
Status 순서: `draft → scheduled → published → hidden | archived`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| draft | Admin 작성 중 | Admin | scheduled, published | 불필요 | Required | Gray |
| scheduled | 예약 발행 대기 (start_at 설정됨) | Admin | published, draft(취소) | 불필요 | Required | Blue |
| published | 공개됨 | Admin, System(예약 자동 발행) | hidden, archived | 불필요 | Required | Green |
| hidden | 일시 비공개 | Admin | published, archived | 불필요 | Required | Amber |
| archived | 보관 (terminal) | Admin | – | 불필요 | Required | Slate |

---

## 20. event_status

소유 Module: Event Engine — Event Module
Status 순서: `draft → published → ongoing → closed | cancelled → archived`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| draft | Admin 작성 중 | Admin | published | 불필요 | 불필요 | Gray |
| published | 참가 신청 가능 | Admin | ongoing, cancelled | Required(공개 알림) | Required | Green |
| ongoing | 행사 진행 중 | Admin, System(일정 도달 시 자동) | closed | 불필요 | 불필요 | Blue |
| closed | 행사 종료 | Admin, System | archived | 불필요 | Required | Slate |
| cancelled | 행사 취소 | Admin | archived | Required(신청자 전체) | Required | Red |
| archived | 보관 (terminal) | Admin | – | 불필요 | 불필요 | Slate |

---

## 21. event_application_status

소유 Module: Event Engine — Event Application Module
Status 순서: `submitted → approved | waitlisted | rejected | cancelled → attended | no_show`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| submitted | 참가 신청 | Member | approved, waitlisted, rejected, cancelled | 불필요 | 불필요 | Gray |
| approved | 참가 승인 | Admin | cancelled, attended, no_show | Required | Required | Green |
| waitlisted | 대기 등록 | Admin | approved, rejected | Required | Required | Amber |
| rejected | 신청 반려 (terminal) | Admin | – | Required | Required | Red |
| cancelled | 신청 철회 (terminal) | Member(본인), Admin | – | 불필요 | Required | Slate |
| attended | 참석 확인 (terminal) | Admin | – | 불필요 | Required | Purple |
| no_show | 불참 확인 (terminal) | Admin | – | 불필요 | Required | Red |

---

## 22. fda_application_status

소유 Module: Thailand FDA Service Engine — Status Tracking Module
Status 순서: `draft → submitted → reviewing → waiting_documents → quoted → in_progress → completed | rejected`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| draft | Supplier 작성 중 | Supplier | submitted | 불필요 | 불필요 | Gray |
| submitted | 제출됨 | Supplier | reviewing | 불필요 | Required | Gray |
| reviewing | Admin 검토 중 | Admin | waiting_documents, quoted, rejected | 불필요 | Required | Blue |
| waiting_documents | 서류 보완 대기 | Admin | reviewing | Required(Supplier) | Required | Amber |
| quoted | 견적 제시됨 | Admin | in_progress, rejected | Required(Supplier) | Required | Blue |
| in_progress | 진행 중 | Admin | completed, rejected | 불필요 | Required | Blue |
| completed | 완료(보고서 발급, terminal) | Admin | – | Required | Required | Purple |
| rejected | 부적격/중단 (terminal) | Admin | – | Required | Required | Red |

---

## 23. student_showcase_status

소유 Module: Student Growth Engine — Student Showcase Module / Approval Engine — Student Showcase Approval Module
Status 순서: `draft → submitted → reviewing → approved → published → hidden | archived` (반려 시 `rejected`)

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| draft | Student 작성 중 | Student | submitted | 불필요 | 불필요 | Gray |
| submitted | 제출됨 | Student | reviewing | 불필요 | Required | Gray |
| reviewing | Admin 검토 중 | Admin | approved, rejected | 불필요 | Required | Blue |
| approved | 승인됨 | Admin | published | Required(Student) | Required | Green |
| published | 공개됨 (`approval_status = approved` 기준 노출) | Admin, System | hidden, archived | Required | Required | Green |
| hidden | 비공개 | Admin, Student | published, archived | 불필요 | Required | Amber |
| rejected | 반려 | Admin | draft | Required | Required | Red |
| archived | 보관 (terminal) | Admin, Student | – | 불필요 | Required | Slate |

---

## 24. graduation_status

소유 Module: Student Growth Engine — Graduation Module / Organization Engine — Graduate Transition Plugin
Status 순서: `enrolled → graduation_pending → alumni | associate`

| Status | Description | Who Can Change | Next Allowed Status | Notification Required | Audit Required | UI Badge Color |
|---|---|---|---|---|---|---|
| enrolled | 재학/활동 중 (기본값) | System(기본값) | graduation_pending | 불필요 | 불필요 | Green |
| graduation_pending | 졸업 처리 진행 중 | Professor(추천), Admin(확정) | alumni, associate | Required(Student) | Required | Blue |
| alumni | 졸업 후 Alumni로 분류 (terminal) | Admin | – | Required | Required | Purple |
| associate | 졸업 후 Global Trade Associate Career Rank로 전환 (terminal) | Admin | – | Required | Required | Purple |

---

*본 문서는 코드를 포함하지 않는다. 위 enum 값은 후속 ERD 작성 단계에서 각 테이블의 `status` 컬럼 제약으로 그대로 반영한다.*

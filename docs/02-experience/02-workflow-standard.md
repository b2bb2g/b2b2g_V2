# B2BB2G V2 — Workflow Standard

> 문서 상태: Draft v1 (작성일 2026-06-28)
> 문서 유형: Architecture Source of Truth (Experience Layer)
> 구조 기준: Platform → Experience → Engine → Module → Plugin

## 0. 문서 목적과 위치

본 문서는 `01-user-journey.md`의 각 Role Journey에 등장하는 Key Action을 **절차(Workflow) 단위**로 구체화한다.

- Journey: "Student는 Showcase를 구성한다" (무엇을 하는가)
- Workflow(본 문서): "Showcase 구성은 어떤 단계와 누구의 승인을 거치는가" (어떻게 진행되는가)
- State Machine(`03-state-machine.md`): "그 과정에서 상태값이 어떻게 바뀌는가" (상태가 무엇인가)

본 문서의 **Status Flow** 열에 등장하는 모든 상태값은 `03-state-machine.md`에 정의된 상태값과 1:1로 일치해야 한다. 새로운 상태값이 필요하면 본 문서에서 임의로 만들지 않고 `03-state-machine.md`를 먼저 갱신한다.

### 0.1 관련 문서

| 문서 | 관계 |
|---|---|
| [01-platform-engine-module-plugin.md](../01-architecture/01-platform-engine-module-plugin.md) | Engine/Module/Plugin 정의 |
| [02-platform-experience-standard.md](../01-architecture/02-platform-experience-standard.md) | Dialog/Notification/Audit 공통 규약 (본 문서의 Notification/Admin Role/Audit Log 열이 따르는 규칙) |
| [01-user-journey.md](01-user-journey.md) | 본 문서가 구체화하는 상위 Journey |
| [03-state-machine.md](03-state-machine.md) | 본 문서의 Status Flow가 참조하는 상태값 정의 |
| [04-sub-page-ui-standard.md](04-sub-page-ui-standard.md) | 본 문서의 각 단계가 실제로 노출되는 화면 구조 |
| [00-existing-code-reuse-policy.md](../07-implementation/00-existing-code-reuse-policy.md) | 기존 코드와 본 문서 충돌 시 처리 기준 |

### 0.2 공통 작성 구조

각 Workflow는 아래 9개 항목을 포함한다.

| 항목 | 의미 |
|---|---|
| Trigger | Workflow를 시작시키는 사건 |
| Actor | 단계를 수행하는 주체 |
| Steps | 순서대로 진행되는 단계 |
| Status Flow | 상태값 전환 흐름 (`03-state-machine.md`와 동일 값 사용) |
| Admin Role | 이 Workflow에서 Admin이 수행하는 역할 |
| Notification | 발생하는 Notification (`02-platform-experience-standard.md` 1장 기준) |
| Audit Log | 기록되는 Audit 대상 |
| Related Engines | 연결된 Engine |
| Related Tables Candidate | 후속 ERD에서 확정할 후보 테이블 (이름/컬럼은 ERD 단계에서 확정) |

---

## 1. Account Signup Workflow

| 항목 | 내용 |
|---|---|
| Trigger | 사용자가 이메일로 가입을 시작한다 |
| Actor | Guest → Account, Identity Engine |
| Steps | 1. 이메일/비밀번호 입력 2. Email Verification Plugin이 인증 메일 발송 3. 인증 링크 클릭 4. 기본 프로필 입력 5. Role 선택 화면으로 이동 |
| Status Flow | `account_status`: pending_verification → active |
| Admin Role | 없음 (이상 가입 발견 시에만 Admin이 suspended로 전환) |
| Notification | Email Verification, 인증 완료 System Notification |
| Audit Log | Account 생성 기록 (actor=self) |
| Related Engines | Identity Engine |
| Related Tables Candidate | `accounts`, `profiles`, `email_verifications` |

---

## 2. Role Application Workflow

> Agent/Professor/Supplier 등 "승인형 Role" 신청의 공통 베이스 Workflow. 각 Role의 세부 버전은 3~4번 참조.

| 항목 | 내용 |
|---|---|
| Trigger | Account가 특정 Role을 신청하거나 초대를 수락한다 |
| Actor | Account(신청자), Admin |
| Steps | 1. Role Request Plugin으로 신청 또는 초대 링크 수락 2. Approval Queue Plugin에 등록 3. Admin 검토 4. 승인 또는 반려(Rejection Reason Plugin 기록) 5. 승인 시 Role Module에 Role 부여 |
| Status Flow | `role_status`: requested → under_review → approved \| rejected (승인 후 필요 시 revoked) |
| Admin Role | Role Approval Module을 통한 검토/승인/반려 |
| Notification | Role Approval Notification |
| Audit Log | 신청/검토/승인/반려/회수 전체 기록 |
| Related Engines | Identity Engine, Invitation Engine, Approval Engine |
| Related Tables Candidate | `role_requests`, `role_approvals`, `profile_roles` |

---

## 3. Agent Application Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Account가 Agent Role을 신청, 또는 Admin이 Admin Manual Invitation Plugin으로 초대한다 |
| Actor | Account(신청자), Admin |
| Steps | 1. Agent 신청서 제출(배정 희망 국가 등) 또는 초대 수락 2. Approval Queue 등록 3. Admin 검토(필요 시 미팅) 4. 승인 시 배정 국가 설정 및 Buyer Invitation Plugin 활성화 5. 반려 시 Resubmission Plugin으로 재신청 안내 |
| Status Flow | `role_status`: requested → under_review → approved \| rejected, 승인과 동시에 `agent_status`: pending_approval → active |
| Admin Role | Role Approval Module 검토/승인, Agent Network Module의 배정 국가 초기 설정 |
| Notification | Role Approval Notification |
| Audit Log | 신청/승인/반려/배정 국가 변경 기록 |
| Related Engines | Identity Engine, Invitation Engine, Organization Engine, Approval Engine |
| Related Tables Candidate | `role_requests`, `agents`, `country_agents` |

---

## 4. Professor Invitation Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Admin이 미팅 후 Professor 후보에게 초대를 발송한다 |
| Actor | Admin(발신), Account(수신) |
| Steps | 1. Admin Manual Invitation Plugin / Professor Invitation Plugin으로 초대 생성 2. 초대 링크/이메일 발송 3. 수신자가 링크로 Account 생성 또는 기존 Account로 수락 4. Admin 최종 승인 5. Professor Dashboard 활성화, Student Invitation Plugin 활성화 |
| Status Flow | `role_status`: requested(초대 생성과 동시 발생) → under_review(수락 시) → approved |
| Admin Role | 초대 발송, 최종 승인, Professor Network Module 초기 설정 |
| Notification | Role Approval Notification |
| Audit Log | 초대 발송/수락/승인 기록 |
| Related Engines | Invitation Engine, Identity Engine, Organization Engine, Approval Engine |
| Related Tables Candidate | `invitations`, `role_requests`, `professors` |

---

## 5. Student Signup Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Student 후보가 Professor의 Referral Link 또는 QR로 접속한다 |
| Actor | Account(가입자), Professor(소속 발급자) |
| Steps | 1. Referral Link/QR 접속 2. 가입 정보 입력(학교/학과 포함) 3. Account 생성 및 Student Role 자동 연결 4. Professor의 Student Network Module에 등록 5. Career Rank Module이 초기값(Global Trade Ambassador) 자동 부여 |
| Status Flow | `student_status`: pending_approval → active (초대 기반 가입으로 즉시 active 처리 가능) |
| Admin Role | 일반적으로 개입 없음. 이상 가입 발견 시 suspended 처리 |
| Notification | 가입 완료 알림(가입자), 신규 Student 알림(소속 Professor) |
| Audit Log | 가입 및 소속 연결 기록 |
| Related Engines | Invitation Engine, Identity Engine, Organization Engine, Student Growth Engine |
| Related Tables Candidate | `invitations`, `students`, `student_network` |

---

## 6. Buyer Signup Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Buyer 후보가 Agent의 Referral Link/QR로 접속, 또는 Buyer Direct Signup Toggle이 ON인 상태에서 직접 가입한다 |
| Actor | Account(가입자), Agent(소속 발급자, Referral 경유 시) |
| Steps | 1. Referral Link/QR 접속 또는 직접 가입 페이지 접속 2. 가입 정보 입력(회사명/국가 등) 3. Account 생성 및 Buyer Role 연결 4. Agent 소속 연결(Referral 경유 시) 또는 무소속 등록(Direct Signup 시) 5. Referral Code/보상 트래킹 시작 |
| Status Flow | `buyer_status`: pending_approval → active (Admin 승인 정책이 켜진 경우만 경유, 기본은 즉시 active) |
| Admin Role | Buyer Direct Signup Toggle 운영, 이상 가입 시 restricted/suspended 처리 |
| Notification | 가입 완료 알림(가입자), 신규 Buyer 알림(소속 Agent, Referral 경유 시) |
| Audit Log | 가입, 소속 연결, Direct Signup 여부 기록 |
| Related Engines | Invitation Engine, Identity Engine, Organization Engine, Admin Control Engine |
| Related Tables Candidate | `invitations`, `buyers`, `buyer_network`, `referral_codes` |

---

## 7. Supplier Approval Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Account가 Supplier Role을 신청한다 |
| Actor | Account(신청자), Admin |
| Steps | 1. Supplier 신청서 제출(회사 기본정보 포함) 2. Approval Queue 등록 3. Admin 검토 4. 승인 시 Company Microsite Workflow로 연결 5. 반려 시 Rejection Reason 기록 후 Resubmission 가능 |
| Status Flow | `role_status`: requested → under_review → approved \| rejected, 승인과 동시에 `supplier_status`: pending_approval → active |
| Admin Role | Supplier Approval Module 검토/승인/반려 |
| Notification | Role/Supplier Approval Notification |
| Audit Log | 신청/승인/반려 기록 |
| Related Engines | Identity Engine, Approval Engine, Supplier Membership Engine |
| Related Tables Candidate | `role_requests`, `suppliers` |

---

## 8. Company Microsite Workflow

| 항목 | 내용 |
|---|---|
| Trigger | 승인된 Supplier가 회사 정보 등록을 시작한다 |
| Actor | Supplier, Admin |
| Steps | 1. Company Profile 입력 2. Hero/About/Certificate/Catalog/Video/Factory/Export Country 섹션 구성 3. Company Approval Module에 제출 4. Admin 검토 5. 승인 시 `/companies/[slug]` 공개. Company Verification은 별도 트랙(필요 시 Trust Engine의 Verification Module에 추가 신청) |
| Status Flow | `company_status`: draft → submitted → approved \| rejected (별도로 `company_verification_status`: not_verified → verification_requested → verified) |
| Admin Role | Company Approval Module 검토, 필요 시 Verification Module 별도 처리 |
| Notification | Company Approval Notification |
| Audit Log | 제출/승인/반려/수정 기록 |
| Related Engines | Company Microsite Engine, Approval Engine, Trust Engine |
| Related Tables Candidate | `companies`, `company_sections`, `company_verifications` |

---

## 9. Product Approval Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Supplier가 제품/산업설비/EPC/SELL 상품을 등록한다 |
| Actor | Supplier, Admin |
| Steps | 1. 제품 정보 입력(제품명/썸네일/설명/카테고리/MOQ/인증서/카탈로그 등) 2. 임시저장 3. 제출 4. Admin 검토 5. 승인 6. 공개 7. 필요 시 비노출 또는 보관 |
| Status Flow | `product_status`: draft → submitted → reviewing → approved → published → hidden \| archived (반려 시 rejected → Resubmission) |
| Admin Role | Product Approval Module 검토, Rejection Reason Plugin 작성 |
| Notification | Product Approval Notification |
| Audit Log | 제출/승인/반려/공개/비노출 전체 기록 |
| Related Engines | Marketplace Engine, Approval Engine, Exposure Engine |
| Related Tables Candidate | `products`, `product_approvals` |

---

## 10. Buy Request Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Buyer가 Buy Request 게시물을 작성한다 |
| Actor | Buyer, Admin, Supplier(열람자) |
| Steps | 1. 작성 2. 제출 3. Admin Screening Module 검토 4. 승인 → 공개 5. 로그인한 Supplier만 상세 열람 6. Supplier 응답은 11번 Inquiry Brokerage Workflow로 연결 7. 마감 시 완료 또는 종료 처리 |
| Status Flow | `buy_request_status`: draft → submitted → reviewing → approved → published → fulfilled \| closed (반려 시 rejected, 만료/철회 시 archived) |
| Admin Role | Admin Screening Module 검토/승인/반려, Admin Masking Plugin으로 작성자 정보 마스킹 |
| Notification | Buy Request Approval Notification |
| Audit Log | 제출/승인/반려/공개/마감 기록 |
| Related Engines | Marketplace Engine, Buy Request Engine, Approval Engine |
| Related Tables Candidate | `buy_requests`, `buy_request_approvals` |

---

## 11. Inquiry Brokerage Workflow

> 플랫폼의 핵심 신뢰 장치. Supplier와 Buyer는 기본적으로 직접 연락하지 않는다. Buyer의 이메일, 전화번호, 담당자명은 기본 비공개이며 아래 모든 단계에서 Admin이 중계한다.

| 항목 | 내용 |
|---|---|
| Trigger | Buyer가 제품/회사에 대해 Inquiry를 제출한다 |
| Actor | Buyer, Admin, Supplier |
| Steps | 1. Buyer Inquiry 제출 2. Admin Broker Queue 등록 3. Admin Review 4. Supplier Forward 5. Supplier Proposal 제출 (12번 Proposal Workflow로 연결) 6. Admin Review (Proposal 검토) 7. Buyer Proposal Delivery 8. Buyer Response 9. Admin Matching 10. Closed / Matched / Rejected |
| Status Flow | `inquiry_status`: submitted → admin_reviewing → (need_more_info ↔ admin_reviewing) → forwarded_to_supplier → supplier_proposal_submitted → proposal_under_admin_review → proposal_delivered_to_buyer → buyer_responded → matched \| closed \| rejected \| spam |
| Admin Role | 모든 단계의 유일한 중계자. Buyer Shield Plugin/Supplier Shield Plugin/Contact Masking Plugin으로 개인정보를 보호하며 진행 |
| Notification | 단계 전환마다 Inquiry Tracking 알림 (Buyer/Supplier에게 본인 관련 단계만 개별 통지) |
| Audit Log | 모든 상태 전환 기록 (Admin Review 단계는 검토자/검토 시각 포함) |
| Related Engines | Trade Brokerage Engine, Marketplace Engine, Buy Request Engine, Communication Engine, Approval Engine |
| Related Tables Candidate | `inquiries`, `inquiry_status_history`, `broker_queue_items` |

---

## 12. Proposal Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Inquiry Brokerage Workflow의 Supplier Forward 단계 완료 후 Supplier가 Proposal을 작성한다 |
| Actor | Supplier, Admin, Buyer(수신자) |
| Steps | 1. Proposal 작성 2. 제출 3. Admin 검토 4. 보완 요청(필요 시 제출 단계로 회귀) 5. 승인 6. Buyer에게 전달 7. Buyer 수락 / 거절 / 무응답 만료 |
| Status Flow | `proposal_status`: draft → submitted → admin_reviewing → (revision_requested ↔ submitted) → approved_for_delivery → delivered_to_buyer → accepted \| declined \| expired |
| Admin Role | Admin Review Plugin으로 검토, Proposal Comparison Plugin 노출 관리 |
| Notification | Proposal Tracking 알림 |
| Audit Log | 작성/제출/검토/전달/수락/거절 기록 |
| Related Engines | Trade Brokerage Engine, Communication Engine, Approval Engine |
| Related Tables Candidate | `proposals`, `proposal_status_history` |

---

## 13. Badge Grant Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Admin의 직접 부여, 또는 활동 기반 자동 추천(Activity Score Plugin/Auto Ranking 등) 후 Admin 확인 |
| Actor | Admin(승인자), 대상 Role(수혜자) |
| Steps | 1. Badge 신청/추천 등록 2. Admin 검토 3. 승인 시 발급(발급일/근거 기록) 4. 정책 위반/자격 상실 시 회수 5. 기간제 Badge는 만료 시 자동 전환 |
| Status Flow | `badge_status`: requested → under_review → granted → revoked \| expired |
| Admin Role | Badge Approval Module 검토, Badge Override Plugin으로 직접 부여/회수 |
| Notification | Badge Notification |
| Audit Log | 신청/검토/부여/회수 전체 기록 (발급 근거 포함) |
| Related Engines | Trust Engine, Approval Engine, Admin Control Engine |
| Related Tables Candidate | `badges`, `badge_grants`, `badge_grant_history` |

---

## 14. Landing Page Publish Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Admin이 Landing Page Builder Engine에서 Section을 생성/수정 후 발행을 진행한다 |
| Actor | Admin |
| Steps | 1. Section 생성/편집 2. 노출 디바이스/순서 설정 3. 필요 시 예약(start_at/end_at 지정) 4. Landing Preview Module로 미리보기 5. Publish Workflow Module로 발행 6. 필요 시 즉시 비노출 7. 더 이상 쓰지 않는 Section은 보관, 문제 발생 시 이전 발행본으로 Rollback |
| Status Flow | `landing_section_status`: draft → scheduled → published → hidden \| archived (Rollback은 이전 published 버전으로 되돌리는 별도 동작) |
| Admin Role | 전 단계 수행 주체 |
| Notification | 발행/롤백 시 Admin 내부 System Notification (일반 사용자 대상 알림 없음) |
| Audit Log | 생성/수정/발행/숨김/보관/롤백 전체 기록 |
| Related Engines | Landing Page Builder Engine, UI Design System Engine, Exposure Engine, Admin Control Engine |
| Related Tables Candidate | `landing_sections`, `landing_publish_history`, `landing_preview_tokens` |

---

## 15. Event Application Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Admin이 등록한 Event에 회원이 참가를 신청한다 |
| Actor | Member(Supplier/Buyer/Student 등), Admin |
| Steps | 1. Admin이 Event 등록 2. 회원 참가 신청 3. Admin 검토(필요 시) 4. 승인 또는 정원 초과 시 대기 5. 행사 종료 후 출석 기록 |
| Status Flow | `event_application_status`: submitted → approved \| waitlisted \| rejected → attended \| no_show (신청 철회 시 cancelled) |
| Admin Role | Admin Event Approval Plugin으로 승인/대기/반려 처리, 출석 기록 |
| Notification | Event Notification |
| Audit Log | 신청/승인/반려/출석 기록 |
| Related Engines | Event Engine, Approval Engine, Student Growth Engine, Communication Engine |
| Related Tables Candidate | `events`, `event_applications`, `event_attendance` |

---

## 16. Thailand FDA Application Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Supplier가 Thailand FDA Service를 신청한다 |
| Actor | Supplier, Admin |
| Steps | 1. 신청서 작성 2. 제출 3. Admin 검토 4. 서류 보완 요청 5. 견적 제시 6. Supplier 승인 후 진행 7. 완료 보고서 발급 또는 부적격 시 반려 |
| Status Flow | `fda_application_status`: draft → submitted → reviewing → waiting_documents → quoted → in_progress → completed \| rejected |
| Admin Role | Document/Quotation/Status Tracking/Completion Report Module 전체 운영 |
| Notification | 단계 전환 Approval Notification |
| Audit Log | 전 단계 기록, 견적/완료 보고서는 필수 기록 |
| Related Engines | Thailand FDA Service Engine, Approval Engine, Supplier Membership Engine |
| Related Tables Candidate | `fda_applications`, `fda_documents`, `fda_quotations` |

---

## 17. Graduation Workflow

| 항목 | 내용 |
|---|---|
| Trigger | Professor 또는 Admin이 Student의 졸업 처리를 시작한다 |
| Actor | Professor, Admin, Student(대상) |
| Steps | 1. 졸업 대상 지정 2. Professor/Admin 확인 3. Graduation Module이 Career Rank 전환 처리 4. Graduate Transition Plugin이 소속 관계를 Alumni 트리로 이동 5. Career Rank가 Global Trade Associate로 갱신되며 alumni 또는 associate 상태로 확정 |
| Status Flow | `graduation_status`: enrolled → graduation_pending → alumni \| associate |
| Admin Role | 최종 확인 및 예외 처리(이상 졸업 케이스) |
| Notification | Career Rank 전환 알림(Student 본인), 졸업 처리 알림(소속 Professor) |
| Audit Log | 졸업 처리 및 Career Rank 전환 기록 |
| Related Engines | Student Growth Engine, Organization Engine, Trust Engine |
| Related Tables Candidate | `students`, `graduation_records`, `career_ranks` |

---

*본 문서는 코드를 포함하지 않는다. Status Flow의 실제 enum/제약은 `03-state-machine.md`에서, 테이블 구조는 후속 ERD 작성 단계에서 확정한다.*

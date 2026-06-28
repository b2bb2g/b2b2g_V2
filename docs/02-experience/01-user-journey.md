# B2BB2G V2 — User Journey

> 문서 상태: Draft v1 (작성일 2026-06-28)
> 문서 유형: Architecture Source of Truth (Experience Layer)
> 구조 기준: Platform → Experience → Engine → Module → Plugin

## 0. 문서 목적과 위치

본 문서는 `Platform → Experience → Engine → Module → Plugin` 구조에서 **Experience 계층**에 속한다.

- Engine/Module/Plugin이 "어떤 기능이 어디에 속하는가"를 정의한다면, 본 문서는 "각 Role이 가입부터 종료까지 무엇을 경험하는가"를 정의한다.
- 본 문서의 각 단계는 반드시 하나 이상의 Engine/Module/Plugin과 연결되어야 한다. 연결되지 않는 단계는 설계 누락으로 간주한다.
- 본 문서는 `02-workflow-standard.md`(절차), `03-state-machine.md`(상태값), `04-sub-page-ui-standard.md`(화면 구조)의 상위 내러티브다. Journey의 각 Key Action은 Workflow 문서의 개별 Workflow로, Workflow의 각 단계는 State Machine 문서의 상태 전환으로 구체화된다.

### 0.1 관련 문서

| 문서 | 관계 |
|---|---|
| [01-platform-engine-module-plugin.md](../01-architecture/01-platform-engine-module-plugin.md) | Engine/Module/Plugin 정의 (본 문서가 참조하는 1차 구조) |
| [02-platform-experience-standard.md](../01-architecture/02-platform-experience-standard.md) | 공통 UX 규약 (Notification/Message/Dialog 등 본 문서 전반에서 사용) |
| [02-workflow-standard.md](02-workflow-standard.md) | 본 문서의 Key Action을 절차 단위로 구체화 |
| [03-state-machine.md](03-state-machine.md) | 본 문서의 승인/상태 전환을 상태값 단위로 구체화 |
| [04-sub-page-ui-standard.md](04-sub-page-ui-standard.md) | 본 문서의 화면(Dashboard/Detail 등)을 페이지 구조로 구체화 |
| [00-existing-code-reuse-policy.md](../07-implementation/00-existing-code-reuse-policy.md) | 기존 코드와 본 문서 충돌 시 처리 기준 |

### 0.2 공통 작성 구조

각 Role Journey는 아래 13개 항목을 반드시 포함한다.

| 항목 | 의미 |
|---|---|
| Role | 대상 사용자 유형 |
| Primary Goal | 이 Role이 플랫폼에서 달성하려는 핵심 목표 |
| Entry Path | 가입/진입 경로 |
| First Dashboard View | 최초 진입 시 보게 되는 화면 상태 |
| Key Actions | 목표 달성을 위한 핵심 행동 흐름 (순서대로) |
| Required Approvals | 이 Journey에서 필요한 승인 단계 |
| Notifications | 수신하는 Notification Type |
| Messages | 메시지 가능 대상과 제한 |
| Data Access | 열람 가능한 데이터 범위 |
| Forbidden Actions | 명시적으로 금지되는 행동 |
| Exit / Completion State | Journey가 종료/완결되는 상태 |
| Related Engines | 연결된 Engine |
| Related Modules | 연결된 Module/Plugin |

---

## 1. Guest Journey

| 항목 | 내용 |
|---|---|
| Role | Guest (비로그인 방문자) |
| Primary Goal | 플랫폼의 신뢰성과 콘텐츠를 확인하고 가입 여부를 결정한다 |
| Entry Path | 직접 URL 접속 → 검색엔진 → Agent/Professor Referral Link 클릭(가입 전 랜딩) → 광고/소셜 |
| First Dashboard View | 없음 (Public 랜딩페이지만 접근, Dashboard 진입 불가) |
| Key Actions | Home/Commercial/Industrial/EPC/Buy & Sell/Event/Notice 등 공개 목록 열람 → Company Microsite 공개 정보 열람 → Buy Request 제목/요약 열람(Anonymous Preview) → 회원가입 또는 로그인 시도 |
| Required Approvals | 없음 |
| Notifications | 없음 (비로그인 상태에서는 Notification Inbox 미제공) |
| Messages | 불가 |
| Data Access | 승인된 공개 콘텐츠의 목록/요약만. 로그인 전용 상세 콘텐츠는 비공개 |
| Forbidden Actions | 상세 페이지 전체 열람(로그인 필요 콘텐츠), Inquiry/Buy Request 등록, 메시지 전송, 모든 쓰기 작업 |
| Exit / Completion State | Account 생성 완료(→ Account Journey로 전환) 또는 이탈 |
| Related Engines | Identity Engine, Marketplace Engine, Buy Request Engine, Company Microsite Engine, Exposure Engine, Landing Page Builder Engine |
| Related Modules | Account Module(가입 진입점), Anonymous Preview Plugin, Public UI Module, Hero Builder Module |

---

## 2. Account Journey

| 항목 | 내용 |
|---|---|
| Role | Account (Role 미배정 상태의 기본 계정) |
| Primary Goal | 이메일 인증을 완료하고, 자신에게 맞는 Role(Supplier/Buyer/Agent/Professor/Student)을 신청하거나 초대를 수락한다 |
| Entry Path | 직접 가입(이메일) → Agent Referral Link → Professor Referral Link/QR → Admin Manual Invitation |
| First Dashboard View | Role 선택/대기 화면. 승인된 Role이 없으면 본 Dashboard에 진입할 수 없다 |
| Key Actions | 이메일 인증 → 기본 프로필 입력 → Role Request Plugin으로 Role 신청 또는 초대 수락 → 승인/배정 대기 |
| Required Approvals | 신청한 Role에 따라 다름: Supplier/Agent/Professor는 Admin 승인 필수, Buyer/Student는 가입 경로(Agent/Professor 초대)에 따라 간소화 가능 |
| Notifications | Email Verification, Role Approval Status |
| Messages | 불가 (Role 배정 전에는 Conversation 생성 권한 없음) |
| Data Access | 본인 프로필만 |
| Forbidden Actions | Role 없이 도메인 기능(제품 등록, Inquiry, Buy Request 등) 사용 |
| Exit / Completion State | 최소 1개 Role이 승인/부여되어 해당 Role Dashboard로 전환 |
| Related Engines | Identity Engine, Invitation Engine, Approval Engine |
| Related Modules | Account Module, Profile Module, Role Module, Role Request Plugin, Role Approval Status Plugin |

---

## 3. Supplier Journey

| 항목 | 내용 |
|---|---|
| Role | Supplier |
| Primary Goal | 한국 제품/회사 정보를 글로벌 Buyer에게 노출하고 Admin 중개를 통해 거래 기회를 확보한다 |
| Entry Path | 직접 가입 → Supplier Role 신청. 또는 Admin Manual Invitation Plugin을 통한 초대 |
| First Dashboard View | 승인 대기 화면(Pending Approval) → 승인 후 Supplier Dashboard (Company Status가 "등록 필요" 상태인 Empty State) |
| Key Actions | 회원가입 → Supplier Role 신청 → (Admin 승인) → 회사 등록(Company Approval) → Company Microsite 구성(Hero/About/Certificate/Catalog/Video/Factory/Export Country) → 제품/산업설비/EPC/SELL 상품 등록 → (Admin 승인) → 공개 → Buyer Inquiry 수신(Admin Broker Queue 경유 통지) → Proposal 작성/제출 → 무료/유료 플랜에 따른 기능 차이 확인 |
| Required Approvals | Supplier Role 승인(Role Approval Module), 회사 등록 승인(Company Approval Module), 제품/게시물 승인(Product Approval Module) |
| Notifications | Role/Company/Product Approval Notification, Inquiry 전달 알림(Supplier Forward 발생 시), Membership Notification(플랜 변경/만료) |
| Messages | Buyer와 직접 대화 불가. Admin Mediated Supplier Buyer Chat Plugin을 통해서만 소통. Admin과는 직접 메시지 가능 |
| Data Access | 본인 회사/제품/Admin이 전달한 Inquiry/제출한 Proposal. Buyer의 이메일/전화번호/상세 문의는 Contact Masking Plugin으로 마스킹된 상태로만 확인 |
| Forbidden Actions | Buyer 개인정보(이메일/전화/담당자명/계약금액/관리자 메모) 직접 조회, Admin 승인 전 Buyer와 직접 연락, 비승인 콘텐츠 공개 노출, 타 Supplier 데이터 접근 |
| Exit / Completion State | Deal Status Module 기준 "matched" 또는 "closed" 도달, 또는 Subscription 만료/계정 비활성화로 활동 종료 |
| Related Engines | Identity, Invitation, Approval, Supplier Membership, Company Microsite, Marketplace, Buy Request, Trade Brokerage, Communication, Trust |
| Related Modules | Supplier Approval Module, Supplier Plan/Subscription Status Module, Company Profile/Certificate/Catalog/Video/Factory Module, Commercial/Industrial/EPC/Sell Product Module, Supplier Response Module, Proposal Module, Verified Supplier Badge Plugin |

---

## 4. Buyer Journey

| 항목 | 내용 |
|---|---|
| Role | Buyer |
| Primary Goal | 신뢰할 수 있는 한국 Supplier의 제품/회사를 찾아 거래 기회를 확보한다 |
| Entry Path | 기본적으로 Agent Referral Link/QR. Admin이 Buyer Direct Signup Toggle을 ON으로 설정한 경우 직접 가입도 가능 |
| First Dashboard View | Buyer Dashboard (Agent Info 카드에 소속 Agent 표시, Buy Request/Saved Products는 Empty State) |
| Key Actions | 가입 → 로그인 → 제품/회사/Buy Request 상세 열람(Logged-in 권한) → Inquiry 작성 또는 Buy Request 등록 → Admin Brokerage 경유 Proposal 수신 → Proposal Comparison Plugin으로 비교 → 필요 시 Meeting Request → (Admin 승인 시) Direct Contact |
| Required Approvals | 가입 자체는 정책에 따라 즉시 또는 Admin 승인. Buy Request 게시물은 Admin Screening Module 승인 필요. Direct Contact는 Direct Contact Approval Plugin을 통한 Admin 승인 필요 |
| Notifications | Buy Request Approval Notification, Message Notification(Agent와의 대화), Inquiry/Proposal 진행 알림 |
| Messages | 소속 Agent와 직접 대화 가능(Agent Buyer Chat Plugin). Supplier와는 직접 대화 불가(Admin Mediated Chat만 가능) |
| Data Access | 본인 Inquiry/Proposal/Buy Request, 로그인 후 열람 가능한 승인된 공개 콘텐츠, 소속 Agent의 요약 정보 |
| Forbidden Actions | Admin 승인 전 Supplier와 직접 연락, 타 Buyer 데이터 열람, 비로그인 상태에서 상세 열람 |
| Exit / Completion State | Deal Status "matched"/"closed" 도달, 또는 Direct Contact 승인 후 플랫폼 외부 거래로 전환 |
| Related Engines | Identity, Invitation, Organization, Marketplace, Buy Request, Trade Brokerage, Communication, Approval, Trust |
| Related Modules | Buyer Network Module, Buy Request Post/Detail Access Module, Inquiry Module, Proposal Module, Buyer Response Module, Meeting Request Module, Buyer Shield Plugin, Contact Masking Plugin |

---

## 5. Agent Journey

| 항목 | 내용 |
|---|---|
| Role | Agent |
| Primary Goal | 해외 Buyer를 유치하고 관리하여 추천 성과를 창출한다 |
| Entry Path | Role Request Plugin으로 직접 신청, 또는 Admin Manual Invitation Plugin으로 초대 |
| First Dashboard View | 신청한 경우 승인 대기 화면 → 승인 후 Agent Dashboard (Buyer Network Empty State, Buyer Signup Link/QR 발급 화면) |
| Key Actions | Agent 신청 또는 초대 수락 → (Admin 승인) → Buyer Invitation Plugin으로 Referral Link/QR 발급 → 하부 Buyer 유치 → 하부 Buyer 활동 모니터링(Agent Analytics Module) → 하부 Buyer와 직접 메시지 |
| Required Approvals | Agent Role 승인 필수. 승인 전에는 Agent 기능 전체가 비활성화된다 |
| Notifications | Role Approval Notification, 하부 Buyer 가입/활동 알림, Message Notification |
| Messages | 하부 Buyer와 직접 대화 가능(Agent Buyer Chat Plugin). Admin과 직접 메시지 가능 |
| Data Access | 하부 Buyer의 제한된 요약 정보(이름/회사명/국가/가입일/승인상태/활동상태/소싱요청수/문의수/매칭수/추천보상여부) |
| Forbidden Actions | 승인 전 Agent 기능 사용, 하부 Buyer의 이메일 전체/전화번호 전체/상세 문의내용/계약금액/관리자 메모 열람, 타 Agent의 하부 Buyer 접근 |
| Exit / Completion State | 특별한 종료 상태 없이 활동 지속, 또는 Admin에 의한 Role 회수(revoked) |
| Related Engines | Identity, Invitation, Organization, Communication, Analytics, Trust |
| Related Modules | Agent Invitation Plugin, Agent Network Module, Agent Buyer Tree Plugin, Agent Buyer Chat Plugin, Agent Analytics Module, Verified Agent Badge Plugin |

---

## 6. Professor Journey

| 항목 | 내용 |
|---|---|
| Role | Professor |
| Primary Goal | 소속 Student의 글로벌 무역 활동을 지도하고 관리한다 |
| Entry Path | 공개 신청 경로 없음(Professor Invitation Toggle 기본 OFF). Admin이 미팅 후 직접 초대(Admin Manual Invitation Plugin / Professor Invitation Plugin) |
| First Dashboard View | 초대 수락 → (필요 시 승인 대기) → Professor Dashboard (Student Network Empty State, Student Signup Link/QR 발급 화면) |
| Key Actions | 초대 수락 → (Admin 승인) → Student Invitation Plugin으로 Referral Link/QR 발급 → 하부 Student 가입 유도 → 하부 Student 개인정보/학교/학과/연락처/활동내역 확인 → Market Research 검토 → 하부 Student와 직접 메시지 |
| Required Approvals | Professor Role 승인 필수 |
| Notifications | Role Approval Notification, 하부 Student 가입/활동/제출물 알림, Message Notification |
| Messages | 하부 Student와 직접 대화 가능(Professor Student Chat Plugin). Admin과 직접 메시지 가능 |
| Data Access | 하부 Student의 전체 정보(이름, 학교, 학과, 연락처, 활동내역, Showcase, Market Research 제출물) |
| Forbidden Actions | 승인 전 Professor 기능 사용, 타 Professor의 하부 Student 접근, Student 대신 제품을 등록하는 등 Student 정책상 금지된 행위의 대리 수행 |
| Exit / Completion State | 활동 지속 또는 Admin에 의한 Role 회수. 소속 Student 졸업 시 해당 Student는 Graduate Transition Plugin으로 분리되며 Professor Journey 자체는 종료되지 않는다 |
| Related Engines | Identity, Invitation, Organization, Communication, Student Growth |
| Related Modules | Professor Invitation Plugin, Professor Network Module, Professor Student Tree Plugin, Professor Student Chat Plugin, Professor Analytics Module, Verified Professor Badge Plugin |

---

## 7. Student Journey

| 항목 | 내용 |
|---|---|
| Role | Student |
| Primary Goal | Global Trade Ambassador로서 무역 실무 경험을 쌓고 Career Rank를 성장시킨다 |
| Entry Path | Professor Referral Link 또는 QR로만 가입 |
| First Dashboard View | Student Dashboard (Global Trade Passport 초기 상태, My Showcase Empty State) |
| Key Actions | 가입 → Product Selection Plugin으로 승인된 Supplier 제품 선택 → Showcase Builder Plugin으로 Student Showcase 구성 → (Showcase 승인) → 공개 → Buyer Acquisition 활동 → Market Research 제출 → Event Support/Translation Support 참여 → Badge/Reward 획득 → 졸업 처리 |
| Required Approvals | Student Showcase Approval Module(Showcase 공개 승인), Badge Approval Module(Badge/Reward 승인) |
| Notifications | Showcase Approval Notification, Badge Notification, Event Notification, Message Notification |
| Messages | 소속 Professor와 직접 대화 가능(Professor Student Chat Plugin). 그 외 Role과는 메시지 권한 없음 |
| Data Access | 본인 Showcase/Passport/Market Research/Badge/활동내역, Showcase 구성을 위한 승인된 Supplier 제품 열람 |
| Forbidden Actions | 제품 직접 등록/수정/삭제, 비승인 Supplier 제품을 Showcase에 포함, Buyer 개인정보 열람, Supplier와 직접 거래 협상 |
| Exit / Completion State | Graduation Module 처리 → Alumni 또는 Global Trade Associate Career Rank로 전환 |
| Related Engines | Identity, Invitation, Organization, Student Growth, Trust, Event, Communication |
| Related Modules | Student Invitation Plugin, Student Network Module, Student Showcase Module, Market Research Module, Buyer Acquisition Module, Career Rank Module, Graduation Module, Graduate Transition Plugin |

---

## 8. Administrator Journey

| 항목 | 내용 |
|---|---|
| Role | Administrator |
| Primary Goal | 플랫폼 전체의 신뢰, 품질, 보안을 통제하며 모든 중개/승인 프로세스를 운영한다 |
| Entry Path | 시스템 발급 계정 (Public Signup 경로 없음) |
| First Dashboard View | Admin Dashboard (Approval Queue/Broker Queue 등 실시간 대기 항목이 최상단에 노출) |
| Key Actions | 전체 회원/역할/초대 관리 → 회사/제품/Buy Request 승인 → Inquiry Brokerage(Admin Review/Supplier Forward/Buyer Response 중계) → Badge 부여/회수 → Exposure/Landing Builder 운영 → Event/FDA 운영 → 알림/공지 발송 → 게시판/배너/팝업 관리 → Audit Log 조회 |
| Required Approvals | 없음 (최상위 운영 권한). 단 모든 조작은 Audit Log로 기록되어 사후 검증 대상이 된다 |
| Notifications | 신규 승인 대기 항목, Broker Queue 신규 Inquiry, 보안/운영 알림 |
| Messages | 전체 Role과 직접 메시지 가능, 전체 메시지 열람 및 차단 권한 |
| Data Access | 전체 데이터. 단, 개인정보(Buyer 이메일/전화번호 등) 열람은 운영 목적에 한정하며 모두 Audit Log에 기록된다 |
| Forbidden Actions | 명시적 금지 행동은 없으나, 모든 행동은 Audit Trail Plugin으로 추적되어야 하며 추적 불가능한 변경 경로를 만들지 않는다 |
| Exit / Completion State | 없음 (상시 운영 Role) |
| Related Engines | 전체 Engine, 특히 Approval Engine, Admin Control Engine, Trust Engine, Trade Brokerage Engine |
| Related Modules | Member/Role/Invitation/Company/Product Management Module, Inquiry Brokerage Module, Badge Management Module, Exposure/Landing Page Management Module, Audit Log Module |

---

*본 문서는 코드를 포함하지 않는다. 각 Journey의 Key Action은 `02-workflow-standard.md`에서 절차로, 승인/상태는 `03-state-machine.md`에서 상태 전환으로 구체화된다.*

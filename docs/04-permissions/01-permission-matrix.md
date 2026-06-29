# Permission Matrix

## 1. Permission Purpose

본 문서는 B2BB2G V2의 Role 기반 권한 기준을 확정한다. Business Rules와 Feature Flags를 기준으로 작성하며, ERD/RLS 작성 전에 권한 판단을 먼저 고정하기 위한 문서다.

본 문서의 역할:

- Role별 Engine 접근 권한 정의
- 데이터별 접근 범위 정의
- 개인정보 접근 정책 고정
- Communication 허용/차단 정책 고정
- ERD/RLS 단계에서 사용할 Scope 언어 제공

본 문서는 코드를 작성하지 않으며 ERD/RLS도 작성하지 않는다.

## 2. Permission Principles

| Principle ID | Principle |
| --- | --- |
| PM-P-001 | Account는 권한 주체가 아니라 로그인 기반이다. |
| PM-P-002 | 권한은 Role 기준이다. |
| PM-P-003 | 하나의 Account는 여러 Role을 가질 수 있다. |
| PM-P-004 | Role 전환 시 현재 활성 Role의 Permission만 UI/action/query 기본 기준으로 사용한다. |
| PM-P-005 | Supplier-Buyer 직접 연락은 기본 금지한다. |
| PM-P-006 | Buyer PII는 Supplier에게 직접 노출하지 않는다. |
| PM-P-007 | Buyer-Supplier Inquiry/Proposal은 Admin Brokerage를 거쳐야 한다. |
| PM-P-008 | Professor는 하부 Student 개인정보 전체를 확인할 수 있다. |
| PM-P-009 | Agent는 하부 Buyer만 관리할 수 있다. |
| PM-P-010 | Student는 제품을 직접 등록할 수 없다. |
| PM-P-011 | 모든 승인, 반려, 삭제, 공개, 권한변경은 Audit Log 대상이다. |
| PM-P-012 | Public은 승인된 공개 콘텐츠만 볼 수 있다. |
| PM-P-013 | System 권한은 서버 전용 자동화와 감사 가능한 system task에 한정한다. |

## 3. Role List

| Role | Definition | Permission Basis |
| --- | --- | --- |
| Guest | 로그인하지 않은 방문자 | Public scope |
| Account | 로그인한 기본 계정, Role 선택/신청 전 또는 Role 공통 기반 | Authenticated/Owner scope |
| Supplier Free | 승인된 무료 Supplier Role | Owner + limited Supplier scope |
| Supplier Premium | 승인된 Premium Supplier Role | Owner + expanded Supplier scope |
| Supplier Enterprise | 관리자 개별 계약 Supplier Role | Owner + contracted Supplier scope |
| Buyer | 구매/소싱 주체 | Owner + brokered Buyer scope |
| Agent | 하부 Buyer를 유치/관리하는 Role | Subordinate Buyer scope |
| Professor | 하부 Student를 초대/관리하는 Role | Subordinate Student scope |
| Student | Professor 하위에서 활동하는 학생 Role | Owner + assigned showcase/activity scope |
| Administrator | 플랫폼 운영 관리자 | Admin scope |
| System | 서버 전용 자동화, 예약 작업, 승인된 background task | System scope |

## 4. Scope Definition

| Scope | Definition | RLS Translation Direction |
| --- | --- | --- |
| Public | 비로그인 또는 전체 공개 대상 | approved/published/active public records only |
| Authenticated | 로그인된 모든 Account | `auth.uid()` exists and account active |
| Owner | 본인이 생성/소유한 데이터 | `owner_account_id = auth.uid()` 또는 role-specific owner relation |
| Related | 명시적 관계가 있는 데이터 | company member, conversation member, invitation relation 등 |
| Subordinate | Agent의 하부 Buyer, Professor의 하부 Student | organization relation table 기반 |
| Assigned | Admin/Agent/Professor/담당자에게 배정된 데이터 | assignment relation 기반 |
| Brokered | Admin Brokerage case 안에서 제한 공유되는 데이터 | inquiry/proposal/brokerage case relation 기반 |
| Admin | Administrator Role이 운영 목적으로 접근하는 데이터 | admin role check + audit required |
| System | 서버 전용 자동 작업이 처리하는 데이터 | service role/server-only task + audit where needed |

## 5. Action Definition

| Action | Definition | Audit Required |
| --- | --- | --- |
| `view_list` | 목록 조회 | 상황별 |
| `view_detail` | 상세 조회 | 민감 데이터이면 Required |
| `create` | 신규 생성 | 상황별 |
| `update` | 기존 데이터 수정 | Required for business records |
| `delete` | 물리 삭제 | Required, 일반 Role은 기본 금지 |
| `soft_delete` | 비활성/삭제 표시 | Required |
| `approve` | 승인 | Required |
| `reject` | 반려 | Required |
| `publish` | 공개 전환 | Required |
| `hide` | 비공개 전환 | Required |
| `archive` | 보관/종결 | Required |
| `assign` | 담당자/관계 배정 | Required |
| `invite` | 초대 링크/QR/초대장 생성 | Required when role/network changes |
| `message` | 메시지 송수신 | Required for brokered or admin-mediated context |
| `upload_file` | 파일 업로드 | 상황별, 민감 파일이면 Required |
| `download_file` | 파일 다운로드 | 민감 파일이면 Required |
| `export` | 데이터 내보내기 | Required |
| `grant_badge` | Badge 부여 | Required |
| `revoke_badge` | Badge 회수 | Required |
| `release_contact` | 연락처 공개 승인 | Required |
| `manage_setting` | 설정 변경 | Required |

## 6. Role x Engine Permission Matrix

### 6.1 Identity Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | `create` account, email verification start | Public | role 기능 사용 |
| Account | `view_detail`, `update` own profile, role request | Owner | 다른 Account profile 조회 |
| Supplier Free/Premium/Enterprise | own account/profile 관리, role switch | Owner | Buyer PII 조회 |
| Buyer | own account/profile 관리, role switch | Owner | Supplier 직접 연락처 요청 자동 승인 |
| Agent | own account/profile 관리, Agent role status 확인 | Owner | 다른 Agent role/profile 조회 |
| Professor | own account/profile 관리, Professor role status 확인 | Owner | 다른 Professor role/profile 조회 |
| Student | own account/profile 관리 | Owner | 제품 등록 권한 |
| Administrator | account/role 상태 관리, suspend/deactivate | Admin | 감사 없는 권한 변경 |
| System | email verification, session task | System | public client 노출 |

### 6.2 Invitation Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | referral/invite link 진입 | Public | invite 생성 |
| Account | 받은 초대 수락, role request 시작 | Owner | 타인 invite 사용 |
| Supplier Free/Premium/Enterprise | 기본적으로 직접 invite 생성 없음 | Owner | Buyer 직접 초대 후 bypass |
| Buyer | referral relation 수락 | Owner | Supplier 직접 초대 |
| Agent | Buyer Referral Link/QR `invite` | Subordinate | 승인 전 invite 생성 |
| Professor | Student Referral Link/QR `invite` | Subordinate | 승인 전 invite 생성 |
| Student | Professor link로 가입 | Assigned | 독립 Student signup 우회 |
| Administrator | Agent/Professor/Role manual invitation 관리 | Admin | 감사 없는 초대 발급 |
| System | invite expiry, tracking | System | 임의 role grant |

### 6.3 Organization Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | 없음 | Public | organization data 조회 |
| Account | 본인 소속 관계 요약 조회 | Owner | 타 조직 관계 조회 |
| Supplier Free/Premium/Enterprise | 본인 company member 관계 조회 | Related | Buyer network 조회 |
| Buyer | 본인 Agent 관계 조회 | Owner/Related | 다른 Buyer 관계 조회 |
| Agent | 하부 Buyer 목록/요약 `view_list`, 제한 `view_detail` | Subordinate | 하부 Buyer email/phone 전체, 타 Agent Buyer |
| Professor | 하부 Student 목록/상세/개인정보 `view_detail` | Subordinate | 타 Professor Student |
| Student | 본인 Professor 관계 조회 | Owner/Assigned | 다른 Student 개인정보 |
| Administrator | 전체 조직 관계 관리, `assign` | Admin | 감사 없는 배정 변경 |
| System | referral relation creation | System | 사용자 PII 무제한 반환 |

### 6.4 Company Microsite Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | 승인/공개 회사 `view_list`, `view_detail` | Public | draft/submitted company 조회 |
| Account | 승인/공개 회사 조회 | Authenticated/Public | 비승인 회사 조회 |
| Supplier Free | own company `create`, `update`, submit | Owner | 직접 `publish`, 타 회사 수정 |
| Supplier Premium | Free 권한 + 확장 섹션/미디어 | Owner | 직접 `publish`, Buyer PII 표시 |
| Supplier Enterprise | Premium 권한 + 계약 기반 확장 | Owner/Assigned | 직접 `publish` |
| Buyer | 공개 회사 상세 조회, Inquiry 시작 | Public/Authenticated | Supplier 연락처 자동 공개 요구 |
| Agent | 공개 회사 조회 | Public/Authenticated | 회사 운영 수정 |
| Professor | 공개 회사 조회 | Public/Authenticated | 회사 운영 수정 |
| Student | 승인된 회사/제품을 Showcase용 참조 | Public/Authenticated | 회사 정보 수정 |
| Administrator | approve/reject/publish/hide/archive | Admin | 감사 없는 공개 전환 |
| System | scheduled publish/hide if approved | System | 비승인 회사 공개 |

### 6.5 Marketplace Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | 승인/공개 products/posts 목록/요약 조회 | Public | 비승인 상세 조회 |
| Account | 승인/공개 상세 조회 | Authenticated/Public | write |
| Supplier Free | own product `create/update/upload_file`, submit, 제한 수량 | Owner | 직접 `publish`, Buyer PII 조회 |
| Supplier Premium | Free 권한 + 자료/PDF/video link, 확장 수량 | Owner | 직접 `publish` |
| Supplier Enterprise | Premium 권한 + 계약 기반 확장 | Owner/Assigned | 직접 `publish` |
| Buyer | 공개 product/company 조회, Inquiry 생성 | Authenticated/Public | product 등록 |
| Agent | 공개 product 조회 | Authenticated/Public | product 등록 |
| Professor | 공개 product 조회 | Authenticated/Public | product 등록 |
| Student | 승인된 Supplier product 선택 | Authenticated/Public | product 직접 등록/수정/삭제 |
| Administrator | product approve/reject/publish/hide/archive | Admin | 감사 없는 삭제/공개 |
| System | scheduled exposure/indexing | System | 승인 전 public exposure |

### 6.6 Buy Request Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | 승인/공개 Buy Request 목록/요약 | Public | 상세/작성자 PII 조회 |
| Account | 로그인 상세 범위 조회 | Authenticated | PII 조회 |
| Supplier Free | 로그인된 제한 상세 조회, 응답은 Brokerage로 연결 | Authenticated/Brokered | Buyer contact 직접 조회 |
| Supplier Premium | 상세/응답 가능 범위 확대, Brokerage 연결 | Authenticated/Brokered | Buyer contact 직접 조회 |
| Supplier Enterprise | 계약 기반 우선 응답 가능, Brokerage 연결 | Brokered | Buyer contact 직접 조회 |
| Buyer | own Buy Request `create/update`, submit | Owner | 직접 Supplier proposal 수신 우회 |
| Agent | 하부 Buyer의 제한 요약/성과 조회 | Subordinate | 상세 문의 내용/PII 전체 |
| Professor | 기본 권한 없음 | None | Buyer request 운영 |
| Student | 기본 권한 없음 | None | Buy Request 작성 대리 |
| Administrator | approve/reject/publish/hide/archive, masking | Admin | 감사 없는 공개 전환 |
| System | expiry/archive automation | System | 비승인 공개 |

### 6.7 Trade Brokerage Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | 없음 | None | inquiry/proposal 접근 |
| Account | 없음, Role 필요 | None | broker case 접근 |
| Supplier Free | Admin Forward 이후 제한 inquiry view, proposal 가능 여부는 Decision Required | Brokered | Buyer email/phone/contact 직접 조회 |
| Supplier Premium | Admin Forward 이후 proposal `create`, 수정/제출 | Brokered | Admin Review 전 Buyer 직접 전달 |
| Supplier Enterprise | brokered case 우선 처리/전담 매칭 가능 | Brokered/Assigned | Admin Brokerage 우회 |
| Buyer | own inquiry `create`, proposal 수신/응답 | Owner/Brokered | Supplier 직접 contact release 자체 승인 |
| Agent | 하부 Buyer의 제한 진행 요약 조회 가능 | Subordinate | Buyer-Supplier 상세 협상/PII |
| Professor | 기본 권한 없음 | None | Brokerage case 접근 |
| Student | Buyer acquisition 활동은 가능하나 Brokerage case 접근 없음 | Assigned | Supplier/Buyer 협상 참여 |
| Administrator | broker queue, forward, review, deliver, close, release_contact | Admin | 감사 없는 contact release |
| System | notification/status automation | System | contact release 자동 승인 |

### 6.8 Communication Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | 없음 | None | message 접근 |
| Account | account/system notification 조회 | Owner | 임의 conversation 생성 |
| Supplier Free/Premium/Enterprise | Admin 또는 brokered conversation message | Brokered/Related | Buyer와 직접 conversation 생성 |
| Buyer | Agent 또는 Admin/brokered Supplier conversation message | Related/Brokered | Supplier 직접 conversation 생성 |
| Agent | 하부 Buyer와 direct message | Subordinate | 타 Agent Buyer message |
| Professor | 하부 Student와 direct message | Subordinate | 타 Professor Student message |
| Student | 담당 Professor와 direct message | Assigned | Supplier/Buyer 직접 message |
| Administrator | All message/conversation 관리/차단 | Admin | 감사 없는 열람/차단 |
| System | notification 발송 | System | 사용자 메시지 위장 |

### 6.9 Approval Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | 없음 | None | approval queue 접근 |
| Account | own role request 제출/상태 조회 | Owner | approve/reject |
| Supplier Free/Premium/Enterprise | own company/product 제출/상태 조회 | Owner | self approve/publish |
| Buyer | own Buy Request 제출/상태 조회 | Owner | self approve/publish |
| Agent | own Agent role status 조회 | Owner | self approve |
| Professor | own Professor role status 조회 | Owner | self approve |
| Student | own Showcase/Badge status 조회 | Owner | self approve |
| Administrator | approve/reject/resubmission/admin memo/history | Admin | 감사 없는 승인/반려 |
| System | status sync/notification | System | policy decision 단독 수행 |

### 6.10 Trust Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | public badges/verification display 조회 | Public | badge 근거 중 민감 정보 |
| Account | own badges 조회 | Owner | grant/revoke |
| Supplier Free/Premium/Enterprise | own membership/verification/badge 조회 | Owner/Public | self grant |
| Buyer | own verification/badge 조회 | Owner | self grant |
| Agent | own badge 조회, 하부 Buyer badge 요약 | Owner/Subordinate | 타 Agent network badge detail |
| Professor | own badge, 하부 Student badge/activity 조회 | Owner/Subordinate | 타 Professor Student |
| Student | own passport/badge/reward 조회 | Owner | self grant/reward 지급 |
| Administrator | grant_badge/revoke_badge/verification/company score 관리 | Admin | 감사 없는 부여/회수 |
| System | expiry/recommendation candidate 생성 | System | 최종 badge grant 자동 확정, unless explicitly approved later |

### 6.11 Supplier Membership Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | public membership badge 표시 조회 | Public | plan detail 관리 |
| Account | Supplier role 신청 후 plan 상태 대기 | Owner | plan 변경 |
| Supplier Free | own plan/limit 조회 | Owner | limit 우회 |
| Supplier Premium | own subscription/benefit 조회 | Owner | plan self-upgrade without policy |
| Supplier Enterprise | 계약 기반 plan/benefit 조회 | Owner/Assigned | 계약 외 권한 요구 |
| Buyer/Agent/Professor/Student | public membership badge 조회 | Public | plan 관리 |
| Administrator | supplier plan override, admin granted premium | Admin | 감사 없는 plan 변경 |
| System | membership expiry notification | System | 결제 없는 자동 upgrade |

### 6.12 Student Growth Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | 승인/공개 Student Showcase 조회, flag ON일 때만 | Public | Student PII 조회 |
| Account | 없음, Student Role 필요 | None | showcase 생성 |
| Supplier Free/Premium/Enterprise | 공개 Showcase 조회 | Public | Student 개인정보/활동 내부 데이터 |
| Buyer | 공개 Showcase 조회 | Public | Student 개인정보 |
| Agent | 공개 Showcase 조회 | Public | Student 개인정보 |
| Professor | 하부 Student profile/activity/showcase/research 전체 조회/지도 | Subordinate | 타 Professor Student |
| Student | own showcase/research/passport `create/update`, submit | Owner | product 직접 등록 |
| Administrator | showcase approval, activity/reward 관리 | Admin | 감사 없는 reward/approval |
| System | career rank/passport aggregation | System | reward 자동 지급 확정 |

### 6.13 Event Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | 공개 event 목록/상세 조회 | Public | 비공개 event/application 조회 |
| Account | event application create if eligible | Owner | 타인 application 조회 |
| Supplier/Buyer/Student | event application create/update own | Owner | approve |
| Agent | own application, 하부 Buyer 참가 요약 가능 | Owner/Subordinate | 타 Agent data |
| Professor | own application, 하부 Student 참가/활동 조회 가능 | Owner/Subordinate | 타 Professor Student |
| Administrator | event create/update/approve/application manage | Admin | 감사 없는 승인/정원 변경 |
| System | reminder/status notification | System | user 대신 신청 |

### 6.14 Thailand FDA Service Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | service public info 조회 | Public | application 조회 |
| Account | 없음, Supplier Role 필요 | None | application create |
| Supplier Free/Premium/Enterprise | own FDA application create/update/upload_file/view | Owner | 타 Supplier application |
| Buyer/Agent/Professor/Student | public service info 조회 | Public | FDA application 접근 |
| Administrator | review, quote, status change, document manage, complete/reject | Admin | 감사 없는 상태 변경 |
| System | notification/status reminder | System | 민감 문서 public 노출 |

### 6.15 Exposure Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | approved featured content view | Public | 비승인 featured 후보 조회 |
| Account | approved featured content view | Authenticated/Public | featured 선정 |
| Supplier Free | own exposure status 조회, limited eligibility | Owner | self featured |
| Supplier Premium | featured eligibility 가능 | Owner | self featured/publish |
| Supplier Enterprise | priority exposure 가능 | Assigned | 비승인 콘텐츠 노출 |
| Buyer/Agent/Professor/Student | featured content 조회 | Public | exposure 관리 |
| Administrator | manual pick, ranking, publish/hide featured | Admin | 승인/검증 없는 노출 |
| System | ranking candidate generation | System | Admin policy 없이 public exposure 확정 |

### 6.16 UI Design System Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest/Account/Business Roles | UI component consume | Public/Authenticated | design token 관리 |
| Administrator | UI settings/theme/component setting 관리 | Admin | 감사 없는 운영 설정 변경 |
| System | render/runtime config consume | System | 사용자 권한 상승 |

### 6.17 Landing Page Builder Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | published landing page view | Public | draft/preview section 조회 |
| Account/Business Roles | published landing page view | Authenticated/Public | builder 관리 |
| Administrator | section create/update/order/publish/hide/archive, popup/banner manage | Admin | 비승인 콘텐츠 section publish |
| System | scheduled publish/hide if approved | System | Admin approval 없이 publish |

### 6.18 Analytics Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest | 없음 또는 public aggregate only | Public | raw analytics |
| Account | own simple activity summary | Owner | cross-role raw data |
| Supplier Free | own minimal analytics if enabled | Owner | Buyer PII 포함 analytics |
| Supplier Premium | own product/company aggregate analytics | Owner | Buyer email/phone/contact export |
| Supplier Enterprise | contracted performance report | Owner/Assigned | raw unrelated data |
| Buyer | own inquiry/proposal activity | Owner | supplier analytics |
| Agent | 하부 Buyer aggregate activity | Subordinate | 하부 Buyer PII/detail inquiry |
| Professor | 하부 Student activity analytics | Subordinate | 타 Professor Student |
| Student | own activity/passport metrics | Owner | platform analytics |
| Administrator | platform analytics, export with audit | Admin | 감사 없는 export |
| System | aggregation jobs | System | raw PII broadcast |

### 6.19 Admin Control Engine

| Role | Allowed Actions | Scope | Explicit Deny |
| --- | --- | --- | --- |
| Guest/Account/Business Roles | 없음 | None | admin console 접근 |
| Administrator | member/role/invitation/company/product/brokerage/badge/exposure/settings/audit 관리 | Admin | 감사 없는 destructive action |
| System | server-only scheduled/system task | System | public/client execution |

## 7. Role x Data Access Matrix

| Data | Guest | Account | Supplier | Buyer | Agent | Professor | Student | Administrator | System |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `profiles` | No PII | Owner | Owner only | Owner only | Owner + subordinate Buyer limited summary | Owner + subordinate Student full | Owner | Full | Task-limited |
| `roles` | No | Own status | Own Supplier role | Own Buyer role | Own Agent role | Own Professor role | Own Student role | Full manage | Task-limited |
| `companies` | Approved public | Approved public | Own draft/submitted/approved | Approved public | Approved public | Approved public | Approved public for showcase selection | Full manage | Scheduled task |
| `products` | Approved public | Approved public | Own draft/submitted/approved | Approved public | Approved public | Approved public | Approved product selection only | Full manage | Index/schedule |
| `buy_requests` | Approved summary | Approved allowed detail | Approved detail without Buyer PII | Own full | Subordinate Buyer limited summary | No | No | Full manage | Expiry/archive |
| `inquiries` | No | No | Brokered limited view | Own full minus internal admin memo | Subordinate Buyer progress summary | No | No | Full manage | Notification/status |
| `proposals` | No | No | Own brokered proposal | Own received proposal | Subordinate Buyer progress summary | No | No | Full manage | Notification/status |
| `conversations` | No | Own related only | Admin/brokered only | Agent/Admin/brokered only | Subordinate Buyer direct | Subordinate Student direct | Assigned Professor direct | Full manage | Notification/system |
| `messages` | No | Own related only | Admin/brokered only | Agent/Admin/brokered only | Subordinate Buyer direct | Subordinate Student direct | Assigned Professor direct | Full manage | Notification/system |
| `notifications` | No | Own | Own | Own | Own + subordinate alerts summary | Own + subordinate Student alerts | Own | Full/system broadcast | Create/deliver |
| `student_showcases` | Approved public if enabled | Approved public | Approved public | Approved public | Approved public | Subordinate full | Own full | Full manage | Aggregation |
| `market_research_reports` | No | No | No | No | No | Subordinate full | Own full | Full manage | Aggregation |
| `events` | Published public | Published/apply | Published/apply own | Published/apply own | Own + subordinate summary | Own + subordinate Student | Own/apply | Full manage | Reminder |
| `fda_applications` | No | No | Own | No | No | No | No | Full manage | Reminder/status |
| `badges` | Public issued badges | Own | Own/public | Own/public | Own + subordinate summary | Own + subordinate Student | Own | Full grant/revoke | Expiry/recommendation |
| `company_scores` | Public score if published | Public score | Own score/detail allowed by plan | Public score | Public score | Public score | Public score | Full manage | Aggregation |
| `landing_pages` | Published | Published | Published | Published | Published | Published | Published | Full manage | Scheduled publish |
| `landing_sections` | Published | Published | Published | Published | Published | Published | Published | Full manage | Scheduled publish |
| `audit_logs` | No | No | No | No | No | No | No | Full | Create only |

## 8. Personal Data Access Matrix

| Data Field | Public | Supplier Free/Premium/Enterprise | Buyer | Agent | Professor | Student | Administrator | System |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Buyer email | No | No, even Premium/Enterprise | Own | Subordinate limited/masked only | No | No | Full | Task-limited |
| Buyer phone | No | No, even Premium/Enterprise | Own | Subordinate limited/masked only | No | No | Full | Task-limited |
| Buyer contact person | No | No direct access | Own | Subordinate limited summary | No | No | Full | Task-limited |
| Supplier email | Public only if approved policy says so | Own | Public/company-safe or brokered masked | Public/company-safe | Public/company-safe | Public/company-safe | Full | Task-limited |
| Supplier phone | Public only if approved policy says so | Own | Public/company-safe or brokered masked | Public/company-safe | Public/company-safe | Public/company-safe | Full | Task-limited |
| Student email | No | No | No | No | Subordinate full | Own | Full | Task-limited |
| Student phone | No | No | No | No | Subordinate full | Own | Full | Task-limited |
| Professor email | Public only if approved policy says so | No | No | No | Own | Assigned Professor contact if needed | Full | Task-limited |
| Agent email | Public only if approved policy says so | No | Assigned Agent contact if needed | Own | No | No | Full | Task-limited |
| Admin memo | No | No | No | No | No | No | Full | Create/read for system task only |
| Audit log | No | No | No | No | No | No | Full | Create only |

Personal data policy:

- Supplier는 Buyer email/phone/contact를 직접 확인할 수 없다.
- Agent는 하부 Buyer 정보만 제한 확인한다.
- Professor는 하부 Student 개인정보 전체를 확인할 수 있다.
- Admin은 운영 목적에 한해 전체 확인 가능하며 Audit Log 대상이다.
- Public은 개인정보를 확인할 수 없다.

## 9. Communication Permission Matrix

| Relationship | Default | Scope | Required Condition | Notes |
| --- | --- | --- | --- | --- |
| Agent ↔ 하부 Buyer | Allowed | Subordinate | Agent-Buyer organization relation | 직접 메시지 허용 |
| Professor ↔ 하부 Student | Allowed | Subordinate | Professor-Student organization relation | 직접 메시지 허용 |
| Admin ↔ All | Allowed | Admin | Administrator role | 열람/차단/중재 가능, audit 대상 |
| Supplier ↔ Buyer | Denied | None by default | Admin Brokerage or approved Direct Contact Release | 직접 conversation 생성 금지 |
| Supplier ↔ Buyer via Admin Brokerage | Allowed limited | Brokered | inquiry/proposal case exists and Admin has forwarded/delivered | PII masking 유지 |
| Supplier ↔ Buyer after Direct Contact Release | Allowed exception | Brokered/Approved | `release_contact` Admin approval | 조건은 Decision Required |
| Student ↔ Supplier | Denied | None | No direct trade negotiation | Student는 제품 등록/거래 협상 금지 |
| Student ↔ Buyer | Denied by default | None | Future policy required | Buyer acquisition 활동과 직접 메시지는 별도 |

## 10. Admin Override Matrix

| Override Area | Admin Action | Scope | Audit Required | Notes |
| --- | --- | --- | --- | --- |
| Role approval | approve/reject/revoke role | Admin | Required | `role_status` 기준 |
| Supplier membership | plan override, admin granted premium | Admin | Required | Membership Badge와 구분 |
| Badge grant/revoke | grant_badge/revoke_badge | Admin | Required | Trust Engine 소유 |
| Content approval | approve/reject/publish/hide/archive | Admin | Required | Company/Product/Buy Request/Showcase/Event 등 |
| Featured exposure | manual pick/order/hide | Admin | Required | 승인/검증 콘텐츠만 가능 |
| Direct contact release | release_contact | Admin | Required | Supplier-Buyer 예외 허용 |
| Landing publish | publish/hide/archive section/page | Admin | Required | Builder 기준 |
| Event approval | approve/reject/waitlist | Admin | Required | Event/Application |
| FDA status | review/quote/in_progress/complete/reject | Admin | Required | 문서 접근 제한 |
| User suspension | suspend/restrict/deactivate | Admin | Required | Account/Role/Member status |

## 11. Feature Flag Permission Impact

| Feature Flag | Permission Impact | Default |
| --- | --- | --- |
| `supplier_public_signup_enabled` | ON이면 Supplier Public Self Signup을 허용하되 Supplier Role Application과 Admin Approval은 필수다. Buyer PII 접근은 여전히 금지다. | `true` |
| `supplier_invitation_enabled` | ON이면 Admin이 Supplier Invitation Link를 발급할 수 있다. Invitation은 공개/활성화/Buyer PII 권한을 부여하지 않는다. | `true` |
| `supplier_requires_admin_approval` | ON이면 Supplier Role 활성화와 plan 적용 전 Admin Approval을 강제한다. MVP에서 OFF로 해석하지 않는다. | `true` |
| `buyer_direct_signup_enabled` | OFF이면 Buyer는 Agent Referral Link/QR 기반 가입만 허용한다. ON이어도 Buyer 데이터 접근은 Owner/Agent/Admin 관계로 제한한다. | `false` |
| `supplier_buyer_direct_contact_enabled` | ON이어도 전역 허용이 아니라 Admin-approved case 단위 Direct Contact Release만 허용한다. | `false` |
| `admin_brokerage_required` | ON이면 Buyer-Supplier inquiry/proposal/message가 Admin Brokerage를 반드시 통과한다. MVP에서 OFF 권한은 일반 Admin UI에 두지 않는다. | `true` |
| `premium_supplier_enabled` | Premium Supplier의 제품 수/Featured/Proposal/Analytics 권한을 활성화한다. Buyer PII 직접 노출은 여전히 금지다. | `true` |
| `landing_builder_enabled` | Admin만 Landing Page Builder 관리 권한을 가진다. Published public content만 Guest에게 노출한다. | `true` |
| `student_showcase_public_enabled` | 승인된 Student Showcase만 public 노출 가능하다. Student PII는 노출하지 않는다. | `true` |
| `event_enabled` | Event/Event Application 권한을 활성화한다. Admin approval과 participant scope가 필요하다. | `true` |
| `fda_service_enabled` | Supplier own FDA application과 Admin review 권한을 활성화한다. 민감 문서 public 노출은 금지다. | `true` |

## 12. RLS Translation Notes

본 장은 ERD/RLS를 작성하지 않고, 다음 단계에서 바로 번역할 수 있는 권한 언어만 제공한다.

| Permission Scope | RLS Translation Note |
| --- | --- |
| Owner | `created_by`, `account_id`, `profile_id`, `supplier_id`, `buyer_id`, `student_id` 등 owner relation으로 제한한다. |
| Related | company member, conversation member, invitation relation처럼 명시적 join relation을 요구한다. |
| Subordinate | Agent-Buyer, Professor-Student 관계 테이블을 기준으로 제한한다. |
| Assigned | Admin/manual assignment relation 또는 case assignment relation을 기준으로 제한한다. |
| Brokered | inquiry/proposal/brokerage case relation과 status를 기준으로 제한한다. |
| Admin | Administrator role check를 사용하고 민감 action은 Audit Log를 요구한다. |
| System | server-only task/service role 경로로 제한하고 client import를 금지한다. |

Required RLS design constraints:

- Supplier-Buyer direct messaging은 DB/RLS 레벨에서 차단해야 한다.
- Agent-Buyer direct messaging은 하부 관계에서만 허용한다.
- Professor-Student direct messaging은 하부 관계에서만 허용한다.
- Buyer PII는 Supplier-facing query/view/RPC에서 제거하거나 masking/limited view로 제공해야 한다.
- `profiles.email`, `profiles.phone`, contact person은 Role별 limited projection이 필요하다.
- `audit_logs`, `admin_memo`는 Admin/System만 접근해야 한다.
- Admin Brokerage conversation model은 `direct/group/support` 같은 일반 conversation type만으로는 부족하므로 별도 case relation 또는 brokered scope가 필요하다.
- Supabase Health Audit의 P1 위험인 Supplier-Buyer direct conversation prevention과 Buyer PII regression test를 RLS 설계에 반영해야 한다.

## 13. Decision Required

| Decision ID | Topic | Current Permission Direction | Blocks |
| --- | --- | --- | --- |
| DR-PM-001 | Free Supplier 제품 등록 수 | 제한은 확정, 숫자는 미정 | Supplier Membership permission, ERD/RLS limit check |
| DR-PM-002 | Free Supplier Proposal 가능 여부 | 제한 가능, 최종 허용 여부 미정 | Trade Brokerage permission |
| DR-PM-003 | Premium Supplier analytics 범위 | 일부 aggregate 허용, 구체 metric 미정 | Analytics query/view |
| DR-PM-004 | Direct Contact Release 조건 | Admin approval 필요, 조건 미정 | Communication/RLS/brokerage case |
| DR-PM-005 | Buyer Direct Signup 기본 정책 변경 가능성 | MVP default OFF, 운영 중 변경 가능성 있음 | Invitation/Admin Setting |
| DR-PM-006 | Badge 자동 부여 조건 | 자동 추천 가능, 최종 부여는 Admin 기준 | Trust Engine automation |
| DR-PM-007 | Student Reward 공개 범위 | 본인/Professor/Admin 중심, public 범위 미정 | Student Growth/Trust/Exposure |

## 14. Codex Implementation Notes

- Permission Matrix 확정 전 ERD/RLS 구현은 금지한다.
- 모든 action/query/server action은 Permission Matrix 기준으로 작성한다.
- 기존 코드와 충돌하면 새 Permission Matrix를 우선한다.
- 민감정보 select는 반드시 matrix 확인 후 작성한다.
- Supplier-facing DTO에는 Buyer email, phone, contact person을 포함하지 않는다.
- Student-facing DTO에는 Supplier/Buyer negotiation data를 포함하지 않는다.
- Agent dashboard는 하부 Buyer 제한 요약만 반환한다.
- Professor dashboard는 하부 Student 전체 정보 접근을 허용하되 타 Professor Student 접근은 차단한다.
- Admin action은 approve/reject/publish/hide/archive/assign/release_contact/manage_setting 모두 Audit Log를 남긴다.
- System task는 server-only boundary에서만 실행하며 public/client code에서 service role 경로를 import하지 않는다.

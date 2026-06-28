# B2BB2G V2 — Business Rules

## 1. Business Rule Purpose

본 문서는 B2BB2G V2의 Business Rules를 정의한다. 이 문서는 Permission Matrix, ERD, RLS, Admin Setting, Feature Flag 구현의 상위 기준이다.

적용 범위:

- Role별 비즈니스 권한과 제한
- Admin Brokerage 기반 Buyer-Supplier 거래 흐름
- Supplier Membership과 Trust/Badge/Verification 기준
- Landing/Exposure/Notification/Board 운영 기준
- 개인정보 보호와 공개 콘텐츠 승인 기준

작성 원칙:

- 모든 규칙은 `Role`, `Engine`, `Workflow`, `State Machine`과 연결한다.
- Architecture / Experience 문서는 Frozen에 가깝게 유지하고, 본 문서는 그 위에 비즈니스 판단 기준을 추가한다.
- ERD, RLS, Permission Matrix는 아직 작성하지 않는다.
- 불명확한 정책 값은 임의 확정하지 않고 `Decision Required`로 분리한다.

## 2. Global Business Principles

| Rule ID | Rule | Related Roles | Related Engine | Related Workflow / State |
| --- | --- | --- | --- | --- |
| BR-GLOBAL-001 | Account와 Role은 분리한다. | Account, all roles | Identity Engine | Account Signup Workflow, Role Application Workflow, `account_status`, `role_status` |
| BR-GLOBAL-002 | 하나의 Account는 여러 Role을 가질 수 있다. | Account, Supplier, Buyer, Agent, Professor, Student, Administrator | Identity Engine | Role Switch Module, `role_status` |
| BR-GLOBAL-003 | Supplier-Buyer 직접 연락은 기본 금지한다. | Supplier, Buyer, Administrator | Trade Brokerage Engine, Communication Engine | Inquiry Brokerage Workflow, Proposal Workflow, `inquiry_status`, `proposal_status` |
| BR-GLOBAL-004 | Buyer email, phone, 담당자명은 플랫폼 핵심 자산으로 보호한다. | Buyer, Supplier, Administrator, Agent | Trade Brokerage Engine, Organization Engine | Buyer Shield Plugin, Contact Masking Plugin |
| BR-GLOBAL-005 | 모든 Buyer-Supplier 문의는 Admin Brokerage를 거친다. | Buyer, Supplier, Administrator | Trade Brokerage Engine | Inquiry Brokerage Workflow |
| BR-GLOBAL-006 | 모든 공개 콘텐츠는 관리자 승인 후 노출한다. | Supplier, Buyer, Student, Administrator | Approval Engine, Exposure Engine | Product Approval Workflow, Buy Request Workflow, Student Showcase Workflow |
| BR-GLOBAL-007 | Student는 제품을 직접 등록하지 않는다. | Student, Professor, Supplier, Administrator | Student Growth Engine, Marketplace Engine | Student Showcase flow, `student_showcase_status` |
| BR-GLOBAL-008 | Professor는 하부 Student 개인정보를 100% 확인할 수 있다. | Professor, Student, Administrator | Organization Engine | Professor Invitation Workflow, Student Signup Workflow |
| BR-GLOBAL-009 | Agent는 하부 Buyer를 관리한다. | Agent, Buyer, Administrator | Organization Engine | Agent Application Workflow, Buyer Signup Workflow |
| BR-GLOBAL-010 | Badge, Verification, Membership은 Trust Engine에서 통합 관리한다. | All roles | Trust Engine, Supplier Membership Engine | Badge Grant Workflow, `badge_status`, `membership_status` |
| BR-GLOBAL-011 | Landing Page는 Builder 방식으로 관리자가 통제한다. | Administrator, Guest, all public users | Landing Page Builder Engine, Exposure Engine | Landing Page Publish Workflow, `landing_page_status`, `landing_section_status` |

## 3. Supplier Business Rules

### 3.1 Free Supplier

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-SUP-FREE-001 | 무료 Supplier는 가입할 수 있다. | Identity Engine | Account Signup Workflow | Supplier Role 신청은 별도다. |
| BR-SUP-FREE-002 | Supplier Role 신청이 필요하다. | Identity Engine, Approval Engine | Role Application Workflow, Supplier Approval Workflow, `role_status` | Admin 승인 전 Supplier 기능은 제한한다. |
| BR-SUP-FREE-003 | 관리자 승인이 필요하다. | Approval Engine | Supplier Approval Workflow, `supplier_status` | 승인 전 공개 노출 없음. |
| BR-SUP-FREE-004 | 회사 프로필 등록이 가능하다. | Company Microsite Engine | Company Microsite Workflow, `company_status` | 공개는 Admin 승인 후 가능하다. |
| BR-SUP-FREE-005 | 제품 등록은 가능하되 개수 제한이 필요하다. | Supplier Membership Engine, Marketplace Engine | Product Approval Workflow | 구체 개수는 Decision Required. |
| BR-SUP-FREE-006 | 공개 노출은 관리자 승인 후 가능하다. | Approval Engine, Exposure Engine | Product Approval Workflow, `product_status` | `published` 이전 public 노출 금지. |
| BR-SUP-FREE-007 | Buyer 개인정보는 직접 확인할 수 없다. | Trade Brokerage Engine | Inquiry Brokerage Workflow | email, phone, contact name 마스킹. |
| BR-SUP-FREE-008 | Buyer Inquiry는 Admin Brokerage를 통해서만 확인한다. | Trade Brokerage Engine | Inquiry Brokerage Workflow, `inquiry_status` | Admin Forward 이후 필요한 범위만 노출. |
| BR-SUP-FREE-009 | 메인 Featured 노출은 제한한다. | Supplier Membership Engine, Exposure Engine | Landing Page Publish Workflow | Featured eligibility는 Membership Rules와 연결. |
| BR-SUP-FREE-010 | Proposal 제출 권한은 제한 가능하다. | Supplier Membership Engine, Trade Brokerage Engine | Proposal Workflow | 등급별 제출 가능 여부는 Decision Required. |

### 3.2 Premium Supplier

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-SUP-PREMIUM-001 | 회사 미니 홈페이지 기능을 강화한다. | Company Microsite Engine, Supplier Membership Engine | Company Microsite Workflow | 섹션/미디어 확장 가능. |
| BR-SUP-PREMIUM-002 | 제품 등록 수를 확대하거나 무제한으로 할 수 있다. | Supplier Membership Engine, Marketplace Engine | Product Approval Workflow | 구체 한도는 Decision Required. |
| BR-SUP-PREMIUM-003 | 제품 자료, PDF, 동영상 링크 등록이 가능하다. | Marketplace Engine | Product Document Plugin, Product Video Link Plugin | 파일/링크 정책은 추후 Storage/Validation 규칙과 연결. |
| BR-SUP-PREMIUM-004 | Premium Badge를 받을 수 있다. | Trust Engine, Supplier Membership Engine | Badge Grant Workflow, `badge_status`, `membership_status` | Membership Badge와 Verification Badge는 분리한다. |
| BR-SUP-PREMIUM-005 | Featured Supplier/Product 노출이 가능하다. | Exposure Engine, Landing Page Builder Engine | Landing Page Publish Workflow | 승인/검증 상태와 노출 정책을 모두 만족해야 한다. |
| BR-SUP-PREMIUM-006 | Proposal 제출이 가능하다. | Trade Brokerage Engine | Proposal Workflow | Admin Brokerage 이후 제출. |
| BR-SUP-PREMIUM-007 | Analytics 일부를 확인할 수 있다. | Analytics Engine | Dashboard analytics | Buyer PII는 포함하지 않는다. |
| BR-SUP-PREMIUM-008 | Premium이어도 Buyer email/phone은 직접 확인할 수 없다. | Trade Brokerage Engine | Inquiry Brokerage Workflow | Direct Contact Release 승인 전까지 금지. |

### 3.3 Enterprise Supplier

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-SUP-ENT-001 | Enterprise Supplier는 관리자 개별 계약 기반이다. | Supplier Membership Engine, Admin Control Engine | Supplier Approval Workflow, `membership_status` | 가격/범위는 별도 계약. |
| BR-SUP-ENT-002 | 우선 노출이 가능하다. | Exposure Engine | Landing Page Publish Workflow | 비승인 콘텐츠 노출은 여전히 금지. |
| BR-SUP-ENT-003 | 전담 매칭이 가능하다. | Trade Brokerage Engine, Admin Control Engine | Inquiry Brokerage Workflow | Admin 담당자 배정 가능. |
| BR-SUP-ENT-004 | 다국어 콘텐츠 지원이 가능하다. | Marketplace Engine, Company Microsite Engine | Product/Company workflows | Translation 정책은 별도 결정 필요. |
| BR-SUP-ENT-005 | 성과 리포트 제공이 가능하다. | Analytics Engine | Reporting flow | Buyer PII는 마스킹 또는 집계만 허용. |

## 4. Buyer Business Rules

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-BUYER-001 | Buyer는 기본적으로 Agent Referral Link로 가입한다. | Invitation Engine, Organization Engine | Buyer Signup Workflow | Direct Signup은 Admin Setting으로 제어. |
| BR-BUYER-002 | Buyer Direct Signup은 Admin Setting으로 ON/OFF한다. | Admin Control Engine, Identity Engine | Buyer Signup Workflow | MVP 기본값은 OFF. |
| BR-BUYER-003 | 비로그인 사용자는 목록과 요약만 볼 수 있다. | Marketplace Engine, Buy Request Engine | Guest Journey | 상세 열람은 제한. |
| BR-BUYER-004 | 로그인 후 상세 확인이 가능하다. | Buy Request Engine, Marketplace Engine | Buyer Journey | 승인된 공개 콘텐츠 기준. |
| BR-BUYER-005 | Buy Request를 등록할 수 있다. | Marketplace Engine, Approval Engine | Buy Request Workflow, `buy_request_status` | 공개는 Admin Screening 후. |
| BR-BUYER-006 | Product/Company Inquiry가 가능하다. | Trade Brokerage Engine | Inquiry Brokerage Workflow, `inquiry_status` | Admin Broker Queue로 접수. |
| BR-BUYER-007 | Proposal은 Admin Brokerage를 통해 수신한다. | Trade Brokerage Engine | Proposal Workflow, `proposal_status` | Supplier가 직접 전달하지 않는다. |
| BR-BUYER-008 | Supplier와 직접 연락은 Admin 승인 후만 가능하다. | Trade Brokerage Engine, Communication Engine | Direct Contact Approval Plugin | 조건은 Decision Required. |
| BR-BUYER-009 | 개인정보 공개 범위는 Admin 정책 기준이다. | Admin Control Engine, Trade Brokerage Engine | Buyer Shield Plugin | 기본값은 비공개. |

## 5. Agent Business Rules

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-AGENT-001 | Agent는 신청할 수 있다. | Identity Engine, Approval Engine | Agent Application Workflow, `agent_status` | 공개 신청은 flag로 제어 가능. |
| BR-AGENT-002 | Admin이 Agent를 초대할 수 있다. | Invitation Engine, Admin Control Engine | Agent Application Workflow | Admin Manual Invitation Plugin 사용. |
| BR-AGENT-003 | Admin 승인 전 Agent 기능은 사용할 수 없다. | Approval Engine, Organization Engine | `role_status`, `agent_status` | Referral Link 발급 금지. |
| BR-AGENT-004 | Buyer Referral Link/QR 발급이 가능하다. | Invitation Engine | Buyer Invitation Plugin | 승인된 Agent만 가능. |
| BR-AGENT-005 | 하부 Buyer를 관리할 수 있다. | Organization Engine | Buyer Signup Workflow | Agent-Buyer 관계 기준. |
| BR-AGENT-006 | 하부 Buyer와 직접 메시지가 가능하다. | Communication Engine | Agent Buyer Chat Plugin | Supplier-Buyer 금지와 별개로 허용. |
| BR-AGENT-007 | 하부 Buyer 성과/활동을 확인할 수 있다. | Organization Engine, Analytics Engine | Agent Journey | 제한 요약만 허용. |
| BR-AGENT-008 | 다른 Agent의 Buyer는 볼 수 없다. | Organization Engine | Organization Permission Plugin | RLS/Permission Matrix에서 강제 필요. |

## 6. Professor Business Rules

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-PROF-001 | Professor는 일반 공개 신청보다 Admin Invitation 중심으로 운영한다. | Invitation Engine, Admin Control Engine | Professor Invitation Workflow | MVP 기본값은 공개 신청 OFF. |
| BR-PROF-002 | Admin이 미팅 후 교수 초대 링크를 발송한다. | Invitation Engine | Professor Invitation Workflow | 최종 승인 필요. |
| BR-PROF-003 | Student Referral Link/QR 발급이 가능하다. | Invitation Engine | Student Invitation Plugin | 승인된 Professor만 가능. |
| BR-PROF-004 | 하부 Student의 이름, 학교, 학과, 연락처, 이메일, 활동내역을 확인할 수 있다. | Organization Engine, Student Growth Engine | Professor Journey | 담당 관계에 한정. |
| BR-PROF-005 | 하부 Student와 직접 메시지가 가능하다. | Communication Engine | Professor Student Chat Plugin | 담당 관계에 한정. |
| BR-PROF-006 | 다른 Professor의 Student는 볼 수 없다. | Organization Engine | Organization Permission Plugin | RLS/Permission Matrix에서 강제 필요. |

## 7. Student Business Rules

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-STUDENT-001 | Student는 Professor Referral Link/QR로 가입한다. | Invitation Engine, Organization Engine | Student Signup Workflow | MVP 기본값은 필수. |
| BR-STUDENT-002 | Student는 제품을 직접 등록할 수 없다. | Marketplace Engine, Student Growth Engine | Student Journey | Supplier/Admin만 제품 원본 등록 가능. |
| BR-STUDENT-003 | 승인된 Supplier 제품을 선택할 수 있다. | Marketplace Engine, Student Growth Engine | Student Showcase flow | Product Selection Plugin 기준. |
| BR-STUDENT-004 | Student Showcase를 생성할 수 있다. | Student Growth Engine | Student Showcase flow, `student_showcase_status` | 제품 등록이 아니라 소개/유치 활동. |
| BR-STUDENT-005 | Showcase 공개는 관리자 승인 필요하다. | Approval Engine, Exposure Engine | Student Showcase Approval Module | 승인 전 public 노출 금지. |
| BR-STUDENT-006 | Buyer 유치 활동이 가능하다. | Student Growth Engine, Invitation Engine | Buyer Acquisition flow | 상세 보상 기준은 Decision Required. |
| BR-STUDENT-007 | Market Research 제출이 가능하다. | Student Growth Engine | Market Research Module | 공개/평가 기준 별도 필요. |
| BR-STUDENT-008 | Event Support가 가능하다. | Event Engine, Student Growth Engine | Event Application Workflow | 승인/배정 정책 필요. |
| BR-STUDENT-009 | Translation Support가 가능하다. | Student Growth Engine | Support activity flow | 품질 검수 기준 필요. |
| BR-STUDENT-010 | Global Trade Passport가 성장한다. | Student Growth Engine, Trust Engine | Career Rank Module | 활동 기반 누적. |
| BR-STUDENT-011 | Badge/Reward를 받을 수 있다. | Trust Engine, Student Growth Engine | Badge Grant Workflow | 자동 지급은 금지, Admin 승인 기반. |
| BR-STUDENT-012 | 졸업 후 Alumni 또는 Global Trade Associate로 전환한다. | Student Growth Engine, Organization Engine | Graduation Workflow, `graduation_status` | 전환 조건은 Decision Required. |

## 8. Admin Brokerage Rules

Admin Brokerage 기본 흐름:

```text
Buyer Inquiry
→ Admin Broker Queue
→ Admin Review
→ Supplier Forward
→ Supplier Proposal
→ Admin Review
→ Buyer Delivery
→ Buyer Response
→ Matched / Closed / Rejected
```

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-BROKER-001 | Supplier에게 Buyer email/phone을 직접 전달하지 않는다. | Trade Brokerage Engine | Inquiry Brokerage Workflow | Buyer Shield Plugin 필수. |
| BR-BROKER-002 | Buyer에게 Supplier 직접 연락처 공개도 정책 기반으로 제한한다. | Trade Brokerage Engine | Direct Contact Approval Plugin | 기본값은 제한. |
| BR-BROKER-003 | Direct Contact Release는 Admin Approval이 필요하다. | Approval Engine, Trade Brokerage Engine | Direct Contact Approval Plugin | 조건은 Decision Required. |
| BR-BROKER-004 | 모든 단계는 Audit Log에 기록한다. | Admin Control Engine | Inquiry/Proposal state transitions | Admin Review 단계는 reviewer/time 포함. |
| BR-BROKER-005 | 모든 상태는 State Machine 문서와 일치해야 한다. | Trade Brokerage Engine | `inquiry_status`, `proposal_status` | 상태 이름을 임의 추가하지 않는다. |
| BR-BROKER-006 | Supplier Proposal은 Admin Review 후 Buyer에게 전달한다. | Trade Brokerage Engine | Proposal Workflow | 승인 전 Buyer 전달 금지. |
| BR-BROKER-007 | Supplier-Buyer 직접 conversation 생성은 기본 차단한다. | Communication Engine, Trade Brokerage Engine | Admin Mediated Supplier Buyer Chat Plugin | DB/RLS 보완 필요. |

## 9. Membership Rules

| Membership | Product Limit | Exposure Limit | Featured Eligibility | Proposal Eligibility | Analytics Access | Badge Eligibility | Admin Override |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Free | Decision Required | 제한 | 제한 또는 불가 | 제한 가능 | 없음 또는 최소 | 기본 Badge만 가능 | 가능 |
| Premium | 확대 또는 무제한, Decision Required | 확대 | 가능 | 가능 | 일부 가능 | Premium Supplier 가능 | 가능 |
| Enterprise | 개별 계약 | 우선 노출 가능 | 가능 | 가능 | 성과 리포트 가능 | Enterprise/Premium 성격 Badge 가능 | 가능 |
| Admin Granted Premium | Admin 지정 범위 | Admin 지정 범위 | 가능 | 가능 | Admin 지정 범위 | Premium Supplier 가능 | 회수 가능 |

원칙:

- Membership은 Supplier Membership Engine이 소유한다.
- Badge 표시는 Trust Engine이 소유한다.
- Membership Badge와 Verification Badge를 혼동하지 않는다.
- 무료/유료 등급과 직접 연락 허용은 별개다. Premium/Enterprise라도 Buyer email/phone 직접 노출은 기본 금지다.

## 10. Trust / Badge / Verification Rules

Trust Engine에서 관리하는 Badge / Verification 후보:

- Verified Supplier
- Verified Buyer
- Verified Agent
- Verified Professor
- Verified Student
- Verified Company
- Verified Factory
- Verified Exporter
- Verified OEM
- Thailand FDA Registered
- Premium Supplier
- Top Supplier
- Fast Response
- High Match Rate
- Top Ambassador

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-TRUST-001 | Badge는 Admin이 부여/회수할 수 있다. | Trust Engine, Approval Engine | Badge Grant Workflow, `badge_status` | 자동 추천은 가능하나 최종 부여는 Admin 기준. |
| BR-TRUST-002 | Badge 클릭 시 발급 근거와 발급일을 표시한다. | Trust Engine, UI Design System Engine | Badge display | UI 구현 시 tooltip/detail 필요. |
| BR-TRUST-003 | Membership Badge와 Verification Badge를 혼동하지 않는다. | Trust Engine, Supplier Membership Engine | Badge Grant Workflow | 예: Premium Supplier != Verified Supplier. |
| BR-TRUST-004 | Company Score와 Badge는 별도다. | Trust Engine, Analytics Engine | Ranking/Company Score Module | 점수 산식은 Decision Required. |
| BR-TRUST-005 | Thailand FDA Registered는 FDA Service 완료 상태와 연결한다. | Trust Engine, Thailand FDA Service Engine | Thailand FDA Application Workflow, `fda_application_status` | 완료 보고서 기준. |

## 11. Landing / Exposure Business Rules

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-EXPOSURE-001 | Exposure Engine은 무엇을 노출할지 결정한다. | Exposure Engine | Landing Page Publish Workflow | 승인/검증/랭킹/멤버십 기준. |
| BR-EXPOSURE-002 | Landing Page Builder는 어디에 어떤 순서로 보여줄지 결정한다. | Landing Page Builder Engine | `landing_page_status`, `landing_section_status` | Admin이 섹션 구성. |
| BR-EXPOSURE-003 | 관리자는 Hero부터 Footer CTA까지 설정할 수 있다. | Landing Page Builder Engine | Landing Page Publish Workflow | UI Design System 기준. |
| BR-EXPOSURE-004 | Section ON/OFF가 가능하다. | Landing Page Builder Engine | `landing_section_status` | 비노출/보관 상태 필요. |
| BR-EXPOSURE-005 | Section Order가 가능하다. | Landing Page Builder Engine | Section Order Plugin | 수동 순서 관리. |
| BR-EXPOSURE-006 | Manual Pick이 가능하다. | Exposure Engine | Featured content flow | Admin 선택 콘텐츠. |
| BR-EXPOSURE-007 | Auto Ranking이 가능하다. | Exposure Engine, Analytics Engine | Ranking Module | MVP/Future는 flag로 제어. |
| BR-EXPOSURE-008 | 비승인 콘텐츠는 노출하지 않는다. | Approval Engine, Exposure Engine | Product/Company/Showcase status | public 노출의 절대 조건. |
| BR-EXPOSURE-009 | Featured Supplier/Product는 승인/검증 상태 기준으로 제한한다. | Exposure Engine, Trust Engine | Featured selection | Membership만으로 충분하지 않다. |

## 12. Notification / Board / Calendar Rules

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-NOTICE-001 | 모든 주요 행동은 Notification을 발생시킬 수 있다. | Communication Engine | `notification_status` | Role별 관련 대상에게만 발송. |
| BR-NOTICE-002 | Toast와 Inbox Notification은 분리한다. | Communication Engine, UI Design System Engine | Notification Module | 즉시 피드백과 보관형 알림 분리. |
| BR-NOTICE-003 | 읽음, 안읽음, 삭제, 전체보기를 지원한다. | Communication Engine | `notification_status` | 상태 기준 구현 필요. |
| BR-NOTICE-004 | 공지사항, FAQ, Gallery, Event, Calendar는 공통 Board System을 사용한다. | Communication Engine, Event Engine, Admin Control Engine | Board/Calendar flow | 세부 Board Engine 여부는 추후 결정. |
| BR-NOTICE-005 | Board도 승인/공개 상태 관리를 가져야 한다. | Approval Engine, Admin Control Engine | public content approval | public 노출 전 승인 필요. |

## 13. Privacy / Data Protection Rules

| Rule ID | Rule | Related Engine | Workflow / State | Notes |
| --- | --- | --- | --- | --- |
| BR-PRIVACY-001 | Buyer email/phone/contact는 Supplier에게 직접 노출하지 않는다. | Trade Brokerage Engine | Inquiry Brokerage Workflow | 플랫폼 핵심 자산. |
| BR-PRIVACY-002 | Student 개인정보는 담당 Professor와 Admin만 전체 확인한다. | Organization Engine | Professor/Student workflows | 다른 Professor 접근 금지. |
| BR-PRIVACY-003 | Agent는 하부 Buyer 정보만 제한 확인한다. | Organization Engine | Agent Journey | email/phone 전체, 상세 문의, 계약금액, Admin memo 금지. |
| BR-PRIVACY-004 | Admin memo는 Admin만 확인한다. | Admin Control Engine, Approval Engine | Approval workflows | 운영 목적 접근만 허용. |
| BR-PRIVACY-005 | Audit Log는 Admin/System만 확인한다. | Admin Control Engine | Audit Log Module | 일반 Role 노출 금지. |
| BR-PRIVACY-006 | Public에는 승인된 공개 정보만 노출한다. | Approval Engine, Exposure Engine | public content flows | RLS/queries 모두에서 보장. |
| BR-PRIVACY-007 | service role은 서버 전용 작업에만 사용한다. | Admin Control Engine, Security boundary | System task | P0/P1 감사 기준 유지. |

## 14. Business Rule Decision Required

| Decision ID | Topic | Current Default / Direction | Related Engine | Blocks | Required Decision |
| --- | --- | --- | --- | --- | --- |
| DR-BR-001 | Free Supplier 제품 등록 개수 | 제한 필요 | Supplier Membership Engine, Marketplace Engine | Permission Matrix, ERD/RLS, Admin Setting | Free plan의 product limit 숫자 |
| DR-BR-002 | Premium Supplier 가격 정책 | Premium enabled 방향 | Supplier Membership Engine | Membership billing, UI copy | 가격, 기간, 결제 전/후 운영 방식 |
| DR-BR-003 | Buyer Direct Signup 기본값 | MVP 기본 OFF | Admin Control Engine, Invitation Engine | Signup policy, Feature Flags | 운영 시작 시 기본값 확정 |
| DR-BR-004 | Professor 공개 신청 허용 여부 | MVP 기본 OFF, Admin Invitation 중심 | Invitation Engine, Approval Engine | Signup routes, Admin setting | 공개 신청을 MVP에서 열지 여부 |
| DR-BR-005 | Direct Contact Release 조건 | Admin Approval 필요 | Trade Brokerage Engine, Approval Engine | RLS, Communication model | 어떤 상태/계약/관리자 승인으로 공개할지 |
| DR-BR-006 | Proposal 제출 가능 Supplier 등급 | Premium 가능, Free 제한 가능 | Supplier Membership Engine, Trade Brokerage Engine | Permission Matrix, UI gating | Free도 제한적으로 허용할지 여부 |
| DR-BR-007 | Student Reward 기준 | Admin 승인 기반 | Student Growth Engine, Trust Engine | Reward policy, Badge policy | 활동별 점수/보상 조건 |
| DR-BR-008 | Badge 자동 부여 조건 | 자동 추천 가능, Admin 최종 승인 | Trust Engine | Badge automation, audit | 완전 자동 부여를 허용할 Badge 범위 |
| DR-BR-009 | Company Score 계산식 | Badge와 별도 | Trust Engine, Analytics Engine | Ranking, Exposure | 점수 입력값/가중치/노출 반영 방식 |

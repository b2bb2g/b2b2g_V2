# B2BB2G V2 — Feature Flags

## 1. Feature Flag Purpose

본 문서는 B2BB2G V2의 Feature Flag 기준을 정의한다. Feature Flag는 Business Rules를 구현 시점에 안전하게 켜고 끄기 위한 운영 장치이며, Permission Matrix, Admin Setting, RLS 설계의 보조 기준이다.

범위:

- MVP 기본값
- Admin이 변경 가능한 운영 토글
- Engine/Module/Plugin별 조건부 동작
- 보안/개인정보/노출 리스크가 있는 기능의 기본 차단

본 문서는 Permission Matrix, ERD, RLS를 작성하지 않는다.

## 2. Feature Flag Principles

| Principle ID | Principle |
| --- | --- |
| FF-P-001 | Feature Flag는 Business Rule을 우회하기 위한 장치가 아니다. |
| FF-P-002 | 보안/개인정보 보호 관련 flag는 안전한 기본값을 가져야 한다. |
| FF-P-003 | Supplier-Buyer 직접 연락처럼 플랫폼 핵심 원칙을 깨는 flag는 기본 OFF이며 Admin 승인 절차와 Audit Log가 필요하다. |
| FF-P-004 | Admin Editable flag라도 RLS/Permission의 최종 제어를 대체하지 않는다. |
| FF-P-005 | Public exposure 관련 flag는 승인된 콘텐츠만 대상으로 동작해야 한다. |
| FF-P-006 | MVP에서 사용하지 않는 future flag는 기본 OFF로 둔다. |
| FF-P-007 | flag key는 snake_case로 작성하고 UI label과 분리한다. |

## 3. Feature Flag Matrix

| Flag Key | Default | Admin Editable | Related Engine | Description | MVP / Future | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| `supplier_public_signup_enabled` | `true` | Yes | Invitation Engine, Identity Engine, Approval Engine | Supplier가 Public Signup으로 자발 가입 신청을 할 수 있는지 제어한다. | MVP | P2: 스팸/품질 관리 부담 증가, 승인 전 기능 제한 필수 |
| `supplier_invitation_enabled` | `true` | Yes | Invitation Engine, Admin Control Engine, Identity Engine | Admin이 Supplier Invitation Link를 발급할 수 있는지 제어한다. | MVP | P2: 초대 남용 방지를 위한 audit 필요 |
| `supplier_requires_admin_approval` | `true` | Restricted | Approval Engine, Identity Engine, Supplier Membership Engine | Supplier Role Application과 Supplier 기능 활성화에 Admin Approval을 강제한다. | MVP guard | P1: OFF 시 미검증 Supplier 공개/활성화 위험 |
| `buyer_direct_signup_enabled` | `false` | Yes | Admin Control Engine, Invitation Engine, Identity Engine | Agent Referral Link 없이 Buyer가 직접 가입할 수 있는지 제어한다. | MVP | P1: Agent attribution과 Buyer quality control 약화 |
| `agent_public_application_enabled` | `true` | Yes | Identity Engine, Approval Engine, Invitation Engine | Agent가 공개 신청 경로로 Role을 신청할 수 있는지 제어한다. | MVP | P2: 승인 대기/스팸 신청 증가 |
| `professor_public_application_enabled` | `false` | Yes | Invitation Engine, Approval Engine | Professor가 공개 신청할 수 있는지 제어한다. 기본은 Admin Invitation 중심이다. | MVP | P1: 검증되지 않은 Professor가 Student 네트워크 접근 시도 |
| `student_signup_requires_professor_link` | `true` | Limited | Invitation Engine, Organization Engine, Student Growth Engine | Student 가입에 Professor Referral Link/QR을 필수로 요구한다. | MVP | P1: OFF 시 Student 소속/개인정보 경계 약화 |
| `supplier_buyer_direct_contact_enabled` | `false` | Restricted | Trade Brokerage Engine, Communication Engine, Approval Engine | Admin 승인 없이 Supplier-Buyer 직접 연락을 허용할지 제어한다. | MVP guard | P0/P1: Buyer PII 및 Admin Brokerage 우회 |
| `admin_brokerage_required` | `true` | No by default | Trade Brokerage Engine | Buyer-Supplier Inquiry/Proposal 흐름에 Admin Brokerage를 강제한다. | MVP | P0/P1: OFF 시 핵심 비즈니스 모델 위반 |
| `free_supplier_product_limit_enabled` | `true` | Yes | Supplier Membership Engine, Marketplace Engine | Free Supplier의 제품 등록 개수 제한을 적용한다. | MVP | P2: OFF 시 운영/노출 품질 관리 약화 |
| `premium_supplier_enabled` | `true` | Yes | Supplier Membership Engine, Trust Engine | Premium Supplier 플랜과 Premium Badge를 운영한다. | MVP | P2: 가격/권한 미확정 시 혼선 |
| `enterprise_supplier_enabled` | `false` | Yes | Supplier Membership Engine, Admin Control Engine | Enterprise Supplier 개별 계약 기능을 운영한다. | Future | P2: 수동 계약/권한 범위 미정 |
| `landing_builder_enabled` | `true` | Restricted | Landing Page Builder Engine, Exposure Engine | Admin이 Landing Page 섹션을 Builder 방식으로 관리한다. | MVP | P2: 잘못된 설정 시 public 노출 혼선 |
| `popup_enabled` | `true` | Yes | Landing Page Builder Engine, Exposure Engine | Admin이 public popup을 운영할 수 있다. | MVP | P3: UX 방해 또는 오래된 캠페인 노출 |
| `banner_enabled` | `true` | Yes | Landing Page Builder Engine, Exposure Engine | Admin이 banner 섹션을 운영할 수 있다. | MVP | P3: 승인되지 않은 콘텐츠 연결 위험 |
| `manual_featured_content_enabled` | `true` | Yes | Exposure Engine, Admin Control Engine | Admin이 Featured Supplier/Product/Content를 수동 선택할 수 있다. | MVP | P2: 승인/검증 조건 누락 시 부적절 노출 |
| `auto_ranking_featured_enabled` | `false` | Yes | Exposure Engine, Analytics Engine, Trust Engine | Company Score/활동 기반 자동 랭킹 노출을 사용한다. | Future | P2: score 산식 미확정 |
| `student_showcase_public_enabled` | `true` | Yes | Student Growth Engine, Approval Engine, Exposure Engine | 승인된 Student Showcase를 public에 노출한다. | MVP | P2: 승인 전 노출 방지 필요 |
| `fda_service_enabled` | `true` | Yes | Thailand FDA Service Engine | Thailand FDA Service 신청/운영을 활성화한다. | MVP | P2: 파일/문서 개인정보 관리 필요 |
| `event_enabled` | `true` | Yes | Event Engine, Approval Engine | Event 등록/참가 신청 기능을 활성화한다. | MVP | P3: 정원/승인 정책 필요 |
| `ai_recommendation_enabled` | `false` | Restricted | Analytics Engine, Exposure Engine | AI 기반 Buyer/Supplier 추천을 활성화한다. | Future | P1: 추천 근거, 개인정보, 편향 리스크 |
| `public_api_enabled` | `false` | Restricted | Admin Control Engine, Analytics Engine | 외부 Public API를 활성화한다. | Future | P1: 데이터 유출/쿼터/인증 리스크 |
| `multi_tenant_enabled` | `false` | Restricted | Admin Control Engine, Identity Engine | 국가별/조직별 멀티테넌트 운영을 활성화한다. | Future | P1: tenant boundary와 RLS 복잡도 증가 |

## 4. MVP Default Flag Values

MVP 추천 기본값:

```text
supplier_public_signup_enabled = true
supplier_invitation_enabled = true
supplier_requires_admin_approval = true
buyer_direct_signup_enabled = false
agent_public_application_enabled = true
professor_public_application_enabled = false
student_signup_requires_professor_link = true
supplier_buyer_direct_contact_enabled = false
admin_brokerage_required = true
free_supplier_product_limit_enabled = true
premium_supplier_enabled = true
enterprise_supplier_enabled = false
landing_builder_enabled = true
popup_enabled = true
banner_enabled = true
manual_featured_content_enabled = true
auto_ranking_featured_enabled = false
student_showcase_public_enabled = true
fda_service_enabled = true
event_enabled = true
ai_recommendation_enabled = false
public_api_enabled = false
multi_tenant_enabled = false
```

## 5. Admin Setting Rules

| Rule ID | Rule |
| --- | --- |
| FF-ADMIN-001 | Admin Editable flag는 Admin Control Engine에서 관리한다. |
| FF-ADMIN-002 | Restricted flag는 최고 관리자 또는 시스템 관리자급 승인 없이 변경하지 않는다. |
| FF-ADMIN-003 | 개인정보, 직접 연락, public API, multi-tenant 관련 flag 변경은 Audit Log를 남긴다. |
| FF-ADMIN-004 | Public exposure flag는 승인된 콘텐츠만 대상으로 동작한다. |
| FF-ADMIN-005 | flag 변경은 즉시 적용 여부와 예약 적용 여부를 구분해야 한다. |
| FF-ADMIN-006 | flag UI label은 Translation Key 기반으로 관리한다. |

Restricted flag:

- `supplier_requires_admin_approval`
- `supplier_buyer_direct_contact_enabled`
- `admin_brokerage_required`
- `landing_builder_enabled`
- `ai_recommendation_enabled`
- `public_api_enabled`
- `multi_tenant_enabled`

## 6. RLS / Permission Impact

| Flag Key | Permission / RLS Impact |
| --- | --- |
| `supplier_public_signup_enabled` | Public signup route를 열어도 Supplier Role Application은 pending/submitted 상태여야 하며 Admin Approval 전 공개/활성화/Buyer PII 접근은 금지해야 한다. |
| `supplier_invitation_enabled` | Admin Invitation은 signup 경로만 열며 Buyer PII, Company/Product publish, Supplier-Buyer direct contact 권한을 부여하지 않는다. |
| `supplier_requires_admin_approval` | OFF는 MVP에서 허용하지 않는다. Supplier Role, Membership tier, public exposure는 Admin Approval과 별도 Company/Product Approval을 거쳐야 한다. |
| `buyer_direct_signup_enabled` | Direct signup route를 열더라도 Buyer 데이터 접근은 본인/Agent/Admin 관계로 제한해야 한다. |
| `professor_public_application_enabled` | 공개 신청을 켜도 승인 전 Professor 기능과 Student 데이터 접근은 금지해야 한다. |
| `student_signup_requires_professor_link` | OFF로 바꾸려면 무소속 Student 처리와 개인정보 접근 경계를 별도 설계해야 한다. |
| `supplier_buyer_direct_contact_enabled` | ON이어도 Admin 승인된 case 단위에서만 contact release가 가능해야 한다. 전역 직접 연락 허용으로 해석하면 안 된다. |
| `admin_brokerage_required` | OFF는 MVP에서 허용하지 않는다. RLS와 server action 모두 Admin Brokerage 경계를 보완해야 한다. |
| `free_supplier_product_limit_enabled` | product insert/update 권한에서 Supplier plan limit 체크가 필요하다. |
| `student_showcase_public_enabled` | Showcase public select는 `approved/published` 상태만 허용해야 한다. |
| `public_api_enabled` | API key, rate limit, field-level masking, audit logging 설계 전까지 OFF 유지. |
| `multi_tenant_enabled` | tenant_id 또는 equivalent boundary가 ERD/RLS에 반영되기 전까지 OFF 유지. |

## 7. Codex Implementation Notes

- Feature Flag 구현은 지금 하지 않는다.
- Permission Matrix, ERD, RLS 작성 전에는 flag key를 코드에 흩뿌리지 않는다.
- flag 저장 위치는 추후 Admin Setting / Site Setting 모델에서 결정한다.
- 보안 관련 flag는 UI 토글만으로 동작시키지 않고 server action, query, RLS 정책과 함께 검증한다.
- `supplier_buyer_direct_contact_enabled`는 global bypass가 아니라 Admin-approved exception을 허용하는 guard로만 해석한다.
- `admin_brokerage_required`는 MVP에서 사실상 hard policy이며, 일반 Admin UI에서 쉽게 끌 수 있는 flag로 구현하지 않는다.

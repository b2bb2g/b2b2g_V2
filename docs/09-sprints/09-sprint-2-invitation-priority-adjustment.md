# Sprint 2 Invitation Priority Adjustment

## 1. Purpose

Sprint 2 진행 중 Supplier signup policy가 확장되었기 때문에 Invitation Engine 우선순위를 조정한다.

기존 Sprint 2 Organization 작업은 계속 유효하지만, Organization query/action을 확장하기 전에 Invitation Engine의 Role별 가입 정책과 Feature Flag 기준을 먼저 확정해야 한다. 특히 Supplier는 Admin Invitation과 Public Self Signup을 모두 지원해야 하며, 두 경로 모두 Admin Approval과 Buyer PII 보호 원칙을 우회할 수 없다.

## 2. Priority Decision

| Item | Decision |
| --- | --- |
| Current Sprint priority | Invitation Engine policy alignment before Organization query/action expansion |
| Organization helper work | Keep completed as safe guardrail |
| Organization query/action work | Hold until Invitation signup policy is reflected in query/action design |
| DB migration | Not authorized by this document |
| UI implementation | Not authorized by this document |
| RLS SQL | Not authorized by this document |

## 3. Supplier Signup Policy

Supplier는 초대 가입과 자발 가입을 모두 지원한다.

| Rule | Final Policy |
| --- | --- |
| Admin Invitation | Supplier는 관리자가 Invitation Link를 발급해서 초대할 수 있다. |
| Public Self Signup | Supplier는 Public Signup으로 자발 가입 신청도 가능하다. |
| Immediate activation | 자발 가입한 Supplier는 즉시 공개/활성화되지 않는다. |
| Role Application | Supplier Role Application 생성 후 Admin Approval을 받아야 한다. |
| Company/Product approval | Supplier 회사/제품 공개는 별도 Company/Product Approval을 받아야 한다. |
| Membership tier | Free/Premium/Enterprise 구분은 Admin 승인 후 적용한다. |
| Buyer PII | 자발 가입 또는 초대 가입 여부와 관계없이 Buyer PII 접근은 불가하다. |
| Brokerage | Supplier-Buyer 문의/제안/연락은 Admin Brokerage 원칙을 따른다. |

## 4. Invitation Engine Target Roles

Invitation Engine은 아래 Role을 대상으로 한다.

- Supplier
- Agent
- Buyer
- Professor
- Student

## 5. Role Signup Policy Matrix

| Role | Admin Invitation | Public Self Signup / Application | Required Approval | Relation Created | Notes |
| --- | --- | --- | --- | --- | --- |
| Supplier | Yes | Yes | Admin Approval required | Company membership later, not immediate public exposure | Public signup creates pending Supplier Role Application. |
| Agent | Yes | Public Application possible | Admin Approval required | Agent-Buyer relation later through approved assignment/invitation flow | Approved Agent may invite Buyer. |
| Buyer | Through Agent Invitation Link by default | Controlled by `buyer_direct_signup_enabled` | Configurable later | Agent-Buyer relation when Agent link is used | Direct signup default OFF. |
| Professor | Admin Invitation 중심 | Public Application default OFF | Admin Approval required | Professor-Student relation later through invitation flow | Public application requires explicit flag change. |
| Student | Professor Invitation Link/QR only | No | Professor/Invitation relation required; Admin policy may review later | Professor-Student relation | Public self signup is not allowed. |

## 6. Feature Flag Requirements

Required or confirmed flags:

| Flag Key | Default | Meaning |
| --- | --- | --- |
| `supplier_public_signup_enabled` | `true` | Supplier Public Self Signup route/application is available. |
| `supplier_invitation_enabled` | `true` | Admin can invite Supplier through Invitation Link. |
| `supplier_requires_admin_approval` | `true` | Supplier Role Application must be approved before Supplier privileges/public activation. |
| `professor_public_application_enabled` | `false` | Professor public application is closed by default. |
| `buyer_direct_signup_enabled` | `false` | Buyer direct signup is disabled by default; Agent invitation is default. |
| `student_signup_requires_professor_link` | `true` | Student signup requires Professor Invitation Link/QR. |

These flags do not override Permission Matrix, RLS, Admin Approval, Company Approval, Product Approval, Buyer PII masking, or Admin Brokerage.

## 7. Security Rules

- Supplier self signup does not grant Buyer PII access.
- Supplier invitation does not grant Buyer PII access.
- Supplier approval does not grant Buyer PII access.
- Premium/Enterprise membership does not grant Buyer PII access.
- Company/Product public exposure requires separate approval.
- Buyer direct signup flag does not grant public Buyer PII exposure.
- Student signup without Professor link remains blocked unless a future Source of Truth explicitly changes it.
- Feature Flags cannot weaken RLS or server-side authorization.

## 8. Sprint 2 Impact

Task priority changes:

1. Finish this Invitation priority adjustment.
2. Write Invitation Engine repository audit / implementation plan before Organization query/action expansion.
3. Keep Organization helper/types as guardrails.
4. Defer Organization query layer until signup/invitation relation inputs are clear.
5. Defer Admin relation UI until invitation and organization relation policies align.

## 9. Files / Docs To Keep Aligned

- `docs/03-business/01-business-rules.md`
- `docs/03-business/02-feature-flags.md`
- `docs/04-permissions/01-permission-matrix.md`
- `docs/09-sprints/01-engine-sprint-plan.md`
- `docs/09-sprints/08-sprint-2-organization-implementation-plan.md`
- `PROJECT_MASTER.md`
- `TASK_MASTER.md`

## 10. Codex Notes

- Do not implement signup routes from this document alone.
- Do not add DB migration from this document alone.
- Do not add RLS SQL from this document alone.
- Do not expose Buyer PII to Supplier in any invitation path.
- Invitation implementation must create or connect to Role Application workflow, not direct active privileges.
- Supplier invitation and Supplier public signup must both converge into Admin Approval.

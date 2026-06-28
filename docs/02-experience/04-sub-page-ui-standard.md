# B2BB2G V2 — Sub Page UI Standard

> 문서 상태: Draft v1 (작성일 2026-06-28)
> 문서 유형: Architecture Source of Truth (Experience Layer)
> 구조 기준: Platform → Experience → Engine → Module → Plugin

## 0. 문서 목적과 위치

목적: 각각의 서브 페이지 UI가 중구난방이 되지 않도록, 모든 페이지의 기본 UI 구조와 패턴을 정의한다.

- `02-platform-experience-standard.md`는 화면을 가로지르는 **동작 규약**(Notification/Dialog/Search/List 등)을 정의한다.
- 본 문서는 그 규약들이 **실제 페이지 안에서 어떤 골격(블록 순서)으로 배치되는가**를 정의한다.
- 새로운 화면을 만들 때는 1장의 Page Inventory에서 가장 가까운 패턴을 먼저 찾고, 2장의 패턴 정의를 그대로 적용한다. 패턴에 없는 새 블록이 필요하면 본 문서를 먼저 갱신한다.

### 0.1 관련 문서

| 문서 | 관계 |
|---|---|
| [01-platform-engine-module-plugin.md](../01-architecture/01-platform-engine-module-plugin.md) | 각 페이지가 속한 Engine/Module 정의 |
| [02-platform-experience-standard.md](../01-architecture/02-platform-experience-standard.md) | Notification/Message/Board/Calendar/Dialog/Upload/Search/List/Mobile/Dashboard/Audit/Builder 공통 규약 (본 문서가 페이지 골격에 배치하는 대상) |
| [01-user-journey.md](01-user-journey.md) | 각 페이지를 방문하는 Role의 목적 |
| [02-workflow-standard.md](02-workflow-standard.md) | Create/Edit/Approval Page에서 실행되는 절차 |
| [03-state-machine.md](03-state-machine.md) | List/Detail/Admin Management Page의 Status Badge 표시 기준 |
| [00-existing-code-reuse-policy.md](../07-implementation/00-existing-code-reuse-policy.md) | 기존 페이지 코드와 본 문서 충돌 시 처리 기준 |

---

## 1. Page Inventory

모든 서브 페이지는 아래 세 그룹과 5개 UI 패턴(2장) 중 하나로 분류된다. 새 페이지를 만들 때는 먼저 이 표에서 가장 가까운 행을 찾는다.

### 1.1 Public Pages

| Page | UI 패턴 | 소유 Engine |
|---|---|---|
| Home | Builder Page (Landing 변형) | Landing Page Builder Engine |
| Commercial Listing | Public Listing Page | Marketplace Engine |
| Commercial Detail | Public Detail Page | Marketplace Engine |
| Industrial Listing | Public Listing Page | Marketplace Engine |
| Industrial Detail | Public Detail Page | Marketplace Engine |
| EPC Listing | Public Listing Page | Marketplace Engine |
| EPC Detail | Public Detail Page | Marketplace Engine |
| Buy Request Listing | Public Listing Page | Buy Request Engine |
| Buy Request Detail | Public Detail Page | Buy Request Engine |
| Company Listing | Public Listing Page | Company Microsite Engine |
| Company Detail | Public Detail Page | Company Microsite Engine |
| Event Listing | Public Listing Page | Event Engine |
| Event Detail | Public Detail Page | Event Engine |
| Thailand FDA Service | Public Detail Page (서비스 소개 + 신청 CTA) | Thailand FDA Service Engine |
| Notice | Public Listing Page + Public Detail Page (Board: List 타입) | Common Board System |
| FAQ | Public Listing Page (Board: List 타입) | Common Board System |
| Gallery | Public Listing Page (Board: Gallery 타입) | Common Board System |
| Contact | 전용 Form 패턴 (Inquiry Entry로 연결) | Trade Brokerage Engine, Communication Engine |
| Login | 전용 Auth 패턴 | Identity Engine |
| Signup | 전용 Auth 패턴 | Identity Engine, Invitation Engine |

### 1.2 Dashboard Pages

| Page | UI 패턴 | 소유 Engine |
|---|---|---|
| Supplier Dashboard | Dashboard Page | Supplier Membership Engine, Marketplace Engine, Trade Brokerage Engine |
| Buyer Dashboard | Dashboard Page | Buy Request Engine, Trade Brokerage Engine |
| Agent Dashboard | Dashboard Page | Organization Engine |
| Professor Dashboard | Dashboard Page | Organization Engine, Student Growth Engine |
| Student Dashboard | Dashboard Page | Student Growth Engine |
| Admin Dashboard | Dashboard Page (Admin 변형) | Admin Control Engine |

### 1.3 Management Pages (Engine 공통 재사용 패턴)

아래 10개는 특정 화면이 아니라, 여러 Engine의 Admin Console과 일부 Role Dashboard에서 반복적으로 재사용되는 **페이지 유형**이다.

| Page 유형 | UI 패턴 | 비고 |
|---|---|---|
| List Page | Admin Management Page (목록 모드) | 모든 Engine의 Admin Console 목록 화면 |
| Detail Page | Public Detail Page 변형 (Admin Detail Drawer) | List Page에서 진입 |
| Create Page | Admin Management Page (Form 모드) | Dialog Standard의 Save 흐름 적용 |
| Edit Page | Admin Management Page (Form 모드) | Dialog Standard의 Save 흐름 적용 |
| Approval Page | Admin Management Page (Approval 모드) | Dialog Standard의 Approve/Reject 흐름 적용 |
| Setting Page | Admin Management Page (Form/Toggle 모드) | Admin Control Engine의 Toggle류 Plugin 운영 화면 |
| Builder Page | Builder Page | Landing Page Builder Engine, 향후 Dashboard/Company/Page Builder |
| Analytics Page | Dashboard Page 변형 (KPI/Chart 중심) | Analytics Engine |
| Message Page | Message Page (전용 패턴, 3.6 참조) | Communication Engine |
| Notification Page | Notification Page (전용 패턴, 3.7 참조) | Communication Engine |

---

## 2. UI Pattern Templates

### 2.1 Public Listing Page

- Page Hero
- Search Bar
- Filter Panel
- Sort
- Result Count
- Card / Grid / List Toggle
- Content Cards
- Pagination or Load More
- Empty State
- CTA Section

### 2.2 Public Detail Page

- Detail Hero
- Main Content
- Trust Badge Area
- Media Gallery
- Document Download
- Related Content
- Inquiry CTA
- Sticky Action
- Admin Brokerage Notice

> Admin Brokerage Notice: Supplier-Buyer 직접 연결이 금지된 콘텐츠(제품/회사/Buy Request)의 Inquiry CTA 옆에는 "문의는 관리자 중개를 거쳐 전달됩니다" 안내를 항상 함께 노출한다.

### 2.3 Dashboard Page

- Sidebar or Bottom Navigation
- Header
- Role Switcher
- KPI Cards
- Quick Actions
- Recent Activity
- Notifications
- Main Content
- Calendar or Schedule
- Message Preview

### 2.4 Admin Management Page

- Header
- Search
- Filter
- Table
- Bulk Action
- Status Badge
- Detail Drawer
- Approval Action
- Audit History
- Pagination

### 2.5 Builder Page

- Section List
- Section Editor
- Preview Panel
- Device Preview
- Publish Button
- Rollback
- Audit History

### 2.6 Message Page (보강)

Communication Engine의 Message Standard(`02-platform-experience-standard.md` 2장)를 페이지로 구현할 때의 골격.

- Folder Tabs (Inbox / Sent / Archive / Trash)
- Conversation List (검색/필터 포함)
- Conversation Detail (선택된 대화)
- Message Composer (Attachment 포함)
- Read Status Indicator
- Empty State

### 2.7 Notification Page (보강)

Communication Engine의 Notification Standard(`02-platform-experience-standard.md` 1장)를 페이지로 구현할 때의 골격.

- Type Filter Tabs
- Bulk Action Bar (전체 읽음 / 전체 삭제)
- Notification List (날짜별 정렬, 중요 표시)
- Empty State

---

## 3. 공통 UI 규칙

아래 규칙은 모든 페이지 패턴(2장)에 예외 없이 적용한다. 대부분 `02-platform-experience-standard.md`의 표준을 페이지 레벨에서 재확인한 것이다.

| 규칙 | 근거 문서 |
|---|---|
| 모든 UI는 UI Design System Engine의 Component Library를 사용한다 | Engine 문서 4.18 |
| 버튼, 입력, 테이블, 카드, 배지, 토스트, 모달, 드로어는 공통 컴포넌트만 사용한다 | Engine 문서 4.18 |
| 하드코딩 텍스트를 금지하고 Translation Key를 사용한다 | Engine 문서 2.3 공통 규칙 16번 |
| Public은 English 기본, Admin은 Korean 기본이다 | Engine 문서 4.18 정책 |
| 이모지를 사용하지 않는다 | Engine 문서 2.3 공통 규칙 16번 |
| 모든 주요 액션은 Confirmation Dialog 후 실행하고, 결과는 Toast Notification으로 안내한다 | Experience Standard 5장 Dialog Standard |
| 변경 작업은 Audit Log를 기록한다 | Experience Standard 11장 Audit Standard |
| 모바일에서는 Sticky Bottom Action 또는 Bottom Navigation을 사용한다 | Experience Standard 9장 Mobile UX Standard |

### 3.1 삭제 정책 (Soft Delete 기본)

- 모든 삭제는 기본적으로 **Soft Delete**(`deleted_at` 또는 상태값 전이)를 사용한다. 물리적 삭제(Hard Delete)는 보안/개인정보 즉시 제거 대상(`00-existing-code-reuse-policy.md` 5.9 참조)에만 적용한다.
- Soft Delete된 항목은 기본 목록에서 제외하되, Admin Management Page에서는 "삭제됨" 필터로 조회 가능해야 한다.
- Soft Delete도 Audit Log 대상이다 (Experience Standard 11장).

---

## 4. Sub Page UI Checklist

새 페이지를 만들거나 기존 페이지를 수정할 때 확인한다.

- [ ] 이 페이지는 1장 Page Inventory의 어느 행에 해당하는가? 해당 행이 없다면 1장을 먼저 갱신했는가?
- [ ] 이 페이지가 따르는 패턴(2장)의 블록을 빠짐없이 포함했는가? 빠진 블록이 있다면 의도적인 제외인지 누락인지 명시했는가?
- [ ] Public Detail Page라면 Supplier-Buyer 직접 연결이 금지된 콘텐츠에 Admin Brokerage Notice가 포함되어 있는가?
- [ ] List/Table류 화면이라면 Status Badge 색상이 `03-state-machine.md`의 UI Badge Color와 일치하는가?
- [ ] 삭제 기능이 있다면 Soft Delete를 기본으로 하는가? Hard Delete라면 보안 즉시 제거 대상에 해당하는 합당한 이유가 있는가?
- [ ] 3장의 공통 UI 규칙(컴포넌트/번역/이모지/Dialog/Audit/Mobile)을 모두 만족하는가?
- [ ] Message/Notification Page라면 2.6/2.7의 전용 골격과 Experience Standard 1~2장의 기능 요건(읽음/검색/필터 등)을 모두 포함하는가?

---

*본 문서는 코드를 포함하지 않는다. 실제 컴포넌트 구현은 UI Design System Engine의 Component Library Module을 통해 Codex가 수행한다.*

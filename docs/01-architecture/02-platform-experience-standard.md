# B2BB2G V2 — Platform Experience Standard

> 문서 상태: Draft v1 (작성일 2026-06-28)
> 문서 유형: Architecture Source of Truth (보완 문서)
> 선행 문서: `docs/01-architecture/01-platform-engine-module-plugin.md`

## 0. 문서 목적과 위치

`01-platform-engine-module-plugin.md`(이하 "Engine 문서")는 **어떤 기능이 어떤 Engine/Module/Plugin에 속하는가**를 정의한다.

본 문서는 그 반대를 다룬다. 본 문서는 특정 Engine을 정의하지 않는다. 대신 **모든 Engine이 화면과 상호작용을 구현할 때 예외 없이 따라야 하는 공통 UX/운영 규약(Behavior Contract)**을 정의한다.

### 0.1 우선순위

- 기능/도메인/권한 구조 판단: Engine 문서가 1차 기준이다.
- 화면 동작, 상호작용 패턴, 알림/메시지/게시판/캘린더/다이얼로그/업로드/검색/목록/모바일/대시보드/감사/빌더 공통 규칙: 본 문서가 1차 기준이다.
- 두 문서가 충돌하면, "무엇을 하는가"는 Engine 문서를 따르고 "어떻게 동작하는가"는 본 문서를 따른다.
- UI/Layout/Navigation의 화면별 세부 구조는 `/DESIGN.md`를 따른다. 본 문서는 화면별 구조가 아니라 화면을 가로지르는 공통 패턴을 규정한다.

### 0.2 표준 ↔ Engine 매핑 (참고)

아래 표는 각 표준이 주로 어떤 Engine/Module과 연동되는지 보여주는 참고 자료다. 데이터 소유권 자체는 Engine 문서를 따른다.

| 표준 | 주요 연동 Engine/Module |
|---|---|
| Notification Standard | Communication Engine (Notification Module), UI Design System Engine (Toast Notification Plugin) |
| Message Standard | Communication Engine (Conversation/Message/Attachment Module), Trade Brokerage Engine (Supplier-Buyer 중개) |
| Common Board System | Admin Control Engine (콘텐츠 운영), Landing Page Builder Engine (Popup/Banner 소비), 각 콘텐츠 출처 Engine |
| Calendar System | Event Engine, Organization Engine, Student Growth Engine, Identity Engine (Personal Schedule, Future) |
| Dialog Standard | UI Design System Engine (Modal/Toast Plugin), Admin Control Engine (Audit Log Module) |
| File Upload Standard | 사용처별 도메인 Engine (Company Microsite/Marketplace/Thailand FDA Service/Communication 등) |
| Search Standard | UI Design System Engine (Input/Select Plugin), Marketplace Engine (Search Module) |
| List Standard | UI Design System Engine (Table UI/Card UI Module) |
| Mobile UX Standard | UI Design System Engine (Mobile Bottom Navigation/Sticky Action Plugin) |
| Dashboard Standard | UI Design System Engine (Dashboard UI Module), Analytics Engine |
| Audit Standard | Admin Control Engine (Audit Log Module) |
| Builder Standard | Landing Page Builder Engine, UI Design System Engine (Component Library Module) |

---

## 1. Notification Standard

**목적:** 모든 Role(Supplier/Buyer/Agent/Professor/Student/Administrator)은 동일한 Notification 동작 규약을 공유한다.

### 1.1 Notification Type

| Type | 설명 | 연동 |
|---|---|---|
| Toast Notification | 화면 내 일시적 알림 | 6장 Dialog Standard의 Success Toast와 동일 컴포넌트 |
| Inbox Notification | 알림 보관함에 누적되는 알림 | Communication Engine (Notification Module) |
| System Notification | 플랫폼 운영 공지/점검 안내 | Communication Engine (Announcement Module) |
| Approval Notification | 승인/반려 처리 결과 알림 | Approval Engine |
| Message Notification | 새 메시지 수신 알림 | 2장 Message Standard |
| Event Notification | 행사 등록/참가/승인 알림 | Event Engine |
| Badge Notification | Badge 부여/회수 알림 | Trust Engine |
| Membership Notification | 플랜 변경/만료 알림 | Supplier Membership Engine |

### 1.2 필수 기능

- 읽음 / 안읽음
- 전체 읽음
- 삭제 / 전체 삭제
- 중요 표시 (Pin)
- 검색
- 필터 (Type별, 읽음 상태별)
- 날짜별 정렬
- 무한스크롤 또는 페이지네이션 (디바이스별로 선택, 10장 Mobile UX Standard 참조)

### 1.3 정책

- 모든 Notification은 발생 시점에 Type, 발생 Engine, 대상 Account, 읽음 상태를 함께 기록한다.
- Toast Notification은 일시적 표시 후 자동으로 Inbox Notification에 누적된다. Toast는 Inbox의 "방금 발생" 표현 형태일 뿐, 별도 저장소를 두지 않는다.
- Admin이 발송하는 System Notification/공지는 Communication Engine의 Announcement Module을 통해 생성하고, 본 표준의 Notification UI로 노출한다.
- Notification 데이터의 소유는 Communication Engine이며, UI 렌더링은 UI Design System Engine의 Toast Notification Plugin을 사용한다.

---

## 2. Message Standard

**목적:** Communication Engine 위에서 모든 Role의 메시지 UX가 동일한 구조를 갖는다.

### 2.1 공통 폴더 구조

- Inbox
- Sent
- Archive
- Trash

### 2.2 공통 기능

- Attachment (Communication Engine의 Attachment Module 사용, 7장 File Upload Standard 준수)
- Read Status
- Typing Indicator (Future)
- Online Status (Future)

### 2.3 Role별 메시지 정책

| 관계 | 허용 여부 | 비고 |
|---|---|---|
| Agent ↔ Buyer | 직접 허용 | Organization Engine의 소속 관계 기준 |
| Professor ↔ Student | 직접 허용 | Organization Engine의 소속 관계 기준 |
| Admin ↔ All | 직접 허용 | 전체 열람/차단 권한 포함 |
| Supplier ↔ Buyer | Admin Brokerage 경유 | 기본적으로 직접 대화 불가, Trade Brokerage Engine이 중개 |

> 본 표는 Engine 문서 4.9 Communication Engine 정책과 동일하다. 본 문서는 이를 Inbox/Sent/Archive/Trash라는 **공통 UI 구조**로 재확인한다.

---

## 3. Common Board System

**목적:** 게시판형 콘텐츠를 Engine마다 따로 만들지 않고 공통 Board Module로 통일한다.

### 3.1 지원 Board

| Board | 용도 |
|---|---|
| Notice | 공지사항 |
| FAQ | 자주 묻는 질문 |
| Gallery | 이미지 갤러리 |
| News | 뉴스/보도자료 |
| Event | 행사 안내 (Event Engine 데이터 연동) |
| Download | 자료실 |
| Promotion | 프로모션 콘텐츠 |
| Success Story | 성공 사례 |
| Market Insight | 시장 인사이트/리포트 |
| Video | 영상 콘텐츠 |
| Popup | 팝업 (Landing Page Builder Engine의 Popup Module과 연동) |
| Banner | 배너 (Landing Page Builder Engine의 Banner Module과 연동) |

### 3.2 게시판 타입 (Render Type)

- List
- Gallery
- Card
- Calendar

### 3.3 정책

- 모든 Board는 동일한 공통 Board Module을 사용하며, `board_type`으로 구분한다. 신규 게시판 유형이 필요할 때 새 테이블을 만들지 않고 `board_type`을 추가한다.
- Popup/Banner Board는 Landing Page Builder Engine이 소비하는 콘텐츠 후보가 될 수 있다. Board Module이 콘텐츠를 소유하고, Landing Page Builder Engine이 그중 노출할 항목과 순서를 결정한다 (Engine 문서 5.4의 Exposure Engine ↔ Landing Page Builder Engine 관계와 동일한 패턴).
- 모든 Board 콘텐츠는 관리자 승인 후 공개한다 (Engine 문서 2.3 공통 규칙 10번).
- Board 콘텐츠가 특정 도메인에서 파생되는 경우(예: Success Story가 Student Showcase 기반인 경우) 해당 콘텐츠는 출처 Engine(Student Growth Engine)과 연동하며, Board Module은 "어떻게 보여줄지"만 책임진다.
- Board의 Engine 소속(예: 신설 Module 여부)은 본 문서에서 확정하지 않으며, 후속 ERD 작성 단계에서 결정한다.

---

## 4. Calendar System

**목적:** 일정성 콘텐츠를 공통 Calendar Module로 관리한다.

### 4.1 지원 Calendar

| Calendar | 용도 | 연동 Engine |
|---|---|---|
| Event Calendar | 무역행사/세미나 일정 | Event Engine |
| Academic Calendar | 대학교 학사 일정 (Student/Professor 대상) | Organization Engine, Student Growth Engine |
| Trade Fair Calendar | 박람회 일정 | Event Engine |
| Personal Schedule (Future) | 개인 일정 | Identity Engine (Account 단위) |

### 4.2 정책

- Calendar Module은 날짜 기반 콘텐츠를 통합 렌더링하는 공통 UI/조회 패턴이며, 일정 데이터의 소유는 각 연동 Engine에 있다 (Calendar Module은 집계 뷰).
- 모든 Calendar 항목은 List 뷰로도 동시에 제공할 수 있어야 한다 (8장 List Standard와 호환).

---

## 5. Dialog Standard

**목적:** 모든 사용자 행동은 동일한 3단계 Dialog 흐름을 가진다.

### 5.1 표준 흐름

```
Confirmation Dialog → Action 실행 → Success Toast → Audit Log
```

### 5.2 행동별 문구 매핑 (Admin UI 한국어 기준 예시)

| 행동 | Confirmation 문구 | Success 문구 |
|---|---|---|
| Save | 저장하시겠습니까? | 저장되었습니다. |
| Delete | 삭제하시겠습니까? | 삭제되었습니다. |
| Approve | 승인하시겠습니까? | 승인되었습니다. |
| Reject | 반려하시겠습니까? | 반려되었습니다. |
| Publish | 게시하시겠습니까? | 게시되었습니다. |
| Role Change | 권한을 변경하시겠습니까? | 변경되었습니다. |

### 5.3 정책

- 모든 CRUD 작업(Create/Update/Delete)과 상태 전환(승인/반려/게시/권한변경 등)은 위 흐름을 예외 없이 따른다.
- Confirmation Dialog 없이 즉시 실행되는 파괴적 행동(삭제, 권한변경, 공개전환 등)을 만들지 않는다.
- 문구는 Translation Key 기반으로 관리한다. 위 표는 Admin UI(한국어 기본) 예시이며, Public/Dashboard UI는 English Translation Key를 사용한다.
- Success Toast 이후 Audit Log 기록은 같은 처리 흐름(Server Action) 안에서 처리하며, Toast만 보여주고 Audit Log를 누락하지 않는다 (11장 Audit Standard 참조).
- Dialog/Toast UI 구현은 UI Design System Engine의 Modal Plugin/Toast Notification Plugin을 사용한다.

---

## 6. File Upload Standard

**목적:** 모든 업로드 화면이 동일한 동작과 제약을 가진다.

### 6.1 지원 파일 형식

- Image
- PDF
- Video Link (파일 업로드가 아닌 외부 링크 등록)
- ZIP
- Excel
- Word

### 6.2 필수 기능

- Drag & Drop
- Progress
- Preview
- Replace
- Delete
- Version (변경 이력 보존)
- Download

### 6.3 정책

- 업로드 가능 형식/용량 제한은 사용처(예: Company Microsite Engine의 Certificate Module, Marketplace Engine의 Product Document Plugin, Thailand FDA Service Engine의 Document Module)별로 다르게 설정할 수 있으나, 위 7개 기능은 모든 업로드 화면에서 공통으로 제공한다.
- 파일 메타데이터는 공통 파일 테이블에 저장하고, 접근 권한은 업로드 주체의 Engine/Module 권한을 따른다.
- Version 기능은 최소한 "이전 파일 교체 시 이력 보존" 수준으로 구현한다. 전체 버전 비교 UI는 MVP 범위가 아니다.

---

## 7. Search Standard

**목적:** 모든 화면의 검색 UX를 통일한다.

### 7.1 지원 검색/필터 축

- Keyword
- Filter
- Country
- Industry
- Category
- Status
- Badge
- Date
- Sort

### 7.2 정책

- 모든 목록형 화면(8장 List Standard 대상)은 위 9개 축 중 해당 도메인에 의미 있는 축만 선택적으로 노출하되, UI 패턴(검색창 위치, 필터 칩, 정렬 드롭다운)은 동일하게 유지한다.
- 검색/필터 UI 구현은 UI Design System Engine의 Input/Select Plugin을 사용한다.
- 검색 결과는 8장 List Standard의 4가지 표시 방식(Grid/Table/Card/Gallery)과 함께 동작해야 한다.

---

## 8. List Standard

**목적:** 모든 목록 화면의 표시/조작 방식을 통일한다.

### 8.1 지원 표시 방식

- Grid
- Table
- Card
- Gallery

### 8.2 공통 기능

- Sort
- Filter (7장 Search Standard와 연동)
- Bulk Action
- Export
- Pagination
- Infinite Scroll

### 8.3 정책

- 한 화면은 표시 방식 중 하나를 기본으로 하되, 가능한 경우 표시 방식 전환 토글을 제공할 수 있다.
- Bulk Action은 Admin Dashboard에서 우선 지원하며, Role Dashboard에서는 필요한 경우에만 제한적으로 적용한다 (예: Buyer의 Saved Products 다중 삭제).
- Pagination과 Infinite Scroll 중 선택은 디바이스 기준으로 결정한다 (Mobile은 Infinite Scroll 우선, 10장 Mobile UX Standard 참조).

---

## 9. Mobile UX Standard

**목적:** 모든 화면은 Mobile First로 설계한다.

### 9.1 공통 패턴

- Sticky Bottom Action
- Bottom Navigation
- Floating Action Button
- Swipe
- Pull To Refresh

### 9.2 정책

- 모든 신규 화면은 Mobile 레이아웃을 1차 기준으로 설계하고 Desktop을 확장한다.
- Bottom Navigation은 Role Dashboard의 주요 1뎁스 메뉴만 노출한다 (5개 이하 권장).
- Sticky Bottom Action은 5장 Dialog Standard의 Save/Publish 등 주요 행동과 함께 사용한다.
- 본 표준은 UI Design System Engine의 Mobile Bottom Navigation Plugin/Sticky Action Plugin으로 구현한다.

---

## 10. Dashboard Standard

**목적:** 모든 Role Dashboard가 동일한 공통 블록을 공유한다.

### 10.1 공통 블록

- KPI
- Recent Activity
- Notifications (1장 Notification Standard 연동)
- Quick Actions
- Calendar (4장 Calendar System 연동)
- Message (2장 Message Standard 연동)
- Analytics

### 10.2 정책

- Role별로 다른 것은 "콘텐츠"이며, 위 7개 블록의 존재 여부와 배치는 모든 Dashboard가 동일한 틀을 유지한다.
- 데이터는 각 블록이 연동하는 Engine(KPI/Analytics → Analytics Engine, Notification → Communication Engine 등)에서 가져온다.
- 본 표준은 Engine 문서 4.18의 Role-Based Dashboard IA(Role별 구성 요소 목록)를 담는 공통 레이아웃 규칙이다. 즉 Engine 문서 4.18은 "Role마다 무엇이 보이는가"를 정의하고, 본 표준은 "그 모든 것이 어떤 공통 블록 구조 안에 배치되는가"를 정의한다.

---

## 11. Audit Standard

**목적:** 운영상 의미 있는 모든 변경에 Audit Log를 남긴다.

### 11.1 Audit 대상 행동

- 저장 (Save/Create/Update)
- 삭제 (Delete)
- 승인 (Approve)
- 반려 (Reject)
- 노출 (Publish/Visibility 변경)
- 권한변경 (Role Change)

### 11.2 정책

- 5장 Dialog Standard의 표준 흐름(Confirmation → Action → Success Toast → Audit Log)의 마지막 단계가 본 표준이다.
- Audit Log는 actor(누가), action(무엇을), target(무엇에), before/after(변경 전후 값), timestamp를 포함한다.
- Audit Log 데이터의 소유는 Admin Control Engine의 Audit Log Module이며, 기록 포맷은 Engine 문서 9.3의 `<Engine>.<Module>.<Action>` 네이밍을 따른다.
- Audit Log는 절대 조용히 누락되지 않는다. 누락 시 해당 기능은 "완료"로 간주하지 않는다.

---

## 12. Builder Standard

**목적:** Landing Page Builder Engine뿐 아니라 향후 등장할 모든 Builder형 기능이 동일한 구조 단위를 공유한다.

### 12.1 공통 구성 단위

- Section
- Widget
- Component

### 12.2 확장 대상

- Landing Builder (현재 구현 대상, Engine 문서 4.19 참조)
- Dashboard Builder (Future)
- Company Builder (Future)
- Page Builder (Future)

### 12.3 정책

- 모든 Builder는 Section → Widget → Component 3단계 구조로 구성한다.
- Component는 UI Design System Engine의 Component Library Module에서만 가져온다. Builder가 독자적인 Component를 만들지 않는다.
- Section/Widget의 순서, 노출, 예약은 Landing Page Builder Engine의 Section Order/Visibility/Scheduling Module과 동일한 패턴을 재사용한다. 신규 Builder마다 별도의 순서/노출 로직을 재구현하지 않는다.
- 향후 Builder가 늘어나면 Builder 공통 로직(Preview/Publish Workflow/Rollback)을 별도의 공유 모듈로 일반화하는 것을 고려한다. 현재 문서 범위에서는 Landing Page Builder Engine 안에 유지한다.

---

## 13. UX Principle

플랫폼 전체가 따르는 원칙:

1. **Consistency First** — 동일한 패턴은 모든 화면에서 동일하게 동작한다.
2. **Predictability** — 사용자는 행동의 결과를 행동 전에 예측할 수 있어야 한다.
3. **Minimal Click** — 목표 행동까지의 클릭 수를 최소화한다.
4. **Role Based UX** — 모든 화면은 Role 기준으로 콘텐츠와 권한이 달라진다.
5. **Admin Controlled** — 공개 노출과 주요 정책 전환은 Admin이 통제한다.
6. **Translation Key** — 모든 문구는 Translation Key 기반으로 관리한다.
7. **No Hardcoded Text** — 화면에 직접 문자열을 박지 않는다.
8. **No Emoji** — UI 문구에 이모지를 사용하지 않는다.

> 이 원칙은 Engine 문서 2.3 Cross-Engine 공통 규칙, 4.18 UI Design System Engine 정책과 동일선상에 있다. 본 문서에서는 이를 "UX 차원의 8대 원칙"으로 명시적으로 재확인한다.

---

## 14. Future Ready

향후 확장 가능성을 열어두는 항목 (MVP 범위 아님):

- Dashboard Builder
- Workflow Builder
- Email Template Builder
- Notification Template Builder
- Form Builder
- Report Builder
- Survey Builder

### 정책

- 위 Builder류는 모두 12장 Builder Standard의 Section/Widget/Component 구조를 재사용하는 것을 전제로 설계한다.
- 현재 단계에서는 신규 테이블/Engine을 만들지 않고, Engine 문서 7장 Future Scope의 연장으로만 기록한다.

---

## 15. Platform Experience Checklist

Codex가 화면/기능을 구현할 때마다 반드시 확인해야 하는 체크리스트.

- [ ] 이 화면에서 발생하는 사용자 행동에 Notification Standard의 8가지 Type 중 해당하는 알림이 연결되어 있는가?
- [ ] 메시지 기능이 있다면 Inbox/Sent/Archive/Trash 구조와 Role별 메시지 정책(2.3)을 따르는가?
- [ ] 게시판형 콘텐츠를 별도 테이블/화면으로 새로 만들지 않고 공통 Board Module을 사용하는가?
- [ ] 일정 콘텐츠가 있다면 공통 Calendar Module과 연동되는가?
- [ ] 모든 Save/Delete/Approve/Reject/Publish/Role Change 행동에 Confirmation Dialog → Success Toast → Audit Log 흐름이 적용되어 있는가?
- [ ] 파일 업로드가 있다면 Drag & Drop/Progress/Preview/Replace/Delete/Version/Download 7개 기능이 모두 제공되는가?
- [ ] 검색/필터가 있다면 Search Standard의 9개 축 중 해당 도메인에 맞는 축이 일관된 UI 패턴으로 제공되는가?
- [ ] 목록 화면이 Grid/Table/Card/Gallery 중 적절한 표시 방식과 Sort/Filter/Bulk Action/Export/Pagination(또는 Infinite Scroll)을 지원하는가?
- [ ] 이 화면은 Mobile 레이아웃을 1차 기준으로 설계했는가? Sticky Bottom Action/Bottom Navigation/FAB/Swipe/Pull To Refresh 중 필요한 패턴이 적용되었는가?
- [ ] Dashboard 화면이라면 KPI/Recent Activity/Notifications/Quick Actions/Calendar/Message/Analytics 7개 공통 블록 구조를 따르는가?
- [ ] 이 변경이 Audit Log에 누락 없이 기록되는가?
- [ ] Builder형 기능이라면 Section/Widget/Component 구조와 UI Design System Engine의 Component Library만 사용하는가?
- [ ] UX Principle 8개 항목(Consistency First ~ No Emoji)을 위반하지 않는가?
- [ ] 새로운 컴포넌트가 필요한가? 그렇다면 화면에서 일회성으로 만들지 않고 UI Design System Engine의 Component Library Module에 먼저 등록했는가?

---

*본 문서는 코드를 포함하지 않는다. 구현은 `01-platform-engine-module-plugin.md` 10장의 절차를 거친 후 Codex가 별도로 수행한다.*

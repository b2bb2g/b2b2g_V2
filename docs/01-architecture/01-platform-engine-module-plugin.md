# B2BB2G V2 — Platform / Engine / Module / Plugin Architecture

> 문서 상태: Draft v1 (작성일 2026-06-28)
> 문서 유형: Architecture Source of Truth
> 작성 범위: 문서화 전용. 본 문서는 코드를 작성하지 않으며, 이후 Codex가 구현 단계에서 본 문서를 1차 기준으로 사용한다.
> 우선순위 선언: 기능/도메인/권한 구조 판단에 한해 본 문서가 기존 `docs/01-plan`, `docs/02-design`, `docs/03-analysis` 산출물보다 우선한다. 기존 코드(`app/`, `components/`, `lib/`, `supabase/migrations`)는 구현 참고 자료로만 사용하고, 본 문서와 충돌하는 경우 본 문서를 따른다. 단, 코딩 규칙·디렉터리 컨벤션·언어 정책은 `AGENTS.md`를, UI/Layout/Navigation 판단은 `/DESIGN.md`를 그대로 따른다 (자세한 우선순위는 9장 참조).

### 문서 지도 (Document Map)

본 문서는 `Platform → Experience → Engine → Module → Plugin` 구조의 **Engine 계층**을 정의한다. 전체 문서 체계는 아래와 같다.

| 문서 | 계층 | 내용 |
|---|---|---|
| **01-platform-engine-module-plugin.md** (본 문서) | Engine | Engine/Module/Plugin 정의 |
| [02-platform-experience-standard.md](02-platform-experience-standard.md) | Experience | 전체 Engine 공통 UX/운영 규약 |
| [../02-experience/01-user-journey.md](../02-experience/01-user-journey.md) | Experience | Role별 가입~종료 여정 |
| [../02-experience/02-workflow-standard.md](../02-experience/02-workflow-standard.md) | Experience | Journey의 절차(Workflow) 구체화 |
| [../02-experience/03-state-machine.md](../02-experience/03-state-machine.md) | Experience | Workflow의 상태값(State) 구체화 |
| [../02-experience/04-sub-page-ui-standard.md](../02-experience/04-sub-page-ui-standard.md) | Experience | 페이지 단위 UI 골격 |
| [../07-implementation/00-existing-code-reuse-policy.md](../07-implementation/00-existing-code-reuse-policy.md) | Implementation | 기존 코드 재사용/리팩터링/교체/보류 기준 |

---

## 1. Platform Overview

### 1.1 Platform 정의

B2BB2G는 단순 B2B 쇼핑몰이 아니다.

B2BB2G는 한국 공급자 기업(Supplier), 해외 바이어(Buyer), 해외 에이전트(Agent), 대학교 담당교수(Professor), 학생(Student), 관리자(Administrator)를 하나의 신뢰 기반 네트워크로 연결하는 **글로벌 무역 운영 플랫폼(Global Trade Operation Platform)**이다.

플랫폼의 가치는 "거래 중개"가 아니라 "관계와 신뢰의 운영"에 있다. 모든 연결은 관리자(Administrator)가 통제하는 승인·중개 절차를 통과해야 하며, 이 통제 구조가 플랫폼의 핵심 경쟁력이다.

### 1.2 핵심 운영 방향

1. 한국 Supplier의 제품과 회사 정보를 글로벌 Buyer에게 노출한다.
2. 해외 Agent가 Buyer를 유치하고, 유치한 Buyer를 직접 관리한다.
3. Buyer는 제품, 회사, Buy Request를 열람하고 문의한다.
4. 모든 Buyer-Supplier 문의는 관리자 중개형(Admin Brokerage)으로 처리한다.
5. Buyer의 개인정보(이메일, 전화번호, 상세 문의내용)는 플랫폼 핵심 자산이며, Supplier에게 직접 노출하지 않는다.
6. 대학교 Professor는 하부 Student를 관리하고 활동내역을 확인한다.
7. Student는 제품을 직접 등록하지 않고, 승인된 Supplier 제품을 선택해 Showcase를 구성하는 "Global Trade Ambassador"로 활동한다.
8. Supplier는 미니 회사 홈페이지(Company Microsite)와 제품 카탈로그를 가진다.
9. Trust Badge, Verification, Company Score를 통해 신뢰 기반 네트워크를 구성한다.

### 1.3 Core User Types

B2BB2G의 사용자 모델은 **Account(계정)**와 **Role(역할)**을 분리한다. 하나의 Account는 여러 Role을 동시에 가질 수 있다 (예: Supplier 회사 직원이 동시에 Buyer로 활동하는 경우).

| User Type | 가입 경로 | 승인 방식 | 핵심 권한 | 타 역할 개인정보 접근 |
|---|---|---|---|---|
| **Account** | 이메일 가입 | 즉시 (이메일 인증 후) | 모든 Role의 기반. 단독으로는 비즈니스 권한 없음 | - |
| **Supplier** | 직접 가입 + 관리자 승인 | Admin 승인 필요 | 제품/산업설비/EPC/SELL 등록, 미니 홈페이지 운영, 무료/유료 회원 구분 | Buyer 개인정보 접근 불가 |
| **Buyer** | 기본: Agent 추천링크. 관리자 설정으로 직접가입 ON/OFF 가능 | 가입 즉시 또는 Admin 승인 (정책에 따름) | 로그인 후 상세글 열람, 제품 문의, Buy Request 등록 | 자신의 정보는 Agent에게 제한적 요약만 노출 |
| **Agent** | 신청 후 Admin 승인, 또는 Admin이 직접 초대 | Admin 승인 필수 (승인 전 Agent 기능 사용 불가) | 승인 후 Buyer 초대링크/QR 발급, 하부 Buyer 관리 및 직접 메시지 | 하부 Buyer의 제한된 요약 정보만 |
| **Professor** | 원칙적으로 Admin이 미팅 후 직접 초대 (공개 신청 비중심) | Admin 승인 필수 | 승인 후 Student 초대링크/QR 발급, 하부 Student 개인정보·학교·학과·연락처·활동내역 전체 확인, 직접 메시지 | 하부 Student의 전체 정보 |
| **Student** | Professor 추천링크 또는 QR | Professor 초대 기반 (가입 시 승인 절차 간소화 가능) | Showcase 구성(제품 직접 등록 불가), Market Research, Event Support, Translation Support, Global Trade Passport/Badge/Career Rank 보유 | 본인 정보만, 타인 접근 불가 |
| **Administrator** | 시스템 관리자 계정 | - | 전체 회원/역할/승인/검증/배지/문의/노출/설정/로그 통제 | 전체 접근 |

> Career Rank(예: Global Trade Ambassador, Global Trade Associate 등)는 권한이 아니라 성장 등급이며 Member Type(Role)과는 분리된 축으로 관리한다.

---

## 2. Architecture Principle

### 2.1 Platform / Engine / Module / Plugin 정의

본 아키텍처는 4단계 계층으로 모든 기능을 분류한다.

| 계층 | 정의 | 특징 |
|---|---|---|
| **Platform** | B2BB2G 서비스 전체를 담는 최상위 컨테이너 | 모든 Engine을 포함하며 그 자체로는 기능을 직접 구현하지 않는다 |
| **Engine** | 플랫폼의 핵심 도메인 책임 단위 | 독립된 데이터 모델, 정책, UI 표면(화면/대시보드 영역)을 가진다. 다른 Engine과 명시적 의존 관계를 통해서만 연결된다 (5장 참조) |
| **Module** | Engine 내부의 기능 단위 | 특정 데이터/유스케이스 묶음을 처리한다. Module은 반드시 하나의 Engine에 속하며 단독으로 존재할 수 없다 |
| **Plugin** | Module 위에 추가되는 선택적/확장적 동작 | On/Off 가능하거나 조건부로 동작한다. 정책(Policy), 변형(Variant), 확장(Extension), 토글(Toggle) 성격을 가지며 Module의 핵심 동작 자체를 바꾸지 않는다 |

### 2.2 설계 원칙

1. 모든 기능은 정확히 하나의 Engine에 속한다. Engine에 속하지 않는 "고아 기능"을 만들지 않는다.
2. Module은 Engine의 핵심 책임(필수 동작)을 구현하고, Plugin은 확장·정책·예외·On/Off 동작을 구현한다.
3. Plugin은 자신이 속한 Module 없이 독립적으로 존재할 수 없다.
4. Engine 간 데이터 접근은 5장에서 정의한 의존 관계를 통해서만 이루어진다. 암묵적/우회 접근을 설계하지 않는다.
5. **Approval Engine**과 **Admin Control Engine**은 모든 도메인 Engine에 대해 횡단 권한(Cross-cutting Authority)을 가진다.
6. **Analytics Engine**은 모든 Engine을 읽기 전용으로 관찰하는 옵저버다. 다른 Engine의 동작에 영향을 주지 않는다.
7. 신뢰·인증·배지는 **Trust Engine**에서 통합 관리한다. 개별 Engine은 자체 배지/인증 로직을 따로 만들지 않고 Trust Engine을 참조한다.
8. 각 Role별 Dashboard UX는 Role 단위로 별도 설계한다 (Supplier/Buyer/Agent/Professor/Student/Admin Dashboard는 서로 다른 화면 구조를 가진다).

### 2.3 Cross-Engine 공통 규칙

아래 규칙은 모든 Engine 설계와 구현에 예외 없이 적용한다.

1. Account와 Role은 분리한다.
2. 하나의 Account는 여러 Role을 가질 수 있다.
3. Agent와 Professor는 일반 가입이 아니라 승인형 Role이다.
4. Professor는 관리자 초대 중심으로 운영한다.
5. Agent는 신청은 가능하지만, 관리자 승인 전에는 Agent 기능을 사용할 수 없다.
6. Buyer는 기본적으로 Agent 링크를 통해 가입한다.
7. Student는 Professor 링크 또는 QR을 통해 가입한다.
8. Supplier-Buyer 직접 연락은 기본적으로 금지한다.
9. Buyer 개인정보는 플랫폼 핵심 자산으로 보호한다.
10. 모든 외부 공개 콘텐츠는 관리자 승인 후에만 노출한다.
11. 무료/유료 Supplier의 차이는 기능, 노출, 응답 권한에서 발생한다.
12. 유료 Supplier라도 Buyer의 이메일/전화번호는 기본적으로 비공개다.
13. Badge와 Verification은 Trust Engine에서 통합 관리한다.
14. 모든 사용자별 Dashboard UX는 Role별로 별도 설계한다.
15. 모든 기능은 Engine → Module → Plugin 기준으로 분리하여 설계·구현한다.
16. 모든 UI 구현은 UI Design System Engine의 Design Token과 Component Library를 사용한다. 메인 랜딩페이지와 주요 공개 페이지의 구성(Hero/Section/Featured/Banner/Popup)은 Landing Page Builder Engine을 통해서만 관리한다.

---

## 3. Engine List

B2BB2G V2는 아래 19개 Engine으로 구성한다.

| # | Engine | 한 줄 역할 |
|---|---|---|
| 1 | Identity Engine | Account 생성, 로그인, 프로필, 다중 Role 관리 |
| 2 | Invitation Engine | Agent/Professor/Student/Buyer 초대링크 및 QR 관리 |
| 3 | Organization Engine | Agent-Buyer, Professor-Student, Company-User 관계 관리 |
| 4 | Supplier Membership Engine | Supplier 무료/유료 회원 구분 및 권한·노출 제어 |
| 5 | Company Microsite Engine | Supplier별 미니 회사 홈페이지 제공 |
| 6 | Marketplace Engine | 제품/산업설비/EPC/SELL 상품/Buy Request 콘텐츠 관리 |
| 7 | Buy Request Engine | Buy Request 열람 정책 및 Supplier 응답 워크플로우 관리 |
| 8 | Trade Brokerage Engine | Buyer-Supplier 간 관리자 중개형 문의·제안서 처리 |
| 9 | Communication Engine | 역할별 허용된 메시지·알림·공지 관리 |
| 10 | Approval Engine | 모든 승인 프로세스 통제 |
| 11 | Trust Engine | 인증, 배지, 등급, 점수, 랭킹 관리 |
| 12 | Student Growth Engine | 학생의 글로벌 무역 활동 및 성장 관리 |
| 13 | Exposure Engine | 메인 랜딩, Featured, 추천 노출 관리 |
| 14 | Event Engine | 무역 행사, 대학교 행사, 세미나 관리 |
| 15 | Thailand FDA Service Engine | 태국 식약청 인허가 서비스 관리 |
| 16 | Admin Control Engine | 플랫폼 전체 운영 통제 |
| 17 | Analytics Engine | 플랫폼 데이터와 성과 분석 |
| 18 | UI Design System Engine | Public/Dashboard/Admin/Microsite/Landing 전체 UI 일관성, 디자인 토큰, 컴포넌트 규칙 통제 |
| 19 | Landing Page Builder Engine | 메인 랜딩페이지 및 주요 공개 페이지의 Hero/Section/Featured/Banner/Popup을 관리자가 직접 구성 |

---

## 4. Engine → Module → Plugin Structure

### 4.1 Identity Engine

**역할:** Account 생성, 로그인, 프로필 관리, 다중 Role 관리를 담당하는 플랫폼의 기반 Engine.

**Modules**

| Module | 설명 |
|---|---|
| Account Module | 이메일 기반 Account 생성/조회/비활성화. 모든 Role의 상위 식별자 |
| Profile Module | 이름, 연락처, 국가, 회사 소속 등 공통 프로필 정보 관리 |
| Role Module | Account에 부여된 Role(Supplier/Buyer/Agent/Professor/Student/Administrator) 목록 관리 |
| Session Module | 로그인 세션, 토큰, 다중 디바이스 세션 관리 |
| Role Switch Module | 한 Account가 보유한 여러 Role 간 Dashboard 전환 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Email Verification Plugin | 이메일 인증 발송/확인 |
| Password Reset Plugin | 비밀번호 재설정 플로우 |
| Role Request Plugin | Account가 신규 Role(예: Agent)을 신청하는 요청 생성 |
| Role Approval Status Plugin | 신청한 Role의 승인 대기/승인/반려 상태 표시 |

---

### 4.2 Invitation Engine

**역할:** Agent, Professor, Student, Buyer 초대링크 및 QR 발급·추적을 담당.

**Modules**

| Module | 설명 |
|---|---|
| Invitation Code Module | 초대 코드 생성, 유효성 검증 |
| Referral Link Module | 초대 코드 기반 추천 링크 생성 (예: `/signup?ref=CODE`) |
| QR Code Module | 초대 링크의 QR 이미지 생성 |
| Invitation Tracking Module | 초대 클릭/가입 전환 추적 |
| Invitation Expiry Module | 초대 코드 유효기간 관리 및 만료 처리 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Agent Invitation Plugin | Agent 신청 승인 후 Agent 본인의 Buyer 초대링크/QR 발급 |
| Professor Invitation Plugin | Admin이 Professor에게 발송하는 초대장 처리 |
| Student Invitation Plugin | 승인된 Professor의 Student 초대링크/QR 발급 |
| Buyer Invitation Plugin | 승인된 Agent의 Buyer 초대링크/QR 발급 |
| Admin Manual Invitation Plugin | Admin이 특정 Account에게 직접 초대장(어떤 Role이든)을 발송 |

**정책**

- Agent는 신청 가능 + 관리자 초대 가능(둘 다 지원).
- Professor는 관리자 초대 중심으로 운영하고 공개 신청 경로는 두지 않는다.
- Student는 Professor의 Referral Link/QR 기반으로만 가입한다.
- Buyer는 Agent의 Referral Link 기반으로 가입한다.
- Buyer 직접가입(Agent 링크 없이 가입)은 Admin Control Engine의 **Buyer Direct Signup Toggle**로 ON/OFF한다.

---

### 4.3 Organization Engine

**역할:** Agent-Buyer, Professor-Student, Company-User 간의 소속/관리 관계를 관리.

**Modules**

| Module | 설명 |
|---|---|
| Agent Network Module | 특정 Agent에 소속된 Buyer 목록 및 배정 국가 관리 |
| Buyer Network Module | Buyer가 소속된 Agent 정보 및 상위/하위 Buyer(추천 트리) 관리 |
| Professor Network Module | 특정 Professor에 소속된 Student 목록 관리 |
| Student Network Module | Student가 소속된 Professor 정보 관리 |
| Company Member Module | Supplier 회사(Company)에 소속된 직원 Account 관리 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Agent Buyer Tree Plugin | Agent-Buyer 소속 트리 시각화 및 조회 |
| Professor Student Tree Plugin | Professor-Student 소속 트리 시각화 및 조회 |
| Graduate Transition Plugin | Student 졸업 시 Alumni/Global Trade Associate로 소속 전환 |
| Organization Permission Plugin | 소속 관계 기반 데이터 접근 범위(예: Agent는 자신의 하부 Buyer만) 계산 |

---

### 4.4 Supplier Membership Engine

**역할:** Supplier의 무료/유료 회원 구분과 그에 따른 권한·노출 범위를 제어.

**Modules**

| Module | 설명 |
|---|---|
| Supplier Plan Module | Supplier가 가입한 플랜(Free/Premium/Enterprise) 정의 |
| Subscription Status Module | 플랜의 활성/만료/정지 상태 관리 |
| Premium Permission Module | 플랜별 기능 권한(제품 등록 수, 제안서 제출, 통계 열람 등) 매핑 |
| Exposure Limit Module | 플랜별 노출 한도(제품 노출 수, Featured 진입 가능 여부 등) 계산 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Free Supplier Plugin | 무료 플랜 제한 규칙(등록 수 제한, 노출 제한, 기능 제한) 적용 |
| Premium Supplier Plugin | 유료 플랜 확장 규칙(등록 수 확대, 노출 확대, 제안서 제출 등) 적용 |
| Enterprise Supplier Plugin | 대형 고객사 전용 확장 규칙(MVP 이후 협의 기반 커스텀 한도) |
| Admin Granted Premium Plugin | Admin이 결제 없이 특정 Supplier에게 Premium 권한을 수동 부여 |

**정책**

- 무료 Supplier는 제한된 노출과 제한된 기능을 가진다.
- 유료 Supplier는 제품 등록 수, 노출, 제안서 제출, 통계 열람 권한이 확대된다.
- 유료 여부와 무관하게 Buyer의 이메일/전화번호는 기본적으로 비공개다.

---

### 4.5 Company Microsite Engine

**역할:** Supplier별 미니 회사 홈페이지(`/companies/[slug]`)를 제공.

**Modules**

| Module | 설명 |
|---|---|
| Company Profile Module | 회사명, 슬로건, 로고, 주소, 산업군 등 기본 정보 |
| Company Hero Module | 회사 페이지 상단 히어로(대표 이미지/카피) 영역 |
| About Company Module | 회사 소개, 설립연도, 연혁 |
| Product Showcase Module | 회사 페이지 내 대표 제품 노출 영역 (Marketplace Engine 데이터 참조) |
| Certificate Module | 보유 인증서/허가증 목록 |
| Catalog Module | 다운로드 가능한 카탈로그 파일 관리 |
| Video Module | 회사/공장 소개 영상 링크 관리 |
| Factory Module | 공장 사진, 생산 설비 정보 |
| Export Country Module | 수출 가능/주력 국가 목록 |
| Inquiry Entry Module | 회사 페이지에서 문의를 시작하는 진입점 (Trade Brokerage Engine으로 연결) |

**Plugins**

| Plugin | 설명 |
|---|---|
| Theme Plugin | 회사 페이지 테마/색상 변형 |
| Section Order Plugin | 회사 페이지 내 섹션 노출 순서 커스터마이즈 |
| Catalog Download Plugin | 카탈로그 다운로드 추적 및 접근 제어 |
| YouTube Video Plugin | YouTube 영상 임베드 |
| Certificate Badge Plugin | 인증서를 Trust Engine 배지와 연결해 시각적으로 표시 |
| Factory Gallery Plugin | 공장 사진 갤러리 뷰 |
| SEO Plugin | 회사 페이지 메타데이터/구조화 데이터 관리 |

**페이지:** `/companies/[slug]`

---

### 4.6 Marketplace Engine

**역할:** 제품, 산업설비, EPC 프로젝트, SELL 상품, Buy Request **콘텐츠**(작성/저장/카테고리/검색)를 관리하는 콘텐츠 소유 Engine.

> 주의: Buy Request의 *콘텐츠 CRUD*는 본 Engine의 Buy Request Module이 소유하지만, Buy Request의 *열람 정책·Supplier 응답 워크플로우*는 별도의 **Buy Request Engine**(4.7)이 소유한다. 즉 "콘텐츠 소유"와 "접근/응답 정책 소유"를 분리한다.

**Modules**

| Module | 설명 |
|---|---|
| Commercial Product Module | 일반 상업 제품 등록/관리 |
| Industrial Product Module | 산업설비 제품 등록/관리 |
| EPC Project Module | EPC 프로젝트 게시물 등록/관리 |
| Sell Product Module | BUY & SELL 중 SELL PRODUCTS 게시물 등록/관리 |
| Buy Request Module | BUY & SELL 중 BUY REQUEST 게시물 등록/관리 (콘텐츠 저장 책임만) |
| Category Module | 산업군/카테고리 분류 체계 관리 |
| Search Module | 제품/게시물 검색 및 필터링 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Product Image Gallery Plugin | 제품 상세 이미지 다중 업로드/갤러리 뷰 |
| Product Thumbnail Plugin | 목록용 썸네일 이미지 관리 |
| Product Detail Description Plugin | 리치 텍스트 형태의 제품 설명 |
| Product Document Plugin | 제품 소개 자료(PDF 등) 첨부 |
| Product Video Link Plugin | 외부 동영상 링크 첨부 |
| Related Product Plugin | 유사/관련 제품 추천 노출 |
| Related Buy Request Plugin | 제품과 연관된 Buy Request 노출 |
| Product SEO Plugin | 제품 상세 페이지 메타데이터/구조화 데이터 |

**제품 등록 필드 (공통 기준)**

- 제품명
- 썸네일
- 상세 이미지
- 제품 설명
- 제품 소개 자료 파일
- 동영상 링크
- 카테고리
- 산업군
- 원산지
- MOQ
- 인증서
- 카탈로그
- 관리자 승인 상태 (Approval Engine 참조)

---

### 4.7 Buy Request Engine

**역할:** Buy Request 게시물의 **열람 정책**과 **Supplier 응답 워크플로우**를 관리. 콘텐츠 자체는 Marketplace Engine의 Buy Request Module이 저장하며, 본 Engine은 그 위에 "누가 무엇을 볼 수 있는가"와 "Supplier가 어떻게 응답하는가"를 규정한다.

**Modules**

| Module | 설명 |
|---|---|
| Buy Request Post Module | Marketplace Engine의 Buy Request Module 데이터를 참조하는 게시물 표현 계층 |
| Buy Request Detail Access Module | 로그인 여부/Role/Supplier 플랜에 따른 상세 열람 권한 계산 |
| Supplier Response Module | Supplier가 Buy Request에 대해 응답을 등록하는 흐름 (Trade Brokerage Engine으로 전달) |
| Admin Screening Module | Buy Request 등록 시 Admin의 스크리닝/승인 처리 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Anonymous Preview Plugin | 비로그인 사용자에게 제목/요약만 노출 |
| Logged-in Supplier Detail Plugin | 로그인한 Supplier에게 상세 내용 노출 |
| Premium Supplier Response Plugin | 유료 Supplier에게 응답 우선권/추가 응답 기능 제공 |
| Admin Masking Plugin | Buyer 개인정보(작성자 식별 정보) 마스킹 처리 |

**정책**

- 비로그인 사용자는 목록 및 요약만 확인할 수 있다.
- 로그인한 Supplier는 상세 내용을 확인할 수 있다.
- Buyer의 개인정보는 비공개 상태로 유지한다.
- Supplier의 응답은 직접 전달되지 않고 관리자 중개(Trade Brokerage Engine)를 거친다.

---

### 4.8 Trade Brokerage Engine

**역할:** Buyer와 Supplier의 직접 연결을 방지하고, 모든 문의·제안서를 관리자 중개형으로 처리하는 플랫폼의 핵심 신뢰 장치.

**Modules**

| Module | 설명 |
|---|---|
| Inquiry Module | Buyer가 제품/회사에 대해 등록하는 문의 |
| Admin Broker Queue Module | 접수된 Inquiry가 대기하는 관리자 처리 큐 |
| Proposal Module | Supplier가 작성하는 제안서 |
| Supplier Forward Module | Admin이 검토를 마친 Inquiry를 Supplier에게 전달하는 처리 |
| Buyer Response Module | Admin이 검토를 마친 Proposal을 Buyer에게 전달하고 Buyer의 회신을 받는 처리 |
| Meeting Request Module | Buyer-Supplier 미팅/상담 요청 (Admin 승인 기반) |
| Deal Status Module | 문의-제안-협상의 진행 상태(예: 접수/검토중/전달완료/협상중/성사/종료) 추적 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Buyer Shield Plugin | Buyer의 개인정보가 Supplier에게 전달되지 않도록 차단 |
| Supplier Shield Plugin | Supplier의 민감 정보(예: 단가 전략)가 불필요하게 노출되지 않도록 보호 |
| Contact Masking Plugin | 양측 연락처 정보를 자동 마스킹 |
| Admin Review Plugin | Inquiry/Proposal에 대한 Admin 검토 화면 및 처리 |
| Proposal Comparison Plugin | Buyer가 여러 Supplier의 Proposal을 비교하는 뷰 (Admin 검토 후 노출) |
| Direct Contact Approval Plugin | 예외적으로 직접 연락을 허용할 때 Admin 승인 절차를 거치는 처리 |

**정책**

- Buyer가 제품 문의를 등록해도 Supplier에게 즉시 전달되지 않는다. Inquiry는 Admin Broker Queue로 들어간다.
- Admin이 검토한 후 Supplier에게 전달한다.
- Supplier는 Proposal을 제출한다.
- Proposal도 Admin 검토 후 Buyer에게 전달한다.
- Buyer의 이메일, 전화번호, 담당자명은 기본적으로 비공개다.
- Direct Contact는 Admin 승인 후에만 가능하다.

---

### 4.9 Communication Engine

**역할:** Role 간 관계에 따라 허용된 메시지/알림/공지를 관리.

**Modules**

| Module | 설명 |
|---|---|
| Conversation Module | 1:1 또는 그룹 대화방 생성/관리 |
| Message Module | 대화방 내 메시지 송수신 |
| Attachment Module | 메시지 첨부파일(PDF, 이미지) 관리 |
| Notification Module | 시스템 알림 발송/조회 |
| Announcement Module | Admin의 전체/그룹 공지 발송 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Agent Buyer Chat Plugin | Agent와 하부 Buyer 간 직접 대화 허용 |
| Professor Student Chat Plugin | Professor와 하부 Student 간 직접 대화 허용 |
| Admin Mediated Supplier Buyer Chat Plugin | Supplier-Buyer 대화를 Admin이 중개/열람/차단할 수 있는 구조로 제공 (Trade Brokerage Engine과 연동) |
| File Attachment Plugin | 첨부파일 업로드/검증/접근 제어 |
| Read Status Plugin | 메시지 읽음/안읽음 표시 |

**정책**

- Agent와 하부 Buyer는 직접 대화할 수 있다.
- Professor와 하부 Student는 직접 대화할 수 있다.
- Supplier와 Buyer는 기본적으로 직접 대화할 수 없다.
- Supplier-Buyer 대화는 Admin 중개형으로만 존재한다.

---

### 4.10 Approval Engine

**역할:** 플랫폼 내 모든 승인 프로세스를 단일하게 통제하는 Cross-cutting Engine.

**Modules**

| Module | 설명 |
|---|---|
| Role Approval Module | Agent/Professor 등 Role 신청/초대에 대한 승인 |
| Supplier Approval Module | Supplier 가입 승인 |
| Company Approval Module | 회사 등록 승인 (Company Verification과는 별도 개념) |
| Product Approval Module | 제품/산업설비/EPC/SELL 게시물 승인 |
| Buy Request Approval Module | Buy Request 게시물 승인 |
| Badge Approval Module | Badge 부여 신청/추천에 대한 승인 (Trust Engine과 연동) |
| Student Showcase Approval Module | Student Showcase 공개 승인 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Approval Queue Plugin | 대상별 승인 대기열 화면 |
| Rejection Reason Plugin | 반려 시 사유 기록 |
| Resubmission Plugin | 반려 후 재제출 처리 |
| Admin Memo Plugin | 승인 과정 중 Admin 내부 메모 |
| Approval History Plugin | 승인/반려 이력 추적 |

**원칙:** 모든 도메인 Engine의 "승인" 동작은 자체 구현하지 않고 Approval Engine의 Module을 호출한다 (Approval Queue/History는 Engine 전반에서 공유).

---

### 4.11 Trust Engine

**역할:** 인증, 배지, 등급, 점수, 랭킹을 통합 관리하는 Cross-cutting Engine.

**Modules**

| Module | 설명 |
|---|---|
| Verification Module | 회사/공장/수출 자격 등의 사실 검증 처리 |
| Badge Module | 배지 정의, 부여, 회수의 공통 처리기 |
| Membership Badge Module | 플랜(무료/유료)에 따른 멤버십 배지 |
| Performance Badge Module | 활동/성과 기반 배지(응답속도, 매칭률 등) |
| Company Score Module | 회사 신뢰도 점수 계산 |
| Ranking Module | Company Score 등을 기반으로 한 랭킹 산출 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Verified Supplier Badge Plugin | 검증된 Supplier 표시 |
| Verified Buyer Badge Plugin | 검증된 Buyer 표시 |
| Verified Agent Badge Plugin | 검증된 Agent 표시 |
| Verified Professor Badge Plugin | 검증된 Professor 표시 |
| Verified Student Badge Plugin | 검증된 Student 표시 |
| Verified Company Plugin | 회사 자체 검증 표시 |
| Verified Factory Plugin | 공장 실사/검증 표시 |
| Verified Exporter Plugin | 수출 자격 검증 표시 |
| Thailand FDA Registered Plugin | Thailand FDA Service 등록 완료 표시 (Thailand FDA Service Engine과 연동) |
| Premium Supplier Badge Plugin | 유료 플랜 가입 Supplier 표시 |
| Top Supplier Plugin | 상위 성과 Supplier 표시 |
| Fast Response Plugin | 빠른 응답 속도 Supplier 표시 |
| High Match Rate Plugin | 높은 매칭 성사율 표시 |

**정책**

- Admin이 Badge를 직접 부여/회수할 수 있다.
- 유료 Supplier에게 인증마크 또는 Premium Badge를 부여할 수 있다.
- Badge는 사용자의 신뢰와 자긍심을 높이는 핵심 요소다.
- Badge 클릭 시 발급 근거와 발급일을 표시한다.

---

### 4.12 Student Growth Engine

**역할:** 학생의 글로벌 무역 활동과 성장 경로를 관리.

**Modules**

| Module | 설명 |
|---|---|
| Student Profile Module | 학생 기본 정보(학교, 학과, 학년) |
| Global Trade Passport Module | 활동 로그, Career Rank, Badge, Reward, Showcase, Market Research를 종합한 활동 증명서 |
| Student Showcase Module | 승인된 Supplier 제품을 선택해 구성하는 Showcase |
| Market Research Module | 학생이 제출하는 시장 조사 리포트 |
| Buyer Acquisition Module | 학생의 Buyer 유치 활동 기록 |
| Event Support Module | 학생의 행사 지원 활동 기록 |
| Translation Support Module | 학생의 번역 지원 활동 기록 |
| Career Rank Module | Global Trade Ambassador → Associate → Specialist → Partner → Leader 등급 관리 |
| Graduation Module | 졸업 처리 및 Alumni/Associate 전환 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Showcase Builder Plugin | Showcase 편집 UI 로직 |
| Product Selection Plugin | 승인된 Supplier 제품 중 Showcase에 포함할 제품 선택 |
| Research Submission Plugin | Market Research 제출 폼 처리 |
| Activity Score Plugin | 활동 기반 점수 계산 |
| Badge Reward Plugin | 활동 성과에 따른 Badge/Reward 지급 신청 (Trust Engine 연동, 최종 승인은 Approval Engine) |
| Graduate Transition Plugin | 졸업 시점에 Organization Engine의 Graduate Transition Plugin과 함께 동작 |

**정책**

- Student는 제품을 직접 등록할 수 없다.
- 승인 상태(`approval_status = approved`)인 Supplier 제품만 Showcase에 포함할 수 있다.
- Professor는 하부 Student의 개인정보와 활동내역을 확인할 수 있다.
- 졸업 후 Alumni 또는 Global Trade Associate로 전환한다.

---

### 4.13 Exposure Engine

**역할:** 메인 랜딩페이지, Featured, 추천 노출을 관리.

**Modules**

| Module | 설명 |
|---|---|
| Homepage Exposure Module | 홈페이지 섹션별 노출 콘텐츠 구성 |
| Featured Supplier Module | 추천 Supplier 노출 |
| Featured Product Module | 추천 제품 노출 |
| Featured Buy Request Module | 추천 Buy Request 노출 |
| Country Gateway Module | 국가별 진입 화면/필터 |
| Banner Module | 배너 관리 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Premium Exposure Plugin | 유료 Supplier 우선 노출 (Supplier Membership Engine 연동) |
| Admin Pick Plugin | Admin이 수동으로 지정하는 추천 콘텐츠 |
| Auto Ranking Plugin | 점수/성과 기반 자동 추천 노출 (Trust Engine, Analytics Engine 연동) |
| Country Featured Plugin | 국가별 추천 콘텐츠 |
| Industry Featured Plugin | 산업군별 추천 콘텐츠 |

---

### 4.14 Event Engine

**역할:** 무역 행사, 대학교 행사, 세미나를 관리.

**Modules**

| Module | 설명 |
|---|---|
| Event Module | 행사 등록/관리 (Admin 전용 등록) |
| Event Application Module | 회원의 참가 신청 |
| Attendance Module | 참석 여부 기록 |
| Event Report Module | 행사 결과 보고 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Student Event Support Plugin | 학생의 행사 지원 활동 등록 (Student Growth Engine 연동) |
| Supplier Event Plugin | Supplier의 행사 참가/전시 신청 |
| Buyer Event Plugin | Buyer의 행사 참가 신청 |
| Admin Event Approval Plugin | 행사 등록/참가 신청에 대한 Admin 승인 (Approval Engine 연동) |

---

### 4.15 Thailand FDA Service Engine

**역할:** 태국 식약청(Thailand FDA) 인허가 서비스를 관리. MVP에서 운영하는 유일한 인허가 대행 서비스 버티컬.

**Modules**

| Module | 설명 |
|---|---|
| FDA Application Module | Supplier의 신청서 등록 |
| Document Module | 신청에 필요한 서류 업로드/관리 |
| Quotation Module | Admin의 견적 제시 |
| Status Tracking Module | 상태 추적: draft → submitted → reviewing → waiting_documents → quoted → in_progress → completed / rejected |
| Completion Report Module | 완료 보고서 발급 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Cosmetic Registration Plugin | 화장품 등록 카테고리 처리 |
| Food Supplement Registration Plugin | 건강기능식품 등록 카테고리 처리 |
| Food Registration Plugin | 식품 등록 카테고리 처리 |
| Medical Device Registration Plugin | 의료기기 등록 카테고리 처리 |
| Import License Plugin | 수입 라이선스 지원 카테고리 처리 |
| Label Review Plugin | 라벨 컴플라이언스 검토 카테고리 처리 |
| Formula Review Plugin | 제품 포뮬러 검토 카테고리 처리 |

**정책:** Supplier가 신청하고, Admin이 검토/견적/상태변경/파일관리/완료보고서를 관리한다.

---

### 4.16 Admin Control Engine

**역할:** 플랫폼 전체를 통제하는 Cross-cutting Engine. 다른 모든 Engine의 설정/토글/오버라이드 권한을 가진다.

**Modules**

| Module | 설명 |
|---|---|
| Admin Dashboard Module | 운영자 메인 대시보드 |
| Member Management Module | 전체 회원(모든 Role) 관리 |
| Role Management Module | Role 부여/회수/변경 |
| Invitation Management Module | 전체 초대 현황 관리 (Invitation Engine 연동) |
| Company Management Module | 회사 등록/검증 상태 관리 |
| Product Management Module | 전체 콘텐츠(제품/산업설비/EPC/SELL/Buy Request) 관리 |
| Inquiry Brokerage Module | Trade Brokerage Engine의 운영 콘솔 |
| Badge Management Module | Trust Engine의 Badge 운영 콘솔 |
| Exposure Management Module | Exposure Engine 운영 콘솔 |
| Site Setting Module | 플랫폼 전역 설정(메뉴, 카테고리, 정책 토글 등) |
| Translation Management Module | Translation Key 기반 다국어 문자열 관리 |
| Audit Log Module | 관리자 행위 로그 조회 |
| Landing Page Management Module | Landing Page Builder Engine 운영 콘솔 (페이지/섹션 생성·수정) |
| Section Management Module | Section 순서/노출/예약 발행 관리 (Landing Page Builder Engine 연동) |
| Banner Management Module | 배너 등록/수정/삭제 (Landing Page Builder Engine 연동) |
| Popup Management Module | 팝업 등록/수정/삭제 (Landing Page Builder Engine 연동) |
| Design Token Management Module | 디자인 토큰 운영 콘솔 (UI Design System Engine 연동) |
| Theme Management Module | 테마 변형 운영 콘솔 (UI Design System Engine 연동) |
| Component Setting Module | 공통 컴포넌트 설정 운영 콘솔 (UI Design System Engine 연동) |

**Plugins**

| Plugin | 설명 |
|---|---|
| Buyer Direct Signup Toggle | Buyer 직접가입 ON/OFF (Invitation Engine 정책 제어) |
| Professor Invitation Toggle | Professor 공개 신청 허용 여부 ON/OFF (기본 OFF) |
| Supplier Plan Override | Supplier 플랜을 결제 없이 수동 변경 (Supplier Membership Engine 연동) |
| Badge Override | Badge를 수동으로 부여/회수 (Trust Engine 연동) |
| Contact Release Approval | Direct Contact 허용 승인 (Trade Brokerage Engine 연동) |
| Content Visibility Control | 특정 콘텐츠의 공개/비공개 강제 전환 |
| Admin Memo | 회원/콘텐츠에 대한 내부 메모 |
| Audit Trail | 모든 관리자 조작에 대한 추적 기록 |

**Admin 기능 (Landing Page Builder / UI Design System 운영)**

- 랜딩페이지 섹션 생성
- 섹션 수정
- 섹션 순서 변경
- 섹션 노출 ON/OFF
- 섹션 예약 발행
- Hero 텍스트 수정
- CTA 링크 수정
- Featured 콘텐츠 직접 선택
- 자동 추천 노출 설정
- 배너 등록/수정/삭제
- 팝업 등록/수정/삭제
- 모바일/데스크탑 표시 여부 설정
- Preview
- Publish
- Rollback
- Audit Log 기록

---

### 4.17 Analytics Engine

**역할:** 플랫폼 전체 데이터와 성과를 분석하는 읽기 전용 Cross-cutting Engine.

**Modules**

| Module | 설명 |
|---|---|
| Marketplace KPI Module | 제품/게시물 등록·노출·문의 전환 등 핵심 지표 |
| Supplier Analytics Module | Supplier별 성과(노출, 문의, 응답률) |
| Buyer Analytics Module | Buyer별 활동(열람, 문의, 매칭) |
| Agent Analytics Module | Agent별 Buyer 유치/관리 성과 |
| Professor Analytics Module | Professor별 Student 관리 성과 |
| Student Analytics Module | Student별 활동(Showcase, Research, Event Support) 성과 |
| Company Score Analytics Module | Company Score 추이 분석 (Trust Engine 연동) |

**Plugins**

| Plugin | 설명 |
|---|---|
| Buyer Source Tracking Plugin | Buyer 유입 경로(어느 Agent/링크) 추적 |
| Showcase View Tracking Plugin | Student Showcase 조회수 추적 |
| Inquiry Tracking Plugin | 문의 발생/처리 추적 |
| Proposal Tracking Plugin | 제안서 제출/전달/회신 추적 |
| Conversion Tracking Plugin | 열람→문의→매칭 전환율 추적 |
| Ranking Analytics Plugin | 랭킹 변동 추적 (Trust Engine 연동) |

---

### 4.18 UI Design System Engine

**역할:** B2BB2G 전체 Public Website, Dashboard, Admin Dashboard, Company Microsite, Product Detail, Landing Page의 UI 일관성, 디자인 토큰, 컴포넌트 규칙, 레이아웃 규칙, 모바일 UX를 통제하는 Cross-cutting Engine (Presentation Provider).

**Modules**

| Module | 설명 |
|---|---|
| Design Token Module | 색상, 타이포그래피, spacing, radius, shadow 등 디자인 토큰의 단일 출처 |
| Component Library Module | 버튼/입력/카드/테이블 등 공통 컴포넌트 정의의 단일 출처 |
| Layout System Module | 그리드, 컨테이너, 브레이크포인트 등 레이아웃 규칙 관리 |
| Theme Module | 브랜드/라이트·다크 등 테마 변형 관리 |
| Responsive Rule Module | All/Desktop/Mobile 디바이스별 표시 규칙 관리 |
| Accessibility Module | 명도 대비, 키보드 내비게이션, ARIA 등 접근성 규칙 관리 |
| Icon & Badge UI Module | 아이콘 세트 및 Badge 시각 표현 규칙 관리 (Trust Engine 데이터 표시용) |
| Form UI Module | 입력 폼 공통 패턴(검증 메시지, 필수 표시 등) 관리 |
| Table UI Module | 데이터 테이블 공통 패턴(정렬, 페이지네이션, 빈 상태) 관리 |
| Card UI Module | 제품/회사/Buy Request 등 카드형 콘텐츠의 공통 레이아웃 관리 |
| Dashboard UI Module | Role별 Dashboard 공통 레이아웃/내비게이션 패턴 관리 |
| Admin UI Module | Admin Dashboard 전용 레이아웃/내비게이션 패턴 관리 (Korean 기본) |
| Public UI Module | Public Website 전용 레이아웃/내비게이션 패턴 관리 (English 기본) |

**Plugins**

| Plugin | 설명 |
|---|---|
| Button Plugin | 버튼 variant(Primary/Secondary/Ghost 등) 규칙 |
| Input Plugin | 텍스트 입력 필드 규칙 |
| Select Plugin | 선택형 입력 규칙 |
| Modal Plugin | 모달 다이얼로그 규칙 |
| Drawer Plugin | 사이드 Drawer 규칙 |
| Table Plugin | 테이블 렌더링 규칙 |
| KPI Card Plugin | 지표 요약 카드 규칙 |
| Product Card Plugin | 제품 카드 규칙 (Marketplace Engine 데이터 표시) |
| Company Card Plugin | 회사 카드 규칙 (Company Microsite Engine 데이터 표시) |
| Buy Request Card Plugin | Buy Request 카드 규칙 (Buy Request Engine 데이터 표시) |
| Badge Icon Plugin | 배지 아이콘 표시 규칙 (Trust Engine 연동) |
| Verification Badge Plugin | 검증 배지 표시 규칙 (Trust Engine 연동) |
| Empty State Plugin | 빈 상태 화면 공통 규칙 |
| Loading Skeleton Plugin | 로딩 스켈레톤 공통 규칙 |
| Toast Notification Plugin | 토스트 알림 규칙 (Communication Engine 알림과 연동) |
| Mobile Bottom Navigation Plugin | 모바일 하단 내비게이션 규칙 |
| Sticky Action Plugin | 화면 상단/하단 고정 액션 바 규칙 |

**정책**

- 모든 UI는 Design Token 기반이어야 한다.
- 모든 사용자 유형별 Dashboard는 동일한 UI 원칙을 공유하되, Role별 목적에 맞게 IA와 콘텐츠가 달라야 한다.
- Public UI는 English 기본.
- Admin UI는 Korean 기본.
- 모든 문구는 Translation Key 기반.
- 하드코딩 UI 문구 금지.
- 이모지 사용 금지.
- Badge, Verification, Membership 표시는 Trust Engine과 연결한다.
- Landing Page Builder Engine에서 사용되는 모든 Section도 본 Engine의 Component Library Module을 사용한다 (Section 전용 일회성 스타일 구현 금지).

**Role-Based Dashboard IA (Dashboard UI Module / Admin UI Module 적용 기준)**

| Role | Dashboard 구성 요소 |
|---|---|
| Supplier | Company Status, Product Management, Inquiry Status, Proposal Status, Membership Status, Exposure Status, Badge Status |
| Buyer | Buy Request, Saved Products, Inquiry History, Proposal Comparison, Agent Info, Protected Contact Status |
| Agent | Buyer Network, Buyer Signup Link, QR Code, Buyer Activity, Message, Performance |
| Professor | Student Network, Student Signup Link, QR Code, Student Personal Information, Student Activity, Market Research, Message |
| Student | Global Trade Passport, My Showcase, Approved Product Selection, Buyer Acquisition, Market Research, Badge, Graduation Status |
| Administrator | Approval Queue, Landing Builder, Trust Badge, Broker Queue, Members, Companies, Products, Buy Requests, Events, FDA, Analytics, Audit Logs |

> 위 구성 요소는 각 Role Dashboard의 Information Architecture(IA) 기준이다. 실제 데이터는 해당 Module을 소유한 Engine(예: Buy Request → Buy Request Engine, Badge → Trust Engine, Showcase → Student Growth Engine)에서 가져오며, Dashboard UI Module/Admin UI Module은 레이아웃과 내비게이션만 책임지고 데이터를 소유하지 않는다.

---

### 4.19 Landing Page Builder Engine

**역할:** 관리자가 B2BB2G 메인 랜딩페이지 및 주요 공개 페이지의 Hero, Section, Featured 콘텐츠, CTA, Banner, 노출 순서, 공개 여부를 코드 배포 없이 직접 구성할 수 있게 하는 Admin Builder형 Engine.

**관리자가 설정 가능한 범위**

- Hero: Hero Section, Hero Headline, Hero Subheadline, Hero Background Image or Video, Hero Search Type
- CTA: Primary CTA, Secondary CTA, Footer CTA
- 신뢰/지표: KPI Bar, Trust Bar
- 콘텐츠 섹션: Country Gateway, Urgent Buy Requests, Featured Suppliers, Featured Products, Featured Buy Requests, Industrial Projects, EPC Projects, Student Showcase, Events, Thailand FDA Service, Notice
- 노출 도구: Banner, Popup
- 구성 제어: Section Order, Section Visibility, Section Scheduling, Featured Content Selection, Manual Pick / Auto Ranking Toggle

**Modules**

| Module | 설명 |
|---|---|
| Page Template Module | 랜딩/주요 공개 페이지의 템플릿 구조 정의 |
| Section Builder Module | 페이지 내 Section CRUD 및 구성 처리 |
| Hero Builder Module | Hero 영역(헤드라인/서브헤드라인/배경/검색타입) 편집 |
| CTA Module | Primary/Secondary/Footer CTA 버튼 및 링크 관리 |
| Banner Module | 배너 등록/노출 관리 |
| Popup Module | 팝업 등록/노출 관리 |
| KPI Block Module | KPI Bar 콘텐츠 관리 |
| Trust Bar Module | Trust Bar(인증/배지 스트립) 콘텐츠 관리 |
| Featured Content Module | Featured Supplier/Product/Buy Request 등 추천 콘텐츠 연결 관리 |
| Section Order Module | Section 노출 순서(sort_order) 관리 |
| Section Visibility Module | Section ON/OFF 및 디바이스별 노출 관리 |
| Section Scheduling Module | Section 예약 노출(start_at/end_at) 관리 |
| Landing Preview Module | 발행 전 미리보기 제공 |
| Publish Workflow Module | 임시저장 → 예약 → 발행 → 롤백 워크플로우 관리 |

**Plugins**

| Plugin | 설명 |
|---|---|
| Hero Search Plugin | Hero 영역 검색창 타입(제품검색/국가검색 등) 변형 |
| Hero Video Plugin | Hero 배경 영상 처리 |
| Hero Image Plugin | Hero 배경 이미지 처리 |
| CTA Button Plugin | CTA 버튼 스타일/링크 처리 (UI Design System Engine의 Button Plugin 사용) |
| KPI Bar Plugin | KPI Bar 렌더링 |
| Trust Badge Strip Plugin | Trust Bar 렌더링 (Trust Engine 데이터 연동) |
| Featured Supplier Plugin | Featured Supplier 섹션 렌더링 (Exposure Engine 연동) |
| Featured Product Plugin | Featured Product 섹션 렌더링 (Exposure Engine 연동) |
| Featured Buy Request Plugin | Featured Buy Request 섹션 렌더링 (Exposure Engine 연동) |
| Country Gateway Plugin | 국가별 진입 섹션 렌더링 |
| Event Section Plugin | Event 섹션 렌더링 (Event Engine 연동) |
| FDA Service Section Plugin | Thailand FDA Service 섹션 렌더링 (Thailand FDA Service Engine 연동) |
| Student Showcase Section Plugin | Student Showcase 섹션 렌더링 (Student Growth Engine 연동) |
| Notice Section Plugin | Notice 섹션 렌더링 |
| Popup Plugin | 팝업 렌더링 및 노출 조건 처리 |
| Banner Carousel Plugin | 배너 캐러셀 렌더링 |
| Manual Featured Pick Plugin | 관리자 수동 Featured 콘텐츠 선택 |
| Auto Ranking Featured Plugin | Trust Engine/Exposure Engine/Analytics Engine 점수 기반 자동 Featured 선택 |
| A/B Test Plugin (Future) | 섹션 A/B 테스트 (MVP 제외, 7장 Future Scope 참조) |
| Landing Analytics Plugin | 섹션별 노출/클릭 추적 (Analytics Engine 연동) |

**정책**

- 관리자는 랜딩페이지의 모든 주요 섹션을 ON/OFF 할 수 있다.
- 관리자는 섹션 순서를 드래그 또는 숫자 sort_order로 조정할 수 있다.
- 각 Section은 status를 가진다: draft, scheduled, published, hidden, archived.
- 각 Section은 display_device를 가진다: all, desktop, mobile.
- 각 Section은 start_at, end_at으로 예약 노출 가능해야 한다.
- 콘텐츠 선택 방식은 manual 또는 automatic 둘 다 가능해야 한다.
- manual은 관리자가 직접 콘텐츠를 선택한다.
- automatic은 Trust Engine, Exposure Engine, Analytics Engine 기준으로 자동 노출한다.
- Landing Builder에서 생성된 모든 화면은 승인된 공개 콘텐츠만 사용해야 한다. 비승인 Supplier, Product, Buy Request, Student Showcase는 랜딩페이지에 노출 금지한다.
- Public Website 기본 언어는 English이며, 모든 텍스트는 Translation Key 기반으로 관리한다. Admin에서 입력한 텍스트도 `translations` 또는 `landing_section_translations` 구조로 관리한다.

**Exposure Engine과의 관계**

- Exposure Engine: 무엇을 노출할지(후보 선정)를 결정한다.
- Landing Page Builder Engine: 어디에, 어떤 순서로, 어떤 UI Section으로 보여줄지를 결정한다.
- 예: Exposure Engine이 Featured Supplier 후보를 선정하면, Landing Page Builder Engine이 해당 Featured Supplier 섹션을 메인 랜딩페이지의 5번째 섹션으로 배치한다.

**Dependency**

Landing Page Builder Engine depends on:

- UI Design System Engine (Component Library, Design Token)
- Exposure Engine (Featured 콘텐츠 후보)
- Trust Engine (Badge/Verification 표시)
- Marketplace Engine (제품/Buy Request 콘텐츠)
- Company Microsite Engine (Featured Supplier 콘텐츠)
- Event Engine (Event 섹션 콘텐츠)
- Thailand FDA Service Engine (FDA 섹션 콘텐츠)
- Student Growth Engine (Student Showcase 섹션 콘텐츠)
- Admin Control Engine (Landing Page Management Module을 통한 운영 권한, Translation Management Module을 통한 다국어 텍스트 관리)

Cross-cutting 여부: No (5.3 계층 다이어그램의 Layer 4 — Presentation Orchestration)

---

## 5. Cross Engine Dependency

### 5.1 의존 원칙

1. 도메인 Engine은 자신보다 하위 계층(Foundation)에만 의존할 수 있다. 상위 계층이 하위 계층의 내부 구현을 직접 참조하지 않는다.
2. **Approval Engine**, **Admin Control Engine**, **Analytics Engine**, **UI Design System Engine**은 Cross-cutting Engine으로, 모든 도메인 Engine이 이들에 의존할 수 있지만 이들은 도메인 Engine의 세부 구현에 의존하지 않는다.
3. **Trust Engine**과 **Communication Engine**은 도메인 Engine이면서 동시에 여러 Engine에서 공유 참조되는 "공유 서비스형 Engine"이다.
4. 순환 의존(Circular Dependency)을 만들지 않는다.
5. Engine 간 데이터가 필요하면 해당 Engine이 제공하는 Module 단위 인터페이스(추후 ERD/RLS 단계에서 함수/뷰/API로 구체화)를 통해서만 접근한다.
6. **UI Design System Engine**에 대한 의존은 데이터 의존이 아니라 표현 계층(Presentation) 의존이다. 거의 모든 Engine이 화면을 가지므로 5.2 표에는 행마다 반복 표기하지 않고 본 항목으로 일괄 적용한다. 단, **Landing Page Builder Engine**처럼 UI Design System Engine을 핵심 의존성으로 명시할 필요가 있는 경우는 표에 직접 기재한다.

### 5.2 의존 관계 표

| Engine | 의존 (Depends On) | Cross-cutting 여부 |
|---|---|---|
| Identity Engine | – (Foundation) | No |
| Invitation Engine | Identity Engine | No |
| Organization Engine | Identity Engine, Invitation Engine | No |
| Approval Engine | Identity Engine | **Yes** |
| Admin Control Engine | Identity Engine, Approval Engine | **Yes** |
| Supplier Membership Engine | Identity Engine, Organization Engine, Approval Engine | No |
| Company Microsite Engine | Identity Engine, Supplier Membership Engine, Approval Engine, Trust Engine | No |
| Marketplace Engine | Identity Engine, Supplier Membership Engine, Company Microsite Engine, Approval Engine | No |
| Buy Request Engine | Marketplace Engine, Identity Engine, Supplier Membership Engine, Approval Engine | No |
| Trade Brokerage Engine | Marketplace Engine, Buy Request Engine, Identity Engine, Organization Engine, Communication Engine, Approval Engine | No |
| Communication Engine | Identity Engine, Organization Engine | No (공유 서비스) |
| Trust Engine | Identity Engine, Organization Engine, Supplier Membership Engine, Approval Engine | No (공유 서비스) |
| Student Growth Engine | Identity Engine, Organization Engine, Marketplace Engine, Trust Engine, Approval Engine | No |
| Exposure Engine | Marketplace Engine, Company Microsite Engine, Trust Engine, Supplier Membership Engine, Approval Engine | No |
| Event Engine | Identity Engine, Organization Engine, Approval Engine | No |
| Thailand FDA Service Engine | Identity Engine, Supplier Membership Engine, Approval Engine | No |
| Analytics Engine | 전체 Engine (읽기 전용) | **Yes (Observer)** |
| UI Design System Engine | Identity Engine (Role 기반 UI 분기), Trust Engine (Badge/Verification 표시 연동) | **Yes (Presentation Provider)** |
| Landing Page Builder Engine | UI Design System Engine, Exposure Engine, Trust Engine, Marketplace Engine, Company Microsite Engine, Event Engine, Thailand FDA Service Engine, Student Growth Engine, Admin Control Engine | No |

### 5.3 계층 다이어그램

```
Layer 0  Foundation
         └─ Identity Engine

Layer 1  Core Relationship
         ├─ Invitation Engine
         └─ Organization Engine

Layer 2  Domain Capability
         ├─ Supplier Membership Engine
         ├─ Company Microsite Engine
         ├─ Marketplace Engine
         ├─ Buy Request Engine
         ├─ Communication Engine
         └─ Trust Engine

Layer 3  Brokered Interaction & Growth
         ├─ Trade Brokerage Engine
         ├─ Student Growth Engine
         ├─ Exposure Engine
         ├─ Event Engine
         └─ Thailand FDA Service Engine

Layer 4  Presentation Orchestration
         └─ Landing Page Builder Engine

Cross-cutting (모든 Layer를 횡단)
         ├─ Approval Engine             (Authority)
         ├─ Admin Control Engine        (Authority)
         ├─ Analytics Engine            (Observer)
         └─ UI Design System Engine     (Presentation Provider)
```

### 5.4 주요 결합 주의사항

- **Marketplace Engine ↔ Buy Request Engine**: 콘텐츠 소유(Marketplace)와 접근/응답 정책 소유(Buy Request)를 분리했으므로, 구현 시 두 Engine의 책임을 한 테이블/한 Server Action에 섞지 않는다.
- **Trade Brokerage Engine**은 사실상 플랫폼의 신뢰 구조를 지탱하는 중심 Engine이다. Marketplace, Buy Request, Communication, Organization, Approval 다섯 Engine의 출력을 모두 소비하므로 가장 늦게, 가장 신중하게 구현해야 한다 (8장 참조).
- **Trust Engine**의 출력(Badge, Score)은 Company Microsite, Marketplace, Exposure 세 Engine의 UI에 노출되지만, Badge 부여/회수 로직 자체는 Trust Engine에만 존재해야 한다.
- **Analytics Engine**은 다른 Engine의 쓰기 경로(Server Action)에 절대 개입하지 않는다. 항상 별도의 읽기 경로(쿼리/뷰/집계 테이블)로 분리한다.
- **Exposure Engine ↔ Landing Page Builder Engine**: Exposure Engine은 "무엇을 노출할지"(후보 선정)를 결정하고, Landing Page Builder Engine은 "어디에, 어떤 순서로, 어떤 UI Section으로 보여줄지"를 결정한다. 예를 들어 Exposure Engine이 Featured Supplier 후보를 선정하면, Landing Page Builder Engine이 해당 섹션을 메인 랜딩페이지의 특정 순서에 배치한다. 두 Engine의 책임을 한 Module에 합치지 않는다.
- **Landing Page Builder Engine**은 항상 승인된 공개 콘텐츠만 노출해야 한다 (2.3 공통 규칙 10번). 비승인 Supplier/Product/Buy Request/Student Showcase는 Featured Content Module의 후보에서 제외한다.
- **Landing Page Builder Engine**이 생성하는 모든 Section UI는 UI Design System Engine의 Component Library Module을 사용해야 하며, Section 전용 일회성 스타일을 별도로 구현하지 않는다.

---

## 6. MVP Scope

### 6.1 MVP 포함 범위 (Engine 단위 매핑)

| Engine | MVP 범위 | 비고 |
|---|---|---|
| Identity Engine | Full | Account/Role/Profile/Session 전체 |
| Invitation Engine | Full | Agent/Professor/Student/Buyer 초대 전체 |
| Organization Engine | Full | 4개 Network Module 전체 |
| Approval Engine | Full | 7개 승인 Module 전체 |
| Supplier Membership Engine | Partial | Free/Premium 구분과 권한 매핑은 MVP. 단, 결제 자동화 제외이므로 플랜 전환은 **Admin Granted Premium Plugin**(수동 부여) 경로만 MVP에 포함하고 자동 결제 연동은 제외 |
| Company Microsite Engine | Full | `/companies/[slug]` 전체 섹션 |
| Marketplace Engine | Full | Commercial/Industrial/EPC/Sell/Buy Request 등록 전체 |
| Buy Request Engine | Full | 열람 정책/Admin Screening 전체 |
| Trade Brokerage Engine | Full | Inquiry-Proposal 중개 흐름 전체 (Meeting Request/Deal Status는 단순 상태값 수준으로 시작) |
| Communication Engine | Partial | "Basic Messaging": Agent-Buyer Chat, Professor-Student Chat, Admin Mediated Supplier-Buyer Chat, 기본 첨부, 기본 알림. Read Status 등 부가 기능은 가능하면 포함, 필수는 아님 |
| Trust Engine | Partial | "Badge" 명시 포함: Verification Module, Badge Module, Membership Badge Module은 MVP. Performance Badge(Fast Response/High Match Rate 등 산출형 배지)는 Analytics 성숙 이후로 미룰 수 있음 |
| Student Growth Engine | Partial | Student Profile, Student Showcase, Career Rank 기본 흐름은 MVP. Global Trade Passport 전체 집계, Market Research, Translation Support는 MVP-light(데이터 모델만 준비, UI는 최소) 가능 |
| Admin Control Engine | Partial | Member/Role/Invitation/Company/Product/Inquiry Brokerage/Badge Management + Audit Log는 MVP. Translation Management 고급 편집 UI는 최소화 가능 |
| Analytics Engine | Partial | "Basic Analytics" 명시 포함: Marketplace KPI, 기본 Source/Inquiry Tracking 수준 |
| Exposure Engine | Full | Homepage Exposure Module, Featured Supplier/Product/Buy Request Module, Country Gateway Module, Banner Module과 Admin Pick Plugin/Country Featured Plugin/Industry Featured Plugin 포함. Auto Ranking Plugin은 Analytics Engine의 기초 지표가 갖춰진 뒤 단계적으로 고도화 |
| Event Engine | Partial (Basic) | Event Module, Event Application Module, Admin Event Approval Plugin 등 기본 등록/신청/승인 흐름은 MVP. Attendance Module/Event Report Module의 고급 통계와 Student/Supplier/Buyer Event Plugin의 세부 기능은 Post-MVP로 단계적 확장 |
| Thailand FDA Service Engine | Full | FDA Application/Document/Quotation/Status Tracking/Completion Report Module 전체와 7개 카테고리 Plugin(Cosmetic/Food Supplement/Food/Medical Device/Import License/Label/Formula Review) 포함 |
| UI Design System Engine | Partial | Design Token Module, Component Library Module, Layout System Module, Responsive Rule Module, Form/Table/Card UI Module 등 핵심 컴포넌트는 MVP. Theme Module의 다중 테마 전환, Accessibility Module의 고급 검증은 Post-MVP로 단계적 확장 |
| Landing Page Builder Engine | Partial | Hero 관리, Section ON/OFF, Section Order, Featured Supplier/Product 수동 선택, Banner 관리, Popup 관리, Preview, Publish는 MVP. Section Scheduling(예약 발행)은 MVP 포함 권장하되, Auto Ranking Featured Plugin은 Exposure/Analytics Engine 성숙 이후 적용 |

> 2026-06-28 확정: Exposure Engine, Event Engine(Basic), Thailand FDA Service Engine은 모두 MVP 범위에 포함한다.

### 6.2 MVP 제외 범위

- 결제 자동화 (Payment Automation)
- 전자계약 (E-Contract)
- AI 추천 (AI Recommendation)
- 국가별 멀티테넌트 (Multi-tenant by Country)
- 외부 공개 API (Public API)
- 실시간 화상상담 (Real-time Video Consultation)
- A/B Test (Landing Page Builder)
- AI 자동 레이아웃 생성 (AI Auto Layout Generation)
- 고급 디자인 편집기 (Advanced Visual Design Editor)
- 실시간 드래그 앤 드롭 완전 빌더 (Full Real-time Drag-and-Drop Builder)
- 고급 개인화 추천 (Advanced Personalization Recommendation) — 세션/사용자 단위 실시간 개인화 노출. 위의 AI 추천(AI Recommendation)과는 별개로, Landing Page Builder Engine의 노출 콘텐츠까지 개인화하는 범위를 가리킨다

---

## 7. Future Scope

| Future 항목 | 연결될 Engine/확장 방향 |
|---|---|
| AI 번역 (AI Translation) | Communication Engine 확장 + Admin Control Engine의 Translation Management Module 고도화 |
| AI Buyer/Supplier 추천 (AI Recommendation) | Marketplace Engine + Buy Request Engine + Analytics Engine 확장. 신규 `AI Recommendation Plugin` |
| 결제 (Payment Automation) | 신규 **Payment Engine** 도입. Supplier Membership Engine의 Subscription Status Module과 연동 |
| 전자계약 (E-Contract) | 신규 **Contract Engine** 도입. Trade Brokerage Engine의 Deal Status Module과 연동 |
| B2G 프로젝트 (B2G Project) | Marketplace Engine 확장 (신규 Government Project Module) 또는 신규 **B2G Engine** |
| 국가별 멀티테넌트 (Multi-tenant by Country) | Platform 레벨 구조 변경. 전 Engine에 횡단 영향 (Country Scope 개념 도입) |
| 공개 API (Public API) | Platform 레벨 신규 **API Gateway Engine** 또는 Gateway Layer |
| 실시간 화상상담 (Real-time Video Consultation) | Communication Engine 확장 (신규 Video Call Module) + Trade Brokerage Engine의 Meeting Request Module과 연동 |
| A/B 테스트 / 고급 개인화 추천 (A/B Test & Advanced Personalization) | Landing Page Builder Engine 확장 (A/B Test Plugin) + Analytics Engine 연동 |
| AI 자동 레이아웃 생성 / 고급 디자인 편집기 / 완전 드래그앤드롭 빌더 | Landing Page Builder Engine + UI Design System Engine 확장 (신규 AI Layout Plugin, Visual Editor 고도화) |

---

## 8. Implementation Priority

> 본 우선순위는 "이 문서를 새 Source of Truth로 처음부터 구현한다"는 가정의 논리적 순서이며, 기존 코드의 실제 구현 완성도(이미 62개 테이블, 27개 migration 존재)와는 별개의 설계 순서다. 기존 코드 재사용 여부는 Codex 구현 단계에서 별도 판단한다.

### Phase 0 — Foundation (선행 필수)

- Identity Engine
- Invitation Engine
- Organization Engine
- Approval Engine (Module 골격만 먼저: 승인 큐 공통 구조)
- Admin Control Engine (최소 골격: Member Management, Role Management, Audit Log)
- UI Design System Engine (기본 골격: Design Token Module, Component Library Module, Layout System Module, Responsive Rule Module)

이 6개 없이는 어떤 도메인 Engine도 의미 있게 동작하지 않는다. 특히 UI Design System Engine의 기본 Design Token/Component Library는 이후 모든 화면 구현의 전제 조건이므로 가장 먼저 최소 골격을 확정한다.

### Phase 1 — Core Domain

- Supplier Membership Engine
- Company Microsite Engine
- Marketplace Engine
- Buy Request Engine

Supplier가 가입하고, 미니 홈페이지를 만들고, 제품/Buy Request를 등록·노출하는 흐름을 닫는다.

### Phase 2 — Brokered Interaction & Trust

- Trade Brokerage Engine
- Communication Engine
- Trust Engine

Buyer 문의가 Admin 중개를 거쳐 Supplier에 전달되고, 신뢰 장치(Badge/Verification)가 노출되는 흐름을 닫는다. 이 Phase가 끝나야 "관리자 통제형 글로벌 B2B 네트워크"라는 플랫폼의 핵심 가치가 동작한다.

### Phase 3 — Growth & Exposure

- Student Growth Engine
- Exposure Engine
- Event Engine

Student 활동, Featured 노출, 행사 운영을 추가한다.

### Phase 4 — Vertical Service & Depth

- Thailand FDA Service Engine
- Admin Control Engine 심화 (Site Setting, Translation Management, 운영 콘솔 고도화)
- Analytics Engine

FDA 같은 버티컬 서비스와, 운영 콘솔/분석의 깊이를 더한다.

### Phase 5 — Presentation Orchestration

- Landing Page Builder Engine (Hero Builder, Section Builder, Featured Content 수동 선택, Banner/Popup, Landing Preview, Publish Workflow)
- UI Design System Engine 심화 (Theme Module, Dashboard UI Module/Admin UI Module 고급 패턴, Accessibility Module)
- Admin Control Engine의 Landing Page Management/Section Management/Banner Management/Popup Management/Design Token Management/Theme Management/Component Setting Module

Marketplace, Company Microsite, Trust, Exposure, Event, Thailand FDA Service, Student Growth Engine이 충분한 콘텐츠를 갖춘 뒤에 Landing Page Builder Engine을 구현해야 Featured 영역이 빈 화면이 되지 않는다. 따라서 Landing Page Builder Engine은 의존하는 모든 도메인 Engine보다 늦게 구현한다.

> Phase 순서는 의존 관계(5장)를 그대로 반영한다. Phase 2(Trade Brokerage)를 Phase 1보다 먼저 시작하지 않는 이유는, Trade Brokerage Engine이 Marketplace/Buy Request Engine의 출력을 소비하기 때문이다. Phase 5(Landing Page Builder)를 가장 마지막에 두는 이유도 동일하다 — Layer 4(Presentation Orchestration)는 Layer 0~3과 Cross-cutting Engine 전체를 소비하는 가장 상위 계층이기 때문이다.

---

## 9. Codex Implementation Notes

### 9.1 문서 간 우선순위

- 기능/도메인/권한 구조: 본 문서가 1차 기준이다.
- 디렉터리 구조, 코딩 컨벤션(Server Action 전용 변경, 네이밍, 언어 정책, 번역 키, 이모지 금지 등): `AGENTS.md`를 그대로 따른다. 본 문서는 이를 대체하지 않는다.
- UI/Layout/Navigation/Dashboard Structure: `/DESIGN.md`를 그대로 따른다.
- 본 문서와 기존 `docs/01-plan/features/b2bb2g-mvp.plan.md`, `docs/02-design/features/*.md`, `docs/02-design/features/ERD.md`, `docs/02-design/features/RLS.md`가 충돌하면 본 문서를 따르고, 해당 기존 문서는 후속 ERD/RLS 재작성 시 교체 대상으로 취급한다.

### 9.2 디렉터리 매핑 가이드 (AGENTS.md 구조 유지)

`AGENTS.md`가 정의한 디렉터리 구조(`app/`, `components/`, `lib/{actions,audit,auth,queries,supabase,validators}`, `types/`, `supabase/{migrations,seed}`)는 그대로 유지한다. 그 안에서 Engine/Module 단위를 아래처럼 네이밍으로 그룹화한다.

```text
lib/actions/<engine-slug>/<module-slug>.ts
lib/queries/<engine-slug>/<module-slug>.ts
lib/validators/<engine-slug>/<module-slug>.ts
supabase/migrations/<NNN>_<engine-slug>_<module-slug>.sql
```

예: `lib/actions/marketplace/commercial-product.ts`, `supabase/migrations/0042_marketplace_commercial-product.sql`

마이그레이션 파일 상단에는 다음과 같은 주석으로 소속 Engine/Module을 명시한다.

```sql
-- Engine: Marketplace Engine
-- Module: Commercial Product Module
```

### 9.3 RLS/Audit 네이밍 가이드

- RLS 정책명: `<engine_slug>_<module_slug>_<action>` 형태 권장 (예: `marketplace_commercial_product_select_public`).
- `admin_logs` / `audit_events`의 action 분류는 `<Engine>.<Module>.<Action>` 형태로 기록해 운영 단계에서 Engine별 감사 로그 필터링이 가능하게 한다.

### 9.4 Plugin의 구현 방식

- 각 Plugin은 가능한 한 데이터로 제어되는 On/Off 스위치(`site_settings` 또는 신규 `engine_settings` 테이블)로 구현한다. 특히 Admin Control Engine의 Toggle류 Plugin(Buyer Direct Signup Toggle, Professor Invitation Toggle 등)은 코드 배포 없이 운영자가 전환할 수 있어야 한다.
- Plugin은 별도 테이블/컬럼을 새로 만들기보다, 소속 Module의 데이터에 컬럼/플래그를 추가하는 방식을 우선 검토한다 (불필요한 테이블 증식 방지).

### 9.5 기존 코드와의 관계

- 현재 저장소에는 이미 약 62개 테이블, 27개 migration, 42개 App Router 페이지가 존재한다 (`docs/03-analysis/platform-structure-audit-2026-06-28.md` 참조). 이는 **참고 자료**로만 사용한다.
- 본 문서의 Engine/Module 구조와 기존 테이블 간 1:1 매핑표는 본 문서의 책임 범위가 아니다. 이는 다음 단계인 ERD 작성에서 수행한다.
- 기존 코드를 재사용할지, 새로 작성할지는 Codex 구현 지시서 단계에서 별도로 결정한다. 본 문서는 그 결정의 전제가 되는 목표 구조만 정의한다.

### 9.6 Engine 경계 위반 점검 체크리스트 (구현 중 자가 점검용)

- [ ] 이 코드가 두 개 이상의 Engine 책임을 한 파일/한 함수에 섞고 있지 않은가?
- [ ] 승인 로직을 도메인 Engine에 직접 구현하지 않고 Approval Engine을 호출하는가?
- [ ] Badge/Verification 로직을 도메인 Engine에 직접 구현하지 않고 Trust Engine을 호출하는가?
- [ ] Buyer의 개인정보(이메일/전화번호/상세 문의)가 Supplier에게 노출되는 경로가 없는가?
- [ ] Analytics Engine 코드가 다른 Engine의 쓰기 경로에 개입하지 않는가?
- [ ] UI 컴포넌트를 UI Design System Engine의 Component Library 외부에서 새로 만들고 있지 않은가?
- [ ] Landing Page Builder Engine이 비승인 콘텐츠를 Featured 후보로 노출하고 있지 않은가?

### 9.7 Landing Page Builder / UI Design System DB 후보 테이블

아래 테이블은 최종 ERD 작성 전 단계의 **후보**다. 컬럼/제약/RLS는 ERD·RLS 작성 단계에서 확정하며, 현재 문서에서는 후보로만 표기한다.

**Landing Page Builder Engine 관련 후보 테이블**

- `landing_pages`
- `landing_sections`
- `landing_section_translations`
- `landing_section_items`
- `landing_banners`
- `landing_popups`
- `landing_publish_history`
- `landing_preview_tokens`

**UI Design System Engine 관련 후보 테이블**

- `design_tokens`
- `ui_themes`
- `component_settings`
- `dashboard_layouts`
- `dashboard_widgets`

> 이 테이블들은 최종 ERD에서 확정한다. 이름·컬럼·정규화 방식은 ERD 작성 단계에서 변경될 수 있다.

---

## 10. 다음 작업 순서 (Recommended Next Steps)

본 문서 확정 후 권장하는 작업 순서는 다음과 같다.

1. **Platform Experience Standard 작성** — Engine 공통 UX/운영 규칙 정의 (`docs/01-architecture/02-platform-experience-standard.md` 참조)
2. **Product Constitution 작성** — 플랫폼 미션, 핵심 원칙, 절대 하지 않을 것(Anti-goals) 정리
3. **User UX Matrix 작성** — Role별 화면 목록, 화면별 노출 데이터, 화면별 진입 경로 정리
4. **Permission Matrix 작성** — Role × Engine × Module × Action 권한 표 (본 문서 4장의 Module 목록을 행으로 사용)
5. **ERD 작성** — 본 문서의 Engine/Module 단위로 테이블 재설계, 기존 ERD(`docs/02-design/features/ERD.md`)와 매핑/교체
6. **RLS 작성** — Module 단위 기본 정책 + Plugin 단위 예외 규칙 (본 문서 4장의 정책 섹션을 RLS 조건으로 변환)
7. **UI/UX 작성** — `/DESIGN.md` 갱신 또는 신규 Wireframe, Role별 Dashboard 구조 확정
8. **Codex 구현 지시서 작성** — 8장의 Phase 순서를 실제 마이그레이션/파일 생성 순서로 구체화

---

*본 문서는 코드를 포함하지 않는다. 구현은 위 9~10장의 절차를 거친 후 Codex가 별도로 수행한다.*

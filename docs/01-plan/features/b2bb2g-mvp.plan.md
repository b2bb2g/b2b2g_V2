# b2bb2g-mvp - Plan Document

> Version: 1.0.0 | Date: 2026-06-18 | Status: Draft
> Level: Starter

---

## 1. Overview

### 1.1 Purpose

B2BB2G.COM은 한국 기업의 제품, 산업설비, EPC 프로젝트, BUY & SELL 게시글, 태국 식약청 인허가 서비스를 전세계 바이어와 연결하는 글로벌 B2B 네트워크 플랫폼이다.

Platform Default Language: English

Admin Default Language: Korean

본 Plan 문서는 관리자 통제형 MVP를 우선 완성하기 위한 범위, 성공 기준, 개발 순서, 리스크를 정의한다. 플랫폼은 단순 쇼핑몰이 아니라 Supplier, Buyer, Agent, Professor, Student를 Member Type 기준으로 연결하고, Career Rank를 별도 성장 등급으로 관리하는 조직형 비즈니스 네트워크 구조를 목표로 한다.

### 1.2 Background

최종 개발 방향은 처음부터 전체 확장 기능을 완성하는 것이 아니라 핵심 통제 구조를 안정화한 뒤 AI, 결제, 다국어, 전자계약, B2G 기능을 확장하는 것이다.

MVP에서 가장 중요한 기반은 다음 다섯 가지다.

- 권한 구조
- 관리자 승인 시스템
- BUY & SELL 분리
- 바이어 추천 레퍼럴
- Agent, Professor, Student 조직 구조

## 2. Goals

### 2.1 Primary Goals

- [ ] Next.js, Supabase, Vercel 기반의 모바일 우선 웹 플랫폼을 구축한다.
- [ ] 모든 회원 유형을 권한 기반으로 분리하고 대시보드를 역할별로 구성한다.
- [ ] 관리자 승인 없는 콘텐츠가 외부에 노출되지 않도록 승인 상태와 공개 조건을 표준화한다.
- [ ] 공개 메인 메뉴를 Commercial, Industrial, EPC, Event, BUY & SELL, Networking, Thailand FDA Service, Notice로 제한한다.
- [ ] Academy 관련 교수, 학생, 졸업생 기능은 로그인 후 대시보드에서만 노출한다.
- [ ] BUY & SELL을 SELL PRODUCTS와 BUY REQUEST로 명확히 분리한다.
- [ ] Buyer 추천코드, 추천링크, 하부 Buyer 조회 권한, 관리자 승인형 보상 구조를 구현한다.
- [ ] Agent와 Professor의 하부 조직 관리 및 제한된 메시지 구조를 구현한다.
- [ ] Thailand FDA Service 신청, 관리자 검토, 견적, 상태 변경, 파일 관리, 완료 보고 관리 기반을 구축한다.
- [ ] 관리자 감사 로그, Supabase RLS, 모바일 반응형 UI를 MVP 필수 품질 기준으로 적용한다.

### 2.2 Non-Goals

- AI 번역, AI 바이어 추천, AI 공급사 추천, AI 프로젝트 추천은 MVP 1차 범위에서 제외한다.
- 다국어 전체 운영, 화상회의, 전자계약, 결제 시스템은 MVP 1차 범위에서 제외한다.
- 국가별 인허가 서비스 확장, B2G 프로젝트, 정부기관 연계, 글로벌 산업 데이터 분석은 2차 확장으로 분리한다.
- 보상 자동 지급은 구현하지 않는다. 모든 보상은 관리자 승인 기반으로 처리한다.
- Event는 일반 회원 등록 기능을 제공하지 않는다. 관리자가 등록하고 회원은 참가 신청만 가능하다.
- Academy는 공개 메뉴로 제공하지 않는다.

## 3. Scope

### 3.1 In Scope

#### 3.1.1 Platform Foundation

- Next.js 프로젝트 생성
- Supabase 연결
- Supabase Auth 설정
- Supabase PostgreSQL 기반 데이터 모델링
- Supabase Storage 기반 파일 저장
- Vercel 배포
- 모바일 우선 반응형 레이아웃
- 사이트 메뉴, 카테고리, 배너, 설정의 관리자 설정 기반 관리

#### 3.1.2 Access Control

- 회원가입과 로그인
- 권한 기반 대시보드 분리
- 역할 및 권한 관리
- 관리자 승인 상태 관리
- Supabase RLS 정책 적용
- 관리자 감사 로그 저장

#### 3.1.3 Public Menu

- Commercial
- Industrial
- EPC
- Event
- BUY & SELL
- Networking
- Thailand FDA Service
- Notice

#### 3.1.4 Member Types

- Administrator
- Supplier
- Buyer
- Agent
- Professor
- Student

Career Rank는 Member Type과 분리하여 관리한다.

Student 가입 시 Global Trade Ambassador를 자동 부여한다.

졸업 시 Global Trade Associate로 자동 변경한다.

#### 3.1.5 Supplier

- 한국 기업 회원 등록
- 제품 등록
- 산업설비 등록
- EPC 프로젝트 등록
- BUY & SELL 판매글 등록
- Thailand FDA Service 신청
- 바이어 문의 확인
- 매칭 요청 확인

#### 3.1.6 Buyer

- 해외 바이어 등록
- 제품 검색
- Buy Request 등록
- 소싱 요청
- 관심 제품 저장
- 추천코드 및 추천링크 발급
- 하부 바이어 기본 정보 확인
- 문의 및 매칭 요청

#### 3.1.7 Agent

- 하부 Buyer 관리
- 하부 Buyer 리스트 확인
- 하부 Buyer와 1:1 메시지
- 하부 Buyer 전체 공지
- 추천 실적 확인
- 국가별 Buyer 네트워크 관리

#### 3.1.8 Professor

- 하부 Student 관리
- 학생 리스트 확인
- 학생 활동 확인
- 학생과 1:1 메시지
- 학생 전체 공지
- 학생 성과 리포트 확인

#### 3.1.9 Student Career Rank Activities

Student 회원이 Global Trade Ambassador Rank를 보유한 경우 수행 가능한 활동:

- 해외 Buyer 발굴
- 한국 Supplier 제품 소개
- Supplier가 등록한 승인 제품을 기반으로 Showcase 구성
- BUY REQUEST 수집 및 연결
- Buyer와 Supplier 간 Matching 요청 지원
- 국가별 시장조사 작성
- Event 및 전시박람회 참여 지원
- Referral 활동
- Badge 획득
- Reward 획득
- Global Trade Passport 관리

Student는 제품을 직접 등록하지 않는다.

제품 등록 책임은 Supplier 또는 Administrator에게 있다.

Student는 승인된 Supplier 제품을 선택하여 본인 Showcase에 소개할 수 있다.

#### 3.1.10 Alumni Career Rank Activities

Global Trade Associate 이상 Rank 보유자:

- 활동 이력 유지
- Badge 유지
- Reward 유지
- 바이어 네트워크 유지
- 전문가 또는 Agent 전환 가능

#### 3.1.11 BUY & SELL

- SELL PRODUCTS: 한국 기업의 제품, 산업설비, 서비스, 프로젝트 소개
- BUY REQUEST: 해외 바이어의 제품, 설비, 원자재, 서비스, 프로젝트 요청 등록
- 모든 게시글 관리자 승인 후 노출

#### 3.1.12 Event

- 관리자 전용 Event 등록
- 해외 전시박람회, 무역전시회, 기업 행사, 산업 세미나, 정부기관 행사, 대학교 행사, B2B 매칭 행사 관리
- 회원 참가 신청

#### 3.1.13 Thailand FDA Service

- Cosmetic Registration
- Food Supplement Registration
- Food Registration
- Medical Device Registration
- Import License Support
- Label Compliance
- Formula Review
- 신청 상태: Draft, Submitted, Reviewing, Waiting Documents, Quoted, In Progress, Completed, Rejected
- 관리자 검토, 견적, 상태 변경, 파일 관리, 완료 보고서 관리

#### 3.1.14 Referral System

- 모든 Buyer의 추천코드와 추천링크
- 추천 관계 관리
- 상위 Buyer의 하부 Buyer 기본 정보 조회
- 이메일 전체, 전화번호 전체, 상세 문의내용, 계약금액, 관리자 메모 비노출
- 관리자 승인 기반 보상
- 보상 종류: Reward, Career Rank 상승, Badge, 매칭 우선권, 이벤트 참여 우선권, 관리자 수동 보상

#### 3.1.15 Communication System

- 1:1 메시지
- 파일, PDF, 이미지 첨부
- 읽음 표시
- 공지 발송
- 관리자 열람
- 감사 로그
- Agent는 하부 Buyer와만 소통
- Professor는 하부 Student와만 소통
- 관리자는 전체 메시지 열람 및 차단 가능

#### 3.1.16 Global Trade Passport

- 가입일
- 소속 대학
- 담당 교수
- 활동 이력
- Badge 획득 이력
- Reward 획득 이력
- 유치 바이어 수
- 등록 제품 수
- 매칭 수
- 참여 프로젝트
- 졸업 여부
- 현재 등급

#### 3.1.17 Admin Dashboard

- Dashboard
- 회원관리
- Supplier 관리
- Buyer 관리
- Agent 관리
- Professor 관리
- Student 관리
- Career Rank 관리
- 제품관리
- Industrial 관리
- EPC 관리
- BUY & SELL 관리
- Event 관리
- Thailand FDA Service 관리
- Referral 관리
- Reward 관리
- Badge 관리
- Message 관리
- Notice 관리
- Banner 관리
- Site Settings
- 통계관리
- 감사로그

#### 3.1.18 Student Showcase

Student는 직접 제품을 등록하지 않고, 승인된 Supplier 제품을 기반으로 본인 Showcase를 구성할 수 있다.

Student Showcase는 Global Trade Ambassador 활동을 위한 제품 소개 공간이다.

Showcase에 포함되는 제품의 원본 소유권과 수정 권한은 Supplier에게 있다.

Student는 다음 활동을 할 수 있다.

- 승인된 제품 선택
- Showcase 설명 작성
- 대상 국가 설정
- Buyer에게 Showcase 공유
- Showcase 기반 Matching 요청
- Showcase 성과 확인

Showcase 게시 전 관리자가 검토할 수 있다.

Showcase는 제품 등록이 아니라 제품 소개 활동으로 분류한다.

### 3.2 Out of Scope

- 운영 자동화형 보상 지급
- 일반 회원 Event 직접 등록
- 공개 Academy 메뉴
- 확장 AI 기능
- 결제, 전자계약, 화상회의
- 다국어 운영 전체 범위
- B2G 프로젝트와 정부기관 연계

## 4. Functional Requirements

### 4.1 Content Governance

- 모든 외부 노출 콘텐츠는 관리자 승인 상태를 가져야 한다.
- 제품, 산업설비, EPC, BUY & SELL, Buy Request, Event, Notice, Banner는 승인 또는 관리자 생성 정책을 따른다.
- 승인되지 않은 콘텐츠는 공개 목록, 검색, 상세 페이지에서 제외한다.
- 관리자 변경 행위는 admin_logs에 기록한다.

### 4.2 Role-Based Dashboard

- 회원 유형별로 접근 가능한 메뉴와 데이터 범위를 분리한다.
- Administrator는 전체 관리 기능에 접근한다.
- Supplier는 본인 기업과 등록 콘텐츠, FDA 신청, 문의, 매칭 요청에 접근한다.
- Buyer는 검색, Buy Request, 관심 제품, 추천 링크, 하부 Buyer 기본 정보에 접근한다.
- Agent는 하부 Buyer 네트워크에만 접근한다.
- Professor는 하부 Student에만 접근한다.
- Student는 활동 이력, Reward, Passport 중심으로 접근한다.
- Career Rank에 따라 추가 기능을 제공할 수 있다.

### 4.3 Data-Driven Configuration

- 메뉴, 카테고리, Badge, Reward, Career Rank, 권한은 하드코딩하지 않고 관리자 설정 기반으로 관리한다.
- 공개 메뉴와 대시보드 메뉴는 관리자 설정과 권한 정책을 함께 따른다.
- 사이트 설정, 배너, 카테고리는 관리자 대시보드에서 변경 가능해야 한다.

### 4.4 Security and Privacy

- Supabase RLS 정책은 모든 주요 테이블에 적용한다.
- 사용자 입력은 서버 경계에서 검증한다.
- 추천 관계에서 상위 Buyer가 볼 수 있는 정보와 볼 수 없는 정보를 명확히 분리한다.
- 메시지와 첨부 파일 접근은 대화 참여자, 관리자, 조직 관계 기준으로 제한한다.
- 비밀키와 환경변수는 클라이언트에 노출하지 않는다.

## 5. Required Data Model

MVP 설계 단계에서 다음 테이블을 기준으로 상세 스키마와 RLS 정책을 정의한다.

- profiles
- member_types
- career_ranks
- roles
- permissions
- suppliers
- buyers
- agents
- professors
- students
- companies
- countries
- regions
- industries
- company_types
- country_agents
- languages
- translations
- products
- industrial_posts
- epc_posts
- buy_sell_posts
- buy_requests
- matching_requests
- events
- event_applications
- thailand_fda_applications
- referral_codes
- referral_relations
- rewards
- badges
- activity_logs
- company_verifications
- featured_contents
- seo_metadata
- audit_events
- conversations
- conversation_members
- messages
- message_attachments
- announcements
- notifications
- menus
- categories
- banners
- site_settings
- admin_logs
- files

## 6. Non-Functional Requirements

- 모바일 우선 반응형 UI를 기본으로 한다.
- 관리 화면은 반복 운영에 적합한 밀도와 일관성을 가져야 한다.
- 공개 화면은 승인된 콘텐츠만 빠르게 탐색할 수 있어야 한다.
- Supabase Auth, PostgreSQL, Storage를 기준으로 권한과 파일 접근을 통합한다.
- 감사 로그는 관리자 변경, 승인, 차단, 상태 변경 등 주요 이벤트를 추적해야 한다.
- 플랫폼 확장을 위해 AI, 결제, 다국어, 전자계약 기능은 독립 모듈로 추가 가능한 구조를 고려한다.

## 7. Success Criteria

- [ ] 회원가입, 로그인, 역할 기반 리다이렉트가 동작한다.
- [ ] Administrator, Supplier, Buyer, Agent, Professor, Student의 기본 접근 권한이 분리된다.
- [ ] Career Rank System이 Member Type과 분리되어 동작한다.
- [ ] 관리자 대시보드에서 회원, 메뉴, 카테고리, 사이트 설정을 관리할 수 있다.
- [ ] Supplier, Buyer, Agent, Professor, Student 등록 흐름이 구현된다.
- [ ] 제품, BUY & SELL, Buy Request가 등록되고 관리자 승인 후 공개된다.
- [ ] BUY & SELL은 SELL PRODUCTS와 BUY REQUEST로 분리되어 조회된다.
- [ ] Student는 제품을 직접 등록할 수 없다.
- [ ] Student는 승인된 Supplier 제품을 기반으로 Showcase를 구성할 수 있다.
- [ ] Student Showcase는 관리자 승인 또는 검토 후 공개 가능하다.
- [ ] Event는 관리자만 등록하고 회원은 참가 신청만 할 수 있다.
- [ ] Thailand FDA Service 신청과 상태 관리가 가능하다.
- [ ] Buyer 추천코드, 추천링크, 추천 관계, 기본 보상 승인 구조가 동작한다.
- [ ] 1:1 메시지와 첨부 파일, 읽음 표시, 관리자 열람, 감사 로그가 동작한다.
- [ ] 주요 테이블에 RLS 정책이 적용된다.
- [ ] 관리자 승인 없는 콘텐츠가 공개 화면에 노출되지 않는다.
- [ ] 모바일 주요 화면에서 메뉴, 목록, 상세, 폼 사용성이 유지된다.
- [ ] Vercel 배포가 완료되고 Supabase 환경변수 연결이 검증된다.

## 8. Schedule

| Phase | Scope | Target Date | Status |
|-------|-------|------------|--------|
| Plan | MVP 범위, 요구사항, 성공 기준 정리 | 2026-06-18 | In Progress |
| Design | DB 스키마, RLS, 라우팅, 대시보드, API 설계 | TBD | Pending |
| Implementation 1 | Next.js 생성, Supabase 연결, Auth, 권한 구조, 기본 레이아웃 | TBD | Pending |
| Implementation 2 | 관리자 대시보드, 회원관리, 메뉴관리, 카테고리관리, 사이트 설정 | TBD | Pending |
| Implementation 3 | Supplier, Buyer, Agent, Professor, Student, Career Rank 구조 | TBD | Pending |
| Implementation 4 | Commercial, Industrial, EPC, BUY & SELL 게시 구조 | TBD | Pending |
| Implementation 5 | Referral, Message, Notification | TBD | Pending |
| Implementation 6 | Event, Thailand FDA Service | TBD | Pending |
| Review | 모바일 UI, RLS 보안, 배포, 테스트 | TBD | Pending |

## 9. Development Priority

### Phase 1

- Next.js 프로젝트 생성
- Supabase 연결
- Auth 설정
- 권한 구조 설계
- 기본 레이아웃 구성

### Phase 2

- 관리자 대시보드
- 회원관리
- 메뉴관리
- 카테고리관리
- 사이트 설정

### Phase 3

- Supplier 구조
- Buyer 구조
- Agent 구조
- Professor 구조
- Student 구조
- Career Rank 구조

### Phase 4

- Commercial 게시 구조
- Industrial 게시 구조
- EPC 게시 구조
- BUY & SELL 게시 구조

### Phase 5

- Referral
- Message
- Notification

### Phase 6

- Event
- Thailand FDA Service

### Phase 7

- 모바일 UI 개선
- RLS 보안 점검
- Vercel 배포
- 테스트

## 10. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 역할과 권한 범위가 커져 초기 구현이 복잡해질 수 있음 | High | High | MVP에서 권한 매트릭스를 먼저 설계하고 역할별 최소 기능부터 구현 |
| 관리자 승인 정책이 누락되면 비승인 콘텐츠가 노출될 수 있음 | High | Medium | 모든 공개 쿼리에 approval status 조건과 RLS 정책을 이중 적용 |
| Referral 개인정보 노출 범위가 불명확해질 수 있음 | High | Medium | 상위 Buyer 조회 필드를 별도 뷰 또는 제한 API로 설계 |
| 메뉴, 카테고리, Badge, Reward, Career Rank를 하드코딩할 위험 | Medium | Medium | 초기 설계에서 설정 테이블과 관리자 UI를 필수 항목으로 고정 |
| 메시지 권한 모델이 복잡해질 수 있음 | High | Medium | conversation_members와 조직 관계 검증을 기준으로 접근 정책 설계 |
| Supabase RLS 정책 누락 가능성 | High | Medium | 설계 단계에서 테이블별 RLS 체크리스트 작성 |
| MVP 범위가 과도해 일정이 늘어날 수 있음 | Medium | High | 1차 구현은 인증, 권한, 승인, 핵심 게시, 추천, 메시지로 제한 |

## 11. Architecture Considerations

- Frontend: Next.js
- Backend: Supabase
- Database: Supabase PostgreSQL
- Auth: Supabase Auth
- Storage: Supabase Storage
- Deployment: Vercel
- Responsive: Mobile First

설계 단계에서는 다음 항목을 반드시 상세화한다.

- 역할 및 권한 매트릭스
- 공개 메뉴와 대시보드 메뉴 구조
- 테이블별 승인 상태 정책
- 테이블별 RLS 정책
- 관리자 감사 로그 이벤트 목록
- 파일 업로드와 접근 권한
- Referral 관계와 개인정보 마스킹 정책
- 메시지 접근 정책
- Career Rank와 Member Type 분리 정책
- Country, Industry, Company Type 관리 정책
- Public Company Page와 SEO metadata 정책
- Language Architecture
- Public Website: English
- Admin Dashboard: Korean
- Translation Key System
- Future i18n Expansion
- Vercel 환경변수와 Supabase 키 관리

## 12. Convention Prerequisites

- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case
- 하드코딩 금지
- 이모지 사용 금지
- 사용자 입력 검증 필수
- 명시적 에러 처리 우선
- OWASP Top 10 기준 보안 검토
- `.env`와 credentials 파일 커밋 금지

## 13. MVP 1st Release Checklist

- [ ] 회원가입/로그인
- [ ] 권한 분리
- [ ] 관리자 대시보드
- [ ] 메뉴 관리
- [ ] 카테고리 관리
- [ ] Supplier 등록
- [ ] Buyer 등록
- [ ] Agent 등록
- [ ] Professor 등록
- [ ] Student 등록
- [ ] Career Rank System
- [ ] Student Showcase
- [ ] Student Market Research
- [ ] Student Buyer Referral Activity
- [ ] 제품 등록
- [ ] BUY & SELL 등록
- [ ] Buy Request 등록
- [ ] Event 관리자 등록
- [ ] Thailand FDA Service 신청
- [ ] Referral 기본 구조
- [ ] 1:1 메시지
- [ ] 관리자 승인 시스템
- [ ] Public Company Page
- [ ] Company SEO Structure
- [ ] Company Verification
- [ ] Notification Center
- [ ] Company Type Management
- [ ] Country Management
- [ ] Industry Management
- [ ] English Public Website
- [ ] Korean Admin Dashboard
- [ ] Translation Key System
- [ ] 모바일 반응형 UI
- [ ] Vercel 배포

## 14. References

- User-provided document: B2BB2G.COM 최종 개발 기획서 V1.2
- PDCA skill: `/Users/hello_j/.bkit-codex/.agents/skills/pdca/SKILL.md`


# 15. Additional Requirements (Mandatory Enhancements)

## 15.1 Company Approval Workflow

### Purpose

B2B 플랫폼의 신뢰성을 확보하기 위해 Supplier 기업은 반드시 관리자 검증 절차를 거쳐야 한다.

### Company Status

draft

submitted

reviewing

approved

rejected

suspended

### Company Verification Status

pending

verified

rejected

suspended

### Company Approval vs Verification

approved는 회사 승인 상태를 의미한다.

verified는 회사 검증 상태를 의미한다.

Alibaba 스타일 운영을 위해 승인과 검증은 별도 상태로 관리한다.

### Required Company Information

Company Name

Business Registration Number

Country

Representative Name

Website

Company Introduction

Company Brochure

Company Catalog

Certificates

Factory Information

Export Countries

### Admin Review Items

사업자등록증 확인

회사 정보 확인

카탈로그 확인

인증서 확인

웹사이트 확인

허위 기업 여부 확인

### Approval Policy

승인된 기업만 공개 노출 가능

승인된 기업만 제품 등록 가능

승인된 기업만 BUY & SELL 등록 가능

승인된 기업만 Thailand FDA Service 신청 가능

---

## 15.2 Verification Badge System

### Purpose

검증된 회원을 시각적으로 구분하여 플랫폼 신뢰도를 향상시킨다.

### Badge Types

Verified Company

Verified Buyer

Verified Agent

Verified Professor

Verified Student

Verified Alumni

### Badge Assignment

관리자 수동 승인

향후 자동 검증 확장 가능

### Badge Visibility

회원 프로필

기업 프로필

제품 상세 페이지

BUY & SELL

검색 결과

---

## 15.3 Country Structure

### Purpose

향후 국가별 운영 및 Country Agent 확장을 위한 기반 구조

### Countries Table

Country Name

Country Code

Region

Status

Display Order

### Country Agents Table

country_agents

country_id

agent_id

status

assigned_at

### Regions Table

Asia

Southeast Asia

Middle East

Europe

North America

South America

Africa

Oceania

### Future Usage

Country Agent

국가별 통계

국가별 BUY & SELL

국가별 Event

국가별 Thailand FDA Service

국가별 Buyer 검색

국가별 Supplier 검색

---

## 15.4 Notification Center

### Purpose

회원 활동 및 관리자 처리 상태를 실시간으로 전달

### Notification Types

New Message

New Inquiry

New Match Request

New Buy Request

Approval Completed

Approval Rejected

Badge Granted

Referral Reward Approved

Thailand FDA Status Updated

Event Registration Approved

Announcement Published

### Delivery Channels

In-App Notification

Email Notification

### Notification Status

Unread

Read

Archived

---

## 15.5 Revenue Model

### Purpose

플랫폼 수익 구조 정의

### Revenue Stream 1

Supplier Premium Membership

월 구독

연 구독

### Revenue Stream 2

Thailand FDA Service Fee

화장품 등록

건강기능식품 등록

식품 등록

의료기기 등록

수입업 라이선스

태국어 라벨 검토

성분 검토

### Revenue Stream 3

Featured Product

메인 노출 상품

카테고리 상단 노출

### Revenue Stream 4

Featured Company

추천 기업 노출

프리미엄 기업관

### Revenue Stream 5

Event Sponsorship

행사 스폰서

배너 광고

### Revenue Stream 6

Future Expansion

Verified Company Upgrade

B2G Project Matching

Government Program Matching

International Business Matching

### MVP Revenue Exclusion

Verified Company Upgrade는 향후 추가 가능하지만 MVP에는 포함하지 않는다.

---

## 15.6 Audit & Compliance

### Purpose

관리자 활동 추적 및 보안 강화

### Audit Log Events

회원 승인

회원 거절

기업 승인

기업 거절

제품 승인

제품 거절

BUY & SELL 승인

Thailand FDA 상태 변경

배지 부여

Reward 승인

메시지 차단

계정 정지

관리자 설정 변경

### Log Fields

Actor

Action

Target

Before Value

After Value

IP Address

Created At

---

## 15.7 Search & Filter System

### Purpose

글로벌 바이어 및 기업 검색 편의성 향상

### Supplier Search

Company Name

Country

Industry

Product Category

Certification

Export Country

### Buyer Search

Country

Industry

Company Name

Activity Status

### Product Search

Category

Keyword

Country

Supplier

Industry

### Buy Request Search

Country

Industry

Product Type

Status

---

## 15.8 Media Library

### Purpose

플랫폼 내 업로드 파일 통합 관리

### Supported Files

Image

PDF

Word

Excel

Video

Catalog

Certificate

### Media Management

Upload

Delete

Replace

Preview

Download

Folder Structure

### Admin Controls

File Size Limit

Allowed Extensions

Storage Usage Monitoring

Unused File Detection

---

## 15.9 Multi-Language Ready Structure

### Purpose

향후 다국어 지원을 위한 구조 준비

### Default Language

English

### Future Languages

Korean

Thai

Vietnamese

Chinese

Japanese

Arabic

Spanish

### Development Rule

모든 UI 텍스트 하드코딩 금지

Translation Key 기반 설계

향후 i18n 구조 확장 가능하도록 설계

### Platform Language Policy

Public Website Default Language

English

Admin Dashboard Default Language

Korean

Member Dashboard Default Language

English

System Notifications

English

Admin Notifications

Korean

Future Multi-Language Expansion

Korean

Thai

Vietnamese

Chinese

Japanese

Arabic

Spanish

Development Rule

Public UI는 English 기준으로 개발한다.

Admin UI는 Korean 기준으로 개발한다.

모든 텍스트는 Translation Key 기반으로 관리한다.

하드코딩된 언어 문자열 사용 금지.

### Translation Data Structure

languages

translations

translations fields:

id

language_code

translation_key

translation_value

---

## 15.10 Business Matching System

### Purpose

Supplier, Buyer, Agent, Professor, Student 간 비즈니스 연결을 지원한다.

### Matching Types

Supplier ↔ Buyer

Supplier ↔ Agent

Buyer ↔ Agent

Professor ↔ Supplier

Student(Global Trade Ambassador Career Rank) ↔ Buyer

### Matching Status

Requested

Reviewing

Approved

Rejected

Closed

### Matching Management

관리자 승인

매칭 이력 저장

매칭 통계 제공

매칭 상태 추적

---

## 15.11 Organization Network Structure

### Agent Network

Agent

├ Buyer A

├ Buyer B

├ Buyer C

### Professor Network

Professor

├ Student A

├ Student B

├ Student C

### Alumni Network

Global Trade Associate

↓

Global Trade Specialist

↓

Global Trade Partner

↓

Global Trade Leader

### Global Trade Passport

모든 회원의 활동 이력

추천 이력

매칭 이력

배지

Reward

성과 기록

누적 관리

---

## 15.12 Security Requirements

### Mandatory Security

Supabase RLS 필수

Role-Based Access Control

JWT Validation

Server Side Validation

Audit Logging

Rate Limiting

File Upload Validation

IP Tracking

### Privacy Protection

이메일 마스킹

전화번호 마스킹

추천인 개인정보 제한

조직 외 데이터 접근 차단

관리자 외 전체 데이터 접근 금지

### OWASP Compliance

OWASP Top 10 기준 검토

XSS 방어

CSRF 방어

SQL Injection 방어

File Upload 보안 검증

Authentication 보안 검증


## 15.13 Final Architecture Decisions (Pre-Development Mandatory)

### Purpose

개발 시작 전 최종 아키텍처 표준을 정의한다.

회원 유형, 등급 구조, 산업 분류, 국가 구조, 공개 기업 페이지 정책을 표준화하여 향후 확장성과 유지보수성을 확보한다.

---

# A. Member Type Standardization

### Purpose

회원 유형(Member Type)과 등급(Rank)을 분리하여 권한 구조를 단순화한다.

---

### Member Types

Administrator

Supplier

Buyer

Agent

Professor

Student

---

### Description

Administrator

플랫폼 전체 관리

---

Supplier

한국 기업 회원

---

Buyer

해외 바이어

---

Agent

국가별 에이전트

---

Professor

대학교수

---

Student

학생 회원

---

### Development Rule

권한은 Member Type 기준으로 관리한다.

RLS 정책은 Member Type 기준으로 적용한다.

Dashboard는 Member Type 기준으로 분리한다.

---

# B. Career Rank System

### Purpose

학생부터 졸업생, 전문가까지 성장 이력을 관리한다.

---

### Career Ranks

Global Trade Ambassador

Global Trade Associate

Global Trade Specialist

Global Trade Partner

Global Trade Leader

---

### Default Rules

Student 가입 시

Global Trade Ambassador 자동 부여

---

졸업 처리 시

Global Trade Associate 자동 변경

---

향후 활동 실적에 따라

Specialist

Partner

Leader

승급 가능

---

### Development Rule

Career Rank는 권한이 아닌 등급 개념이다.

Member Type과 분리 관리한다.

---

# C. Company Type Structure

### Purpose

기업 유형을 분류하여 검색성과 매칭 정확도를 높인다.

---

### Company Types

Manufacturer

Brand Owner

Distributor

Trading Company

Service Provider

University

Government Agency

Association

Research Institute

---

### Admin Functions

Company Type 추가

Company Type 수정

Company Type 비활성화

Display Order 관리

---

# D. Industry Master Structure

### Purpose

플랫폼 전체 산업 분류 표준

---

### Industry Categories

Food & Beverage

Cosmetics

Medical Device

Pharmaceutical

Health Supplement

Industrial Equipment

Machinery

Automation

Construction

EPC

Chemical

Agriculture

Energy

ICT

AI

Education

Logistics

Government

Research

Others

---

### Development Rule

산업 카테고리 하드코딩 금지

관리자 설정 기반

---

# E. Country Structure Enhancement

### Purpose

Country Agent 및 국가별 운영 확장 준비

---

### Countries

Country Name

Country Code

Region

Status

Display Order

---

### Country Agents

country_agents

country_id

agent_id

status

assigned_at

---

### Regions

Asia

Southeast Asia

Middle East

Europe

North America

South America

Africa

Oceania

---

### Future Expansion

Country Dashboard

Country Agent

Country Statistics

Country Event

Country FDA Service

Country Matching

---

# F. Language Profile Structure

### Purpose

향후 다국어 운영 대비

---

### Language Fields

Primary Language

Secondary Language

Additional Languages

---

### Supported Languages

English

Korean

Thai

Chinese

Japanese

Vietnamese

Arabic

Spanish

---

### Apply To

Profiles

Companies

Buyers

Agents

Professors

Students

---

# G. Featured Content Structure

### Purpose

프리미엄 노출 상품 개발

---

### Featured Levels

Normal

Featured

Premium Featured

Top Featured

---

### Featured Fields

featured_level

featured_until

featured_by

---

### Apply To

Companies

Products

BUY & SELL

Events

---

# H. Approval Status Standardization

### Purpose

전체 시스템 승인 상태 통일

---

### Standard Status

draft

submitted

reviewing

approved

rejected

suspended

archived

---

### Apply To

Companies

Products

Industrial

EPC

BUY & SELL

Buy Requests

Thailand FDA Service

Events

Matching Requests

---

# I. Public Company Page

### Purpose

기업별 공개 홍보 페이지 제공

---

### URL Structure

/companies/[slug]

---

### Example

/companies/samsung-electronics

/companies/lg-energy-solution

---

### Company Page Sections

Company Overview

Products

Industrial Projects

EPC Projects

BUY & SELL

Certificates

Catalogs

Export Countries

Contact Information

Inquiry Form

---

### SEO Requirements

SEO Friendly URL

Meta Title

Meta Description

Open Graph

Structured Data

Sitemap Inclusion

---

### Benefits

Google 검색 노출

기업 홍보

바이어 유입

문의 증가

브랜드 신뢰도 향상

---

# J. Future Ready Principle

### Purpose

향후 AI 및 B2G 확장 대비

---

### Development Rule

모든 신규 기능은

모듈형 구조

권한 기반 구조

설정 기반 구조

다국어 확장 구조

를 유지해야 한다.

---

### Strict Prohibitions

하드코딩 금지

Role 하드코딩 금지

Category 하드코딩 금지

Country 하드코딩 금지

Industry 하드코딩 금지

Badge 하드코딩 금지

Point 하드코딩 금지

Menu 하드코딩 금지

Status 하드코딩 금지

모든 항목은 관리자 설정 기반으로 관리한다.


## 15.14 Enterprise Grade Requirements

### Purpose

B2BB2G.COM을 단순 MVP가 아닌 글로벌 확장형 B2B 플랫폼으로 설계하기 위한 운영, 보안, 데이터 거버넌스, 확장 정책을 정의한다.

---

# A. Data Ownership Policy

### Purpose

플랫폼 내 데이터 소유권을 명확히 정의한다.

### Ownership Rules

회원이 등록한 콘텐츠의 원본 소유권은 등록자에게 있다.

플랫폼은 서비스 운영을 위한 사용 권한을 가진다.

삭제된 데이터는 관리자 정책에 따라 보관 또는 완전 삭제할 수 있다.

---

# B. Soft Delete Policy

### Purpose

데이터 무결성 유지

### Rule

중요 데이터는 Hard Delete 금지

삭제 시

deleted_at

deleted_by

보관

---

### Apply To

Companies

Products

BUY & SELL

Messages

FDA Applications

Events

Matching Requests

Users

---

# C. Activity Timeline

### Purpose

모든 회원의 활동 이력 제공

### Timeline Events

회원가입

프로필 수정

제품 등록

BUY & SELL 등록

바이어 유치

매칭 요청

FDA 신청

이벤트 참가

배지 획득

등급 변경

---

# D. KPI Dashboard

### Purpose

운영자 KPI 관리

### Platform KPI

총 회원 수

총 Supplier 수

총 Buyer 수

총 Agent 수

총 Professor 수

총 Student 수

총 제품 수

총 BUY REQUEST 수

총 FDA 신청 수

총 매칭 수

국가별 회원 수

---

# E. Supplier Score System

### Purpose

우수 기업 노출

### Score Factors

프로필 완성도

인증서 등록

제품 등록 수

응답 속도

문의 응답률

매칭 성공 수

관리자 평가

---

# F. Buyer Score System

### Purpose

우수 바이어 관리

### Score Factors

프로필 완성도

활동 빈도

BUY REQUEST 등록

문의 수

매칭 참여

추천 활동

---

# G. Agent Performance System

### Purpose

국가별 에이전트 성과 평가

### Metrics

하부 Buyer 수

활성 Buyer 수

매칭 수

거래 연결 수

국가 성장률

---

# H. Professor Performance System

### Purpose

산학협력 성과 관리

### Metrics

학생 수

활성 학생 수

바이어 유치 수

프로젝트 참여 수

산학협력 건수

---

# I. Student Performance System

### Purpose

Global Trade Ambassador 성과 관리

### Metrics

유치 Buyer 수

등록 제품 수

매칭 수

프로젝트 참여 수

활동 점수

---

# J. Global Search Architecture

### Purpose

플랫폼 통합 검색

### Search Targets

Companies

Products

Industrial Projects

EPC Projects

BUY & SELL

Events

Buy Requests

Buyers

Agents

Professors

Students

---

# K. Public SEO Architecture

### Purpose

검색엔진 최적화

### SEO Targets

Company Pages

Product Pages

Industrial Pages

EPC Pages

BUY & SELL Pages

Event Pages

---

### Required SEO Fields

Meta Title

Meta Description

Keywords

OG Image

Canonical URL

Structured Data

---

# L. Multi-Tenant Ready Architecture

### Purpose

향후 국가별 플랫폼 확장

### Future Domains

kr.b2bb2g.com

th.b2bb2g.com

vn.b2bb2g.com

id.b2bb2g.com

---

### Rule

국가별 데이터 분리 가능 구조 유지

---

# M. API Governance

### Purpose

향후 API 공개 준비

### Rules

API Versioning

Rate Limiting

API Key Management

Audit Logging

Usage Tracking

---

# N. Compliance Framework

### Purpose

글로벌 서비스 운영 대비

### Compliance Targets

GDPR Ready

PDPA Ready

Korea Privacy Law Ready

Cookie Consent Ready

Data Export Ready

Account Deletion Request Ready

---

# O. Disaster Recovery

### Purpose

서비스 안정성 확보

### Requirements

Database Backup

Storage Backup

Recovery Plan

Audit Log Preservation

Critical Data Recovery

---

# P. Business Intelligence

### Purpose

향후 데이터 분석 기반 운영

### Analytics

회원 성장 분석

국가별 성장 분석

산업별 분석

FDA 서비스 분석

매칭 성공률 분석

Referral 분석

---

# Q. Future B2G Expansion

### Purpose

정부기관 연계 대비

### Future Entities

Government Agency

Trade Association

Chamber of Commerce

Export Promotion Agency

Research Institute

University Industry Foundation

---

### Examples

KOTRA

대한상공회의소

한국무역협회

산학협력단

태국 정부기관

동남아 정부기관

---

# Final Rule

B2BB2G.COM은 단순 B2B Marketplace가 아니다.

기업

바이어

에이전트

대학교

학생

졸업생

정부기관

산업 프로젝트

를 연결하는 Global Business Network Platform으로 설계한다.

모든 기능은

설정 기반

권한 기반

감사 가능

확장 가능

다국어 대응 가능

구조를 유지해야 한다.

Public-facing service language must be English by default.

Admin dashboard language must be Korean by default.

## 15.15 Final Development Rules

All Agents must belong to at least one country.

All Suppliers must select Company Type.

Public Company Page is mandatory for MVP.

Point System is deferred to Phase 2.

Career Rank is separated from Member Type.

Country, Industry, Company Type must be managed from Admin Dashboard.

Matching Requests table is mandatory.

company_verifications, activity_logs, featured_contents, seo_metadata, audit_events are required for operations, SEO, auditability, and future extensibility.

Student는 제품 등록자가 아니다.

Student는 Global Trade Ambassador로서 Buyer 발굴, Supplier 제품 소개, Showcase 운영, 시장조사, Event 지원, Matching 연결 활동을 수행한다.

Student Showcase는 Supplier 제품을 기반으로 구성하며, 원본 제품 데이터의 수정 권한은 Supplier 또는 Administrator에게만 있다.

---

### Company Type Required

Supplier 등록 시 Company Type 필수 입력

Manufacturer

Brand Owner

Distributor

Trading Company

Service Provider

University

Government Agency

Association

Research Institute

---

### Country Agent Policy

모든 Agent는 Country 정보를 가진다.

Agent는 하나 이상의 Country를 담당할 수 있다.

Country Agent 구조를 기본 운영 모델로 사용한다.

---

### Public Company Page

MVP 필수 포함

URL

/companies/[slug]

기능

회사소개

제품

인증서

카탈로그

문의

BUY & SELL

SEO 최적화

---

### Future Development

Points System은 2차 개발

MVP는 Badge + Reward 중심으로 운영

포인트 기능은 추후 활성화한다.

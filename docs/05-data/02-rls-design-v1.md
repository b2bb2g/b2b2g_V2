# RLS Design v1

## 1. RLS Purpose

본 문서는 B2BB2G V2의 Supabase RLS 설계 v1이다. `docs/05-data/01-erd-v1.md`와 `docs/04-permissions/01-permission-matrix.md`를 기준으로 table별 접근 정책, helper 함수 후보, testing matrix를 정의한다.

본 문서는 설계 문서이며 SQL이 아니다. SQL migration, 실제 Supabase DB 수정, UI 수정, application code 작성은 포함하지 않는다.

## 2. RLS Principles

| Principle ID | Principle |
| --- | --- |
| RLS-P-001 | RLS는 최종 데이터 접근 제어 계층이다. |
| RLS-P-002 | Client-side UI 차단은 보조 수단일 뿐이다. |
| RLS-P-003 | 모든 business table은 RLS enabled가 기본이다. |
| RLS-P-004 | Anonymous는 승인된 공개 콘텐츠만 읽을 수 있다. |
| RLS-P-005 | Authenticated는 본인/소속/하부/중개 범위만 접근한다. |
| RLS-P-006 | Admin은 운영상 필요한 접근을 가진다. |
| RLS-P-007 | Service role은 서버 전용이고 일반 사용자 흐름에 사용하지 않는다. |
| RLS-P-008 | Buyer PII는 Supplier에게 직접 노출하지 않는다. |
| RLS-P-009 | Supplier-Buyer direct messaging은 DB/RLS에서 차단한다. |
| RLS-P-010 | Feature Flag는 RLS 우회 장치가 아니다. |
| RLS-P-011 | Permission Matrix와 충돌하면 Permission Matrix를 우선한다. |

Scope mapping:

| Permission Scope | RLS Meaning |
| --- | --- |
| Public | approved/published/active and not deleted |
| Owner | current auth user owns the account/domain row |
| Related | explicit relation exists through company member, conversation member, event application, file relation, or assignment |
| Subordinate | Agent-Buyer or Professor-Student relation exists |
| Brokered | brokerage case participant or valid contact release exists |
| Admin | current auth user has Administrator role |
| System | server-only task path, never client-imported |

## 3. Helper Function Design

Helper functions are design candidates. Actual SQL body, volatility, search path, and security definer implementation must be reviewed during RLS migration planning.

| Helper | Purpose | Input | Output | Used By Tables | Security Definer | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| `is_admin(user_id)` | Check Administrator role | `user_id uuid` | boolean | all admin-managed tables | Likely yes | P1 if role lookup is broad or stale |
| `has_role(user_id, role_key)` | Check any active role by key | `user_id uuid`, `role_key text` | boolean | `account_roles`, role-gated policies | Likely yes | P1 if revoked/deleted roles count as active |
| `has_account_role(user_id, role_key)` | Alias/specific account-role check for ERD naming | `user_id uuid`, `role_key text` | boolean | Identity, Organization, domain owner policies | Likely yes | P1 if duplicate semantics diverge from `has_role` |
| `is_company_member(user_id, company_id)` | Check company membership | `user_id uuid`, `company_id uuid` | boolean | `companies`, `company_members`, company files | Likely yes | P2 if inactive members still pass |
| `is_supplier_owner(user_id, supplier_id)` | Check Supplier owner account | `user_id uuid`, `supplier_id uuid` | boolean | supplier/company/product/FDA/membership tables | Likely yes | P1 if company staff and supplier owner are confused |
| `is_buyer_owner(user_id, buyer_id)` | Check Buyer owner account | `user_id uuid`, `buyer_id uuid` | boolean | `buyers`, `buy_requests`, `inquiries` | Likely yes | P1 if Buyer PII is exposed through joins |
| `is_agent_of_buyer(agent_user_id, buyer_id)` | Check Agent-Buyer subordinate relationship | `agent_user_id uuid`, `buyer_id uuid` | boolean | `buyers`, `agent_buyers`, messages, analytics | Likely yes | P1 if non-subordinate Buyer can be queried |
| `is_professor_of_student(professor_user_id, student_id)` | Check Professor-Student subordinate relationship | `professor_user_id uuid`, `student_id uuid` | boolean | `students`, student growth, messages, event applications | Likely yes | P1 if unrelated Student PII passes |
| `is_brokerage_case_participant(user_id, brokerage_case_id)` | Check case participant access | `user_id uuid`, `brokerage_case_id uuid` | boolean | `brokerage_cases`, `proposals`, conversations, files | Likely yes | P1 if Supplier sees Buyer PII |
| `has_contact_release(buyer_id, supplier_id, brokerage_case_id)` | Check approved, unexpired contact release | `buyer_id uuid`, `supplier_id uuid`, `brokerage_case_id uuid` | boolean | `contact_release_approvals`, conversations, messages | Likely yes | P1 if expired/revoked releases pass |
| `can_send_message(user_id, conversation_id)` | Final message insert authorization | `user_id uuid`, `conversation_id uuid` | boolean | `messages` | Yes candidate | P0/P1 if Supplier-Buyer direct messages pass |
| `can_view_buyer_pii(user_id, buyer_id)` | Decide full Buyer PII visibility | `user_id uuid`, `buyer_id uuid` | boolean | `profiles`, `buyers`, restricted Buyer views | Yes candidate | P1 if Supplier can pass |
| `can_view_student_pii(user_id, student_id)` | Decide Student PII visibility | `user_id uuid`, `student_id uuid` | boolean | `profiles`, `students`, student growth tables | Yes candidate | P1 if unrelated Professor can pass |

Helper rules:

- Helpers must ignore soft-deleted, revoked, expired, suspended, and inactive relationships unless explicitly designed otherwise.
- Helpers that read multiple protected tables should use fixed `search_path` and minimal selected fields.
- Helper output should be boolean only, not sensitive records.
- `can_send_message` must be the single final message insert decision helper.

## 4. Public Read Policies

Target tables:

- `companies`
- `products`
- `industrial_posts`
- `epc_projects`
- `sell_products`
- `events`
- `board_posts`
- `landing_pages`
- `landing_sections`

Policy principles:

| Rule | Design |
| --- | --- |
| Approval gate | `approval_status = approved` where approval exists |
| Publish gate | `publish_status = published` or equivalent published status |
| Soft delete gate | `deleted_at is null` |
| Schedule gate | `start_at/end_at` or `starts_at/ends_at` must include current time when configured |
| Featured content gate | linked target must also be approved/published |
| PII gate | public projection must exclude PII and admin memo fields |

Public read deny:

- draft, submitted, reviewing, rejected, hidden, archived, suspended, deleted
- private files and sensitive documents
- Buyer PII, Student PII, admin memo, audit log, raw analytics

## 5. Identity / Role RLS

Target tables:

- `profiles`
- `account_roles`
- `role_applications`

Policy design:

| Table | Read | Insert/Create | Update | Delete |
| --- | --- | --- | --- | --- |
| `profiles` | Owner full, Admin full, public no PII | System/Auth-linked only | Owner limited fields, Admin full | Soft delete by Owner/Admin where allowed |
| `account_roles` | Owner own role list, Admin full | Admin/System only | Admin/System only | Admin/System revoke/soft delete |
| `role_applications` | Owner own applications, Admin full | Owner create own application | Owner update draft/submitted fields before review; Admin review | Soft delete/Admin archive |

Rules:

- User can read/update only own profile except public-safe projected profile fields.
- User can read own role applications.
- Admin can manage all profiles, roles, applications.
- `account_roles` confirms current Role but cannot be modified by normal users.
- Single-column `member_type_id` is not a valid RLS authority in new design.

## 6. Organization RLS

Target tables:

- `companies`
- `company_members`
- `suppliers`
- `buyers`
- `agents`
- `agent_buyers`
- `professors`
- `professor_students`
- `students`

Policy design:

| Area | Read | Write |
| --- | --- | --- |
| Supplier company data | Supplier owner/company member/Admin | Supplier owner for draft/update; Admin for approval/publish |
| Buyer data | Buyer owner/Admin; Agent limited subordinate summary | Buyer owner limited update; Admin manage |
| Agent network | Agent own subordinate relations/Admin | Admin/System assignment; Agent cannot assign arbitrary Buyer |
| Professor network | Professor own subordinate Students/Admin | Admin/System assignment; Professor cannot claim arbitrary Student |
| Student data | Student owner/Admin; assigned Professor full | Student own limited update; Professor guidance fields if designed; Admin manage |

Explicit denies:

- Agent cannot view non-subordinate Buyer.
- Agent cannot view full Buyer email/phone/contact unless future policy explicitly grants.
- Professor cannot view non-subordinate Student PII.
- Supplier cannot view Buyer PII through buyers/profiles joins.

## 7. Marketplace RLS

Target tables:

- `products`
- `product_images`
- `product_documents`
- `product_videos`
- `industrial_posts`
- `epc_projects`
- `sell_products`

Policy design:

| Role | Read | Create | Update | Publish/Approve |
| --- | --- | --- | --- | --- |
| Guest/Public | approved + published only | No | No | No |
| Supplier | own records + public records | Own Supplier only | Own draft/submitted/hidden records | No |
| Student | approved products for showcase selection | No | No | No |
| Buyer/Agent/Professor | public/authenticated approved records | No | No | No |
| Admin | Full | Yes | Yes | Yes |

Rules:

- Supplier/Admin only can create product-like content.
- Student cannot create product records.
- Supplier can update only own company/product records.
- Admin alone can approve/reject/publish/hide.
- Product documents/videos inherit product visibility and their own approval/visibility scope.

## 8. Buy Request RLS

Target tables:

- `buy_requests`
- `buy_request_attachments`
- `buy_request_matches`

Policy design:

| Role | Access |
| --- | --- |
| Guest | approved/published summary only |
| Authenticated Supplier | approved detail without Buyer PII |
| Buyer | own Buy Request full CRUD before terminal states |
| Agent | subordinate Buyer limited summary |
| Admin | full manage |
| System | expiry/archive/status automation only |

Rules:

- Buyer creates and updates own Buy Requests.
- Supplier may view approved details but must not receive Buyer email, phone, contact person, admin memo, or internal matching notes.
- Buyer PII requires `can_view_buyer_pii` or restricted Admin/Owner path.
- `destination_country_id` must remain queryable without leaking Buyer identity.

## 9. Trade Brokerage RLS

Target tables:

- `inquiries`
- `brokerage_cases`
- `brokerage_case_participants`
- `proposals`
- `proposal_items`
- `contact_release_approvals`

Policy design:

| Table | Buyer | Supplier | Admin | System |
| --- | --- | --- | --- | --- |
| `inquiries` | own inquiry | only after Admin forward, masked | full | status notification |
| `brokerage_cases` | own case | participant case only | full | case lifecycle task |
| `brokerage_case_participants` | own participant view | own participant view | full manage | create/update during case setup |
| `proposals` | only Admin-reviewed/delivered proposals | own proposal in participant case | full review/deliver | status task |
| `proposal_items` | follows proposal | follows proposal | full | none by default |
| `contact_release_approvals` | own case release safe view | own case release safe view | create/approve/revoke | expiry task |

Rules:

- Buyer can read own inquiry/case.
- Supplier can read only Admin-forwarded case data and must receive masked Buyer context.
- Supplier can create Proposal only for a brokered case where it is a participant and case state permits.
- Proposal remains hidden from Buyer until Admin Review completes.
- Buyer can read only proposals delivered by Admin.
- `contact_release_approvals` can be created/approved/revoked by Admin only.
- All case-level access uses participant helper or admin helper.

## 10. Communication RLS

Target tables:

- `conversations`
- `conversation_members`
- `messages`
- `message_attachments`
- `message_reads`

Conversation type policy:

| conversation_type | Read Participants | Create Rule | Message Insert Rule |
| --- | --- | --- | --- |
| `agent_buyer` | Agent + subordinate Buyer | subordinate relation required | `is_agent_of_buyer` or Buyer participant |
| `professor_student` | Professor + subordinate Student | subordinate relation required | `is_professor_of_student` or Student participant |
| `admin_user` | Admin + target users | Admin creates or owns | Admin and listed participant |
| `brokerage_case` | valid brokerage participants | valid `brokerage_case_id`, Admin broker required | `is_brokerage_case_participant` and case state permits |
| `direct_contact_released` | released Buyer/Supplier/Admin | active `contact_release_approvals` required | valid unexpired release |
| `system_notice` | target recipients | System/Admin only | human reply denied by default |

Message insert:

- `can_send_message(auth.uid(), conversation_id) = true`

Mandatory denies:

- Supplier and Buyer only conversation creation is denied.
- Supplier-Buyer message without brokerage case is denied.
- Supplier-Buyer message without approved/unexpired contact release is denied unless within valid `brokerage_case`.
- Service role retry must not be used in normal user message flow.

Attachment/read rules:

- `message_attachments` follows `messages` visibility and file access policy.
- `message_reads` can be created/read by the message recipient/participant only.
- Admin may audit/read when operationally required.

## 11. Trust / Badge / Score RLS

Target tables:

- `verifications`
- `badges`
- `account_badges`
- `company_badges`
- `product_badges`
- `company_scores`
- `ranking_snapshots`

Policy design:

| Table Area | Public | Owner | Admin/System |
| --- | --- | --- | --- |
| Badge master | active public badges | read | manage |
| Granted badges | public issued badges for public targets | own badge status | grant/revoke |
| Verifications | public verified status only | own target verification status | review/manage |
| Company scores | published public score only | own company score if allowed | calculate/manage |
| Rankings | public ranking snapshots only | no raw ranking internals | calculate/manage |

Rules:

- Admin only can grant/revoke badges.
- Owner can read own badge/verification status.
- Public sees only public-safe badge/score labels.
- Company Score calculation inputs are not public by default.

## 12. Membership RLS

Target tables:

- `supplier_memberships`
- `membership_plans`
- `membership_benefits`
- `membership_overrides`

Policy design:

| Table | Public | Supplier | Admin/System |
| --- | --- | --- | --- |
| `membership_plans` | active public plan information | read | manage |
| `membership_benefits` | public-safe benefits | read own plan benefits | manage |
| `supplier_memberships` | public badge-safe subset only | own membership status | grant/update/revoke |
| `membership_overrides` | no | own safe subset | create/revoke |

Rules:

- Supplier can view own membership.
- Admin can grant/change/revoke membership and overrides.
- Public can view plan information only.
- Premium/Enterprise membership does not grant Buyer PII access.

## 13. Student Growth RLS

Target tables:

- `student_showcases`
- `student_showcase_items`
- `market_research_reports`
- `student_activities`
- `global_trade_passports`
- `student_rewards`
- `graduation_records`

Policy design:

| Role | Access |
| --- | --- |
| Public | approved/published Showcase only |
| Student | own showcase, reports, activities, passport, rewards |
| Professor | subordinate Student full activity and PII where needed |
| Admin | full manage |
| Supplier/Buyer/Agent | public approved showcase only unless future policy grants more |

Rules:

- Student can manage own activity records where workflow permits.
- Student cannot create product records through Showcase.
- Showcase items must reference approved Supplier products.
- Professor can view subordinate Student activity and PII.
- Professor cannot view unrelated Student PII.
- Public never sees Student email/phone.

## 14. Event / FDA RLS

Target tables:

- `events`
- `event_applications`
- `fda_applications`
- `fda_application_documents`
- `fda_quotes`
- `fda_status_history`
- `fda_completion_reports`

Event policy:

| Role | Access |
| --- | --- |
| Public | published events only |
| User | own event applications |
| Professor | subordinate Student event activity where required |
| Admin | full event/application management |
| System | reminder/status tasks |

FDA policy:

| Role | Access |
| --- | --- |
| Public | public FDA service information only, no applications |
| Supplier | own FDA applications/documents/quotes/reports |
| Admin | full review, quote, status, document, completion management |
| System | reminders/status notification only |

Rules:

- FDA documents and quotes are private.
- FDA status history is visible to Supplier as safe subset and full to Admin.
- Event applications are owner/Admin scoped.

## 15. Exposure / Landing Builder RLS

Target tables:

- `exposure_slots`
- `featured_contents`
- `landing_pages`
- `landing_sections`
- `landing_section_items`
- `landing_banners`
- `landing_popups`
- `landing_publish_history`
- `landing_preview_tokens`

Policy design:

| Table Area | Public | Admin | Preview |
| --- | --- | --- | --- |
| Landing pages/sections | published only | full create/update/publish/rollback | token-scoped preview |
| Section items | published section + approved target only | full manage | token-scoped preview |
| Banners/popups | active schedule only | full manage | token-scoped preview |
| Publish history | no | full read | no unless admin |
| Preview tokens | token holder can preview target only | full manage | token-scoped |

Rules:

- Admin only can create/update/publish/rollback.
- Preview token may allow preview read but not write.
- Featured content cannot point to unapproved/unpublished target.
- Landing Builder cannot override target table RLS.

## 16. Notification / Board / Calendar RLS

Target tables:

- `notifications`
- `notification_reads`
- `boards`
- `board_posts`
- `calendar_events`

Policy design:

| Table | Public | Authenticated Owner | Admin/System |
| --- | --- | --- | --- |
| `notifications` | no | own notifications only | send/manage |
| `notification_reads` | no | own read state only | manage/debug |
| `boards` | active public board metadata | active public | manage |
| `board_posts` | approved/published public posts | author owns drafts if allowed | manage/publish |
| `calendar_events` | public scope only | own/related/private scope | manage |

Rules:

- User can read only own notification.
- Admin can broadcast and manage.
- Public board reads require approval and publish gates.
- Calendar visibility follows `public/admin/private/related` scope.

## 17. Media / File RLS

Target tables:

- `files`
- `file_versions`
- `file_access_logs`
- storage objects

Policy design:

| File Type | Public | Owner/Related | Admin/System |
| --- | --- | --- | --- |
| Public content file | only when linked approved/published content allows | yes | yes |
| Private business file | no | owner/related only | yes |
| FDA document | no | Supplier owner + Admin | yes |
| Proposal/Brokerage file | no public | brokered participants by visibility | yes |
| PII-related file | no public | restricted owner/authorized role | yes |

Rules:

- Public file access requires approved/published content relation.
- Private file access requires owner/related/admin scope.
- FDA, Proposal, Buyer PII, Student PII files are never public by default.
- Downloads of sensitive files should create `file_access_logs`.
- Supabase Storage object policies must match DB file metadata policies.

## 18. Analytics RLS

Target tables:

- `analytics_events`
- `buyer_sources`
- `showcase_views`
- `inquiry_events`
- `proposal_events`

Policy design:

| Table Area | Insert | Read |
| --- | --- | --- |
| Public analytics event | limited insert with validation/rate limit | Admin/System only raw |
| Buyer source | System/Admin or signup flow | Buyer owner safe summary, Agent aggregate where subordinate |
| Showcase views/shares | limited insert | Student owner/Professor/Admin aggregate |
| Inquiry/proposal events | System/Admin | participants aggregate only, Admin raw |

Rules:

- Raw analytics is never public.
- Owner can read only own summary.
- Admin can read full analytics.
- Public inserts must be rate-limited and payload-limited.
- Analytics events must not contain raw Buyer PII.

## 19. Admin / Audit RLS

Target tables:

- `audit_logs`
- `admin_memos`
- `site_settings`
- `feature_flags`
- `translations`
- `design_tokens`
- `component_settings`

Policy design:

| Table | Read | Write |
| --- | --- | --- |
| `audit_logs` | Admin/System only | System/Admin append only |
| `admin_memos` | Admin only | Admin only |
| `site_settings` | public limited read if marked public, Admin full | Admin only |
| `feature_flags` | Admin/server read, public no | Admin only; restricted flags require audit |
| `translations` | public approved read | Admin only |
| `design_tokens` | public active read | Admin only |
| `component_settings` | app safe active read | Admin only |

Rules:

- `audit_logs` and `admin_memos` are never visible to normal roles.
- Feature flags cannot weaken RLS.
- `supplier_buyer_direct_contact_enabled` does not mean global direct contact.
- Service role exceptions must be limited to server-only system tasks and audited where sensitive.

## 20. RLS Testing Matrix

| Test ID | Scenario | Expected Result |
| --- | --- | --- |
| RLS-T-001 | Guest reads approved/published public product | Allowed |
| RLS-T-002 | Guest reads draft product | Denied |
| RLS-T-003 | Supplier reads own company draft | Allowed |
| RLS-T-004 | Supplier updates another Supplier product | Denied |
| RLS-T-005 | Supplier reads Buyer email/phone/contact | Denied or masked |
| RLS-T-006 | Buyer creates own Buy Request | Allowed |
| RLS-T-007 | Buyer updates another Buyer Buy Request | Denied |
| RLS-T-008 | Agent reads subordinate Buyer limited summary | Allowed |
| RLS-T-009 | Agent reads non-subordinate Buyer | Denied |
| RLS-T-010 | Professor reads subordinate Student PII | Allowed |
| RLS-T-011 | Professor reads unrelated Student PII | Denied |
| RLS-T-012 | Student creates product | Denied |
| RLS-T-013 | Supplier-Buyer direct conversation create | Denied |
| RLS-T-014 | Supplier-Buyer direct message insert | Denied |
| RLS-T-015 | Brokerage message with valid participant/case | Allowed |
| RLS-T-016 | Direct contact release message before approval | Denied |
| RLS-T-017 | Direct contact release message after valid approval | Allowed |
| RLS-T-018 | Expired/revoked release message | Denied |
| RLS-T-019 | Admin override approval action | Allowed and audited |
| RLS-T-020 | Published landing page read | Allowed |
| RLS-T-021 | Draft landing page read by Guest | Denied |
| RLS-T-022 | Private FDA document read by Guest | Denied |
| RLS-T-023 | Supplier reads own FDA application | Allowed |
| RLS-T-024 | Public reads raw analytics | Denied |
| RLS-T-025 | Public inserts oversized/invalid analytics payload | Denied |

## 21. Migration Impact Notes

- Existing policies can conflict with `account_roles` if they still depend on `member_type_id`.
- `member_type_id` single role logic is deprecated and must not be used as final RLS authority.
- `account_roles` based helpers are required before broad RLS migration.
- `conversation_type` migration is required before enforcing typed Communication RLS.
- Buyer PII masking view or restricted projection is required before Supplier-facing Buy Request/Brokerage queries.
- Existing `conversations` and `messages` must be audited before applying new direct-message denial policies.
- Supabase migration history must be reconciled before structural migration work.
- Security definer helper function scope must be reviewed because Supabase Health Audit found a broad helper surface.

## 22. Decision Required

| Decision ID | Topic | Options / Notes |
| --- | --- | --- |
| DR-RLS-001 | security definer helper 함수 범위 | which helpers must be security definer vs invoker |
| DR-RLS-002 | Buyer PII masked view 설계 | separate view, RPC, or DTO-only projection |
| DR-RLS-003 | `brokerage_case_messages` 분리 여부 | separate table vs reuse `messages` |
| DR-RLS-004 | `direct_contact_release` expiry 기본값 | 7/30/90 days or policy-specific |
| DR-RLS-005 | preview token RLS 방식 | token table policy, RPC, or signed route |
| DR-RLS-006 | analytics raw data 보관 범위 | retention period, aggregation schedule, PII exclusion |

## 23. Codex Implementation Notes

- 이 문서는 설계 문서이며 SQL이 아니다.
- SQL 작성은 RLS Design v1 확정 후 별도 migration plan에서 한다.
- 모든 정책은 Permission Matrix와 ERD v1을 기준으로 한다.
- service role fallback으로 RLS를 우회하지 않는다.
- RLS 테스트 케이스 없이 migration 금지.
- `can_send_message`는 Communication RLS의 핵심 helper로 설계해야 한다.
- `can_view_buyer_pii`는 Supplier-facing 모든 path에서 기본 false여야 한다.
- `can_view_student_pii`는 Professor-subordinate relation과 Admin scope를 명확히 구분해야 한다.
- Feature Flag는 RLS policy보다 상위 우회 권한이 아니다.

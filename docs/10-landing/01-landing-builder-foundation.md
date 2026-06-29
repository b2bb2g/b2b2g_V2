# Landing Builder Foundation Audit

## 1. Purpose

This document starts Sprint 3: Landing Experience Engine.

The goal is to audit the current Public UI and define the foundation for a Builder-driven Landing Experience. No code, database, RLS, UI, or migration changes are included in this task.

The new Builder model must support:

- Admin-managed landing composition.
- Section use/hide/reorder/schedule/preview/publish controls.
- Public-only published content.
- UI Design System Engine components only.
- Exposure Engine-approved public content only.
- A five-layer Builder hierarchy: Landing -> Page -> Section -> Component -> Widget.

Next task after this audit: Landing Hero implementation.

## 2. Current Public UI Summary

| Area | Current Implementation | Current Builder Readiness | Recommendation |
| --- | --- | --- | --- |
| Public layout | `app/(public)/layout.tsx` uses `SiteShell` with public variant | Reusable shell exists | Refactor into Builder-aware layout boundary later |
| Home landing | `app/(public)/page.tsx` composes sections directly | Not Builder-managed | Replace section orchestration with Landing Builder model |
| Header / Navigation | `components/shared/site-shell.tsx`, `lib/constants/routes.ts` | Reusable but not admin-configurable | Reuse UI, add admin-managed visibility/order later |
| Hero | `HomeHero` in `components/public/marketplace-carousel.tsx` | Strong reusable visual base | Task 02 should make Hero builder-ready |
| Featured content | Product and supplier carousel components | Reusable components, sample-driven data | Refactor data source to Exposure Engine outputs |
| Buyer teaser | `BuyRequestPreviewCarousel` with auth gating | Reusable behavior | Refactor into Buyer Section plugin |
| Event section | `LandingEventCarousel` | Reusable | Refactor into Event Section plugin |
| FDA section | `ServiceCatalogSection` inside home page | Inline section | Extract into FDA Section component |
| Notice section | Inline notice list | Inline section | Extract into Notice Section component |
| Banner / CTA | `ProductIntroBanner` and closing CTA | Reusable pattern | Convert to Banner Section / CTA Widget |
| Popup | No dedicated Landing popup section | Missing | Add Landing Popup module later |
| Footer | Inline footer in home page | Not centralized | Convert to Footer Section |

## 3. Current Landing Page Audit

The current home page is a useful visual prototype, but it is not yet a Landing Builder implementation.

Current sequence:

1. Hero.
2. Trust / category / readiness section.
3. Supplier spotlight banner.
4. Buyer demand teaser.
5. Industrial banner.
6. Featured suppliers carousel.
7. Featured products carousel.
8. Industrial projects carousel.
9. EPC projects carousel.
10. Student showcase carousel.
11. Event carousel.
12. Thailand FDA service catalog.
13. Notice list.
14. Closing CTA.
15. Footer.

Key audit findings:

- The landing sequence is hardcoded in `app/(public)/page.tsx`.
- Several section datasets are static arrays or sample adapters.
- `Search`, `Country Gateway`, and `Popup` are not first-class landing sections yet.
- Header and Global Navigation are not admin-managed.
- Footer is page-owned instead of Builder-owned.
- Featured content does not yet consume an Exposure Engine output contract.
- Preview, schedule, publish, rollback, and section versioning are not implemented.

## 4. Builder Layer Model

### 4.1 Landing Builder

Landing Builder is the top-level engine for public landing orchestration.

Responsibilities:

- Own the main landing experience.
- Control page status, publish workflow, preview tokens, and rollback.
- Consume approved public content from domain engines.
- Consume featured candidate selections from Exposure Engine.
- Use only UI Design System Engine components.

Primary objects:

- `landing_pages`
- `landing_publish_history`
- `landing_preview_tokens`

### 4.2 Page Builder

Page Builder controls one public page instance, such as Home, Commercial landing, FDA landing, Event landing, or future campaign pages.

Responsibilities:

- Define page key, slug, status, locale support, and template.
- Own section list for that page.
- Apply page-level SEO, publish status, and preview behavior.

Example page keys:

- `home`
- `commercial`
- `industrial`
- `epc`
- `events`
- `thailand_fda`
- `notice`

### 4.3 Section Builder

Section Builder controls a page band or page region.

Responsibilities:

- Define section type and section key.
- Control use/hide/reorder/schedule/preview/publish.
- Store layout config, display rules, and content binding.
- Resolve section translations.
- Delegate rendering to registered UI Design System components.

Primary objects:

- `landing_sections`
- `landing_section_translations`
- `landing_section_items`

### 4.4 Component Builder

Component Builder is not a free-form custom component editor. It selects and configures approved UI Design System Engine components.

Responsibilities:

- Map a Section to a registered component pattern.
- Configure allowed props only.
- Prevent one-off UI styles outside the design system.
- Preserve responsive and accessibility rules.

Examples:

- Hero Section component.
- Carousel Section component.
- KPI Bar component.
- Notice List component.
- Banner component.
- Popup component.
- Footer component.

### 4.5 Widget Builder

Widget Builder controls small reusable parts inside a component.

Responsibilities:

- Configure CTA buttons, chips, badges, image tiles, metric cards, cards, filters, tabs, and popup triggers.
- Use design tokens and component variants only.
- Avoid direct business permissions or RLS bypass logic.

Examples:

- CTA Button Widget.
- KPI Metric Widget.
- Country Chip Widget.
- Carousel Progress Widget.
- Featured Content Card Widget.
- Schedule Badge Widget.
- Popup Close Widget.

## 5. Builder Hierarchy

```text
Landing
  -> Page
      -> Section
          -> Component
              -> Widget
```

Operational meaning:

- Landing: owns public landing experience strategy.
- Page: owns route, template, page status, and page publish lifecycle.
- Section: owns order, visibility, schedule, preview, and content binding.
- Component: owns rendering pattern from UI Design System Engine.
- Widget: owns small interactive or visual units inside the component.

The existing architecture documents define a three-part Builder unit around Section, Widget, and Component. This Sprint 3 audit extends that into a full operational hierarchy by adding Landing and Page above those units.

## 6. Engine Relationship Map

```text
Domain Engines
  Marketplace / Buy Request / Student Growth / Event / Thailand FDA / Notice
        |
        v
Approval Engine
  ensures content is approved before public exposure
        |
        v
Exposure Engine
  decides what content can be featured
        |
        v
Landing Page Builder Engine
  decides where, when, and in what order content appears
        |
        v
UI Design System Engine
  provides component, layout, responsive, and token rules
        |
        v
Public Landing Pages
```

### Landing Page Builder Engine

- Owns page/section structure.
- Owns preview, publish, schedule, hide, archive, and rollback workflow.
- Does not decide whether a Supplier/Product/Buy Request is eligible for public exposure.

### UI Design System Engine

- Provides design tokens, layout primitives, cards, buttons, carousels, forms, badges, dialogs, and responsive rules.
- Builder must not create one-off UI components outside this engine.
- Builder section configs must map to approved component variants.

### Exposure Engine

- Decides featured candidates and exposure slots.
- Enforces approval, verification, membership, and ranking eligibility.
- Landing Builder consumes Exposure Engine outputs and places them into sections.

## 7. Common Admin Section Controls

Every landing section must support the same minimum controls:

| Control | Meaning | Required Behavior |
| --- | --- | --- |
| Use | Enable the section for a page | Creates or activates section config |
| Hide | Remove from public rendering without deletion | Keeps config and content binding |
| Reorder | Change `sort_order` within a page | Must not require code deployment |
| Schedule | Set `starts_at` and `ends_at` or equivalent visibility rules | Public render must respect schedule |
| Preview | Show draft/scheduled state before publish | Must not expose preview token values publicly |
| Publish | Make approved section version public | Must record admin actor and publish history |

Recommended section statuses:

- `draft`
- `scheduled`
- `published`
- `hidden`
- `archived`

Recommended publish states:

- `unpublished`
- `preview`
- `published`
- `rollback_pending`

## 8. Landing Section Foundation

Each section below must be controllable by Admin with:

`Use / Hide / Reorder / Schedule / Preview / Publish`

### 8.1 Landing Layout

Purpose:

- Defines the root layout, page width, vertical rhythm, responsive bands, and section stack.

Current UI source:

- `app/(public)/layout.tsx`
- `components/shared/site-shell.tsx`
- `app/(public)/page.tsx`

Builder requirements:

- Admin can choose active page template.
- Admin can preview page draft before publish.
- Layout must use UI Design System Engine spacing, type, and responsive rules.
- Layout must not expose draft/hidden sections publicly.

### 8.2 Header

Purpose:

- Provides logo, public account state, primary navigation access, and mobile menu entry.

Current UI source:

- `components/shared/site-shell.tsx`

Builder requirements:

- Admin can use/hide header on supported public pages.
- Header must preserve auth-aware behavior.
- Header configuration must not expose private user data.
- Header component must remain UI Design System Engine-owned.

### 8.3 Global Navigation

Purpose:

- Provides Commercial, Industrial, EPC, Event, BUY & SELL, Networking, Thailand FDA Service, and Notice navigation.

Current UI source:

- `lib/constants/routes.ts`
- `components/shared/site-shell.tsx`

Builder requirements:

- Admin can reorder or hide nav items in a future controlled mode.
- Route slugs stay English.
- Labels stay translation-key based.
- Navigation must not expose dashboard-only Academy/Student internal routes publicly.

### 8.4 Hero

Purpose:

- First-viewport brand and conversion section for B2BB2G as a Global Trade Operating System.

Current UI source:

- `HomeHero` in `components/public/marketplace-carousel.tsx`

Builder requirements:

- Admin can configure headline, subheadline, background media, hero search type, CTA labels, CTA links, proof metrics, and visual variant.
- Hero must support preview/publish without code deployment.
- Hero must use UI Design System buttons, media, badges, and responsive layout.
- Hero must not render unapproved featured content.

Task 02 should start here.

### 8.5 Search

Purpose:

- Provides product, supplier, country, service, or buy request discovery from the landing page.

Current UI source:

- No first-class landing search section currently.

Builder requirements:

- Admin can choose search mode: product, supplier, buy request, country, FDA service, or global.
- Search UI must use UI Design System input/select/button components.
- Search results must respect public approval and RLS rules.
- Supplier-facing paths must not expose Buyer PII.

### 8.6 KPI

Purpose:

- Shows trust signals, readiness metrics, and platform scale.

Current UI source:

- Hero proof row.
- Trust infrastructure section.

Builder requirements:

- Admin can configure KPI labels and values.
- KPI values should be manual first, analytics-backed later.
- KPI widgets must not claim unverified numbers.
- KPI section must support schedule and publish controls.

### 8.7 Featured

Purpose:

- Displays featured suppliers, products, buy requests, events, showcases, or campaigns.

Current UI source:

- `ProductCarousel`
- `SupplierSpotlightCarousel`
- `BuyRequestPreviewCarousel`

Builder requirements:

- Content candidates must come from Exposure Engine.
- Manual Pick and Auto Ranking modes must be explicit.
- Featured targets must be approved/published.
- Buyer contact details must never appear in Supplier-facing featured cards.

### 8.8 Country Gateway

Purpose:

- Provides country or market entry points for global trade discovery.

Current UI source:

- Hero route map pins and category signal chips.

Builder requirements:

- Admin can choose country cards, region grouping, and linked pages.
- Country Gateway is an Exposure Engine placement, not an Agent-Buyer permission source.
- Country Gateway must not imply Agent access to Buyer data.

### 8.9 Supplier

Purpose:

- Promotes verified suppliers, supplier onboarding, and supplier showcase content.

Current UI source:

- Supplier spotlight banner.
- Supplier carousel.
- Supplier signup start pages.

Builder requirements:

- Supplier section can show approved Supplier public profile data only.
- Supplier membership tier may affect eligibility through Exposure Engine.
- Supplier cannot receive Buyer PII through this section.
- Supplier CTA can route to public signup or invitation-aware signup start.

### 8.10 Buyer

Purpose:

- Communicates buy request value, Agent-brokered onboarding, and demand discovery.

Current UI source:

- Buyer demand teaser.
- `BuyRequestPreviewCarousel`.

Builder requirements:

- Buyer section can show approved/public buy request summaries only.
- Buyer email, phone, and contact person must never be shown.
- Supplier-Buyer direct contact must not be introduced by landing UI.
- CTA must route through Admin Brokerage or allowed signup flows.

### 8.11 Student

Purpose:

- Shows approved Student Showcase and Student Growth outcomes.

Current UI source:

- Student showcase carousel.
- Student signup start page.

Builder requirements:

- Only approved Student Showcase content can appear publicly.
- Student email/phone must not appear publicly.
- Student signup must require Professor invitation context.
- Student product display must remain showcase, not direct product registration.

### 8.12 FDA

Purpose:

- Presents Thailand FDA Service categories and service CTA.

Current UI source:

- `ServiceCatalogSection` inline in the home page.

Builder requirements:

- Admin can configure FDA category cards and CTA route.
- FDA service states remain owned by Thailand FDA Service Engine.
- Landing Builder only controls public presentation and order.
- No private application files or internal review status can appear publicly.

### 8.13 Event

Purpose:

- Presents approved events and participation entry points.

Current UI source:

- `LandingEventCarousel`.

Builder requirements:

- Only approved/published events appear publicly.
- Admin can feature events manually through Exposure Engine.
- Event status labels must follow the state machine and UI Design System badge rules.
- Event application flow remains Event Engine-owned.

### 8.14 Notice

Purpose:

- Presents public notices and announcements.

Current UI source:

- Inline notice list in the home page.

Builder requirements:

- Admin can choose notice count, ordering, and section title.
- Only public notices appear.
- Internal admin notifications must not appear here.
- Notice section must support schedule and publish controls.

### 8.15 Banner

Purpose:

- Presents campaign, supplier, service, or CTA banners.

Current UI source:

- `ProductIntroBanner`.
- Closing CTA.
- Existing `banners` table is mapped for future landing banner migration.

Builder requirements:

- Banner content must move toward `landing_banners`.
- Admin can use/hide/reorder/schedule/preview/publish banners.
- Banner targets must not bypass content approval.
- Banner can use carousel or static variant.

### 8.16 Popup

Purpose:

- Presents timed or conditional public popup messages.

Current UI source:

- No dedicated Landing popup implementation currently.

Builder requirements:

- Popup content must move toward `landing_popups`.
- Admin can schedule popup visibility.
- Popup must support preview before publish.
- Popup must avoid blocking core navigation on mobile.
- Popup must not expose preview tokens or private campaign metadata.

### 8.17 Footer

Purpose:

- Provides final navigation, legal links, brand context, and conversion links.

Current UI source:

- Inline footer in `app/(public)/page.tsx`.

Builder requirements:

- Footer should become a Builder-managed section or shared public shell block.
- Legal links must remain stable.
- Footer CTA can be configured by Admin.
- Footer must not duplicate hidden nav or unpublished campaign links.

## 9. Section Control Matrix

| Section | Use | Hide | Reorder | Schedule | Preview | Publish |
| --- | --- | --- | --- | --- | --- | --- |
| Landing Layout | Yes | Limited | N/A | Yes | Yes | Yes |
| Header | Yes | Yes | Limited | Yes | Yes | Yes |
| Global Navigation | Yes | Yes | Yes | Yes | Yes | Yes |
| Hero | Yes | Yes | Yes | Yes | Yes | Yes |
| Search | Yes | Yes | Yes | Yes | Yes | Yes |
| KPI | Yes | Yes | Yes | Yes | Yes | Yes |
| Featured | Yes | Yes | Yes | Yes | Yes | Yes |
| Country Gateway | Yes | Yes | Yes | Yes | Yes | Yes |
| Supplier | Yes | Yes | Yes | Yes | Yes | Yes |
| Buyer | Yes | Yes | Yes | Yes | Yes | Yes |
| Student | Yes | Yes | Yes | Yes | Yes | Yes |
| FDA | Yes | Yes | Yes | Yes | Yes | Yes |
| Event | Yes | Yes | Yes | Yes | Yes | Yes |
| Notice | Yes | Yes | Yes | Yes | Yes | Yes |
| Banner | Yes | Yes | Yes | Yes | Yes | Yes |
| Popup | Yes | Yes | Yes | Yes | Yes | Yes |
| Footer | Yes | Yes | Limited | Yes | Yes | Yes |

`Limited` means the section can be configured but should not be freely reordered in ways that break site accessibility or expected legal/navigation placement.

## 10. Data and Publishing Model

Future Landing Builder data should align with the existing ERD v1 candidates:

| Object | Purpose | Sprint 3 Use |
| --- | --- | --- |
| `landing_pages` | Page root and publish status | Page Builder |
| `landing_sections` | Section config and order | Section Builder |
| `landing_section_translations` | Localized title/body/CTA text | Translation-backed public copy |
| `landing_section_items` | Section-bound target content | Featured and curated content |
| `landing_banners` | Banner config | Banner Section |
| `landing_popups` | Popup config | Popup Section |
| `landing_publish_history` | Publish/rollback history | Publish workflow |
| `landing_preview_tokens` | Secure preview access | Preview workflow |
| `exposure_slots` | Exposure placement definition | Exposure Engine input |
| `featured_contents` | Featured candidate selection | Featured Section input |

Publishing rules:

- Public users read only published pages and published sections.
- Preview tokens allow preview only, not admin write.
- Scheduled sections render only within their valid schedule window.
- Hidden and archived sections never render publicly.
- Featured section items must pass target content approval checks.

## 11. Component and Widget Registry Draft

### 11.1 Component Candidates

| Component | Section Use | Current Source |
| --- | --- | --- |
| Public Header Shell | Header / Navigation | `SiteShell` |
| Hero Section | Hero | `HomeHero` |
| Search Panel | Search | New |
| KPI Bar | KPI | Hero proof / Trust section |
| Carousel Section | Featured / Supplier / Student / Event | Existing carousel components |
| Buy Request Preview | Buyer | `BuyRequestPreviewCarousel` |
| Service Catalog | FDA | Inline `ServiceCatalogSection` |
| Notice List | Notice | Inline notice list |
| Banner Section | Banner | `ProductIntroBanner` |
| Popup Dialog | Popup | New |
| Footer Section | Footer | Inline footer |

### 11.2 Widget Candidates

| Widget | Purpose |
| --- | --- |
| CTA Button Widget | Primary/secondary section actions |
| KPI Metric Widget | Trust and platform metrics |
| Country Chip Widget | Country gateway and route map entries |
| Badge Widget | Approval, verification, status, or schedule labels |
| Media Tile Widget | Hero and featured images |
| Carousel Control Widget | Progress, navigation, and drag affordance |
| Featured Card Widget | Supplier/product/buy request/showcase cards |
| Popup Trigger Widget | Popup display condition and close behavior |
| Legal Link Widget | Footer legal navigation |

## 12. Current Gaps and Risks

| Gap | Risk | Priority | Recommendation |
| --- | --- | --- | --- |
| Landing sections are hardcoded | Admin cannot reorder/schedule/publish without code | P1 | Introduce Builder section model |
| Sample data powers landing content | Demo content can mix with production UI | P1 | Replace with approved public queries and Exposure Engine |
| Search section missing | Landing discovery is weaker than target model | P2 | Add Hero/Search Section design in Task 02+ |
| Country Gateway missing | Global market entry is not a section | P2 | Create Country Gateway Section after Hero |
| Popup missing | Admin campaign popup unsupported | P2 | Add Popup module after Banner model |
| Header/Footer not Builder-controlled | Incomplete page composition model | P2 | Gradually expose safe settings |
| Featured not tied to Exposure Engine | Unapproved or non-eligible content risk | P1 | Consume `featured_contents` / exposure slots later |
| Preview/Publish workflow missing | Draft changes cannot be safely reviewed | P1 | Implement preview/publish workflow before full admin builder |
| Translation split unclear | Admin-entered copy may become hardcoded | P2 | Use `landing_section_translations` or translation keys |

## 13. Implementation Boundaries

Do not do the following during this foundation task:

- Do not modify code.
- Do not add SQL migration.
- Do not modify Supabase production DB.
- Do not change Public UI.
- Do not connect Builder tables before migration and RLS are approved.
- Do not bypass UI Design System Engine.
- Do not expose Buyer PII or Student PII in landing sections.

## 14. Recommended Landing Builder Implementation Order

1. Landing Hero implementation.
2. Hero config model and component extraction.
3. Landing section registry draft.
4. Builder-ready section DTOs.
5. Preview-only static configuration path.
6. Landing Builder migration review for `landing_pages` and `landing_sections`.
7. Admin section order and visibility MVP.
8. Exposure Engine connection for Featured sections.
9. Banner and Popup modules.
10. Publish history and preview token workflow.
11. Full public route replacement from hardcoded page to Builder-rendered page.

## 15. Task 02: Landing Hero Scope Proposal

Task 02 should implement the Landing Hero as the first Builder-ready section.

Recommended scope:

- Extract current `HomeHero` into a Hero Section component with a typed config.
- Preserve current visual direction and route map behavior.
- Keep data static or local config only unless a migration is explicitly approved.
- Do not introduce DB writes.
- Do not connect unpublished Builder tables.
- Prepare admin-editable fields: headline, subheadline, CTA links, proof metrics, image/media tiles, and search mode.
- Keep all public copy English and translation-key ready.

## 16. Codex Notes

- This document is the Sprint 3 starting point for Landing Experience Engine.
- Existing Public UI is treated as reusable visual material, not the final source of truth.
- Landing Builder must remain a presentation orchestration layer.
- Exposure Engine decides what is eligible to feature.
- UI Design System Engine decides how sections, components, and widgets render.
- Landing Builder decides where, when, and in what order approved content appears.

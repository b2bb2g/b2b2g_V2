# Landing v1 QA Review

## 1. Executive Summary

Review date: 2026-06-29

Scope: `/` public landing page after Sprint 3 Task 02 through Task 06.

Overall decision: Ready with Conditions for continued static Landing v1 iteration. Not ready for direct Landing Builder DB migration until the P1 issues below are resolved.

P0 result: No P0 blocker was found in the current Landing v1 surface.

P1 result:

| ID | Issue | Impact | Recommended Action |
| --- | --- | --- | --- |
| P1-LAND-001 | Builder-ready sections are mixed with legacy sample-driven sections on the same `/` page. | The page message flow is longer than the new Landing Builder model and cannot be cleanly mapped to Landing -> Page -> Section -> Component -> Widget without a section ownership decision. | Convert legacy sections into builder-ready config or explicitly hide/defer them from Landing v1. |
| P1-LAND-002 | Public page still depends on `getSampleItems` and `lib/sample/public-samples.ts` for many lower landing sections. | Demo/sample content can continue to mix with production-facing UI. | Replace with approved static config for Landing v1 or approved public queries in the later Exposure Engine phase. |
| P1-LAND-003 | Some new landing section labels are still hardcoded in components instead of translation keys. | Conflicts with the project translation-key policy and makes Builder/Admin localization harder. | Move hardcoded public labels such as `Role Gateway` and `Marketplace Preview` into `lib/i18n/translation.ts`. |

## 2. Route Coverage

| Route / CTA Area | Current Target | Current Handling | QA Result |
| --- | --- | --- | --- |
| Hero Supplier CTA | `/signup/supplier` | Active link | Pass |
| Hero Buyer CTA | `/signup/buyer` | Active link | Pass |
| Hero Agent CTA | `/signup/agent` | Active link | Pass |
| Hero Professor CTA | `/signup/professor` | Active link | Pass |
| Hero Student CTA | `/signup/student` | Active link | Pass |
| Hero Sign in CTA | `/login` | Active link | Pass |
| Hero Search | none | Disabled / coming soon | Pass |
| Featured Suppliers list | `/suppliers` | Disabled / coming soon | Pass |
| Featured Products list | `/products` | Disabled / coming soon | Pass |
| Buy Requests list | `/buy-requests` | Disabled / coming soon | Pass |
| Country Korea | `/commercial` | Active link | Pass |
| Country Thailand | `/thailand-fda-service` | Active link | Pass |
| Country Japan / Vietnam / Indonesia | `/countries/*` | Disabled / coming soon | Pass |
| Service Thailand FDA | `/thailand-fda-service` | Active link | Pass |
| Service Events | `/events` | Active link | Pass |
| Service Student Showcase | `/student-showcase` | Disabled / coming soon | Pass |
| Service Supplier Membership | `/supplier-membership` | Disabled / coming soon | Pass |
| Notice Preview | `/notice` | Active link | Pass |
| Event Preview | `/events` | Active link | Pass |
| Final Supplier CTA | `/signup/supplier` | Active link | Pass |
| Final Buyer CTA | `/signup/buyer` | Active link | Pass |
| Footer Support | `/support` | Disabled / coming soon | Pass |

No broken active route was identified during the static route review. Missing or future routes are represented as disabled controls rather than live links.

## 3. Section Flow Review

Current page order:

| Order | Section | Source | QA Result |
| --- | --- | --- | --- |
| 1 | Hero | Builder-ready static config | Pass |
| 2 | Role Gateway | Builder-ready static config | Pass with P1 translation issue |
| 3 | Featured Marketplace | Builder-ready static config | Pass with P1 translation issue |
| 4 | Country / Service Gateway | Builder-ready static config | Pass |
| 5 | Trust Infrastructure | Legacy landing section | P1 alignment issue |
| 6 | Supplier promo banner | Legacy sample-driven section | P1 alignment issue |
| 7 | Buyer demand teaser | Legacy sample-driven section | P1 alignment issue |
| 8 | Industrial promo banner | Legacy sample-driven section | P1 alignment issue |
| 9 | Featured suppliers carousel | Legacy sample-driven section | P1 alignment issue |
| 10 | Featured products carousel | Legacy sample-driven section | P1 alignment issue |
| 11 | Industrial projects carousel | Legacy sample-driven section | P1 alignment issue |
| 12 | EPC projects carousel | Legacy sample-driven section | P1 alignment issue |
| 13 | Student showcase carousel | Legacy sample-driven section | P1 alignment issue |
| 14 | Events carousel | Legacy sample-driven section | P1 alignment issue |
| 15 | Service catalog | Legacy landing section | P1 alignment issue |
| 16 | Notice / Event / Final CTA / Footer | Builder-ready static config | Pass |

The first four sections and final section establish the intended Landing Builder v1 structure. The middle legacy block is visually useful but makes the flow feel like two landing systems stitched together. This is acceptable for an interim static page, but it blocks direct Builder DB migration.

Recommended v1 flow before Builder DB:

1. Hero
2. Role Gateway
3. Featured Marketplace
4. Country / Service Gateway
5. Notice / Event
6. Final CTA
7. Footer

Legacy sections should either be converted into builder-ready sections or moved behind a separate marketplace/content preview decision.

## 4. CTA Review

Active CTAs are aligned with the current signup and public route strategy.

Role CTAs correctly point to:

- Supplier: `/signup/supplier`
- Buyer: `/signup/buyer`
- Agent: `/signup/agent`
- Professor: `/signup/professor`
- Student: `/signup/student`

Future list CTAs are disabled instead of linking to missing routes. This is the correct interim handling.

No Supplier-Buyer direct contact CTA was found. The visible brokerage/privacy language frames direct contact as controlled by Admin brokerage or release policy, not as an open action.

## 5. Mobile UX Review

Mobile QA result: usable with conditions.

Observed strengths:

- Role Gateway, Featured Marketplace, Country Gateway, Service Gateway, and Event preview use responsive card layouts or horizontal scroll behavior.
- Hero CTA density is controlled enough for mobile.
- Disabled controls remain visibly distinct.

Risks:

| ID | Issue | Priority | Recommendation |
| --- | --- | --- | --- |
| P2-LAND-001 | Horizontal scroll areas may not have enough visible scroll affordance for all users. | P2 | Add subtle edge fade, section-level helper text, or snap indicators in a later UI polish task. |
| P2-LAND-002 | Footer groups use a compact grid on mobile, which is acceptable but should be verified on small physical devices. | P2 | Run Playwright screenshot/device QA before production launch. |

## 6. Desktop UX Review

Desktop QA result: pass with flow-length concern.

Strengths:

- Hero, Role Gateway, Featured Marketplace, and Country / Service Gateway have consistent visual hierarchy.
- CTA placement is clear and not overloaded in the new Builder-ready sections.
- Notice / Event / CTA / Footer closes the page with a clear next step.

Risks:

- The legacy middle block makes the page very long and reduces the clarity of the new Landing Builder story.
- Repeated carousel/preview sections compete with the new Featured Marketplace section.
- Builder-ready sections and legacy sections use separate styling and data ownership models.

## 7. SEO / Accessibility Review

SEO / accessibility result: pass with follow-up.

Confirmed:

- Landing Hero uses a single primary `h1`.
- Builder-ready sections use semantic `section` wrappers and section headings.
- Disabled future CTAs are implemented as disabled buttons instead of broken links.
- Decorative icons in reviewed Builder-ready sections are marked with `aria-hidden` where applicable.

Follow-up:

| ID | Issue | Priority | Recommendation |
| --- | --- | --- | --- |
| P2-LAND-003 | Many legacy sections add additional heading density after the new v1 flow. | P2 | Re-check heading outline after legacy section ownership is resolved. |
| P2-LAND-004 | Keyboard and focus-visible QA for horizontal scroll cards was not fully completed in this docs-only pass. | P2 | Add browser screenshot and keyboard traversal QA in the next visual QA task. |

## 8. Translation Review

Translation result: pass with P1 cleanup.

Most new Landing v1 content is sourced through `t(...)` in `lib/i18n/translation.ts`.

Translation issues:

| ID | Location | Issue | Priority | Recommendation |
| --- | --- | --- | --- | --- |
| P1-LAND-003A | `components/public/landing/landing-role-gateway-section.tsx` | Section kicker text `Role Gateway` is hardcoded. | P1 | Move to translation key. |
| P1-LAND-003B | `components/public/landing/landing-featured-marketplace-section.tsx` | Section kicker text `Marketplace Preview` is hardcoded. | P1 | Move to translation key. |
| P2-LAND-005 | Footer rights label | Rights text is translation-backed but year is static in translation content. | P2 | Consider dynamic year or a maintained translation token before production. |

## 9. Security / PII Review

Security / PII result: pass for Landing v1.

Confirmed:

- No Buyer email, phone, or contact person is exposed in the new Landing v1 sections.
- No Student PII is exposed.
- No Supplier-Buyer direct contact CTA is present.
- Featured Marketplace policy text states Buyer contact protection and brokerage requirements.
- New Landing v1 sections do not use service role or admin client code.

Remaining security-sensitive follow-up:

- The future Exposure Engine connection must only pull approved/published content.
- Buyer-facing and Supplier-facing previews must keep Buyer PII masked or excluded.
- Any future inquiry CTA must route through Admin Brokerage, not direct Supplier-Buyer messaging.

## 10. Builder-ready Consistency Review

Builder-ready result: partially ready.

Consistent patterns:

- New sections use a config object with `sectionId`, `visibility`, and `publishState`.
- New sections render nothing when `visibility.isVisible` is false or `publishState` is not `published`.
- New section item arrays are structured enough to map into future `landing_sections` and `landing_section_items`.
- Disabled future routes are represented in config through `isEnabled: false`.

Inconsistencies:

| ID | Issue | Priority | Recommendation |
| --- | --- | --- | --- |
| P1-LAND-004 | New config objects are defined directly inside `app/(public)/page.tsx`, while legacy sections fetch sample arrays inside the same page. | P1 | Move Landing v1 static config into a dedicated landing config module before DB migration. |
| P1-LAND-005 | Section config types repeat local `visibility` and `publishState` definitions. | P1 | Introduce a shared `LandingSectionBaseConfig` type before CMS integration. |
| P1-LAND-006 | Builder foundation requires Use / Hide / Reorder / Schedule / Preview / Publish, but current runtime only models visibility and publish state. | P1 | Add explicit schedule/order/preview fields to static config before table design is finalized. |
| P2-LAND-006 | Landing CSS is concentrated in `app/globals.css` with many section-specific selectors. | P2 | Move toward component-scoped CSS or design-tokenized shared section classes in a later UI cleanup. |

## 11. P0 Issues

No P0 issues found.

P0 checks:

- No live CTA to Supplier-Buyer direct contact.
- No Buyer PII exposure.
- No Student PII exposure.
- No active link to missing route found in reviewed Landing v1 CTAs.
- No DB/RLS/Supabase mutation involved in this QA task.

## 12. P1 Issues

| ID | Issue | Impact | Today Fix Candidate |
| --- | --- | --- | --- |
| P1-LAND-001 | Builder-ready sections are mixed with legacy sample-driven sections. | Blocks clean Builder DB transition and dilutes the Landing v1 flow. | Decide whether to hide legacy middle sections from Landing v1 or convert them to Builder-ready config. |
| P1-LAND-002 | `/` still depends on `getSampleItems` and sample fallback data. | Demo/sample content can appear production-like. | Replace the landing middle block with approved static config or mark it out of Landing v1 scope. |
| P1-LAND-003 | Hardcoded public labels remain in new landing components. | Violates translation-key policy. | Move `Role Gateway` and `Marketplace Preview` to `lib/i18n/translation.ts`. |
| P1-LAND-004 | Static configs are embedded in `app/(public)/page.tsx`. | DB transition will require a larger page refactor. | Extract configs to a dedicated `lib/landing/landing-v1-config.ts` or similar module. |
| P1-LAND-005 | Builder controls are not fully represented in config. | Admin Builder schema may be under-specified. | Add order, schedule, preview, and publish metadata fields to the static config model before DB design. |

## 13. P2 / Post-MVP Items

| ID | Item | Timing |
| --- | --- | --- |
| P2-LAND-001 | Add clearer horizontal scroll affordance on mobile cards. | UI polish |
| P2-LAND-002 | Run screenshot QA on 390px, 768px, 1440px, and wide desktop viewports. | Before public launch |
| P2-LAND-003 | Re-check heading outline after legacy sections are resolved. | Before SEO pass |
| P2-LAND-004 | Keyboard traversal and focus-state QA for horizontal card areas. | Accessibility pass |
| P2-LAND-005 | Dynamic or maintained footer year token. | Production polish |
| P2-LAND-006 | Reduce section-specific CSS accumulation in `app/globals.css`. | Design system cleanup |
| Post-MVP | Landing Builder Admin editor. | Post static v1 |
| Post-MVP | Preview / schedule / publish workflow backed by DB. | Post static v1 |
| Post-MVP | Exposure Engine ranking data for Featured Marketplace. | Post static v1 |
| Post-MVP | Real Notice / Event query replacement. | Post static v1 |
| Post-MVP | Banner / Popup Builder. | Later Landing Builder sprint |

## 14. Recommended Next Task

Recommended next task:

Sprint 3 Landing Experience Engine Task 08 - Landing v1 P1 Cleanup

Suggested scope:

1. Move hardcoded section labels into translation keys.
2. Extract new Landing v1 static configs out of `app/(public)/page.tsx`.
3. Decide whether the legacy middle block remains part of Landing v1.
4. If the legacy block remains, wrap each legacy section with Builder-ready config metadata.
5. If the legacy block is deferred, remove it from the Landing v1 page flow without deleting the underlying components.

Builder DB transition decision:

Ready with Conditions for schema planning, but not ready for direct DB migration. The Builder DB phase should wait until section ownership, config normalization, and legacy sample-driven content strategy are resolved.

# Public UI Design System v1

## 1. Purpose

Public UI Design System v1 is the fixed visual baseline for the B2B2G public website before more landing or sub-page redesign work continues. The goal is to stop page-by-page subjective redesign and keep `/`, `/login`, `/signup/*`, invitation pages, and future public marketplace pages in one coherent system.

## 2. Source References

- `DESIGN.md`: Apple-inspired public interface rules, typography, spacing, card, button, and responsive guidance.
- `/login`: current auth card, dark intro panel, white form panel, calm border, and pill button baseline.
- `/signup/supplier`: current public signup structure, parchment intro, rounded cards, form rhythm, and policy side cards.

## 3. Design Positioning

B2B2G public UI should feel like a controlled global B2B marketplace, not an open consumer shopping mall and not an admin dashboard.

Primary qualities:

- Clean, high-trust, product-led, and approval-aware.
- White / soft blue / parchment surfaces.
- One blue action color.
- Large readable type for 40-60s business users.
- Clear hierarchy: navigation, product discovery, protected demand, programs, trust proof, next steps.
- No decorative noise, no excessive gradients, no dense dashboard-like tables on public pages.

## 4. Color Rules

| Token | Use |
| --- | --- |
| `#ffffff` | Primary card and content surface |
| `#f5f5f7` | Parchment page breaks and signup/auth-aligned bands |
| `#f7f9fc` | Soft marketplace page background |
| `#0b63ce` | Primary action blue |
| `#0757b8` | Primary action hover/focus |
| `#202124` | Main ink |
| `#4f535b` | Body muted text |
| `#858891` | Fine print and secondary metadata |
| `#dedfe3` | Hairline border |

Rules:

- Use blue for actions, links, focus, and trust accents only.
- Do not introduce purple, teal, orange, or heavy gradients as dominant visual themes.
- Use dark surfaces sparingly. Public home should remain light-first.

## 5. Typography Rules

| Use | Size | Weight | Notes |
| --- | ---: | ---: | --- |
| Page display | 44-56px desktop / 34-40px mobile | 600 | Tight, calm, not black-heavy |
| Section heading | 30-40px desktop / 26-32px mobile | 600 | One clear heading per section |
| Card title | 18-22px | 600 | Clamp to 1-2 lines |
| Body | 16-17px | 400 | Prefer 17px where space allows |
| Caption | 13-14px | 400/600 | Metadata, badges, helper copy |

Rules:

- Keep letter spacing at 0 in CSS utility classes unless a tiny uppercase label needs tracking.
- Avoid all-caps paragraphs.
- Avoid oversized hero text on mobile.

## 6. Header Rules

Public header:

- Sticky, frosted, white/parchment surface.
- Logo left, navigation center, utility actions right.
- Desktop menu stays one line: Commercial, Industrial, EPC, Event, BUY & SELL, Networking, Service.
- Right side defaults to buyer proof, Language, Login.
- No Get Started button in the header.
- Mobile uses logo + Language + Login, with nav in a horizontal scroll row under the header.
- Header height target: 56-64px desktop, 60-64px mobile.

## 7. Card Rules

Base card:

- Background: white.
- Border: 1px solid `#dedfe3` or softer.
- Radius: 18-24px.
- Shadow: none or very subtle. Let image/product content provide visual weight.
- Padding: 20-24px desktop, 16-20px mobile.

Product card:

- Image area must be square (`aspect-ratio: 1 / 1`).
- Image uses `object-fit: cover` unless product transparency requires contain.
- Text area has consistent height.
- CTA is bottom-aligned.
- Show verified badge only for verified suppliers.
- No price display.

## 8. Grid and Breakpoint Rules

Public marketplace grids:

- Desktop: 4 product columns.
- Tablet: 2 product columns.
- Mobile: 1 product column unless content is explicitly a small horizontal chip row.
- Two-column content boards collapse to one column below desktop.
- Do not use fixed `min-width` values that exceed the viewport.
- Every grid child must support `min-width: 0`.

## 9. Mobile Rules

Mobile pages must prioritize:

- No horizontal body overflow.
- Header and nav must not squeeze content.
- Product cards should be 1-column and full-width.
- Card image remains square.
- Section padding target: 24px horizontal, 44-56px vertical.
- Avoid side-by-side media/text hero layouts on mobile.
- Footer columns collapse cleanly to one column.

## 10. CTA Rules

- Primary action uses the existing `pill-primary` visual language.
- Secondary actions use quiet blue text or border pills.
- Public product CTAs may say `Inquire Now` only as a placeholder for brokered inquiry routing.
- No CTA may imply Supplier-Buyer direct contact.
- Disabled future routes must be visually clear and must not look broken.

## 11. Landing Section Rules

Landing order for the current Marketplace Home:

1. Compact marketplace intro
2. Premium product discovery
3. Buyer requests and event programs
4. Supplier operating pathways
5. Innovation showcase and verified buyer proof
6. Latest products
7. Announcements and FAQ
8. Footer

Rules:

- The top of `/` should show marketplace value quickly without a huge empty hero.
- Sections must have stable spacing and consistent card radii.
- Product and request data may be static config for now, but it must not be labeled as sample content in the UI.

## 12. Privacy and Security UI Rules

- Do not display Buyer email, phone, contact person, or internal identifiers.
- Buyer company names shown publicly must be masked.
- Student PII is never shown on public landing surfaces.
- Supplier-Buyer inquiry language must point to protected or brokered workflow.
- Service role/admin client boundaries are not a UI element, but public components must never import admin clients.

## 13. Footer Rules

Footer should be calm and information-dense but not oversized.

- Use parchment or white by default.
- Navy footer is allowed only if it does not dominate the page.
- Columns: Marketplace, Programs, Network, Company, Support.
- Newsletter area must look secondary and disabled until real subscription exists.
- Legal row stays small and quiet.

## 14. Implementation Notes

- `/` uses this document as the visual source before future Landing Builder DB work.
- `/login` and `/signup/*` remain the practical component baseline for card, form, and button treatment.
- Sub-pages should reuse the same header, section width, card, grid, and footer rules before adding domain-specific UI.

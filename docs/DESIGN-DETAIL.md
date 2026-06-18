# DESIGN-DETAIL.md

Version: 1.0

Project: B2BB2G.COM

Purpose:

This document defines actual page layouts, wireframes, dashboard structures, component structures, and UI implementation details.

DESIGN.md defines strategy.

DESIGN-DETAIL.md defines implementation.

---

# 1. Homepage Layout

## Desktop Wireframe

```text
Top Utility Bar

Language
Sign In
Messages
Saved
My Page

--------------------------------

Header

Logo
Search
Create Buy Request

--------------------------------

Navigation

Commercial
Industrial
EPC
Event
BUY & SELL
Networking
Thailand FDA Service
Notice

--------------------------------

Hero Search

Left

Headline
Subheadline
Search Bar
Search Types

Right

Live Marketplace Activity

--------------------------------

KPI Bar

Verified Suppliers
Products
Buy Requests
Countries
Events

--------------------------------

Trust Bar

Verified Companies
FDA Support
Business Matching
Global Trade Ambassador

--------------------------------

Country Gateway Cards

Thailand
Vietnam
Malaysia
Indonesia
Philippines
Japan
China

--------------------------------

Urgent Buy Requests

--------------------------------

Featured Korean Suppliers

--------------------------------

Featured Commercial Products

--------------------------------

Top Industry Categories

--------------------------------

Industrial Projects

--------------------------------

EPC Projects

--------------------------------

Student Showcase

--------------------------------

Events

--------------------------------

Thailand FDA Service

--------------------------------

Notice

--------------------------------

Footer
```

---

# 2. Company Detail Layout

Route

```text
/companies/[slug]
```

Desktop Layout

```text
70%

Company Hero

Overview

Products

Industrial

EPC

Certificates

Catalogs

Related Buy Requests

Related Companies

-------------------------

30%

Verification Badge

Company Score

Response Rate

Profile Completion

Inquiry Form
```

Mobile Layout

```text
Company Hero

Verification

Company Score

Inquiry

Overview

Products

Industrial

EPC

Certificates

Catalogs

Related Buy Requests
```

---

# 3. Product Detail Layout

Route

```text
/commercial/[id]
```

Desktop Layout

```text
60%

Image Gallery

-----------------

40%

Product Overview

Verification Badge

Company Score

Inquiry CTA

Save Product

Add To Inquiry Cart
```

Below

```text
Specifications

Company Information

Certificates

Related Buy Requests

Related Products
```

---

# 4. Dashboard Standard Layout

Desktop

```text
Sidebar

Header

KPI Cards

Content Area

Notification Panel
```

Mobile

```text
Header

KPI Cards

Content

Bottom Navigation
```

---

# 5. Supplier Dashboard

Menu

```text
Overview

Company

Products

Industrial

EPC

BUY & SELL

FDA

Inquiries

Matching

Files

Analytics

Messages

Notifications
```

Overview KPI

```text
Company Score

Products

Inquiries

Matches

FDA Cases

Featured Content
```

---

# 6. Buyer Dashboard

Menu

```text
Overview

Products

Buy Requests

Saved

Inquiry Cart

Referrals

Matching

Messages

Notifications
```

Overview KPI

```text
Buy Requests

Matches

Referrals

Rewards
```

---

# 7. Agent Dashboard

Menu

```text
Overview

Assigned Countries

Buyer Network

Buyer Sources

Matching

Messages

Announcements
```

Overview KPI

```text
Buyer Count

Country Count

Matches

Buyer Sources
```

---

# 8. Professor Dashboard

Menu

```text
Overview

Students

Student Showcase

Market Research

Performance

Messages

Announcements
```

Overview KPI

```text
Students

Showcases

Buyer Acquisitions

Reports
```

---

# 9. Student Dashboard

Menu

```text
Overview

Global Trade Passport

My Showcase

My Buyers

My Referrals

Market Research

Events

Messages

Badge

Reward

Activities
```

Overview KPI

```text
Buyer Count

Showcase Views

Showcase Inquiries

Reports

Rewards
```

---

# 10. Product Card

Desktop

```text
Image

Product Name

Supplier

Country

Verification Badge

Company Score

Inquiry Button
```

---

# 11. Company Card

Desktop

```text
Logo

Company Name

Verification Badge

Company Score

Country

Industry

Inquiry
```

---

# 12. Buy Request Card

Desktop

```text
Title

Buyer Country

Industry

Quantity

Destination Country

Posted Date

Match CTA
```

# 13. Student Showcase Card

Desktop

```text
Student

University

Career Rank

Showcase Title

Views

Inquiries

View Showcase
```

---

# 14. Admin Layout

Desktop

```text
Sidebar

Header

Filter Bar

Table

Detail Drawer
```

All Admin Lists

```text
Search

Status Filter

Date Filter

Bulk Actions

Detail Drawer

Approval Actions

Audit History
```

---

# 15. Marketplace Ranking

Homepage

```text
Top Suppliers

Top Products

Top Ambassadors

Top Buyers
```

---

# 16. Country Gateway

Example

```text
Thailand

Top Buyers

Top Suppliers

Popular Products

Buy Requests

Events

Market Research

Buyer Demand Heatmap
```

---

# 17. Future Components

```text
AI Recommendation

Marketplace Analytics

Buyer Acquisition Tracking

Company Visibility Score

Public API

Multi Tenant

B2G Expansion
```

---

# Final Rule

DESIGN.md

= Strategy

DESIGN-DETAIL.md

= UI Implementation

Codex must follow DESIGN-DETAIL.md when generating actual screens.

---

# 18. Component Size Rules

| Component | Size |
|-----------|------|
| Button Height | 44px |
| Large CTA | 52px |
| Input | 44px |
| Search Bar | 56px |
| Card Radius | 18px |

Implementation rules:

- Primary buttons, secondary buttons, and table action buttons should keep a 44px minimum touch height.
- Large CTA buttons used in public hero/search areas should use 52px height.
- Text inputs and select controls should use 44px height.
- Main search bars should use 56px height.
- Cards should use 18px radius unless a local component specification overrides it.

---

# 19. Grid Rules

| Viewport | Columns |
|----------|---------|
| Desktop | 4 Columns |
| Tablet | 2 Columns |
| Mobile | 1 Column |

Implementation rules:

- Public company, product, event, and showcase card grids should follow this column rule.
- Admin dashboards may use tables instead of card grids when operational density is more important.
- Mobile layouts must collapse to one column without overlapping text, buttons, badges, or media.

---

# 20. Color Tokens

| Token | Value |
|-------|-------|
| Primary | #0057d9 |
| Success | #0f9f6e |
| Warning | #f59e0b |
| Danger | #dc2626 |

Implementation rules:

- Primary is used for main actions, active navigation, focus accents, and primary links.
- Success is used for approved, verified, completed, and successful states.
- Warning is used for submitted, pending, reviewing, quoted, or waiting states.
- Danger is used for rejected, suspended, blocked, failed, and destructive actions.

---

# 21. Translation Rule

All visible labels must use translation keys.

No hardcoded UI labels.

---

# 22. Status Badge Rules

| Status | Badge Color |
|--------|-------------|
| Approved | Green |
| Submitted | Blue |
| Reviewing | Yellow |
| Rejected | Red |
| Suspended | Red |
| Draft | Gray |

Implementation rules:

- Status badges must use the same color meaning across Public, Dashboard, and Admin screens.
- Status text must use translation keys.
- Status badges should fit in table cells without wrapping on desktop.

---

# 23. KPI Card Rules

KPI cards must include the following structure.

```text
Icon
Title
Value
Change %
Trend
```

Example:

```text
Products

12,422

+12%
```

Implementation rules:

- KPI values should be readable at mobile width.
- Change percentage should use Success, Warning, or Danger color according to trend meaning.
- Trend should be visual but not color-only; include text, icon, or direction indicator.

---

# 24. Empty State Rules

Standard empty states:

```text
No Products

No Buy Requests

No Events

No Messages
```

Implementation rules:

- Empty state labels must use translation keys.
- Empty states should include one primary next action when the user has permission to create or request data.
- If the user has no permission to create, show a neutral empty state without a create action.

---

# 25. Loading State Rules

Standard loading states:

```text
Skeleton Cards

Skeleton Table

Skeleton Detail
```

Implementation rules:

- Use Skeleton Cards for public card grids and dashboard summary panels.
- Use Skeleton Table for admin lists and dense operational tables.
- Use Skeleton Detail for company, product, FDA, message, and profile detail views.
- Loading skeletons must preserve the final layout dimensions to prevent layout shift.

---

# 26. Table Density Rules

| Area | Density |
|------|---------|
| Admin | Dense |
| Dashboard | Normal |
| Public | Comfortable |

Implementation rules:

- Admin tables should prioritize operational scanning, filters, bulk actions, and compact row height.
- Dashboard tables should balance readability with repeated task usage.
- Public tables and lists should use more spacing for casual browsing and mobile readability.

---

# 27. Modal Rules

Standard modal sizes:

```text
Small

Medium

Large

Fullscreen Mobile
```

Implementation rules:

- Small modals are for confirmation and simple status actions.
- Medium modals are for short forms and focused edits.
- Large modals are for detail review, approval workflows, and file previews.
- Mobile modals should use Fullscreen Mobile when content includes forms, tables, or file previews.

---

# 28. File Upload Rules

Required upload states:

```text
Image Preview

PDF Preview

Upload Progress
```

Implementation rules:

- Image uploads must show preview before submit when possible.
- PDF uploads must show filename, size, and preview or open action.
- Upload Progress must show pending, success, and failed states.
- File labels, errors, and actions must use translation keys.

---

# 29. Notification Rules

Standard notification types:

```text
Success

Warning

Error

Info
```

Implementation rules:

- Success is used for completed create, update, submit, approval, and upload actions.
- Warning is used for pending review, missing required data, and non-blocking issues.
- Error is used for failed requests, denied access, validation failure, and upload failure.
- Info is used for neutral system guidance, status changes, and background process updates.

---

# 30. Search Result Layout

Desktop:

```text
Left Filter

Right Results
```

Mobile:

```text
Drawer Filter
```

Implementation rules:

- Desktop search pages should keep filters visible on the left and results on the right.
- Mobile search pages should move filters into a drawer.
- Filter state must remain visible through chips, count labels, or summary text after the drawer closes.
- Search result labels and filter names must use translation keys.

---

# 31. Navigation Rules

Required navigation states:

```text
Desktop Header Height

Mobile Header Height

Sticky Header

Sticky Search
```

Implementation rules:

- Desktop Header Height should remain stable across public pages, dashboards, and admin pages.
- Mobile Header Height should preserve enough touch area for menu, search, and account actions.
- Sticky Header is allowed for primary navigation when it improves repeated navigation.
- Sticky Search is allowed on marketplace search, product search, company search, and BUY REQUEST search pages.
- Sticky elements must not overlap content, filters, modals, or system notifications.

---

# 32. Card Hover Rules

Allowed hover effects:

```text
Card Hover

Scale

Border Highlight

Shadow Increase
```

Implementation rules:

- Card Hover may be used on public company, product, event, and showcase cards.
- Scale must be subtle and must not shift surrounding layout.
- Border Highlight should use the Primary token or neutral border token.
- Shadow Increase should remain modest and must not make operational admin tables feel like card grids.
- Hover states must not be the only way to reveal critical actions.

---

# 33. Pagination Rules

Desktop:

```text
Page Numbers
```

Mobile:

```text
Load More
```

Implementation rules:

- Desktop tables and search results should use Page Numbers when total count matters.
- Mobile public lists should prefer Load More for simpler interaction.
- Admin mobile tables may still use Page Numbers when auditability or exact position matters.
- Pagination labels must use translation keys.

---

# 34. Chart Rules

Supported chart types:

```text
Line Chart

Bar Chart

Donut Chart
```

Analytics 대비:

- Line Chart is used for trends over time, such as views, inquiries, or buyer acquisition.
- Bar Chart is used for category, country, supplier, product, or student comparisons.
- Donut Chart is used for composition, such as status distribution or source mix.
- Charts must include accessible labels and should not rely on color alone.
- Chart legends, tooltips, and axis labels must use translation keys.

---

# 35. Responsive Breakpoints

| Breakpoint | Width |
|------------|-------|
| Mobile Small | 360px |
| Mobile | 480px |
| Tablet | 768px |
| Desktop Small | 1024px |
| Desktop | 1280px |
| Desktop Large | 1440px |

Implementation rules:

- Layout must work at Mobile Small 360px without text or button overlap.
- Mobile layouts should use one column and drawer-based filters.
- Tablet layouts may use two columns for cards and summary panels.
- Desktop Small and above may use sidebar layouts, tables, and persistent filters.
- Desktop Large should constrain content width where wide lines reduce readability.

---

# 36. Table Actions

Admin standard actions:

```text
View

Edit

Approve

Reject

Suspend

Delete
```

Implementation rules:

- View should be available for records the user can read.
- Edit should be available only for owner or Admin-permitted records.
- Approve, Reject, and Suspend are Admin actions unless a document-specific policy says otherwise.
- Delete should be rare and should prefer soft delete for business records.
- Destructive actions must use confirmation modals.
- Table action labels must use translation keys.

---

# 37. Form Validation Rules

Input validation 기준:

```text
Required

Email

Phone

URL

Number

File Size
```

Implementation rules:

- Required fields must show validation before submit and after failed submit.
- Email fields must validate email format.
- Phone fields must support international phone formats where relevant.
- URL fields must validate protocol and domain format.
- Number fields must validate numeric range and units where applicable.
- File Size validation must run before upload when possible and again server-side.
- Validation messages must use translation keys.

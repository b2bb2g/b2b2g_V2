# Product Registration Child Table RLS Design

## 1. Purpose

This document defines the RLS design for product registration child tables created by:

`supabase/migrations/20260701120539_product_registration_core.sql`

It prepares the next RLS migration without applying SQL, changing production data, connecting Supplier submit, or enabling public DB-backed product detail.

## 2. Design Scope

Target tables:

- `products`
- `product_images`
- `product_documents`
- `product_certificates`
- `product_registration_fields`
- `product_registration_values`

Out of scope:

- Storage bucket policy SQL
- public product query implementation
- Supplier product submit action
- Admin product approval UI
- file upload flow
- public inquiry/RFQ creation
- product reviews
- product price terms

## 3. Existing RLS Baseline

Current helper and policy baseline:

| Object | Current Purpose | Required Adjustment |
| --- | --- | --- |
| `public.is_admin()` | Admin check through legacy member type / roles. | Reuse for Admin policies. Future account_roles helper can replace later. |
| `public.current_supplier_id()` | Resolves current user's Supplier profile id. | Reuse for Supplier owner policies. |
| `public.is_approved_product(product_id)` | Checks `products.approval_status = approved`, `is_active`, and `deleted_at`. | Update or add a new helper to also require `publish_status = published`. |
| `products_approved_public_select` | Public approved product read. | Must include `publish_status = published` after 016 is applied/backfilled. |
| `products_supplier_owner_*` | Supplier owner access by `supplier_id = current_supplier_id()`. | Reuse but restrict public publish/approval fields through application/Admin policy. |
| New child tables | RLS enabled with no policies. | Add narrowly scoped policies. |

## 4. Security Principles

| ID | Principle |
| --- | --- |
| PR-RLS-001 | Public reads require approved parent product and published parent product. |
| PR-RLS-002 | Child rows require their own approval/visibility gate in addition to parent product visibility. |
| PR-RLS-003 | Supplier can manage only rows attached to own products. |
| PR-RLS-004 | Supplier cannot approve, publish, verify, or force public visibility. |
| PR-RLS-005 | Admin can manage all product registration child rows. |
| PR-RLS-006 | Student cannot insert/update product root or child tables. |
| PR-RLS-007 | Buyer PII is not represented in product tables and must not be exposed through joins. |
| PR-RLS-008 | Public price is not represented and must not be added by RLS/view design. |
| PR-RLS-009 | Supplier-Buyer direct contact is not represented and must not be introduced by product policies. |
| PR-RLS-010 | Service role fallback must not be used in application code to bypass these policies. |

## 5. Helper Function Design

### 5.1 `is_public_product(product_id uuid)`

Purpose:

Return true only when a product can be read on public/catalog surfaces.

Required checks:

- product exists
- `approval_status = 'approved'`
- `publish_status = 'published'`
- `is_active = true`
- `deleted_at is null`

Implementation note:

- Prefer adding a new helper instead of silently changing the existing `is_approved_product()` semantics until existing public queries are reviewed.
- If `is_approved_product()` is updated, all dependent policies/functions must be reviewed because older rows currently default `publish_status = 'draft'`.

### 5.2 `can_manage_product(product_id uuid)`

Purpose:

Return true for Admin or Supplier owner of the product.

Required checks:

- `public.is_admin()`
- OR product `supplier_id = public.current_supplier_id()`
- product `deleted_at is null`

This helper should not grant publish/approval permission. It is for owner draft/submission management only.

### 5.3 `can_read_product_child(product_id uuid, child_approval_status text, child_visibility text)`

Purpose:

Return true for public-safe product media/document rows.

Required checks:

- `is_public_product(product_id)`
- child `approval_status = 'approved'`
- child visibility is public-safe:
  - images: `visibility = 'public'`
  - documents: `visibility = 'public'`
  - certificates: use separate public display helper

### 5.4 `can_read_product_value(product_id uuid, value_approval_status text, value_public_display text)`

Purpose:

Return true for public-safe product registration values.

Required checks:

- `is_public_product(product_id)`
- value `approval_status = 'approved'`
- `public_display in ('summary', 'visible')`

### 5.5 `can_read_product_certificate(product_id uuid, approval_status text, public_display text, verification_status text)`

Purpose:

Return true for public-safe certificate metadata cards.

Required checks:

- `is_public_product(product_id)`
- certificate `approval_status = 'approved'`
- `public_display in ('summary', 'visible')`
- `verification_status in ('verified', 'pending')` only if product team wants pending display; recommended MVP public display is `verification_status = 'verified'`

Recommendation:

- MVP should require `verification_status = 'verified'` for public certificate display.
- Admin can still see pending/rejected/expired certificates.

## 6. Product Root Policy Adjustment

Current public select:

```sql
approval_status = 'approved'
and is_active = true
and deleted_at is null
```

Target public select after product publish migration is applied and backfilled:

```sql
approval_status = 'approved'
and publish_status = 'published'
and is_active = true
and deleted_at is null
```

Risk:

- Existing product rows get `publish_status = 'draft'` from the additive migration.
- If public product policy is tightened before product backfill/review, existing public products may disappear.

Decision:

- Do not update `products_approved_public_select` until product data audit/backfill is complete.
- Child table RLS can still be authored with `is_public_product()` and applied after backfill readiness is confirmed.

## 7. Product Images Policies

| Policy | Operation | Role | Rule |
| --- | --- | --- | --- |
| Public read | select | anon/authenticated/public | `is_public_product(product_id)` and image approved and `visibility = public` and `deleted_at is null`. |
| Supplier owner read | select | authenticated | `can_manage_product(product_id)` and row `deleted_at is null`. |
| Supplier owner insert | insert | authenticated | `can_manage_product(product_id)` and row starts `approval_status in ('draft','submitted')`; no Admin-only state. |
| Supplier owner update | update | authenticated | `can_manage_product(product_id)` and row not deleted; with check keeps own product and non-admin states. |
| Admin all | all | authenticated | `is_admin()`. |

Supplier owner restrictions:

- Supplier should not set `approval_status = 'approved'`.
- Supplier should not set `visibility = 'admin'`.
- Supplier can request `visibility = 'public'`, but public exposure still requires Admin approval.

## 8. Product Documents Policies

| Policy | Operation | Role | Rule |
| --- | --- | --- | --- |
| Public read | select | anon/authenticated/public | `is_public_product(product_id)` and document approved and `visibility = public` and `deleted_at is null`. |
| Supplier owner read | select | authenticated | `can_manage_product(product_id)` and row `deleted_at is null`. |
| Supplier owner insert | insert | authenticated | own product only, default `visibility = restricted`, draft/submitted status only. |
| Supplier owner update | update | authenticated | own product only, no approved status, no Admin-only visibility. |
| Admin all | all | authenticated | `is_admin()`. |

Document-specific restrictions:

- Public downloads must also pass `files`/Storage policy.
- `product_documents.visibility = public` is not enough by itself; parent product and approval must pass.
- Restricted documents should remain hidden from public product detail.

## 9. Product Certificates Policies

| Policy | Operation | Role | Rule |
| --- | --- | --- | --- |
| Public read | select | anon/authenticated/public | parent product public, certificate approved, verified, public display summary/visible, not deleted. |
| Supplier owner read | select | authenticated | own product only. |
| Supplier owner insert | insert | authenticated | own product only, draft/submitted approval, pending verification only. |
| Supplier owner update | update | authenticated | own product only, cannot verify, approve, or force public visibility beyond request. |
| Admin all | all | authenticated | `is_admin()`. |

Admin-only fields:

- `verification_status`
- `verified_by`
- `verified_at`
- `approval_status = approved/rejected/suspended`

Supplier can submit certificate metadata, but Admin verifies and approves public display.

## 10. Product Registration Fields Policies

| Policy | Operation | Role | Rule |
| --- | --- | --- | --- |
| Authenticated active read | select | authenticated | `is_active = true` and `deleted_at is null`. |
| Optional public active read | select | anon/public | Only if form metadata must power public pages; recommended to defer. |
| Admin all | all | authenticated | `is_admin()`. |

Recommendation:

- MVP should allow authenticated read for Supplier form rendering.
- Public read is not required until DB-backed public product detail needs field labels.
- No Supplier write.

## 11. Product Registration Values Policies

| Policy | Operation | Role | Rule |
| --- | --- | --- | --- |
| Public read | select | anon/authenticated/public | parent product public, value approved, `public_display in ('summary','visible')`, not deleted. |
| Supplier owner read | select | authenticated | own product only. |
| Supplier owner insert | insert | authenticated | own product only, draft/submitted status only. |
| Supplier owner update | update | authenticated | own product only, cannot set approved status or force public fields if Admin has hidden them. |
| Admin all | all | authenticated | `is_admin()`. |

Value-specific restrictions:

- Values with `public_display = hidden` must not appear in public product detail.
- Values must not contain price or Buyer PII. This is primarily input validation, but Admin review must also check it before approval.

## 12. Files / Storage Dependency

Product media policies depend on the existing `files` table and future Storage rules.

Before enabling Supplier upload:

- Validate bucket is `product-files`.
- Validate MIME type and size.
- Insert `files` row owned by the Supplier profile.
- Attach file via `product_images`, `product_documents`, or `product_certificates`.
- Keep documents restricted by default.
- Ensure public file access requires both file visibility and product child visibility.

Do not expose file paths directly through product child RLS unless `files`/Storage policies are aligned.

## 13. SQL Migration Plan

Next logical migration:

`017_product_registration_child_table_rls.sql`

Because Supabase CLI generates timestamped migration filenames, the actual file should be created with:

```text
supabase migration new product_registration_child_table_rls
```

Planned SQL contents:

1. Add `is_public_product(product_id uuid)` helper.
2. Add `can_manage_product(product_id uuid)` helper.
3. Add child-table helper functions or inline predicates.
4. Add select/insert/update/admin policies for:
   - `product_images`
   - `product_documents`
   - `product_certificates`
   - `product_registration_fields`
   - `product_registration_values`
5. Do not update root `products` public policy until product data audit/backfill is complete.
6. Do not add Storage policy in this migration unless Storage design is reviewed.

## 14. Test Scenarios

Required RLS tests after SQL authoring:

| Scenario | Expected |
| --- | --- |
| Public can read approved/published product image with approved/public image row | Allowed |
| Public cannot read image for draft product | Blocked |
| Public cannot read unapproved image for public product | Blocked |
| Public cannot read restricted product document | Blocked |
| Public can read approved/verified certificate summary only | Allowed |
| Public cannot read hidden registration value | Blocked |
| Supplier can read own draft product image/document/value | Allowed |
| Supplier cannot read another Supplier child rows | Blocked |
| Supplier cannot approve own product image/document/certificate/value | Blocked |
| Student cannot insert product child rows | Blocked |
| Admin can manage all child rows | Allowed |
| Buyer PII and price fields are absent from product child projection | Confirmed |

## 15. Blocking Issues

| Issue | Priority | Required Before Apply |
| --- | --- | --- |
| Product data audit/backfill | P0 before root product public policy tightening | Existing products default to draft publish status. |
| Data API grants/exposure | P1 | New public tables may need explicit grants depending on Supabase project settings. |
| Storage policy | P1 | File download/upload must not be opened by child table policies alone. |
| Admin review UI | P1 | Needed before Supplier-submitted media/certificates/values can be approved. |
| Supplier form validation | P1 | Must block price, Buyer PII, and direct contact data in public fields. |
| Account roles helper migration | P2 | Existing DB helpers still rely partly on legacy member/profile roles. |

## 16. Codex Next Step

Recommended next task:

**Product Registration Child Table RLS Migration**

Scope:

- Author the RLS SQL migration file only.
- Do not apply to production yet.
- Add a pre-apply review document.
- Keep Supplier submit, upload, and DB-backed product detail blocked until RLS migration is reviewed and applied.

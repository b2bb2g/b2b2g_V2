# Product Upload UI Readiness Audit

## 1. Purpose

This audit determines whether Supplier product upload and product file UI can be safely connected after the product registration migrations and private `product-files` bucket migration.

Conclusion:

**Not Ready to Enable Upload UI**

Reason:

The private bucket exists, but `storage.objects` policies are still deferred because the standard production SQL path does not own `storage.objects`. Product upload UI must remain disabled until Storage object policies and runtime tests pass.

## 2. Reviewed Scope

| Area | Reviewed Files / Objects |
| --- | --- |
| Product registration UI | `components/dashboard/supplier-product-registration-form.tsx` |
| Product registration route | `app/(dashboard)/dashboard/products/new/page.tsx` |
| Static product model | `lib/products/static-products.ts` |
| Product registration schema | `supabase/migrations/20260701120539_product_registration_core.sql` |
| Product child-table RLS | `supabase/migrations/20260701122421_product_registration_child_table_rls.sql` |
| Product Storage bucket | `supabase/migrations/20260701130506_product_storage_policy.sql` |
| Storage policy follow-up | `docs/05-data/19-product-storage-object-policy-follow-up-plan.md` |
| Storage policy guide | `docs/05-data/20-product-storage-policy-dashboard-implementation-guide.md` |
| File metadata model | `supabase/migrations/20260618148000_file_storage_metadata_domain.sql` |
| File metadata RLS | `supabase/migrations/20260618149000_file_storage_metadata_rls.sql` |

## 3. Current UI State

`/dashboard/products/new` currently renders:

- structured Supplier product registration form
- image/document/certificate field template
- approval path information
- Buyer privacy guardrails
- disabled file input
- disabled submit button

Current safety:

- no product write
- no file upload
- no Storage write
- no `public.files` metadata write
- no product image/document/certificate row write
- no public inquiry creation
- no price field
- no Buyer PII field
- no direct Supplier-Buyer contact field

This is the correct state until Storage object policies are active and tested.

## 4. Current Data Readiness

| Layer | Status | Notes |
| --- | --- | --- |
| `products` additive columns | Ready at schema level | Product publish/review columns exist after core migration. |
| `product_images` | Ready at schema/RLS level | Requires `files` row and Storage object policy before upload UI. |
| `product_documents` | Ready at schema/RLS level | Public download must remain blocked by default. |
| `product_certificates` | Ready at schema/RLS level | Certificate metadata can be reviewed separately from file access. |
| `product_registration_fields` | Ready at schema/RLS level | Needs seed/admin field management before DB-backed form rendering. |
| `product_registration_values` | Ready at schema/RLS level | Needs validation and Admin review workflow. |
| `files` | Existing metadata model | Must be written in the same controlled workflow as Storage object upload. |
| `storage.buckets.product-files` | Ready as private bucket | Applied successfully by operator. |
| `storage.objects` product policies | Not ready | Must be created through owner-safe path. |

## 5. Required Upload Write Contract

When implementation begins, upload must be performed in this order:

1. Confirm authenticated Supplier session.
2. Confirm Supplier role is approved.
3. Confirm Supplier owns the target product.
4. Confirm product is not published.
5. Validate file type, size, and declared asset type.
6. Build Storage path:

```text
products/{supplier_id}/{product_id}/{asset_type}/{file_id-or-safe-name}
```

Allowed `asset_type`:

- `images`
- `catalogs`
- `technical-sheets`
- `certificates`
- `manuals`

7. Upload object to private `product-files` bucket.
8. Insert `public.files` metadata.
9. Insert one child table row:
   - `product_images`
   - `product_documents`
   - `product_certificates`
10. Keep approval status as `draft` or `submitted`.
11. Keep documents/certificates restricted unless Admin approves.
12. Return a sanitized result to UI.

Important:

Do not insert child rows without an active `files` row. Do not create a public product gallery directly from Storage object names.

## 6. File Metadata Requirements

Every uploaded file needs a `public.files` row.

Minimum expected metadata:

| Field | Required Rule |
| --- | --- |
| `bucket` | Must be `product-files`. |
| `path` | Must match the Storage object name exactly. |
| `owner_profile_id` | Must be the authenticated Supplier account/profile id. |
| `visibility` | Default `restricted` except approved public images. |
| `mime_type` | Must match allowlist and server validation. |
| `size_bytes` | Must be below bucket/file rules. |
| `is_active` | Must be true for current file. |
| `deleted_at` | Must be null for active files. |

File metadata must not include:

- Buyer email
- Buyer phone
- Buyer contact person
- Supplier direct contact release
- public price
- raw private conversation details

## 7. Product Child Row Requirements

### 7.1 Images

`product_images` insert should use:

- `product_id`
- `file_id`
- `image_role`
- `alt_text`
- `caption`
- `sort_order`
- `is_primary`
- `approval_status = draft/submitted`
- `visibility = public` as a request only

Public exposure still requires:

- parent product approved and published
- image approved
- image visibility public
- file visibility public
- Storage object public image select policy

### 7.2 Documents

`product_documents` insert should use:

- `product_id`
- `file_id`
- `document_type`
- `title`
- `description`
- `visibility = restricted` by default
- `approval_status = draft/submitted`

Public document download remains blocked until explicitly approved and policy-reviewed.

### 7.3 Certificates

`product_certificates` insert should use:

- `product_id`
- optional `file_id`
- `certificate_type`
- `title`
- `issuer`
- `certificate_number`
- `issued_at`
- `expires_at`
- `verification_status = pending`
- `public_display = hidden/summary` initially
- `approval_status = draft/submitted`

Admin must verify and approve before public trust badge display.

## 8. Server Action Boundary

Recommended new action layer:

`lib/actions/product-upload.ts`

Candidate actions:

- `prepareProductUpload(input)`
- `attachProductImage(input)`
- `attachProductDocument(input)`
- `attachProductCertificate(input)`
- `submitProductForReview(productId)`

Rules:

- server-only
- authenticated Supplier only
- no admin client fallback
- no service-role fallback
- no public price
- no Buyer PII
- no direct contact data
- structured validation before Storage upload
- clear error messages
- audit TODO hooks for later Admin/Audit Sprint

## 9. Query Boundary

Recommended new query layer:

`lib/queries/products.ts`

Candidate queries:

- `getMySupplierProducts()`
- `getMySupplierProductDraft(productId)`
- `getProductRegistrationFields()`
- `getProductFilesForSupplier(productId)`
- `getPublicProductDetail(slugOrId)`

Rules:

- public query returns only approved/published product projection
- Supplier query uses server client and RLS
- Admin query is separate and guarded
- no Buyer PII joins
- no direct contact joins
- no Storage path exposure for restricted files

## 10. UI Readiness Decision

| UI Area | Decision | Reason |
| --- | --- | --- |
| Product root text fields | Ready for next implementation | Needs server validation and DB write action. |
| Registration values | Ready for next implementation | RLS exists; needs validation and review status rules. |
| Image upload | Hold | Requires Storage object policies and runtime tests. |
| Document upload | Hold | Requires Storage policies and restricted download design. |
| Certificate upload | Hold | Requires Storage policies and Admin verification flow. |
| Submit product for review | Hold until product draft write exists | Needs product root + values persistence first. |
| Public DB-backed gallery | Hold | Requires public image Storage policy and approved test data. |
| Admin file review | Hold | Requires Admin product review UI design. |

## 11. Recommended Implementation Order

1. Product root draft action
2. Product registration values action
3. Supplier product draft query
4. Product upload action skeleton with upload disabled guard
5. Product upload UI component skeleton with disabled state
6. Storage object policy runtime validation
7. Enable image upload only
8. Admin image review UI
9. Public approved image gallery query
10. Documents/certificates upload after separate review

This order improves quality by letting product text/spec data become real before introducing file complexity.

## 12. P0 Blockers

| Blocker | Status | Required Resolution |
| --- | --- | --- |
| `storage.objects` product policies missing | Open | Create through owner-safe path and run runtime tests. |
| Product upload action missing | Open | Implement server-only action with validation. |
| Product root draft write missing | Open | Implement before file upload. |
| Admin product review UI missing | Open | Required before public publish workflow. |
| File content scanning/review missing | Open | MVP can rely on Admin review, but public document access must stay blocked. |

## 13. P1 Quality Improvements

| Improvement | Recommendation |
| --- | --- |
| Product form visual polish | Convert file fields into media upload cards with locked state until Storage ready. |
| Image gallery UX | Use multi-image thumbnails matching public product detail layout. |
| Certificate UX | Split certificate metadata from certificate file upload. |
| Admin review | Create a product review queue with image/document/certificate status cards. |
| Public detail | Keep static image fallback until DB-backed images pass tests. |

## 14. Security Checklist

Before enabling upload:

- `product-files` bucket remains private
- no delete Storage policy
- no public list Storage policy
- no public document/certificate read policy
- no service-role fallback in app code
- no client import of admin client
- Supplier can upload only to own product path
- Supplier cannot update published product files
- Admin can review uploaded files
- public images require approved product + approved image + public file metadata
- public product pages still hide price
- public product pages still hide Buyer PII

## 15. Next Recommended Task

Recommended next task:

**Product Draft Action Implementation Plan**

Goal:

Implement product root + registration values draft writes first, while keeping file upload disabled. This provides a high-quality, production-safe path toward real Supplier product registration without prematurely opening Storage upload.


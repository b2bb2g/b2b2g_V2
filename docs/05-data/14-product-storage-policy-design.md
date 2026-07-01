# Product Storage Policy Design

## 1. Purpose

This document defines the Storage policy design required before enabling Supplier product image, catalog, document, and certificate uploads.

It follows the product registration data model and child-table RLS work:

- `docs/05-data/08-product-registration-data-model-spec.md`
- `docs/05-data/10-product-registration-child-table-rls-design.md`
- `docs/05-data/11-product-registration-child-table-rls-migration-review.md`
- `docs/05-data/12-product-registration-production-apply-readiness.md`

This document does not create buckets, write SQL, apply Storage policies, modify Supabase production, connect upload UI, create files, or expose public DB-backed products.

## 2. Supabase Storage Baseline

Supabase Storage access is controlled through `storage.objects` RLS policies. Uploads are blocked by default without policies. Private buckets apply access control to downloads, while public buckets make files retrievable by URL.

Implications for B2BB2G:

- Product uploads must not use service-role fallback.
- Product files should default to private/restricted handling.
- Public product images can become public only after product, child row, file metadata, and Storage object rules all agree.
- Product documents and certificate files must not become public just because a product page is public.
- Bucket/object ownership must rely on `owner_id`, not deprecated `owner`.

Supabase changelog note:

- New public schema tables may not be exposed to Data/GraphQL APIs automatically in newer Supabase behavior. Storage policy work must be validated separately from table RLS and Data API grants.

## 3. Existing File Metadata Model

Current local migration:

`supabase/migrations/20260618148000_file_storage_metadata_domain.sql`

Current `public.files` fields relevant to product upload:

| Field | Purpose |
| --- | --- |
| `bucket` | Logical Storage bucket. Product files must use `product-files`. |
| `path` | Object path within the bucket. Must match product path rules. |
| `owner_profile_id` | Uploader/owner profile. Must equal authenticated user for Supplier upload. |
| `visibility` | `public`, `private`, or `restricted`. |
| `mime_type` | Validation and display control. |
| `size_bytes` | Upload size validation. |
| `metadata` | Additional file metadata. Must not contain Buyer PII or raw secrets. |
| `is_active`, `deleted_at` | Soft lifecycle controls. |

Product child tables reference files through:

- `product_images.file_id`
- `product_documents.file_id`
- `product_certificates.file_id`

## 4. Bucket Strategy

Use the existing bucket name:

`product-files`

Recommended access model:

| Bucket | Access Model | Rationale |
| --- | --- | --- |
| `product-files` | Private | Product documents and certificates can be restricted. Public product images should be served only after RLS-approved checks or through controlled signed/public projection strategy. |

Do not create a separate public product image bucket in MVP unless a CDN/performance decision is explicitly made.

Reason:

- Public buckets bypass download access control for anyone with the URL.
- Product documents and certificates require review, visibility, and audit boundaries.
- A private bucket keeps one consistent security model while public product read behavior is still being finalized.

## 5. Object Path Strategy

Product upload paths must be deterministic and scoped.

Recommended path pattern:

```text
products/{supplier_id}/{product_id}/{asset_type}/{file_id}-{safe_filename}
```

Allowed `asset_type` values:

| Asset Type | Table Link | Default Visibility |
| --- | --- | --- |
| `images` | `product_images` | private object, child row may become public after approval |
| `catalogs` | `product_documents` | restricted |
| `technical-sheets` | `product_documents` | restricted |
| `certificates` | `product_certificates` or `product_documents` | restricted |
| `manuals` | `product_documents` | restricted |

Path rules:

- `supplier_id` must match the current Supplier profile owner of the product.
- `product_id` must belong to that Supplier.
- `file_id` should be generated before object upload or immediately after upload in a transaction-safe flow.
- `safe_filename` must be sanitized.
- No raw email, phone, buyer name, contact name, token, or personal identifier in object paths.
- Do not use user-provided directory names directly.

## 6. Upload Validation Rules

Before upload:

| Check | Required Rule |
| --- | --- |
| Authentication | User must be authenticated. |
| Supplier role | User must resolve to Supplier owner for the target product. |
| Product ownership | Product `supplier_id = current_supplier_id()` and not deleted. |
| Product state | Product must be draft/submitted/rejected-editable, not approved/published locked. |
| Bucket | Must be `product-files`. |
| Path | Must match approved path pattern. |
| MIME type | Must match allowlist by asset type. |
| Size | Must be under configured asset type limit. |
| Filename | Must be sanitized and extension-validated. |
| PII | Metadata and filename must not include Buyer PII. |

Recommended MIME allowlist:

| Asset Type | MIME Types | Max Size |
| --- | --- | --- |
| Product images | `image/jpeg`, `image/png`, `image/webp` | 8 MB |
| Catalogs | `application/pdf` | 25 MB |
| Technical sheets | `application/pdf`, `image/jpeg`, `image/png` | 25 MB |
| Certificates | `application/pdf`, `image/jpeg`, `image/png` | 15 MB |
| Manuals | `application/pdf` | 25 MB |

Disallowed in MVP:

- executable files
- archives (`zip`, `rar`, `7z`)
- Office documents with macros
- HTML/SVG uploads unless separately sanitized
- files containing Buyer PII
- files containing direct Supplier contact details intended to bypass brokerage

## 7. Storage Object RLS Policy Design

Target table:

`storage.objects`

Required policy groups:

| Policy Group | Operation | Role | Rule |
| --- | --- | --- | --- |
| Supplier owner upload | `insert` | authenticated | `bucket_id = 'product-files'`, owner matches `auth.uid()`, path matches own product scope, asset type allowed. |
| Supplier owner read draft/restricted | `select` | authenticated | Own product files only, for files linked to own products and active metadata. |
| Supplier owner update metadata/object | `update` | authenticated | Own object only while related child row is draft/submitted/rejected-editable. |
| Admin read/manage | `select`, `insert`, `update` | authenticated | Admin can review/manage product files. |
| Public approved image read | `select` | anon/authenticated | Only for approved/published product images with approved child row and public visibility. |
| Public approved public document read | `select` | anon/authenticated | Optional; only for approved/published product documents explicitly marked public. Recommended to defer. |

No MVP policies:

- no `delete` policy
- no broad `TO authenticated` without ownership predicate
- no public list policy
- no direct public access to restricted product documents
- no service-role fallback

## 8. Public Download Strategy

MVP recommendation:

| Asset | Public Access |
| --- | --- |
| Approved product image gallery | Allowed only through approved product + approved public image + active file metadata + Storage select policy. |
| Catalog PDF | Deferred; prefer Admin-reviewed signed URL flow later. |
| Technical sheet | Deferred; prefer signed URL or gated request later. |
| Certificate PDF | Deferred; show certificate summary card publicly, not raw file. |
| Manual | Restricted unless explicitly approved. |

Public product pages can show:

- image thumbnails
- product-safe metadata
- certificate summary labels
- document availability labels

Public product pages must not show:

- raw private object paths
- signed URLs with long expiry
- restricted document URLs
- Buyer PII
- price
- direct contact details

## 9. Signed URL Strategy

Signed URLs should be used only for restricted but authorized downloads.

Candidate future use cases:

- Admin preview of submitted documents
- Supplier preview of own uploaded files
- approved Buyer/RFQ participant document access
- brokerage-controlled catalog sharing

Rules:

- short expiry only
- generated server-side
- no service-role fallback in public/client flows
- log sensitive document downloads when `file_access_logs` exists
- never generate signed URLs for users without row-level authorization

## 10. File Metadata Write Flow

Recommended future upload flow:

1. Server action validates authenticated user and Supplier ownership.
2. Server action creates a pending `files` row with:
   - `bucket = 'product-files'`
   - sanitized `path`
   - `owner_profile_id = auth.uid()`
   - `visibility = 'private'` or `restricted`
   - MIME and size metadata
3. Client uploads object to Storage using authenticated session.
4. Server action verifies object exists and matches metadata.
5. Server action attaches file through `product_images`, `product_documents`, or `product_certificates`.
6. Admin reviews child row.
7. Public display opens only after product and child row are approved/published.

Risk:

- If object upload succeeds but file metadata insert fails, orphan object cleanup is required.
- If metadata exists but object upload fails, inactive file cleanup is required.

## 11. Cleanup / Orphan Handling

Required cleanup cases:

| Case | Handling |
| --- | --- |
| Object uploaded but no `files` row | Mark for Storage cleanup job. |
| `files` row created but no object uploaded | Mark `files.is_active = false` after timeout. |
| File uploaded but not attached to product child row | Keep private and expire/cleanup after review window. |
| Product child row rejected | Keep restricted for Supplier/Admin review or soft-delete after retention. |
| Product archived/deleted | Remove public availability; object can remain private until retention cleanup. |

Do not hard-delete product files automatically in MVP.

## 12. Audit / Access Logging

Audit log integration is required before operational file review is complete.

Events to log:

- product file metadata created
- object upload completed
- product image/document/certificate attached
- Admin approval/rejection
- visibility changed to public
- signed URL generated for restricted document
- restricted file downloaded
- file deactivated or orphan cleanup executed

Future table candidate:

`file_access_logs`

Minimum fields:

- `file_id`
- `profile_id`
- `access_type`
- `resource_type`
- `resource_id`
- `ip_hash`
- `user_agent_hash`
- `created_at`

## 13. Storage Policy SQL Plan

Future migration candidate:

`product_storage_policy.sql`

Do not write this migration until production core/RLS migrations are applied and validated.

Planned migration contents:

1. Confirm or create `product-files` bucket as private.
2. Configure bucket upload restrictions if managed by SQL/API.
3. Add narrowly scoped `storage.objects` policies.
4. Add `files` RLS policies if missing or insufficient.
5. Add validation helper only if necessary; avoid new `SECURITY DEFINER` helpers unless reviewed.
6. Add no delete policies.
7. Add no broad public list policies.

## 14. Validation Checklist

Before enabling upload UI:

| Scenario | Expected |
| --- | --- |
| Anonymous uploads product file | Blocked |
| Authenticated non-Supplier uploads product file | Blocked |
| Supplier uploads to another Supplier path | Blocked |
| Supplier uploads to own draft product path | Allowed |
| Supplier uploads disallowed MIME type | Blocked |
| Supplier uploads oversized file | Blocked |
| Supplier reads own restricted file | Allowed |
| Supplier reads another Supplier restricted file | Blocked |
| Public reads unapproved product image | Blocked |
| Public reads approved/published public product image | Allowed |
| Public lists `product-files` bucket | Blocked |
| Public reads restricted catalog/certificate file | Blocked |
| Admin reads submitted product file | Allowed |
| Hard delete through client | Blocked |

## 15. Application Blocking Rules

Keep disabled until Storage policy is implemented and validated:

- product image upload
- product document upload
- product certificate upload
- catalog file upload
- public file download
- public product DB-backed gallery
- Supplier submit with files
- Admin approve-to-public file flow

Allowed to continue:

- static product gallery UI
- static supplier product registration form skeleton
- document/certificate metadata design
- Storage migration review

## 16. Risk Findings

| Risk | Priority | Mitigation |
| --- | --- | --- |
| Public bucket exposes restricted documents by URL | P0 | Use private `product-files` bucket in MVP. |
| Storage policy allows broad authenticated uploads | P0 | Require bucket, path, owner, product ownership checks. |
| Public object select allows bucket listing | P0 | Use operation-aware select policy where needed; no public list policy. |
| Supplier uploads file to another product | P0 | Path and DB ownership checks. |
| Supplier marks documents public before Admin review | P1 | Child table approval and visibility review. |
| Orphan files accumulate | P2 | Add cleanup job/process after upload flow. |
| Download audit missing | P2 | Add `file_access_logs` before restricted downloads. |

## 17. Decision

Storage design status:

**Ready for Storage Policy Migration Spec**

Not ready for:

- production bucket creation
- production Storage policy apply
- upload UI activation
- DB-backed public product galleries
- public document download

## 18. Next Recommended Task

Recommended next task:

**Product Storage Policy Migration Spec**

Scope:

- Write the SQL/API migration specification for the private `product-files` bucket and `storage.objects` policies.
- Do not apply it to production yet.
- Do not connect Supplier upload UI yet.

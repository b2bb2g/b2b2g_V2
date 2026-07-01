# Product Registration Data Model Spec

## 1. Purpose

This document defines the product registration data model needed to move from the current static product detail prototype to a production-ready Supplier product workflow.

It is based on the current Product Detail UI, Supplier Product Registration skeleton, ERD v1, RLS Design v1, and existing Supabase migrations.

This document does not write SQL, modify Supabase DB, change RLS policies, or connect product submission. It is the source specification for the next additive migration and implementation steps.

## 2. Current Implementation State

| Area | Current State | Gap |
| --- | --- | --- |
| Public product catalog | Static data from `lib/products/static-products.ts` feeds `/products` and `/products/[id]`. | Needs DB-backed approved product data. |
| Product detail | Gallery, certificates, action buttons, product/company/review tabs exist as static UI. | Needs normalized product images, documents, certificates, specs, and approval data. |
| Supplier product registration | `/dashboard/products/new` renders a structured form skeleton from `PRODUCT_REGISTRATION_FIELD_TEMPLATE`. | Submit is intentionally disabled; no DB write, upload, approval, or Storage flow exists. |
| Existing DB `products` | Current table has `supplier_id`, `company_id`, `category_id`, `industry_id`, `title`, `summary`, `description`, `approval_status`, `main_file_id`, `is_active`, audit columns. | Lacks slug, publish status, gallery, certificates, structured specs, registration field values, document visibility, and product-level publish workflow. |
| Files | `files` table exists with bucket, path, owner, visibility, metadata, and product `main_file_id` FK. | Needs product-specific relation tables for image gallery, documents, and certificate files. |
| RLS | `products` has public approved select, supplier owner select/insert/update, and admin all policies. | Needs RLS for product child tables and public-safe visibility inheritance. |

## 3. Source of Truth Inputs

| Document / File | Relevance |
| --- | --- |
| `docs/05-data/01-erd-v1.md` | Defines `products`, `product_images`, `product_documents`, `product_videos`, public approval, Supplier owner, and Student no-create rules. |
| `docs/05-data/02-rls-design-v1.md` | Defines public approved/published reads, Supplier owner writes, Admin approval, and Buyer PII exclusion. |
| `docs/05-data/04-existing-db-erd-mapping-audit.md` | Classifies `products` as Refactor and product media tables as New. |
| `docs/05-data/05-sql-migration-pack-spec-v1.md` | Requires additive-first migrations, no destructive changes, and RLS test plan alignment. |
| `docs/04-permissions/01-permission-matrix.md` | Confirms Supplier/Admin product creation, Student no product creation, and Audit Log needs. |
| `supabase/migrations/20260618138000_content_domain.sql` | Shows current `products` table shape. |
| `supabase/migrations/20260618139000_content_rls.sql` | Shows current product RLS baseline. |
| `supabase/migrations/20260618148000_file_storage_metadata_domain.sql` | Shows current `files` table and `products.main_file_id` relationship. |
| `lib/products/static-products.ts` | Current product registration field template and static detail metadata. |

Supabase platform note:

- Supabase changed new table exposure behavior for Data/GraphQL APIs in 2026. New public schema tables may require explicit grants and RLS-safe exposure planning rather than assuming automatic API access.
- All new public product tables must keep RLS enabled and must not rely on service-role fallback.

## 4. Product Data Principles

| Principle ID | Principle |
| --- | --- |
| PRD-P-001 | Supplier and Admin can create product records; Student cannot create products. |
| PRD-P-002 | Product public exposure requires Admin approval and publish state. |
| PRD-P-003 | Product detail must never expose price on public pages. |
| PRD-P-004 | Product detail must never expose Buyer email, phone, contact person, or private demand data. |
| PRD-P-005 | Product inquiry remains a future managed RFQ/Brokerage flow; no direct Supplier-Buyer contact CTA is created by this model. |
| PRD-P-006 | Product gallery, certificates, and documents are reviewed before public display. |
| PRD-P-007 | Product documents default to restricted/admin review unless explicitly approved for public display. |
| PRD-P-008 | `products.main_file_id` remains compatibility but is not enough for the target gallery model. |
| PRD-P-009 | Field definitions and field values are separated so Admin can later configure category-specific product registration forms. |
| PRD-P-010 | Every product publish, approve, reject, hide, archive, certificate update, and document visibility change is audit-log eligible. |

## 5. Target Product Detail Model

The public product detail page should be backed by normalized data that supports:

| UI Area | Data Source Candidate | Public Rule |
| --- | --- | --- |
| Main image gallery | `product_images` | Show approved/visible images for approved/published products. |
| Product title and supplier name | `products`, `companies`, `suppliers` | Show product title and public supplier/company name only. |
| Share / Save / QR actions | Product route and future user interest tables | No raw internal IDs or private data in public UI. |
| Product summary | `products.summary`, `products.description`, `product_registration_values` | Show approved visible/summary fields only. |
| Certificates near image | `product_certificates` and optional `files` | Show certificate title/status only when approved for public. |
| Product Details tab | `product_registration_values`, `product_specs` | Show visible/summary fields only. |
| Company Information tab | `companies`, `company_verifications`, safe supplier profile | Hide private contacts. |
| Review tab | Future `product_reviews` or moderated review records | Deferred until verified transaction/moderation/audit rules exist. |
| Documents | `product_documents`, `files` | Public only if visibility is public and product is approved/published. |

## 6. Supplier Registration Field Model

Current field template from code:

| Group | Field Key | Label | Input Type | Requirement | Public Display | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Product identity | `product-name` | Product name | text | required | visible | Should map to `products.title`. |
| Product identity | `brand-name` | Brand name | text | recommended | summary | Can be stored as registration value or future `products.brand_name`. |
| Product identity | `type-model` | Type / model | text | recommended | summary | Product-specific model/SKU/type field. |
| Specifications | `material` | Material | text | recommended | summary | Structured spec value. |
| Specifications | `dimension` | Size / dimension | text | recommended | summary | Structured spec value. |
| Specifications | `application` | Usage / application | textarea | required | visible | Should be displayed in Product Details tab. |
| Trust | `certification` | Certification | text | recommended | summary | Should not replace certificate documents. |
| Trade | `moq` | MOQ | text | recommended | summary | Allowed; public pricing still forbidden. |
| Trade | `lead-time` | Lead time | select | recommended | summary | Controlled option candidate. |
| Trade | `shipping-origin` | Products shipped from | text | recommended | summary | Must not include private contact data. |
| Documents | `catalog-files` | Catalog / technical files | file | recommended | hidden | Should map to `product_documents` and `files`. |

Recommended persistence pattern:

| Layer | Purpose | Recommendation |
| --- | --- | --- |
| Product root columns | High-frequency fields used for listing/search. | Keep `products.title`, `summary`, `description`, `category_id`, `industry_id`, `company_id`, `supplier_id`. Add `slug`, `publish_status`, `published_at`, `submitted_at`, and review columns later. |
| Field definitions | Admin/category-configurable product form fields. | Add `product_registration_fields`. |
| Field values | Product-specific values from Supplier form. | Add `product_registration_values`. |
| Search/index candidates | Stable fields like title/category/status. | Keep as columns or indexes; do not over-index every dynamic field in MVP. |
| Public projection | Buyer-facing product detail. | Query only approved product + visible/summary values. |

## 7. Proposed Table / Object Plan

### 7.1 `products` Additive Column Plan

| Column | Type | Purpose | Notes |
| --- | --- | --- | --- |
| `slug` | text null initially | Public detail route candidate. | Add unique partial index when backfilled. |
| `publish_status` | text not null default `draft` | Separate approval from publish. | Allowed: `draft`, `published`, `hidden`, `archived`. |
| `published_at` | timestamptz null | Public publish timestamp. | Admin-controlled. |
| `submitted_at` | timestamptz null | Supplier submission timestamp. | Set when submitted for review. |
| `reviewed_by` | uuid null references `profiles(id)` | Admin reviewer. | Existing `approved_by` stays compatibility. |
| `reviewed_at` | timestamptz null | Review timestamp. | Supports approved/rejected. |
| `review_note` | text null | Safe review note. | If sensitive, move to `admin_memos` later. |

Current `products.main_file_id` remains compatibility and may point to the primary file until `product_images` is fully used.

### 7.2 `product_images`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | uuid pk default `gen_random_uuid()` | Image row id. |
| `product_id` | uuid not null references `products(id)` | Parent product. |
| `file_id` | uuid not null references `files(id)` | Stored file metadata. |
| `image_role` | text not null default `gallery` | `primary`, `gallery`, `application`, `technical`, `environment`. |
| `alt_text` | text null | Public image accessibility text. |
| `caption` | text null | Optional caption. |
| `sort_order` | integer not null default 0 | Gallery order. |
| `is_primary` | boolean not null default false | Primary image marker. |
| `approval_status` | text not null default `draft` | Image review status. |
| `visibility` | text not null default `public` | `public`, `restricted`, `admin`. |
| `created_by`, `updated_by`, `deleted_by` | uuid references `profiles(id)` | Actor tracking. |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | Lifecycle. |

Constraint candidates:

- `approval_status in ('draft','submitted','reviewing','approved','rejected','suspended')`
- `visibility in ('public','restricted','admin')`
- one active primary image per product where `is_primary = true and deleted_at is null`
- `sort_order >= 0`

### 7.3 `product_documents`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | uuid pk default `gen_random_uuid()` | Document row id. |
| `product_id` | uuid not null references `products(id)` | Parent product. |
| `file_id` | uuid not null references `files(id)` | File metadata. |
| `document_type` | text not null | `catalog`, `technical_sheet`, `test_report`, `certificate_file`, `manual`, `other`. |
| `title` | text not null | Display/admin title. |
| `description` | text null | Optional description. |
| `visibility` | text not null default `restricted` | Public/private visibility. |
| `approval_status` | text not null default `draft` | Admin review status. |
| `sort_order` | integer not null default 0 | Display order. |
| `created_by`, `updated_by`, `deleted_by` | uuid references `profiles(id)` | Actor tracking. |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | Lifecycle. |

Policy:

- Public should not download restricted documents.
- Supplier owner can manage own draft/submitted documents.
- Admin can approve/reject/publish/hide document visibility.
- Certificate files can be linked to `product_certificates` through `file_id` or as a `product_documents` row.

### 7.4 `product_certificates`

This is a new target object not explicitly listed in ERD v1. It should be added as an ERD sync item because the product detail UX needs certificate cards near the image gallery.

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | uuid pk default `gen_random_uuid()` | Certificate row id. |
| `product_id` | uuid not null references `products(id)` | Parent product. |
| `file_id` | uuid null references `files(id)` | Optional certificate file. |
| `certificate_type` | text not null | `supplier_verification`, `product_approval`, `quality`, `safety`, `fda`, `iso`, `ce`, `other`. |
| `title` | text not null | Public/admin certificate title. |
| `issuer` | text null | Issuing body. |
| `certificate_number` | text null | Certificate/reference number. |
| `issued_at` | date null | Issue date. |
| `expires_at` | date null | Expiry date. |
| `verification_status` | text not null default `pending` | `pending`, `verified`, `rejected`, `expired`. |
| `public_display` | text not null default `summary` | `hidden`, `summary`, `visible`. |
| `approval_status` | text not null default `draft` | Admin review status. |
| `created_by`, `updated_by`, `deleted_by`, `verified_by` | uuid references `profiles(id)` | Actor tracking. |
| `created_at`, `updated_at`, `deleted_at`, `verified_at` | timestamptz | Lifecycle. |

Public rule:

- Public pages can show certificate `title`, `issuer`, and `verification_status` only when the parent product is approved/published and certificate is approved with `public_display in ('summary','visible')`.
- Certificate files remain governed by `product_documents`/`files` visibility and must not be assumed public.

### 7.5 `product_registration_fields`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | uuid pk default `gen_random_uuid()` | Field definition id. |
| `field_key` | text not null | Stable key such as `material`, `lead-time`, `shipping-origin`. |
| `group_key` | text not null | `product_identity`, `specifications`, `trust`, `trade`, `documents`. |
| `label` | text not null | Admin/default English label. |
| `help_text` | text null | Field guidance. |
| `input_type` | text not null | `text`, `textarea`, `select`, `url`, `file`, `number`, `boolean`. |
| `options` | jsonb not null default `[]` | Select/options. |
| `requirement` | text not null default `optional` | `required`, `recommended`, `optional`. |
| `public_display` | text not null default `hidden` | `hidden`, `summary`, `visible`. |
| `category_id` | uuid null references `categories(id)` | Category-specific field. |
| `industry_id` | uuid null references `industries(id)` | Industry-specific field. |
| `sort_order` | integer not null default 0 | Form order. |
| `is_active` | boolean not null default true | Active field flag. |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | Lifecycle. |

MVP default rows should match `PRODUCT_REGISTRATION_FIELD_TEMPLATE`, but seeding must be reviewed separately.

### 7.6 `product_registration_values`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | uuid pk default `gen_random_uuid()` | Value row id. |
| `product_id` | uuid not null references `products(id)` | Parent product. |
| `field_id` | uuid null references `product_registration_fields(id)` | Field definition. |
| `field_key` | text not null | Denormalized stable key for compatibility. |
| `group_key` | text not null | Group key snapshot. |
| `value_text` | text null | Text value. |
| `value_json` | jsonb not null default `{}` | Structured value if needed. |
| `public_display` | text not null default `hidden` | Field-level display decision. |
| `approval_status` | text not null default `draft` | Value review status. |
| `sort_order` | integer not null default 0 | Display order. |
| `created_by`, `updated_by`, `deleted_by` | uuid references `profiles(id)` | Actor tracking. |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | Lifecycle. |

Constraint candidates:

- active unique on `product_id + field_key` where `deleted_at is null`
- `public_display in ('hidden','summary','visible')`
- `approval_status in ('draft','submitted','reviewing','approved','rejected','suspended')`

### 7.7 Deferred Objects

| Object | Reason to Defer |
| --- | --- |
| `product_reviews` | Requires verified transaction/review moderation/audit rules. |
| `product_interests` / saved products | Requires authenticated buyer/member interest model and privacy review. |
| `product_inquiries` | Should be designed with Trade Brokerage and managed RFQ, not direct Supplier-Buyer contact. |
| `product_price_terms` | Public price display is forbidden; quotation terms should belong to proposal/RFQ flow. |
| Category-specific field builder UI | Needs Admin Product Form Builder scope after DB baseline. |

## 8. Supplier Product Registration Workflow

```text
Approved Supplier account
-> Open /dashboard/products/new
-> Enter product root fields
-> Add structured registration values
-> Add image gallery files
-> Add certificate metadata and optional certificate files
-> Add catalog/technical documents as restricted by default
-> Save draft
-> Submit for Admin review
-> Admin reviews product root + values + media + documents + certificates
-> Admin approves/rejects
-> Admin publishes approved product
-> Public product detail reads approved/published safe projection
-> Buyer interest later enters managed RFQ/Brokerage flow
```

MVP submit boundary:

- Product creation should be allowed only for approved Supplier role/profile with valid `supplier_id` and `company_id`.
- If company setup is incomplete, show a dashboard blocker instead of creating partial product records.
- Submit action must not use service role fallback.
- File upload must not precede Storage/RLS policy review.

## 9. RLS / Permission Design Notes

### 9.1 Product Root

| Role | `products` Access |
| --- | --- |
| Public/Guest | select approved + published + active + not deleted only. |
| Supplier | select/insert/update own product drafts and submissions only. |
| Student | select approved products for showcase; no insert/update. |
| Buyer/Agent/Professor | select approved public/authenticated products only. |
| Admin | full manage. |

### 9.2 Product Child Tables

| Table | Public Read | Supplier Write | Admin |
| --- | --- | --- | --- |
| `product_images` | parent product approved/published and image approved/public. | own product only, draft/submitted. | full. |
| `product_documents` | parent product approved/published and document approved/public. | own product only, restricted/public request but Admin approves. | full. |
| `product_certificates` | parent product approved/published and certificate approved/displayable. | own product only, draft/submitted. | full verification/review. |
| `product_registration_fields` | active field definitions can be read by authenticated users; public read can be limited to active non-sensitive definitions if needed. | no write. | manage. |
| `product_registration_values` | parent product approved/published and value approved with `public_display != hidden`. | own product only. | full. |

RLS helper candidates:

- `can_manage_product(user_id, product_id)`
- `can_read_public_product(product_id)`
- `can_read_product_child(product_id, approval_status, visibility/public_display)`
- `can_manage_product_file(user_id, product_id, file_id)`

Supabase-specific security notes:

- Do not create broad `TO authenticated` policies without ownership predicates.
- UPDATE policies need both `USING` and `WITH CHECK`.
- Do not use `SECURITY DEFINER` to bypass RLS for product submission.
- If views are used for public product detail, use `security_invoker = true` where supported or keep views restricted and expose through RLS-safe tables/RPC.
- New tables may need explicit grants for Data API access depending on project settings. Grants must be paired with RLS and validated.

## 10. Storage / File Rules

| File Type | Bucket Candidate | Default Visibility | Public Exposure |
| --- | --- | --- | --- |
| Product images | `product-files` | public or restricted pending review | Only approved product images on approved/published products. |
| Catalog PDF | `product-files` | restricted | Public only after Admin approval. |
| Technical sheet | `product-files` | restricted | Public only after Admin approval. |
| Test report | `product-files` | restricted | Usually restricted or Admin/Brokerage only. |
| Certificate file | `product-files` | restricted | Certificate card can be public; file download requires explicit approval. |

Upload notes:

- File owner should be the Supplier account profile.
- File relation should be attached through `product_images`, `product_documents`, or `product_certificates`.
- Unlinked uploaded files should not become public.
- Product file access logs are recommended before sensitive document downloads.

## 11. Migration File Plan

Planned next migration:

`016_product_registration_core.sql`

Scope:

| Area | Action |
| --- | --- |
| `products` | Add compatibility columns: `slug`, `publish_status`, `published_at`, `submitted_at`, `reviewed_by`, `reviewed_at`, `review_note`. |
| `product_images` | Create table additive-only. |
| `product_documents` | Create table additive-only. |
| `product_certificates` | Create table additive-only. |
| `product_registration_fields` | Create table additive-only. |
| `product_registration_values` | Create table additive-only. |
| Indexes | Add FK/status/visibility/sort indexes. |
| Comments | Document no public price, no Buyer PII, no direct contact. |
| RLS | Defer to a follow-up RLS migration or include only `ENABLE RLS` with no permissive policy after review. |
| Seed/default fields | Prefer deferred or comment-only until seed strategy is decided. |

Forbidden in `016_product_registration_core.sql`:

- DROP / DELETE / destructive UPDATE
- data backfill without review
- public price column
- Buyer PII columns
- Supplier-Buyer direct contact columns
- service-role dependent functions
- broad public/authenticated policies

## 12. Validation Plan

Before production apply:

| Check | Expected Result |
| --- | --- |
| SQL additive-only review | No destructive statements. |
| Existing `products` rows | Still readable and unchanged. |
| Existing `products.main_file_id` | Preserved as compatibility. |
| New tables | Created with RLS enabled or blocked until RLS migration. |
| Public access | No new public data exposure before policies are approved. |
| Supplier access | Supplier cannot manage another Supplier product child rows. |
| Student access | Student cannot insert/update products or product children. |
| Buyer PII | No product table contains Buyer email/phone/contact person. |
| Pricing | Public product schema does not introduce public price field. |
| File visibility | Restricted documents cannot be publicly selected/downloaded. |

After application code connection:

- Supplier can save product draft only if approved Supplier context exists.
- Supplier can add/edit own draft product registration values.
- Supplier can submit product for Admin review.
- Admin can approve/reject root product and child rows.
- Public product detail shows only approved/published product and approved visible/summary values.
- Public product detail does not show price or Buyer PII.

## 13. UI / Code Impact

| Area | Required Change After Migration |
| --- | --- |
| `/dashboard/products/new` | Replace skeleton-only form with server action once RLS and table writes are approved. |
| `lib/products/static-products.ts` | Keep as fallback/demo only; DB data becomes primary after query layer exists. |
| `/products` | Query approved/published products instead of static config. |
| `/products/[id]` | Query product root, gallery, certificates, values, documents, and safe supplier/company profile. |
| Admin product review | Add minimal product approval queue for root + images + documents + certificates + values. |
| Storage upload | Add product file upload after bucket/RLS/file relation validation. |
| Translation | Product form labels can move from static code to DB field definitions or translation keys later. |

## 14. Blocking Issues Before SQL Authoring

| Issue | Priority | Required Resolution |
| --- | --- | --- |
| Existing product data audit | P1 | Confirm whether production `products` rows rely on `main_file_id`, category ids, and current approval values. |
| `publish_status` default | P1 | Use `draft` for existing rows until explicit publish backfill is approved. |
| `product_certificates` ERD sync | P1 | Add this table to ERD sync or decide certificate metadata will live only in `product_documents`. |
| RLS helper scope | P1 | Decide whether helper functions are needed before child table policies. |
| Data API exposure | P1 | Confirm Supabase project Data API setting/grants for new tables before app queries depend on them. |
| Storage upload policy | P1 | Decide product upload path, bucket rules, allowed MIME types, and file visibility before enabling upload. |
| Admin product review UI | P2 | Product child approvals need an Admin review surface before public publish. |
| Static fallback retirement | P2 | Decide when static product data stops driving public catalog. |

## 15. Codex Next Step

Recommended next task:

**Product Registration Core Migration Review**

Scope:

1. Review this spec against live migrations and ERD/RLS.
2. Draft `016_product_registration_core.sql` as additive-only.
3. Do not apply to production until reviewed.
4. Add review document before apply.

Implementation must remain blocked from real submit/upload until:

- `016` is authored and reviewed
- product child table RLS is authored and reviewed
- Storage upload policy is reviewed
- Admin product review path exists

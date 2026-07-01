# Product Storage Object Policy Follow-up Plan

## 1. Purpose

This plan defines the next step after successfully applying the bucket-only `product-files` Storage migration.

The goal is to safely enable product file uploads and approved public product image reads without service-role fallback and without exposing Buyer PII or restricted documents.

## 2. Current State

Completed:

- Product registration core migration authored and applied by operator
- Product child table RLS migration authored and applied by operator
- Product Storage bucket migration revised and applied by operator
- `product-files` bucket should now exist as private

Deferred:

- `storage.objects` policies
- product upload UI
- DB-backed product image galleries
- product document/certificate download flows
- product file runtime tests

## 3. Why This Follow-up Is Required

The original Storage policy migration failed with:

```text
ERROR: 42501: must be owner of relation objects
```

This means the production SQL execution path cannot create policies on `storage.objects`.

Therefore, `storage.objects` policies must be created through one of these owner-safe paths:

1. Supabase Dashboard Storage policy UI
2. Supabase CLI/API path with a role that owns or can manage `storage.objects`
3. Another approved privileged migration path verified in production

Do not reintroduce `CREATE POLICY ON storage.objects` into the standard SQL migration until the owner path is confirmed.

## 4. Required Policy Set

| Policy | Operation | Role | Required Before |
| --- | --- | --- | --- |
| `product_files_supplier_insert` | insert | authenticated | Supplier upload UI |
| `product_files_supplier_select` | select | authenticated | Supplier file preview |
| `product_files_supplier_update` | update | authenticated | Supplier draft file replacement |
| `product_files_admin_select` | select | authenticated | Admin file review |
| `product_files_admin_insert` | insert | authenticated | Admin operational upload |
| `product_files_admin_update` | update | authenticated | Admin operational correction |
| `product_files_public_image_select` | select | anon, authenticated | Public DB-backed product image gallery |

No delete policy should be created for MVP.

## 5. Policy Boundary Requirements

Supplier policies must require:

- `bucket_id = 'product-files'`
- path starts with `products`
- path includes supplier id
- path includes product id
- asset type is one of:
  - `images`
  - `catalogs`
  - `technical-sheets`
  - `certificates`
  - `manuals`
- product belongs to `public.current_supplier_id()`
- product is not deleted
- upload/update only before final publish

Admin policies must require:

- `bucket_id = 'product-files'`
- `public.is_admin()`

Public image policy must require:

- `bucket_id = 'product-files'`
- active `public.files` metadata
- `files.visibility = 'public'`
- approved/public `product_images`
- approved/published parent product
- no public listing
- no catalog/document/certificate public PDF access

## 6. Manual Validation Before Policy Creation

Confirm `product-files` bucket:

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'product-files';
```

Confirm no existing product policies conflict:

```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'product_files_%'
order by policyname;
```

Confirm prerequisite public metadata tables exist:

```sql
select to_regclass('public.products') as products_table,
       to_regclass('public.files') as files_table,
       to_regclass('public.product_images') as product_images_table,
       to_regclass('public.product_documents') as product_documents_table,
       to_regclass('public.product_certificates') as product_certificates_table;
```

## 7. Runtime Test Plan After Policy Creation

| Scenario | Expected |
| --- | --- |
| Anonymous upload to `product-files` | Blocked |
| Authenticated non-Supplier upload | Blocked |
| Supplier upload to own draft product path | Allowed |
| Supplier upload to another Supplier path | Blocked |
| Supplier read own restricted product object | Allowed |
| Supplier read another Supplier product object | Blocked |
| Supplier update approved/published object | Blocked |
| Public read approved/published public image | Allowed |
| Public read draft/unapproved image | Blocked |
| Public list `product-files` bucket | Blocked |
| Public read catalog/document/certificate PDF | Blocked |
| Admin read submitted object | Allowed |
| Client hard delete | Blocked |

## 8. Application Gate

Do not enable the following until the runtime tests pass:

- product file upload in Supplier dashboard
- product gallery sourced from `product-files`
- product document download
- product certificate download
- Admin product file review

Keep static product image fallback active until DB-backed image access is verified.

## 9. UX Quality Direction

When product file upload becomes available, the UX should follow the current product detail and Supplier registration direction:

- multiple image gallery with thumbnails
- certificate/document readiness cards
- clear approval status
- no price exposure
- no Buyer PII
- no direct Supplier-Buyer contact
- export-catalog style product specifications
- review-ready Admin workflow before public publish

## 10. Next Recommended Task

Create one of the following:

1. **Product Storage Policy Dashboard Implementation Guide**
   - exact Supabase Dashboard Storage policy expressions
   - manual step-by-step owner-safe setup

2. **Product Upload UI Readiness Audit**
   - query/action flow for file metadata
   - upload path contract
   - server validation
   - Admin review integration

Recommended next task:

**Product Storage Policy Dashboard Implementation Guide**


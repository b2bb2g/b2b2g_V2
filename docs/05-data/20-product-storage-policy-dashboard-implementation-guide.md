# Product Storage Policy Dashboard Implementation Guide

## 1. Purpose

This guide defines the owner-safe implementation path for product file Storage policies after the private `product-files` bucket migration succeeded.

It is designed to avoid repeating:

```text
ERROR: 42501: must be owner of relation objects
```

The standard SQL migration path should not create policies on `storage.objects` until the execution role ownership issue is resolved.

## 2. Reference Sources

Primary Supabase references:

- Supabase Storage access control: `https://supabase.com/docs/guides/storage/security/access-control`
- Supabase Storage management and RLS policy model: `https://supabase.com/docs/guides/storage`

Project references:

- `docs/05-data/14-product-storage-policy-design.md`
- `docs/05-data/15-product-storage-policy-migration-spec.md`
- `docs/05-data/17-product-storage-policy-owner-error-resolution.md`
- `docs/05-data/18-product-storage-bucket-apply-result.md`
- `docs/05-data/19-product-storage-object-policy-follow-up-plan.md`

## 3. Current Production State

Applied by operator:

`supabase/migrations/20260701130506_product_storage_policy.sql`

Reported result:

```text
Success. No rows returned
```

Expected state:

- `product-files` bucket exists
- `product-files` bucket is private
- product registration core tables exist
- product child-table RLS exists
- `storage.objects` product file policies are not yet created

## 4. Implementation Rule

Do not add a new SQL migration that contains:

```sql
create policy ... on storage.objects
```

unless the owner-safe execution path is confirmed.

Use one of these paths:

1. Supabase Dashboard Storage policy UI
2. Supabase-owned/privileged migration path confirmed by Supabase tooling
3. Supabase support-approved owner path

If the Dashboard policy UI also returns an ownership error, stop. Do not bypass with application service-role fallback.

## 5. Preflight Validation

Run these in Supabase SQL Editor before creating policies.

### 5.1 Bucket

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'product-files';
```

Expected:

- one row
- `public = false`

### 5.2 Existing Product Storage Policies

```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'product_files_%'
order by policyname;
```

Expected before this guide:

- zero rows, unless policies were manually created after the bucket migration

### 5.3 Required Public Tables

```sql
select to_regclass('public.products') as products_table,
       to_regclass('public.files') as files_table,
       to_regclass('public.product_images') as product_images_table,
       to_regclass('public.product_documents') as product_documents_table,
       to_regclass('public.product_certificates') as product_certificates_table;
```

Expected:

- all values are non-null

## 6. Policy Creation Order

Create policies in this order:

1. Admin select
2. Admin insert
3. Admin update
4. Supplier select
5. Supplier insert
6. Supplier update
7. Public approved image select

Reason:

- Admin review must work first.
- Supplier upload should not open before Admin can inspect objects.
- Public image read is last because it affects unauthenticated access.

No delete policy is allowed in MVP.

## 7. Dashboard Policy Definitions

The policy expressions below are written as policy body references. In Supabase Dashboard, map each one to the matching operation and target role.

### 7.1 `product_files_admin_select`

Operation:

`SELECT`

Roles:

`authenticated`

Using expression:

```sql
bucket_id = 'product-files'
and public.is_admin()
```

### 7.2 `product_files_admin_insert`

Operation:

`INSERT`

Roles:

`authenticated`

With check expression:

```sql
bucket_id = 'product-files'
and public.is_admin()
```

### 7.3 `product_files_admin_update`

Operation:

`UPDATE`

Roles:

`authenticated`

Using expression:

```sql
bucket_id = 'product-files'
and public.is_admin()
```

With check expression:

```sql
bucket_id = 'product-files'
and public.is_admin()
```

### 7.4 `product_files_supplier_select`

Operation:

`SELECT`

Roles:

`authenticated`

Using expression:

```sql
bucket_id = 'product-files'
and exists (
  select 1
  from public.files
  join public.products
    on products.id::text = (storage.foldername(storage.objects.name))[3]
  where files.bucket = storage.objects.bucket_id
    and files.path = storage.objects.name
    and files.owner_profile_id = (select auth.uid())
    and files.is_active = true
    and files.deleted_at is null
    and products.supplier_id = public.current_supplier_id()
    and products.supplier_id::text = (storage.foldername(storage.objects.name))[2]
    and products.deleted_at is null
)
```

### 7.5 `product_files_supplier_insert`

Operation:

`INSERT`

Roles:

`authenticated`

With check expression:

```sql
bucket_id = 'product-files'
and owner_id = (select auth.uid()::text)
and (storage.foldername(name))[1] = 'products'
and (storage.foldername(name))[2] is not null
and (storage.foldername(name))[3] is not null
and (storage.foldername(name))[4] in (
  'images',
  'catalogs',
  'technical-sheets',
  'certificates',
  'manuals'
)
and exists (
  select 1
  from public.products
  where products.id::text = (storage.foldername(name))[3]
    and products.supplier_id = public.current_supplier_id()
    and products.supplier_id::text = (storage.foldername(name))[2]
    and products.deleted_at is null
    and products.approval_status in ('draft', 'submitted', 'reviewing', 'rejected')
    and products.publish_status <> 'published'
)
```

### 7.6 `product_files_supplier_update`

Operation:

`UPDATE`

Roles:

`authenticated`

Using expression:

```sql
bucket_id = 'product-files'
and owner_id = (select auth.uid()::text)
and exists (
  select 1
  from public.files
  join public.products
    on products.id::text = (storage.foldername(storage.objects.name))[3]
  where files.bucket = storage.objects.bucket_id
    and files.path = storage.objects.name
    and files.owner_profile_id = (select auth.uid())
    and files.is_active = true
    and files.deleted_at is null
    and products.supplier_id = public.current_supplier_id()
    and products.supplier_id::text = (storage.foldername(storage.objects.name))[2]
    and products.deleted_at is null
    and products.approval_status in ('draft', 'submitted', 'reviewing', 'rejected')
    and products.publish_status <> 'published'
)
```

With check expression:

```sql
bucket_id = 'product-files'
and owner_id = (select auth.uid()::text)
and (storage.foldername(name))[1] = 'products'
and (storage.foldername(name))[4] in (
  'images',
  'catalogs',
  'technical-sheets',
  'certificates',
  'manuals'
)
and exists (
  select 1
  from public.files
  join public.products
    on products.id::text = (storage.foldername(storage.objects.name))[3]
  where files.bucket = storage.objects.bucket_id
    and files.path = storage.objects.name
    and files.owner_profile_id = (select auth.uid())
    and files.is_active = true
    and files.deleted_at is null
    and products.supplier_id = public.current_supplier_id()
    and products.supplier_id::text = (storage.foldername(storage.objects.name))[2]
    and products.deleted_at is null
    and products.approval_status in ('draft', 'submitted', 'reviewing', 'rejected')
    and products.publish_status <> 'published'
)
```

### 7.7 `product_files_public_image_select`

Operation:

`SELECT`

Roles:

`anon`, `authenticated`

Using expression:

```sql
bucket_id = 'product-files'
and storage.allow_any_operation(array[
  'object.get_authenticated_info',
  'object.get_authenticated'
])
and exists (
  select 1
  from public.files
  join public.product_images
    on product_images.file_id = files.id
  join public.products
    on products.id = product_images.product_id
  where files.bucket = storage.objects.bucket_id
    and files.path = storage.objects.name
    and files.visibility = 'public'
    and files.is_active = true
    and files.deleted_at is null
    and product_images.approval_status = 'approved'
    and product_images.visibility = 'public'
    and product_images.deleted_at is null
    and products.approval_status = 'approved'
    and products.publish_status = 'published'
    and products.is_active = true
    and products.deleted_at is null
)
```

## 8. Required Verification After Policy Creation

Run:

```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'product_files_%'
order by policyname;
```

Expected:

- seven policies
- no `DELETE` policy

Confirm no delete policy:

```sql
select policyname
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and cmd = 'DELETE'
  and policyname like 'product_files_%';
```

Expected:

- zero rows

## 9. Runtime Test Matrix

Do not enable upload UI until each scenario is tested.

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

## 10. Application Gate

Keep disabled until runtime tests pass:

- Supplier product file upload
- Admin product file review
- DB-backed public product image gallery
- catalog PDF download
- certificate PDF download
- document preview

Allowed to continue:

- static product gallery
- product detail UI polish
- Supplier registration form skeleton
- Admin review UX planning

## 11. Security Rules

- Do not make `product-files` public.
- Do not add public list policies.
- Do not add delete policies.
- Do not expose product document/certificate PDFs publicly.
- Do not expose Buyer PII in file metadata.
- Do not store Supplier-Buyer direct contact data in product files.
- Do not add service-role fallback in application code.
- Do not use Storage access as approval. Product approval remains in `public.products` and child tables.

## 12. Failure Handling

If Dashboard policy creation fails with an owner or permission error:

1. Stop.
2. Keep upload UI disabled.
3. Keep DB-backed public gallery disabled.
4. Record exact error in a follow-up result document.
5. Use Supabase support or a confirmed privileged owner path.

Do not weaken the policy by making the bucket public.

## 13. Next Recommended Task

After the policy guide is accepted:

**Product Upload UI Readiness Audit**

Scope:

- product file upload path contract
- `public.files` metadata write flow
- product image/document/certificate row write flow
- server validation
- Admin review queue
- public product gallery gating


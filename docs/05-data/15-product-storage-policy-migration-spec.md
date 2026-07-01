# Product Storage Policy Migration Spec

## 1. Purpose

This document specifies the future Storage policy migration for Supplier product file uploads.

It translates `docs/05-data/14-product-storage-policy-design.md` into a concrete SQL migration plan without writing the migration file, applying production DB changes, creating buckets, connecting upload UI, or enabling public file downloads.

Target future migration name:

`product_storage_policy`

Actual migration file must be generated later with:

```text
supabase migration new product_storage_policy
```

## 2. Scope

The future migration should cover:

- private `product-files` bucket verification/creation
- bucket upload restrictions where supported by SQL-managed bucket metadata
- `storage.objects` RLS policies for product file upload/read/update
- optional `public.files` RLS review/repair if current policies are missing
- no delete policy
- no public bucket listing
- no service-role fallback

Out of scope:

- production apply
- product file upload UI
- product submit action with files
- Admin product file review UI
- public DB-backed product detail/gallery
- signed URL route handlers
- cleanup job implementation
- `file_access_logs` migration

## 3. Migration Preconditions

Do not author or apply the Storage policy migration until:

| Precondition | Required State |
| --- | --- |
| Product core migration | Applied and validated in production. |
| Product child-table RLS migration | Applied and validated in production. |
| Product data audit | Existing product publish/backfill decision recorded. |
| Bucket strategy | `product-files` private bucket decision accepted. |
| Storage policy design | `docs/05-data/14-product-storage-policy-design.md` accepted. |
| Upload UI | Still disabled. |
| Backup / snapshot | Confirmed before production apply. |

## 4. Supabase Documentation Constraints

The future migration must respect current Supabase Storage behavior:

- Storage uploads require `storage.objects` RLS policies.
- Private bucket downloads are subject to Storage RLS.
- Public buckets expose files by URL and are not appropriate for restricted product documents in MVP.
- Object ownership should use `owner_id`; `owner` is deprecated.
- Upsert requires `insert`, `select`, and `update`; MVP should avoid upsert unless explicitly required.
- Service keys bypass RLS and must not be used in public/client flows.

Changelog consideration:

- New public schema table exposure behavior has changed in Supabase. Product child table grants/RLS and Storage object RLS must be validated independently.

## 5. Future Migration File

Recommended migration file after CLI generation:

```text
supabase/migrations/{timestamp}_product_storage_policy.sql
```

Logical sections:

1. Safety header comments
2. `begin;`
3. `product-files` bucket create/update as private
4. Bucket size/MIME restrictions if represented in `storage.buckets`
5. Optional supporting indexes/metadata comments
6. `storage.objects` policies
7. Optional `public.files` policies if missing
8. Validation comments
9. Rollback notes
10. `commit;`

## 6. Bucket Definition Plan

Target bucket:

`product-files`

Target bucket settings:

| Setting | Value |
| --- | --- |
| Public | `false` |
| File size limit | 25 MB default upper bound |
| Allowed MIME types | images and PDFs only in MVP |

Candidate SQL pattern:

```sql
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-files',
  'product-files',
  false,
  26214400,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
```

Authoring note:

- Verify `storage.buckets` column names/types against the target Supabase project before writing final SQL.
- If dashboard-created bucket metadata differs, document the diff before applying.

## 7. Object Path Contract

All product object paths must follow:

```text
products/{supplier_id}/{product_id}/{asset_type}/{file_id}-{safe_filename}
```

Allowed path segments:

| Segment | Rule |
| --- | --- |
| segment 1 | `products` |
| segment 2 | Supplier id |
| segment 3 | Product id |
| segment 4 | `images`, `catalogs`, `technical-sheets`, `certificates`, or `manuals` |
| segment 5 | sanitized filename prefixed by file id |

Path must not include:

- email
- phone
- Buyer name
- Buyer company identity
- contact person
- raw token
- unsanitized user input

## 8. Storage Policy Groups

Target object:

`storage.objects`

Recommended policy set:

| Policy Name | Operation | Role | Purpose |
| --- | --- | --- | --- |
| `product_files_supplier_insert` | insert | authenticated | Supplier uploads own product files only. |
| `product_files_supplier_select` | select | authenticated | Supplier reads own product files only. |
| `product_files_supplier_update` | update | authenticated | Supplier updates own draft/submitted files only. |
| `product_files_admin_select` | select | authenticated | Admin reviews product files. |
| `product_files_admin_insert` | insert | authenticated | Admin can upload/replace operational product files if needed. |
| `product_files_admin_update` | update | authenticated | Admin manages review-state objects. |
| `product_files_public_image_select` | select | anon, authenticated | Public reads approved product images only. |

Policies intentionally not included:

- delete policy
- public list policy
- broad authenticated access
- public document/certificate PDF access
- unrestricted signed URL policy

## 9. Supplier Insert Policy Spec

Required checks:

- `bucket_id = 'product-files'`
- first path segment is `products`
- path contains Supplier id, Product id, and allowed asset type
- `owner_id = auth.uid()::text`
- authenticated user owns the product through `public.current_supplier_id()`
- target product is not deleted
- file type is allowed through bucket restrictions and app validation

Candidate SQL shape:

```sql
create policy product_files_supplier_insert
on storage.objects
for insert
to authenticated
with check (
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
    from public.products
    where products.id::text = (storage.foldername(name))[3]
      and products.supplier_id = public.current_supplier_id()
      and products.deleted_at is null
  )
);
```

Open validation item:

- Decide whether `(storage.foldername(name))[2]` must equal the product `supplier_id::text`, or whether product ownership check alone is enough.

Recommendation:

- Require both product ownership and path Supplier id consistency.

## 10. Supplier Select Policy Spec

Required checks:

- authenticated user owns the related product
- object bucket is `product-files`
- object is linked through active `public.files`
- path/product id matches the linked file metadata

Candidate SQL shape:

```sql
create policy product_files_supplier_select
on storage.objects
for select
to authenticated
using (
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
      and products.deleted_at is null
  )
);
```

Authoring note:

- Verify whether `auth.uid()` maps to `profiles.id` in this project for all users.
- Existing code treats `profiles.id` as Supabase auth user id; keep this assumption under test.

## 11. Supplier Update Policy Spec

MVP recommendation:

- Avoid Storage object update/upsert for Supplier uploads in the first implementation.
- Prefer unique object paths and new uploads for replacements.

If update is required, restrict it:

- bucket must be `product-files`
- owner must be the current auth user
- related product must belong to current Supplier
- related child row must not be approved/published
- no hard delete

Candidate SQL should include both `using` and `with check`.

## 12. Admin Policy Spec

Admin policies can use existing `public.is_admin()`.

Allowed:

- select submitted product files
- insert operational/review files if needed
- update object metadata where operationally required

Not allowed in MVP:

- delete policy
- public bucket conversion
- bypassing product approval with Storage-only rules

Candidate SQL shape:

```sql
create policy product_files_admin_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'product-files'
  and public.is_admin()
);
```

Repeat for `insert` / `update` only if needed.

## 13. Public Image Select Policy Spec

Public image read must be narrowly scoped.

Required checks:

- bucket is `product-files`
- operation is object read, not bucket list
- object is linked to active `files`
- object is linked through `product_images`
- product is approved and published
- image row is approved
- image visibility is public
- no deleted rows

Candidate SQL shape:

```sql
create policy product_files_public_image_select
on storage.objects
for select
to anon, authenticated
using (
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
);
```

Important:

- Verify operation names in the target Supabase version before final SQL.
- If operation-aware helper semantics are uncertain, do not create public object policy until tested locally.

## 14. Public Document Policy Decision

MVP decision:

Do not create public document/certificate PDF Storage read policies yet.

Reason:

- Public document download needs stronger review/audit.
- Product certificates can be shown as summary cards without exposing raw files.
- Catalog/technical documents can use future signed URL or managed request flow.

Deferred policy:

- `product_files_public_document_select`

Do not include this in the first Storage policy migration.

## 15. `public.files` RLS Review

The future migration must inspect existing `public.files` RLS state before adding Storage object policies.

Required validation:

```sql
select rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename = 'files';
```

Policy inspection:

```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'files'
order by policyname;
```

If `files` has no adequate RLS:

- add owner select/insert/update policies for authenticated users
- add Admin select/update policies
- add no public broad select
- add no delete policy

Do not expose `files.path` broadly to public clients unless the related product child row is approved/public.

## 16. App-Level Validation Required

Storage RLS cannot fully validate:

- MIME spoofing
- filename quality
- exact file size UX messaging
- document contents
- Buyer PII inside PDFs/images
- direct contact details embedded inside files

Therefore app/server validation must still enforce:

- allowed MIME allowlist
- file extension allowlist
- max size by asset type
- sanitized filename
- product owner check before requesting upload
- no raw Buyer PII in metadata
- no direct contact bypass in visible public metadata

## 17. Validation SQL Plan

After authoring the future migration, validate:

Bucket:

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'product-files';
```

Policies:

```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'product_files_%'
order by policyname;
```

No delete policy:

```sql
select policyname
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and cmd = 'DELETE'
  and policyname like 'product_files_%';
```

No public list policy:

```sql
select policyname
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and roles::text like '%anon%'
  and policyname like 'product_files_%';
```

The public policy above must be manually reviewed to confirm it allows object read only and not list.

## 18. Runtime Test Plan

Required runtime checks before enabling upload UI:

| Test | Expected |
| --- | --- |
| Anonymous upload to `product-files` | Blocked |
| Authenticated non-Supplier upload | Blocked |
| Supplier upload to own draft product image path | Allowed |
| Supplier upload to another product path | Blocked |
| Supplier read own restricted object | Allowed |
| Supplier read another Supplier object | Blocked |
| Supplier update approved/public object | Blocked |
| Public read approved/published public image | Allowed |
| Public read draft/unapproved image | Blocked |
| Public list `product-files` | Blocked |
| Public read catalog/certificate PDF | Blocked |
| Admin read submitted file | Allowed |
| Client hard delete | Blocked |

## 19. Rollback Strategy

Preferred rollback:

1. Disable upload UI and file submit actions.
2. Apply policy repair migration if access is too broad or too narrow.
3. Keep bucket private.
4. Keep uploaded objects private.
5. Do not drop bucket or hard-delete objects in first rollback.

Do not use:

- public bucket conversion
- broad authenticated select
- service-role fallback
- client delete policy
- destructive object cleanup without review

## 20. Blocking Issues Before SQL Authoring

| Blocking Issue | Priority | Resolution Required |
| --- | --- | --- |
| Confirm production `storage.buckets` schema | P0 | Verify columns for `file_size_limit` and `allowed_mime_types`. |
| Confirm operation-aware helper availability | P0 | Validate `storage.allow_any_operation` behavior before public image policy. |
| Confirm `files` RLS baseline | P0 | Add/repair `public.files` policies if missing. |
| Confirm auth user id equals `profiles.id` | P0 | Required for ownership checks. |
| Confirm core/RLS product migrations applied | P0 | Storage policy depends on product child tables. |
| Decide public image serving strategy | P1 | Public image Storage select vs signed URL/image proxy. |
| Define upload server action sequence | P1 | Needed before UI connection. |

## 21. Next Recommended Task

Recommended next task:

**Product Storage Policy Migration Review**

But only after the actual SQL migration is authored.

Immediate next implementable task:

**Author Product Storage Policy Migration**

Constraints for that task:

- create file with `supabase migration new product_storage_policy`
- write SQL only
- do not apply production
- do not connect upload UI
- do not use service-role fallback
- validate with `npm test`, `typecheck`, `lint`, and SQL diff review

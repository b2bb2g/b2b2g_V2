# Product Storage Policy Owner Error Resolution

## 1. Purpose

This document records the production apply failure for:

`supabase/migrations/20260701130506_product_storage_policy.sql`

The migration failed when creating policies on `storage.objects`.

## 2. Error

```text
ERROR: 42501: must be owner of relation objects
```

## 3. Root Cause

`storage.objects` is a Supabase-managed Storage table. In the current hosted production execution context, the SQL role running the migration is not the owner of `storage.objects`.

Postgres requires the relation owner to create or comment policies on a table. Therefore, `CREATE POLICY ... ON storage.objects` and `COMMENT ON POLICY ... ON storage.objects` can fail even when normal `public` schema migrations succeed.

## 4. Resolution Applied

The migration file was revised to be bucket-only:

`supabase/migrations/20260701130506_product_storage_policy.sql`

It now:

- creates or updates the `product-files` bucket
- keeps the bucket private
- conditionally sets file size and MIME restrictions if the hosted Storage schema supports those columns
- does not create `storage.objects` policies
- does not create delete policies
- does not make the bucket public

## 5. Deferred Storage Policy Work

The following Storage object policies remain required before enabling product upload UI:

| Policy | Operation | Purpose |
| --- | --- | --- |
| `product_files_supplier_insert` | insert | Supplier uploads only under own product path. |
| `product_files_supplier_select` | select | Supplier reads own linked product file objects. |
| `product_files_supplier_update` | update | Supplier updates own draft-stage product file objects. |
| `product_files_admin_select` | select | Admin reviews product file objects. |
| `product_files_admin_insert` | insert | Admin creates product file objects for operation workflows. |
| `product_files_admin_update` | update | Admin updates product file objects for operation workflows. |
| `product_files_public_image_select` | select | Public reads only approved public images for approved/published products. |

These policies should be created through Supabase Storage policy tooling or another privileged migration path that owns `storage.objects`.

## 6. Apply Order

Apply in this order:

1. `supabase/migrations/20260701120539_product_registration_core.sql`
2. `supabase/migrations/20260701122421_product_registration_child_table_rls.sql`
3. `supabase/migrations/20260701130506_product_storage_policy.sql`

The third migration is now safe to retry because it no longer creates policies on `storage.objects`.

## 7. Validation SQL After Retry

Confirm the private bucket:

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'product-files';
```

Confirm no product Storage policies were created by the bucket-only migration:

```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'product_files_%'
order by policyname;
```

## 8. Security Boundary

Until the deferred `storage.objects` policies are created and tested:

- product upload UI must remain disabled
- DB-backed product file galleries must remain disabled
- public file listing must remain unavailable
- catalog/document/certificate public download must remain unavailable
- no service-role fallback should be added
- no Supplier-Buyer direct contact flow should be added
- no Buyer PII should be stored in file metadata or exposed through product files

## 9. Next Recommended Action

Retry the revised bucket-only migration:

`supabase/migrations/20260701130506_product_storage_policy.sql`

After the bucket exists, create a dedicated Storage policy implementation plan for the production owner limitation before enabling product file upload or public image access.

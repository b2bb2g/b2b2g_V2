# Product Storage Bucket Apply Result

## 1. Purpose

This document records the production apply result for the revised bucket-only Storage migration:

`supabase/migrations/20260701130506_product_storage_policy.sql`

## 2. Apply Context

The original migration failed because it attempted to create policies on `storage.objects` from a SQL execution role that does not own the Supabase-managed Storage relation.

The migration was revised to remove all executable `CREATE POLICY ON storage.objects` and `COMMENT ON POLICY ... ON storage.objects` statements.

Reference:

- `docs/05-data/17-product-storage-policy-owner-error-resolution.md`
- `docs/05-data/16-product-storage-policy-migration-review.md`

## 3. User-Reported Production Result

Result reported by the operator:

```text
Success. No rows returned
```

This indicates the revised bucket-only migration was accepted by Supabase production.

Codex did not directly mutate or query production DB in this step.

## 4. Migration Applied

| Migration | Result | Notes |
| --- | --- | --- |
| `20260701120539_product_registration_core.sql` | Previously requested prerequisite | Product registration core schema. |
| `20260701122421_product_registration_child_table_rls.sql` | Previously requested prerequisite | Product child table RLS. |
| `20260701130506_product_storage_policy.sql` | Success reported | Bucket-only retry. No Storage object policy creation. |

## 5. Expected Production State

Expected after the successful retry:

- `storage.buckets` contains `product-files`
- `product-files.public = false`
- optional `file_size_limit` and `allowed_mime_types` are set if supported by the project Storage schema
- no `product_files_%` policies were created by this revised migration
- product upload UI remains disabled
- DB-backed product file gallery remains disabled

## 6. Validation SQL To Run Manually

Confirm the bucket exists and remains private:

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'product-files';
```

Confirm no product Storage object policies were created by this bucket-only migration:

```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'product_files_%'
order by policyname;
```

## 7. Security Boundary

The successful bucket migration does not mean product file upload is ready.

Still blocked:

- Supplier file upload UI
- Admin file review UI
- public product image object reads from Storage
- public catalog/document/certificate downloads
- file deletion
- any service-role fallback

Reason:

`storage.objects` policies are still deferred.

## 8. Production Risk Status

| Risk | Status | Required Action |
| --- | --- | --- |
| Private bucket missing | Reduced | Bucket migration succeeded. Validate with SQL. |
| Upload blocked by Storage RLS | Expected | Do not enable upload UI until object policies exist. |
| Public images unavailable from Storage | Expected | Keep static image fallback or disabled DB-backed gallery. |
| Public document/certificate exposure | Protected | No public policy exists. |
| Service role fallback temptation | Must remain blocked | Do not add fallback to bypass Storage policy gap. |

## 9. Next Recommended Action

Proceed to:

`docs/05-data/19-product-storage-object-policy-follow-up-plan.md`

Goal:

Define the owner-safe path to create `storage.objects` policies without repeating:

```text
ERROR: 42501: must be owner of relation objects
```


# Product Storage Policy Migration Review

## 1. Review Purpose

This report reviews:

`supabase/migrations/20260701130506_product_storage_policy.sql`

The migration is reviewed before any production apply. This report does not apply the migration, modify Supabase production, connect upload UI, create product files, or expose DB-backed product galleries.

## 2. Reviewed Inputs

| File | Purpose |
| --- | --- |
| `docs/05-data/14-product-storage-policy-design.md` | Storage policy design source. |
| `docs/05-data/15-product-storage-policy-migration-spec.md` | Migration authoring specification. |
| `supabase/migrations/20260701130506_product_storage_policy.sql` | Authored Storage policy migration. |
| `supabase/migrations/20260618148000_file_storage_metadata_domain.sql` | Existing `public.files` metadata model. |
| `supabase/migrations/20260618149000_file_storage_metadata_rls.sql` | Existing `public.files` RLS baseline. |
| `supabase/migrations/20260701120539_product_registration_core.sql` | Product child table prerequisites. |
| `supabase/migrations/20260701122421_product_registration_child_table_rls.sql` | Product child table RLS prerequisites. |

## 3. Migration Summary

The migration:

- creates or updates `storage.buckets` row for `product-files`
- keeps `product-files` private
- conditionally sets file size and MIME allowlist if project schema supports those columns
- adds narrowly scoped `storage.objects` policies
- uses existing `public.current_supplier_id()`
- uses existing `public.is_admin()`
- exposes public reads only for approved/published public product images
- does not add delete policies
- does not add public list policies
- does not expose product documents or certificate PDFs publicly

## 4. Additive / Destructive Review

| Check | Result | Notes |
| --- | --- | --- |
| Creates bucket metadata if missing | Pass | Adds/updates `storage.buckets` row only. |
| Converts bucket to public | Pass | Explicitly sets `public = false`. |
| Drops table/column/policy | Pass | No `drop` statements. |
| Deletes data | Pass | No `delete` statements. |
| Hard-deletes objects | Pass | No object delete policy or cleanup. |
| Adds public broad access | Pass | Public policy is image-only and tied to product approval/publish gates. |
| Uses service role fallback | Pass | No service role usage. |

## 5. Bucket Review

Target bucket:

`product-files`

Decision:

**Private bucket**

Reason:

- Product documents, catalogs, manuals, and certificate files can be restricted.
- Public bucket URLs would bypass download access controls.
- Public product image read can be allowed through a narrow Storage RLS policy instead.

The migration conditionally sets:

- `file_size_limit = 26214400`
- MIME allowlist: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`

This is safe because the SQL checks whether the target columns exist before updating them.

## 6. Storage Object Policy Review

| Policy | Operation | Result |
| --- | --- | --- |
| `product_files_supplier_insert` | insert | Supplier can upload only under own product path. |
| `product_files_supplier_select` | select | Supplier can read own active product file metadata/object path. |
| `product_files_supplier_update` | update | Supplier can update only own non-published/non-approved product-stage objects. |
| `product_files_admin_select` | select | Admin can review product files. |
| `product_files_admin_insert` | insert | Admin can create product file objects if needed. |
| `product_files_admin_update` | update | Admin can update product file objects. |
| `product_files_public_image_select` | select | Public can read only approved public image objects for approved/published products. |

Not present:

- delete policy
- public list policy
- public document PDF policy
- public certificate PDF policy
- broad authenticated access

## 7. Supplier Boundary Review

Supplier policy checks include:

- `bucket_id = 'product-files'`
- path segment 1 is `products`
- path segment 2 matches the product `supplier_id`
- path segment 3 matches product id
- path segment 4 is an allowed asset type
- `owner_id = auth.uid()::text`
- product belongs to `public.current_supplier_id()`
- product is not deleted
- Supplier write/update is limited to non-approved/non-published product states

Risk remaining:

- Storage RLS does not inspect file contents. Server-side validation must still block MIME spoofing, Buyer PII, direct contact details, and malicious documents.

## 8. Public Boundary Review

Public image reads require:

- `bucket_id = 'product-files'`
- operation-aware Storage helper for object read
- active `public.files` row
- `files.visibility = 'public'`
- approved/public `product_images` row
- parent product `approval_status = 'approved'`
- parent product `publish_status = 'published'`
- parent product active and not deleted

Public reads do not include:

- catalog PDFs
- technical sheets
- certificate PDFs
- manuals
- product file listing
- Buyer PII
- price
- direct contact information

## 9. `public.files` RLS Compatibility

Existing file RLS exists in:

`supabase/migrations/20260618149000_file_storage_metadata_rls.sql`

Relevant existing policies:

- `files_access_select`
- `files_owner_insert`
- `files_owner_update`
- `files_admin_all`

The Storage migration does not change `public.files` policies. This is acceptable for this step because:

- existing owner/Admin file policies already exist
- product child-table RLS already checks file ownership
- the Storage policy ties public image access to active `files` metadata and child product approval

Remaining validation:

- Confirm production `public.files` policies are actually applied before Storage migration production apply.

## 10. Production Apply Preconditions

Do not apply this migration until:

| Precondition | Status Needed |
| --- | --- |
| Product core migration | Applied and validated |
| Product child-table RLS migration | Applied and validated |
| `public.files` RLS | Verified in production |
| `storage.allow_any_operation` | Verified in production project |
| `storage.buckets` schema | Verified for optional columns |
| Backup/snapshot | Confirmed |
| Upload UI | Still disabled |
| Public DB-backed product pages | Still disabled |

## 11. Validation SQL After Apply

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

Public policy review:

```sql
select policyname, cmd, roles, qual
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname = 'product_files_public_image_select';
```

## 12. Runtime Test Required Before Upload UI

| Scenario | Expected |
| --- | --- |
| Anonymous upload | Blocked |
| Authenticated non-Supplier upload | Blocked |
| Supplier upload to own draft product path | Allowed |
| Supplier upload to another Supplier path | Blocked |
| Supplier read own restricted object | Allowed |
| Supplier read another Supplier object | Blocked |
| Supplier update approved/published object | Blocked |
| Public read approved/published public image | Allowed |
| Public read draft/unapproved image | Blocked |
| Public list `product-files` bucket | Blocked |
| Public read catalog/certificate PDF | Blocked |
| Admin read submitted object | Allowed |
| Client hard delete | Blocked |

## 13. Risk Findings

| Risk | Priority | Action |
| --- | --- | --- |
| Operation-aware helper mismatch | P0 | Verify `storage.allow_any_operation` in production/local before apply. |
| Applying before product child tables exist | P0 | Apply product core/RLS migrations first. |
| Public image policy may be too restrictive | P1 | Test with approved product + public file metadata. |
| Supplier update policy enables object overwrite | P1 | App should avoid upsert in MVP; test overwrite behavior before UI. |
| File content PII/direct contact cannot be checked by RLS | P1 | Server-side validation and Admin review required. |
| No file access log yet | P2 | Add `file_access_logs` before restricted downloads. |

## 14. Review Decision

Decision:

**Ready to Apply with Conditions**

Conditions:

1. Product core migration is applied.
2. Product child-table RLS migration is applied.
3. Production `public.files` RLS is verified.
4. Production `storage.allow_any_operation` behavior is verified.
5. Backup/snapshot is confirmed.
6. Upload UI remains disabled until runtime tests pass.

## 15. Current Verification Result

Local verification completed in this authoring pass:

| Check | Result |
| --- | --- |
| `npm test` | Pass |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `git diff --check` | Pass |
| Static forbidden pattern review | Pass; no delete policy, broad public policy, or service-role fallback found in the migration. |
| `supabase db lint --local --schema storage,public --level error --fail-on error` | Not completed; local Postgres connection failed because local Supabase DB is not running. |

The failed local lint attempt is not a production apply attempt and does not modify any database.

## 16. Next Recommended Task

Recommended next task:

**Product Storage Policy Local/Production Readiness Check**

Scope:

- Validate local SQL parse/apply if local Supabase is running.
- If local Supabase is not running, document that limitation.
- Do not apply production until the migration prerequisites are met.

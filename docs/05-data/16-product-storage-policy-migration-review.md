# Product Storage Policy Migration Review

## 1. Review Purpose

This report reviews:

`supabase/migrations/20260701130506_product_storage_policy.sql`

The migration is reviewed before any production apply. This report does not apply the migration, modify Supabase production, connect upload UI, create product files, or expose DB-backed product galleries.

Revision note:

The first production retry failed with:

```text
ERROR: 42501: must be owner of relation objects
```

The migration has been revised to be bucket-only because the hosted execution role does not own `storage.objects`. See:

`docs/05-data/17-product-storage-policy-owner-error-resolution.md`

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
- defers `storage.objects` policy creation because the production SQL execution role does not own `storage.objects`
- does not create Supplier/Admin/public object policies in this file
- keeps upload and public file access disabled until Storage policies are created through a privileged path
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
| Adds public broad access | Pass | No public Storage object policy is created by the revised migration. |
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

The following policies are required but deferred from this SQL file due to the `storage.objects` ownership limitation:

| Policy | Operation | Target Result |
| --- | --- | --- |
| `product_files_supplier_insert` | insert | Supplier can upload only under own product path. |
| `product_files_supplier_select` | select | Supplier can read own active product file metadata/object path. |
| `product_files_supplier_update` | update | Supplier can update only own non-published/non-approved product-stage objects. |
| `product_files_admin_select` | select | Admin can review product files. |
| `product_files_admin_insert` | insert | Admin can create product file objects if needed. |
| `product_files_admin_update` | update | Admin can update product file objects. |
| `product_files_public_image_select` | select | Public can read only approved public image objects for approved/published products. |

Not created by the revised migration:

- delete policy
- public list policy
- public document PDF policy
- public certificate PDF policy
- broad authenticated access

## 7. Supplier Boundary Review

Deferred Supplier policy checks should include:

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

Deferred public image reads should require:

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

The Storage bucket migration does not change `public.files` policies. This is acceptable for this step because:

- existing owner/Admin file policies already exist
- product child-table RLS already checks file ownership
- public object access remains disabled until the deferred Storage policy work is completed

Remaining validation:

- Confirm production `public.files` policies are actually applied before Storage migration production apply.

## 10. Production Apply Preconditions

Do not retry this revised migration until:

| Precondition | Status Needed |
| --- | --- |
| Product core migration | Applied and validated |
| Product child-table RLS migration | Applied and validated |
| `public.files` RLS | Verified in production |
| `storage.buckets` schema | Verified for optional columns |
| Backup/snapshot | Confirmed |
| Upload UI | Still disabled |
| Public DB-backed product pages | Still disabled |

Do not enable product upload/public image serving until:

| Precondition | Status Needed |
| --- | --- |
| `storage.objects` policy creation path | Confirmed through Supabase Storage policy tooling or privileged migration path |
| `storage.allow_any_operation` | Verified before public image object policy creation |
| Runtime upload/read tests | Passed |

## 11. Validation SQL After Apply

Bucket:

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'product-files';
```

Policies should remain absent after this bucket-only retry:

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

If any `product_files_%` policy exists after this retry, review whether it was created manually outside this migration.

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
| `storage.objects` ownership limitation | P0 | Do not create Storage object policies from this SQL execution path. Use Storage policy tooling or a privileged migration path. |
| Applying before product child tables exist | P0 | Apply product core/RLS migrations first. |
| Public image policy missing after bucket-only retry | P1 | Keep DB-backed product file galleries disabled until deferred policy work is complete. |
| Supplier upload policy missing after bucket-only retry | P1 | Keep product upload UI disabled until deferred policy work is complete. |
| File content PII/direct contact cannot be checked by RLS | P1 | Server-side validation and Admin review required. |
| No file access log yet | P2 | Add `file_access_logs` before restricted downloads. |

## 14. Review Decision

Decision:

**Ready to Retry as Bucket-Only with Conditions**

Conditions:

1. Product core migration is applied.
2. Product child-table RLS migration is applied.
3. Production `public.files` RLS is verified.
4. Backup/snapshot is confirmed.
5. Upload UI remains disabled.
6. Public DB-backed product file/gallery access remains disabled.
7. Storage object policy implementation remains a separate follow-up.

## 15. Current Verification Result

Local verification completed in this authoring pass:

| Check | Result |
| --- | --- |
| `npm test` | Pass |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `git diff --check` | Pass |
| Static forbidden pattern review | Pass; revised migration contains no `CREATE POLICY ON storage.objects`, delete policy, broad public policy, or service-role fallback. |
| `supabase db lint --local --schema storage,public --level error --fail-on error` | Not completed; local Postgres connection failed because local Supabase DB is not running. |

The failed local lint attempt is not a production apply attempt and does not modify any database.

## 16. Next Recommended Task

Recommended next task:

**Product Storage Bucket Retry and Policy Follow-up**

Scope:

- Retry the revised bucket-only `20260701130506_product_storage_policy.sql`.
- Confirm `product-files` exists and remains private.
- Keep upload UI and DB-backed product file galleries disabled.
- Create a separate privileged Storage policy implementation plan before enabling uploads or public image reads.

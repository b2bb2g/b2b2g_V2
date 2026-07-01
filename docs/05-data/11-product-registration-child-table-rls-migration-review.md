# Product Registration Child Table RLS Migration Review

## 1. Review Scope

This document reviews the product registration child table RLS migration before production apply.

Reviewed files:

- `docs/05-data/10-product-registration-child-table-rls-design.md`
- `docs/05-data/09-product-registration-core-migration-review.md`
- `docs/05-data/08-product-registration-data-model-spec.md`
- `supabase/migrations/20260701120539_product_registration_core.sql`
- `supabase/migrations/20260701122421_product_registration_child_table_rls.sql`
- `supabase/migrations/20260618139000_content_rls.sql`
- `supabase/migrations/20260618149000_file_storage_metadata_rls.sql`

This review does not apply SQL to production.

## 2. Migration File

Supabase CLI generated:

`supabase/migrations/20260701122421_product_registration_child_table_rls.sql`

Logical planned scope:

`017_product_registration_child_table_rls.sql`

The generated filename is retained to match Supabase CLI migration conventions.

## 3. Policy Summary

The migration adds RLS policies for:

- `product_images`
- `product_documents`
- `product_certificates`
- `product_registration_fields`
- `product_registration_values`

Policy groups:

| Group | Purpose |
| --- | --- |
| Public select | Allows only approved child rows on approved and published products. |
| Supplier owner select | Allows Supplier to read child rows for own products only. |
| Supplier owner insert/update | Allows Supplier to manage own draft/submitted child rows only. |
| Admin select/insert/update | Allows Admin review and management paths. |
| Authenticated field read | Allows authenticated users to read active registration field definitions. |

The migration intentionally does not create delete policies. Admin and Supplier removal should use soft-delete/update flows after the application review path is ready.

## 4. Additive / Safety Review

| Check | Result | Notes |
| --- | --- | --- |
| New table creation | Pass | No tables are created. The migration depends on the previous product core migration. |
| Data mutation | Pass | No `INSERT`, `UPDATE`, `DELETE`, or backfill. |
| Destructive schema changes | Pass | No `DROP TABLE`, `DROP COLUMN`, rename, or destructive change. |
| New helper functions | Pass | No new function, including no new `SECURITY DEFINER` function. |
| RLS policies | Pass | Adds narrow policies for product child tables. |
| DELETE policy | Pass | No delete policy is created. |
| Table grants | Pass with condition | Adds minimal `SELECT`, `INSERT`, and `UPDATE` grants needed for Data API access; RLS remains the row authority. |
| Public price | Pass | No price column or policy is introduced. |
| Buyer PII | Pass | No Buyer email, phone, contact, or buyer identity path is introduced. |
| Direct Supplier-Buyer contact | Pass | No direct contact, direct message, or direct inquiry path is introduced. |

## 5. Public Read Review

Public child table reads require:

- child row `deleted_at is null`
- child row approved state
- child visibility/display state
- parent product `approval_status = 'approved'`
- parent product `publish_status = 'published'`
- parent product `is_active = true`
- parent product `deleted_at is null`

Table-specific rules:

| Table | Public Rule |
| --- | --- |
| `product_images` | `approval_status = approved` and `visibility = public`. |
| `product_documents` | `approval_status = approved` and `visibility = public`. |
| `product_certificates` | `approval_status = approved`, `verification_status = verified`, `public_display in summary/visible`. |
| `product_registration_values` | `approval_status = approved`, `public_display in summary/visible`. |

`product_registration_fields` is not granted public/anon read in this migration.

## 6. Supplier Owner Review

Supplier owner policies use `public.current_supplier_id()` and parent `products.supplier_id`.

Supplier can:

- select own product child rows
- insert/update child rows only for own products
- use draft/submitted/reviewing style states only
- connect files only when `files.owner_profile_id = auth.uid()`, bucket is `product-files`, and file is active

Supplier cannot:

- approve media/documents/certificates/values
- verify certificates
- set `visibility = admin`
- update approved/suspended child rows
- attach another user's file to own product child rows
- delete rows through RLS

## 7. Admin Review

Admin policies allow:

- select
- insert
- update

Admin policies use existing `public.is_admin()`.

The migration does not add hard-delete access. Admin removal can be implemented as a soft-delete/update path after audit logging and Admin UI are designed.

## 8. Storage / File Review

This migration checks product child file linkage for Supplier-owned rows:

- file belongs to current authenticated profile
- file bucket is `product-files`
- file is active and not deleted

This migration does not change:

- Storage bucket policy
- file upload UI
- file download audit
- public Storage object access

Public document/image availability still depends on `files` and Storage policies. A child table row being public does not automatically make a private Storage object downloadable.

## 9. Product Root Policy Risk

The existing root product public policy still uses `approval_status = approved` and does not yet require `publish_status = published`.

This RLS migration does not update root `products_approved_public_select`.

Reason:

- Existing product rows currently default to `publish_status = draft` after the product core migration.
- Tightening the root product policy before product audit/backfill may hide existing approved products.

Child public policies do require `publish_status = published`, so child data remains conservative until publish state is intentionally backfilled.

## 10. Production Apply Conditions

Before applying:

| Condition | Required |
| --- | --- |
| Apply/confirm `20260701120539_product_registration_core.sql` first | Required |
| Production backup/snapshot | Required |
| Confirm product child tables exist | Required |
| Confirm `products.publish_status` exists | Required |
| Confirm `files` RLS and `product-files` bucket behavior | Required |
| Confirm Data API exposure / grants expectation | Required |
| Prepare RLS test cases | Required |
| Confirm no public product submit/upload is connected yet | Required |

## 11. Validation Result

Validation completed:

| Check | Result |
| --- | --- |
| `npm test` | Pass |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `git diff --check` | Pass |
| SQL static review for destructive statements | Pass; no `DROP TABLE`, `DROP COLUMN`, data `INSERT`, data `UPDATE`, data `DELETE`, or `service_role` usage found. |
| SQL static review for `SECURITY DEFINER` | Pass; no new `SECURITY DEFINER` function is added. |
| `createSupabaseAdminClient` app/components import check | Pass; no app/components import found. |
| `supabase migration list --local` | Not run successfully; local Supabase Postgres is not running on `127.0.0.1:54322`. |
| Production apply | Not performed |

Runtime DB validation is intentionally deferred because this task is file/review only and production apply is not authorized in this step.

## 12. Review Conclusion

Conclusion:

**Ready to Apply with Conditions**

The migration is narrowly scoped and aligns with the child table RLS design. It is not ready for production apply until the previous product core migration is applied/confirmed, production backup is confirmed, and RLS test execution is prepared.

Next recommended task:

**Apply Product Registration Core Migration and Child Table RLS Migration**

Apply should be done only after explicit production backup confirmation and should apply the product core migration first, then this RLS migration.

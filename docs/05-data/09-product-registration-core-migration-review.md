# Product Registration Core Migration Review

## 1. Review Scope

This review checks the product registration core migration before any production apply.

Reviewed files:

- `docs/05-data/08-product-registration-data-model-spec.md`
- `docs/05-data/01-erd-v1.md`
- `docs/05-data/02-rls-design-v1.md`
- `supabase/migrations/20260618138000_content_domain.sql`
- `supabase/migrations/20260618139000_content_rls.sql`
- `supabase/migrations/20260618148000_file_storage_metadata_domain.sql`
- `supabase/migrations/20260701120539_product_registration_core.sql`

This review does not apply SQL to production and does not modify Supabase data.

## 2. Migration File

Supabase CLI generated:

`supabase/migrations/20260701120539_product_registration_core.sql`

Logical planned scope:

`016_product_registration_core.sql`

The generated filename is retained to match current Supabase CLI migration conventions. The migration implements the planned `016` product registration core scope from the Product Registration Data Model Spec.

## 3. Additive Safety Review

| Check | Result | Notes |
| --- | --- | --- |
| Creates new tables only | Pass | Adds `product_images`, `product_documents`, `product_certificates`, `product_registration_fields`, `product_registration_values`. |
| Existing table handling | Pass | Adds columns to `products` with `ADD COLUMN IF NOT EXISTS`. |
| Existing data mutation | Pass | No `INSERT`, `UPDATE`, `DELETE`, or backfill. |
| Destructive table/column change | Pass | No `DROP TABLE`, `DROP COLUMN`, rename, or destructive migration. |
| RLS policies | Pass | No permissive policies added. New tables are RLS-enabled only. |
| Security definer functions | Pass | No new function and no `SECURITY DEFINER`. |
| Public price column | Pass | No public price, unit price, or payment term column. |
| Buyer PII column | Pass | No Buyer email, phone, contact person, or buyer identity column. |
| Supplier-Buyer direct contact | Pass | No direct contact release, chat, email, phone, or direct inquiry column. |

## 4. Tables / Columns Added

`products` compatibility columns:

- `slug`
- `publish_status`
- `published_at`
- `submitted_at`
- `reviewed_by`
- `reviewed_at`
- `review_note`

New product child tables:

- `product_images`
- `product_documents`
- `product_certificates`
- `product_registration_fields`
- `product_registration_values`

Indexes:

- Product publish/review indexes
- Product child table FK/status/visibility/sort indexes
- Active primary image partial unique index
- Active product registration value per product/field partial unique index

## 5. RLS / Security Review

The migration enables RLS on all new public tables:

- `product_images`
- `product_documents`
- `product_certificates`
- `product_registration_fields`
- `product_registration_values`

No public, authenticated, Supplier-owner, or Admin policies are added in this migration.

This keeps the new tables closed until a dedicated RLS migration defines:

- public approved/published product child reads
- Supplier owner draft/submitted reads and writes
- Admin review and approval access
- file/document visibility checks
- no Student product write access

Important Supabase platform note:

- New public schema tables may not be automatically exposed to Data/GraphQL APIs depending on project settings.
- API grants and RLS policies must be reviewed together before app queries depend on these tables.

## 6. Buyer PII / Price / Contact Review

The migration preserves current platform privacy rules:

- No Buyer email, phone, contact person, buyer account id, or buyer company identity is added to product tables.
- No product price column is added.
- Product inquiry remains a future managed RFQ/Brokerage flow.
- No direct Supplier-Buyer contact mechanism is introduced.
- `review_note` is documented as non-public.
- Restricted documents default to `visibility = 'restricted'`.

## 7. Storage and File Review

Product media and documents are linked through the existing `files` table:

- `product_images.file_id`
- `product_documents.file_id`
- `product_certificates.file_id`

Storage/upload remains blocked until a later task defines:

- product upload bucket/path rules
- allowed MIME types and size limits
- file visibility defaults
- file owner checks
- document download audit/logging rules
- public file access policy

The migration does not create buckets and does not change Storage policies.

## 8. Production Apply Conditions

Before applying this migration to production:

| Condition | Required |
| --- | --- |
| Production backup/snapshot | Required |
| Existing `products` data audit | Required |
| `publish_status` backfill plan | Required before public queries use it |
| RLS policy migration plan | Required |
| Data API exposure / grants review | Required |
| Storage upload policy review | Required before upload UI is enabled |
| Admin product review flow plan | Required before Supplier submit is enabled |

## 9. Validation Result

Validation completed:

| Check | Result |
| --- | --- |
| `npm test` | Pass |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `git diff --check` | Pass |
| SQL static review for destructive statements | Pass; no destructive table/column/data statement found. Trigger creation uses dynamic `CREATE TRIGGER` only. |
| Production apply | Not performed |

Runtime DB validation is intentionally not performed because this task is file/review only and production apply is deferred.

## 10. Review Conclusion

Conclusion:

**Ready to Apply with Conditions**

The migration is additive and matches the product registration core scope. It should not be applied until production backup, product data audit, Data API/RLS exposure review, and Storage policy review are complete.

Next recommended task:

**Product Registration Child Table RLS Design**

That task should define RLS policies for product child tables before any Supplier submit, file upload, public DB-backed product detail, or Admin product approval UI is connected.

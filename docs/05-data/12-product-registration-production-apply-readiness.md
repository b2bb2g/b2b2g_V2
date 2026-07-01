# Product Registration Production Apply Readiness

## 1. Purpose

This document turns the product registration migration reviews into an operational readiness checklist.

It prepares production apply for:

1. `supabase/migrations/20260701120539_product_registration_core.sql`
2. `supabase/migrations/20260701122421_product_registration_child_table_rls.sql`

This document does not apply migrations, modify Supabase production, write data, connect Supplier submit, connect file upload, or switch public product pages to DB queries.

## 2. Current Readiness Summary

| Area | Status | Notes |
| --- | --- | --- |
| Product data model spec | Ready | `docs/05-data/08-product-registration-data-model-spec.md` |
| Product core migration | Ready with conditions | Additive-only, no production apply yet. |
| Child table RLS design | Ready | Public/Supplier/Admin boundaries documented. |
| Child table RLS migration | Ready with conditions | No production apply yet. |
| Storage upload policy | Not ready | Needs dedicated Storage policy review. |
| Admin product review UI | Not ready | Needed before public approval workflow is operational. |
| Supplier submit action | Blocked | Must wait for migration apply, RLS validation, and form validation. |
| Public DB-backed product detail | Blocked | Must wait for migration apply, backfill strategy, and safe query layer. |

Readiness decision:

**Ready to Prepare Apply, Not Yet Ready to Apply**

## 3. Apply Order

Production apply order must be:

1. Confirm backup/snapshot.
2. Confirm current production migration state.
3. Apply `20260701120539_product_registration_core.sql`.
4. Validate product columns and child tables.
5. Apply `20260701122421_product_registration_child_table_rls.sql`.
6. Validate policies, grants, and RLS behavior.
7. Keep Supplier submit, upload, and DB-backed public product pages disabled.

Do not apply the RLS migration before the core migration.

## 4. Required Backup / Snapshot

Before production apply:

- Confirm Supabase project reference.
- Confirm current database backup/snapshot time.
- Record the backup/snapshot identifier in the apply result document.
- Confirm rollback decision owner.

Minimum backup evidence to capture:

| Field | Required |
| --- | --- |
| Project ref | Yes |
| Backup timestamp | Yes |
| Backup method | Yes |
| Operator | Yes |
| Apply window | Yes |
| Rollback contact | Yes |

No migration should be applied without this evidence.

## 5. Existing Product Data Audit

The product core migration adds `products.publish_status default 'draft'`.

Risk:

- Existing approved products will not satisfy child-table public policies until they are explicitly published.
- The existing root product public policy has not been tightened yet, so current public product root reads remain unchanged.

Pre-apply audit queries:

```sql
select
  count(*) as total_products,
  count(*) filter (where approval_status = 'approved') as approved_products,
  count(*) filter (where approval_status = 'approved' and is_active = true and deleted_at is null) as current_public_root_candidates,
  count(*) filter (where main_file_id is not null) as products_with_main_file
from public.products;
```

After core migration apply:

```sql
select
  publish_status,
  approval_status,
  count(*) as product_count
from public.products
group by publish_status, approval_status
order by publish_status, approval_status;
```

Backfill decision:

- Do not auto-backfill in the core migration.
- After apply, review existing approved products.
- Only explicitly reviewed products should move to `publish_status = 'published'`.
- Public DB-backed product detail must stay static/fallback until this review is done.

## 6. Core Migration Validation

After applying `20260701120539_product_registration_core.sql`, confirm:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'products'
  and column_name in (
    'slug',
    'publish_status',
    'published_at',
    'submitted_at',
    'reviewed_by',
    'reviewed_at',
    'review_note'
  )
order by column_name;
```

Confirm new tables:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'product_images',
    'product_documents',
    'product_certificates',
    'product_registration_fields',
    'product_registration_values'
  )
order by table_name;
```

Confirm RLS enabled:

```sql
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'product_images',
    'product_documents',
    'product_certificates',
    'product_registration_fields',
    'product_registration_values'
  )
order by tablename;
```

Expected:

- all five tables exist
- `rowsecurity = true`
- no public policies are added by the core migration

## 7. RLS Migration Validation

After applying `20260701122421_product_registration_child_table_rls.sql`, confirm policy count:

```sql
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename in (
    'product_images',
    'product_documents',
    'product_certificates',
    'product_registration_fields',
    'product_registration_values'
  )
order by tablename, policyname;
```

Expected policy shape:

| Table | Expected Policy Groups |
| --- | --- |
| `product_images` | public select, Supplier owner select/insert/update, Admin select/insert/update |
| `product_documents` | public select, Supplier owner select/insert/update, Admin select/insert/update |
| `product_certificates` | public select, Supplier owner select/insert/update, Admin select/insert/update |
| `product_registration_fields` | authenticated active select, Admin select/insert/update |
| `product_registration_values` | public select, Supplier owner select/insert/update, Admin select/insert/update |

Confirm no delete policies:

```sql
select *
from pg_policies
where schemaname = 'public'
  and tablename like 'product_%'
  and cmd = 'DELETE';
```

Expected:

- zero rows

## 8. Public Exposure Checks

Public child read should be conservative.

Check whether any child rows can accidentally be public before data is created:

```sql
select 'product_images' as table_name, count(*) from public.product_images
union all
select 'product_documents', count(*) from public.product_documents
union all
select 'product_certificates', count(*) from public.product_certificates
union all
select 'product_registration_values', count(*) from public.product_registration_values;
```

Expected for initial apply:

- likely zero rows, unless existing data was manually added

No public product query should join Buyer tables or expose Buyer PII.

Forbidden public fields:

- Buyer email
- Buyer phone
- Buyer contact person
- Buyer company full private identity
- Admin memo
- internal review note
- product price
- direct Supplier contact

## 9. Supplier Owner Checks

Before enabling Supplier submit UI, test:

| Scenario | Expected |
| --- | --- |
| Supplier inserts child row for own product | Allowed |
| Supplier inserts child row for another Supplier product | Blocked |
| Supplier attaches another user's file | Blocked |
| Supplier sets `approval_status = approved` | Blocked |
| Supplier sets `visibility = admin` | Blocked |
| Supplier updates approved row | Blocked |
| Supplier deletes child row | Blocked |

These tests should be performed with non-service-role authenticated sessions.

## 10. Admin Checks

Before enabling Admin review UI, test:

| Scenario | Expected |
| --- | --- |
| Admin reads all product child rows | Allowed |
| Admin approves image/document/value | Allowed |
| Admin verifies certificate | Allowed |
| Admin hard-deletes child row | Blocked by missing DELETE policy |
| Admin soft-deletes child row through update | Allowed if Admin UI intentionally sets `deleted_at` |

Audit log integration is still required before operational review actions are considered complete.

## 11. Storage / File Blocking Rule

Do not enable upload until a dedicated Storage review defines:

- bucket path pattern
- file owner rule
- allowed MIME types
- size limits
- public vs restricted defaults
- download audit
- public object URL policy
- cleanup for unlinked files

The RLS migration validates file ownership for child-table linkage, but it does not make Storage objects safe by itself.

## 12. Application Blocking Rule

Keep these disabled until production apply and validation are complete:

- `/dashboard/products/new` actual submit
- product file upload
- product certificate upload
- Admin product approval UI
- DB-backed `/products`
- DB-backed `/products/[id]`
- public inquiry creation

Static product catalog/detail can remain as presentation/fallback.

## 13. Rollback Strategy

Because both migrations are additive, preferred rollback is:

1. Disable application usage of new product DB tables.
2. Do not remove columns/tables immediately.
3. If RLS policies cause access issues, apply a targeted policy repair migration.
4. Avoid destructive rollback unless explicitly approved.

Do not use:

- `DROP TABLE`
- `DROP COLUMN`
- broad public policies
- service-role fallback in app code

## 14. Apply Result Document Template

When production apply is actually performed, create:

`docs/05-data/13-product-registration-production-apply-result.md`

Required sections:

```text
# Product Registration Production Apply Result

## 1. Apply Summary
## 2. Backup / Snapshot Evidence
## 3. Migration Apply Order
## 4. Core Migration Result
## 5. RLS Migration Result
## 6. Validation SQL Result
## 7. Public Exposure Check
## 8. Supplier Owner Check
## 9. Admin Check
## 10. Remaining Blocks
## 11. Next Action
```

## 15. Next Recommended Task

Recommended next task:

**Product Registration Production Apply Result**

Only start this after explicit confirmation that backup/snapshot is ready and production apply is authorized.

If production apply is not authorized yet, the next non-production task should be:

**Product Storage Policy Design**

That task should define upload/download rules before connecting the Supplier product registration form to files.

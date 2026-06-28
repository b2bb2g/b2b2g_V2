/*
  001 Snapshot Baseline Migration

  Generated as baseline marker only.

  No schema mutation.
  No data mutation.
  No RLS policy mutation.

  Purpose:
  - This migration records the current Supabase DB baseline before the 002+
    migration pack is authored.
  - This file intentionally contains comments only.
  - Applying this migration must be a no-op.

  Scope:
  - Do not create tables.
  - Do not alter tables.
  - Do not drop tables.
  - Do not add, alter, or drop columns.
  - Do not create, alter, or drop indexes.
  - Do not create, alter, or drop RLS policies.
  - Do not enable or disable RLS.
  - Do not backfill data.
  - Do not repair Supabase migration metadata.
  - Do not print or store Supabase keys.

  Baseline reference:
  - Supabase project: ysonocyrvvskdajmpdmu
  - Supabase URL: https://ysonocyrvvskdajmpdmu.supabase.co
  - Baseline source: docs/07-implementation/04-supabase-health-audit.md
  - Readiness source: docs/08-review/03-sql-migration-readiness-gap-check.md
  - Migration spec source: docs/05-data/05-sql-migration-pack-spec-v1.md
  - Migration plan source: docs/05-data/03-migration-plan-v1.md

  Current documented baseline:
  - Public table count: 62
  - All public business tables RLS enabled: yes
  - Public tables with RLS enabled: 62 / 62
  - Public RLS policies: 186
  - Public security definer functions: 25
  - Local migration files before this marker: 27
  - Existing 62 public tables mapped in:
    docs/05-data/04-existing-db-erd-mapping-audit.md

  Migration metadata note:
  - The prior Supabase Health Audit did not find the standard
    supabase_migrations.schema_migrations table.
  - This file does not repair migration metadata.
  - Migration metadata alignment must be resolved before structural 002+
    migrations are applied.

  002+ migrations are blocked until:
  - production backup/snapshot confirmed
  - existing conversation audit completed
  - Buyer PII projection final view selected
  - Supabase migration metadata alignment resolved
  - security definer helper scope confirmed

  P0/P1 blockers carried forward:
  - Existing conversation audit is required before classifying or enforcing
    typed conversations.
  - Supplier-Buyer direct messaging must remain blocked unless backed by
    Admin Brokerage or approved case-level Direct Contact Release.
  - Buyer email, phone, and contact person must not be exposed to Supplier.
  - account_roles is the target role authority for future migrations.
  - profiles.member_type_id remains legacy compatibility only if present.
  - brokerage_case_messages is not part of MVP; conversations/messages are
    reused only with typed conversation enforcement.

  Verification expectation:
  - git diff --check
  - npm run typecheck
  - npm run lint

  This migration intentionally has no executable SQL statements.
*/

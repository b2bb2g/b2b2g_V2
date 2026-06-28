# 02. Environment Variables

## 1. Policy

Environment values must not be committed. This document lists names, scopes, and usage only.

Only variables prefixed with `NEXT_PUBLIC_` may be available to browser code. Server-only credentials must remain in local `.env.local`, Vercel server environments, GitHub protected secrets, or Supabase configuration.

## 2. Production Runtime Variables

| Name | Scope | Required | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Browser/server | Yes | Canonical public site URL, for example `https://b2bb2g.com`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser/server | Yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser/server | Yes | Supabase publishable key used by app clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser/server | Compatibility | Keep only if current code or Supabase setup still references anon naming. Prefer publishable key where supported. |
| `DATABASE_URL` | Server/ops only | Yes for DB tools | PostgreSQL connection string for migrations and server-side operational checks. Do not expose to client code. |
| `DIRECT_URL` | Server/ops only | Yes for direct DB tools | Direct database connection string when required by migration or admin tooling. Do not expose to client code. |

## 3. RLS Smoke Test Variables

These variables are for `npm run test:rls`. They should be configured only in local development or protected CI environments.

| Name | Scope | Required |
| --- | --- | --- |
| `RLS_TEST_ADMIN_EMAIL` | Test only | Yes |
| `RLS_TEST_ADMIN_PASSWORD` | Test only | Yes |
| `RLS_TEST_SUPPLIER_EMAIL` | Test only | Yes |
| `RLS_TEST_SUPPLIER_PASSWORD` | Test only | Yes |
| `RLS_TEST_BUYER_EMAIL` | Test only | Yes |
| `RLS_TEST_BUYER_PASSWORD` | Test only | Yes |
| `RLS_TEST_AGENT_EMAIL` | Test only | Yes |
| `RLS_TEST_AGENT_PASSWORD` | Test only | Yes |
| `RLS_TEST_PROFESSOR_EMAIL` | Test only | Yes |
| `RLS_TEST_PROFESSOR_PASSWORD` | Test only | Yes |
| `RLS_TEST_STUDENT_EMAIL` | Test only | Yes |
| `RLS_TEST_STUDENT_PASSWORD` | Test only | Yes |

## 4. GitHub Actions Variables

The CI workflow reads public build-time values from GitHub repository variables:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

If a repository variable is missing and the build depends on it, `npm run quality` should fail. Treat that as deployment readiness feedback, not as a code failure.

## 5. Vercel Environment Scopes

Recommended scopes:

- Production: real production Supabase project and production domain.
- Preview: staging or development Supabase project when available.
- Development: local developer values only.

Do not reuse production database credentials for untrusted preview deployments.

## 6. Secret Handling Rules

- Never commit `.env`, `.env.local`, `.env.production`, or copied credential files.
- Never paste secret values in issues, pull requests, logs, or chat.
- Never add a Supabase service role key to `NEXT_PUBLIC_` variables.
- Rotate credentials immediately if a server-only secret is exposed.


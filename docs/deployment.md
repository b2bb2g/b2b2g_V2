# Deployment

## 1. Status

Production deployment preparation for `b2bb2g-mvp` is maintained in `docs/04-deploy/`.

Primary documents:

- `docs/04-deploy/deployment-guide.md`
- `docs/04-deploy/environment-vars.md`
- `docs/04-deploy/runbook.md`

CI entrypoint:

- `.github/workflows/ci.yml`

## 2. Quality Gate

Run before merge and production deployment:

```bash
npm run quality
```

Run when Supabase test accounts and database credentials are available:

```bash
npm run test:rls
```

## 3. Deployment Target

- Hosting: Vercel
- Framework: Next.js App Router
- Backend: Supabase
- Database: Supabase PostgreSQL
- Auth: Supabase Auth

The project is not configured for static export. Use the standard Next.js build/runtime path.

## 4. Environment Variables

Do not store secret values in this document.

Required variable names and scope rules are listed in:

- `docs/04-deploy/environment-vars.md`

## 5. Operations

Release, health check, incident triage, rollback, and migration rules are listed in:

- `docs/04-deploy/runbook.md`


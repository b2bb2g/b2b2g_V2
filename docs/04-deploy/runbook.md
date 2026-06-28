# 03. Operations Runbook

## 1. Normal Release

1. Confirm all SQL migrations are applied in numeric order.
2. Confirm local environment variables are present by name.
3. Run the quality gate:

```bash
npm run quality
```

4. Run RLS smoke verification when target Supabase credentials are available:

```bash
npm run test:rls
```

5. Merge through pull request after CI passes.
6. Deploy through Vercel.
7. Complete the post-deploy checklist in `docs/04-deploy/deployment-guide.md`.

## 2. Health Checks

Use these checks after deployment:

```bash
curl -I https://b2bb2g.com
curl -I https://b2bb2g.com/sitemap.xml
curl -I https://b2bb2g.com/robots.txt
```

Operational checks:

- Vercel deployment status is successful.
- Vercel function logs have no repeated runtime errors.
- Supabase API logs have no repeated permission errors.
- Supabase Auth role test accounts can sign in.
- Public pages show only approved content.
- Admin pages reject non-admin users.

## 3. Incident Triage

| Symptom | First Check | Likely Action |
| --- | --- | --- |
| Build fails in CI | GitHub repository variables and TypeScript errors | Add missing variables or fix code. |
| Production 500 | Vercel function logs | Roll back deployment, then inspect runtime error. |
| Public content missing | Supabase RLS and approval status | Verify `approval_status = approved` and policies. |
| Unauthorized data visible | RLS policies and query paths | Roll back immediately and patch policy/query. |
| Login fails | Supabase Auth settings and env keys | Confirm URL/key pairing and redirect settings. |
| Metadata or sitemap wrong | `NEXT_PUBLIC_SITE_URL` | Correct env and redeploy. |

## 4. Rollback Procedure

1. Identify the last healthy Vercel production deployment.
2. Use Vercel rollback to restore that deployment.
3. If the issue is Supabase policy or migration related, block the affected route or feature and apply a forward-fix migration.
4. Re-run smoke checks.
5. Record:
   - incident time
   - affected route or feature
   - root cause
   - rollback target
   - follow-up fix

## 5. Database Migration Rules

- Apply migrations in numeric order.
- Include migration number and title in every SQL document.
- Do not edit an already-applied production migration in place.
- Use a new forward migration for corrections.
- Re-run `npm run test:rls` after policy or helper changes.

## 6. Monitoring Baseline

Minimum monitoring before public launch:

- Vercel deployment and function logs.
- Supabase Auth/API/Postgres logs.
- Uptime check for `/`, `/sitemap.xml`, and `/robots.txt`.
- Manual role smoke test for Administrator, Supplier, Buyer, Agent, Professor, and Student.

Recommended next addition:

- Add structured application error logging for Server Actions and Route Handlers.
- Add a protected CI job for `npm run test:rls` when GitHub protected environment secrets are ready.


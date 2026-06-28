# 01. Deployment Guide

## 1. Purpose

This document defines the production deployment path for B2BB2G.COM after the `b2bb2g-mvp` archive.

Primary target:

- Hosting: Vercel
- Framework: Next.js App Router
- Backend: Supabase
- Database: Supabase PostgreSQL
- Auth: Supabase Auth

The current Next.js local documentation confirms that this app should be deployed as a Node-capable Next.js application. Vercel is listed as a verified deployment adapter, so no custom adapter or static export configuration is required for the MVP.

## 2. Deployment Principles

- Do not deploy with unapplied Supabase migrations.
- Do not expose service role keys to the browser.
- Keep all runtime configuration in Vercel Environment Variables.
- Run the quality gate before every production deployment.
- Run RLS smoke verification after Supabase credentials and test users are available.
- Use rollback instead of hot-editing production configuration during incidents.

## 3. Required Preflight

Run locally before merging to `main`:

```bash
npm run quality
npm run test:rls
```

The CI workflow runs `npm run quality` on pull requests and pushes to `main`.

`npm run test:rls` is intentionally kept as a protected/local or manually triggered gate because it needs real Supabase test accounts and database credentials.

## 4. Vercel Project Setup

1. Create or connect the GitHub repository in Vercel.
2. Set Framework Preset to `Next.js`.
3. Set Build Command to `npm run build`.
4. Set Install Command to `npm ci`.
5. Set Output Directory to the Vercel default for Next.js.
6. Add all required environment variables listed in `docs/04-deploy/environment-vars.md`.
7. Deploy Preview from a pull request.
8. Promote to Production only after the post-deploy checklist passes.

## 5. Supabase Deployment Setup

1. Apply SQL migrations in numeric order.
2. Confirm RLS is enabled on business tables.
3. Confirm the role test accounts exist in Supabase Auth.
4. Confirm each role has the expected profile/member records.
5. Run `npm run test:rls` against the target Supabase project.
6. Keep `DATABASE_URL` and `DIRECT_URL` server-only.

## 6. Post-Deploy Checklist

After each deployment:

```bash
curl -I https://b2bb2g.com
curl -I https://b2bb2g.com/sitemap.xml
curl -I https://b2bb2g.com/robots.txt
```

Then verify:

- Public home loads.
- Public category pages load approved content only.
- Company and product detail pages render metadata.
- Login redirects and dashboard access work by member type.
- Admin dashboard remains restricted to administrators.
- Supabase logs do not show repeated RLS or permission errors.
- Vercel function logs do not show runtime environment errors.

## 7. Rollback

Preferred rollback order:

1. Use Vercel deployment rollback to the last healthy production deployment.
2. If the issue is environment configuration, restore the previous environment variable set and redeploy.
3. If the issue is database migration related, pause the affected feature and apply a forward-fix migration. Avoid destructive rollback on production data unless explicitly approved.
4. Record the incident and corrective action in `docs/04-deploy/runbook.md` or a dated incident note.


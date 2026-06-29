# Sprint 2 014 Apply Result

## 1. Purpose

This document records the production application and verification result for:

- `supabase/migrations/014_public_invitation_validation.sql`

The goal was to enable a public-safe invitation validation RPC without opening public table reads and without exposing raw tokens, PII, or internal identifiers.

## 2. Apply Summary

| Item | Result |
| --- | --- |
| Target project | `ysonocyrvvskdajmpdmu` |
| Target migration | `014_public_invitation_validation.sql` |
| Apply method | `supabase db query --linked --file supabase/migrations/014_public_invitation_validation.sql` |
| Apply result | Success |
| Other migrations applied | No |
| Production DB schema mutation | Function create/replace and function grants only |
| Table public SELECT policy added | No |
| Signup flow connected | No |
| Token redemption write connected | No |
| Role application write connected | No |
| Organization binding connected | No |

## 3. Pre-Apply Check

| Check | Result |
| --- | --- |
| Existing `validate_invitation_public` definition | Existing function was present and reviewed before apply |
| Function argument | `token_hash text` |
| Raw token SQL input | Not present |
| Related table public SELECT policy | None found for `invitations`, `invitation_tokens`, `invitation_redemptions` |
| 014 SQL table policy changes | None |

## 4. RPC Definition Verification

Verified production function:

```text
public.validate_invitation_public(token_hash text)
```

Verified result type:

```text
TABLE(
  is_valid boolean,
  status text,
  invitation_type text,
  target_role_key text,
  invited_email_required boolean
)
```

Verified function property:

- `SECURITY DEFINER = true`
- `search_path = public` is defined in the migration file

## 5. Execute Grant Verification

| Role | Execute |
| --- | --- |
| `anon` | true |
| `authenticated` | true |

## 6. Public SELECT Policy Verification

No public or anon SELECT policies were found for:

- `public.invitations`
- `public.invitation_tokens`
- `public.invitation_redemptions`

The validation path uses the RPC only. Table-level public SELECT remains closed.

## 7. Return Field Boundary

The RPC returns only:

- `is_valid`
- `status`
- `invitation_type`
- `target_role_key`
- `invited_email_required`

The RPC does not return:

- invitation id
- token id
- token hash
- invited email
- redeemed email
- parent account id
- agent id
- professor id
- company id

## 8. Runtime Smoke Verification

A non-matching hash-shaped value was passed to the RPC.

Result:

```text
is_valid = false
status = invalid
invitation_type = null
target_role_key = null
invited_email_required = false
```

No raw invitation token was passed to SQL during this smoke check.

## 9. Verification Commands

Executed successfully:

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `git diff --check`

Additional checks:

- `createSupabaseAdminClient` app/components import check
- public/anon SELECT policy check for Invitation tables
- RPC function result type check
- anon/authenticated execute grant check

## 10. Remaining Deferred Items

Still not connected:

- Public signup flow
- Invitation redemption write
- `role_applications` creation
- Agent-Buyer or Professor-Student organization binding
- QR generation
- Email sending
- Audit log write for public validation or redemption

## 11. Codex Notes

014 is applied to production. Future public invitation acceptance work can call `validateInvitationTokenForPublic(rawToken)`, which hashes the raw token in application code before calling the RPC.

The next implementation step should remain narrow:

1. Keep raw token out of SQL and logs.
2. Keep signup CTA disabled until signup workflow is explicitly connected.
3. Do not add public SELECT policies for Invitation tables.
4. Add redemption writes only after a separate reviewed migration/action design.

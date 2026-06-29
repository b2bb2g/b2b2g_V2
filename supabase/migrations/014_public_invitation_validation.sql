-- 014 Public Invitation Validation RPC
--
-- Purpose:
-- - Allow the public Invitation Accept Page to validate an invitation token
--   without opening public table SELECT policies.
-- - Return only limited, non-PII, non-internal fields needed for public UX.
--
-- Security boundary:
-- - Raw token must never be passed to SQL.
-- - Application code hashes the raw token before calling this RPC.
-- - This RPC never returns invitation id, token id, token_hash, invited_email,
--   redeemed_email, parent_account_id, agent_id, professor_id, or company_id.
-- - No table RLS policy is created or relaxed in this migration.
-- - No data mutation, redemption write, role_application write, or organization
--   binding is performed.
--
-- Production note:
-- - This file is authored for review and must not be applied to production
--   until backup/snapshot and owner approval are confirmed.

begin;

create or replace function public.validate_invitation_public(token_hash text)
returns table (
  is_valid boolean,
  status text,
  invitation_type text,
  target_role_key text,
  invited_email_required boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_record record;
  normalized_token_hash text;
begin
  normalized_token_hash := nullif(trim(token_hash), '');

  if normalized_token_hash is null then
    return query
    select
      false::boolean,
      'invalid'::text,
      null::text,
      null::text,
      false::boolean;
    return;
  end if;

  select
    invitations.deleted_at as invitation_deleted_at,
    invitations.invitation_type,
    invitations.invited_email,
    invitations.max_uses,
    invitations.revoked_at as invitation_revoked_at,
    invitations.status as invitation_status,
    invitations.target_role_key,
    invitations.used_count,
    invitation_tokens.deleted_at as token_deleted_at,
    invitation_tokens.expires_at as token_expires_at,
    invitation_tokens.revoked_at as token_revoked_at,
    invitation_tokens.used_at as token_used_at
  into matched_record
  from public.invitation_tokens
  inner join public.invitations
    on invitations.id = invitation_tokens.invitation_id
  where invitation_tokens.token_hash = normalized_token_hash
  limit 1;

  if not found then
    return query
    select
      false::boolean,
      'invalid'::text,
      null::text,
      null::text,
      false::boolean;
    return;
  end if;

  if matched_record.token_expires_at <= now() then
    return query
    select
      false::boolean,
      'expired'::text,
      null::text,
      null::text,
      false::boolean;
    return;
  end if;

  if matched_record.token_deleted_at is not null
    or matched_record.token_revoked_at is not null
    or matched_record.token_used_at is not null
    or matched_record.invitation_deleted_at is not null
    or matched_record.invitation_revoked_at is not null
    or matched_record.invitation_status <> 'active'
    or matched_record.used_count >= matched_record.max_uses
  then
    return query
    select
      false::boolean,
      'invalid'::text,
      null::text,
      null::text,
      false::boolean;
    return;
  end if;

  return query
  select
    true::boolean,
    'valid'::text,
    matched_record.invitation_type::text,
    matched_record.target_role_key::text,
    (matched_record.invited_email is not null)::boolean;
end;
$$;

comment on function public.validate_invitation_public(text) is
'Public-safe invitation token validation. Input must be token_hash, never raw token. Returns only validity, status, invitation_type, target_role_key, and invited_email_required. Does not return PII or internal ids.';

revoke all on function public.validate_invitation_public(text) from public;
grant execute on function public.validate_invitation_public(text) to anon;
grant execute on function public.validate_invitation_public(text) to authenticated;

-- Explicit non-goals:
-- - No public SELECT policy on invitations, invitation_tokens, or redemptions.
-- - No raw token storage or SQL raw-token input.
-- - No signup, redemption, role_application, account_roles, or organization
--   relation writes.
--
-- Rollback guide:
-- - Prefer disabling application references first.
-- - If rollback is required before public use, revoke execute from anon and
--   authenticated.
-- - Drop the function only after explicit owner approval.

commit;

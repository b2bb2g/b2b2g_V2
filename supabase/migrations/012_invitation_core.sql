-- 012 Invitation Core Migration
--
-- Purpose:
-- - Add Invitation Engine core tables for controlled Supplier, Agent,
--   Buyer, Professor, and Student signup/invitation paths.
-- - Store only token hashes; raw invitation tokens must never be stored.
-- - Keep QR image storage out of MVP. QR should be generated from the
--   invitation URL by application code.
--
-- Explicit non-goals:
-- - No destructive schema change.
-- - No legacy signup/referral/member_referral table removal.
-- - No RLS policy creation or mutation.
-- - No SECURITY DEFINER helper.
-- - No data backfill.
-- - No production apply in this task.
-- - No email sending implementation.

begin;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  invitation_type text not null,
  invited_email text,
  target_role_key text not null,
  inviter_account_id uuid references public.profiles(id) on delete set null,
  parent_account_id uuid references public.profiles(id) on delete set null,
  parent_role_key text,
  company_id uuid references public.companies(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  professor_id uuid references public.professors(id) on delete set null,
  max_uses integer not null default 1,
  used_count integer not null default 0,
  expires_at timestamptz not null,
  status text not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  deleted_at timestamptz,
  constraint invitations_type_check check (
    invitation_type in (
      'supplier_admin_invite',
      'supplier_public_signup',
      'agent_admin_invite',
      'agent_public_application',
      'buyer_agent_invite',
      'buyer_direct_signup',
      'professor_admin_invite',
      'professor_public_application',
      'student_professor_invite'
    )
  ),
  constraint invitations_status_check check (
    status in ('draft', 'active', 'accepted', 'expired', 'revoked', 'cancelled')
  ),
  constraint invitations_max_uses_positive_check check (max_uses > 0),
  constraint invitations_used_count_non_negative_check check (used_count >= 0),
  constraint invitations_used_count_max_check check (used_count <= max_uses),
  constraint invitations_invited_email_normalized_check check (
    invited_email is null
    or invited_email = lower(trim(invited_email))
  ),
  constraint invitations_buyer_agent_parent_check check (
    invitation_type <> 'buyer_agent_invite'
    or (
      parent_account_id is not null
      and parent_role_key = 'agent'
      and agent_id is not null
    )
  ),
  constraint invitations_student_professor_parent_check check (
    invitation_type <> 'student_professor_invite'
    or (
      parent_account_id is not null
      and parent_role_key = 'professor'
      and professor_id is not null
    )
  )
);

comment on table public.invitations is
'Invitation Engine lifecycle table. Stores invitation context and status only; raw invitation tokens must never be stored.';

comment on column public.invitations.invitation_type is
'Invitation type key. Kept as text for MVP compatibility; enum creation is deferred.';

comment on column public.invitations.invited_email is
'Optional normalized email boundary for direct invitations. Do not use this to expose invitee existence.';

comment on column public.invitations.target_role_key is
'Target role key requested or created by this invitation flow.';

comment on column public.invitations.parent_account_id is
'Parent account for Agent-Buyer or Professor-Student invitation flows.';

comment on column public.invitations.max_uses is
'Maximum allowed redemptions. Default is single use unless a later policy explicitly allows controlled multi-use.';

comment on column public.invitations.used_count is
'Successful redemption count. Application actions must keep this transaction-safe.';

comment on column public.invitations.status is
'Lifecycle status. RLS policies are intentionally deferred to a later reviewed migration.';

create table if not exists public.invitation_tokens (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  token_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  used_at timestamptz,
  deleted_at timestamptz,
  constraint invitation_tokens_token_hash_not_blank_check check (
    length(trim(token_hash)) > 0
  ),
  constraint invitation_tokens_token_hash_unique unique (token_hash),
  constraint invitation_tokens_expires_after_created_check check (expires_at > created_at)
);

comment on table public.invitation_tokens is
'Invitation token hash table. Raw tokens must never be stored, logged, or exposed from this table.';

comment on column public.invitation_tokens.token_hash is
'One-way hash of the raw invitation token. The raw token exists only in the invitation URL and must not be persisted.';

comment on column public.invitation_tokens.expires_at is
'Token expiry timestamp. Expired tokens cannot be redeemed.';

comment on column public.invitation_tokens.revoked_at is
'Revocation timestamp. Revoked tokens cannot be redeemed.';

comment on column public.invitation_tokens.used_at is
'First successful redemption timestamp for single-use or tracked-use flows.';

create table if not exists public.invitation_redemptions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id),
  token_id uuid references public.invitation_tokens(id) on delete set null,
  redeemed_by uuid references public.profiles(id) on delete set null,
  redeemed_email text,
  redeemed_role_key text,
  status text not null default 'accepted',
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint invitation_redemptions_status_check check (
    status in ('accepted', 'rejected', 'blocked', 'expired')
  ),
  constraint invitation_redemptions_redeemed_email_normalized_check check (
    redeemed_email is null
    or redeemed_email = lower(trim(redeemed_email))
  )
);

comment on table public.invitation_redemptions is
'Invitation redemption audit table. It records acceptance attempts/results without storing raw tokens.';

comment on column public.invitation_redemptions.redeemed_email is
'Normalized email observed during redemption. Must not be exposed outside authorized Admin/System workflows.';

comment on column public.invitation_redemptions.status is
'Redemption result status. Detailed abuse/rate-limit logging is handled by later audit integration.';

create index if not exists invitations_invitation_type_idx
on public.invitations (invitation_type);

create index if not exists invitations_target_role_key_idx
on public.invitations (target_role_key);

create index if not exists invitations_status_idx
on public.invitations (status);

create index if not exists invitations_inviter_account_id_idx
on public.invitations (inviter_account_id);

create index if not exists invitations_parent_account_id_idx
on public.invitations (parent_account_id);

create index if not exists invitations_agent_id_idx
on public.invitations (agent_id);

create index if not exists invitations_professor_id_idx
on public.invitations (professor_id);

create index if not exists invitations_expires_at_idx
on public.invitations (expires_at);

create index if not exists invitations_deleted_at_idx
on public.invitations (deleted_at);

create index if not exists invitation_tokens_invitation_id_idx
on public.invitation_tokens (invitation_id);

create index if not exists invitation_tokens_token_hash_idx
on public.invitation_tokens (token_hash);

create index if not exists invitation_tokens_expires_at_idx
on public.invitation_tokens (expires_at);

create index if not exists invitation_tokens_deleted_at_idx
on public.invitation_tokens (deleted_at);

create index if not exists invitation_redemptions_invitation_id_idx
on public.invitation_redemptions (invitation_id);

create index if not exists invitation_redemptions_redeemed_by_idx
on public.invitation_redemptions (redeemed_by);

create index if not exists invitation_redemptions_status_idx
on public.invitation_redemptions (status);

create index if not exists invitation_redemptions_deleted_at_idx
on public.invitation_redemptions (deleted_at);

-- RLS decision:
-- - Row level security policies are deferred to a later reviewed migration.
-- - SECURITY DEFINER helpers are deferred to the RLS helper/policy phase.
-- - Application code must not treat this table set as protected until the
--   RLS migration is reviewed and applied.
--
-- Compatibility decision:
-- - Existing referral_codes and referral_relations remain Buyer-Buyer referral.
-- - Existing member_referral_codes and member_referral_signups remain legacy
--   invite-like structures until a separate migration review.
-- - No legacy records are backfilled in this migration.
--
-- QR decision:
-- - No QR image table is created for MVP.
-- - QR should be generated from an invitation URL by application code.
--
-- Rollback guide:
-- - Before production use, prefer disabling application references to these
--   tables.
-- - After production use, prefer usage disable and application rollback first.
-- - Table removal in production requires backup, dependency review, and
--   explicit owner approval.

commit;

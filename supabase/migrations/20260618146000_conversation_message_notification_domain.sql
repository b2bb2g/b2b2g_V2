-- SQL 16
-- Title: Conversation, Message, and Notification schema
-- Depends on: SQL 00 foundation identity and master data schema, SQL 02 member and company domain schema

begin;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  conversation_type text not null default 'direct',
  subject text,
  is_blocked boolean not null default false,
  blocked_by uuid references public.profiles(id) on delete set null,
  blocked_at timestamptz,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint conversations_type_check check (
    conversation_type in ('direct', 'group', 'support')
  )
);

create table if not exists public.conversation_members (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'member',
  last_read_at timestamptz,
  muted_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint conversation_members_unique unique (conversation_id, profile_id),
  constraint conversation_members_role_check check (
    member_role in ('owner', 'member', 'observer')
  )
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  blocked_by uuid references public.profiles(id) on delete set null,
  blocked_at timestamptz,
  edited_at timestamptz,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_id uuid not null,
  file_name text,
  file_mime_type text,
  file_size bigint,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint message_attachments_file_size_check check (
    file_size is null or file_size >= 0
  )
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  sender_profile_id uuid not null references public.profiles(id) on delete restrict,
  target_scope text not null default 'all',
  target_profile_id uuid references public.profiles(id) on delete cascade,
  target_member_type_code text,
  title text not null,
  body text not null,
  language_code text references public.languages(code) on delete set null,
  priority text not null default 'medium',
  published_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint announcements_scope_check check (
    target_scope in ('all', 'member_type', 'profile')
  ),
  constraint announcements_priority_check check (
    priority in ('low', 'medium', 'high', 'critical')
  )
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  announcement_id uuid references public.announcements(id) on delete set null,
  notification_type text not null,
  channel text not null default 'in_app',
  priority text not null default 'medium',
  title text not null,
  body text,
  read_at timestamptz,
  sent_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint notifications_channel_check check (
    channel in ('in_app', 'email', 'sms', 'whatsapp', 'line', 'kakaotalk')
  ),
  constraint notifications_priority_check check (
    priority in ('low', 'medium', 'high', 'critical')
  )
);

create index if not exists conversations_type_idx on public.conversations(conversation_type);
create index if not exists conversations_created_by_idx on public.conversations(created_by);
create index if not exists conversations_blocked_idx on public.conversations(is_blocked);

create index if not exists conversation_members_conversation_id_idx on public.conversation_members(conversation_id);
create index if not exists conversation_members_profile_id_idx on public.conversation_members(profile_id);
create index if not exists conversation_members_last_read_at_idx on public.conversation_members(last_read_at);

create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_sender_profile_id_idx on public.messages(sender_profile_id);
create index if not exists messages_created_at_idx on public.messages(created_at);
create index if not exists messages_blocked_at_idx on public.messages(blocked_at);

create index if not exists message_attachments_message_id_idx on public.message_attachments(message_id);
create index if not exists message_attachments_file_id_idx on public.message_attachments(file_id);
create index if not exists message_attachments_uploaded_by_idx on public.message_attachments(uploaded_by);

create index if not exists announcements_sender_profile_id_idx on public.announcements(sender_profile_id);
create index if not exists announcements_target_profile_id_idx on public.announcements(target_profile_id);
create index if not exists announcements_target_member_type_code_idx on public.announcements(target_member_type_code);
create index if not exists announcements_published_at_idx on public.announcements(published_at);

create index if not exists notifications_profile_id_idx on public.notifications(profile_id);
create index if not exists notifications_announcement_id_idx on public.notifications(announcement_id);
create index if not exists notifications_type_idx on public.notifications(notification_type);
create index if not exists notifications_read_at_idx on public.notifications(read_at);

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

drop trigger if exists conversation_members_set_updated_at on public.conversation_members;
create trigger conversation_members_set_updated_at
before update on public.conversation_members
for each row execute function public.set_updated_at();

drop trigger if exists messages_set_updated_at on public.messages;
create trigger messages_set_updated_at
before update on public.messages
for each row execute function public.set_updated_at();

drop trigger if exists message_attachments_set_updated_at on public.message_attachments;
create trigger message_attachments_set_updated_at
before update on public.message_attachments
for each row execute function public.set_updated_at();

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

commit;

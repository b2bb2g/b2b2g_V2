-- SQL 17
-- Title: Conversation, Message, and Notification RLS policies
-- Depends on: SQL 01 foundation RLS, SQL 03 member/company RLS, SQL 16 conversation/message/notification schema

begin;

create or replace function public.can_access_conversation(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.conversation_members
      where conversation_members.conversation_id = target_conversation_id
        and conversation_members.profile_id = auth.uid()
        and conversation_members.is_active = true
        and conversation_members.deleted_at is null
    )
    or exists (
      select 1
      from public.conversation_members
      join public.buyers
        on buyers.profile_id = conversation_members.profile_id
      where conversation_members.conversation_id = target_conversation_id
        and public.can_manage_country(buyers.country_id)
        and buyers.deleted_at is null
        and conversation_members.deleted_at is null
    )
    or exists (
      select 1
      from public.conversation_members
      join public.students
        on students.profile_id = conversation_members.profile_id
      where conversation_members.conversation_id = target_conversation_id
        and public.is_assigned_student(students.id)
        and students.deleted_at is null
        and conversation_members.deleted_at is null
    )
$$;

create or replace function public.can_access_message(target_message_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.messages
      where messages.id = target_message_id
        and public.can_access_conversation(messages.conversation_id)
        and messages.deleted_at is null
        and (
          messages.blocked_at is null
          or public.is_admin()
        )
    )
$$;

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;

create policy conversations_access_select
on public.conversations
for select
using (public.can_access_conversation(id));

create policy conversations_creator_insert
on public.conversations
for insert
with check (
  created_by = auth.uid()
  and is_blocked = false
);

create policy conversations_member_update
on public.conversations
for update
using (
  public.is_admin()
  or public.can_access_conversation(id)
)
with check (
  public.is_admin()
  or (
    public.can_access_conversation(id)
    and is_blocked = false
  )
);

create policy conversations_admin_all
on public.conversations
for all
using (public.is_admin())
with check (public.is_admin());

create policy conversation_members_access_select
on public.conversation_members
for select
using (public.can_access_conversation(conversation_id));

create policy conversation_members_self_insert
on public.conversation_members
for insert
with check (
  profile_id = auth.uid()
  and (
    created_by = auth.uid()
    or created_by is null
  )
  and exists (
    select 1
    from public.conversations
    where conversations.id = conversation_members.conversation_id
      and conversations.created_by = auth.uid()
      and conversations.deleted_at is null
  )
);

create policy conversation_members_self_update
on public.conversation_members
for update
using (
  public.is_admin()
  or profile_id = auth.uid()
)
with check (
  public.is_admin()
  or profile_id = auth.uid()
);

create policy conversation_members_admin_all
on public.conversation_members
for all
using (public.is_admin())
with check (public.is_admin());

create policy messages_access_select
on public.messages
for select
using (
  public.can_access_conversation(conversation_id)
  and (
    blocked_at is null
    or public.is_admin()
  )
);

create policy messages_member_insert
on public.messages
for insert
with check (
  sender_profile_id = auth.uid()
  and created_by = auth.uid()
  and public.can_access_conversation(conversation_id)
  and exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and conversations.is_blocked = false
      and conversations.deleted_at is null
  )
);

create policy messages_sender_update
on public.messages
for update
using (
  public.is_admin()
  or sender_profile_id = auth.uid()
)
with check (
  public.is_admin()
  or (
    sender_profile_id = auth.uid()
    and blocked_at is null
  )
);

create policy messages_admin_all
on public.messages
for all
using (public.is_admin())
with check (public.is_admin());

create policy message_attachments_access_select
on public.message_attachments
for select
using (
  public.can_access_message(message_id)
);

create policy message_attachments_member_insert
on public.message_attachments
for insert
with check (
  uploaded_by = auth.uid()
  and created_by = auth.uid()
  and public.can_access_message(message_id)
);

create policy message_attachments_owner_update
on public.message_attachments
for update
using (
  public.is_admin()
  or uploaded_by = auth.uid()
)
with check (
  public.is_admin()
  or uploaded_by = auth.uid()
);

create policy message_attachments_admin_all
on public.message_attachments
for all
using (public.is_admin())
with check (public.is_admin());

create policy announcements_target_select
on public.announcements
for select
using (
  public.is_admin()
  or (
    is_active = true
    and deleted_at is null
    and published_at is not null
    and (
      expires_at is null
      or expires_at > now()
    )
    and (
      target_scope = 'all'
      or target_profile_id = auth.uid()
      or exists (
        select 1
        from public.profiles
        join public.member_types
          on member_types.id = profiles.member_type_id
        where profiles.id = auth.uid()
          and member_types.code = announcements.target_member_type_code
      )
    )
  )
);

create policy announcements_limited_insert
on public.announcements
for insert
with check (
  (
    public.is_admin()
    and sender_profile_id = auth.uid()
    and created_by = auth.uid()
  )
  or (
    sender_profile_id = auth.uid()
    and created_by = auth.uid()
    and target_scope = 'profile'
    and exists (
      select 1
      from public.buyers
      where buyers.profile_id = announcements.target_profile_id
        and public.can_manage_country(buyers.country_id)
        and buyers.deleted_at is null
    )
  )
  or (
    sender_profile_id = auth.uid()
    and created_by = auth.uid()
    and target_scope = 'profile'
    and exists (
      select 1
      from public.students
      where students.profile_id = announcements.target_profile_id
        and public.is_assigned_student(students.id)
        and students.deleted_at is null
    )
  )
);

create policy announcements_admin_all
on public.announcements
for all
using (public.is_admin())
with check (public.is_admin());

create policy notifications_owner_select
on public.notifications
for select
using (
  public.is_admin()
  or profile_id = auth.uid()
);

create policy notifications_owner_update
on public.notifications
for update
using (
  public.is_admin()
  or profile_id = auth.uid()
)
with check (
  public.is_admin()
  or profile_id = auth.uid()
);

create policy notifications_admin_all
on public.notifications
for all
using (public.is_admin())
with check (public.is_admin());

commit;

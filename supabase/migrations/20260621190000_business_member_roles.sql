-- SQL 27
-- Title: Business member role options
-- Depends on: SQL 01 foundation identity master

begin;

insert into public.roles (code, name, description, is_system)
values
  ('supplier', 'Supplier', 'Additional supplier business role for member management.', true),
  ('buyer', 'Buyer', 'Additional buyer business role for member management.', true),
  ('agent', 'Agent', 'Additional agent business role for member management.', true),
  ('professor', 'Professor', 'Additional professor business role for member management.', true)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system,
  is_active = true,
  updated_at = now();

commit;

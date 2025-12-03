-- Simplify receipts RLS: authorize by path prefix (team_id/user_id) without relying on metadata

-- Drop previous policies
drop policy if exists "Receipts read by team" on storage.objects;
drop policy if exists "Receipts insert scoped" on storage.objects;
drop policy if exists "Receipts update scoped" on storage.objects;
drop policy if exists "Receipts delete scoped" on storage.objects;

-- Helper: path must look like <team_id>/<user_id>/...
-- team must match a team the user belongs to; user can write own prefix or admin/manager override.

create policy "Receipts read by team" on storage.objects
  for select using (
    bucket_id = 'receipts'
    and name ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}/'
    and exists (
      select 1 from public.team_users tu
      where tu.team_id = split_part(name, '/', 1)::uuid
        and tu.user_id = auth.uid()
    )
  );

create policy "Receipts insert by team path" on storage.objects
  for insert with check (
    bucket_id = 'receipts'
    and name ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}/'
    and exists (
      select 1 from public.team_users tu
      where tu.team_id = split_part(name, '/', 1)::uuid
        and tu.user_id = auth.uid()
    )
    and (
      name like split_part(name, '/', 1) || '/' || auth.uid() || '/%'
      or public.has_role(split_part(name, '/', 1)::uuid, array['admin','manager'])
    )
  );

create policy "Receipts update by team path" on storage.objects
  for update using (
    bucket_id = 'receipts'
    and name ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}/'
    and exists (
      select 1 from public.team_users tu
      where tu.team_id = split_part(name, '/', 1)::uuid
        and tu.user_id = auth.uid()
    )
    and (
      name like split_part(name, '/', 1) || '/' || auth.uid() || '/%'
      or public.has_role(split_part(name, '/', 1)::uuid, array['admin','manager'])
    )
  )
  with check (
    bucket_id = 'receipts'
    and name ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}/'
    and exists (
      select 1 from public.team_users tu
      where tu.team_id = split_part(name, '/', 1)::uuid
        and tu.user_id = auth.uid()
    )
    and (
      name like split_part(name, '/', 1) || '/' || auth.uid() || '/%'
      or public.has_role(split_part(name, '/', 1)::uuid, array['admin','manager'])
    )
  );

create policy "Receipts delete by team path" on storage.objects
  for delete using (
    bucket_id = 'receipts'
    and name ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}/'
    and exists (
      select 1 from public.team_users tu
      where tu.team_id = split_part(name, '/', 1)::uuid
        and tu.user_id = auth.uid()
    )
    and (
      name like split_part(name, '/', 1) || '/' || auth.uid() || '/%'
      or public.has_role(split_part(name, '/', 1)::uuid, array['admin','manager'])
    )
  );

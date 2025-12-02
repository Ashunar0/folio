-- Tighten receipts bucket RLS with team_id prefix + metadata guard

-- Ensure bucket exists (no-op if already created)
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'receipts') then
    insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false);
  end if;
end$$;

-- Drop previous wide-open policies
drop policy if exists "Receipts read" on storage.objects;
drop policy if exists "Receipts insert" on storage.objects;
drop policy if exists "Receipts update" on storage.objects;
drop policy if exists "Receipts delete" on storage.objects;

-- Read: team member of metadata.team_id
create policy "Receipts read by team" on storage.objects
  for select using (
    bucket_id = 'receipts'
    and metadata ? 'team_id'
    and exists (
      select 1 from public.team_users tu
      where tu.team_id = (metadata->>'team_id')::uuid
        and tu.user_id = auth.uid()
    )
  );

-- Insert: team member, path starts with team_id/auth.uid/ or admin/manager override
create policy "Receipts insert scoped" on storage.objects
  for insert with check (
    bucket_id = 'receipts'
    and metadata ? 'team_id'
    and exists (
      select 1 from public.team_users tu
      where tu.team_id = (metadata->>'team_id')::uuid
        and tu.user_id = auth.uid()
    )
    and (
      name like (metadata->>'team_id') || '/' || auth.uid() || '/%'
      or public.has_role((metadata->>'team_id')::uuid, array['admin','manager'])
    )
  );

-- Update: same scope as insert
create policy "Receipts update scoped" on storage.objects
  for update using (
    bucket_id = 'receipts'
    and metadata ? 'team_id'
    and exists (
      select 1 from public.team_users tu
      where tu.team_id = (metadata->>'team_id')::uuid
        and tu.user_id = auth.uid()
    )
    and (
      name like (metadata->>'team_id') || '/' || auth.uid() || '/%'
      or public.has_role((metadata->>'team_id')::uuid, array['admin','manager'])
    )
  )
  with check (
    bucket_id = 'receipts'
    and metadata ? 'team_id'
    and exists (
      select 1 from public.team_users tu
      where tu.team_id = (metadata->>'team_id')::uuid
        and tu.user_id = auth.uid()
    )
    and (
      name like (metadata->>'team_id') || '/' || auth.uid() || '/%'
      or public.has_role((metadata->>'team_id')::uuid, array['admin','manager'])
    )
  );

-- Delete: same scope as update
create policy "Receipts delete scoped" on storage.objects
  for delete using (
    bucket_id = 'receipts'
    and metadata ? 'team_id'
    and exists (
      select 1 from public.team_users tu
      where tu.team_id = (metadata->>'team_id')::uuid
        and tu.user_id = auth.uid()
    )
    and (
      name like (metadata->>'team_id') || '/' || auth.uid() || '/%'
      or public.has_role((metadata->>'team_id')::uuid, array['admin','manager'])
    )
  );

-- Relax receipts RLS to allow path-based authorization when metadata is missing
-- Keeps team scoping by requiring path to start with team_id/user_id

-- Drop previous scoped policies
drop policy if exists "Receipts read by team" on storage.objects;
drop policy if exists "Receipts insert scoped" on storage.objects;
drop policy if exists "Receipts update scoped" on storage.objects;
drop policy if exists "Receipts delete scoped" on storage.objects;

-- Helper expression to derive team_id from path when metadata.team_id is absent
-- path format: <team_id>/<user_id>/filename

-- Read
create policy "Receipts read by team" on storage.objects
  for select using (
    bucket_id = 'receipts'
    and (
      (
        metadata ? 'team_id'
        and exists (
          select 1 from public.team_users tu
          where tu.team_id = (metadata->>'team_id')::uuid
            and tu.user_id = auth.uid()
        )
      )
      or (
        name ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}/'
        and exists (
          select 1 from public.team_users tu
          where tu.team_id = split_part(name, '/', 1)::uuid
            and tu.user_id = auth.uid()
        )
      )
    )
  );

-- Insert
create policy "Receipts insert scoped" on storage.objects
  for insert with check (
    bucket_id = 'receipts'
    and (
      (
        metadata ? 'team_id'
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
      or (
        name ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}/'
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
    )
  );

-- Update
create policy "Receipts update scoped" on storage.objects
  for update using (
    bucket_id = 'receipts'
    and (
      (
        metadata ? 'team_id'
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
      or (
        name ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}/'
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
    )
  )
  with check (
    bucket_id = 'receipts'
    and (
      (
        metadata ? 'team_id'
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
      or (
        name ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}/'
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
    )
  );

-- Delete
create policy "Receipts delete scoped" on storage.objects
  for delete using (
    bucket_id = 'receipts'
    and (
      (
        metadata ? 'team_id'
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
      or (
        name ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}/'
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
    )
  );

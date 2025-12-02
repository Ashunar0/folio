-- Supabase initial schema for Folio
-- Based on docs/architecture.md and docs/database.md

create extension if not exists "pgcrypto";

-- Tables ----------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  theme text not null default 'default',
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.team_users (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('admin','manager','member','viewer')),
  created_at timestamptz not null default now(),
  unique(team_id, user_id)
);
create index if not exists idx_team_users_team on public.team_users(team_id);
create index if not exists idx_team_users_user on public.team_users(user_id);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  name text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_categories_team on public.categories(team_id);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  date date,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_events_team on public.events(team_id);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  date date not null,
  amount integer not null,
  type text not null check (type in ('expense','income')),
  category_id uuid references public.categories(id),
  event_id uuid references public.events(id),
  created_by uuid not null references public.profiles(id) default auth.uid(),
  status text not null default 'draft' check (status in ('draft','submitted','approved','rejected')),
  memo text,
  receipt_url text,
  approval_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_expenses_team on public.expenses(team_id);
create index if not exists idx_expenses_status on public.expenses(status);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  expense_id uuid not null references public.expenses(id) on delete cascade,
  date date not null,
  amount integer not null,
  type text not null check (type in ('expense','income')),
  category_id uuid references public.categories(id),
  event_id uuid references public.events(id),
  created_by uuid not null references public.profiles(id),
  approved_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_transactions_team on public.transactions(team_id);
create index if not exists idx_transactions_date on public.transactions(date);

create table if not exists public.invites (
  token uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  role text not null default 'member' check (role in ('admin','manager','member','viewer')),
  email text,
  expires_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_invites_team on public.invites(team_id);

-- Helper functions -----------------------------------------
create or replace function public.is_team_member(target_team uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from team_users tu
    where tu.team_id = target_team
      and tu.user_id = auth.uid()
  );
$$;

create or replace function public.has_role(target_team uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from team_users tu
    where tu.team_id = target_team
      and tu.user_id = auth.uid()
      and tu.role = any(allowed_roles)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'User'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS enablement -------------------------------------------
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_users enable row level security;
alter table public.categories enable row level security;
alter table public.events enable row level security;
alter table public.expenses enable row level security;
alter table public.transactions enable row level security;
alter table public.invites enable row level security;

-- Policies --------------------------------------------------
create policy "Profiles readable within same team" on public.profiles
  for select using (
    exists (
      select 1 from team_users tu
      where tu.user_id = profiles.id
        and tu.team_id in (
          select team_id from team_users where user_id = auth.uid()
        )
    )
  );
create policy "Profiles self update" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "Teams readable by members" on public.teams
  for select using (is_team_member(id));
create policy "Teams insertable by authenticated" on public.teams
  for insert with check (auth.uid() is not null);
create policy "Teams updatable by admin" on public.teams
  for update using (has_role(id, array['admin']))
  with check (has_role(id, array['admin']));
create policy "Teams deletable by admin" on public.teams
  for delete using (has_role(id, array['admin']));

create policy "Team users readable by members" on public.team_users
  for select using (is_team_member(team_id));
create policy "Team users insert by admin/manager" on public.team_users
  for insert with check (has_role(team_id, array['admin','manager']));
create policy "Team users update by admin/manager" on public.team_users
  for update using (has_role(team_id, array['admin','manager']))
  with check (has_role(team_id, array['admin','manager']));
create policy "Team users delete by admin" on public.team_users
  for delete using (has_role(team_id, array['admin']));

create policy "Categories readable" on public.categories
  for select using (
    team_id is null or is_team_member(team_id)
  );
create policy "Categories insertable by admin/manager" on public.categories
  for insert with check (team_id is null or has_role(team_id, array['admin','manager']));
create policy "Categories updatable by admin/manager" on public.categories
  for update using (team_id is null or has_role(team_id, array['admin','manager']))
  with check (team_id is null or has_role(team_id, array['admin','manager']));
create policy "Categories delete by admin/manager" on public.categories
  for delete using (team_id is null or has_role(team_id, array['admin','manager']));

create policy "Events readable by members" on public.events
  for select using (is_team_member(team_id));
create policy "Events insert by admin/manager" on public.events
  for insert with check (has_role(team_id, array['admin','manager']));
create policy "Events update by admin/manager" on public.events
  for update using (has_role(team_id, array['admin','manager']))
  with check (has_role(team_id, array['admin','manager']));
create policy "Events delete by admin/manager" on public.events
  for delete using (has_role(team_id, array['admin','manager']));

create policy "Expenses readable by team" on public.expenses
  for select using (is_team_member(team_id));
create policy "Expenses insert by members" on public.expenses
  for insert with check (
    is_team_member(team_id)
    and has_role(team_id, array['admin','manager','member'])
    and created_by = auth.uid()
  );
create policy "Expenses update rules" on public.expenses
  for update using (
    is_team_member(team_id) and (
      has_role(team_id, array['admin'])
      or (has_role(team_id, array['manager']) and status in ('draft','submitted'))
      or (created_by = auth.uid() and status in ('draft','submitted'))
    )
  )
  with check (
    is_team_member(team_id) and (
      has_role(team_id, array['admin'])
      or (has_role(team_id, array['manager']) and status in ('draft','submitted'))
      or (created_by = auth.uid() and status in ('draft','submitted'))
    )
  );
create policy "Expenses delete rules" on public.expenses
  for delete using (
    is_team_member(team_id) and (
      has_role(team_id, array['admin'])
      or (has_role(team_id, array['manager']) and created_by = auth.uid())
    )
  );

create policy "Transactions readable by team" on public.transactions
  for select using (is_team_member(team_id));
create policy "Transactions insert by admin/manager" on public.transactions
  for insert with check (has_role(team_id, array['admin','manager']));
create policy "Transactions delete by admin/manager" on public.transactions
  for delete using (has_role(team_id, array['admin','manager']));

create policy "Invites readable by admin/manager" on public.invites
  for select using (has_role(team_id, array['admin','manager']));
create policy "Invites insert by admin/manager" on public.invites
  for insert with check (has_role(team_id, array['admin','manager']));
create policy "Invites delete by admin" on public.invites
  for delete using (has_role(team_id, array['admin']));

-- Force RLS ------------------------------------------------
alter table public.profiles force row level security;
alter table public.teams force row level security;
alter table public.team_users force row level security;
alter table public.categories force row level security;
alter table public.events force row level security;
alter table public.expenses force row level security;
alter table public.transactions force row level security;
alter table public.invites force row level security;

-- Storage bucket for receipts -------------------------------
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'receipts') then
    insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false);
  end if;
end$$;

create policy "Receipts read" on storage.objects
  for select using (
    bucket_id = 'receipts' and auth.role() = 'authenticated'
  );
create policy "Receipts insert" on storage.objects
  for insert with check (
    bucket_id = 'receipts' and auth.role() = 'authenticated'
  );
create policy "Receipts update" on storage.objects
  for update using (
    bucket_id = 'receipts' and auth.role() = 'authenticated'
  )
  with check (
    bucket_id = 'receipts' and auth.role() = 'authenticated'
  );
create policy "Receipts delete" on storage.objects
  for delete using (
    bucket_id = 'receipts' and auth.role() = 'authenticated'
  );

-- Add email column to profiles and keep it in sync with auth.users
alter table public.profiles add column if not exists email text;

-- Backfill from auth.users
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;

-- Enforce presence and uniqueness
alter table public.profiles alter column email set not null;
create unique index if not exists profiles_email_key on public.profiles(email);

-- Update signup trigger to store email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'User'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

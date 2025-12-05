-- Create a function to create a team and add the creator as admin
create or replace function public.create_team(name text)
returns uuid
language plpgsql
security definer
as $$
declare
  new_team_id uuid;
begin
  -- Insert into teams
  insert into public.teams (name, created_by)
  values (name, auth.uid())
  returning id into new_team_id;

  -- Insert into team_users as admin
  insert into public.team_users (team_id, user_id, role)
  values (new_team_id, auth.uid(), 'admin');

  return new_team_id;
end;
$$;

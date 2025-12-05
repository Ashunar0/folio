-- Create a function to accept an invite and join a team
create or replace function public.accept_invite(p_token uuid)
returns uuid  -- Returns team_id
language plpgsql
security definer
as $$
declare
  v_invite record;
  v_team_id uuid;
  v_user_id uuid;
begin
  -- Get current user
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Fetch invite information
  select * into v_invite 
  from public.invites
  where token = p_token
    and (expires_at is null or expires_at > now());
  
  if not found then
    raise exception 'Invalid or expired invite token';
  end if;
  
  v_team_id := v_invite.team_id;
  
  -- Check if user is already a member
  if exists (
    select 1 from public.team_users
    where team_id = v_team_id
      and user_id = v_user_id
  ) then
    -- Already a member - just return team_id
    return v_team_id;
  end if;
  
  -- Add user to team
  insert into public.team_users (team_id, user_id, role)
  values (v_team_id, v_user_id, v_invite.role);
  
  return v_team_id;
end;
$$;

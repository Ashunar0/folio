-- Allow reading team info if a valid invite exists
-- This is necessary for the invite flow where users need to see
-- the team name before joining

CREATE POLICY "Teams readable via invite" 
ON public.teams
FOR SELECT 
USING (
  -- Either you're a member OR there's a valid invite for this team
  is_team_member(id) OR EXISTS (
    SELECT 1 FROM public.invites
    WHERE invites.team_id = teams.id
      AND (invites.expires_at IS NULL OR invites.expires_at > now())
  )
);

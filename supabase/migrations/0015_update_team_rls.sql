-- Allow admin and manager to update team settings (name)
DROP POLICY IF EXISTS "Teams updatable by admin" ON public.teams;

CREATE POLICY "Teams updatable by admin/manager" ON public.teams
  FOR UPDATE USING (has_role(id, array['admin', 'manager']))
  WITH CHECK (has_role(id, array['admin', 'manager']));

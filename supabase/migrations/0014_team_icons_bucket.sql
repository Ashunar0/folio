-- Create storage bucket for team icons
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'team-icons') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('team-icons', 'team-icons', true);
  END IF;
END$$;

-- RLS policies for team-icons bucket
-- Allow public read access
CREATE POLICY "Team icons public read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'team-icons'
  );

-- Allow admin/manager to upload team icons
CREATE POLICY "Team icons upload by admin/manager" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'team-icons'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.team_users tu
      WHERE tu.team_id::text = (storage.foldername(name))[1]
        AND tu.user_id = auth.uid()
        AND tu.role IN ('admin', 'manager')
    )
  );

-- Allow admin/manager to update team icons
CREATE POLICY "Team icons update by admin/manager" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'team-icons'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.team_users tu
      WHERE tu.team_id::text = (storage.foldername(name))[1]
        AND tu.user_id = auth.uid()
        AND tu.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    bucket_id = 'team-icons'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.team_users tu
      WHERE tu.team_id::text = (storage.foldername(name))[1]
        AND tu.user_id = auth.uid()
        AND tu.role IN ('admin', 'manager')
    )
  );

-- Allow admin/manager to delete team icons
CREATE POLICY "Team icons delete by admin/manager" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'team-icons'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.team_users tu
      WHERE tu.team_id::text = (storage.foldername(name))[1]
        AND tu.user_id = auth.uid()
        AND tu.role IN ('admin', 'manager')
    )
  );

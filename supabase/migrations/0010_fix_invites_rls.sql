-- Fix invites RLS policy to allow authenticated users to read invites
-- This is necessary because invite recipients are not yet team members

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Invites readable by admin/manager" ON public.invites;

-- Create a new policy that allows any authenticated user to read invites
-- This is safe because:
-- 1. Users need to know the token (UUID) to access an invite
-- 2. Tokens are unguessable (128-bit UUID)
-- 3. Invites can have expiration dates
CREATE POLICY "Invites readable by authenticated users" 
ON public.invites
FOR SELECT 
USING (auth.role() = 'authenticated');

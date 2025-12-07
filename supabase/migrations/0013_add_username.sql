-- Add username field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text;

-- Create storage bucket for avatars (if not exists, done via dashboard)
-- Run this in Supabase SQL Editor or set up via dashboard:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT DO NOTHING;

-- RLS policies for avatars bucket
-- These should be set up via the Supabase dashboard:
-- 1. SELECT: Allow public read access
-- 2. INSERT/UPDATE: Allow authenticated users to upload/update their own avatar
-- 3. DELETE: Allow authenticated users to delete their own avatar

-- Add approved column to profiles. New users are unapproved by default.
-- Admins approve users via the admin panel.
-- Apply in Supabase Dashboard → SQL Editor.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false;

-- Approve all existing users (they were already using the app)
UPDATE public.profiles SET approved = true;

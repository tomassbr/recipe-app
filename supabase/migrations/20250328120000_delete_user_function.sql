-- Self-service account deletion.
-- The authenticated user can delete their own auth.users row via RPC.
-- SECURITY DEFINER lets the function run as its owner (postgres) so it
-- can delete from auth.users without needing the service_role key client-side.
--
-- Apply via Supabase Dashboard → SQL Editor.
-- BACKUP FIRST: Dashboard → Settings → Database → Backups.

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
BEGIN
  _uid := auth.uid();

  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- profiles row is removed automatically via ON DELETE CASCADE on auth.users
  -- recipes.created_by is set to NULL via ON DELETE SET NULL
  DELETE FROM auth.users WHERE id = _uid;
END;
$$;

-- Only authenticated users can call this function
REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

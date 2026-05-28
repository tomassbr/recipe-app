-- Custom Access Token Hook
-- Adds user_role and user_approved from profiles into the JWT claims.
-- This allows the middleware to read auth context from the token cookie
-- without making any network calls to Supabase.
--
-- After applying this migration:
--   Supabase Dashboard → Authentication → Hooks
--   → Custom Access Token → select "public.custom_access_token_hook"
--
-- Apply in Supabase Dashboard → SQL Editor.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims     jsonb;
  user_role  text;
  user_approved boolean;
BEGIN
  SELECT p.role, p.approved
    INTO user_role, user_approved
    FROM public.profiles p
   WHERE p.id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}',     to_jsonb(COALESCE(user_role,     'user')));
  claims := jsonb_set(claims, '{user_approved}', to_jsonb(COALESCE(user_approved, false)));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Supabase Auth engine needs execute rights; revoke from regular roles.
GRANT USAGE  ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

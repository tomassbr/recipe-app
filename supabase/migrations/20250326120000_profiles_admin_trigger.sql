-- Profiles + RLS + first signup becomes admin (trigger on auth.users).
-- Apply in Supabase Dashboard → SQL Editor, or via `supabase db push`.

-- 1) Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  display_name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);

COMMENT ON TABLE public.profiles IS 'App user profile; role drives admin UI. Synced from auth.users via trigger.';

-- 2) New auth user → profile row; exactly one user in auth.users ⇒ admin -----
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(
      TRIM(
        COALESCE(
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'name',
          ''
        )
      ),
      ''
    ),
    CASE
      WHEN (SELECT COUNT(*)::integer FROM auth.users) = 1 THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 3) Keep email / display_name in sync when auth user changes ----------------
CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND (
       NEW.email IS DISTINCT FROM OLD.email
       OR NEW.raw_user_meta_data IS DISTINCT FROM OLD.raw_user_meta_data
     )
  THEN
    UPDATE public.profiles
    SET
      email = NEW.email,
      display_name = NULLIF(
        TRIM(
          COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            ''
          )
        ),
        ''
      ),
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_from_auth_user();

-- 4) RLS ---------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS "profiles_update_admins" ON public.profiles;
CREATE POLICY "profiles_update_admins"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
  )
);

-- 5) Grants ------------------------------------------------------------------
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- 6) Backfill existing auth users (no profile yet); oldest user becomes admin
INSERT INTO public.profiles (id, email, display_name, role)
SELECT
  u.id,
  u.email,
  NULLIF(
    TRIM(
      COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        ''
      )
    ),
    ''
  ),
  CASE
    WHEN u.id = (
      SELECT u2.id
      FROM auth.users AS u2
      ORDER BY u2.created_at ASC
      LIMIT 1
    )
    THEN 'admin'
    ELSE 'user'
  END
FROM auth.users AS u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles AS p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

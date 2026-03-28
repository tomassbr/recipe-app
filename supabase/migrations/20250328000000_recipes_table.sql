-- Recipes table with RLS: admins write, all authenticated users read.
-- Apply via Supabase Dashboard → SQL Editor, or `supabase db push`.
-- BACKUP FIRST: Dashboard → Settings → Database → Backups.

-- 1) Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recipes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  category    text        NOT NULL,
  base_yield  numeric     NOT NULL CHECK (base_yield > 0),
  yield_unit  text        NOT NULL CHECK (yield_unit IN ('g', 'kg', 'ks')),
  note        text,
  components  jsonb       NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid        REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS recipes_category_idx   ON public.recipes (category);
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON public.recipes (created_at DESC);

COMMENT ON TABLE  public.recipes            IS 'Pastry recipes. components is JSONB array matching the Component[] TypeScript type.';
COMMENT ON COLUMN public.recipes.components IS 'Array of Component objects: [{id, name, ingredients: [{name, baseAmount, unit, note?}]}]';

-- 2) updated_at trigger ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recipes_set_updated_at ON public.recipes;
CREATE TRIGGER recipes_set_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) RLS ---------------------------------------------------------------------
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read recipes
DROP POLICY IF EXISTS "recipes_select_authenticated" ON public.recipes;
CREATE POLICY "recipes_select_authenticated"
  ON public.recipes FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert
DROP POLICY IF EXISTS "recipes_insert_admins" ON public.recipes;
CREATE POLICY "recipes_insert_admins"
  ON public.recipes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    )
  );

-- Only admins can update
DROP POLICY IF EXISTS "recipes_update_admins" ON public.recipes;
CREATE POLICY "recipes_update_admins"
  ON public.recipes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    )
  );

-- Only admins can delete
DROP POLICY IF EXISTS "recipes_delete_admins" ON public.recipes;
CREATE POLICY "recipes_delete_admins"
  ON public.recipes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    )
  );

-- 4) Grants ------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;

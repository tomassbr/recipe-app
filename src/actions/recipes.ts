"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";
import { parseRecipeDatabase } from "@/utils/recipeDb";
import type { Recipe } from "@/types/recipe";

export type RecipeActionResult =
  | { ok: true }
  | { ok: false; error: string };

export type CreateRecipeResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

// DB row → Recipe (snake_case → camelCase + JSONB parse)
function rowToRecipe(row: Record<string, unknown>): Recipe {
  const parsed = parseRecipeDatabase([
    {
      id: row.id,
      name: row.name,
      category: row.category,
      baseYield: Number(row.base_yield),
      yieldUnit: row.yield_unit,
      note: row.note ?? undefined,
      components: row.components,
    },
  ]);
  return parsed[0];
}

// Recipe → DB row (camelCase → snake_case)
function recipeToRow(recipe: Recipe, userId: string) {
  return {
    name: recipe.name,
    category: recipe.category,
    base_yield: recipe.baseYield,
    yield_unit: recipe.yieldUnit,
    note: recipe.note ?? null,
    components: recipe.components,
    created_by: userId,
  };
}

/**
 * Fetch all recipes — available to all authenticated users (enforced by RLS).
 */
export async function getRecipes(): Promise<Recipe[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getRecipes]", error.message);
    return [];
  }

  try {
    return (data as Record<string, unknown>[]).map(rowToRecipe);
  } catch (e) {
    console.error("[getRecipes] parse error", e);
    return [];
  }
}

/**
 * Create a new recipe — admin only.
 * Returns the generated id so the client can update its local state.
 */
export async function createRecipe(
  recipe: Omit<Recipe, "id">
): Promise<CreateRecipeResult> {
  const supabase = await createClient();
  const authz = await requireAdmin(supabase);
  if (!authz.ok) return { ok: false, error: authz.error };

  const { data, error } = await supabase
    .from("recipes")
    .insert(recipeToRow(recipe as Recipe, authz.userId))
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true, id: data.id as string };
}

/**
 * Update an existing recipe — admin only.
 */
export async function updateRecipe(recipe: Recipe): Promise<RecipeActionResult> {
  const supabase = await createClient();
  const authz = await requireAdmin(supabase);
  if (!authz.ok) return { ok: false, error: authz.error };

  const { name, category, base_yield, yield_unit, note, components } = {
    name: recipe.name,
    category: recipe.category,
    base_yield: recipe.baseYield,
    yield_unit: recipe.yieldUnit,
    note: recipe.note ?? null,
    components: recipe.components,
  };

  const { error } = await supabase
    .from("recipes")
    .update({ name, category, base_yield, yield_unit, note, components })
    .eq("id", recipe.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true };
}

/**
 * Delete a recipe — admin only.
 */
export async function deleteRecipe(id: string): Promise<RecipeActionResult> {
  const supabase = await createClient();
  const authz = await requireAdmin(supabase);
  if (!authz.ok) return { ok: false, error: authz.error };

  const { error } = await supabase.from("recipes").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true };
}

/**
 * Seed recipes from the local db.json — admin only, one-time import.
 * Skips recipes that already exist (by name + category match is not ideal,
 * so we insert with ON CONFLICT DO NOTHING via upsert on the id column).
 */
export async function seedRecipesFromJson(
  recipes: Recipe[]
): Promise<RecipeActionResult> {
  const supabase = await createClient();
  const authz = await requireAdmin(supabase);
  if (!authz.ok) return { ok: false, error: authz.error };

  const rows = recipes.map((r) => ({
    id: r.id,
    ...recipeToRow(r, authz.userId),
  }));

  const { error } = await supabase
    .from("recipes")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: true });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true };
}

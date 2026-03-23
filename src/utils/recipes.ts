import type { Recipe } from "@/types/recipe";
import { SEED_RECIPES } from "@/utils/seedRecipes";

/**
 * Static seed data for SSR/tests. Runtime app uses `RecipeContext` + localStorage.
 */
export function getRecipes(): Recipe[] {
  return SEED_RECIPES;
}

export function getCategories(): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const r of SEED_RECIPES) {
    if (!seen.has(r.category)) {
      seen.add(r.category);
      order.push(r.category);
    }
  }
  return order.sort((a, b) => a.localeCompare(b, "cs"));
}

export function getRecipesByCategory(category: string): Recipe[] {
  return SEED_RECIPES.filter((r) => r.category === category);
}

export function getRecipeById(id: string): Recipe | undefined {
  return SEED_RECIPES.find((r) => r.id === id);
}

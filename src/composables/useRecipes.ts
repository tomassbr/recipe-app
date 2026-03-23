"use client";

import { useRecipe } from "@/context/RecipeContext";
import type { Recipe } from "@/types/recipe";

/** @deprecated Use `useRecipe` */
export function useRecipes(): Recipe[] {
  return useRecipe().recipes;
}

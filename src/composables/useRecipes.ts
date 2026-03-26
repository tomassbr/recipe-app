"use client";

import { useRecipe } from "@/composables/useRecipe";
import type { Recipe } from "@/types/recipe";

/** @deprecated Use `useRecipe` */
export function useRecipes(): Recipe[] {
  return useRecipe().recipes;
}

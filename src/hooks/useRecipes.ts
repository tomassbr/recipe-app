"use client";

import { useRecipe } from "@/hooks/useRecipe";
import type { Recipe } from "@/types/recipe";

/** @deprecated Use `useRecipe` */
export function useRecipes(): Recipe[] {
  return useRecipe().recipes;
}

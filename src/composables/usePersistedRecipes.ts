"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Recipe } from "@/types/recipe";
import { parseRecipeDatabase } from "@/utils/recipeDb";
import { SEED_RECIPES } from "@/utils/seedRecipes";

const STORAGE_KEY = "pastrycalc-recipes-v1";

function loadRecipesFromStorage(): Recipe[] {
  if (typeof window === "undefined") return SEED_RECIPES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_RECIPES;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_RECIPES;
    return parseRecipeDatabase(parsed);
  } catch {
    return SEED_RECIPES;
  }
}

/**
 * Recipe list synced with localStorage after hydration (same semantics as previous context).
 */
export function usePersistedRecipes(): {
  recipes: Recipe[];
  setRecipes: Dispatch<SetStateAction<Recipe[]>>;
  hydrated: boolean;
} {
  const [recipes, setRecipes] = useState<Recipe[]>(SEED_RECIPES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRecipes(loadRecipesFromStorage());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Recipe[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota */
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persist(recipes);
  }, [recipes, hydrated, persist]);

  return { recipes, setRecipes, hydrated };
}

"use client";

import { useEffect, useState } from "react";
import type { Recipe } from "@/types/recipe";
import { useRecipeCalculator } from "@/hooks/useRecipeCalculator";
import { useRecipeContext } from "@/context/RecipeContext";

export type { RecipeContextValue } from "@/context/RecipeContext";

/**
 * Aplikační stav receptů (persistované údaje, výběr, modal).
 * Veškerá logika načítání a přepočtu patří sem / do kontextu, ne do prezentace.
 */
export function useRecipe() {
  return useRecipeContext();
}

export { useRecipeContext };

/**
 * Přepočet surovin a součty komponent pro detail receptu.
 */
export function useRecipeDetailScaling(recipe: Recipe) {
  const [targetYield, setTargetYield] = useState(recipe.baseYield);

  useEffect(() => {
    setTargetYield(recipe.baseYield);
  }, [recipe.id, recipe.baseYield]);

  const { coefficient, scaledRecipe, componentBatchSummaries } =
    useRecipeCalculator(recipe, targetYield);

  return {
    targetYield,
    setTargetYield,
    coefficient,
    scaledRecipe,
    componentBatchSummaries,
  };
}

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
  const [targetYield, setTargetYieldState] = useState(recipe.baseYield);
  const [pieceCounts, setPieceCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    setTargetYieldState(recipe.baseYield);
    setPieceCounts({});
  }, [recipe.id, recipe.baseYield]);

  /** Přímé zadání gramů ruší kusové zadání. */
  const setTargetYield = (value: number) => {
    setPieceCounts({});
    setTargetYieldState(value);
  };

  /** Kusové zadání: cílové gramy = Σ počet × gramy na kus. */
  const setPieceCount = (index: number, count: number) => {
    const next = { ...pieceCounts, [index]: count };
    setPieceCounts(next);
    const grams = (recipe.pieceOptions ?? []).reduce(
      (sum, opt, i) => sum + (next[i] ?? 0) * opt.grams,
      0
    );
    setTargetYieldState(Math.round(grams * 100) / 100);
  };

  const { coefficient, scaledRecipe, componentBatchSummaries } =
    useRecipeCalculator(recipe, targetYield);

  return {
    targetYield,
    setTargetYield,
    pieceCounts,
    setPieceCount,
    coefficient,
    scaledRecipe,
    componentBatchSummaries,
  };
}

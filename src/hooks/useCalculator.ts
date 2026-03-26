"use client";

import { useMemo } from "react";
import { scaleIngredientAmount } from "@/utils/recipeScaling";

/**
 * Per-ingredient recalculation. Prefer `useRecipeCalculator` for full recipes.
 */
export function useCalculator(
  baseYield: number,
  targetYield: number,
  baseAmount: number
): number {
  return useMemo(
    () => scaleIngredientAmount(baseYield, targetYield, baseAmount),
    [baseYield, targetYield, baseAmount]
  );
}

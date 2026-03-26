"use client";

import { useMemo } from "react";
import type { Recipe } from "@/types/recipe";
import type { CalculatedRecipe } from "@/types/calculatedRecipe";
import {
  summarizeComponentBatchTotals,
  type ComponentBatchTotalsSummary,
} from "@/utils/componentBatchTotals";
import {
  buildScaledRecipe,
  computeScaledCoefficient,
} from "@/utils/recipeScaling";

export type UseRecipeCalculatorResult = {
  coefficient: number;
  scaledRecipe: CalculatedRecipe;
  /** Součet přepočtu po komponentách (stejné pořadí jako `scaledRecipe.components`). */
  componentBatchSummaries: ComponentBatchTotalsSummary[];
};

/**
 * Scales a recipe to a target yield using coefficient = targetYield / baseYield.
 * All calculation logic lives in `@/utils/recipeScaling`; this hook only memoizes.
 */
export function useRecipeCalculator(
  selectedRecipe: Recipe,
  targetYield: number
): UseRecipeCalculatorResult {
  return useMemo(() => {
    const coefficient = computeScaledCoefficient(
      selectedRecipe.baseYield,
      targetYield
    );
    const scaledRecipe = buildScaledRecipe(selectedRecipe, coefficient);

    const componentBatchSummaries = scaledRecipe.components.map((c) =>
      summarizeComponentBatchTotals(c.ingredients)
    );

    return {
      coefficient,
      scaledRecipe,
      componentBatchSummaries,
    };
  }, [selectedRecipe, targetYield]);
}

"use client";

import type { Ingredient } from "@/types/recipe";
import type { CalculatedIngredient } from "@/types/calculatedRecipe";
import { formatScaledAmountDisplay } from "@/utils/recipeAmount";
import { AnimatedScaledAmount } from "./AnimatedScaledAmount";

type IngredientRowProps = {
  originalIngredient: Ingredient;
  scaledIngredient: CalculatedIngredient;
  /** Bumps animation when target yield / coefficient changes */
  recalcKey: string;
};

export function IngredientRow({
  originalIngredient,
  scaledIngredient,
  recalcKey,
}: IngredientRowProps) {
  const mainLine = `${formatScaledAmountDisplay(scaledIngredient.baseAmount)} ${scaledIngredient.unit}`;
  const subLine = scaledIngredient.displayAmount ?? "";

  return (
    <tr className="border-b border-white/25 last:border-b-0">
      <td className="px-4 py-3 text-slate-800">
        <span className="block">{originalIngredient.name}</span>
        {originalIngredient.note ? (
          <span className="mt-1 block text-xs text-slate-500">
            {originalIngredient.note}
          </span>
        ) : null}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-500">
        {formatScaledAmountDisplay(originalIngredient.baseAmount)}{" "}
        {originalIngredient.unit}
      </td>
      <td className="px-4 py-3 text-right font-medium text-slate-800">
        <span className="block">
          <AnimatedScaledAmount valueKey={`${recalcKey}|${mainLine}`}>
            <span className="tabular-nums">
              {formatScaledAmountDisplay(scaledIngredient.baseAmount)}{" "}
              {scaledIngredient.unit}
            </span>
          </AnimatedScaledAmount>
        </span>
        {scaledIngredient.displayAmount ? (
          <span className="mt-1 block text-xs font-normal">
            <AnimatedScaledAmount valueKey={`${recalcKey}|${subLine}`}>
              <span className="tabular-nums text-slate-500">
                {scaledIngredient.displayAmount}
              </span>
            </AnimatedScaledAmount>
          </span>
        ) : null}
      </td>
    </tr>
  );
}

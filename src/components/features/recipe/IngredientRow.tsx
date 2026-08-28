"use client";

import { useTranslations } from "next-intl";
import type { Ingredient } from "@/types/recipe";
import type { CalculatedIngredient } from "@/types/calculatedRecipe";
import { formatIngredientAmountWithUnit } from "@/utils/recipeAmount";
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
  const t = useTranslations("recipeDetail");
  const rounding = originalIngredient.rounding;
  const mainLine = formatIngredientAmountWithUnit(
    scaledIngredient.baseAmount,
    scaledIngredient.unit,
    rounding
  );
  const originalLine = formatIngredientAmountWithUnit(
    originalIngredient.baseAmount,
    originalIngredient.unit,
    rounding
  );
  const subLine = scaledIngredient.displayAmount ?? "";

  return (
    <tr className="border-b border-white/25 tabular-nums transition-colors odd:bg-white/10 even:bg-white/30 last:border-b-0 hover:bg-gold-muted/40">
      <td className="px-4 py-3 text-slate-800">
        <span className="block">{originalIngredient.name}</span>
        {originalIngredient.note ? (
          <span className="mt-1 block text-xs text-slate-600">
            {originalIngredient.note}
          </span>
        ) : null}
      </td>
      <td className="hidden px-4 py-3 text-right text-sm tabular-nums text-slate-600 sm:table-cell">
        {originalLine}
      </td>
      <td className="px-4 py-3 text-right text-base font-semibold text-slate-900 md:text-lg">
        {/* Original column is visually hidden on mobile — keep it for screen readers */}
        <span className="sr-only sm:hidden">
          {t("colOriginal")}: {originalLine}.{" "}
          {t("colScaled")}:{" "}
        </span>
        <span className="block">
          <AnimatedScaledAmount valueKey={`${recalcKey}|${mainLine}`}>
            <span className="tabular-nums">{mainLine}</span>
          </AnimatedScaledAmount>
        </span>
        {scaledIngredient.displayAmount ? (
          <span className="mt-1 block text-xs font-normal">
            <AnimatedScaledAmount valueKey={`${recalcKey}|${subLine}`}>
              <span className="tabular-nums text-slate-600">
                {scaledIngredient.displayAmount}
              </span>
            </AnimatedScaledAmount>
          </span>
        ) : null}
      </td>
    </tr>
  );
}

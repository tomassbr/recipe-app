import type { IngredientRounding, Recipe } from "@/types/recipe";
import type { CalculatedIngredient, CalculatedRecipe } from "@/types/calculatedRecipe";
import { roundExactAmount, roundRecipeAmount } from "@/utils/recipeAmount";

/**
 * Pure scaling math: target / base. Returns 0 when inputs are invalid.
 */
export function computeScaledCoefficient(
  baseYield: number,
  targetYield: number
): number {
  if (
    !Number.isFinite(baseYield) ||
    baseYield === 0 ||
    !Number.isFinite(targetYield)
  ) {
    return 0;
  }
  return targetYield / baseYield;
}

/**
 * Scale a single ingredient amount by the same coefficient as a full recipe.
 */
export function scaleIngredientAmount(
  baseYield: number,
  targetYield: number,
  baseAmount: number,
  rounding: IngredientRounding = "default",
  unit = "g"
): number {
  const c = computeScaledCoefficient(baseYield, targetYield);
  const raw = baseAmount * c;
  return rounding === "exact" ? roundExactAmount(raw) : roundRecipeAmount(raw, unit);
}

/**
 * Deep-clones the recipe and scales every ingredient.baseAmount by coefficient.
 * When unit is kg and scaled amount &lt; 0.01, sets displayAmount in grams.
 */
export function buildScaledRecipe(
  recipe: Recipe,
  coefficient: number
): CalculatedRecipe {
  const cloned = structuredClone(recipe) as CalculatedRecipe;
  if (!Array.isArray(cloned.components)) {
    cloned.components = [];
  }

  for (const component of cloned.components) {
    const ingredients: CalculatedIngredient[] = [];
    for (const ing of component.ingredients) {
      const raw = ing.baseAmount * coefficient;
      const exact = ing.rounding === "exact";

      // Malé kg množství zobrazíme rovnou v gramech (pod 100 g).
      if (ing.unit === "kg" && raw > 0 && raw < 0.1) {
        const rawGrams = raw * 1000;
        const grams = exact ? roundExactAmount(rawGrams) : roundRecipeAmount(rawGrams);
        ingredients.push({
          ...ing,
          baseAmount: grams,
          unit: "g",
        });
        continue;
      }

      const rounded = exact ? roundExactAmount(raw) : roundRecipeAmount(raw, ing.unit);
      ingredients.push({
        ...ing,
        baseAmount: rounded,
      });
    }
    component.ingredients = ingredients;
  }

  return cloned;
}

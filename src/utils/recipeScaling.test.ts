import { describe, expect, it } from "vitest";
import {
  computeScaledCoefficient,
  scaleIngredientAmount,
  buildScaledRecipe,
} from "./recipeScaling";
import type { Recipe } from "@/types/recipe";

describe("computeScaledCoefficient", () => {
  it("returns target/base for valid inputs", () => {
    expect(computeScaledCoefficient(1000, 500)).toBe(0.5);
    expect(computeScaledCoefficient(500, 1000)).toBe(2);
    expect(computeScaledCoefficient(1000, 1000)).toBe(1);
  });

  it("returns 0 when baseYield is 0", () => {
    expect(computeScaledCoefficient(0, 500)).toBe(0);
  });

  it("returns 0 when targetYield is 0", () => {
    expect(computeScaledCoefficient(1000, 0)).toBe(0);
  });

  it("returns 0 for non-finite inputs", () => {
    expect(computeScaledCoefficient(NaN, 500)).toBe(0);
    expect(computeScaledCoefficient(1000, NaN)).toBe(0);
    expect(computeScaledCoefficient(Infinity, 500)).toBe(0);
    expect(computeScaledCoefficient(1000, Infinity)).toBe(0);
  });
});

describe("scaleIngredientAmount", () => {
  it("scales and rounds correctly", () => {
    expect(scaleIngredientAmount(1000, 500, 200)).toBe(100);
    expect(scaleIngredientAmount(1000, 1000, 150)).toBe(150);
  });

  it("returns 0 for invalid base", () => {
    expect(scaleIngredientAmount(0, 500, 200)).toBe(0);
  });
});

describe("buildScaledRecipe", () => {
  const recipe: Recipe = {
    id: "r1",
    name: "Test Cake",
    category: "Dorty",
    baseYield: 1000,
    yieldUnit: "g",
    components: [
      {
        id: "c1",
        name: "Těsto",
        ingredients: [
          { name: "Mouka", baseAmount: 200, unit: "g" },
          { name: "Cukr", baseAmount: 100, unit: "g" },
        ],
      },
    ],
  };

  it("scales ingredients by coefficient", () => {
    const scaled = buildScaledRecipe(recipe, 2);
    expect(scaled.components[0].ingredients[0].baseAmount).toBe(400);
    expect(scaled.components[0].ingredients[1].baseAmount).toBe(200);
  });

  it("returns 0 amounts when coefficient is 0", () => {
    const scaled = buildScaledRecipe(recipe, 0);
    expect(scaled.components[0].ingredients[0].baseAmount).toBe(0);
  });

  it("does not mutate the original recipe", () => {
    buildScaledRecipe(recipe, 2);
    expect(recipe.components[0].ingredients[0].baseAmount).toBe(200);
  });

  it("converts small kg amounts to grams", () => {
    const kgRecipe: Recipe = {
      ...recipe,
      components: [
        {
          id: "c2",
          name: "Drobenka",
          ingredients: [{ name: "Máslo", baseAmount: 0.5, unit: "kg" }],
        },
      ],
    };
    // coefficient 0.1 → 0.05 kg → below 0.1 threshold → convert to grams
    const scaled = buildScaledRecipe(kgRecipe, 0.1);
    expect(scaled.components[0].ingredients[0].unit).toBe("g");
    expect(scaled.components[0].ingredients[0].baseAmount).toBe(50);
  });

  it("keeps kg for amounts >= 0.1 kg", () => {
    const kgRecipe: Recipe = {
      ...recipe,
      components: [
        {
          id: "c3",
          name: "Moučník",
          ingredients: [{ name: "Máslo", baseAmount: 1, unit: "kg" }],
        },
      ],
    };
    const scaled = buildScaledRecipe(kgRecipe, 0.5);
    expect(scaled.components[0].ingredients[0].unit).toBe("kg");
    expect(scaled.components[0].ingredients[0].baseAmount).toBe(0.5);
  });

  it("handles empty components array", () => {
    const empty: Recipe = { ...recipe, components: [] };
    const scaled = buildScaledRecipe(empty, 2);
    expect(scaled.components).toHaveLength(0);
  });
});

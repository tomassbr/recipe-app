import type { Component, Ingredient, Recipe } from "./recipe";

/** Ingredient after scaling; baseAmount is the recalculated value. */
export type CalculatedIngredient = Ingredient & {
  /** Optional friendlier line (e.g. grams) when kg is very small. */
  displayAmount?: string;
};

export type CalculatedComponent = Omit<Component, "ingredients"> & {
  ingredients: CalculatedIngredient[];
};

export type CalculatedRecipe = Omit<Recipe, "components"> & {
  components: CalculatedComponent[];
};

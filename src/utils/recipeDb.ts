import type {
  Component,
  Ingredient,
  Recipe,
  YieldUnit,
} from "@/types/recipe";
import { isYieldUnit } from "@/types/recipe";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function parseIngredient(raw: unknown, path: string): Ingredient {
  if (!isRecord(raw)) throw new Error(`${path}: ingredient must be object`);
  const { name, baseAmount, unit, note } = raw;
  if (typeof name !== "string") throw new Error(`${path}.name`);
  if (typeof baseAmount !== "number" || !Number.isFinite(baseAmount)) {
    throw new Error(`${path}.baseAmount`);
  }
  if (typeof unit !== "string") throw new Error(`${path}.unit`);
  const ing: Ingredient = { name, baseAmount, unit };
  if (note !== undefined) {
    if (typeof note !== "string") throw new Error(`${path}.note`);
    ing.note = note;
  }
  return ing;
}

function parseComponent(raw: unknown, path: string): Component {
  if (!isRecord(raw)) throw new Error(`${path}: component must be object`);
  const { id, name, ingredients } = raw;
  if (typeof id !== "string") throw new Error(`${path}.id`);
  if (typeof name !== "string") throw new Error(`${path}.name`);
  if (!Array.isArray(ingredients)) throw new Error(`${path}.ingredients`);
  return {
    id,
    name,
    ingredients: ingredients.map((ing, i) =>
      parseIngredient(ing, `${path}.ingredients[${i}]`)
    ),
  };
}

function parseRecipe(raw: unknown, index: number): Recipe {
  const path = `recipes[${index}]`;
  if (!isRecord(raw)) throw new Error(`${path}: must be object`);
  const { id, name, category, baseYield, yieldUnit, note, components } = raw;
  if (typeof id !== "string") throw new Error(`${path}.id`);
  if (typeof name !== "string") throw new Error(`${path}.name`);
  if (typeof category !== "string") throw new Error(`${path}.category`);
  if (typeof baseYield !== "number" || !Number.isFinite(baseYield)) {
    throw new Error(`${path}.baseYield`);
  }
  if (!isYieldUnit(yieldUnit)) throw new Error(`${path}.yieldUnit`);
  if (!Array.isArray(components)) throw new Error(`${path}.components`);

  const recipe: Recipe = {
    id,
    name,
    category,
    baseYield,
    yieldUnit,
    components: components.map((c, i) =>
      parseComponent(c, `${path}.components[${i}]`)
    ),
  };
  if (note !== undefined) {
    if (typeof note !== "string") throw new Error(`${path}.note`);
    recipe.note = note;
  }
  return recipe;
}

/**
 * Runtime validation for `db.json` — fails fast on malformed seed data.
 */
export function parseRecipeDatabase(data: unknown): Recipe[] {
  if (!Array.isArray(data)) throw new Error("db.json root must be an array");
  return data.map((r, i) => parseRecipe(r, i));
}

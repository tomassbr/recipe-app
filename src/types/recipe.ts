/** Units allowed on recipe yield (matches db.json). */
export const YIELD_UNITS = ["g", "kg", "ks"] as const;
export type YieldUnit = (typeof YIELD_UNITS)[number];

export function isYieldUnit(value: unknown): value is YieldUnit {
  return typeof value === "string" && YIELD_UNITS.includes(value as YieldUnit);
}

export interface Ingredient {
  name: string;
  baseAmount: number;
  /** Mass / count unit (e.g. g, kg from db.json) */
  unit: string;
  note?: string;
}

export interface Component {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

/**
 * Single recipe — shape matches `db.json` entries.
 */
export interface Recipe {
  id: string;
  name: string;
  category: string;
  baseYield: number;
  yieldUnit: YieldUnit;
  note?: string;
  components: Component[];
}

/** Root JSON document: array of recipes. */
export type RecipeDatabase = readonly Recipe[];

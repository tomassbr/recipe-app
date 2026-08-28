/** Units allowed on recipe yield (matches db.json). */
export const YIELD_UNITS = ["g", "kg", "ks"] as const;
export type YieldUnit = (typeof YIELD_UNITS)[number];

export function isYieldUnit(value: unknown): value is YieldUnit {
  return typeof value === "string" && YIELD_UNITS.includes(value as YieldUnit);
}

/** Rounding modes for scaled ingredient amounts. */
export const INGREDIENT_ROUNDINGS = ["default", "exact"] as const;
export type IngredientRounding = (typeof INGREDIENT_ROUNDINGS)[number];

export function isIngredientRounding(
  value: unknown
): value is IngredientRounding {
  return (
    typeof value === "string" &&
    INGREDIENT_ROUNDINGS.includes(value as IngredientRounding)
  );
}

export interface Ingredient {
  name: string;
  baseAmount: number;
  /** Mass / count unit (e.g. g, kg from db.json) */
  unit: string;
  note?: string;
  /**
   * "exact" = round to 2 decimals (pectin, agar, gelatin, vanilla pods…).
   * Omitted/"default" = standard 1-decimal rounding.
   */
  rounding?: IngredientRounding;
}

export interface Component {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

/**
 * Druh výrobku z jedné dávky (např. věneček 30 g, větrník 37,5 g těsta).
 * Umožňuje zadat cílové množství počtem kusů místo gramů.
 */
export interface PieceOption {
  name: string;
  /** Gramy těsta / hmoty na 1 kus. */
  grams: number;
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
  /** Volitelné zadání cílového množství po kusech (jen pro yieldUnit "g"). */
  pieceOptions?: PieceOption[];
}

/** Root JSON document: array of recipes. */
export type RecipeDatabase = readonly Recipe[];

import type { CalculatedIngredient } from "@/types/calculatedRecipe";
import {
  formatBatchTotalAmountDisplay,
  roundBatchTotalAmount,
} from "@/utils/recipeAmount";

function normalizeUnit(unit: string): string {
  return unit.trim().toLowerCase();
}

function isMassUnit(unit: string): boolean {
  const u = normalizeUnit(unit);
  return u === "g" || u === "kg" || u === "mg";
}

function isCountUnit(unit: string): boolean {
  const u = normalizeUnit(unit);
  return u === "ks" || u === "pc" || u === "pcs" || u === "k";
}

function isVolumeUnit(unit: string): boolean {
  const u = normalizeUnit(unit);
  return u === "ml" || u === "l" || u === "lit";
}

/** Převod na gramy pro součet hmotnostních surovin (přepočítané hodnoty). */
function amountToGrams(amount: number, unit: string): number {
  const u = normalizeUnit(unit);
  if (u === "g") return amount;
  if (u === "kg") return amount * 1000;
  if (u === "mg") return amount / 1000;
  return NaN;
}

function amountToMilliliters(amount: number, unit: string): number {
  const u = normalizeUnit(unit);
  if (u === "ml") return amount;
  if (u === "l" || u === "lit") return amount * 1000;
  return NaN;
}

export type ComponentBatchTotalsSummary = {
  /** Řetězec pro zobrazení, např. `1 234 g + 2 ks` nebo `—` */
  displayLine: string;
};

/**
 * Součet přepočítaných množství v rámci jedné komponenty.
 * Hmotnosti se sčítají v gramech; ks/objemy zvlášť; ostatní jednotky jako samostatné části.
 */
export function summarizeComponentBatchTotals(
  ingredients: CalculatedIngredient[]
): ComponentBatchTotalsSummary {
  let grams = 0;
  let hasMass = false;
  const countByUnit = new Map<string, number>();
  let mlTotal = 0;
  let hasVolume = false;
  const otherParts: string[] = [];

  for (const ing of ingredients) {
    const a = ing.baseAmount;
    const u = ing.unit;
    if (!Number.isFinite(a)) continue;

    if (isMassUnit(u)) {
      const g = amountToGrams(a, u);
      if (Number.isFinite(g)) {
        grams += g;
        hasMass = true;
      }
    } else if (isCountUnit(u)) {
      const key = normalizeUnit(u);
      countByUnit.set(key, (countByUnit.get(key) ?? 0) + a);
    } else if (isVolumeUnit(u)) {
      const ml = amountToMilliliters(a, u);
      if (Number.isFinite(ml)) {
        mlTotal += ml;
        hasVolume = true;
      }
    } else {
      otherParts.push(`${formatBatchTotalAmountDisplay(a)} ${u}`);
    }
  }

  const parts: string[] = [];

  if (hasMass) {
    const totalG = roundBatchTotalAmount(grams);
    if (totalG >= 1000) {
      const kg = roundBatchTotalAmount(totalG / 1000);
      parts.push(`${formatBatchTotalAmountDisplay(kg)} kg`);
    } else {
      parts.push(`${formatBatchTotalAmountDisplay(totalG)} g`);
    }
  }

  if (hasVolume) {
    const ml = roundBatchTotalAmount(mlTotal);
    if (ml >= 1000) {
      const l = roundBatchTotalAmount(ml / 1000);
      parts.push(`${formatBatchTotalAmountDisplay(l)} l`);
    } else {
      parts.push(`${formatBatchTotalAmountDisplay(ml)} ml`);
    }
  }

  for (const [unit, sum] of Array.from(countByUnit.entries()).sort(([a], [b]) =>
    a.localeCompare(b, "cs")
  )) {
    parts.push(`${formatBatchTotalAmountDisplay(sum)} ${unit}`);
  }

  parts.push(...otherParts);

  const displayLine = parts.length > 0 ? parts.join(" + ") : "—";

  return { displayLine };
}

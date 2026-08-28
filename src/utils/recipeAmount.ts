/**
 * Výchozí zaokrouhlení přepočtených množství — váha měří jen celé gramy:
 * g/ks → celá čísla (123,4 → 123; 123,7 → 124), kg → 3 desetinná místa
 * (gramová přesnost, 0,1311 kg → 0,131 kg).
 */
export function roundRecipeAmount(value: number, unit = "g"): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (unit.trim().toLowerCase() === "kg") {
    return Math.round(value * 1000) / 1000;
  }
  return Math.round(value);
}

/**
 * Přesné zaokrouhlení na 2 desetinná místa — pro suroviny s režimem "exact"
 * (pektin, agar, želatina, sůl, vanilkový lusk…). Zabíjí float šum (36.799999… → 36.8).
 */
export function roundExactAmount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}

/**
 * Zobrazení: celá čísla bez desetinné části; jinak max 3 desetinná místa
 * bez koncových nul (kg množství, koeficient).
 */
export function formatScaledAmountDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return String(Math.round(value * 1000) / 1000);
}

/**
 * Zobrazení přesných množství: max 2 desetinná místa, bez koncových nul
 * (0.5 → "0.5", 36.8 → "36.8", 2 → "2", 1.254 → "1.25").
 */
export function formatExactAmountDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return String(roundExactAmount(value));
}

/**
 * Dispatcher podle režimu zaokrouhlení suroviny.
 */
export function formatIngredientAmountDisplay(
  value: number,
  rounding?: "default" | "exact"
): string {
  return rounding === "exact"
    ? formatExactAmountDisplay(value)
    : formatScaledAmountDisplay(value);
}

/** Zaokrouhlení pro součty v komponentách (2 desetinná místa — součet celých gramů a přesných položek). */
export function roundBatchTotalAmount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}

/**
 * Zobrazení čísel v součtu komponent: bez koncových nul, u celých čísel bez desetinné části.
 */
export function formatBatchTotalAmountDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return String(roundBatchTotalAmount(value));
}

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
 * Přesné zaokrouhlení na 1 desetinné místo — pro suroviny s režimem "exact"
 * (pektin, agar, želatina, sůl, vanilkový lusk…). Odpovídá tabulkám (0,67 → 0,7).
 */
export function roundExactAmount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 10) / 10;
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
 * Zobrazení přesných množství: max 1 desetinné místo, bez koncových nul
 * (0.5 → "0.5", 36.8 → "36.8", 2 → "2", 1.254 → "1.3").
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

/**
 * Zobrazení množství suroviny včetně jednotky. Přesné gramové položky pod 1 g
 * se zobrazí jako celý gram s reálnou hodnotou v závorce: 0.67 → "1 g (0.7 g)".
 */
export function formatIngredientAmountWithUnit(
  value: number,
  unit: string,
  rounding?: "default" | "exact"
): string {
  if (
    rounding === "exact" &&
    Number.isFinite(value) &&
    unit.trim().toLowerCase() === "g"
  ) {
    const exact = roundExactAmount(value);
    if (exact > 0 && exact < 1) {
      return `1 ${unit} (${exact} ${unit})`;
    }
  }
  return `${formatIngredientAmountDisplay(value, rounding)} ${unit}`;
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

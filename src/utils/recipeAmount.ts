/**
 * Numerické zaokrouhlení přepočtených množství na 1 desetinné místo.
 */
export function roundRecipeAmount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 10) / 10;
}

/**
 * Přesné zaokrouhlení na 2 desetinná místa — pro suroviny s režimem "exact"
 * (pektin, agar, želatina, vanilkový lusk…). Zabíjí float šum (36.799999… → 36.8).
 */
export function roundExactAmount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}

/**
 * Zobrazení: celá čísla bez desetinné části; jinak jedno desetinné místo.
 */
export function formatScaledAmountDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const r = roundRecipeAmount(value);
  if (r % 1 === 0) {
    return String(r);
  }
  return r.toFixed(1);
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

/** Zaokrouhlení pro součty v komponentách (stejně 1 desetinné místo). */
export function roundBatchTotalAmount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 10) / 10;
}

/**
 * Zobrazení čísel v součtu komponent: jedno desetinné místo, u celých čísel bez desetinné části.
 */
export function formatBatchTotalAmountDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const r = roundBatchTotalAmount(value);
  if (r % 1 === 0) {
    return String(r);
  }
  return r.toFixed(1);
}

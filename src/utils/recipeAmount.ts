/**
 * Numeric rounding for scaled recipe amounts (max 2 decimal places).
 */
export function roundRecipeAmount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}

/**
 * Display: whole numbers without fraction digits; decimals up to 2 places.
 */
export function formatScaledAmountDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const r = roundRecipeAmount(value);
  if (r % 1 === 0) {
    return String(r);
  }
  return r.toFixed(2);
}

/** Zaokrouhlení pro řádky součtu komponent (3 desetinná místa). */
export function roundBatchTotalAmount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 1000) / 1000;
}

/**
 * Zobrazení čísel v součtu komponent: max. 3 desetinná místa, u celých čísel bez desetinné části.
 */
export function formatBatchTotalAmountDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const r = roundBatchTotalAmount(value);
  if (r % 1 === 0) {
    return String(r);
  }
  return r
    .toFixed(3)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}

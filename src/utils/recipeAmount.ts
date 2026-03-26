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

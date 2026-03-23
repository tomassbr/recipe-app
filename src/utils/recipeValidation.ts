import type { Recipe } from "@/types/recipe";

export type ValidationResult = { ok: true } | { ok: false; message: string };

export function validateRecipe(recipe: Recipe): ValidationResult {
  if (!recipe.name?.trim()) {
    return { ok: false, message: "Zadejte název receptu." };
  }
  if (!recipe.category?.trim()) {
    return { ok: false, message: "Zadejte kategorii." };
  }
  if (!Number.isFinite(recipe.baseYield) || recipe.baseYield <= 0) {
    return { ok: false, message: "Základní výstup musí být kladné číslo." };
  }
  if (!recipe.components?.length) {
    return { ok: false, message: "Přidejte alespoň jednu komponentu." };
  }
  for (const comp of recipe.components) {
    if (!comp.name?.trim()) {
      return { ok: false, message: "Každá komponenta musí mít název." };
    }
    if (!comp.ingredients?.length) {
      return {
        ok: false,
        message: `Komponenta „${comp.name}“ musí mít alespoň jednu surovinu.`,
      };
    }
    for (const ing of comp.ingredients) {
      if (!ing.name?.trim()) {
        return { ok: false, message: "Každá surovina musí mít název." };
      }
      if (!Number.isFinite(ing.baseAmount) || ing.baseAmount <= 0) {
        return {
          ok: false,
          message: `Množství suroviny „${ing.name}“ musí být kladné číslo.`,
        };
      }
      if (!ing.unit?.trim()) {
        return { ok: false, message: `Zadejte jednotku u „${ing.name}“.` };
      }
    }
  }
  return { ok: true };
}

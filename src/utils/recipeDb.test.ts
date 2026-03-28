import { describe, expect, it } from "vitest";
import { parseRecipeDatabase } from "./recipeDb";

const validRecipe = {
  id: "r1",
  name: "Croissant",
  category: "Pečivo",
  baseYield: 1000,
  yieldUnit: "g",
  components: [
    {
      id: "c1",
      name: "Těsto",
      ingredients: [
        { name: "Mouka", baseAmount: 500, unit: "g" },
        { name: "Máslo", baseAmount: 0.25, unit: "kg", note: "studené" },
      ],
    },
  ],
};

describe("parseRecipeDatabase", () => {
  it("parses a valid recipe array", () => {
    const result = parseRecipeDatabase([validRecipe]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Croissant");
    expect(result[0].components[0].ingredients[1].note).toBe("studené");
  });

  it("throws when root is not an array", () => {
    expect(() => parseRecipeDatabase({})).toThrow("root must be an array");
    expect(() => parseRecipeDatabase(null)).toThrow("root must be an array");
    expect(() => parseRecipeDatabase("string")).toThrow("root must be an array");
  });

  it("throws when recipe is missing name", () => {
    const bad = { ...validRecipe, name: undefined };
    expect(() => parseRecipeDatabase([bad])).toThrow("recipes[0].name");
  });

  it("throws when recipe is missing id", () => {
    const bad = { ...validRecipe, id: 123 };
    expect(() => parseRecipeDatabase([bad])).toThrow("recipes[0].id");
  });

  it("throws when yieldUnit is invalid", () => {
    const bad = { ...validRecipe, yieldUnit: "ml" };
    expect(() => parseRecipeDatabase([bad])).toThrow("recipes[0].yieldUnit");
  });

  it("accepts all valid yieldUnits", () => {
    for (const unit of ["g", "kg", "ks"]) {
      const r = { ...validRecipe, yieldUnit: unit };
      expect(() => parseRecipeDatabase([r])).not.toThrow();
    }
  });

  it("throws when baseYield is not a finite number", () => {
    expect(() =>
      parseRecipeDatabase([{ ...validRecipe, baseYield: "1000" }])
    ).toThrow("recipes[0].baseYield");
    expect(() =>
      parseRecipeDatabase([{ ...validRecipe, baseYield: NaN }])
    ).toThrow("recipes[0].baseYield");
  });

  it("throws when components is not an array", () => {
    const bad = { ...validRecipe, components: "bad" };
    expect(() => parseRecipeDatabase([bad])).toThrow("recipes[0].components");
  });

  it("throws when ingredient baseAmount is a string", () => {
    const bad = {
      ...validRecipe,
      components: [
        {
          ...validRecipe.components[0],
          ingredients: [{ name: "Mouka", baseAmount: "500g", unit: "g" }],
        },
      ],
    };
    expect(() => parseRecipeDatabase([bad])).toThrow("baseAmount");
  });

  it("throws when ingredient is missing name", () => {
    const bad = {
      ...validRecipe,
      components: [
        {
          ...validRecipe.components[0],
          ingredients: [{ baseAmount: 500, unit: "g" }],
        },
      ],
    };
    expect(() => parseRecipeDatabase([bad])).toThrow("name");
  });

  it("accepts recipe without optional note", () => {
    const noNote = { ...validRecipe };
    delete (noNote as Record<string, unknown>).note;
    const result = parseRecipeDatabase([noNote]);
    expect(result[0].note).toBeUndefined();
  });

  it("throws when note is not a string", () => {
    const bad = { ...validRecipe, note: 42 };
    expect(() => parseRecipeDatabase([bad])).toThrow("recipes[0].note");
  });

  it("parses multiple recipes correctly", () => {
    const r2 = { ...validRecipe, id: "r2", name: "Bagel" };
    const result = parseRecipeDatabase([validRecipe, r2]);
    expect(result).toHaveLength(2);
    expect(result[1].name).toBe("Bagel");
  });

  it("returns empty array for empty input", () => {
    expect(parseRecipeDatabase([])).toEqual([]);
  });
});

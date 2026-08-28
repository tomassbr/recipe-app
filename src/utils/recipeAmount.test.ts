import { describe, expect, it } from "vitest";
import {
  roundRecipeAmount,
  roundExactAmount,
  formatScaledAmountDisplay,
  formatExactAmountDisplay,
  formatIngredientAmountDisplay,
  roundBatchTotalAmount,
  formatBatchTotalAmountDisplay,
} from "./recipeAmount";

describe("roundRecipeAmount", () => {
  it("rounds grams to whole numbers (half up)", () => {
    expect(roundRecipeAmount(123.4)).toBe(123);
    expect(roundRecipeAmount(123.5)).toBe(124);
    expect(roundRecipeAmount(123.7)).toBe(124);
    expect(roundRecipeAmount(100)).toBe(100);
    expect(roundRecipeAmount(0.4)).toBe(0);
  });

  it("rounds kg to gram precision (3 decimals)", () => {
    expect(roundRecipeAmount(0.1305, "kg")).toBe(0.131);
    expect(roundRecipeAmount(1.6234, "kg")).toBe(1.623);
    expect(roundRecipeAmount(0.5, "kg")).toBe(0.5);
  });

  it("rounds ks to whole numbers", () => {
    expect(roundRecipeAmount(1.4, "ks")).toBe(1);
    expect(roundRecipeAmount(1.5, "ks")).toBe(2);
  });

  it("returns 0 for non-finite values", () => {
    expect(roundRecipeAmount(Infinity)).toBe(0);
    expect(roundRecipeAmount(-Infinity)).toBe(0);
    expect(roundRecipeAmount(NaN)).toBe(0);
  });

  it("handles zero", () => {
    expect(roundRecipeAmount(0)).toBe(0);
  });
});

describe("formatScaledAmountDisplay", () => {
  it("shows integers without decimal", () => {
    expect(formatScaledAmountDisplay(100)).toBe("100");
    expect(formatScaledAmountDisplay(0)).toBe("0");
    expect(formatScaledAmountDisplay(1.0)).toBe("1");
  });

  it("shows up to 3 decimals without trailing zeros (kg amounts, coefficients)", () => {
    expect(formatScaledAmountDisplay(1.5)).toBe("1.5");
    expect(formatScaledAmountDisplay(12.3)).toBe("12.3");
    expect(formatScaledAmountDisplay(0.131)).toBe("0.131");
    expect(formatScaledAmountDisplay(0.1625)).toBe("0.163");
  });

  it("returns — for non-finite values", () => {
    expect(formatScaledAmountDisplay(Infinity)).toBe("—");
    expect(formatScaledAmountDisplay(-Infinity)).toBe("—");
    expect(formatScaledAmountDisplay(NaN)).toBe("—");
  });
});

describe("roundExactAmount", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundExactAmount(1.254)).toBe(1.25);
    expect(roundExactAmount(1.256)).toBe(1.26);
    expect(roundExactAmount(0.5)).toBe(0.5);
  });

  it("kills float noise", () => {
    expect(roundExactAmount(36.799999999999997)).toBe(36.8);
  });

  it("returns 0 for non-finite values", () => {
    expect(roundExactAmount(NaN)).toBe(0);
    expect(roundExactAmount(Infinity)).toBe(0);
  });
});

describe("formatExactAmountDisplay", () => {
  it("keeps fractions without trailing zeros", () => {
    expect(formatExactAmountDisplay(0.5)).toBe("0.5");
    expect(formatExactAmountDisplay(36.8)).toBe("36.8");
    expect(formatExactAmountDisplay(1.254)).toBe("1.25");
  });

  it("shows integers without decimal", () => {
    expect(formatExactAmountDisplay(2)).toBe("2");
  });

  it("returns — for non-finite values", () => {
    expect(formatExactAmountDisplay(NaN)).toBe("—");
  });
});

describe("formatIngredientAmountDisplay", () => {
  it("dispatches by rounding mode", () => {
    expect(formatIngredientAmountDisplay(1.254, "exact")).toBe("1.25");
    expect(formatIngredientAmountDisplay(1.5, "default")).toBe("1.5");
    expect(formatIngredientAmountDisplay(123, "default")).toBe("123");
  });
});

describe("roundBatchTotalAmount", () => {
  it("rounds to 2 decimal places (sums of whole grams + exact 2-decimal items)", () => {
    expect(roundBatchTotalAmount(250.554)).toBe(250.55);
    expect(roundBatchTotalAmount(250.556)).toBe(250.56);
    expect(roundBatchTotalAmount(0)).toBe(0);
  });

  it("returns 0 for non-finite values", () => {
    expect(roundBatchTotalAmount(NaN)).toBe(0);
    expect(roundBatchTotalAmount(Infinity)).toBe(0);
  });
});

describe("formatBatchTotalAmountDisplay", () => {
  it("shows integers without decimal", () => {
    expect(formatBatchTotalAmountDisplay(500)).toBe("500");
  });

  it("shows decimals without trailing zeros", () => {
    expect(formatBatchTotalAmountDisplay(500.5)).toBe("500.5");
    expect(formatBatchTotalAmountDisplay(500.35)).toBe("500.35");
  });

  it("returns — for non-finite values", () => {
    expect(formatBatchTotalAmountDisplay(NaN)).toBe("—");
    expect(formatBatchTotalAmountDisplay(Infinity)).toBe("—");
  });
});

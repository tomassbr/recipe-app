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
  it("rounds to 1 decimal place", () => {
    expect(roundRecipeAmount(1.25)).toBe(1.3);
    expect(roundRecipeAmount(1.24)).toBe(1.2);
    expect(roundRecipeAmount(100)).toBe(100);
    expect(roundRecipeAmount(0.05)).toBe(0.1);
  });

  it("returns 0 for non-finite values", () => {
    expect(roundRecipeAmount(Infinity)).toBe(0);
    expect(roundRecipeAmount(-Infinity)).toBe(0);
    expect(roundRecipeAmount(NaN)).toBe(0);
  });

  it("handles negatives", () => {
    expect(roundRecipeAmount(-1.25)).toBe(-1.2);
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

  it("shows 1 decimal place for non-integers", () => {
    expect(formatScaledAmountDisplay(1.5)).toBe("1.5");
    expect(formatScaledAmountDisplay(12.3)).toBe("12.3");
  });

  it("returns — for non-finite values", () => {
    expect(formatScaledAmountDisplay(Infinity)).toBe("—");
    expect(formatScaledAmountDisplay(-Infinity)).toBe("—");
    expect(formatScaledAmountDisplay(NaN)).toBe("—");
  });

  it("rounds before formatting", () => {
    // 1.25 rounds to 1.3
    expect(formatScaledAmountDisplay(1.25)).toBe("1.3");
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
    expect(formatIngredientAmountDisplay(1.25, "exact")).toBe("1.25");
    expect(formatIngredientAmountDisplay(1.25, "default")).toBe("1.3");
    expect(formatIngredientAmountDisplay(1.25)).toBe("1.3");
  });
});

describe("roundBatchTotalAmount", () => {
  it("rounds to 1 decimal place", () => {
    expect(roundBatchTotalAmount(250.55)).toBe(250.6);
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

  it("shows 1 decimal for non-integers", () => {
    expect(formatBatchTotalAmountDisplay(500.5)).toBe("500.5");
  });

  it("returns — for non-finite values", () => {
    expect(formatBatchTotalAmountDisplay(NaN)).toBe("—");
    expect(formatBatchTotalAmountDisplay(Infinity)).toBe("—");
  });
});

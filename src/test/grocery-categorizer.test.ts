import { describe, expect, it } from "vitest";
import {
  categorizeGroceryItem,
  combineQuantities,
  consolidateIngredients,
  DEFAULT_SHOPPING_CATEGORIES,
  normalizeAisleOrder,
} from "@/lib/grocery-categorizer";

describe("grocery categorizer & quantity consolidation", () => {
  it("exposes all 10 standard supermarket categories", () => {
    expect(DEFAULT_SHOPPING_CATEGORIES).toHaveLength(10);
    expect(DEFAULT_SHOPPING_CATEGORIES).toContain("Household and cleaning");
    expect(DEFAULT_SHOPPING_CATEGORIES).toContain("Personal care");
    expect(DEFAULT_SHOPPING_CATEGORIES).toContain("Fruits and vegetables");
  });

  it("prevents classic supermarket misclassifications", () => {
    expect(categorizeGroceryItem("dishwasher tablets")).toBe("Household and cleaning");
    expect(categorizeGroceryItem("dishwasher tablets", { explicitCategory: "Personal care" })).toBe(
      "Household and cleaning",
    );

    expect(categorizeGroceryItem("chocolate biscuits")).toBe("Snacks");
    expect(categorizeGroceryItem("biscuits", { explicitCategory: "Frozen foods" })).toBe("Snacks");

    expect(categorizeGroceryItem("toothpaste")).toBe("Personal care");
    expect(categorizeGroceryItem("frozen peas")).toBe("Frozen foods");
    expect(categorizeGroceryItem("chicken breast")).toBe("Meat and seafood");
    expect(categorizeGroceryItem("whole milk")).toBe("Dairy and eggs");
    expect(categorizeGroceryItem("sourdough bread")).toBe("Bakery");
    expect(categorizeGroceryItem("rooibos tea")).toBe("Beverages");
    expect(categorizeGroceryItem("fresh spinach")).toBe("Fruits and vegetables");
  });

  it("respects user category overrides reliably", () => {
    expect(
      categorizeGroceryItem("sourdough bread", {
        overrides: { "sourdough bread": "Frozen foods" },
      }),
    ).toBe("Frozen foods");
  });

  it("combines metric, count, and unparseable quantities accurately", () => {
    expect(combineQuantities("500g", "0.5kg")).toBe("1kg");
    expect(combineQuantities("250 ml", "750ml")).toBe("1l");
    expect(combineQuantities("2", "1")).toBe("3");
    expect(combineQuantities("1 bunch", "1 bunch")).toBe("1 bunch (×2)");
    expect(combineQuantities("1 jar", "200g")).toBe("1 jar + 200g");
  });

  it("consolidates duplicate ingredients across recipes and preserves overrides", () => {
    const result = consolidateIngredients(
      [
        { name: "Onions", quantity: "2" },
        { name: "onion", quantity: "1" },
        { name: "Chicken breast", quantity: "500g" },
        { name: "chicken breast", quantity: "0.5kg" },
      ],
      { overrides: { onion: "Pantry and dry goods" } },
    );

    expect(result).toHaveLength(2);
    expect(result[0]?.quantity).toBe("3");
    expect(result[0]?.category).toBe("Pantry and dry goods");
    expect(result[1]?.quantity).toBe("1kg");
    expect(result[1]?.category).toBe("Meat and seafood");
  });

  it("normalizes aisle order cleanly without losing missing categories", () => {
    const order = normalizeAisleOrder(["Bakery", "Snacks"]);
    expect(order[0]).toBe("Bakery");
    expect(order[1]).toBe("Snacks");
    expect(order).toHaveLength(DEFAULT_SHOPPING_CATEGORIES.length);
  });
});

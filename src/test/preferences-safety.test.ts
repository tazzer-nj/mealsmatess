import { describe, expect, it } from "vitest";
import { EMPTY_PREFERENCES, evaluateRecipeAllergens } from "@/lib/preferences";
import { daysUntilExpiry, getExpiryStatus, matchRecipeToPantry } from "@/lib/pantry-matcher";

describe("safety-critical allergen detection & pantry matching", () => {
  it("flags hidden peanut synonyms such as groundnut oil and satay", () => {
    const prefs = { ...EMPTY_PREFERENCES, allergies: ["Peanuts"] };
    const satayCheck = evaluateRecipeAllergens(prefs, {
      name: "Chicken Skewers",
      description: "Grilled chicken",
      ingredients: [{ name: "chicken" }, { name: "satay marinade" }],
    });

    expect(satayCheck.safe).toBe(false);
    expect(satayCheck.matchedAllergens).toContain("Peanuts");
    expect(satayCheck.warningSummary).toMatch(/Peanuts/i);
  });

  it("flags compound ingredients with verification warning when direct allergen is absent", () => {
    const prefs = { ...EMPTY_PREFERENCES, allergies: ["Soy"] };
    const result = evaluateRecipeAllergens(prefs, {
      name: "Glazed Vegetables",
      ingredients: [{ name: "broccoli" }, { name: "house marinade" }],
    });

    expect(result.safe).toBe(true);
    expect(result.matchedAllergens).toHaveLength(0);
    expect(result.uncertainIngredients).toContain("house marinade");
    expect(result.warningSummary).toMatch(/Check labels carefully/i);
  });

  it("matches recipe ingredients accurately against pantry inventory", () => {
    const match = matchRecipeToPantry(
      {
        ingredients: [
          { name: "Onions" },
          { name: "Garlic" },
          { name: "Olive oil" },
          { name: "Halloumi" },
        ],
      },
      ["onion", "olive oil"],
    );

    expect(match.totalIngredients).toBe(4);
    expect(match.matchedCount).toBe(2);
    expect(match.matchRatio).toBe(0.5);
    expect(match.missingIngredients).toEqual(["Garlic", "Halloumi"]);
  });

  it("evaluates pantry expiry status reliably", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(daysUntilExpiry(today)).toBe(0);
    expect(getExpiryStatus(today).status).toBe("expiring");

    const expiredDate = new Date(Date.now() - 2 * 86_400_000).toISOString().slice(0, 10);
    expect(getExpiryStatus(expiredDate).status).toBe("expired");

    const freshDate = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
    expect(getExpiryStatus(freshDate).status).toBe("fresh");
  });
});

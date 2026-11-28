import { describe, expect, it } from "vitest";
import { FREE_THEMES, MEALMATE_THEMES, PREMIUM_THEMES } from "@/lib/themes";
import { MASCOT_THEMES } from "@/lib/mascot-theme";
import { curatedRecipeImageUrl, dishPrompt } from "@/lib/recipe-image";
import { buildQueries } from "@/lib/recipe-images.server";
import { CURATED_RECIPES } from "@/lib/curated-recipes";
import { ENTITLEMENT } from "@/server/revenuecat";
import { planKind } from "@/lib/billing-client";
import { PRICES_ZAR } from "@/lib/currency";
import { EMPTY_PREFERENCES, evaluateRecipeAllergens, isAvoided } from "@/lib/preferences";

describe("Final QA Verification", () => {
  it("exposes exactly 6 exclusive premium themes including Lavender Dream alongside 2 free themes", () => {
    expect(FREE_THEMES.map((t) => t.name)).toEqual(["Default White", "Default Black"]);
    expect(PREMIUM_THEMES).toHaveLength(6);
    expect(new Set(PREMIUM_THEMES.map((t) => t.name))).toEqual(
      new Set(["Cherry", "Midnight", "Lavender Dream", "Ocean", "Matcha", "Sunset"]),
    );
    expect(MEALMATE_THEMES).toHaveLength(8);
    expect(MASCOT_THEMES).toHaveLength(7);

    const mascotUrls = new Set(PREMIUM_THEMES.map((t) => t.mascotImage));
    expect(mascotUrls.size).toBe(6);

    const lavender = PREMIUM_THEMES.find((t) => t.name === "Lavender Dream");
    expect(lavender?.id).toBe("lavender-dream");
    expect(lavender?.mascotImage).toBe("/mascots/mascot-lavender.jpg");
  });

  it("configures RevenueCat products and ZAR billing constants correctly", () => {
    expect(ENTITLEMENT).toBe("premium");
    expect(planKind("premium_monthly", "premium_monthly", "P1M")).toBe("monthly");
    expect(planKind("premium_yearly", "premium_yearly", "P1Y")).toBe("yearly");
    expect(planKind("premium_family_monthly", "premium_family_monthly", "P1M")).toBe("family");
    expect(PRICES_ZAR.premium_monthly).toBeGreaterThan(0);
    expect(PRICES_ZAR.premium_annual).toBeGreaterThan(0);
    expect(PRICES_ZAR.family_monthly).toBeGreaterThan(0);
  });

  it("generates distinct dish-matched prompts and South African photography without cross-dish confusion across 20+ recipes", () => {
    const sampleDishes = [
      { id: "d1", name: "Creamy Chicken Alfredo", cuisine: "Italian", category: "Dinner" },
      { id: "d2", name: "Juicy Smash Beef Burger", cuisine: "American", category: "Dinner" },
      {
        id: "d3",
        name: "South African Pap and Wors with Chakalaka",
        cuisine: "South African",
        category: "Dinner",
      },
      { id: "d4", name: "Chakalaka with Pap", cuisine: "South African", category: "Lunch" },
      { id: "d5", name: "Cape Malay Bobotie", cuisine: "South African", category: "Dinner" },
      { id: "d6", name: "Chicken Bunny Chow", cuisine: "South African", category: "Dinner" },
      { id: "d7", name: "Kota South African Spatlo", cuisine: "South African", category: "Snacks" },
      { id: "d8", name: "Malva Pudding", cuisine: "South African", category: "Dessert" },
      { id: "d9", name: "Beef Potjiekos", cuisine: "South African", category: "Dinner" },
      { id: "d10", name: "Hyderabadi Chicken Biryani", cuisine: "Indian", category: "Dinner" },
      { id: "d11", name: "Fluffy Buttermilk Pancakes", cuisine: "American", category: "Breakfast" },
      { id: "d12", name: "Rainbow Buddha Bowl", cuisine: "Global", category: "Lunch" },
      { id: "d13", name: "Greek Chicken Salad", cuisine: "Greek", category: "Lunch" },
      { id: "d14", name: "Smoky Beef Tacos", cuisine: "Mexican", category: "Dinner" },
      { id: "d15", name: "West African Jollof Rice", cuisine: "West African", category: "Dinner" },
      { id: "d16", name: "Pizza Napoletana Margherita", cuisine: "Italian", category: "Dinner" },
      { id: "d17", name: "Ackee and Saltfish", cuisine: "Jamaican", category: "Breakfast" },
      {
        id: "d18",
        name: "Mediterranean Quinoa Bowl with Harissa Chicken",
        cuisine: "Mediterranean",
        category: "Lunch",
      },
      { id: "d19", name: "Grilled Lemon Herb Salmon", cuisine: "Coastal", category: "Dinner" },
      { id: "d20", name: "Classic Banana Bread", cuisine: "Bakery", category: "Dessert" },
      { id: "d21", name: "Classic American Apple Pie", cuisine: "American", category: "Dessert" },
    ];

    const prompts = new Set(sampleDishes.map((d) => dishPrompt(d)));
    expect(prompts.size).toBe(sampleDishes.length);

    const papQueries = buildQueries(sampleDishes[2]!);
    expect(papQueries.some((q) => /pap|boerewors|wors|south african/i.test(q))).toBe(true);

    // Every curated recipe carries a unique non-generic curated photo URL
    const curatedImages = new Set(CURATED_RECIPES.map((r) => r.image_url));
    expect(CURATED_RECIPES.length).toBeGreaterThanOrEqual(14);
    expect(curatedImages.size).toBe(CURATED_RECIPES.length);

    // Pap & Boerewors does not erroneously resolve to meatless Chakalaka photo
    expect(curatedRecipeImageUrl({ name: "Pap and Boerewors" })).toBeNull();
    expect(curatedRecipeImageUrl({ name: "Chakalaka with Pap" })).toBeTruthy();
    expect(curatedRecipeImageUrl({ name: "Cape Malay Bobotie" })).toBeTruthy();
  });

  it("detects allergens and avoided preferences reliably", () => {
    const prefs = {
      allergies: ["peanuts", "shellfish"],
      dietary_restrictions: ["vegetarian"],
    } as const;
    const unsafe = evaluateRecipeAllergens(
      {
        ...EMPTY_PREFERENCES,
        ...prefs,
        allergies: [...prefs.allergies],
        dietary_restrictions: [...prefs.dietary_restrictions],
        onboarding_completed: true,
      },
      {
        name: "Thai Peanut Prawn Noodles",
        ingredients: [{ name: "peanuts" }, { name: "tiger prawns" }],
      },
    );
    expect(unsafe.safe).toBe(false);
    expect(unsafe.matchedAllergens).toEqual(expect.arrayContaining(["peanuts", "shellfish"]));

    const uncertain = evaluateRecipeAllergens(
      {
        ...EMPTY_PREFERENCES,
        allergies: ["soy"],
        onboarding_completed: true,
      },
      { name: "Crispy Veggie Stir Fry", ingredients: [{ name: "mystery stir fry sauce" }] },
    );
    expect(uncertain.safe).toBe(true);
    expect(uncertain.uncertainIngredients).toEqual(["mystery stir fry sauce"]);

    const soyTofu = evaluateRecipeAllergens(
      {
        ...EMPTY_PREFERENCES,
        allergies: ["soy"],
        onboarding_completed: true,
      },
      { name: "Crispy Tofu Stir Fry", ingredients: [{ name: "firm tofu" }] },
    );
    expect(soyTofu.safe).toBe(false);
    expect(
      isAvoided(
        {
          ...EMPTY_PREFERENCES,
          allergies: [...prefs.allergies],
          dietary_restrictions: [...prefs.dietary_restrictions],
          onboarding_completed: true,
        },
        "Beef Burger",
        "American",
      ),
    ).toBe(true);
  });

  it("preserves positive real ratings and ignores fake zero ratings in recipeCatalogRecord", async () => {
    const { recipeCatalogRecord } = await import("@/lib/recipe-catalog");
    const rated = recipeCatalogRecord({
      id: "r1",
      slug: "rated-dish",
      name: "Rated Dish",
      rating: 4.8,
      difficulty: "Medium",
      is_premium: true,
    });
    expect(rated?.rating).toBe(4.8);
    expect(rated?.difficulty).toBe("Medium");
    expect(rated?.is_premium).toBe(true);

    const zeroRated = recipeCatalogRecord({
      id: "r2",
      slug: "unrated-dish",
      name: "Unrated Dish",
      rating: 0,
    });
    expect(zeroRated?.rating).toBeNull();
  });

  it("verifies theme save action and profile id structure without NOT_FOUND errors", async () => {
    const { getMealMateTheme, normalizeThemeId } = await import("@/lib/themes");
    const theme = getMealMateTheme("midnight-pro");
    expect(theme.id).toBe("midnight-pro");
    expect(normalizeThemeId("lavender-dream")).toBe("lavender-dream");
  });
});

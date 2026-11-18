import { describe, expect, it } from "vitest";
import {
  CURATED_RECIPES,
  findCuratedRecipeById,
  findCuratedRecipeBySlug,
} from "@/lib/curated-recipes";
import { filterRecipeCatalog, mergeRecipeCatalog, recipeCatalogRecord } from "@/lib/recipe-catalog";
import type { CatalogRecipe } from "@/lib/recipe-catalog";

function recipe(values: Record<string, unknown> = {}): CatalogRecipe {
  return recipeCatalogRecord({ id: "r1", name: "Tomato stew", slug: "tomato-stew", ...values })!;
}

describe("recipe catalog search", () => {
  it("finds an ingredient even when it is absent from the dish name", () => {
    const dishes = [
      recipe({ ingredients: [{ name: "chickpeas", quantity: "1 can" }, { name: "spinach" }] }),
    ];
    expect(filterRecipeCatalog(dishes, { search: "CHICKPEAS spinach" })).toEqual(dishes);
    expect(filterRecipeCatalog(dishes, { search: "chickpeas beef" })).toEqual([]);
  });

  it("matches legacy ingredient strings, cuisine, tags, and accented dish names", () => {
    const dish = recipe({
      name: "Crêpes",
      cuisine: "French",
      diet_tags: ["High Protein"],
      ingredients: ["oat milk"],
    });
    for (const search of ["crepes", "French", "high-protein", "oat milk"])
      expect(filterRecipeCatalog([dish], { search })).toEqual([dish]);
  });

  it("matches older recipes before limiting results, even without created_at", () => {
    const older = recipe({ id: "old", name: "Bobotie", ingredients: [{ name: "raisins" }] });
    const catalog = [
      ...Array.from({ length: 120 }, (_, index) =>
        recipe({ id: String(index), created_at: "2026-10-18" }),
      ),
      older,
    ];
    expect(filterRecipeCatalog(catalog, { search: "raisins", limit: 8 })).toEqual([older]);
  });

  it("combines category and text filters and supports home category aliases", () => {
    const healthy = recipe({ diet_tags: ["Healthy"], country: "South Africa" });
    const other = recipe({ name: "Chocolate cake", category: "Dessert" });
    for (const category of [
      "South African Favorites",
      "South African Favourites",
      "South African",
      "Healthy Meals",
    ])
      expect(filterRecipeCatalog([healthy, other], { category, search: "tomato" })).toEqual([
        healthy,
      ]);
    expect(
      filterRecipeCatalog([healthy, other], { category: "Dessert", search: "tomato" }),
    ).toEqual([]);
  });

  it("preserves photographer credit for stored provider photos", () => {
    expect(
      recipe({
        image_attribution: {
          photographer: "Example photographer",
          photographerUrl: "https://example.test/author",
          pageUrl: "https://example.test/photo",
          internal: "omit",
        },
      }).image_attribution,
    ).toEqual({
      photographer: "Example photographer",
      photographerUrl: "https://example.test/author",
      pageUrl: "https://example.test/photo",
    });
  });

  it("retains recipe details and stored image metadata but omits internal fields", () => {
    const row = recipeCatalogRecord({
      id: "r",
      slug: "dish",
      name: "Dish",
      image_url: "https://example.test/dish.png",
      image_source: "AI",
      steps: ["Cook"],
      private_notes: "internal",
      image_signature: "internal-signature",
    });
    expect(row).toMatchObject({
      image_source: "AI",
      image_url: "https://example.test/dish.png",
      steps: ["Cook"],
    });
    expect(row).not.toHaveProperty("private_notes");
    expect(row).not.toHaveProperty("image_signature");
    expect(recipeCatalogRecord({ id: "r", name: "Missing slug" })).toBeNull();
  });

  it("provides a complete curated starter catalog across every discovery category", () => {
    expect(CURATED_RECIPES.length).toBeGreaterThanOrEqual(18);
    const categories = [
      "All",
      "Breakfast",
      "Lunch",
      "Dinner",
      "Dessert",
      "Snacks",
      "Drinks",
      "Vegan",
      "High Protein",
      "Quick",
      "Healthy Meals",
      "South African Favorites",
    ];
    for (const category of categories) {
      expect(filterRecipeCatalog(CURATED_RECIPES, { category }).length).toBeGreaterThan(0);
    }

    for (const item of CURATED_RECIPES) {
      expect(item.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(item.ingredients.length).toBeGreaterThanOrEqual(3);
      expect(item.steps.length).toBeGreaterThanOrEqual(3);
      const serialized = JSON.stringify(item);
      expect(serialized).not.toMatch(/--|–|—/);
    }

    expect(findCuratedRecipeBySlug("cape-malay-bobotie")?.name).toBe("Cape Malay Bobotie");
    expect(findCuratedRecipeById("00000000-0000-4000-8000-000000000001")?.slug).toBe(
      "cape-malay-bobotie",
    );
  });

  it("merges Firestore recipes ahead of curated entries without duplicating slugs or IDs", () => {
    const customBobotie = recipe({
      id: "custom-id",
      slug: "cape-malay-bobotie",
      name: "Custom Bobotie",
    });
    const merged = mergeRecipeCatalog([customBobotie], CURATED_RECIPES);
    expect(merged[0]).toEqual(customBobotie);
    const bobotieMatches = merged.filter((item) => item.slug === "cape-malay-bobotie");
    expect(bobotieMatches).toHaveLength(1);
    expect(merged.length).toBe(CURATED_RECIPES.length);
  });
});

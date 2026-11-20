import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RecipeRecord } from "@/lib/queries";
import {
  buildRecipeGenerationPrompt,
  searchOrGenerateRecipe,
  toastRecipeGenerationError,
} from "@/lib/recipe-search";

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  message: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastMocks.error,
    message: toastMocks.message,
  },
}));

function makeRecipe(overrides: Partial<RecipeRecord> = {}): RecipeRecord {
  return {
    id: "r1",
    slug: "cape-malay-bobotie",
    name: "Cape Malay Bobotie",
    image_url: null,
    cooking_time_minutes: 45,
    calories: 480,
    servings: 4,
    ingredients: [],
    steps: [],
    ...overrides,
  };
}

describe("searchOrGenerateRecipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns catalog matches and loads images without generating when matches exist", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const match = makeRecipe();
    const fetchCatalog = vi.fn().mockResolvedValue([match]);
    const generateFn = vi.fn();
    const loadImagesFn = vi.fn();
    const onGenerating = vi.fn();

    const result = await searchOrGenerateRecipe({
      query: "  bobotie ",
      queryClient,
      fetchCatalog,
      generateFn,
      loadImagesFn,
      onGenerating,
    });

    expect(result).toEqual({ kind: "matches", matches: [match] });
    expect(fetchCatalog).toHaveBeenCalledWith(undefined, "bobotie");
    expect(loadImagesFn).toHaveBeenCalledWith([match], queryClient);
    expect(generateFn).not.toHaveBeenCalled();
    expect(onGenerating).not.toHaveBeenCalled();
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("generates a recipe automatically when search finds no matching recipes", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    const fetchCatalog = vi.fn().mockResolvedValue([]);
    const generateFn = vi.fn().mockResolvedValue({ slug: "garlic-butter-shrimp-abc12" });
    const onGenerating = vi.fn();

    const result = await searchOrGenerateRecipe({
      query: "  garlic butter shrimp  ",
      category: "All",
      queryClient,
      fetchCatalog,
      generateFn,
      onGenerating,
    });

    expect(fetchCatalog).toHaveBeenCalledWith(undefined, "garlic butter shrimp");
    expect(onGenerating).toHaveBeenCalledWith("garlic butter shrimp");
    expect(generateFn).toHaveBeenCalledWith("garlic butter shrimp");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["recipes"] });
    expect(result).toEqual({ kind: "generated", slug: "garlic-butter-shrimp-abc12" });
  });

  it("includes active category in the AI prompt when category is not duplicated", async () => {
    const queryClient = new QueryClient();
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    const generateFn = vi.fn().mockResolvedValue({ slug: "vegan-lasagna-123" });

    expect(buildRecipeGenerationPrompt("lasagna", "Vegan")).toBe("Vegan lasagna");
    expect(buildRecipeGenerationPrompt("vegan lasagna", "Vegan")).toBe("vegan lasagna");

    await searchOrGenerateRecipe({
      query: "lasagna",
      category: "Vegan",
      queryClient,
      fetchCatalog: vi.fn().mockResolvedValue([]),
      generateFn,
    });

    expect(generateFn).toHaveBeenCalledWith("Vegan lasagna");
  });

  it("surfaces clear toast messages for auth, limit, premium, and generic errors", () => {
    toastRecipeGenerationError(new Error("AUTH_REQUIRED"));
    expect(toastMocks.error).toHaveBeenLastCalledWith(
      "Your session expired",
      expect.objectContaining({ description: expect.stringMatching(/sign in/i) }),
    );

    toastRecipeGenerationError(new Error("MEALMATE_LIMIT_AI_DAILY: Try again tomorrow."));
    expect(toastMocks.message).toHaveBeenLastCalledWith("Mia AI allowance reached", {
      description: "Try again tomorrow.",
    });

    toastRecipeGenerationError(new Error("402 Active subscription required"));
    expect(toastMocks.error).toHaveBeenLastCalledWith(
      "Premium required to generate recipes",
      expect.anything(),
    );

    toastRecipeGenerationError(new Error("Gateway timeout"));
    expect(toastMocks.error).toHaveBeenLastCalledWith(
      "Couldn't generate that recipe",
      expect.anything(),
    );
  });
});

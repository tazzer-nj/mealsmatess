import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestRecipeImage } from "@/lib/recipe-image-request.server";
import { RecipeIdSchema } from "@/lib/recipe-id";

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  rpc: vi.fn(),
  rateLimit: vi.fn(),
  generate: vi.fn(),
  findBest: vi.fn(),
  save: vi.fn(),
  providers: vi.fn(() => [] as string[]),
}));
vi.mock("@/server/firebase-admin", () => ({
  firebaseAdmin: {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.load }) }) }),
    rpc: mocks.rpc,
  },
}));
vi.mock("@/server/ai-rate-limit", () => ({ enforceAiRateLimit: mocks.rateLimit }));
vi.mock("@/lib/recipe-images.server", () => ({
  recipeSignature: () => "signature",
  needsSearch: (recipe: { image_source: string; image_url?: string | null }) =>
    !recipe.image_source || !recipe.image_url || recipe.image_url.includes("/__l5e/"),
  generateAndSaveAiImage: mocks.generate,
  configuredProviders: mocks.providers,
  findBestImage: mocks.findBest,
  saveImage: mocks.save,
}));

const recipe = {
  id: "firebaseRecipeId123",
  name: "Tomato toast",
  image_url: null,
  image_source: null,
};

describe("recipe photo requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.providers.mockReturnValue([]);
    mocks.load.mockResolvedValue({ data: recipe, error: null });
    mocks.rpc.mockResolvedValue({ data: { allowed: true }, error: null });
    mocks.generate.mockResolvedValue("https://example.com/stored-toast.png");
  });

  it("accepts Firebase IDs and legacy UUIDs while rejecting document paths", () => {
    expect(RecipeIdSchema.parse(recipe.id)).toBe(recipe.id);
    expect(RecipeIdSchema.parse("91431980-999c-4d3d-8345-e947e1e22a43")).toContain("91431980");
    for (const invalid of ["", "../recipes", "recipes/other", ".", "..", "bad\u0000id"])
      expect(RecipeIdSchema.safeParse(invalid).success).toBe(false);
  });

  it("coalesces concurrent requests before consuming image credits", async () => {
    const results = await Promise.all([
      requestRecipeImage("user-a", recipe.id),
      requestRecipeImage("user-a", recipe.id),
    ]);
    expect(results[0].imageUrl).toContain("stored-toast");
    expect(results[1]).toEqual(results[0]);
    expect(mocks.generate).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledOnce();
  });

  it("returns the matching bundled photo without generating or charging", async () => {
    mocks.load.mockResolvedValue({
      data: { ...recipe, name: "Fluffy Buttermilk Pancakes", slug: "fluffy-buttermilk-pancakes" },
      error: null,
    });
    const result = await requestRecipeImage("user-a", "curatedRecipe123");
    expect(result).toMatchObject({ source: "Curated", searched: false });
    expect(result.imageUrl).toContain("fluffy-buttermilk-pancakes");
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.rateLimit).not.toHaveBeenCalled();
  });

  it("reuses stored images without spending credits", async () => {
    mocks.load.mockResolvedValue({
      data: { ...recipe, image_source: "AI", image_url: "https://example.com/cached.png" },
      error: null,
    });
    expect((await requestRecipeImage("user-a", recipe.id)).imageUrl).toContain("cached.png");
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("repairs broken legacy /__l5e/ stored URLs and falls back to stock providers if AI fails", async () => {
    mocks.load.mockResolvedValue({
      data: { ...recipe, image_source: "AI", image_url: "/__l5e/assets-v1/dead.jpg" },
      error: null,
    });
    mocks.providers.mockReturnValue(["Unsplash"]);
    mocks.generate.mockRejectedValueOnce(new Error("AI credits unavailable"));
    mocks.findBest.mockResolvedValueOnce({
      best: {
        provider: "Unsplash",
        id: "u1",
        url: "https://images.unsplash.com/photo-toast",
        thumb: "https://images.unsplash.com/photo-toast-thumb",
        width: 1200,
        height: 800,
        title: "Tomato toast",
        score: 88,
      },
      query: "Tomato toast",
      tried: ["Tomato toast"],
    });
    const result = await requestRecipeImage("user-a", recipe.id);
    expect(result).toMatchObject({
      imageUrl: "https://images.unsplash.com/photo-toast",
      source: "Unsplash",
      searched: true,
    });
    expect(mocks.save).toHaveBeenCalledOnce();
  });

  it("allows a failed generation to be retried", async () => {
    mocks.generate.mockRejectedValueOnce(new Error("Provider unavailable"));
    await expect(requestRecipeImage("user-a", recipe.id)).rejects.toThrow("Provider unavailable");
    await expect(requestRecipeImage("user-a", recipe.id)).resolves.toMatchObject({ source: "AI" });
    expect(mocks.generate).toHaveBeenCalledTimes(2);
  });

  it("fails closed if the quota check fails", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: new Error("Database unavailable") });
    await expect(requestRecipeImage("user-a", recipe.id)).rejects.toThrow("Database unavailable");
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("returns the allowance limit without generating", async () => {
    mocks.rpc.mockResolvedValue({ data: { allowed: false, max: 3 }, error: null });
    await expect(requestRecipeImage("user-a", recipe.id)).resolves.toMatchObject({
      reason: "limit",
      limit: 3,
    });
    expect(mocks.generate).not.toHaveBeenCalled();
  });
});

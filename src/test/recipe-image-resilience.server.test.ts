import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { findBestImage, needsSearch, searchProvider } from "@/lib/recipe-images.server";
import { uploadRecipePhoto } from "@/lib/recipe-photo-storage.server";

const mocks = vi.hoisted(() => ({
  cacheSingle: vi.fn(),
  upsert: vi.fn(),
  storageUpload: vi.fn(),
  createDownloadUrl: vi.fn(),
  generateAiObject: vi.fn(),
}));

vi.mock("@/server/firebase-admin", () => ({
  firebaseAdmin: {
    from: (table: string) => {
      if (table === "image_search_cache") {
        return {
          select: () => ({ eq: () => ({ maybeSingle: mocks.cacheSingle }) }),
          upsert: mocks.upsert,
        };
      }
      return { update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }) };
    },
    storage: {
      from: () => ({
        upload: mocks.storageUpload,
        createDownloadUrl: mocks.createDownloadUrl,
        remove: vi.fn(),
      }),
    },
  },
}));

vi.mock("@/lib/ai-engine.server", () => ({
  generateAiImage: vi.fn(),
  generateAiObject: mocks.generateAiObject,
}));

describe("recipe image server resilience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cacheSingle.mockResolvedValue({ data: null, error: null });
    mocks.upsert.mockResolvedValue({ error: null });
    mocks.storageUpload.mockResolvedValue({ data: { path: "p" }, error: null });
    mocks.createDownloadUrl.mockResolvedValue({
      data: {
        downloadUrl: "https://firebasestorage.googleapis.com/v0/b/app/o/recipe.png?alt=media",
      },
      error: null,
    });
    mocks.generateAiObject.mockRejectedValue(new Error("AI unavailable"));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("upserts image_search_cache with onConflict cache_key and tolerates cache failures", async () => {
    vi.stubEnv("PEXELS_API_KEY", "pexels-test-key");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        photos: [
          {
            id: 42,
            width: 1600,
            height: 1200,
            alt: "Grilled cheese sandwich food plate",
            src: {
              large2x: "https://images.pexels.com/photos/42/full.jpg",
              medium: "https://images.pexels.com/photos/42/med.jpg",
            },
          },
        ],
      }),
    );

    const results = await searchProvider("Pexels", "Grilled cheese");
    expect(results).toHaveLength(1);
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "Pexels", query: "Grilled cheese" }),
      { onConflict: "cache_key" },
    );
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("fails over from failing Unsplash to Pexels and selects metadata match when AI is unavailable", async () => {
    vi.stubEnv("UNSPLASH_ACCESS_KEY", "unsplash-test-key");
    vi.stubEnv("PEXELS_API_KEY", "pexels-test-key");

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("api.unsplash.com")) {
        throw new Error("Unsplash network failure");
      }
      return Response.json({
        photos: [
          {
            id: 77,
            width: 2000,
            height: 1400,
            alt: "Creamy mushroom risotto dish food bowl",
            src: {
              large2x: "https://images.pexels.com/photos/77/risotto.jpg",
              medium: "https://images.pexels.com/photos/77/risotto-sm.jpg",
            },
          },
        ],
      });
    });

    const result = await findBestImage({
      id: "r-risotto",
      name: "Creamy Mushroom Risotto",
      cuisine: "Italian",
      ingredients: [{ name: "arborio rice" }, { name: "mushrooms" }],
    });

    expect(result.best?.provider).toBe("Pexels");
    expect(result.best?.url).toBe("https://images.pexels.com/photos/77/risotto.jpg");
  });

  it("treats legacy /__l5e/ URLs as needing search/repair even when locked", () => {
    expect(
      needsSearch(
        {
          image_url: "/__l5e/assets-v1/missing.jpg",
          image_source: "AI",
          image_confidence: 100,
          image_locked: true,
          image_signature: "sig",
          image_checked_at: new Date().toISOString(),
        },
        "sig",
      ),
    ).toBe(true);
  });

  it("falls back to Firebase Storage when Vercel Blob is not configured", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    vi.stubEnv("BLOB_STORE_ID", "");
    vi.stubEnv("FIREBASE_STORAGE_BUCKET", "mealmate-test.firebasestorage.app");

    const url = await uploadRecipePhoto("recipe-1/sig.png", new Uint8Array([1, 2, 3]), "image/png");
    expect(url).toContain("firebasestorage.googleapis.com");
    expect(mocks.storageUpload).toHaveBeenCalledWith(
      "recipe-1/sig.png",
      expect.any(Uint8Array),
      expect.objectContaining({ contentType: "image/png", upsert: true }),
    );
  });
});

// Server-only service layer for automated recipe creation actions,
// including triggering the AI image generator upon new recipe creation.
import {
  findBestImage,
  generateAndSaveAiImage,
  recipeSignature,
  saveImage,
} from "@/lib/recipe-images.server";

export type CreatedRecipeImageInput = {
  name: string;
  cuisine?: string | null;
  category?: string | null;
  meal_type?: string | null;
  description?: string | null;
  diet_tags?: string[] | null;
  ingredients?: unknown;
  steps?: unknown;
};

export async function triggerRecipeImageGenerationAfterCreation(
  recipeId: string,
  recipeData: CreatedRecipeImageInput,
): Promise<void> {
  if (!recipeId || !recipeData?.name) return;

  const signature = recipeSignature({ id: recipeId, ...recipeData });

  // 1. Try finding best curated/real photo first via search providers (Unsplash/Pexels/Bing + AI check)
  try {
    const searchResult = await findBestImage({
      id: recipeId,
      name: recipeData.name,
      cuisine: recipeData.cuisine,
      category: recipeData.category,
      meal_type: recipeData.meal_type,
      description: recipeData.description,
      diet_tags: recipeData.diet_tags,
      ingredients: recipeData.ingredients,
    });

    if (searchResult.best) {
      await saveImage(recipeId, searchResult.best, searchResult.query ?? recipeData.name, {
        signature,
      });
      return;
    }
  } catch (searchError) {
    console.warn("[RecipeCreationService] Stock image search failed; falling back to AI photo.", {
      recipeId,
      errorName: searchError instanceof Error ? searchError.name : "UnknownError",
    });
  }

  // 2. Fallback: Generate original AI food photography using generateAndSaveAiImage
  try {
    await generateAndSaveAiImage(
      {
        id: recipeId,
        name: recipeData.name,
        cuisine: recipeData.cuisine,
        category: recipeData.category,
        meal_type: recipeData.meal_type,
        description: recipeData.description,
        diet_tags: recipeData.diet_tags,
        ingredients: recipeData.ingredients,
        steps: recipeData.steps,
      },
      signature,
    );
  } catch (error) {
    console.warn("[RecipeCreationService] Background image generation failed for new recipe:", {
      recipeId,
      errorName: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Runs image enrichment with a bounded wait so serverless runtimes don't freeze the task before saving. */
export async function ensureCreatedRecipeImage(
  recipeId: string,
  recipeData: CreatedRecipeImageInput,
  maxWaitMs = 12_000,
): Promise<void> {
  const work = triggerRecipeImageGenerationAfterCreation(recipeId, recipeData).catch(() => {});
  await Promise.race([
    work,
    new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, maxWaitMs);
      if (typeof timer === "object" && timer !== null && "unref" in timer) {
        (timer as { unref: () => void }).unref();
      }
    }),
  ]);
}

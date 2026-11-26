// Server-only service layer for automated recipe creation actions,
// including triggering the AI image generator upon new recipe creation.
import { firebaseAdmin } from "@/server/firebase-admin";
import { findBestImage, generateAndSaveAiImage, recipeSignature } from "@/lib/recipe-images.server";

export async function triggerRecipeImageGenerationAfterCreation(
  recipeId: string,
  recipeData: {
    name: string;
    cuisine?: string | null;
    category?: string | null;
    meal_type?: string | null;
    description?: string | null;
    diet_tags?: string[] | null;
    ingredients?: unknown;
    steps?: unknown;
  },
): Promise<void> {
  if (!recipeId || !recipeData?.name) return;

  try {
    const signature = recipeSignature({ id: recipeId, ...recipeData });

    // 1. Try finding best curated/real photo first via search providers (Unsplash/Pexels/Bing + AI check)
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
      const { saveImage } = await import("@/lib/recipe-images.server");
      await saveImage(recipeId, searchResult.best, searchResult.query ?? recipeData.name, {
        signature,
      });
      return;
    }

    // 2. Fallback: Generate original AI food photography using generateAndSaveAiImage
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

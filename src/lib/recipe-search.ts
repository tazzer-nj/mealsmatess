import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateRecipe } from "@/lib/ai.functions";
import { recipesByCategoryQuery, type RecipeRecord } from "@/lib/queries";
import { loadRecipeSearchImages } from "@/lib/recipe-search-images";

export type SearchOrGenerateResult =
  { kind: "matches"; matches: RecipeRecord[] } | { kind: "generated"; slug: string };

export function buildRecipeGenerationPrompt(query: string, category?: string): string {
  const trimmed = query.trim();
  if (category && category !== "All") {
    const normalizedCat = category.trim().toLowerCase();
    if (!trimmed.toLowerCase().includes(normalizedCat)) {
      return `${category.trim()} ${trimmed}`;
    }
  }
  return trimmed;
}

export async function searchOrGenerateRecipe({
  query,
  category,
  queryClient,
  fetchCatalog,
  generateFn,
  loadImagesFn,
  onGenerating,
}: {
  query: string;
  category?: string;
  queryClient: QueryClient;
  fetchCatalog?: (category: string | undefined, search: string) => Promise<RecipeRecord[]>;
  generateFn?: (promptQuery: string) => Promise<{ slug: string }>;
  loadImagesFn?: (matches: RecipeRecord[], qc: QueryClient) => void | Promise<void>;
  onGenerating?: (query: string) => void;
}): Promise<SearchOrGenerateResult> {
  const term = query.trim();
  const activeCategory = category && category !== "All" ? category : undefined;

  const catalogFetcher =
    fetchCatalog ?? ((cat, search) => queryClient.fetchQuery(recipesByCategoryQuery(cat, search)));
  const matches = await catalogFetcher(activeCategory, term);

  if (matches.length > 0) {
    const imageLoader = loadImagesFn ?? loadRecipeSearchImages;
    void imageLoader(matches, queryClient);
    return { kind: "matches", matches };
  }

  onGenerating?.(term);
  const promptQuery = buildRecipeGenerationPrompt(term, activeCategory);
  const generator = generateFn ?? ((q) => generateRecipe({ data: { query: q } }));
  const { slug } = await generator(promptQuery);
  await queryClient.invalidateQueries({ queryKey: ["recipes"] });
  return { kind: "generated", slug };
}

export function toastRecipeGenerationError(err: unknown) {
  const message = err instanceof Error ? err.message : "";
  if (/AUTH_REQUIRED|Unauthorized|Invalid user session|No authorization/i.test(message)) {
    toast.error("Your session expired", {
      description: "Please sign in again to generate a recipe.",
    });
    return;
  }
  if (/MEALMATE_LIMIT_AI_/i.test(message)) {
    toast.message("Mia AI allowance reached", {
      description: message.replace(/^MEALMATE_LIMIT_AI_(DAILY|MONTHLY):\s*/i, ""),
    });
    return;
  }
  if (/Too many requests|rate limit|slow down|429/i.test(message)) {
    toast.error("Too many recipe requests", {
      description: "Please wait a few seconds before asking Mia for another recipe.",
    });
    return;
  }
  if (/allergy/i.test(message)) {
    toast.error("Allergy safety check triggered", {
      description: message,
    });
    return;
  }
  if (/402|premium|subscription/i.test(message)) {
    toast.error("Premium required to generate recipes", {
      description: "Upgrade to MealMate Premium to let Mia create custom recipes on demand.",
    });
    return;
  }
  if (/MealMate AI |not configured/i.test(message)) {
    toast.error("AI recipe service unavailable", {
      description: message,
    });
    return;
  }
  if (/timed out|timeout|AbortError|TimeoutError/i.test(message)) {
    toast.error("Couldn't generate that recipe", {
      description: "Mia took a little too long to finish that recipe. Please try again.",
    });
    return;
  }
  if (/Failed to fetch|NetworkError|offline/i.test(message)) {
    toast.error("Connection issue", {
      description: "Check your internet connection and try generating again.",
    });
    return;
  }
  toast.error("Couldn't generate that recipe", {
    description: "The kitchen assistant is unavailable right now. Please try again.",
  });
}

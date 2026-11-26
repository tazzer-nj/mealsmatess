import {
  evaluateRecipeAllergens,
  isAvoided,
  preferenceScore,
  type FoodPreferences,
} from "@/lib/preferences";
import { matchRecipeToPantry, type PantryMatchInfo } from "@/lib/pantry-matcher";
import type { CatalogRecipe } from "@/lib/recipe-catalog";

export type MiaMood =
  | "happy"
  | "excited"
  | "thinking"
  | "listening"
  | "speaking"
  | "confused"
  | "concerned"
  | "celebrating"
  | "calm";

export type MiaActionEvent =
  | "recipe_saved"
  | "meal_plan_created"
  | "pantry_opened"
  | "meal_completed"
  | "onboarding_completed"
  | "collection_created"
  | "goal_updated"
  | "weekly_goal_completed"
  | "recipe_viewed"
  | "timer_finished"
  | "pantry_expiring"
  | "error";

export type MiaReaction = {
  mood: MiaMood;
  message: string;
  subtitle?: string;
};

export const ALL_MIA_MOODS: readonly MiaMood[] = [
  "happy",
  "excited",
  "thinking",
  "listening",
  "speaking",
  "confused",
  "concerned",
  "celebrating",
  "calm",
] as const;

export function getMiaReaction(
  event: MiaActionEvent,
  context?: {
    recipeName?: string | null;
    expiringCount?: number;
    pantryCount?: number;
    completedCount?: number;
    goalTarget?: number;
    collectionName?: string | null;
  },
): MiaReaction {
  switch (event) {
    case "recipe_saved":
      return {
        mood: "excited",
        message: "Okayyy, that one looks delicious!",
        subtitle: context?.recipeName
          ? `Saved ${context.recipeName} to your cookbook.`
          : "Saved to your cookbook.",
      };
    case "meal_plan_created":
      return {
        mood: "celebrating",
        message: "Look at you getting organised!",
        subtitle: "Your week is taking shape.",
      };
    case "pantry_opened":
      return {
        mood: context?.expiringCount && context.expiringCount > 0 ? "concerned" : "happy",
        message: "Let's see what we can make today.",
        subtitle:
          context?.expiringCount && context.expiringCount > 0
            ? `${context.expiringCount} ingredient${context.expiringCount === 1 ? "" : "s"} could use a dish soon.`
            : context?.pantryCount
              ? `${context.pantryCount} ingredients ready to cook with.`
              : "Add a few staples and I will match recipes.",
      };
    case "meal_completed":
      return {
        mood: "celebrating",
        message: "Nice work in the kitchen!",
        subtitle: context?.recipeName
          ? `Finished cooking ${context.recipeName}.`
          : "Another home-cooked meal logged.",
      };
    case "onboarding_completed":
      return {
        mood: "excited",
        message: "Your kitchen profile is ready!",
        subtitle: "I've tuned recipes around your taste and dietary needs.",
      };
    case "collection_created":
      return {
        mood: "happy",
        message: "Ooh, love a dedicated collection!",
        subtitle: context?.collectionName
          ? `"${context.collectionName}" is ready for recipes.`
          : "Your cookbook is getting curated.",
      };
    case "goal_updated":
      return {
        mood: "calm",
        message: "Steady rhythm wins every week.",
        subtitle: context?.goalTarget
          ? `Weekly target set to ${context.goalTarget} home-cooked meals.`
          : undefined,
      };
    case "weekly_goal_completed":
      return {
        mood: "celebrating",
        message: "Weekly cooking goal crushed!",
        subtitle: "You showed up for yourself this week.",
      };
    case "timer_finished":
      return {
        mood: "excited",
        message: "Timer's up — time to check the pot!",
        subtitle: "Let's keep the step moving.",
      };
    case "pantry_expiring":
      return {
        mood: "concerned",
        message: "A few pantry items are nearing expiry.",
        subtitle: "Want me to pull together a quick dish for them?",
      };
    case "recipe_viewed":
      return {
        mood: "happy",
        message: context?.recipeName
          ? `Ready when you are to cook ${context.recipeName}.`
          : "Discover your next favourite meal.",
      };
    case "error":
      return {
        mood: "confused",
        message: "Hmm, that tripped me up for a second.",
        subtitle: "Let's give that another try.",
      };
  }
}

export function isRecipeSafeForUser(
  recipe: CatalogRecipe,
  prefs: FoodPreferences | null | undefined,
): boolean {
  if (!prefs) return true;
  const allergenEval = evaluateRecipeAllergens(prefs, {
    name: recipe.name,
    description: recipe.description,
    ingredients: recipe.ingredients,
  });
  if (!allergenEval.safe) return false;
  return !isAvoided(
    prefs,
    recipe.name,
    recipe.description,
    recipe.cuisine,
    recipe.category,
    recipe.ingredients.map((i) => i.name),
  );
}

function deterministicHash(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pickDailyRecommendation(
  recipes: CatalogRecipe[],
  prefs: FoodPreferences | null | undefined,
  pantryNames: string[],
  dateIso: string = new Date().toISOString().slice(0, 10),
): { recipe: CatalogRecipe; reason: string; pantryMatch: PantryMatchInfo | null } | null {
  const safe = recipes.filter((r) => isRecipeSafeForUser(r, prefs));
  const pool = safe.length > 0 ? safe : recipes;
  if (pool.length === 0) return null;

  const scored = pool.map((recipe) => {
    const prefScore = prefs
      ? preferenceScore(
          prefs,
          recipe.name,
          recipe.description,
          recipe.cuisine,
          recipe.category,
          recipe.diet_tags,
          recipe.ingredients.map((i) => i.name),
        )
      : 0;
    const match = pantryNames.length > 0 ? matchRecipeToPantry(recipe, pantryNames) : null;
    const pantryBonus = match ? Math.round(match.matchRatio * 8) : 0;
    const totalScore = prefScore + pantryBonus;
    const tieBreaker = deterministicHash(`${dateIso}:${recipe.slug}`) % 1000;
    return { recipe, match, totalScore, tieBreaker };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore || a.tieBreaker - b.tieBreaker);
  const topBand = scored.slice(0, Math.min(4, scored.length));
  const index = deterministicHash(dateIso) % topBand.length;
  const chosen = topBand[index] ?? scored[0]!;

  let reason = "Picked fresh for today's menu.";
  if (chosen.match && chosen.match.matchedCount >= 2) {
    reason = `Uses ${chosen.match.matchedCount} ingredients from your pantry.`;
  } else if (chosen.recipe.cooking_time_minutes && chosen.recipe.cooking_time_minutes <= 30) {
    reason = `Ready in ${chosen.recipe.cooking_time_minutes} minutes.`;
  } else if (chosen.recipe.cuisine) {
    reason = `${chosen.recipe.cuisine} flavour matched to your profile.`;
  }

  return {
    recipe: chosen.recipe,
    reason,
    pantryMatch: chosen.match,
  };
}

export function pickPantryMatches(
  recipes: CatalogRecipe[],
  pantryNames: string[],
  prefs: FoodPreferences | null | undefined,
  limit = 6,
): Array<{ recipe: CatalogRecipe; match: PantryMatchInfo }> {
  if (pantryNames.length === 0) return [];
  const safe = recipes.filter((r) => isRecipeSafeForUser(r, prefs));
  return safe
    .map((recipe) => ({ recipe, match: matchRecipeToPantry(recipe, pantryNames) }))
    .filter((item) => item.match.matchedCount > 0)
    .sort(
      (a, b) =>
        b.match.matchRatio - a.match.matchRatio || b.match.matchedCount - a.match.matchedCount,
    )
    .slice(0, limit);
}

export function pickRelatedRecipes(
  target: CatalogRecipe,
  allRecipes: CatalogRecipe[],
  prefs: FoodPreferences | null | undefined,
  limit = 4,
): CatalogRecipe[] {
  const safe = allRecipes.filter(
    (r) => r.slug !== target.slug && r.id !== target.id && isRecipeSafeForUser(r, prefs),
  );

  return safe
    .map((candidate) => {
      let score = 0;
      if (candidate.cuisine && target.cuisine && candidate.cuisine === target.cuisine) score += 4;
      if (candidate.category && target.category && candidate.category === target.category)
        score += 3;
      if (candidate.difficulty && target.difficulty && candidate.difficulty === target.difficulty)
        score += 1;
      const sharedTags = candidate.diet_tags.filter((t) => target.diet_tags.includes(t)).length;
      score += sharedTags * 2;
      if (prefs) {
        score += Math.max(
          0,
          preferenceScore(prefs, candidate.name, candidate.cuisine, candidate.category),
        );
      }
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.candidate);
}

export function extractStepTimerSeconds(stepText: string): number | null {
  if (!stepText || typeof stepText !== "string") return null;

  const hourMatch = stepText.match(
    /(\d+(?:\.\d+)?)\s*(?:to\s*\d+(?:\.\d+)?\s*)?(?:hours?|hrs?)\b/i,
  );
  if (hourMatch) {
    const hours = Number(hourMatch[1]);
    if (Number.isFinite(hours) && hours > 0 && hours <= 12) {
      return Math.round(hours * 3600);
    }
  }

  const minMatch = stepText.match(
    /(\d+(?:\.\d+)?)(?:\s*(?:to|-|–)\s*\d+(?:\.\d+)?)?\s*(?:minutes?|mins?)\b/i,
  );
  if (minMatch) {
    const mins = Number(minMatch[1]);
    if (Number.isFinite(mins) && mins > 0 && mins <= 360) {
      return Math.round(mins * 60);
    }
  }

  const secMatch = stepText.match(/(\d+)\s*(?:seconds?|secs?)\b/i);
  if (secMatch) {
    const secs = Number(secMatch[1]);
    if (Number.isFinite(secs) && secs >= 5 && secs <= 3600) {
      return secs;
    }
  }

  return null;
}

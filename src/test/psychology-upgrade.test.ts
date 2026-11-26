import { describe, expect, it } from "vitest";
import {
  ALL_MIA_MOODS,
  extractStepTimerSeconds,
  getMiaReaction,
  isRecipeSafeForUser,
  pickDailyRecommendation,
  pickPantryMatches,
  pickRelatedRecipes,
} from "@/lib/mia-companion";
import { getSeasonalCollectionsForDate } from "@/lib/seasonal-collections";
import {
  IDENTITY_HABITS,
  STATUS_ACHIEVEMENT_DEFS,
  computeEndowedProgress,
  getActiveWeeklyChallenge,
  getCurrentWeekKey,
} from "@/lib/psychology";
import { hasAnalyticsConsent, setAnalyticsConsentLocal } from "@/lib/analytics-events";
import { aggregateUserInsights } from "@/lib/user-insights-aggregator";
import { normalizePreferences } from "@/lib/preferences";
import type { CatalogRecipe } from "@/lib/recipe-catalog";

function makeRecipe(overrides: Partial<CatalogRecipe> = {}): CatalogRecipe {
  return {
    id: overrides.id ?? "rec-1",
    slug: overrides.slug ?? "chicken-herb-bowl",
    name: overrides.name ?? "Lemon Herb Chicken Bowl",
    description: overrides.description ?? "Quick weeknight chicken bowl",
    cuisine: overrides.cuisine ?? "Mediterranean",
    category: overrides.category ?? "Dinner",
    country: overrides.country ?? "ZA",
    diet_tags: overrides.diet_tags ?? ["High Protein"],
    meal_type: overrides.meal_type ?? "Dinner",
    cooking_time_minutes: overrides.cooking_time_minutes ?? 25,
    difficulty: overrides.difficulty ?? "Easy",
    servings: overrides.servings ?? 2,
    calories: overrides.calories ?? 480,
    protein_g: overrides.protein_g ?? 36,
    carbs_g: overrides.carbs_g ?? 32,
    fat_g: overrides.fat_g ?? 18,
    ingredients: overrides.ingredients ?? [
      { name: "Chicken breast", quantity: "300 g" },
      { name: "Lemon", quantity: "1" },
      { name: "Olive oil", quantity: "1 tbsp" },
    ],
    steps: overrides.steps ?? [
      "Season the chicken and sear for 12 minutes.",
      "Rest for 5 minutes and slice over greens.",
    ],
    fun_fact: null,
    created_by: null,
    rating: overrides.rating ?? 4.8,
    is_premium: false,
    image_url: null,
    image_source: null,
    image_attribution: null,
    ...overrides,
  };
}

describe("Mia Companion Engine", () => {
  it("supports all 9 required emotional states", () => {
    expect(ALL_MIA_MOODS).toHaveLength(9);
    expect(ALL_MIA_MOODS).toEqual(
      expect.arrayContaining([
        "happy",
        "excited",
        "thinking",
        "listening",
        "speaking",
        "confused",
        "concerned",
        "celebrating",
        "calm",
      ]),
    );
  });

  it("returns context-aware reactions for key user actions", () => {
    const saved = getMiaReaction("recipe_saved", { recipeName: "Cape Malay Bobotie" });
    expect(saved.mood).toBe("excited");
    expect(saved.message).toBe("Okayyy, that one looks delicious!");
    expect(saved.subtitle).toContain("Cape Malay Bobotie");

    const planned = getMiaReaction("meal_plan_created");
    expect(planned.mood).toBe("celebrating");
    expect(planned.message).toBe("Look at you getting organised!");

    const pantry = getMiaReaction("pantry_opened", { expiringCount: 2, pantryCount: 6 });
    expect(pantry.mood).toBe("concerned");
    expect(pantry.message).toBe("Let's see what we can make today.");
    expect(pantry.subtitle).toContain("2 ingredients");

    const timer = getMiaReaction("timer_finished");
    expect(timer.mood).toBe("excited");
    expect(timer.message).toContain("Timer");

    const err = getMiaReaction("error");
    expect(err.mood).toBe("confused");
  });

  it("filters out unsafe allergens and disliked ingredients from recommendations", () => {
    const prefs = normalizePreferences({
      allergies: ["Peanuts"],
      disliked_foods: ["cilantro"],
      favorite_foods: ["South African"],
    });

    const peanutSatay = makeRecipe({
      id: "peanut-satay",
      slug: "peanut-satay",
      name: "Peanut Satay Noodles",
      ingredients: [
        { name: "Peanut butter", quantity: "3 tbsp" },
        { name: "Noodles", quantity: "200 g" },
      ],
    });
    const cilantroSalad = makeRecipe({
      id: "cilantro-salad",
      slug: "cilantro-salad",
      name: "Fresh Lime Salad",
      ingredients: [{ name: "Cilantro", quantity: "1 bunch" }],
    });
    const safeBobotie = makeRecipe({
      id: "bobotie",
      slug: "cape-bobotie",
      name: "Classic Cape Bobotie",
      cuisine: "South African",
      ingredients: [
        { name: "Lean beef mince", quantity: "500 g" },
        { name: "Curry powder", quantity: "2 tsp" },
      ],
    });

    expect(isRecipeSafeForUser(peanutSatay, prefs)).toBe(false);
    expect(isRecipeSafeForUser(cilantroSalad, prefs)).toBe(false);
    expect(isRecipeSafeForUser(safeBobotie, prefs)).toBe(true);

    const pick = pickDailyRecommendation(
      [peanutSatay, cilantroSalad, safeBobotie],
      prefs,
      ["beef mince", "curry powder"],
      "2026-11-26",
    );
    expect(pick?.recipe.slug).toBe("cape-bobotie");
    expect(pick?.reason).toContain("ingredients from your pantry");
  });

  it("matches pantry items and sorts by highest match ratio", () => {
    const prefs = normalizePreferences({});
    const chickenBowl = makeRecipe({
      id: "r1",
      slug: "r1",
      ingredients: [
        { name: "Chicken breast", quantity: "300 g" },
        { name: "Lemon", quantity: "1" },
      ],
    });
    const beefStew = makeRecipe({
      id: "r2",
      slug: "r2",
      name: "Beef Stew",
      ingredients: [
        { name: "Chuck beef", quantity: "500 g" },
        { name: "Carrots", quantity: "2" },
        { name: "Potatoes", quantity: "3" },
        { name: "Onions", quantity: "2" },
      ],
    });

    const matches = pickPantryMatches([chickenBowl, beefStew], ["Chicken breast", "Lemon"], prefs);
    expect(matches).toHaveLength(1);
    expect(matches[0]!.recipe.slug).toBe("r1");
  });

  it("picks related recipes by cuisine/category/diet tags without returning the target itself", () => {
    const target = makeRecipe({
      id: "target",
      slug: "target",
      cuisine: "Italian",
      category: "Dinner",
      diet_tags: ["Quick"],
    });
    const similar = makeRecipe({
      id: "sim",
      slug: "sim",
      name: "Tomato Basil Pasta",
      cuisine: "Italian",
      category: "Dinner",
      diet_tags: ["Quick"],
    });
    const unrelated = makeRecipe({
      id: "unrel",
      slug: "unrel",
      name: "Oat Smoothie",
      cuisine: "American",
      category: "Breakfast",
      diet_tags: ["Sweet"],
    });

    const related = pickRelatedRecipes(target, [target, similar, unrelated], null, 4);
    expect(related.map((r) => r.slug)).toEqual(["sim", "unrel"]);
  });

  it("extracts cooking timers cleanly across hours, minutes, and seconds", () => {
    expect(extractStepTimerSeconds("Simmer gently for 25 minutes until tender.")).toBe(1500);
    expect(extractStepTimerSeconds("Simmer for 10 to 15 mins.")).toBe(600);
    expect(extractStepTimerSeconds("Slow roast for 1.5 hours.")).toBe(5400);
    expect(extractStepTimerSeconds("Whisk rapidly for 45 seconds.")).toBe(45);
    expect(extractStepTimerSeconds("Serve immediately on warm plates.")).toBeNull();
  });
});

describe("Seasonal Collections (Southern Hemisphere)", () => {
  const catalog = [
    makeRecipe({ id: "s1", slug: "summer-braai", name: "Summer Braai Chicken Salad" }),
    makeRecipe({ id: "s2", slug: "winter-stew", name: "Slow Winter Beef Potjie Stew" }),
    makeRecipe({ id: "s3", slug: "autumn-curry", name: "Roasted Butternut Curry" }),
    makeRecipe({ id: "s4", slug: "spring-bowl", name: "Spring Herb Quinoa Bowl" }),
  ];

  it("maps December to Festive & Summer collections, June to Winter, March to Autumn, and Sep to Spring", () => {
    const dec = getSeasonalCollectionsForDate(new Date("2026-12-15T12:00:00Z"), catalog);
    expect(dec.map((c) => c.seasonLabel)).toEqual(["Festive Season", "Summer"]);

    const jun = getSeasonalCollectionsForDate(new Date("2026-06-15T12:00:00Z"), catalog);
    expect(jun[0]?.seasonLabel).toBe("Winter");

    const mar = getSeasonalCollectionsForDate(new Date("2026-03-15T12:00:00Z"), catalog);
    expect(mar[0]?.seasonLabel).toBe("Autumn");

    const sep = getSeasonalCollectionsForDate(new Date("2026-09-15T12:00:00Z"), catalog);
    expect(sep[0]?.seasonLabel).toBe("Spring");
  });
});

describe("Psychology Helpers: Endowed Progress, Identity Habits & Challenges", () => {
  it("computes endowed progress strictly from real completed actions", () => {
    const empty = computeEndowedProgress({
      onboardingCompleted: false,
      savedRecipesCount: 0,
      plannedMealsCount: 0,
      completedMealsCount: 0,
      pantryItemsCount: 0,
    });
    expect(empty.completed).toBe(0);
    expect(empty.percentage).toBe(0);

    const partial = computeEndowedProgress({
      onboardingCompleted: true,
      savedRecipesCount: 3,
      plannedMealsCount: 2,
      completedMealsCount: 0,
      pantryItemsCount: 0,
    });
    expect(partial.completed).toBe(3);
    expect(partial.total).toBe(5);
    expect(partial.percentage).toBe(60);

    const full = computeEndowedProgress({
      onboardingCompleted: true,
      savedRecipesCount: 1,
      plannedMealsCount: 1,
      completedMealsCount: 1,
      pantryItemsCount: 1,
    });
    expect(full.percentage).toBe(100);
  });

  it("provides identity habits, status achievements, and deterministic weekly challenges", () => {
    expect(IDENTITY_HABITS).toHaveLength(4);
    expect(STATUS_ACHIEVEMENT_DEFS.map((d) => d.title)).toEqual([
      "Kitchen Explorer",
      "Recipe Collector",
      "Meal Planner",
      "Cooking Enthusiast",
      "Consistent Cook",
    ]);

    const key = getCurrentWeekKey(new Date("2026-11-26T12:00:00Z"));
    expect(key).toMatch(/^2026-W\d{2}$/);
    const challenge = getActiveWeeklyChallenge(new Date("2026-11-26T12:00:00Z"));
    expect(challenge.title.length).toBeGreaterThan(3);
    expect(challenge.targetMeals).toBeGreaterThan(0);
  });
});

describe("Privacy-Conscious Analytics & Aggregator", () => {
  it("respects opt-in / opt-out local analytics consent", () => {
    setAnalyticsConsentLocal(false);
    expect(hasAnalyticsConsent()).toBe(false);
    setAnalyticsConsentLocal(true);
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it("aggregates activation rate, completed meals, collections, and paywall conversion", () => {
    const report = aggregateUserInsights({
      filters: {
        from: "2026-11-01T00:00:00.000Z",
        to: "2026-11-30T23:59:59.999Z",
      },
      profiles: [
        { id: "u1", onboarding_completed: true, created_at: "2026-11-05T10:00:00.000Z" },
        { id: "u2", onboarding_completed: true, created_at: "2026-11-06T10:00:00.000Z" },
      ],
      onboardingProfiles: [],
      onboardingProgress: [],
      acquisitionSources: [],
      analyticsEvents: [
        {
          user_id: "u1",
          event_name: "first_recipe_viewed",
          created_at: "2026-11-07T10:00:00.000Z",
        },
        { user_id: "u1", event_name: "meal_completed", created_at: "2026-11-08T10:00:00.000Z" },
        { user_id: "u1", event_name: "collection_created", created_at: "2026-11-09T10:00:00.000Z" },
        { user_id: "u1", event_name: "paywall_viewed", created_at: "2026-11-10T10:00:00.000Z" },
        {
          user_id: "u1",
          event_name: "subscription_converted",
          created_at: "2026-11-10T10:05:00.000Z",
        },
        { user_id: "u2", event_name: "paywall_viewed", created_at: "2026-11-11T10:00:00.000Z" },
      ],
      userActivity: [],
      subscriptions: [{ user_id: "u1", status: "active", tier: "annual" }],
      payments: [],
      now: new Date("2026-11-26T12:00:00.000Z"),
    });

    expect(report.overview.activatedUsers).toBe(1);
    expect(report.overview.activationRatePct).toBe(50);
    expect(report.overview.mealsCompleted).toBe(1);
    expect(report.overview.collectionsCreated).toBe(1);
    expect(report.overview.paywallViewedUsers).toBe(2);
    expect(report.overview.paywallToPaidConversionPct).toBe(50);
  });
});

import {
  avoidTerms,
  preferenceSummary,
  type FoodPreferences,
  type PersonalisationProfile,
} from "@/lib/preferences";

export const PAGE_1_FOOD_GOALS = [
  "Eat healthier.",
  "Lose weight in a healthy way.",
  "Maintain my weight.",
  "Gain weight in a healthy way.",
  "Save money on food.",
  "Discover new recipes.",
  "Plan my meals.",
  "Improve my cooking.",
  "Reduce food waste.",
] as const;

export const PAGE_2_CHALLENGES = [
  "I never know what to cook.",
  "I eat too much takeaway.",
  "Healthy food feels expensive.",
  "I struggle with portion sizes.",
  "I waste groceries.",
  "I don't have enough time to cook.",
  "I struggle to stay consistent.",
  "I get bored eating the same meals.",
  "I don't know how to use ingredients I already have.",
  "I struggle with meal planning.",
] as const;

export const PAGE_3_HEALTH_GOALS = [
  "Build healthier eating habits.",
  "Eat more balanced meals.",
  "Improve my energy.",
  "Support my fitness routine.",
  "Maintain my current weight.",
  "Weight management.",
  "Improve my cooking habits.",
] as const;

export const AGE_BRACKETS = [
  { id: "under_18", label: "Under 18" },
  { id: "18_24", label: "18–24" },
  { id: "25_34", label: "25–34" },
  { id: "35_44", label: "35–44" },
  { id: "45_plus", label: "45+" },
  { id: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export const PAGE_4_EATING_HABITS = [
  "I skip meals",
  "I snack throughout the day",
  "I eat at irregular times",
  "I eat takeaway frequently",
  "I have a consistent routine",
  "I'm working on improving my habits",
] as const;

export const PAGE_4_COOKING_FREQUENCIES = [
  "Every day",
  "A few times a week",
  "Once a week",
  "Rarely",
  "Never",
] as const;

export const PAGE_4_BIGGEST_CHALLENGES = [
  "Deciding what to cook after a long day",
  "Staying on budget at the shops",
  "Cooking with what I already have",
  "Sticking to a healthy routine",
  "Finding quick meals I enjoy",
] as const;

export const PAGE_5_MEAL_ENJOYMENTS = [
  "South African food",
  "High-protein meals",
  "Vegetarian",
  "Vegan",
  "Budget-friendly meals",
  "Quick meals",
  "Healthy comfort food",
  "Mediterranean",
  "Asian-inspired",
  "Traditional home cooking",
  "Anything delicious",
] as const;

export const PAGE_5_ALLERGIES = [
  "None",
  "Peanuts",
  "Tree nuts",
  "Milk / Lactose",
  "Eggs",
  "Wheat / Gluten",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
] as const;

export const PAGE_5_DIETARY_RESTRICTIONS = [
  "None",
  "Halal",
  "Kosher",
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Pescatarian",
  "Low-carb",
] as const;

export const PAGE_5_COMMON_DISLIKES = [
  "Mushrooms",
  "Coriander",
  "Olives",
  "Liver / Offal",
  "Seafood",
  "Very spicy food",
  "Onions",
  "Blue cheese",
] as const;

export const PAGE_6_COOKING_TIMES = [
  "Under 15 minutes",
  "15–30 minutes",
  "30–60 minutes",
  "More than an hour",
] as const;

export const PAGE_6_COOKING_SKILLS = [
  {
    level: "Beginner",
    desc: "Clear, approachable steps with everyday ingredients and minimal prep.",
  },
  {
    level: "Intermediate",
    desc: "Comfortable cooking weekly meals and experimenting with flavour.",
  },
  {
    level: "Experienced",
    desc: "Confident in the kitchen and excited for richer techniques.",
  },
] as const;

export const PAGE_6_BUDGET_ZAR = [
  "Under R1,000 / month",
  "R1,000–R2,500 / month",
  "R2,500–R4,500 / month",
  "R4,500+ / month",
  "Flexible",
] as const;

export const PAGE_7_DISCOVERY_SOURCES = [
  "TikTok",
  "Instagram",
  "Facebook",
  "YouTube",
  "Google Search",
  "Friends or family",
  "Website",
  "Google Play Store",
  "Other",
] as const;

export const HOUSEHOLD_SIZE_OPTIONS = [
  "1 person (solo)",
  "2 people (couple)",
  "3 to 4 people (family)",
  "5+ people (large feast)",
] as const;

export function parseMaxMinutesFromCookingTime(
  cookingTime: string | null | undefined,
): number | null {
  if (!cookingTime) return null;
  if (/under 15/i.test(cookingTime)) return 15;
  if (/under 20/i.test(cookingTime)) return 20;
  if (/15[–-]30/i.test(cookingTime)) return 30;
  if (/20.*35/i.test(cookingTime)) return 35;
  if (/30[–-]60|35.*50/i.test(cookingTime)) return 60;
  return null;
}

export function isBalancedNutritionSafeguardRequired(
  prefs: Pick<FoodPreferences, "age_bracket" | "balanced_nutrition_safeguard">,
): boolean {
  return prefs.age_bracket === "under_18" || prefs.balanced_nutrition_safeguard === true;
}

export function buildPersonalisationProfile(prefs: FoodPreferences): PersonalisationProfile {
  const safeguard = isBalancedNutritionSafeguardRequired(prefs);
  const maxMinutes = parseMaxMinutesFromCookingTime(prefs.cooking_time);

  const recommendedCategories = new Set<string>();
  const enjoyments = prefs.meal_enjoyments ?? [];
  const goals = prefs.goals?.length ? prefs.goals : prefs.goal ? [prefs.goal] : [];
  const challenges = prefs.challenges ?? [];
  const healthGoals = prefs.health_goals ?? [];

  if (
    enjoyments.includes("South African food") ||
    prefs.preferred_cuisines.includes("South African")
  ) {
    recommendedCategories.add("South African Favorites");
  }
  if (enjoyments.includes("Vegan") || prefs.dietary_restrictions.includes("Vegan")) {
    recommendedCategories.add("Vegan");
  }
  if (
    enjoyments.includes("High-protein meals") ||
    healthGoals.includes("Support my fitness routine.")
  ) {
    recommendedCategories.add("High Protein");
  }
  if (
    enjoyments.includes("Quick meals") ||
    challenges.includes("I don't have enough time to cook.") ||
    (maxMinutes !== null && maxMinutes <= 30)
  ) {
    recommendedCategories.add("Quick");
  }
  if (
    goals.includes("Eat healthier.") ||
    healthGoals.includes("Eat more balanced meals.") ||
    healthGoals.includes("Build healthier eating habits.")
  ) {
    recommendedCategories.add("Healthy Meals");
  }
  if (recommendedCategories.size === 0) {
    recommendedCategories.add("Dinner");
    recommendedCategories.add("South African Favorites");
  }

  const budgetTier: PersonalisationProfile["budget_tier"] =
    prefs.budget_range_zar && /(under r1,000|r1,000[–-]r2,500)/i.test(prefs.budget_range_zar)
      ? "budget"
      : prefs.budget_range_zar && /r2,500[–-]r4,500/i.test(prefs.budget_range_zar)
        ? "moderate"
        : prefs.budget_range_zar
          ? "flexible"
          : goals.includes("Save money on food.") ||
              challenges.includes("Healthy food feels expensive.")
            ? "budget"
            : null;

  const pantryFocus: PersonalisationProfile["pantry_focus"] =
    goals.includes("Reduce food waste.") ||
    challenges.includes("I waste groceries.") ||
    challenges.includes("I don't know how to use ingredients I already have.")
      ? "zero_waste"
      : "standard";

  const mealPlannerFocus: PersonalisationProfile["meal_planner_focus"] =
    pantryFocus === "zero_waste"
      ? "pantry_first"
      : budgetTier === "budget"
        ? "budget_conscious"
        : maxMinutes !== null && maxMinutes <= 30
          ? "quick_weeknight"
          : enjoyments.includes("High-protein meals") ||
              healthGoals.includes("Support my fitness routine.")
            ? "protein_fitness"
            : "balanced_routine";

  const homeSections: PersonalisationProfile["home_sections"] = [];
  if (maxMinutes !== null && maxMinutes <= 30) {
    homeSections.push({
      id: "quick",
      title: `Ready in ${maxMinutes} minutes or less`,
      subtitle: "Matched to your weekday cooking window",
      category: "Quick",
    });
  }
  if (pantryFocus === "zero_waste") {
    homeSections.push({
      id: "pantry",
      title: "Cook from your pantry first",
      subtitle: "Use ingredients on hand before they go to waste",
    });
  }
  if (budgetTier === "budget") {
    homeSections.push({
      id: "budget",
      title: "Smart ZAR budget-friendly picks",
      subtitle: `Tailored around ${prefs.budget_range_zar ?? "cost-conscious home cooking"}`,
    });
  }
  if (enjoyments.includes("South African food")) {
    homeSections.push({
      id: "sa",
      title: "South African staples curated for you",
      subtitle: "Local dishes filtered for your dietary & allergy profile",
      category: "South African Favorites",
    });
  }
  if (homeSections.length === 0) {
    homeSections.push({
      id: "balanced",
      title: "Recommended for your routine",
      subtitle: "Tailored to your goals, skill level, and flavour preferences",
    });
  }

  const suggestedDifficulty: PersonalisationProfile["suggested_difficulty"] =
    prefs.cooking_level === "Beginner" ||
    prefs.cooking_level === "Intermediate" ||
    prefs.cooking_level === "Experienced"
      ? prefs.cooking_level
      : null;

  const strictExclusions = Array.from(new Set(avoidTerms(prefs)));
  const miaContext = buildMiaPersonalisationContext(prefs, []);

  return {
    recommended_categories: Array.from(recommendedCategories).slice(0, 5),
    home_sections: homeSections.slice(0, 4),
    suggested_max_minutes: maxMinutes,
    suggested_difficulty: suggestedDifficulty,
    budget_tier: budgetTier,
    pantry_focus: pantryFocus,
    meal_planner_focus: mealPlannerFocus,
    balanced_nutrition_safeguard: safeguard,
    strict_exclusions: strictExclusions.slice(0, 60),
    mia_context: miaContext,
    generated_at: new Date().toISOString(),
  };
}

export function buildMiaPersonalisationContext(
  prefs: FoodPreferences,
  pantryNames: string[] = [],
): string {
  const safeguard = isBalancedNutritionSafeguardRequired(prefs);
  const parts = [
    `Taste & lifestyle profile: ${preferenceSummary(prefs) || "not set yet"}`,
    pantryNames.length > 0 ? `Pantry ingredients on hand: ${pantryNames.join(", ")}` : "",
    safeguard
      ? "CRITICAL YOUTH SAFETY RULE: This user selected an under-18 age bracket. Focus strictly on balanced nourishment, energy, cooking skills, and varied whole foods. NEVER recommend weight-loss diets, calorie-deficit targets, fasting, or restrictive dieting."
      : "",
    prefs.allergies.length > 0
      ? `STRICT ALLERGY EXCLUSION: Never include or suggest ${prefs.allergies.join(", ")} or derived ingredients.`
      : "",
    prefs.dietary_restrictions.length > 0
      ? `DIETARY RESTRICTIONS: Strictly respect ${prefs.dietary_restrictions.join(", ")}.`
      : "",
    prefs.disliked_foods.length > 0
      ? `AVOID DISLIKED INGREDIENTS: ${prefs.disliked_foods.join(", ")}.`
      : "",
  ];
  return parts.filter(Boolean).join("\n");
}

export function buildDynamicOnboardingSummary(prefs: FoodPreferences): string {
  const safeguard = isBalancedNutritionSafeguardRequired(prefs);
  const goals = (prefs.goals?.length ? prefs.goals : prefs.goal ? [prefs.goal] : []).filter(
    (g) => !(safeguard && /lose weight/i.test(g)),
  );
  const primaryGoals =
    goals.length > 0
      ? goals
          .slice(0, 2)
          .map((g) => g.replace(/\.$/, "").toLowerCase())
          .join(" and ")
      : "make everyday meals simpler";
  const challenges = prefs.challenges ?? [];
  const challengeClause =
    challenges.length > 0
      ? ` while easing challenges like ${challenges[0]!.replace(/\.$/, "").toLowerCase()}`
      : "";
  const timeClause = prefs.cooking_time
    ? ` within ${prefs.cooking_time.toLowerCase()} cooking windows`
    : "";
  const allergyClause =
    prefs.allergies.length > 0
      ? ` All recipes and plans automatically exclude ${prefs.allergies.join(", ")}.`
      : "";
  const youthNote = safeguard
    ? " Recommendations prioritise balanced nourishment and approachable home cooking."
    : "";
  const nameClause = prefs.preferred_name?.trim() ? ` for ${prefs.preferred_name.trim()}` : "";

  return `We have tailored MealMate${nameClause} to help you ${primaryGoals}${challengeClause}${timeClause}.${allergyClause}${youthNote}`;
}

export function getRelevantOnboardingBenefits(prefs: FoodPreferences): string[] {
  const benefits: string[] = [];
  const goals = prefs.goals ?? [];
  const challenges = prefs.challenges ?? [];

  if (
    challenges.includes("I don't have enough time to cook.") ||
    (prefs.cooking_time && /(under 15|15[–-]30)/i.test(prefs.cooking_time))
  ) {
    benefits.push(
      `Quick-cook prioritisation filtered for ${prefs.cooking_time ?? "busy weeknights"}.`,
    );
  }
  if (
    goals.includes("Save money on food.") ||
    challenges.includes("Healthy food feels expensive.") ||
    prefs.budget_range_zar
  ) {
    benefits.push(
      `Budget-aware meal ideas calibrated around ${prefs.budget_range_zar ?? "everyday South African grocery prices"}.`,
    );
  }
  if (
    goals.includes("Reduce food waste.") ||
    challenges.includes("I waste groceries.") ||
    challenges.includes("I don't know how to use ingredients I already have.")
  ) {
    benefits.push("Pantry-first recipe suggestions to use ingredients you already own.");
  }
  if (prefs.allergies.length > 0 || prefs.dietary_restrictions.length > 0) {
    const items = [...prefs.allergies, ...prefs.dietary_restrictions];
    benefits.push(`Automatic ingredient safety filtering for ${items.join(", ")}.`);
  }
  if (benefits.length < 3) {
    benefits.push("Mia AI coaching personalised to your eating routine and kitchen comfort.");
  }
  if (benefits.length < 3) {
    benefits.push("Weekly meal planner and aisle-sorted grocery list ready in one tap.");
  }
  return benefits.slice(0, 4);
}

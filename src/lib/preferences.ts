// MealMate personalization preferences.
// Guests keep answers locally; signed-in users sync them to their profile.

export type ShoppingPreferencesData = {
  category_overrides?: Record<string, string>;
  aisle_order?: string[];
};

export type AcquisitionAttribution = {
  self_reported_source: string | null;
  other_detail?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referrer?: string | null;
  captured_at?: string | null;
};

export type PersonalisationProfile = {
  recommended_categories: string[];
  home_sections: { id: string; title: string; subtitle: string; category?: string }[];
  suggested_max_minutes: number | null;
  suggested_difficulty: "Easy" | "Medium" | "Hard" | null;
  budget_tier: "budget" | "moderate" | "flexible" | null;
  pantry_focus: "zero_waste" | "standard";
  meal_planner_focus:
    | "quick_weeknight"
    | "budget_conscious"
    | "balanced_routine"
    | "protein_fitness"
    | "pantry_first";
  balanced_nutrition_safeguard: boolean;
  strict_exclusions: string[];
  mia_context: string;
  generated_at: string;
};

export type FoodPreferences = {
  goal: string | null;
  goals?: string[];
  challenges?: string[];
  health_goals?: string[];
  age_bracket?: string | null;
  balanced_nutrition_safeguard?: boolean;
  eating_habits?: string | null;
  cooking_frequency?: string | null;
  primary_challenge?: string | null;
  meal_enjoyments?: string[];
  favorite_foods: string[];
  allergies: string[];
  intolerances: string[];
  dietary_restrictions: string[];
  disliked_foods: string[];
  preferred_cuisines: string[];
  lifestyles: string[];
  preferred_meal_types: string[];
  meals_per_day: string | null;
  household_size?: string | null;
  preferred_name?: string | null;
  cooking_level: string | null;
  cooking_time: string | null;
  food_budget: string | null;
  budget_range_zar?: string | null;
  preferred_features: string[];
  shopping?: ShoppingPreferencesData | null;
  acquisition?: AcquisitionAttribution | null;
  discovery_source?: string | null;
  personalisation_profile?: PersonalisationProfile | null;
  onboarding_step?: number | null;
  identity_habit?: string | null;
  weekly_cooking_goal?: number | null;
  onboarding_completed: boolean;
  updated_at: string | null;
};

export const EMPTY_PREFERENCES: FoodPreferences = {
  goal: null,
  goals: [],
  challenges: [],
  health_goals: [],
  age_bracket: null,
  balanced_nutrition_safeguard: false,
  eating_habits: null,
  cooking_frequency: null,
  primary_challenge: null,
  meal_enjoyments: [],
  favorite_foods: [],
  allergies: [],
  intolerances: [],
  dietary_restrictions: [],
  disliked_foods: [],
  preferred_cuisines: [],
  lifestyles: [],
  preferred_meal_types: [],
  meals_per_day: null,
  household_size: null,
  preferred_name: null,
  cooking_level: null,
  cooking_time: null,
  food_budget: null,
  budget_range_zar: null,
  preferred_features: [],
  shopping: null,
  acquisition: null,
  discovery_source: null,
  personalisation_profile: null,
  onboarding_step: null,
  identity_habit: null,
  weekly_cooking_goal: 4,
  onboarding_completed: false,
  updated_at: null,
};

const KEY = "mealmate.preferences.v1";
const SEEN_KEY = "mealmate.onboarding-seen.v1";
export const PREFERENCES_EVENT = "mealmate:preferences";

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v ? v : null;
}

function asStepNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : null;
}

function asShopping(v: unknown): ShoppingPreferencesData | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const obj = v as Record<string, unknown>;
  const overridesRaw = obj["category_overrides"];
  const category_overrides: Record<string, string> = {};
  if (overridesRaw && typeof overridesRaw === "object" && !Array.isArray(overridesRaw)) {
    for (const [k, val] of Object.entries(overridesRaw)) {
      if (typeof val === "string" && val.trim()) {
        category_overrides[k] = val.trim();
      }
    }
  }
  const aisle_order = asStringArray(obj["aisle_order"]);
  if (Object.keys(category_overrides).length === 0 && aisle_order.length === 0) return null;
  return { category_overrides, aisle_order };
}

function asAcquisition(v: unknown): AcquisitionAttribution | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const obj = v as Record<string, unknown>;
  const selfReported = asString(obj["self_reported_source"]);
  const utmSource = asString(obj["utm_source"]);
  const referrer = asString(obj["referrer"]);
  if (!selfReported && !utmSource && !referrer) return null;
  return {
    self_reported_source: selfReported,
    other_detail: asString(obj["other_detail"]),
    utm_source: utmSource,
    utm_medium: asString(obj["utm_medium"]),
    utm_campaign: asString(obj["utm_campaign"]),
    referrer,
    captured_at: asString(obj["captured_at"]),
  };
}

function asPersonalisationProfile(v: unknown): PersonalisationProfile | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const obj = v as Record<string, unknown>;
  if (!Array.isArray(obj["recommended_categories"])) return null;
  return v as PersonalisationProfile;
}

function normalizeHousehold(value: string | null): string | null {
  return value === "3–4 people (family)" ? "3 to 4 people (family)" : value;
}

function normalizeCookingTime(value: string | null): string | null {
  if (value === "20–35 mins") return "20 to 35 mins";
  if (value === "35–50 mins") return "35 to 50 mins";
  return value;
}

export function normalizePreferences(raw: unknown): FoodPreferences {
  const o = (raw ?? {}) as Record<string, unknown>;
  const rawMeals = normalizeHousehold(asString(o["meals_per_day"]));
  const householdSize = normalizeHousehold(asString(o["household_size"])) ?? rawMeals;
  const goals = asStringArray(o["goals"]);
  const singleGoal = asString(o["goal"]) ?? goals[0] ?? null;
  const ageBracket = asString(o["age_bracket"]);
  const balancedSafeguard = o["balanced_nutrition_safeguard"] === true || ageBracket === "under_18";
  const mealEnjoyments = asStringArray(o["meal_enjoyments"]);
  const favoriteFoods = asStringArray(o["favorite_foods"]);
  const preferredCuisines = asStringArray(o["preferred_cuisines"]);
  const budgetRangeZar = asString(o["budget_range_zar"]);

  return {
    goal: singleGoal,
    goals: goals.length > 0 ? goals : singleGoal ? [singleGoal] : [],
    challenges: asStringArray(o["challenges"]),
    health_goals: asStringArray(o["health_goals"]),
    age_bracket: ageBracket,
    balanced_nutrition_safeguard: balancedSafeguard,
    eating_habits: asString(o["eating_habits"]),
    cooking_frequency: asString(o["cooking_frequency"]),
    primary_challenge: asString(o["primary_challenge"]),
    meal_enjoyments: mealEnjoyments,
    favorite_foods:
      favoriteFoods.length > 0
        ? favoriteFoods
        : Array.from(new Set([...mealEnjoyments, ...preferredCuisines])),
    allergies: asStringArray(o["allergies"]),
    intolerances: asStringArray(o["intolerances"]),
    dietary_restrictions: asStringArray(o["dietary_restrictions"]),
    disliked_foods: asStringArray(o["disliked_foods"]),
    preferred_cuisines: preferredCuisines,
    lifestyles: asStringArray(o["lifestyles"]),
    preferred_meal_types: asStringArray(o["preferred_meal_types"]),
    meals_per_day: rawMeals ?? householdSize,
    household_size: householdSize,
    preferred_name: asString(o["preferred_name"]),
    cooking_level: asString(o["cooking_level"]),
    cooking_time: normalizeCookingTime(asString(o["cooking_time"])),
    food_budget: asString(o["food_budget"]) ?? budgetRangeZar,
    budget_range_zar: budgetRangeZar,
    preferred_features: asStringArray(o["preferred_features"]),
    shopping: asShopping(o["shopping"]),
    acquisition: asAcquisition(o["acquisition"]),
    discovery_source: asString(o["discovery_source"]),
    personalisation_profile: asPersonalisationProfile(o["personalisation_profile"]),
    onboarding_step: asStepNumber(o["onboarding_step"]),
    identity_habit: asString(o["identity_habit"]),
    weekly_cooking_goal:
      typeof o["weekly_cooking_goal"] === "number" &&
      Number.isInteger(o["weekly_cooking_goal"]) &&
      o["weekly_cooking_goal"] >= 1 &&
      o["weekly_cooking_goal"] <= 21
        ? o["weekly_cooking_goal"]
        : 4,
    onboarding_completed: o["onboarding_completed"] === true,
    updated_at: asString(o["updated_at"]),
  };
}

export function readLocalPreferences(): FoodPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return normalizePreferences(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeLocalPreferences(prefs: FoodPreferences): void {
  if (typeof window === "undefined") return;
  const next = { ...prefs, updated_at: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage may be restricted in in-app WebViews
  }
  window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT));
}

export function clearLocalPreferences(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(SEEN_KEY);
  } catch {
    // Storage may be restricted in in-app WebViews
  }
  window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT));
}

/** True when the intro has never been shown or dismissed on this device. */
export function shouldOfferOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return false;
  }
}

export function markOnboardingSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage may be restricted in in-app WebViews
  }
  window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT));
}

// ---------- personalization helpers ----------

function haystack(...parts: (string | null | undefined | string[])[]): string {
  return parts
    .flatMap((p) => (Array.isArray(p) ? p : [p]))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

const ALLERGEN_SYNONYMS: Record<string, string[]> = {
  peanut: ["peanut", "peanuts", "peanut butter", "peanut oil", "groundnut", "groundnuts", "satay"],
  peanuts: ["peanut", "peanuts", "peanut butter", "peanut oil", "groundnut", "groundnuts", "satay"],
  "tree nut": [
    "almond",
    "almonds",
    "walnut",
    "walnuts",
    "cashew",
    "cashews",
    "pecan",
    "pecans",
    "pistachio",
    "pistachios",
    "hazelnut",
    "hazelnuts",
    "macadamia",
    "brazil nut",
    "pine nut",
    "marzipan",
    "praline",
  ],
  "tree nuts": [
    "almond",
    "almonds",
    "walnut",
    "walnuts",
    "cashew",
    "cashews",
    "pecan",
    "pecans",
    "pistachio",
    "pistachios",
    "hazelnut",
    "hazelnuts",
    "macadamia",
    "brazil nut",
    "pine nut",
    "marzipan",
    "praline",
  ],
  milk: [
    "milk",
    "lactose",
    "dairy",
    "cheese",
    "cheddar",
    "mozzarella",
    "parmesan",
    "feta",
    "butter",
    "cream",
    "yogurt",
    "yoghurt",
    "whey",
    "casein",
    "ghee",
    "buttermilk",
    "ricotta",
  ],
  lactose: [
    "milk",
    "lactose",
    "dairy",
    "cheese",
    "butter",
    "cream",
    "yogurt",
    "yoghurt",
    "whey",
    "buttermilk",
    "ice cream",
  ],
  dairy: [
    "milk",
    "lactose",
    "dairy",
    "cheese",
    "butter",
    "cream",
    "yogurt",
    "yoghurt",
    "whey",
    "casein",
    "ghee",
  ],
  egg: ["egg", "eggs", "egg yolk", "egg white", "mayonnaise", "mayo", "aioli", "meringue"],
  eggs: ["egg", "eggs", "egg yolk", "egg white", "mayonnaise", "mayo", "aioli", "meringue"],
  wheat: [
    "wheat",
    "gluten",
    "flour",
    "all-purpose flour",
    "bread",
    "pasta",
    "noodles",
    "couscous",
    "breadcrumbs",
    "seitan",
    "soy sauce",
  ],
  gluten: [
    "gluten",
    "wheat",
    "flour",
    "barley",
    "rye",
    "bread",
    "pasta",
    "couscous",
    "breadcrumbs",
    "seitan",
    "beer",
  ],
  soy: ["soy", "soya", "soybean", "soy sauce", "tofu", "edamame", "tempeh", "miso", "tamari"],
  fish: [
    "fish",
    "salmon",
    "tuna",
    "cod",
    "hake",
    "tilapia",
    "trout",
    "sardine",
    "anchovy",
    "anchovies",
    "mackerel",
    "fish sauce",
  ],
  shellfish: [
    "shellfish",
    "shrimp",
    "prawn",
    "prawns",
    "crab",
    "lobster",
    "mussel",
    "mussels",
    "clam",
    "clams",
    "oyster",
    "scallop",
    "calamari",
  ],
  sesame: ["sesame", "sesame oil", "sesame seed", "sesame seeds", "tahini", "halva"],
};

function expandAllergenTokens(label: string): string[] {
  const tokens = new Set<string>();
  const cleaned = label.trim().toLowerCase();
  if (!cleaned) return [];
  tokens.add(cleaned);
  for (const part of cleaned.split(/[/,&]+/)) {
    const p = part.trim();
    if (p.length >= 2) {
      tokens.add(p);
      const synonyms = ALLERGEN_SYNONYMS[p] ?? ALLERGEN_SYNONYMS[p.replace(/s$/, "")];
      if (synonyms) {
        for (const syn of synonyms) tokens.add(syn);
      }
    }
  }
  return Array.from(tokens);
}

/** Anything the user must not be served: allergies, intolerances, restrictions, dislikes. */
export function avoidTerms(prefs: FoodPreferences): string[] {
  return [
    ...(prefs.allergies ?? []),
    ...(prefs.intolerances ?? []),
    ...(prefs.dietary_restrictions ?? []),
    ...(prefs.disliked_foods ?? []),
  ]
    .flatMap((t) => expandAllergenTokens(t))
    .filter((t) => t.length >= 2);
}

export function isAvoided(
  prefs: FoodPreferences,
  ...text: (string | null | undefined | string[])[]
): boolean {
  const hay = haystack(...text);
  if (!hay) return false;
  return avoidTerms(prefs).some((term) => hay.includes(term));
}

const UNCERTAIN_INGREDIENT_REGEX =
  /\b(sauce|dressing|marinade|glaze|stock|broth|bouillon|seasoning|spice\s*blend|mixed\s*vegetables|breading|batter|curry\s*paste|gravy)\b/i;

export type AllergenSafetyResult = {
  safe: boolean;
  matchedAllergens: string[];
  uncertainIngredients: string[];
  warningSummary: string | null;
};

/** Safety-critical evaluation against known allergies and intolerances. */
export function evaluateRecipeAllergens(
  prefs: FoodPreferences | null | undefined,
  recipe: {
    name?: string | null;
    description?: string | null;
    ingredients?: Array<{ name?: string | null } | string> | null;
  },
): AllergenSafetyResult {
  const criticalItems = [...(prefs?.allergies ?? []), ...(prefs?.intolerances ?? [])]
    .map((x) => x.trim())
    .filter(Boolean);

  if (criticalItems.length === 0) {
    return { safe: true, matchedAllergens: [], uncertainIngredients: [], warningSummary: null };
  }

  const ingredientNames = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .map((ing) => (typeof ing === "string" ? ing : (ing?.name ?? "")))
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const fullText = haystack(recipe.name, recipe.description, ingredientNames);

  const matchedAllergens: string[] = [];
  for (const allergen of criticalItems) {
    const tokens = expandAllergenTokens(allergen);
    if (tokens.some((t) => fullText.includes(t))) {
      matchedAllergens.push(allergen);
    }
  }

  const uncertainIngredients: string[] = [];
  if (ingredientNames.length === 0) {
    uncertainIngredients.push("Full ingredient list unavailable");
  } else {
    for (const ingName of ingredientNames) {
      if (UNCERTAIN_INGREDIENT_REGEX.test(ingName)) {
        uncertainIngredients.push(ingName);
      }
    }
  }

  let warningSummary: string | null = null;
  if (matchedAllergens.length > 0) {
    warningSummary = `Contains or conflicts with saved allergy/intolerance: ${matchedAllergens.join(", ")}.`;
  } else if (uncertainIngredients.length > 0) {
    warningSummary = `Check labels carefully for compound ingredients (${uncertainIngredients.slice(0, 3).join(", ")}).`;
  }

  return {
    safe: matchedAllergens.length === 0,
    matchedAllergens,
    uncertainIngredients,
    warningSummary,
  };
}

/** Higher is a better match for this user. */
export function preferenceScore(
  prefs: FoodPreferences,
  ...text: (string | null | undefined | string[])[]
): number {
  const hay = haystack(...text);
  if (!hay) return 0;
  if (isAvoided(prefs, hay)) return -100;
  let score = 0;
  const likes = Array.from(
    new Set([
      ...(prefs.meal_enjoyments ?? []),
      ...prefs.favorite_foods,
      ...(prefs.preferred_cuisines ?? []),
    ]),
  );
  for (const like of likes) {
    if (like && hay.includes(like.toLowerCase())) score += 3;
  }

  const allGoals = new Set([
    ...(prefs.goal ? [prefs.goal] : []),
    ...(prefs.goals ?? []),
    ...(prefs.health_goals ?? []),
  ]);
  const hasHealthyGoal = Array.from(allGoals).some((g) =>
    /(health|balanced|energy|lose weight|maintain|nutrition)/i.test(g),
  );
  const hasProteinGoal =
    Array.from(allGoals).some((g) => /(gain weight|muscle|fitness|protein)/i.test(g)) ||
    (prefs.meal_enjoyments ?? []).some((e) => /high-protein/i.test(e));
  const hasBudgetGoal =
    Array.from(allGoals).some((g) => /(save money|waste)/i.test(g)) ||
    (prefs.challenges ?? []).some((c) => /(expensive|waste|ingredients i already have)/i.test(c)) ||
    prefs.food_budget === "Budget friendly" ||
    Boolean(
      prefs.budget_range_zar &&
      /(under r800|under r1,000|r800.*r1,500|r1,000[–-]r2,500)/i.test(prefs.budget_range_zar),
    );
  const hasQuickFocus =
    (prefs.challenges ?? []).some((c) => /(time|consistent|never know)/i.test(c)) ||
    (prefs.meal_enjoyments ?? []).some((e) => /quick/i.test(e)) ||
    Boolean(prefs.cooking_time && /(under 15|under 20|15[–-]30)/i.test(prefs.cooking_time));

  if (hasHealthyGoal && /(healthy|salad|veg|grill|light|bowl|fresh|whole)/.test(hay)) score += 2;
  if (hasProteinGoal && /(protein|chicken|beef|steak|egg|bean|lentil|fish)/.test(hay)) score += 2;
  if (hasBudgetGoal && /(budget|value|affordable|simple|deal|pap|bean|stew|one-pot)/.test(hay))
    score += 2;
  if (hasQuickFocus && /(quick|easy|15|20|30|express|simple|wk?night)/.test(hay)) score += 2;

  return score;
}

/** Sort a list so better-matching, non-avoided items come first (stable). */
export function personalize<T>(
  prefs: FoodPreferences | null,
  items: T[],
  textOf: (item: T) => (string | null | undefined | string[])[],
): T[] {
  if (!prefs || !prefs.onboarding_completed) return items;
  return items
    .map((item, i) => ({ item, i, score: preferenceScore(prefs, ...textOf(item)) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.item);
}

/** A short line the AI and UI can use to explain the user's taste. */
export function preferenceSummary(prefs: FoodPreferences): string {
  const bits: string[] = [];
  const allGoals = prefs.goals?.length ? prefs.goals : prefs.goal ? [prefs.goal] : [];
  if (allGoals.length) bits.push(`Goals: ${allGoals.join(", ")}`);
  if (prefs.challenges?.length) bits.push(`Challenges: ${prefs.challenges.join(", ")}`);
  if (prefs.health_goals?.length) bits.push(`Health focus: ${prefs.health_goals.join(", ")}`);
  if (prefs.balanced_nutrition_safeguard) {
    bits.push(
      "Nutrition guidance mode: Balanced nourishment only (no calorie-deficit or weight-loss targets)",
    );
  }
  if (prefs.eating_habits) bits.push(`Habits: ${prefs.eating_habits}`);
  if (prefs.cooking_frequency) bits.push(`Cooking frequency: ${prefs.cooking_frequency}`);
  if (prefs.primary_challenge) bits.push(`Biggest challenge: ${prefs.primary_challenge}`);
  const enjoys = Array.from(new Set([...(prefs.meal_enjoyments ?? []), ...prefs.favorite_foods]));
  if (enjoys.length) bits.push(`Enjoys: ${enjoys.join(", ")}`);
  if (prefs.preferred_cuisines?.length)
    bits.push(`Cuisines: ${prefs.preferred_cuisines.join(", ")}`);
  if (prefs.lifestyles?.length) bits.push(`Lifestyles: ${prefs.lifestyles.join(", ")}`);
  if (prefs.preferred_meal_types?.length)
    bits.push(`Meal types: ${prefs.preferred_meal_types.join(", ")}`);
  if (prefs.allergies.length)
    bits.push(`Allergies (strictly avoid): ${prefs.allergies.join(", ")}`);
  if (prefs.intolerances?.length)
    bits.push(`Intolerances (avoid): ${prefs.intolerances.join(", ")}`);
  if (prefs.dietary_restrictions.length)
    bits.push(`Diet: ${prefs.dietary_restrictions.join(", ")}`);
  if (prefs.disliked_foods.length) bits.push(`Dislikes: ${prefs.disliked_foods.join(", ")}`);
  if (prefs.household_size) bits.push(`Household: ${prefs.household_size}`);
  if (prefs.cooking_time) bits.push(`Time to cook: ${prefs.cooking_time}`);
  if (prefs.cooking_level) bits.push(`Skill: ${prefs.cooking_level}`);
  if (prefs.identity_habit) bits.push(`Identity goal: ${prefs.identity_habit}`);
  if (prefs.budget_range_zar) bits.push(`Monthly ZAR budget: ${prefs.budget_range_zar}`);
  else if (prefs.food_budget) bits.push(`Budget: ${prefs.food_budget}`);
  return bits.join(" · ");
}

const TOUR_KEY = "mealmate.tour-seen.v1";
/** Welcome + app tour shown once per device before sign-up. */
export function hasSeenTour(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(TOUR_KEY) === "1";
  } catch {
    return true;
  }
}
export function markTourSeen(): void {
  try {
    window.localStorage.setItem(TOUR_KEY, "1");
  } catch {
    /* ignore */
  }
}

// MealMate personalization preferences.
// Guests keep answers locally; signed-in users sync them to their profile.

export type ShoppingPreferencesData = {
  category_overrides?: Record<string, string>;
  aisle_order?: string[];
};

export type FoodPreferences = {
  goal: string | null;
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
  preferred_features: string[];
  shopping?: ShoppingPreferencesData | null;
  onboarding_step?: number | null;
  onboarding_completed: boolean;
  updated_at: string | null;
};

export const EMPTY_PREFERENCES: FoodPreferences = {
  goal: null,
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
  preferred_features: [],
  shopping: null,
  onboarding_step: null,
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
  return {
    goal: asString(o["goal"]),
    favorite_foods: asStringArray(o["favorite_foods"]),
    allergies: asStringArray(o["allergies"]),
    intolerances: asStringArray(o["intolerances"]),
    dietary_restrictions: asStringArray(o["dietary_restrictions"]),
    disliked_foods: asStringArray(o["disliked_foods"]),
    preferred_cuisines: asStringArray(o["preferred_cuisines"]),
    lifestyles: asStringArray(o["lifestyles"]),
    preferred_meal_types: asStringArray(o["preferred_meal_types"]),
    meals_per_day: rawMeals ?? householdSize,
    household_size: householdSize,
    preferred_name: asString(o["preferred_name"]),
    cooking_level: asString(o["cooking_level"]),
    cooking_time: normalizeCookingTime(asString(o["cooking_time"])),
    food_budget: asString(o["food_budget"]),
    preferred_features: asStringArray(o["preferred_features"]),
    shopping: asShopping(o["shopping"]),
    onboarding_step: asStepNumber(o["onboarding_step"]),
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
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.localStorage.setItem(SEEN_KEY, "1");
  window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT));
}

export function clearLocalPreferences(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(SEEN_KEY);
  window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT));
}

/** True when the intro has never been shown or dismissed on this device. */
export function shouldOfferOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SEEN_KEY) !== "1";
}

export function markOnboardingSeen(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEEN_KEY, "1");
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
    ...prefs.allergies,
    ...(prefs.intolerances ?? []),
    ...prefs.dietary_restrictions,
    ...prefs.disliked_foods,
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
  for (const like of [...prefs.favorite_foods, ...(prefs.preferred_cuisines ?? [])]) {
    if (like && hay.includes(like.toLowerCase())) score += 3;
  }
  if (
    prefs.goal === "Eat healthier" ||
    prefs.goal === "Lose weight" ||
    prefs.goal === "Eat healthier & balanced"
  ) {
    if (/(healthy|salad|veg|grill|light|bowl)/.test(hay)) score += 2;
  }
  if (
    prefs.goal === "Build muscle" ||
    prefs.goal === "Gain weight" ||
    prefs.goal === "High protein & fitness"
  ) {
    if (/(protein|chicken|beef|steak|egg|bean)/.test(hay)) score += 2;
  }
  if (prefs.goal === "Save money" || prefs.food_budget === "Budget friendly") {
    if (/(budget|value|affordable|simple|deal)/.test(hay)) score += 1;
  }
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
  if (prefs.goal) bits.push(`Goal: ${prefs.goal}`);
  if (prefs.favorite_foods.length) bits.push(`Enjoys: ${prefs.favorite_foods.join(", ")}`);
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
  if (prefs.food_budget) bits.push(`Budget: ${prefs.food_budget}`);
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

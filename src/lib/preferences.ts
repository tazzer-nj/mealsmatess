// MealMate personalization preferences.
// Guests keep answers locally; signed-in users sync them to their profile.

export type FoodPreferences = {
  goal: string | null;
  goals?: string[];
  challenges?: string[];
  health_goals?: string[];
  age_bracket?: string | null;
  balanced_nutrition_safeguard?: boolean;
  eating_habits?: string[];
  cooking_frequency?: string | null;
  biggest_challenge?: string | null;
  meal_enjoyments?: string[];
  preferred_cuisines: string[];
  budget_range_zar?: string | null;
  favorite_foods: string[];
  allergies: string[];
  dietary_restrictions: string[];
  disliked_foods: string[];
  meals_per_day: string | null;
  household_size?: string | null;
  preferred_name?: string | null;
  cooking_level: string | null;
  cooking_time: string | null;
  food_budget: string | null;
  preferred_features: string[];
  discovery_source?: string | null;
  onboarding_step?: number | null;
  onboarding_completed: boolean;
  updated_at: string | null;
};

export type PersonalisationProfile = {
  recommended_categories: string[];
  home_sections: Array<{
    id: string;
    title: string;
    subtitle: string;
    category?: string;
  }>;
  suggested_max_minutes: number | null;
  suggested_difficulty: "Beginner" | "Intermediate" | "Experienced" | null;
  budget_tier: "budget" | "moderate" | "flexible" | null;
  pantry_focus: "zero_waste" | "standard";
  meal_planner_focus:
    | "pantry_first"
    | "budget_conscious"
    | "quick_weeknight"
    | "protein_fitness"
    | "balanced_routine";
  balanced_nutrition_safeguard: boolean;
  strict_exclusions: string[];
  mia_context: string;
  generated_at: string;
};

export const EMPTY_PREFERENCES: FoodPreferences = {
  goal: null,
  goals: [],
  challenges: [],
  health_goals: [],
  age_bracket: null,
  balanced_nutrition_safeguard: false,
  eating_habits: [],
  cooking_frequency: null,
  biggest_challenge: null,
  meal_enjoyments: [],
  preferred_cuisines: [],
  budget_range_zar: null,
  favorite_foods: [],
  allergies: [],
  dietary_restrictions: [],
  disliked_foods: [],
  meals_per_day: null,
  household_size: null,
  preferred_name: null,
  cooking_level: null,
  cooking_time: null,
  food_budget: null,
  preferred_features: [],
  discovery_source: null,
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
  const ageBracket = asString(o["age_bracket"]);
  return {
    goal: asString(o["goal"]),
    goals: asStringArray(o["goals"]),
    challenges: asStringArray(o["challenges"]),
    health_goals: asStringArray(o["health_goals"]),
    age_bracket: ageBracket,
    balanced_nutrition_safeguard:
      o["balanced_nutrition_safeguard"] === true || ageBracket === "under_18",
    eating_habits: asStringArray(o["eating_habits"]),
    cooking_frequency: asString(o["cooking_frequency"]),
    biggest_challenge: asString(o["biggest_challenge"]),
    meal_enjoyments: asStringArray(o["meal_enjoyments"]),
    preferred_cuisines: asStringArray(o["preferred_cuisines"]),
    budget_range_zar: asString(o["budget_range_zar"]),
    favorite_foods: asStringArray(o["favorite_foods"]),
    allergies: asStringArray(o["allergies"]),
    dietary_restrictions: asStringArray(o["dietary_restrictions"]),
    disliked_foods: asStringArray(o["disliked_foods"]),
    meals_per_day: rawMeals ?? householdSize,
    household_size: householdSize,
    preferred_name: asString(o["preferred_name"]),
    cooking_level: asString(o["cooking_level"]),
    cooking_time: normalizeCookingTime(asString(o["cooking_time"])),
    food_budget: asString(o["food_budget"]),
    preferred_features: asStringArray(o["preferred_features"]),
    discovery_source: asString(o["discovery_source"]),
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

// ---------- safety-critical allergen & restriction checks ----------

const ALLERGEN_SYNONYMS: Record<string, string[]> = {
  peanuts: ["peanut", "peanuts", "groundnut", "groundnuts", "satay", "arachis", "monkey nut"],
  "tree nuts": [
    "tree nut",
    "tree nuts",
    "almond",
    "almonds",
    "walnut",
    "walnuts",
    "cashew",
    "cashews",
    "pecan",
    "pecans",
    "hazelnut",
    "hazelnuts",
    "pistachio",
    "pistachios",
    "macadamia",
    "brazil nut",
    "pine nut",
    "praline",
    "marzipan",
    "nutella",
  ],
  "milk / lactose": [
    "milk",
    "lactose",
    "dairy",
    "butter",
    "cream",
    "cheese",
    "cheddar",
    "mozzarella",
    "parmesan",
    "feta",
    "yogurt",
    "yoghurt",
    "whey",
    "casein",
    "ghee",
    "paneer",
    "custard",
  ],
  eggs: ["egg", "eggs", "mayonnaise", "mayo", "aioli", "meringue", "albumin"],
  "wheat / gluten": [
    "wheat",
    "gluten",
    "flour",
    "bread",
    "pasta",
    "spaghetti",
    "fettuccine",
    "penne",
    "macaroni",
    "couscous",
    "barley",
    "rye",
    "semolina",
    "breadcrumbs",
    "bun",
    "buns",
    "pita",
    "tortilla",
  ],
  soy: ["soy", "soya", "tofu", "tempeh", "edamame", "miso", "tamari", "soybean"],
  fish: [
    "fish",
    "salmon",
    "tuna",
    "cod",
    "hake",
    "snoek",
    "haddock",
    "anchovy",
    "anchovies",
    "sardine",
    "mackerel",
    "trout",
    "worcestershire",
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
    "oyster",
    "oysters",
    "clam",
    "clams",
    "scallop",
    "scallops",
    "calamari",
    "squid",
    "langoustine",
  ],
  sesame: ["sesame", "tahini", "halva", "hummus", "gomashio"],
};

const DIETARY_EXCLUSION_PATTERNS: Record<string, RegExp> = {
  halal: /\b(pork|bacon|ham|prosciutto|pancetta|pepperoni|lard|alcohol|wine|beer|rum|brandy)\b/i,
  kosher: /\b(pork|bacon|ham|shellfish|shrimp|prawn|crab|lobster|mussel|oyster|clam|calamari)\b/i,
  vegetarian:
    /\b(beef|steak|chicken|pork|bacon|lamb|mutton|veal|duck|turkey|venison|boerewors|wors|mince|fish|salmon|tuna|shrimp|prawn|sausage|ham)\b/i,
  vegan:
    /\b(beef|steak|chicken|pork|bacon|lamb|mutton|fish|salmon|tuna|shrimp|prawn|egg|eggs|milk|butter|cheese|cream|yogurt|yoghurt|honey|ghee|whey|casein)\b/i,
  pescatarian:
    /\b(beef|steak|chicken|pork|bacon|lamb|mutton|veal|duck|turkey|boerewors|wors|ham)\b/i,
  "dairy-free": /\b(milk|dairy|butter|cream|cheese|yogurt|yoghurt|whey|casein|ghee|paneer)\b/i,
  "gluten-free": /\b(wheat|gluten|flour|bread|pasta|couscous|barley|rye|semolina|breadcrumbs)\b/i,
};

const COMPOUND_INGREDIENT_RE =
  /\b(marinade|sauce|glaze|seasoning|dressing|stock|broth|spice blend|paste|gravy|rub)\b/i;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function haystack(...parts: (string | null | undefined | string[])[]): string {
  return parts
    .flatMap((p) => (Array.isArray(p) ? p : [p]))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function ingredientNamesFromList(ingredients: unknown): string[] {
  if (!Array.isArray(ingredients)) return [];
  return ingredients
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "name" in item) {
        return String((item as { name?: unknown }).name ?? "");
      }
      return "";
    })
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Anything the user must not be served: allergies, restrictions, dislikes. */
export function avoidTerms(prefs: FoodPreferences): string[] {
  return [...prefs.allergies, ...prefs.dietary_restrictions, ...prefs.disliked_foods]
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 2 && t !== "none");
}

export function isAvoided(
  prefs: FoodPreferences,
  ...text: (string | null | undefined | string[])[]
): boolean {
  const hay = haystack(...text);
  if (!hay) return false;
  for (const allergy of prefs.allergies) {
    const key = allergy.trim().toLowerCase();
    if (!key || key === "none") continue;
    const synonyms = ALLERGEN_SYNONYMS[key] ?? [key];
    if (synonyms.some((syn) => new RegExp(`\\b${escapeRegex(syn)}`, "i").test(hay))) {
      return true;
    }
  }
  for (const diet of prefs.dietary_restrictions) {
    const key = diet.trim().toLowerCase();
    if (!key || key === "none") continue;
    const re = DIETARY_EXCLUSION_PATTERNS[key];
    if (re && re.test(hay)) return true;
  }
  return avoidTerms(prefs).some((term) => hay.includes(term));
}

export type AllergenEvaluation = {
  safe: boolean;
  matchedAllergens: string[];
  uncertainIngredients: string[];
  warningSummary: string | null;
};

export function evaluateRecipeAllergens(
  prefs: FoodPreferences | null | undefined,
  recipe: {
    name?: string | null;
    description?: string | null;
    ingredients?: unknown;
  },
): AllergenEvaluation {
  if (!prefs) {
    return {
      safe: true,
      matchedAllergens: [],
      uncertainIngredients: [],
      warningSummary: null,
    };
  }
  const activeAllergies = (prefs.allergies ?? []).filter(
    (a) => a.trim() && a.trim().toLowerCase() !== "none",
  );
  const ingredientNames = ingredientNamesFromList(recipe.ingredients);
  const fullText = haystack(recipe.name, recipe.description, ingredientNames);

  const matchedAllergens: string[] = [];
  for (const allergy of activeAllergies) {
    const key = allergy.trim().toLowerCase();
    const synonyms = ALLERGEN_SYNONYMS[key] ?? [key];
    const hasMatch = synonyms.some((syn) =>
      new RegExp(`\\b${escapeRegex(syn)}`, "i").test(fullText),
    );
    if (hasMatch) {
      matchedAllergens.push(allergy);
    }
  }

  const uncertainIngredients: string[] = [];
  if (activeAllergies.length > 0 && matchedAllergens.length === 0) {
    for (const name of ingredientNames) {
      if (COMPOUND_INGREDIENT_RE.test(name)) {
        uncertainIngredients.push(name);
      }
    }
  }

  const safe = matchedAllergens.length === 0;
  let warningSummary: string | null = null;
  if (matchedAllergens.length > 0) {
    warningSummary = `Contains or may include declared allergen(s): ${matchedAllergens.join(", ")}.`;
  } else if (uncertainIngredients.length > 0) {
    warningSummary = `Check labels carefully for compound ingredients (${uncertainIngredients.join(", ")}) regarding your allergies (${activeAllergies.join(", ")}).`;
  }

  return {
    safe,
    matchedAllergens,
    uncertainIngredients,
    warningSummary,
  };
}

// ---------- personalization scoring ----------

export type ScorableRecipe = {
  name?: string | null;
  description?: string | null;
  category?: string | null;
  cuisine?: string | null;
  prepTime?: string | null;
  cookTime?: string | null;
  cooking_time_minutes?: number | null;
  difficulty?: string | null;
  diet_tags?: string[] | null;
  ingredients?: unknown;
};

function parseRecipeTotalMinutes(recipe: ScorableRecipe): number | null {
  if (typeof recipe.cooking_time_minutes === "number" && recipe.cooking_time_minutes > 0) {
    return recipe.cooking_time_minutes;
  }
  const parseMins = (s?: string | null) => {
    if (!s) return 0;
    const m = /(\d+)/.exec(s);
    return m ? Number(m[1]) : 0;
  };
  const sum = parseMins(recipe.prepTime) + parseMins(recipe.cookTime);
  return sum > 0 ? sum : null;
}

function isRecipeObject(value: unknown): value is ScorableRecipe {
  return (
    typeof value === "object" &&
    value !== null &&
    !("allergies" in value) &&
    !("favorite_foods" in value)
  );
}

/** Higher is a better match for this user. Accepts either `(prefs, ...text)` or `(recipe, prefs)`. */
export function preferenceScore(
  first: FoodPreferences | ScorableRecipe,
  ...rest: unknown[]
): number {
  let prefs: FoodPreferences;
  let hay: string;
  let recipeObj: ScorableRecipe | null = null;

  if (isRecipeObject(first) && rest[0] && typeof rest[0] === "object") {
    recipeObj = first;
    prefs = rest[0] as FoodPreferences;
    hay = haystack(
      first.name,
      first.description,
      first.category,
      first.cuisine,
      first.difficulty,
      first.diet_tags ?? [],
      ingredientNamesFromList(first.ingredients),
    );
  } else {
    prefs = first as FoodPreferences;
    hay = haystack(...(rest as (string | null | undefined | string[])[]));
  }

  if (!hay) return 0;
  if (isAvoided(prefs, hay)) return -200;

  let score = 0;
  const likes = [
    ...prefs.favorite_foods,
    ...(prefs.meal_enjoyments ?? []),
    ...(prefs.preferred_cuisines ?? []),
  ];
  for (const like of likes) {
    const cleaned = like.trim().toLowerCase();
    if (!cleaned) continue;
    const tokens = cleaned.split(/[\s/-]+/).filter((w) => w.length > 3);
    if (hay.includes(cleaned) || tokens.some((tok) => hay.includes(tok))) {
      score += 3;
    }
  }

  const goals = [
    ...(prefs.goals ?? []),
    ...(prefs.health_goals ?? []),
    ...(prefs.goal ? [prefs.goal] : []),
  ].join(" ");
  if (/(eat healthier|lose weight|balanced|energy)/i.test(goals)) {
    if (/(healthy|salad|veg|grill|light|bowl|quinoa)/i.test(hay)) score += 2;
  }
  if (
    /(build muscle|gain weight|high-protein|fitness)/i.test(
      goals + " " + (prefs.meal_enjoyments ?? []).join(" "),
    )
  ) {
    if (/(protein|chicken|beef|steak|egg|bean|fish)/i.test(hay)) score += 2;
  }
  if (
    /(save money|budget)/i.test(
      goals + " " + (prefs.food_budget ?? "") + " " + (prefs.budget_range_zar ?? ""),
    )
  ) {
    if (/(budget|value|affordable|simple|bean|rice|pap|chicken|stew)/i.test(hay)) score += 1;
  }

  if (recipeObj) {
    const mins = parseRecipeTotalMinutes(recipeObj);
    if (mins !== null && prefs.cooking_time) {
      if (/under 15/i.test(prefs.cooking_time) && mins <= 15) score += 3;
      else if (/15[–-]30/i.test(prefs.cooking_time) && mins <= 30) score += 2;
      else if (/30[–-]60/i.test(prefs.cooking_time) && mins <= 60) score += 1;
    }
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
  const goals = prefs.goals?.length ? prefs.goals.join(", ") : prefs.goal;
  if (goals) bits.push(`Goal: ${goals}`);
  const likes = Array.from(
    new Set([
      ...prefs.favorite_foods,
      ...(prefs.meal_enjoyments ?? []),
      ...(prefs.preferred_cuisines ?? []),
    ]),
  );
  if (likes.length) bits.push(`Enjoys: ${likes.join(", ")}`);
  if (prefs.allergies.length) bits.push(`Must avoid: ${prefs.allergies.join(", ")}`);
  if (prefs.dietary_restrictions.length)
    bits.push(`Diet: ${prefs.dietary_restrictions.join(", ")}`);
  if (prefs.disliked_foods.length) bits.push(`Dislikes: ${prefs.disliked_foods.join(", ")}`);
  if (prefs.cooking_time) bits.push(`Time to cook: ${prefs.cooking_time}`);
  if (prefs.cooking_level) bits.push(`Skill: ${prefs.cooking_level}`);
  if (prefs.budget_range_zar || prefs.food_budget) {
    bits.push(`Budget: ${prefs.budget_range_zar || prefs.food_budget}`);
  }
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

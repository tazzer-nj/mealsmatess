export const DEFAULT_SHOPPING_CATEGORIES = [
  "Fruits and vegetables",
  "Meat and seafood",
  "Dairy and eggs",
  "Bakery",
  "Frozen foods",
  "Pantry and dry goods",
  "Beverages",
  "Snacks",
  "Household and cleaning",
  "Personal care",
] as const;

export type ShoppingCategory = (typeof DEFAULT_SHOPPING_CATEGORIES)[number];

export type ShoppingPreferences = {
  category_overrides: Record<string, string>;
  aisle_order: string[];
};

const SHOPPING_PREFS_STORAGE_KEY = "mealmate.shopping-prefs.v1";
export const SHOPPING_PREFS_EVENT = "mealmate:shopping-prefs";

const LEGACY_CATEGORY_MAP: Record<string, ShoppingCategory> = {
  produce: "Fruits and vegetables",
  "fruits & vegetables": "Fruits and vegetables",
  "fruits and vegetables": "Fruits and vegetables",
  vegetables: "Fruits and vegetables",
  fruits: "Fruits and vegetables",
  meat: "Meat and seafood",
  "meat & seafood": "Meat and seafood",
  "meat and seafood": "Meat and seafood",
  seafood: "Meat and seafood",
  butcher: "Meat and seafood",
  dairy: "Dairy and eggs",
  "dairy & eggs": "Dairy and eggs",
  "dairy and eggs": "Dairy and eggs",
  eggs: "Dairy and eggs",
  bakery: "Bakery",
  bread: "Bakery",
  frozen: "Frozen foods",
  "frozen foods": "Frozen foods",
  pantry: "Pantry and dry goods",
  "pantry & dry goods": "Pantry and dry goods",
  "pantry and dry goods": "Pantry and dry goods",
  grains: "Pantry and dry goods",
  spices: "Pantry and dry goods",
  condiments: "Pantry and dry goods",
  beverages: "Beverages",
  drinks: "Beverages",
  snacks: "Snacks",
  household: "Household and cleaning",
  "household & cleaning": "Household and cleaning",
  "household and cleaning": "Household and cleaning",
  cleaning: "Household and cleaning",
  "personal care": "Personal care",
  toiletries: "Personal care",
  "health and beauty": "Personal care",
};

export function normalizeShoppingCategory(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const cleaned = raw.trim();
  if (!cleaned) return null;
  const exact = DEFAULT_SHOPPING_CATEGORIES.find((c) => c.toLowerCase() === cleaned.toLowerCase());
  if (exact) return exact;
  return LEGACY_CATEGORY_MAP[cleaned.toLowerCase()] ?? cleaned;
}

export function normalizeItemKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeAisleOrder(order?: string[] | null): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const cat of order ?? []) {
    const normalized = normalizeShoppingCategory(cat);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }
  for (const cat of DEFAULT_SHOPPING_CATEGORIES) {
    if (!seen.has(cat)) {
      seen.add(cat);
      result.push(cat);
    }
  }
  return result;
}

export function readLocalShoppingPreferences(): ShoppingPreferences {
  if (typeof window === "undefined") {
    return { category_overrides: {}, aisle_order: [...DEFAULT_SHOPPING_CATEGORIES] };
  }
  try {
    const raw = window.localStorage.getItem(SHOPPING_PREFS_STORAGE_KEY);
    if (!raw) {
      return { category_overrides: {}, aisle_order: [...DEFAULT_SHOPPING_CATEGORIES] };
    }
    const parsed = JSON.parse(raw) as Partial<ShoppingPreferences>;
    return {
      category_overrides:
        parsed.category_overrides && typeof parsed.category_overrides === "object"
          ? parsed.category_overrides
          : {},
      aisle_order: normalizeAisleOrder(parsed.aisle_order),
    };
  } catch {
    return { category_overrides: {}, aisle_order: [...DEFAULT_SHOPPING_CATEGORIES] };
  }
}

export function writeLocalShoppingPreferences(prefs: ShoppingPreferences): ShoppingPreferences {
  const normalized: ShoppingPreferences = {
    category_overrides: { ...(prefs.category_overrides ?? {}) },
    aisle_order: normalizeAisleOrder(prefs.aisle_order),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SHOPPING_PREFS_STORAGE_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent(SHOPPING_PREFS_EVENT));
    } catch {
      /* ignore */
    }
  }
  return normalized;
}

// Ordered contextual rules. Household & Cleaning and Snacks/Bakery run BEFORE frozen/personal care
// so items like "dishwasher tablets" never become Personal care and "biscuits" never become Frozen foods.
const HOUSEHOLD_REGEX =
  /\b(dishwasher\s*(?:tablet|tablets|pod|pods|detergent|gel|salt|rinse)|dish\s*soap|dishwashing|washing\s*up\s*liquid|laundry|detergent|fabric\s*softener|bleach|disinfectant|cleaner|cleaning\s*spray|surface\s*spray|sponge|scourer|mop|broom|trash\s*bag|bin\s*liner|refuse\s*bag|garbage\s*bag|toilet\s*paper|paper\s*towel|kitchen\s*roll|aluminium\s*foil|aluminum\s*foil|cling\s*wrap|plastic\s*wrap|parchment\s*paper|baking\s*paper|matchbox|matches|light\s*bulb|batteries)\b/i;

const SNACKS_SAFE_REGEX =
  /\b(biscuit|biscuits|cookie|cookies|shortbread|rusk|rusks|cracker|crackers|wafer|wafers|oatcake|chips|crisps|popcorn|pretzel|pretzels|trail\s*mix|granola\s*bar|protein\s*bar|muesli\s*bar|chocolate|candy|sweets|gummies|biltong|droewors|dried\s*fruit|roasted\s*nuts|salted\s*nuts|rice\s*cake|corn\s*chips|tortilla\s*chips)\b/i;

const PERSONAL_CARE_REGEX =
  /\b(shampoo|conditioner|body\s*wash|shower\s*gel|soap\s*bar|hand\s*soap|toothpaste|toothbrush|mouthwash|dental\s*floss|deodorant|antiperspirant|body\s*lotion|hand\s*cream|moisturizer|moisturiser|sunscreen|spf|razor|shaving\s*(?:cream|foam|gel)|tampon|sanitary\s*pad|panty\s*liner|cotton\s*(?:pad|swab|bud)|face\s*wash|cleanser|lip\s*balm|tissue|tissues|nappy|diaper|wet\s*wipes|baby\s*wipes)\b/i;

const FROZEN_REGEX =
  /\b(frozen|ice\s*cream|gelato|sorbet|popsicle|ice\s*lolly|fish\s*fingers|frozen\s*pizza|frozen\s*peas|frozen\s*berries|frozen\s*corn|frozen\s*fries|frozen\s*waffles)\b/i;

const PRODUCE_REGEX =
  /\b(apple|apples|banana|bananas|spinach|onion|onions|garlic|tomato|tomatoes|cherry\s*tomato|potato|potatoes|sweet\s*potato|carrot|carrots|avocado|avocados|lemon|lemons|lime|limes|orange|oranges|strawberry|strawberries|blueberry|blueberries|raspberry|raspberries|mango|pineapple|watermelon|grape|grapes|pear|peach|plum|mushroom|mushrooms|bell\s*pepper|peppers|capsicum|chili|chilli|jalapeno|broccoli|cauliflower|lettuce|romaine|arugula|rocket|kale|cilantro|coriander|parsley|basil|mint|thyme|rosemary|oregano|dill|chive|chives|ginger|cucumber|zucchini|courgette|eggplant|aubergine|cabbage|celery|corn\s*on|leek|shallot|spring\s*onion|scallion|beetroot|radish|asparagus|green\s*bean|pumpkin|butternut|squash|pea\s*shoots|fresh\s*peas)\b/i;

const MEAT_SEAFOOD_REGEX =
  /\b(chicken|beef|steak|sirloin|ribeye|brisket|pork|bacon|ham|gammon|sausage|boerewors|chorizo|lamb|mutton|veal|mince|ground\s*beef|ground\s*turkey|turkey|duck|venison|salmon|tuna|trout|cod|hake|kingklip|tilapia|sardine|anchovy|anchovies|mackerel|shrimp|prawn|prawns|crab|lobster|calamari|squid|mussel|mussels|clam|clams|oyster|scallop|seafood)\b/i;

const DAIRY_EGGS_REGEX =
  /\b(milk|whole\s*milk|skim\s*milk|oat\s*milk|almond\s*milk|soy\s*milk|cheese|cheddar|mozzarella|parmesan|feta|gouda|ricotta|brie|halloumi|cream\s*cheese|cottage\s*cheese|butter|margarine|ghee|yogurt|yoghurt|greek\s*yogurt|cream|heavy\s*cream|double\s*cream|sour\s*cream|creme\s*fraiche|whipping\s*cream|buttermilk|kefir|egg|eggs|egg\s*white|egg\s*yolk)\b/i;

const BAKERY_REGEX =
  /\b(bread|sourdough|baguette|ciabatta|focaccia|bagel|bagels|roll|rolls|brioche|bun|buns|croissant|muffin|muffins|tortilla|tortillas|wrap|wraps|pita|naan|flatbread|roti|english\s*muffin|loaf|crouton|croutons|pastry|pie\s*crust)\b/i;

const BEVERAGES_REGEX =
  /\b(coffee|espresso|tea|green\s*tea|rooibos|matcha|juice|orange\s*juice|apple\s*juice|sparkling\s*water|mineral\s*water|bottled\s*water|soda|cola|tonic|ginger\s*beer|lemonade|iced\s*tea|kombucha|wine|beer|cider|hot\s*chocolate|cocoa\s*drink|energy\s*drink)\b/i;

export function categorizeGroceryItem(
  name: string,
  options?: { explicitCategory?: string | null; overrides?: Record<string, string> },
): string {
  const key = normalizeItemKey(name);
  const singularKey = key.replace(/s$/, "");
  const overrides = options?.overrides ?? {};
  const overrideMatch =
    overrides[key] ??
    overrides[singularKey] ??
    overrides[`${singularKey}s`] ??
    overrides[name.trim().toLowerCase()];
  if (overrideMatch) {
    const normalizedOverride = normalizeShoppingCategory(overrideMatch);
    if (normalizedOverride) return normalizedOverride;
  }

  const explicit = normalizeShoppingCategory(options?.explicitCategory);
  if (explicit && DEFAULT_SHOPPING_CATEGORIES.includes(explicit as ShoppingCategory)) {
    // Even if an external AI or template returned an explicit bad category, guard critical misclassifications:
    if (HOUSEHOLD_REGEX.test(name) && explicit === "Personal care") {
      return "Household and cleaning";
    }
    if (SNACKS_SAFE_REGEX.test(name) && explicit === "Frozen foods") {
      return "Snacks";
    }
    return explicit;
  }

  if (HOUSEHOLD_REGEX.test(name)) return "Household and cleaning";
  if (SNACKS_SAFE_REGEX.test(name)) return "Snacks";
  if (PERSONAL_CARE_REGEX.test(name)) return "Personal care";
  if (FROZEN_REGEX.test(name)) return "Frozen foods";
  if (PRODUCE_REGEX.test(name)) return "Fruits and vegetables";
  if (MEAT_SEAFOOD_REGEX.test(name)) return "Meat and seafood";
  if (DAIRY_EGGS_REGEX.test(name)) return "Dairy and eggs";
  if (BAKERY_REGEX.test(name)) return "Bakery";
  if (BEVERAGES_REGEX.test(name)) return "Beverages";
  return "Pantry and dry goods";
}

type ParsedQuantity = {
  value: number;
  unit: string;
};

function normalizeUnit(rawUnit: string): { unit: string; factor: number } {
  const u = rawUnit.trim().toLowerCase().replace(/\.$/, "");
  if (u === "kg" || u === "kilogram" || u === "kilograms") return { unit: "g", factor: 1000 };
  if (u === "g" || u === "gram" || u === "grams") return { unit: "g", factor: 1 };
  if (u === "l" || u === "liter" || u === "liters" || u === "litre" || u === "litres")
    return { unit: "ml", factor: 1000 };
  if (
    u === "ml" ||
    u === "milliliter" ||
    u === "milliliters" ||
    u === "millilitre" ||
    u === "millilitres"
  )
    return { unit: "ml", factor: 1 };
  if (u === "cups") return { unit: "cup", factor: 1 };
  if (u === "tablespoon" || u === "tablespoons" || u === "tbsps")
    return { unit: "tbsp", factor: 1 };
  if (u === "teaspoon" || u === "teaspoons" || u === "tsps") return { unit: "tsp", factor: 1 };
  if (u === "cloves") return { unit: "clove", factor: 1 };
  if (u === "cans") return { unit: "can", factor: 1 };
  if (u === "slices") return { unit: "slice", factor: 1 };
  if (u === "pieces" || u === "pcs") return { unit: "piece", factor: 1 };
  return { unit: u, factor: 1 };
}

function parseNumberToken(raw: string): number | null {
  const mixed = /^(\d+)\s+(\d+)\/(\d+)$/.exec(raw.trim());
  if (mixed) {
    const den = Number(mixed[3]);
    return den > 0 ? Number(mixed[1]) + Number(mixed[2]) / den : null;
  }
  const frac = /^(\d+)\/(\d+)$/.exec(raw.trim());
  if (frac) {
    const den = Number(frac[2]);
    return den > 0 ? Number(frac[1]) / den : null;
  }
  const num = Number(raw.replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

export function parseQuantity(raw: string | null | undefined): ParsedQuantity | null {
  if (!raw || typeof raw !== "string") return null;
  const cleaned = raw.trim();
  if (!cleaned) return null;
  const match = /^(\d+(?:\s+\d+\/\d+|\/\d+|[.,]\d+)?)\s*([a-zA-Z]*)$/.exec(cleaned);
  if (!match?.[1]) return null;
  const num = parseNumberToken(match[1]);
  if (num === null) return null;
  const { unit, factor } = normalizeUnit(match[2] ?? "");
  return { value: num * factor, unit };
}

export function formatParsedQuantity(pq: ParsedQuantity): string {
  if (pq.unit === "g" && pq.value >= 1000 && pq.value % 100 === 0) {
    return `${Number((pq.value / 1000).toFixed(2))}kg`;
  }
  if (pq.unit === "ml" && pq.value >= 1000 && pq.value % 100 === 0) {
    return `${Number((pq.value / 1000).toFixed(2))}l`;
  }
  const rounded = Number(pq.value.toFixed(2));
  return pq.unit ? `${rounded}${pq.unit.length <= 2 ? "" : " "}${pq.unit}` : String(rounded);
}

export function combineQuantities(
  existing: string | null | undefined,
  incoming: string | null | undefined,
): string | null {
  const a = existing?.trim() || null;
  const b = incoming?.trim() || null;
  if (!a) return b;
  if (!b) return a;
  if (a.toLowerCase() === b.toLowerCase()) return `${a} (×2)`;

  const pa = parseQuantity(a);
  const pb = parseQuantity(b);
  if (pa && pb && pa.unit === pb.unit) {
    return formatParsedQuantity({ value: pa.value + pb.value, unit: pa.unit });
  }
  return `${a} + ${b}`;
}

export type ConsolidatableIngredient = {
  name: string;
  quantity?: string | null;
  category?: string | null;
};

export function consolidateIngredients(
  items: ConsolidatableIngredient[],
  options?: { overrides?: Record<string, string>; servingsMultiplier?: number },
): { name: string; quantity: string | null; category: string }[] {
  const map = new Map<string, { name: string; quantity: string | null; category: string }>();
  const mult =
    options?.servingsMultiplier && options.servingsMultiplier > 0 ? options.servingsMultiplier : 1;

  for (const item of items) {
    const rawName = item.name?.trim();
    if (!rawName) continue;
    const key = normalizeItemKey(rawName).replace(/s$/, "");
    let qty = item.quantity?.trim() || null;
    if (qty && mult !== 1) {
      const parsed = parseQuantity(qty);
      if (parsed) {
        qty = formatParsedQuantity({ value: parsed.value * mult, unit: parsed.unit });
      }
    }
    const category = categorizeGroceryItem(rawName, {
      explicitCategory: item.category,
      overrides: options?.overrides,
    });
    const current = map.get(key);
    if (!current) {
      map.set(key, { name: rawName, quantity: qty, category });
    } else {
      current.quantity = combineQuantities(current.quantity, qty);
    }
  }

  return Array.from(map.values());
}

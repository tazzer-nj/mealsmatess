import { isRecipeSafeForUser } from "@/lib/mia-companion";
import type { FoodPreferences } from "@/lib/preferences";
import type { CatalogRecipe } from "@/lib/recipe-catalog";

export type SeasonalCollection = {
  id: string;
  title: string;
  subtitle: string;
  seasonLabel: string;
  monthsLabel: string;
  recipes: CatalogRecipe[];
};

type SeasonRule = {
  id: string;
  title: string;
  subtitle: string;
  seasonLabel: string;
  monthsLabel: string;
  months: number[]; // 1..12
  keywords: RegExp;
};

// Southern Hemisphere / South African seasons anchored to calendar months
const SEASON_RULES: SeasonRule[] = [
  {
    id: "festive-table",
    title: "Festive Table & Sharing Dishes",
    subtitle: "Warm-weather gatherings and celebratory family favourites",
    seasonLabel: "Festive Season",
    monthsLabel: "December",
    months: [12],
    keywords: /(bobotie|roast|cake|tart|pudding|braai|salad|chicken|lamb|feast)/i,
  },
  {
    id: "summer-braai-fresh",
    title: "Summer Braai & Fresh Bowls",
    subtitle: "Crisp salads, grilled cuts, and vibrant sunny-day meals",
    seasonLabel: "Summer",
    monthsLabel: "Dec – Feb",
    months: [12, 1, 2],
    keywords: /(salad|bowl|grill|braai|fresh|lemon|chicken|avocado|fish|smoothie|mango|mint)/i,
  },
  {
    id: "autumn-harvest",
    title: "Autumn Harvest & One-Pot Meals",
    subtitle: "Golden roasted vegetables, spiced curries, and weeknight pastas",
    seasonLabel: "Autumn",
    monthsLabel: "Mar – May",
    months: [3, 4, 5],
    keywords: /(curry|pasta|bake|roast|pumpkin|butternut|spiced|bobotie|mushroom|garlic)/i,
  },
  {
    id: "winter-warmth",
    title: "Winter Potjie & Warm Comfort",
    subtitle: "Slow-simmered stews, hearty soups, and warming kitchen classics",
    seasonLabel: "Winter",
    monthsLabel: "Jun – Aug",
    months: [6, 7, 8],
    keywords: /(potjie|stew|soup|curry|slow|braise|beef|lamb|oats|porridge|bake|chakalaka)/i,
  },
  {
    id: "spring-bright",
    title: "Spring Light & Crisp Kitchen",
    subtitle: "Bright herbs, lighter proteins, and quick 25-minute weeknight plates",
    seasonLabel: "Spring",
    monthsLabel: "Sep – Nov",
    months: [9, 10, 11],
    keywords: /(salad|bowl|herb|lemon|green|veg|quinoa|egg|toast|pancake|salmon)/i,
  },
];

export function getSeasonalCollectionsForDate(
  date: Date = new Date(),
  recipes: CatalogRecipe[] = [],
  prefs: FoodPreferences | null | undefined = null,
): SeasonalCollection[] {
  const month = date.getMonth() + 1;
  const activeRules = SEASON_RULES.filter((rule) => rule.months.includes(month));
  const rulesToUse = activeRules.length > 0 ? activeRules : [SEASON_RULES[1]!];

  const safeRecipes = recipes.filter((r) => isRecipeSafeForUser(r, prefs));
  const pool = safeRecipes.length > 0 ? safeRecipes : recipes;

  return rulesToUse.map((rule) => {
    const matched = pool.filter((r) => {
      const hay = `${r.name} ${r.description ?? ""} ${r.cuisine ?? ""} ${r.category ?? ""} ${(r.diet_tags ?? []).join(" ")}`;
      return rule.keywords.test(hay);
    });
    const finalRecipes = (matched.length >= 3 ? matched : pool).slice(0, 6);
    return {
      id: rule.id,
      title: rule.title,
      subtitle: rule.subtitle,
      seasonLabel: rule.seasonLabel,
      monthsLabel: rule.monthsLabel,
      recipes: finalRecipes,
    };
  });
}

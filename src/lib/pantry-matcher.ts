import { normalizeItemKey } from "@/lib/grocery-categorizer";
import type { CatalogRecipe } from "@/lib/recipe-catalog";

export type PantryMatchInfo = {
  matchRatio: number;
  matchedCount: number;
  totalIngredients: number;
  missingIngredients: string[];
};

export function matchRecipeToPantry(
  recipe: Pick<CatalogRecipe, "ingredients">,
  pantryNames: string[],
): PantryMatchInfo {
  const pantryTokens = pantryNames
    .map((n) => normalizeItemKey(n).replace(/s$/, ""))
    .filter((k) => k.length >= 2);

  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .map((ing) => (typeof ing === "string" ? ing : (ing?.name ?? "")))
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (ingredients.length === 0) {
    return { matchRatio: 0, matchedCount: 0, totalIngredients: 0, missingIngredients: [] };
  }

  let matchedCount = 0;
  const missingIngredients: string[] = [];

  for (const ing of ingredients) {
    const key = normalizeItemKey(ing).replace(/s$/, "");
    const hasMatch = pantryTokens.some(
      (p) => key === p || key.includes(p) || (key.length >= 3 && p.includes(key)),
    );
    if (hasMatch) {
      matchedCount++;
    } else {
      missingIngredients.push(ing);
    }
  }

  return {
    matchRatio: matchedCount / ingredients.length,
    matchedCount,
    totalIngredients: ingredients.length,
    missingIngredients,
  };
}

export type ExpiryStatus = "expired" | "expiring" | "fresh" | "none";

export function daysUntilExpiry(expiresAt?: string | null): number | null {
  if (!expiresAt || typeof expiresAt !== "string") return null;
  const target = new Date(expiresAt.includes("T") ? expiresAt : `${expiresAt}T23:59:59`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.round((targetDay - startToday) / 86_400_000);
}

export function getExpiryStatus(expiresAt?: string | null): {
  status: ExpiryStatus;
  daysLeft: number | null;
  label: string | null;
} {
  const daysLeft = daysUntilExpiry(expiresAt);
  if (daysLeft === null) return { status: "none", daysLeft: null, label: null };
  if (daysLeft < 0) return { status: "expired", daysLeft, label: "Expired" };
  if (daysLeft === 0) return { status: "expiring", daysLeft, label: "Expires today" };
  if (daysLeft <= 3) {
    return {
      status: "expiring",
      daysLeft,
      label: `Expires in ${daysLeft}d`,
    };
  }
  return {
    status: "fresh",
    daysLeft,
    label: `Fresh · ${daysLeft}d left`,
  };
}

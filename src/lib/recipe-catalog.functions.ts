import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";
import { CURATED_RECIPES, findCuratedRecipeBySlug } from "@/lib/curated-recipes";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";
import {
  filterRecipeCatalog,
  mergeRecipeCatalog,
  recipeCatalogRecord,
  type CatalogRecipe,
} from "@/lib/recipe-catalog";

const loadPremiumService = createServerOnlyFn(() => import("@/server/revenuecat"));

const CATALOG_CACHE_TTL_MS = 120_000;
let cachedCatalog: { expiresAt: number; recipes: CatalogRecipe[] } | null = null;
let inFlightCatalogRead: Promise<CatalogRecipe[]> | null = null;

export function invalidateRecipeCatalogCache() {
  cachedCatalog = null;
}

async function loadMergedRecipeCatalog(firebase: {
  from: (table: string) => any;
}): Promise<CatalogRecipe[]> {
  const now = Date.now();
  if (!process.env["VITEST"] && cachedCatalog && cachedCatalog.expiresAt > now) {
    return cachedCatalog.recipes;
  }

  if (!process.env["VITEST"] && inFlightCatalogRead) {
    return inFlightCatalogRead;
  }

  const load = (async (): Promise<CatalogRecipe[]> => {
    let firestoreRecipes: CatalogRecipe[] = [];
    try {
      const { data: rows, error } = await firebase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false, nullsFirst: false })
        .limit(200);
      if (error) {
        console.warn(
          "[RecipeCatalog] Firestore read failed; serving curated catalog:",
          error.message,
        );
      } else if (Array.isArray(rows)) {
        firestoreRecipes = (rows as Record<string, unknown>[])
          .map(recipeCatalogRecord)
          .filter((recipe): recipe is CatalogRecipe => recipe !== null);
      }
    } catch (err) {
      console.warn(
        "[RecipeCatalog] Unexpected catalog read error; serving curated catalog:",
        err instanceof Error ? err.message : String(err),
      );
    }

    const merged = mergeRecipeCatalog(firestoreRecipes, CURATED_RECIPES);
    if (!process.env["VITEST"]) {
      cachedCatalog = { expiresAt: Date.now() + CATALOG_CACHE_TTL_MS, recipes: merged };
    }
    return merged;
  })();

  if (process.env["VITEST"]) return load;

  inFlightCatalogRead = load.finally(() => {
    if (inFlightCatalogRead === load) inFlightCatalogRead = null;
  });
  return inFlightCatalogRead;
}

export const listRecipeCatalog = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        category: z.string().trim().max(80).optional(),
        search: z.string().trim().max(200).default(""),
        limit: z.number().int().min(1).max(60).default(60),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { verifyAccountAccess } = await loadPremiumService();
    const access = await verifyAccountAccess(context.userId, undefined, context.claims).catch(
      () => ({ isPremium: false }),
    );
    if (!access.isPremium) {
      return filterRecipeCatalog(CURATED_RECIPES, data);
    }
    const recipes = await loadMergedRecipeCatalog(context.firebase);
    // Apply matching before the result limit, including older rows without created_at.
    return filterRecipeCatalog(recipes, data);
  });

export const getRecipeCatalogEntry = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .validator((input: unknown) => z.object({ slug: z.string().trim().min(1).max(300) }).parse(input))
  .handler(async ({ data, context }) => {
    const { verifyAccountAccess } = await loadPremiumService();
    const access = await verifyAccountAccess(context.userId, undefined, context.claims).catch(
      () => ({ isPremium: false }),
    );
    if (!access.isPremium) {
      return findCuratedRecipeBySlug(data.slug);
    }
    try {
      const { data: row, error } = await context.firebase
        .from("recipes")
        .select("*")
        .eq("slug", data.slug)
        .limit(1)
        .maybeSingle();
      if (!error && row) {
        const record = recipeCatalogRecord(row as Record<string, unknown>);
        if (record) return record;
      }
      if (error) {
        console.warn("[RecipeCatalog] Firestore slug read failed:", error.message);
      }
    } catch (err) {
      console.warn(
        "[RecipeCatalog] Unexpected slug lookup error:",
        err instanceof Error ? err.message : String(err),
      );
    }
    return findCuratedRecipeBySlug(data.slug);
  });

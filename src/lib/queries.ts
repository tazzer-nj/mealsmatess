import { queryOptions } from "@tanstack/react-query";
import { collection, getDocs, getDoc, doc, limit, orderBy, query, where } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "@/lib/firebase";

import { listRecipeCatalog, getRecipeCatalogEntry } from "@/lib/recipe-catalog.functions";
export type FirestoreRecord = Record<string, any> & {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  cuisine?: string | null;
  category?: string | null;
  country?: string | null;
  diet_tags?: string[] | null;
  recipe_id?: string;
  image_url?: string | null;
  image_source?: string | null;
  image_attribution?:
    | string
    | { photographer: string | null; photographerUrl: string | null; pageUrl: string | null }
    | null;
  cooking_time_minutes?: number | null;
  servings?: number | null;
  calories?: number | null;
  difficulty?: string | null;
  ingredients?: unknown;
  steps?: unknown;
  fun_fact?: string | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  checked?: boolean;
  quantity?: string | null;
  plan_date?: string;
  meal_type?: string;
  custom_name?: string | null;
  recipes?: RecipeRecord | null;
};
export type RecipeRecord = Omit<
  FirestoreRecord,
  | "name"
  | "slug"
  | "image_url"
  | "cooking_time_minutes"
  | "calories"
  | "servings"
  | "ingredients"
  | "steps"
> & {
  name: string;
  slug: string;
  image_url: string | null;
  cooking_time_minutes: number | null;
  calories: number | null;
  servings: number | null;
  ingredients: unknown;
  steps: unknown;
};
export type FavoriteRecord = FirestoreRecord & { recipe_id: string; recipes?: RecipeRecord | null };
export type MealPlanRecord = FirestoreRecord & {
  plan_date: string;
  meal_type: string;
  recipe_id?: string;
  recipes?: RecipeRecord | null;
};
export type GroceryRecord = FirestoreRecord & {
  name: string;
  checked: boolean;
  quantity?: string | null;
  category?: string | null;
};
export type PantryRecord = FirestoreRecord & {
  name: string;
  expires_at?: string | null;
};

const list = async (
  collectionName: string,
  constraints: Parameters<typeof query>[1][] = [],
): Promise<FirestoreRecord[]> => {
  try {
    const snapshot = await getDocs(query(collection(db, collectionName), ...constraints));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return [];
  }
};

const defaultSWROptions = {
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

export const featuredRecipesQuery = () =>
  queryOptions({
    queryKey: ["recipes", "featured"],
    queryFn: () => listRecipeCatalog({ data: { limit: 12 } }),
    ...defaultSWROptions,
  });

export const trendingRecipesQuery = () =>
  queryOptions({
    queryKey: ["recipes", "trending"],
    queryFn: () => listRecipeCatalog({ data: { limit: 8 } }),
    ...defaultSWROptions,
  });

export const southAfricanFavoritesQuery = () =>
  queryOptions({
    queryKey: ["recipes", "south-african"],
    queryFn: () => listRecipeCatalog({ data: { category: "South African", limit: 8 } }),
    ...defaultSWROptions,
  });

export const recipesByCategoryQuery = (category: string | undefined, search = "") =>
  queryOptions({
    queryKey: ["recipes", "category", category ?? "all", search.trim().toLowerCase()],
    queryFn: () => listRecipeCatalog({ data: { category, search } }),
    ...defaultSWROptions,
  });

export const recipeBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["recipe", slug],
    queryFn: () => getRecipeCatalogEntry({ data: { slug } }),
    ...defaultSWROptions,
  });

async function hydrateLinkedRecipes<
  T extends { recipe_id?: string | null; recipes?: RecipeRecord | null },
>(rows: T[]): Promise<T[]> {
  const missingIds = Array.from(
    new Set(
      rows
        .filter((row) => !row.recipes && typeof row.recipe_id === "string" && row.recipe_id.trim())
        .map((row) => String(row.recipe_id)),
    ),
  );
  if (missingIds.length === 0) return rows;

  const { findCuratedRecipeById } = await import("@/lib/curated-recipes");
  const resolved = new Map<string, RecipeRecord>();
  const toFetch: string[] = [];

  for (const id of missingIds) {
    const curated = findCuratedRecipeById(id);
    if (curated) {
      resolved.set(id, curated as unknown as RecipeRecord);
    } else {
      toFetch.push(id);
    }
  }

  if (toFetch.length > 0) {
    await Promise.all(
      toFetch.map(async (id) => {
        try {
          const snap = await getDoc(doc(db, "recipes", id));
          if (snap.exists()) {
            resolved.set(id, { id: snap.id, ...snap.data() } as unknown as RecipeRecord);
          }
        } catch {
          // Ignore individual missing/inaccessible recipe reads
        }
      }),
    );
  }

  return rows.map((row) => {
    if (row.recipes || !row.recipe_id) return row;
    const recipe = resolved.get(String(row.recipe_id)) ?? null;
    return { ...row, recipes: recipe };
  });
}

export const myFavoritesQuery = () =>
  queryOptions({
    queryKey: ["favorites"],
    queryFn: async (): Promise<FavoriteRecord[]> => {
      const user = auth.currentUser;
      if (!user) return [];
      const rows = (await list(`users/${user.uid}/favorites`, [
        orderBy("created_at", "desc"),
      ])) as FavoriteRecord[];
      return hydrateLinkedRecipes(rows);
    },
    ...defaultSWROptions,
  });

export const myGroceryQuery = () =>
  queryOptions({
    queryKey: ["grocery"],
    queryFn: async (): Promise<GroceryRecord[]> =>
      auth.currentUser
        ? ((await list(`users/${auth.currentUser.uid}/grocery`, [
            orderBy("created_at", "desc"),
          ])) as GroceryRecord[])
        : [],
    ...defaultSWROptions,
  });

export const myPantryQuery = () =>
  queryOptions<PantryRecord[]>({
    queryKey: ["pantry"],
    queryFn: async (): Promise<PantryRecord[]> =>
      auth.currentUser
        ? ((await list(`users/${auth.currentUser.uid}/pantry`, [
            orderBy("created_at", "desc"),
          ])) as PantryRecord[])
        : [],
    ...defaultSWROptions,
  });

export const myPlannerQuery = (fromISO: string, toISO: string) =>
  queryOptions({
    queryKey: ["planner", fromISO, toISO],
    queryFn: async (): Promise<MealPlanRecord[]> => {
      if (!auth.currentUser) return [];
      const rows = (await list(`users/${auth.currentUser.uid}/mealPlans`, [
        where("plan_date", ">=", fromISO),
        where("plan_date", "<=", toISO),
        orderBy("plan_date"),
      ])) as MealPlanRecord[];
      return hydrateLinkedRecipes(rows);
    },
    ...defaultSWROptions,
  });

export const myProfileQuery = () =>
  queryOptions({
    queryKey: ["profile"],
    queryFn: async (): Promise<{
      user: typeof auth.currentUser;
      profile: FirestoreRecord | null;
      roles: string[];
    } | null> => {
      const user = auth.currentUser;
      if (!user) return null;
      const profile = await getDoc(doc(db, "users", user.uid));
      return {
        user,
        profile: profile.exists() ? { id: profile.id, ...profile.data() } : null,
        roles: [],
      };
    },
    ...defaultSWROptions,
  });

export const announcementsQuery = () =>
  queryOptions({
    queryKey: ["announcements"],
    queryFn: () => list("announcements", [orderBy("created_at", "desc"), limit(10)]),
    ...defaultSWROptions,
  });

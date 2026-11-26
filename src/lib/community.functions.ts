import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";
import { loadFirebaseAdmin } from "@/lib/firebase-admin-access";

export type CommunityRecipeRecord = {
  id: string;
  author_id: string;
  author_name: string;
  name: string;
  description: string;
  category: string;
  cuisine: string;
  cooking_time_minutes: number;
  ingredients: string[];
  steps: string[];
  diet_tags: string[];
  is_published: boolean;
  created_at: string;
};

export type UserStoryRecord = {
  id: string;
  user_id: string;
  display_name: string;
  story: string;
  outcome: string;
  is_published: boolean;
  created_at: string;
};

const SubmitCommunityRecipeSchema = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(500),
  category: z.string().trim().min(2).max(60).default("Home Cooking"),
  cuisine: z.string().trim().min(2).max(60).default("South African"),
  cooking_time_minutes: z.number().int().min(5).max(360).default(30),
  ingredients: z.array(z.string().trim().min(1).max(120)).min(2).max(30),
  steps: z.array(z.string().trim().min(3).max(500)).min(2).max(20),
  diet_tags: z.array(z.string().trim().min(1).max(40)).max(10).optional().default([]),
  author_name: z.string().trim().min(1).max(80).optional(),
});

const SubmitUserStorySchema = z.object({
  display_name: z.string().trim().min(2).max(80),
  story: z.string().trim().min(12).max(500),
  outcome: z.string().trim().min(3).max(120),
});

export const listCommunityRecipes = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async (): Promise<CommunityRecipeRecord[]> => {
    try {
      const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
      const snap = await getFirebaseAdminFirestore()
        .collection("community_recipes")
        .where("is_published", "==", true)
        .orderBy("created_at", "desc")
        .limit(24)
        .get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CommunityRecipeRecord);
    } catch {
      return [];
    }
  });

export const submitCommunityRecipe = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => SubmitCommunityRecipeSchema.parse(v))
  .handler(async ({ data, context }): Promise<CommunityRecipeRecord> => {
    const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
    const db = getFirebaseAdminFirestore();
    const id = `cr_${context.userId.slice(0, 8)}_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const userDoc = await db.collection("users").doc(context.userId).get();
    const fallbackName =
      (userDoc.get("displayName") as string | undefined)?.trim() ||
      (userDoc.get("name") as string | undefined)?.trim() ||
      "MealMate Cook";

    const record: CommunityRecipeRecord = {
      id,
      author_id: context.userId,
      author_name: (data.author_name || fallbackName).slice(0, 80),
      name: data.name,
      description: data.description,
      category: data.category,
      cuisine: data.cuisine,
      cooking_time_minutes: data.cooking_time_minutes,
      ingredients: data.ingredients,
      steps: data.steps,
      diet_tags: data.diet_tags,
      is_published: true,
      created_at: nowIso,
    };

    await db.collection("community_recipes").doc(id).set(record);
    return record;
  });

export const listUserStories = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async (): Promise<UserStoryRecord[]> => {
    try {
      const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
      const snap = await getFirebaseAdminFirestore()
        .collection("user_stories")
        .where("is_published", "==", true)
        .orderBy("created_at", "desc")
        .limit(12)
        .get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserStoryRecord);
    } catch {
      return [];
    }
  });

export const submitUserStory = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => SubmitUserStorySchema.parse(v))
  .handler(async ({ data, context }): Promise<UserStoryRecord> => {
    const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
    const db = getFirebaseAdminFirestore();
    const id = `story_${context.userId.slice(0, 8)}_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const record: UserStoryRecord = {
      id,
      user_id: context.userId,
      display_name: data.display_name,
      story: data.story,
      outcome: data.outcome,
      is_published: true,
      created_at: nowIso,
    };

    await db.collection("user_stories").doc(id).set(record);
    return record;
  });

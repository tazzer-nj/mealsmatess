import { queryOptions } from "@tanstack/react-query";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getCurrentWeekKey, type RecipeCollection, type WeeklyGoalState } from "@/lib/psychology";

const LOCAL_COLLECTIONS_KEY = "mealmate.collections.v1";
const LOCAL_GOAL_PREFIX = "mealmate.weekly_goal.v1.";

function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Sign in to save your MealMate progress.");
  return uid;
}

function makeDocId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}_${suffix}`.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
}

function readLocalCollections(): RecipeCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_COLLECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecipeCollection[]) : [];
  } catch {
    return [];
  }
}

function writeLocalCollections(items: RecipeCollection[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_COLLECTIONS_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

export const myCollectionsQuery = () =>
  queryOptions({
    queryKey: ["collections"],
    queryFn: async (): Promise<RecipeCollection[]> => {
      const uid = auth.currentUser?.uid;
      if (!uid) return readLocalCollections();
      try {
        const snap = await getDocs(
          query(collection(db, "users", uid, "collections"), orderBy("updated_at", "desc")),
        );
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RecipeCollection);
        writeLocalCollections(rows);
        return rows;
      } catch {
        return readLocalCollections();
      }
    },
    staleTime: 60_000,
  });

export async function createRecipeCollection(input: {
  name: string;
  description?: string | null;
  initialRecipeId?: string | null;
}): Promise<RecipeCollection> {
  const uid = requireUid();
  const id = makeDocId("col");
  const nowIso = new Date().toISOString();
  const payload: RecipeCollection = {
    id,
    user_id: uid,
    name: input.name.trim().slice(0, 80),
    description: input.description?.trim().slice(0, 240) || null,
    recipe_ids: input.initialRecipeId ? [input.initialRecipeId] : [],
    created_at: nowIso,
    updated_at: nowIso,
  };

  try {
    await setDoc(doc(db, "users", uid, "collections", id), payload);
  } catch {
    // Keep local backup so UX remains responsive offline
  }
  writeLocalCollections([payload, ...readLocalCollections().filter((c) => c.id !== id)]);
  return payload;
}

export async function toggleRecipeInCollection(
  collectionItem: RecipeCollection,
  recipeId: string,
): Promise<RecipeCollection> {
  const uid = requireUid();
  const exists = collectionItem.recipe_ids.includes(recipeId);
  const nextIds = exists
    ? collectionItem.recipe_ids.filter((id) => id !== recipeId)
    : Array.from(new Set([...collectionItem.recipe_ids, recipeId])).slice(0, 120);
  const nowIso = new Date().toISOString();
  const next: RecipeCollection = {
    ...collectionItem,
    recipe_ids: nextIds,
    updated_at: nowIso,
  };

  try {
    await updateDoc(doc(db, "users", uid, "collections", collectionItem.id), {
      recipe_ids: nextIds,
      updated_at: nowIso,
    });
  } catch {
    await setDoc(doc(db, "users", uid, "collections", collectionItem.id), next, {
      merge: true,
    }).catch(() => undefined);
  }

  writeLocalCollections(readLocalCollections().map((c) => (c.id === collectionItem.id ? next : c)));
  return next;
}

export async function deleteRecipeCollection(collectionId: string): Promise<void> {
  const uid = requireUid();
  try {
    await deleteDoc(doc(db, "users", uid, "collections", collectionId));
  } catch {
    // Ignore delete failure if already removed
  }
  writeLocalCollections(readLocalCollections().filter((c) => c.id !== collectionId));
}

export const myWeeklyGoalQuery = (weekKey: string = getCurrentWeekKey()) =>
  queryOptions({
    queryKey: ["weekly-goal", weekKey],
    queryFn: async (): Promise<WeeklyGoalState | null> => {
      const uid = auth.currentUser?.uid;
      if (!uid) return null;
      try {
        const snap = await getDoc(doc(db, "users", uid, "weeklyGoals", weekKey));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as WeeklyGoalState;
        }
      } catch {
        // Fallback to local cache
      }
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(`${LOCAL_GOAL_PREFIX}${weekKey}`);
          if (raw) return JSON.parse(raw) as WeeklyGoalState;
        } catch {
          // Ignore parse failure
        }
      }
      return null;
    },
    staleTime: 60_000,
  });

export async function upsertWeeklyGoal(input: {
  weekKey?: string;
  targetMeals: number;
  completedMeals: number;
  identityHabit?: string | null;
}): Promise<WeeklyGoalState> {
  const uid = requireUid();
  const weekKey = input.weekKey ?? getCurrentWeekKey();
  const nowIso = new Date().toISOString();
  const target = Math.min(21, Math.max(1, Math.round(input.targetMeals)));
  const completed = Math.min(50, Math.max(0, Math.round(input.completedMeals)));
  const payload: WeeklyGoalState = {
    id: weekKey,
    week_key: weekKey,
    user_id: uid,
    target_meals: target,
    completed_meals: completed,
    identity_habit: input.identityHabit?.slice(0, 160) ?? null,
    updated_at: nowIso,
  };

  try {
    await setDoc(doc(db, "users", uid, "weeklyGoals", weekKey), payload, { merge: true });
  } catch {
    // Keep local cache synced
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${LOCAL_GOAL_PREFIX}${weekKey}`, JSON.stringify(payload));
    } catch {
      // Ignore storage error
    }
  }
  return payload;
}

export async function togglePlannedMealCompleted(
  mealId: string,
  completed: boolean,
): Promise<{ completed: boolean; completed_at: string | null }> {
  const uid = requireUid();
  const completedAt = completed ? new Date().toISOString() : null;
  await updateDoc(doc(db, "users", uid, "mealPlans", mealId), {
    completed,
    completed_at: completedAt,
  });
  return { completed, completed_at: completedAt };
}

export async function clearWeekMealPlans(mealIds: string[]): Promise<number> {
  const uid = requireUid();
  const cleanIds = mealIds.filter((id) => typeof id === "string" && id.trim().length > 0);
  if (cleanIds.length === 0) return 0;

  let removed = 0;
  for (let i = 0; i < cleanIds.length; i += 400) {
    const batch = writeBatch(db);
    const slice = cleanIds.slice(i, i + 400);
    for (const id of slice) {
      batch.delete(doc(db, "users", uid, "mealPlans", id));
      removed += 1;
    }
    await batch.commit();
  }
  return removed;
}

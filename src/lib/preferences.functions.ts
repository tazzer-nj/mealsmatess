import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";
import { normalizePreferences, type FoodPreferences } from "@/lib/preferences";

const prefsSchema = z.object({
  goal: z.string().max(60).nullable().default(null),
  favorite_foods: z.array(z.string().max(60)).max(30).default([]),
  allergies: z.array(z.string().max(60)).max(40).default([]),
  dietary_restrictions: z.array(z.string().max(60)).max(30).default([]),
  disliked_foods: z.array(z.string().max(60)).max(40).default([]),
  meals_per_day: z.string().max(40).nullable().default(null),
  household_size: z.string().max(40).nullable().optional().default(null),
  cooking_level: z.string().max(40).nullable().default(null),
  cooking_time: z.string().max(40).nullable().default(null),
  food_budget: z.string().max(40).nullable().default(null),
  preferred_features: z.array(z.string().max(40)).max(20).default([]),
  onboarding_step: z.number().int().min(0).max(10).nullable().optional().default(null),
  onboarding_completed: z.boolean().default(false),
  preferred_name: z.string().max(60).nullable().optional(),
});

export const getMyPreferences = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }): Promise<FoodPreferences | null> => {
    const { data, error } = await context.firebase
      .from("profiles")
      .select(
        "preferences, onboarding_completed, goal, household_size, onboarding_step, displayName",
      )
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const rawPrefs =
      data.preferences && typeof data.preferences === "object" && !Array.isArray(data.preferences)
        ? (data.preferences as Record<string, unknown>)
        : {};
    const prefs = normalizePreferences({
      goal: data.goal,
      household_size: data.household_size,
      onboarding_step: data.onboarding_step,
      preferred_name: data.displayName,
      ...rawPrefs,
    });
    return { ...prefs, onboarding_completed: Boolean(data.onboarding_completed) };
  });

export const saveMyPreferences = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => prefsSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { preferred_name, ...prefsData } = data;
    const householdSize = prefsData.household_size ?? prefsData.meals_per_day ?? null;
    const trimmedName = preferred_name?.trim() || null;
    const payload = {
      ...prefsData,
      meals_per_day: prefsData.meals_per_day ?? householdSize,
      household_size: householdSize,
      preferred_name: trimmedName,
      onboarding_step: prefsData.onboarding_step ?? null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await context.firebase.from("profiles").upsert(
      {
        id: context.userId,
        preferences: payload,
        goal: payload.goal,
        household_size: householdSize,
        onboarding_step: payload.onboarding_step,
        onboarding_completed: payload.onboarding_completed,
        ...(trimmedName ? { displayName: trimmedName } : {}),
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";
import { normalizePreferences, type FoodPreferences } from "@/lib/preferences";
import { getMealMateTheme, isMealMateThemeId, normalizeThemeId } from "@/lib/themes";

const loadPremiumService = createServerOnlyFn(() => import("@/server/revenuecat"));

const prefsSchema = z.object({
  goal: z.string().max(120).nullable().default(null),
  goals: z.array(z.string().max(120)).max(20).optional().default([]),
  challenges: z.array(z.string().max(160)).max(20).optional().default([]),
  health_goals: z.array(z.string().max(120)).max(20).optional().default([]),
  age_bracket: z.string().max(40).nullable().optional().default(null),
  balanced_nutrition_safeguard: z.boolean().optional().default(false),
  eating_habits: z.array(z.string().max(120)).max(20).optional().default([]),
  cooking_frequency: z.string().max(60).nullable().optional().default(null),
  biggest_challenge: z.string().max(160).nullable().optional().default(null),
  meal_enjoyments: z.array(z.string().max(80)).max(30).optional().default([]),
  preferred_cuisines: z.array(z.string().max(60)).max(30).optional().default([]),
  budget_range_zar: z.string().max(80).nullable().optional().default(null),
  favorite_foods: z.array(z.string().max(60)).max(30).default([]),
  allergies: z.array(z.string().max(60)).max(40).default([]),
  dietary_restrictions: z.array(z.string().max(60)).max(30).default([]),
  disliked_foods: z.array(z.string().max(60)).max(40).default([]),
  meals_per_day: z.string().max(40).nullable().default(null),
  household_size: z.string().max(40).nullable().optional().default(null),
  cooking_level: z.string().max(40).nullable().default(null),
  cooking_time: z.string().max(40).nullable().default(null),
  food_budget: z.string().max(80).nullable().default(null),
  preferred_features: z.array(z.string().max(40)).max(20).default([]),
  discovery_source: z.string().max(60).nullable().optional().default(null),
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
        "preferences, onboarding_completed, goal, household_size, discovery_source, onboarding_step, displayName",
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
      discovery_source: data.discovery_source,
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
        discovery_source: payload.discovery_source ?? null,
        onboarding_step: payload.onboarding_step,
        onboarding_completed: payload.onboarding_completed,
        ...(trimmedName ? { displayName: trimmedName } : {}),
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyTheme = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.firebase
      .from("profiles")
      .select("theme, theme_updated_at")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const raw = (data as { theme?: string | null; theme_updated_at?: string | null } | null)?.theme;
    if (!raw || typeof raw !== "string") {
      return { themeId: null, updatedAt: null };
    }
    const normalized = isMealMateThemeId(raw) ? raw : normalizeThemeId(raw);
    return {
      themeId: normalized,
      updatedAt: (data as { theme_updated_at?: string | null } | null)?.theme_updated_at ?? null,
    };
  });

export const saveMyTheme = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => z.object({ themeId: z.string().min(2).max(40) }).parse(v))
  .handler(async ({ data, context }) => {
    const theme = getMealMateTheme(data.themeId);
    if (theme.premium) {
      const { verifyAccountAccess } = await loadPremiumService();
      const access = await verifyAccountAccess(context.userId, undefined, context.claims);
      if (!access.isPremium) {
        throw new Error(
          `PREMIUM_REQUIRED: Upgrade to MealMate Premium to save the ${theme.name} theme to your account.`,
        );
      }
    }

    const updatedAt = new Date().toISOString();
    const { error } = await context.firebase.from("profiles").upsert(
      {
        id: context.userId,
        theme: theme.id,
        theme_updated_at: updatedAt,
        updatedAt,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true, themeId: theme.id, updatedAt };
  });

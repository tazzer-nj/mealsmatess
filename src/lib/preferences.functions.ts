import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";
import { normalizePreferences, type FoodPreferences } from "@/lib/preferences";
import { getMealMateTheme, isMealMateThemeId, normalizeThemeId } from "@/lib/themes";

const loadPremiumService = createServerOnlyFn(() => import("@/server/revenuecat"));

const shoppingSchema = z
  .object({
    category_overrides: z.record(z.string().max(120), z.string().max(60)).optional(),
    aisle_order: z.array(z.string().max(60)).max(20).optional(),
  })
  .nullable()
  .optional();

const prefsSchema = z.object({
  goal: z.string().max(60).nullable().default(null),
  favorite_foods: z.array(z.string().max(60)).max(40).default([]),
  allergies: z.array(z.string().max(60)).max(40).default([]),
  intolerances: z.array(z.string().max(60)).max(40).optional().default([]),
  dietary_restrictions: z.array(z.string().max(60)).max(30).default([]),
  disliked_foods: z.array(z.string().max(60)).max(40).default([]),
  preferred_cuisines: z.array(z.string().max(60)).max(30).optional().default([]),
  lifestyles: z.array(z.string().max(60)).max(20).optional().default([]),
  preferred_meal_types: z.array(z.string().max(40)).max(12).optional().default([]),
  meals_per_day: z.string().max(40).nullable().default(null),
  household_size: z.string().max(40).nullable().optional().default(null),
  cooking_level: z.string().max(40).nullable().default(null),
  cooking_time: z.string().max(40).nullable().default(null),
  food_budget: z.string().max(40).nullable().default(null),
  preferred_features: z.array(z.string().max(40)).max(20).default([]),
  shopping: shoppingSchema,
  onboarding_step: z.number().int().min(0).max(10).nullable().optional().default(null),
  onboarding_completed: z.boolean().default(false),
  preferred_name: z.string().max(60).nullable().optional(),
});

export const getMyPreferences = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(
    async ({ context }): Promise<(FoodPreferences & { free_mode_entered?: boolean }) | null> => {
      const { data, error } = await context.firebase
        .from("profiles")
        .select(
          "preferences, onboarding_completed, goal, household_size, onboarding_step, displayName, free_mode_entered",
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
      return {
        ...prefs,
        onboarding_completed: Boolean(data.onboarding_completed),
        free_mode_entered: Boolean((data as { free_mode_entered?: boolean }).free_mode_entered),
      };
    },
  );

export const enterFreeMode = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const nowIso = new Date().toISOString();
    const { error } = await context.firebase.from("profiles").upsert(
      {
        id: context.userId,
        free_mode_entered: true,
        free_mode_entered_at: nowIso,
        updatedAt: nowIso,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const, freeModeEntered: true as const };
  });

export const saveMyPreferences = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => prefsSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { data: existingRow } = await context.firebase
      .from("profiles")
      .select("preferences")
      .eq("id", context.userId)
      .maybeSingle();
    const existingPrefs =
      existingRow?.preferences &&
      typeof existingRow.preferences === "object" &&
      !Array.isArray(existingRow.preferences)
        ? (existingRow.preferences as Record<string, unknown>)
        : {};

    const { preferred_name, ...prefsData } = data;
    const householdSize = prefsData.household_size ?? prefsData.meals_per_day ?? null;
    const trimmedName = preferred_name?.trim() || null;
    const payload = {
      ...existingPrefs,
      ...prefsData,
      shopping:
        prefsData.shopping !== undefined ? prefsData.shopping : (existingPrefs["shopping"] ?? null),
      meals_per_day: prefsData.meals_per_day ?? householdSize,
      household_size: householdSize,
      preferred_name: trimmedName ?? (existingPrefs["preferred_name"] as string | null) ?? null,
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
      return { themeId: null, scheme: null, updatedAt: null };
    }
    const [rawId, rawScheme] = raw.trim().toLowerCase().split(":");
    const normalized = isMealMateThemeId(rawId) ? rawId : normalizeThemeId(rawId);
    const scheme = rawScheme === "light" || rawScheme === "dark" ? rawScheme : null;
    return {
      themeId: normalized,
      scheme,
      updatedAt: (data as { theme_updated_at?: string | null } | null)?.theme_updated_at ?? null,
    };
  });

export const saveMyTheme = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) =>
    z
      .object({
        themeId: z.string().min(2).max(40),
        scheme: z.enum(["light", "dark"]).optional(),
      })
      .parse(v),
  )
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

    const storedTheme =
      theme.premium && data.scheme && data.scheme !== theme.colorScheme
        ? `${theme.id}:${data.scheme}`
        : theme.id;
    const updatedAt = new Date().toISOString();
    const { error } = await context.firebase.from("profiles").upsert(
      {
        id: context.userId,
        theme: storedTheme,
        theme_updated_at: updatedAt,
        updatedAt,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true, themeId: theme.id, scheme: data.scheme ?? theme.colorScheme, updatedAt };
  });

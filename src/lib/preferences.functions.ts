import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";
import { normalizePreferences, type FoodPreferences } from "@/lib/preferences";
import { buildPersonalisationProfile } from "@/lib/personalisation";
import { getMealMateTheme, isMealMateThemeId, normalizeThemeId } from "@/lib/themes";

const loadPremiumService = createServerOnlyFn(() => import("@/server/revenuecat"));

const shoppingSchema = z
  .object({
    category_overrides: z.record(z.string().max(120), z.string().max(60)).optional(),
    aisle_order: z.array(z.string().max(60)).max(20).optional(),
  })
  .nullable()
  .optional();

const acquisitionSchema = z
  .object({
    self_reported_source: z.string().max(80).nullable().optional(),
    other_detail: z.string().max(200).nullable().optional(),
    utm_source: z.string().max(120).nullable().optional(),
    utm_medium: z.string().max(120).nullable().optional(),
    utm_campaign: z.string().max(120).nullable().optional(),
    referrer: z.string().max(512).nullable().optional(),
    captured_at: z.string().max(40).nullable().optional(),
  })
  .nullable()
  .optional();

const prefsSchema = z.object({
  goal: z.string().max(120).nullable().default(null),
  goals: z.array(z.string().max(120)).max(20).optional().default([]),
  challenges: z.array(z.string().max(160)).max(20).optional().default([]),
  health_goals: z.array(z.string().max(120)).max(20).optional().default([]),
  age_bracket: z.string().max(32).nullable().optional().default(null),
  balanced_nutrition_safeguard: z.boolean().optional().default(false),
  eating_habits: z.string().max(120).nullable().optional().default(null),
  cooking_frequency: z.string().max(80).nullable().optional().default(null),
  primary_challenge: z.string().max(160).nullable().optional().default(null),
  meal_enjoyments: z.array(z.string().max(80)).max(30).optional().default([]),
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
  cooking_time: z.string().max(60).nullable().default(null),
  food_budget: z.string().max(60).nullable().default(null),
  budget_range_zar: z.string().max(60).nullable().optional().default(null),
  preferred_features: z.array(z.string().max(40)).max(20).default([]),
  shopping: shoppingSchema,
  acquisition: acquisitionSchema,
  onboarding_step: z.number().int().min(0).max(10).nullable().optional().default(null),
  onboarding_completed: z.boolean().default(false),
  preferred_name: z.string().max(60).nullable().optional(),
  platform: z.string().max(24).nullable().optional(),
  country: z.string().max(12).nullable().optional(),
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

    const { preferred_name, platform, country, ...prefsData } = data;
    const householdSize = prefsData.household_size ?? prefsData.meals_per_day ?? null;
    const trimmedName = preferred_name?.trim() || null;
    const nowIso = new Date().toISOString();

    const mergedRaw = {
      ...existingPrefs,
      ...prefsData,
      shopping:
        prefsData.shopping !== undefined ? prefsData.shopping : (existingPrefs["shopping"] ?? null),
      acquisition:
        prefsData.acquisition !== undefined
          ? prefsData.acquisition
          : (existingPrefs["acquisition"] ?? null),
      meals_per_day: prefsData.meals_per_day ?? householdSize,
      household_size: householdSize,
      preferred_name: trimmedName ?? (existingPrefs["preferred_name"] as string | null) ?? null,
      goal:
        prefsData.goal ?? prefsData.goals[0] ?? (existingPrefs["goal"] as string | null) ?? null,
      onboarding_step: prefsData.onboarding_step ?? null,
      updated_at: nowIso,
    };

    const normalized = normalizePreferences(mergedRaw);
    const personalisationProfile = normalized.onboarding_completed
      ? buildPersonalisationProfile(normalized)
      : (normalized.personalisation_profile ?? null);

    const payload = {
      ...normalized,
      personalisation_profile: personalisationProfile,
      updated_at: nowIso,
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
        ...(platform ? { platform } : {}),
        ...(country ? { country } : {}),
        updatedAt: nowIso,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);

    // Best-effort sync to structured user_onboarding_profiles for fast admin aggregation.
    await context.firebase
      .from("user_onboarding_profiles")
      .upsert(
        {
          id: context.userId,
          user_id: context.userId,
          preferred_name: payload.preferred_name ?? null,
          household_size: householdSize,
          goals: payload.goals ?? [],
          primary_goal: payload.goal ?? null,
          challenges: payload.challenges ?? [],
          health_goals: payload.health_goals ?? [],
          age_bracket: payload.age_bracket ?? null,
          balanced_nutrition_safeguard: Boolean(payload.balanced_nutrition_safeguard),
          eating_habits: payload.eating_habits ?? null,
          cooking_frequency: payload.cooking_frequency ?? null,
          primary_challenge: payload.primary_challenge ?? null,
          meal_enjoyments: payload.meal_enjoyments ?? [],
          allergies: payload.allergies,
          intolerances: payload.intolerances,
          dietary_restrictions: payload.dietary_restrictions,
          disliked_foods: payload.disliked_foods,
          preferred_cuisines: payload.preferred_cuisines,
          cooking_time: payload.cooking_time,
          cooking_level: payload.cooking_level,
          budget_range_zar: payload.budget_range_zar ?? null,
          onboarding_completed: Boolean(payload.onboarding_completed),
          onboarding_completed_at: payload.onboarding_completed ? nowIso : null,
          personalisation_profile: personalisationProfile,
          ...(platform ? { platform } : {}),
          ...(country ? { country } : {}),
          updated_at: nowIso,
        },
        { onConflict: "id" },
      )
      .then(
        () => undefined,
        () => undefined,
      );

    return { ok: true, personalisationProfile };
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

const appSettingsSchema = z.object({
  units: z.enum(["metric", "imperial"]).optional(),
  locale: z.string().min(2).max(12).optional(),
  font: z.string().min(2).max(24).optional(),
  currency: z.string().min(3).max(3).optional(),
  voice_preferences: z
    .object({
      voiceResponses: z.boolean(),
      isMuted: z.boolean(),
      speechSpeed: z.string().min(1).max(8),
    })
    .optional(),
  notification_preferences: z
    .object({
      mealReminders: z.boolean(),
      recipeAlerts: z.boolean(),
      planningReminders: z.boolean(),
      promoAlerts: z.boolean(),
      pushEnabled: z.boolean().optional(),
    })
    .optional(),
});

export type AppSettingsPayload = z.infer<typeof appSettingsSchema>;

export const getMyAppSettings = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const { loadFirebaseAdmin } = await import("@/lib/firebase-admin-access");
    const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
    const db = getFirebaseAdminFirestore();
    const [userSnap, notifSnap] = await Promise.all([
      db.collection("users").doc(context.userId).get(),
      db
        .collection("users")
        .doc(context.userId)
        .collection("notification_settings")
        .doc("preferences")
        .get(),
    ]);
    const userData = userSnap.data() ?? {};
    const notifData = notifSnap.data() ?? {};
    const storedNotif =
      userData["notification_preferences"] &&
      typeof userData["notification_preferences"] === "object"
        ? (userData["notification_preferences"] as Record<string, unknown>)
        : {};
    const storedVoice =
      userData["voice_preferences"] && typeof userData["voice_preferences"] === "object"
        ? (userData["voice_preferences"] as Record<string, unknown>)
        : {};

    const promoAlerts =
      typeof notifData["promoAlerts"] === "boolean"
        ? notifData["promoAlerts"]
        : typeof notifData["productUpdatesEnabled"] === "boolean"
          ? notifData["productUpdatesEnabled"]
          : typeof storedNotif["promoAlerts"] === "boolean"
            ? storedNotif["promoAlerts"]
            : false;

    return {
      units: userData["units"] === "imperial" ? ("imperial" as const) : ("metric" as const),
      locale: typeof userData["locale"] === "string" ? userData["locale"] : null,
      font: typeof userData["font"] === "string" ? userData["font"] : null,
      currency: typeof userData["currency"] === "string" ? userData["currency"] : null,
      voice_preferences: {
        voiceResponses:
          typeof storedVoice["voiceResponses"] === "boolean" ? storedVoice["voiceResponses"] : true,
        isMuted: typeof storedVoice["isMuted"] === "boolean" ? storedVoice["isMuted"] : false,
        speechSpeed:
          typeof storedVoice["speechSpeed"] === "string" ? storedVoice["speechSpeed"] : "1.0",
      },
      notification_preferences: {
        mealReminders:
          typeof notifData["mealReminders"] === "boolean"
            ? notifData["mealReminders"]
            : typeof storedNotif["mealReminders"] === "boolean"
              ? storedNotif["mealReminders"]
              : true,
        recipeAlerts:
          typeof notifData["recipeAlerts"] === "boolean"
            ? notifData["recipeAlerts"]
            : typeof storedNotif["recipeAlerts"] === "boolean"
              ? storedNotif["recipeAlerts"]
              : true,
        planningReminders:
          typeof notifData["planningReminders"] === "boolean"
            ? notifData["planningReminders"]
            : typeof storedNotif["planningReminders"] === "boolean"
              ? storedNotif["planningReminders"]
              : true,
        promoAlerts,
        pushEnabled: notifData["pushEnabled"] === true,
      },
    };
  });

export const saveMyAppSettings = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => appSettingsSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { loadFirebaseAdmin } = await import("@/lib/firebase-admin-access");
    const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
    const db = getFirebaseAdminFirestore();
    const nowIso = new Date().toISOString();

    const userPatch: Record<string, unknown> = {
      id: context.userId,
      updatedAt: nowIso,
      updated_at: nowIso,
    };
    if (data.units !== undefined) userPatch["units"] = data.units;
    if (data.locale !== undefined) userPatch["locale"] = data.locale;
    if (data.font !== undefined) userPatch["font"] = data.font;
    if (data.currency !== undefined) userPatch["currency"] = data.currency;
    if (data.voice_preferences !== undefined) {
      userPatch["voice_preferences"] = data.voice_preferences;
    }
    if (data.notification_preferences !== undefined) {
      userPatch["notification_preferences"] = data.notification_preferences;
    }

    const writes: Promise<unknown>[] = [
      db.collection("users").doc(context.userId).set(userPatch, { merge: true }),
    ];

    if (data.notification_preferences) {
      const np = data.notification_preferences;
      writes.push(
        db
          .collection("users")
          .doc(context.userId)
          .collection("notification_settings")
          .doc("preferences")
          .set(
            {
              mealReminders: np.mealReminders,
              recipeAlerts: np.recipeAlerts,
              planningReminders: np.planningReminders,
              promoAlerts: np.promoAlerts,
              productUpdatesEnabled: np.promoAlerts,
              ...(typeof np.pushEnabled === "boolean"
                ? { pushEnabled: np.promoAlerts && np.pushEnabled }
                : {}),
              updatedAt: nowIso,
            },
            { merge: true },
          ),
      );
    }

    await Promise.all(writes);
    return { ok: true as const, updatedAt: nowIso };
  });

export const saveMyProfileInfo = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) =>
    z
      .object({
        displayName: z.string().max(100).nullable().optional(),
        photoURL: z.string().max(131072).nullable().optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const nowIso = new Date().toISOString();
    const displayName = data.displayName?.trim() || null;
    const photoURL = data.photoURL?.trim() || null;
    const { error } = await context.firebase.from("profiles").upsert(
      {
        id: context.userId,
        ...(data.displayName !== undefined
          ? { displayName: displayName ?? "", name: displayName ?? "" }
          : {}),
        ...(data.photoURL !== undefined ? { photoURL: photoURL ?? "" } : {}),
        updatedAt: nowIso,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const, displayName, photoURL };
  });

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const { loadFirebaseAdmin } = await import("@/lib/firebase-admin-access");
    const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
    const db = getFirebaseAdminFirestore();
    const uid = context.userId;

    const subcollections = [
      "favorites",
      "grocery",
      "pantry",
      "mealPlans",
      "nutritionLogs",
      "conversations",
      "plannerTemplates",
      "notifications",
      "notification_settings",
      "push_tokens",
    ];

    for (const sub of subcollections) {
      const snap = await db.collection("users").doc(uid).collection(sub).get();
      for (let i = 0; i < snap.docs.length; i += 400) {
        const batch = db.batch();
        snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }

    await Promise.all([
      db
        .collection("user_onboarding_profiles")
        .doc(uid)
        .delete()
        .catch(() => undefined),
      db
        .collection("onboarding_answers")
        .doc(uid)
        .delete()
        .catch(() => undefined),
      db
        .collection("onboarding_progress")
        .doc(uid)
        .delete()
        .catch(() => undefined),
      db.collection("users").doc(uid).delete(),
    ]);

    return { ok: true as const };
  });

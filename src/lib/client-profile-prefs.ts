import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { normalizePreferences, type FoodPreferences } from "@/lib/preferences";
import { buildPersonalisationProfile } from "@/lib/personalisation";

export async function readClientProfilePreferences(
  userId: string,
): Promise<FoodPreferences | null> {
  if (!userId || auth.currentUser?.uid !== userId) return null;
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (!snap.exists()) return null;
    const data = snap.data() as Record<string, unknown>;
    const rawPrefs =
      data["preferences"] &&
      typeof data["preferences"] === "object" &&
      !Array.isArray(data["preferences"])
        ? (data["preferences"] as Record<string, unknown>)
        : {};
    const prefs = normalizePreferences({
      goal: data["goal"],
      household_size: data["household_size"],
      onboarding_step: data["onboarding_step"],
      preferred_name: data["displayName"],
      ...rawPrefs,
    });
    return {
      ...prefs,
      onboarding_completed: Boolean(data["onboarding_completed"]),
    };
  } catch {
    return null;
  }
}

export async function writeClientProfilePreferences(
  userId: string,
  data: FoodPreferences,
  meta?: { platform?: string | null; country?: string | null },
): Promise<boolean> {
  if (!userId || auth.currentUser?.uid !== userId) return false;
  const householdSize = data.household_size ?? data.meals_per_day ?? null;
  const trimmedName = data.preferred_name?.trim().slice(0, 100) || null;
  const updatedAt = new Date().toISOString();
  const normalized = normalizePreferences({
    ...data,
    meals_per_day: data.meals_per_day ?? householdSize,
    household_size: householdSize,
    preferred_name: trimmedName,
    onboarding_step: data.onboarding_step ?? null,
    updated_at: updatedAt,
  });
  const personalisationProfile = normalized.onboarding_completed
    ? buildPersonalisationProfile(normalized)
    : (normalized.personalisation_profile ?? null);

  const payload: FoodPreferences = {
    ...normalized,
    personalisation_profile: personalisationProfile,
    updated_at: updatedAt,
  };

  await setDoc(
    doc(db, "users", userId),
    {
      id: userId,
      preferences: payload,
      goal: payload.goal ? payload.goal.slice(0, 80) : null,
      household_size: householdSize ? householdSize.slice(0, 40) : null,
      onboarding_step: payload.onboarding_step,
      onboarding_completed: Boolean(payload.onboarding_completed),
      ...(trimmedName ? { displayName: trimmedName } : {}),
      ...(meta?.platform ? { platform: meta.platform.slice(0, 24) } : {}),
      ...(meta?.country ? { country: meta.country.slice(0, 12) } : {}),
      updatedAt,
    },
    { merge: true },
  );

  // Best-effort structured onboarding profile write matching firestore.rules validOnboardingProfile.
  try {
    await setDoc(
      doc(db, "user_onboarding_profiles", userId),
      {
        id: userId,
        user_id: userId,
        preferred_name: trimmedName,
        household_size: householdSize ? householdSize.slice(0, 40) : null,
        goals: payload.goals ?? [],
        primary_goal: payload.goal ? payload.goal.slice(0, 120) : null,
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
        onboarding_completed_at: payload.onboarding_completed ? updatedAt : null,
        personalisation_profile: personalisationProfile,
        ...(meta?.platform ? { platform: meta.platform.slice(0, 24) } : {}),
        ...(meta?.country ? { country: meta.country.slice(0, 12) } : {}),
        updated_at: updatedAt,
      },
      { merge: true },
    );
  } catch {
    // Non-blocking fallback.
  }

  return true;
}

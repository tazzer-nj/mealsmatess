import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { normalizePreferences, type FoodPreferences } from "@/lib/preferences";

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
      discovery_source: data["discovery_source"],
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
): Promise<boolean> {
  if (!userId || auth.currentUser?.uid !== userId) return false;
  const householdSize = data.household_size ?? data.meals_per_day ?? null;
  const trimmedName = data.preferred_name?.trim().slice(0, 100) || null;
  const updatedAt = new Date().toISOString();
  const payload = {
    ...data,
    meals_per_day: data.meals_per_day ?? householdSize,
    household_size: householdSize,
    preferred_name: trimmedName,
    onboarding_step: data.onboarding_step ?? null,
    updated_at: updatedAt,
  };
  await setDoc(
    doc(db, "users", userId),
    {
      id: userId,
      preferences: payload,
      goal: payload.goal ? payload.goal.slice(0, 80) : null,
      household_size: householdSize ? householdSize.slice(0, 40) : null,
      discovery_source: payload.discovery_source ? payload.discovery_source.slice(0, 60) : null,
      onboarding_step: payload.onboarding_step,
      onboarding_completed: Boolean(payload.onboarding_completed),
      ...(trimmedName ? { displayName: trimmedName } : {}),
      updatedAt,
    },
    { merge: true },
  );
  return true;
}

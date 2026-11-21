import { normalizePreferences, type FoodPreferences } from "@/lib/preferences";

const key = (userId: string) => `mealmate.onboarding-draft.v1:${userId}`;

/** 8-page personal onboarding uses steps 0–7 (Pages 1–8). */
const MIN_STEP = 0;
const MAX_STEP = 7;

export type OnboardingDraft = {
  step: number;
  preferences: FoodPreferences;
  startedAt?: string;
  maxPageReached?: number;
  completedPages?: number[];
  savedAt?: string;
};

export function readOnboardingDraft(userId: string): OnboardingDraft | null {
  try {
    const value = JSON.parse(localStorage.getItem(key(userId)) ?? "null");
    if (!value || !Number.isInteger(value.step) || value.step < MIN_STEP || value.step > MAX_STEP)
      return null;
    return {
      step: value.step,
      preferences: normalizePreferences(value.preferences),
      startedAt: typeof value.startedAt === "string" ? value.startedAt : undefined,
      maxPageReached:
        typeof value.maxPageReached === "number" ? value.maxPageReached : undefined,
      completedPages: Array.isArray(value.completedPages)
        ? value.completedPages.filter((n: unknown): n is number => typeof n === "number")
        : undefined,
      savedAt: typeof value.savedAt === "string" ? value.savedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(
  userId: string,
  step: number,
  preferences: FoodPreferences,
  meta?: {
    startedAt?: string;
    maxPageReached?: number;
    completedPages?: number[];
  },
) {
  try {
    const clamped = Math.min(MAX_STEP, Math.max(MIN_STEP, step));
    const savedAt = preferences.updated_at ?? new Date().toISOString();
    localStorage.setItem(
      key(userId),
      JSON.stringify({
        step: clamped,
        preferences,
        ...(meta?.startedAt ? { startedAt: meta.startedAt } : {}),
        ...(typeof meta?.maxPageReached === "number"
          ? { maxPageReached: meta.maxPageReached }
          : {}),
        ...(Array.isArray(meta?.completedPages) ? { completedPages: meta.completedPages } : {}),
        savedAt,
      }),
    );
  } catch {
    /* Resume is optional when storage is blocked. */
  }
}

export function clearOnboardingDraft(userId: string) {
  try {
    localStorage.removeItem(key(userId));
  } catch {
    /* No persistent draft. */
  }
}
